/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  View,
  Dimensions,
  Platform,
  BackHandler,
  Linking,
  ToastAndroid,
} from 'react-native';
import {WebView} from 'react-native-webview';
import RNFS from 'react-native-fs';
import {zip, unzip, unzipAssets, subscribe} from 'react-native-zip-archive';

class App extends React.Component {
  webview = React.createRef();
  canGoBack = false;
  canGoForward = false;
  confirmExit = false;
  confirmTimer = null;
  state = {
    webappUrl: null,
    ready: false,
  };
  onNavigationStateChange = navState => {
    this.canGoBack = navState.canGoBack;
    this.canGoForward = navState.canGoForward;
  };
  onShouldStartLoadWithRequest = request => {
    console.log(request.url);
    if (
      request.url.startsWith('https://') ||
      request.url.startsWith('http://')
    ) {
      return true;
    } else {
      Linking.openURL(request.url);
      return false;
    }
  };
  webappGoBack = () => {
    try {
      if (this.confirmTimer) {
        clearTimeout(this.confirmTimer);
      }
      if (this.canGoBack) {
        this.webview.current.goBack();
        return true; // 不退出
      } else {
        if (this.confirmExit) {
          return false; // 退出
        } else {
          this.confirmTimer = setTimeout(() => {
            this.confirmExit = false;
          }, 2000);
          this.confirmExit = true;
          ToastAndroid.show('再按一次退出应用', ToastAndroid.SHORT);
          return true; // 不退出
        }
      }
    } catch (error) {
      return false; // 退出
    }
  };

  validateApp = () => {
    const webappAssetsDir = `${RNFS.DocumentDirectoryPath}/index.html`;
    if (RNFS.exists(webappAssetsDir)) {
      // 调接口判断是否需要下载新的
      const shouldUpdate = true;
      if (shouldUpdate) {
        this.downloadBundleAndUpdate();
      }
    } else {
      // 下载新的
      this.downloadBundleAndUpdate();
    }
    // 先调接口，看有没有更新的
  };

  downloadBundleAndUpdate = () => {
    const bundleUrl = 'https://gongchengxiang.github.io/keep-vitality/app.zip';
    const targetFile = `${RNFS.DocumentDirectoryPath}/app.zip`;
    const options = {
      fromUrl: bundleUrl,
      toFile: targetFile,
      background: true,
      begin: res => {
        console.log('begin', res);
        console.log('contentLength:', res.contentLength / 1024 / 1024, 'M');
      },
      progress: res => {
        let pro = res.bytesWritten / res.contentLength;
        console.log(pro);
      },
    };
    const result = RNFS.downloadFile(options);
    result.promise
      .then(() => {
        // 解压+删除
        return RNFS.readDir(RNFS.DocumentDirectoryPath).then(() => {
          return Promise.all([
            RNFS.unlink(`${RNFS.DocumentDirectoryPath}/static/`),
            RNFS.unlink(`${RNFS.DocumentDirectoryPath}/index.html`),
          ]).finally(() => {
            return unzip(targetFile, RNFS.DocumentDirectoryPath, 'UTF-8').then(
              () => {
                this.setState({
                  webappUrl: `file://${RNFS.DocumentDirectoryPath}/index.html`,
                  ready: true,
                });
              },
            );
          });
        });
      })
      .catch(err => {
        console.log(999, err);
      });
  };
  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this.webappGoBack);
    this.validateApp();
  }
  render() {
    const webviewStyle = {
      width: Dimensions.get('window').width,
      height: Dimensions.get('window').height - StatusBar.currentHeight,
    };
    const {webappUrl, ready} = this.state;
    return (
      <SafeAreaView>
        <StatusBar
          barStyle="dark-content"
          // translucent={true}
          backgroundColor="white"
        />
        <ScrollView contentInsetAdjustmentBehavior="automatic">
          {!ready && <Text>加载中</Text>}
          {ready && webappUrl && (
            <WebView
              style={webviewStyle}
              ref={this.webview}
              source={{uri: webappUrl}}
              originWhitelist={['https://*', 'http://*']}
              javaScriptEnabled={true}
              scalesPageToFit={false}
              mediaPlaybackRequiresUserAction={false}
              javaScriptCanOpenWindowsAutomatically={true}
              scrollEnabled={true}
              setBuiltInZoomControls={false}
              mixedContentMode="always"
              allowingReadAccessToURL="*"
              allowUniversalAccessFromFileURLs={true}
              allowFileAccess={true}
              cacheEnabled={true}
              cacheMode={'LOAD_DEFAULT'}
              allowsFullscreenVideo={true}
              allowsInlineMediaPlayback={true}
              domStorageEnabled={true}
              thirdPartyCookiesEnabled={true}
              textZoom={100}
              setSupportMultipleWindows={true}
              allowFileAccessFromFileURLS={true}
              onShouldStartLoadWithRequest={this.onShouldStartLoadWithRequest}
              onNavigationStateChange={this.onNavigationStateChange}
            />
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }
}

export default App;
