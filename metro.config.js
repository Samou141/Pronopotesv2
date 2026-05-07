const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const config = getDefaultConfig(__dirname);

const stubs = {
  'react-native-url-polyfill/auto': null,
  '@gorhom/bottom-sheet': path.resolve(__dirname, 'src/stubs/bottom-sheet.js'),
  '@gorhom/portal': path.resolve(__dirname, 'src/stubs/bottom-sheet.js'),
  'expo-haptics': path.resolve(__dirname, 'src/stubs/haptics.js'),
  '@miblanchard/react-native-slider': path.resolve(__dirname, 'src/stubs/slider.js'),
  'expo-blur': path.resolve(__dirname, 'src/stubs/blur.js'),
};

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web') {
    if (moduleName in stubs) {
      const stub = stubs[moduleName];
      return stub === null ? { type: 'empty' } : { type: 'sourceFile', filePath: stub };
    }
    if (moduleName.startsWith('@gorhom/bottom-sheet/') || moduleName.startsWith('@gorhom/portal/')) {
      return { type: 'sourceFile', filePath: path.resolve(__dirname, 'src/stubs/bottom-sheet.js') };
    }
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: './global.css' });
