const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function removeReadOnlyFromTempFolders() {
    const electronPackagerDir = path.join(process.env.LOCALAPPDATA || process.env.TEMP, 'Temp','electron-packager');

    console.log(`Buscando en: ${electronPackagerDir}`);

    if (!fs.existsSync(electronPackagerDir)) {
        console.log('No existe el directorio electron-packager');
        return;
    }

    try {
        // Leer todas las carpetas en electron-packager
        const folders = fs.readdirSync(electronPackagerDir, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);

        // Buscar carpetas que empiecen con "tmp"
        const tmpFolders = folders.filter(folder => folder.startsWith('tmp'));

        console.log(`Carpetas tmp encontradas: ${tmpFolders.length}`);

        tmpFolders.forEach(tmpFolder => {
            const appPath = path.join(electronPackagerDir, tmpFolder, 'resources', 'app');

            console.log(`Verificando: ${appPath}`);

            if (fs.existsSync(appPath)) {
                try {
                    // Quitar atributo de solo lectura en Windows
                    if (process.platform === 'win32') {
                        console.log(`Quitando atributo de solo lectura de: ${appPath}`);
                        execSync(`attrib -R "${appPath}" /S /D`, { stdio: 'pipe' });
                        console.log(`✓ Atributo removido de: ${appPath}`);
                    }
                } catch (error) {
                    console.warn(`Error al quitar atributo de solo lectura en ${appPath}:`, error.message);
                }
            } else {
                console.log(`No existe la ruta: ${appPath}`);
            }
        });

    } catch (error) {
        console.warn('Error al procesar carpetas tmp:', error.message);
    }
}

console.log('=== Iniciando limpieza pre-build ===');

console.log('2. Removiendo atributos de solo lectura de carpetas tmp...');
removeReadOnlyFromTempFolders();
console.log('=== Limpieza completada ===');