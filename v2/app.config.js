// Wraps app.json. Set CVI_APP_GROUP=0 (eas profile "production-nogroup") to build
// without the App Group entitlement — used only until group.com.nickhigh.vicountdown
// is registered in the Apple Developer portal (the ASC API key can't create App Groups).
// Without the group the app works fully; the widget just can't read tracker % / Pro state.
const GROUP_KEY = 'com.apple.security.application-groups';

module.exports = ({ config }) => {
  if (process.env.CVI_APP_GROUP !== '0') return config;
  const c = JSON.parse(JSON.stringify(config));
  if (c.ios && c.ios.entitlements) delete c.ios.entitlements[GROUP_KEY];
  const exts = c.extra?.eas?.build?.experimental?.ios?.appExtensions || [];
  for (const x of exts) if (x.entitlements) delete x.entitlements[GROUP_KEY];
  return c;
};
