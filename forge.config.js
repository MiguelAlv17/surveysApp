const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function removeReadOnlyFromTempFolders() {
  const electronPackagerDir = path.join(process.env.LOCALAPPDATA || process.env.TEMP, 'Temp', 'electron-packager');

  if (!fs.existsSync(electronPackagerDir)) {
    return;
  }

  try {
    const folders = fs.readdirSync(electronPackagerDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    const tmpFolders = folders.filter(folder => folder.startsWith('tmp'));

    tmpFolders.forEach(tmpFolder => {
      const appPath = path.join(electronPackagerDir, tmpFolder, 'resources', 'app');

      if (fs.existsSync(appPath)) {
        try {
          if (process.platform === 'win32') {
            console.log(`Quitando atributo de solo lectura de: ${appPath}`);
            execSync(`attrib -R "${appPath}" /S /D`, { stdio: 'pipe' });
            console.log(`✓ Atributo removido de: ${appPath}`);
          }
        } catch (error) {
          console.warn(`Error al quitar atributo:`, error.message);
        }
      }
    });
  } catch (error) {
    console.warn('Error al procesar carpetas tmp:', error.message);
  }
}

module.exports = {
  packagerConfig: {
    asar: true,
    asarUnpack: "**/{node_modules/node-firebird,node_modules/mssql}/**/*",
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {},
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {},
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {},
    },
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-vite',
      config: {
        // `build` can specify multiple entry builds, which can be Main process, Preload scripts, Worker process, etc.
        // If you are familiar with Vite configuration, it will look really familiar.
        build: [
          {
            // `entry` is just an alias for `build.lib.entry` in the corresponding file of `config`.
            entry: 'src/main.js',
            config: 'vite.main.config.mjs',
            target: 'main',
          },
          {
            entry: 'src/preload.js',
            config: 'vite.preload.config.mjs',
            target: 'preload',
          },
        ],
        renderer: [
          {
            name: 'main_window',
            config: 'vite.renderer.config.mjs',
          },
        ],
      },
    },
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
  hooks: {
    packageAfterCopy: async (config, buildPath, electronVersion, platform, arch) => {
      console.log('Hook packageAfterCopy ejecutándose...');
      // Esperar un poco para que se creen las carpetas
      await new Promise(resolve => setTimeout(resolve, 1000));
      removeReadOnlyFromTempFolders();
    },
    packageAfterPrune: async (config, buildPath, electronVersion, platform, arch) => {
      console.log('Hook packageAfterPrune ejecutándose...');
      await new Promise(resolve => setTimeout(resolve, 500));
      removeReadOnlyFromTempFolders();
    },
    packageAfterExtract: async (config, buildPath, electronVersion, platform, arch) => {
      console.log('Hook packageAfterExtract ejecutándose...');
      await new Promise(resolve => setTimeout(resolve, 500));
      removeReadOnlyFromTempFolders();
    }
  }
};
