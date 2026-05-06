module.exports = function (api) {
  api.cache(true);
  return {
    presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }]],
    plugins: [
      'nativewind/babel',
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './src',
            '@ui': './src/components/ui',
            '@components': './src/components',
            '@hooks': './src/hooks',
            '@lib': './src/lib',
            '@store': './src/store',
          },
        },
      ],
      'react-native-reanimated/plugin',
    ],
  };
};
