const { withAndroidManifest } = require('@expo/config-plugins');

// Force MainActivity windowSoftInputMode to adjustNothing.
// app.json's android.windowSoftInputMode is ignored by prebuild in SDK 58
// (manifest came out adjustResize). This plugin sets the manifest
// attribute directly during prebuild to adjustNothing (Muse's mode),
// so no window resize interferes with keyboard-controller's
// inset-driven padding (which lifts the composer) and TabBar hide.
module.exports = function withAdjustNothing(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults;
    const application = manifest.manifest.application[0];
    const activity = application.activity.find(
      (a) => a.$['android:name'] === '.MainActivity'
    );
    if (activity) {
      activity.$['android:windowSoftInputMode'] = 'adjustNothing';
    }
    return config;
  });
};
