const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web') {
    if (moduleName === 'react-native-url-polyfill/auto') {
      return { type: 'empty' };
    }
    if (moduleName.startsWith('@gorhom/bottom-sheet') || moduleName.startsWith('@gorhom/portal')) {
      return { type: 'sourceFile', filePath: path.resolve(__dirname, 'src/stubs/bottom-sheet.js') };
    }
    if (moduleName === 'expo-haptics') {
      return { type: 'sourceFile', filePath: path.resolve(__dirname, 'src/stubs/haptics.js') };
    }
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: './global.css' });
