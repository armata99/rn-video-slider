const path = require('path');
const { getDefaultConfig } = require('@react-native/metro-config');

const config = getDefaultConfig(__dirname);

config.watchFolders = [
    ...config.watchFolders,
    path.resolve(__dirname, '..'), // Watch parent directory
    path.resolve(__dirname, '../src'), // Watch src directly
];

config.resolver = {
    ...config.resolver,
    extraNodeModules: new Proxy({}, {
        get: (target, name) => path.join(__dirname, `node_modules/${name}`),
    }),
};

config.resolver.nodeModulesPaths = [
    path.resolve(__dirname, 'node_modules'),
    path.resolve(__dirname, '../node_modules')
];

module.exports = config;
