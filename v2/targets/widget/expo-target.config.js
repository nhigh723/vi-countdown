/** @type {import('@bacons/apple-targets/app.plugin').ConfigFunction} */
module.exports = (config) => ({
  type: 'widget',
  name: 'CountdownVIWidget',
  displayName: 'Countdown VI',
  bundleIdentifier: '.widget',
  deploymentTarget: '16.4',
  icon: '../../assets/widget-icon.png',
  colors: {
    $accent: '#ff2e88',
    $widgetBackground: '#0b0b14',
  },
  frameworks: ['SwiftUI', 'WidgetKit'],
  entitlements: {
    'com.apple.security.application-groups': config.ios.entitlements['com.apple.security.application-groups'],
  },
});
