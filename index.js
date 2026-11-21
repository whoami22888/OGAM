/**
 * @format
 */

// Spec-compliant global URL — RN's built-in mangles paths (adds trailing slashes),
// which breaks the MCP SDK's OAuth discovery. Must load before any network/OAuth code.
import 'react-native-url-polyfill/auto';
// Hermes does not provide TextEncoder/TextDecoder. Sync's proven EasyShare
// protocol requires both before the shared wire codec is loaded.
import 'text-encoding-polyfill';
// Hermes does not expose Web Crypto on every supported OS version. Install the
// secure getRandomValues polyfill before stores create persisted sync identities.
import 'react-native-get-random-values';
import React from 'react';
import { AppRegistry, View, Text, ErrorUtils } from 'react-native';
import { name as appName } from './app.json';

function BootError({ message }) {
  return React.createElement(
    View,
    {
      style: {
        flex: 1,
        justifyContent: 'center',
        padding: 24,
        backgroundColor: '#0B0F0E',
      },
    },
    React.createElement(
      Text,
      { style: { color: '#F9FAFB', fontSize: 22, marginBottom: 12 } },
      'Jarvis_liquid_agent',
    ),
    React.createElement(
      Text,
      { style: { color: '#D1D5DB', fontSize: 16, lineHeight: 22 } },
      message || 'The app failed to start.',
    ),
  );
}

// Keep a previous handler for logging, but never let it crash the process —
// native exceptionHandler in MainApplication also no longer rethrows.
const previous =
  typeof ErrorUtils !== 'undefined' && ErrorUtils.getGlobalHandler
    ? ErrorUtils.getGlobalHandler()
    : null;
if (typeof ErrorUtils !== 'undefined' && ErrorUtils.setGlobalHandler) {
  ErrorUtils.setGlobalHandler((error, isFatal) => {
    console.error('Jarvis uncaught JS error', error, 'fatal=', isFatal);
    // Release: the default handler reports to ExceptionsManager, which tears
    // down ReactHost and leaves a blank screen. Log only. Keep the redbox in dev.
    if (typeof __DEV__ !== 'undefined' && __DEV__ && typeof previous === 'function') {
      try {
        previous(error, false);
      } catch (e) {
        console.error('previous JS error handler failed', e);
      }
    }
  });
}

let Root;
try {
  Root = require('./App').default;
} catch (e) {
  const message = e && (e.stack || e.message) ? String(e.stack || e.message) : String(e);
  Root = function FailedBoot() {
    return React.createElement(BootError, { message: message });
  };
}

AppRegistry.registerComponent(appName, () => Root);
