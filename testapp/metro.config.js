const path = require('path');
const {getDefaultConfig} = require('@react-native/metro-config');

const pak = require('../package.json');

const root = path.resolve(__dirname, '..');
const appModules = path.resolve(__dirname, 'node_modules');

/**
 * The library source lives at <root>/src, outside this app. Metro resolves its
 * imports by walking up from that file, which reaches <root>/node_modules first.
 * The root installs react/react-native/reanimated/gesture-handler as
 * devDependencies purely so the library can be type-checked and linted, so those
 * copies must stay invisible to the bundler — otherwise the app ends up with two
 * instances of React and Reanimated and fails at runtime.
 */
const singletons = [
  ...Object.keys(pak.peerDependencies),
  // Not a declared peer of the library, but Reanimated 4 delegates its worklet
  // runtime to it, so a duplicate copy breaks in exactly the same way.
  'react-native-worklets',
];

const escapeForRegExp = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const config = getDefaultConfig(__dirname);

config.watchFolders = [...config.watchFolders, root];

config.resolver = {
  ...config.resolver,
  // Hide the root's dev-only copies of the peer dependencies from Metro.
  blockList: new RegExp(
    singletons
      .map(name => `^${escapeForRegExp(path.join(root, 'node_modules', name))}\\/.*$`)
      .join('|'),
  ),
  // With the root copies blocked, every bare import — including the ones inside
  // <root>/src — falls through to this app's node_modules.
  extraNodeModules: new Proxy(
    {},
    {
      get: (target, name) => path.join(appModules, name.toString()),
    },
  ),
  nodeModulesPaths: [appModules],
};

module.exports = config;
