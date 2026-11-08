const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

module.exports = function withFontAssets(config) {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const targetDir = path.join(
        config.modRequest.platformProjectRoot,
        'app/src/main/assets/fonts'
      );

      fs.mkdirSync(targetDir, { recursive: true });

      const sourceFontsDir = path.join(projectRoot, 'assets/fonts');
      if (!fs.existsSync(sourceFontsDir)) {
        return config;
      }

      const files = fs.readdirSync(sourceFontsDir);

      for (const file of files) {
        if (file.endsWith('.ttf') || file.endsWith('.otf')) {
          fs.copyFileSync(
            path.join(sourceFontsDir, file),
            path.join(targetDir, file)
          );
        }
      }

      // Alias wajib untuk ReactFontManager fallback di Icon.js
      const featherSrc = path.join(sourceFontsDir, 'Feather.ttf');
      if (fs.existsSync(featherSrc)) {
        fs.copyFileSync(
          featherSrc,
          path.join(targetDir, 'assets_fonts_feather.ttf')
        );
      }

      // Alias untuk OptimisticApp (App.js: 'OptimisticApp': require('./assets/fonts/OptimisticApp-Regular.ttf'))
      const regularSrc = path.join(sourceFontsDir, 'OptimisticApp-Regular.ttf');
      if (fs.existsSync(regularSrc)) {
        fs.copyFileSync(
          regularSrc,
          path.join(targetDir, 'OptimisticApp.ttf')
        );
      }

      return config;
    },
  ]);
};
