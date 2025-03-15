const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Configure Metro to find assets in the correct location
config.resolver.assetExts = [...config.resolver.assetExts, 'ttf'];

// Make sure Metro looks in ALL the right directories for assets
config.watchFolders = [
  ...config.watchFolders || [],
  path.resolve(__dirname, 'assets'),
  path.resolve(__dirname, 'assets/fonts'),
  path.resolve(__dirname, 'fonts')
];

// Add additional asset directories for Metro to check
config.resolver.assetExts = [...config.resolver.assetExts, 'ttf', 'otf', 'woff', 'woff2'];

// Explicitly set the extra node_modules to search
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, 'node_modules'),
];

// Configure asset resolution paths
config.transformer.assetPlugins = ['expo-asset/tools/hashAssetFiles'];

module.exports = config; 