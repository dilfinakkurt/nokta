// Web shim for react-native-webview
// On web, WebView renders as an iframe element directly
import React from 'react';
import { View } from 'react-native';

const WebView = React.forwardRef((props, ref) => {
  // On web, ignore this component — the platform check in App.tsx handles it
  return React.createElement(View, { style: props.style });
});

WebView.displayName = 'WebView';

export { WebView };
export default WebView;
