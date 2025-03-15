module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Handle path aliases
      [
        'module-resolver',
        {
          extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
          alias: {
            '@': './',
            'assets': './assets',
            'fonts': './fonts'
          },
        },
      ],
      // Handle React Native specific features
      'react-native-reanimated/plugin',
      // Add additional path resolution for asset imports
      [
        'babel-plugin-inline-import',
        {
          extensions: ['.ttf']
        }
      ]
    ],
  };
}; 