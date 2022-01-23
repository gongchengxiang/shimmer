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

class App extends React.Component {
  webview = React.createRef();
  canGoBack = false;
  canGoForward = false;
  confirmExit = false;
  confirmTimer = null;
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
  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this.webappGoBack);
  }
  render() {
    const webviewStyle = {
      width: Dimensions.get('window').width,
      height: Dimensions.get('window').height - StatusBar.currentHeight,
    };
    const source =
      Platform.OS === 'android'
        ? 'file:///android_asset/index.html'
        : 'index.html';
    return (
      <SafeAreaView>
        <StatusBar
          barStyle="dark-content"
          // translucent={true}
          backgroundColor="white"
        />
        <ScrollView contentInsetAdjustmentBehavior="automatic">
          <WebView
            style={webviewStyle}
            ref={this.webview}
            source={{uri: source}}
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
        </ScrollView>
      </SafeAreaView>
    );
  }
}

export default App;
