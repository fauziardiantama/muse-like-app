const { withAndroidManifest } = require('@expo/config-plugins');

// Izinkan komunikasi HTTP (Cleartext) ke localhost / IP lokal gateway
module.exports = function withCleartext(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults;
    const application = manifest.manifest.application?.[0];
    if (application) {
      application.$['android:usesCleartextTraffic'] = 'true';
    }
    return config;
  });
};
