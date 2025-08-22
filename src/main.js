import { app, BrowserWindow, ipcMain } from 'electron';
const Firebird = require('node-firebird');
import path from 'node:path';
const fs = require('fs')
const sql = require('mssql');
const AdmZip = require('adm-zip');
import started from 'electron-squirrel-startup';
import moment from 'moment';

// require('./database.js')
// const { Pool } = require('pg');
// const pool = new Pool({
//   user: 'postgres',
//   host: 'localhost',
//   database: 'recaudaciondb',
//   password: '1234',
//   port: 5432, // puerto por defecto de PostgreSQL
// });

const firebirdOptions = {
  user: 'SYSDBA',
  password: 'masterkey',
  role: null,
  pageSize: 4096,
}

const msqlserverOptions = {
  user: 'migue.rec',
  password: 'sNwMr6dw1@?Pc5uu',
  server: 'payfri-bi.com', // o tu servidor
  database: 'payfribi_recaudacion',
  pool: {
    max: 5,
    min: 1,
    idleTimeoutMillis: 1800000,    // 15 minutos
    acquireTimeoutMillis: 120000,  // 1 minuto
  },
  options: {
    encrypt: true, // para Azure
    trustServerCertificate: true, // para desarrollo local
    connectTimeout: 120000,        // 2 minuto
    requestTimeout: 1800000,       // 30 minutos exactos (15 * 60 * 1000)
    cancelTimeout: 30000,         // 30 segundos
    enableArithAbort: true,
  }
};

const recaudacionDB = {
  user: 'Conciliacion',
  password: 'fqu[c6pu4Q8%2!Q{',
  server: 'nodorepservices.database.windows.net', // o tu servidor
  database: 'reports',
  options: {
    encrypt: true, // para Azure
    trustServerCertificate: true // para desarrollo local
  }
}
// Configura tu conexión PostgreSQL

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}



const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// function to get the information about all devices
ipcMain.handle('get-kioscos', async (event, fileSelected) => {
  let poolGK = null;

  try {
    poolGK = await sql.connect(msqlserverOptions);
    const res = await poolGK.request().query('SELECT * FROM Devices');

    const newArray = res.recordset.map(item => {
      const folder = item.located_at;
      const basepath = `C:\\zz\\Kiosco\\DB\\GTO\\${folder}\\db`;
      const fullPath = path.join(basepath, fileSelected);
      item.status = fs.existsSync(fullPath);
      return item;
    });

    return {
      status: 200,
      data: newArray
    };
  } catch (err) {
    console.error('Error al obtener kioscos:', err);
    return {
      status: 500,
      message: 'Error en la consulta a sqlserver',
      error: err.message
    };
  } finally {
    // Solo cerrar si poolGK fue inicializado exitosamente
    if (poolGK) {
      try {
        await poolGK.close();
      } catch (closeError) {
        console.error('Error al cerrar la conexión:', closeError);
      }
    }
  }
});
// function to get the information about all devices
ipcMain.handle('get-justKioscos', async (event) => {
  // const fileSelected = 'FOLIO2.FDB'
  let pool = null;
  try {
    pool = await sql.connect(msqlserverOptions);
    const res = await pool.request().query('SELECT * FROM Devices where deleted_at is null');
    return {
      status: 200,
      data: res.recordset
    };
  } catch (err) {
    console.error('Error al obtener usuarios:', err);
    return {
      status: 500,
      message: 'Error en la consulta a sqlserver',
      error: err.message
    };
  } finally {
    pool.close();
  }
})

// function to uncompress all the files downloaded automatically 
ipcMain.handle('descompresion', async (event, ids, dateSelected) => {
  let pool = null;
  try {
    // Conectar a la base de datos
    pool = await sql.connect(msqlserverOptions);
    const res = await pool.request().query('SELECT * FROM Devices');

    // const kioscos = await pool.query('SELECT * FROM Devices');
    const filtered = res.recordset.filter(item => idArray.includes(item.id));
    const processedDevices =[]
    for (const item of filtered) {
      const folder = item.located_at;
      const basepath = path.join('C:\\zz\\Kiosco\\DB\\GTO', folder, 'db');

      // Inicializar propiedades del dispositivo
      let deviceStatus = {
        ...item,
        status: false,
        error_descompresion: false,
        zipFound: false,
        zipFileName: null,
        errorMessage: null
      };

      try {
        // Verificar si el directorio existe
        if (!fs.existsSync(basepath)) {
          deviceStatus.errorMessage = `Directorio no existe: ${basepath}`;
          deviceStatus.error_descompresion = true;
          return deviceStatus;
        }

        // Leer contenido del directorio
        const entries = fs.readdirSync(basepath, { withFileTypes: true });

        // Buscar archivos ZIP que coincidan con el criterio
        const matchingZips = entries.filter(entry =>
          entry.isFile() &&
          entry.name.startsWith('FLIO2BKP_') &&
          entry.name.includes(dateSelected) &&
          entry.name.toLowerCase().endsWith('.zip')
        );

        if (matchingZips.length === 0) {
          // No se encontró archivo ZIP para esta fecha
          deviceStatus.status = false;
          deviceStatus.zipFound = false;
          return deviceStatus;
        }

        // Si hay múltiples archivos, tomar el primero (puedes cambiar esta lógica si necesitas otro criterio)
        const zipFile = matchingZips[0];
        const pathZip = path.join(basepath, zipFile.name);

        deviceStatus.zipFound = true;
        deviceStatus.zipFileName = zipFile.name;

        try {
          // Intentar descomprimir el archivo
          const zip = new AdmZip(pathZip);
          const carpetaDestino = path.dirname(pathZip);

          // Extraer todo el contenido
          zip.extractAllTo(carpetaDestino, true);

          // Descompresión exitosa
          deviceStatus.status = true;
          deviceStatus.error_descompresion = false;


        } catch (decompressionError) {
          // Error durante la descompresión
          deviceStatus.status = false;
          deviceStatus.error_descompresion = true;
          deviceStatus.errorMessage = `Error al descomprimir ${zipFile.name}: ${decompressionError.message}`;

          console.error(`Error de descompresión en ${folder}:`, decompressionError);
        }

      } catch (directoryError) {
        // Error al acceder al directorio o leer archivos
        deviceStatus.status = false;
        deviceStatus.error_descompresion = true;
        deviceStatus.errorMessage = `Error al procesar directorio ${basepath}: ${directoryError.message}`;

        console.error(`Error de directorio en ${folder}:`, directoryError);
      } finally {
        pool.close();
      }
      processedDevices.push(deviceStatus);
    }
   
    // Cerrar conexión a la base de datos
    await pool.close();

    // Calcular estadísticas
    const totalDevices = processedDevices.length;
    const successfulDecompressions = processedDevices.filter(device => device.status === true).length;
    const errorsCount = processedDevices.filter(device => device.error_descompresion === true).length;
    const zipsFoundCount = processedDevices.filter(device => device.zipFound === true).length;

    return {
      status: 200,
      message: `Proceso de descompresión completado. ${successfulDecompressions}/${zipsFoundCount} archivos descomprimidos exitosamente`,
      data: processedDevices,
      summary: {
        totalDevices: totalDevices,
        zipsFound: zipsFoundCount,
        successfulDecompressions: successfulDecompressions,
        errors: errorsCount,
        dateSearched: dateSelected
      }
    };

  } catch (err) {
    console.error('Error en descompresión:', err);
    return {
      status: 500,
      message: 'Error en la operación de descompresión',
      error: err.message,
      data: []
    };
  }
});
// function to get all the records by dates
ipcMain.handle('get-records', async (event, idArray, from, to)=>{
  const results = [];
  const numberRecords = []
  let poolGR = null;
  let errors=[]
  let filename = 'FOLIO2.FDB'
  try {
    poolGR = await sql.connect(msqlserverOptions);
    const kioscos = await poolGR.request().query('SELECT * FROM Devices');
    // const kioscos = await pool.query('SELECT * FROM Devices');
    const filtered = kioscos.recordset.filter(item => idArray.includes(item.id));
    for (const e of filtered){
      // const dbPath = path.join('C:\\zz\\Kiosco\\DB\\GTO', e.located_at, 'db', 'FOLIO2.fdb'); // ajusta el nombre .fdb
      // if (!fs.existsSync(dbPath)) {
      //   console.warn(`Base de datos no encontrada: ${dbPath}`);
      // }
      const dbResult = findDatabaseFile(e, filename);
      if (!dbResult.found) {
        errors.push({
          kiosco: e.id,
          carpeta: e.located_at,
          error: dbResult.error
        })
        continue; // Continuar con el siguiente kiosco
      }
      const dbOptions = {
        ...firebirdOptions,
        database: dbResult.path,
        charset: 'UTF8'
      };
      const startDate = from;
      const endDate = to;
      const query = `select serviciohecho, 
                    fecha, hora, 
                    total, 
                    iif(lc is null, 111111111111, lc) 
                    lc_messages,  
                    kiosko, 
                    folioinicial Folio, 
                    l.de_numerorecaudadora,
                    l.ksk_descripcion,
                    folioinicial, 
                    serviciohecho, 
                    tipopago,
                    tiempototal, 
                    id_tramite,
                    CAST(SUBSTRING(concepto FROM 1 FOR 32000) AS VARCHAR(32000)) AS Concepto,
                    respuesta, 
                    cast((fecha || ' ' || hora) as timestamp) fechaHora 
                    from serv_hecho 
                    inner join local l on l.df_kioskolocal = serv_hecho.kiosko 
                    where total>0 
                      and fecha  >= '${ startDate }'
                      and fecha  < '${endDate}'
                      order by fecha, hora desc`;


      const newQuery = `select 
                       CAST(fecha AS VARCHAR(24)) AS fecha,
                        CAST(('1970-01-01'||' '|| hora ) AS VARCHAR(24)) AS hora,
                        total,
                        serviciohecho, 
                        iif(lc is null, 111111111111, lc) lc_messages,
                        l.de_numerorecaudadora || folioinicial Folio,
                        kiosko,
                        l.de_numerorecaudadora ||'-'|| l.ksk_descripcion de_numerorecaudadora,
                        tipopago,
                        CASE 
                          WHEN id_tramite IS NULL AND total > 0 THEN '150240704001'
                              ELSE id_tramite
                          END AS id_tramite,
                        folioinicial,
                        serviciohecho, 
                        tiempototal, 
                        CASE 
                          WHEN UPPER(concepto) LIKE '%DEFUNCIÓN%' THEN 'Impresión acta de defunción'
                          WHEN UPPER(concepto) LIKE '%NACIMIENTO%' THEN 'Impresión acta de nacimiento'
                          WHEN UPPER(concepto) LIKE '%MATRIMONIO%' THEN 'Impresión acta de matrimonio'
                          WHEN UPPER(concepto) LIKE '%PGJ-DJ08%' THEN 'Pago PGJ'
                          WHEN UPPER(concepto) LIKE '%LC%' THEN 'Pago línea de captura'
                          WHEN UPPER(concepto) LIKE '%PGJ%' THEN 'Pago línea de captura'
                          WHEN UPPER(concepto) LIKE '%IMPUESTO%' THEN 'Pago línea de captura'
                            WHEN UPPER(concepto) LIKE '%REFRENDO:%' THEN 'PAGO REFRENDO'
                          ELSE CAST(SUBSTRING(concepto FROM 1 FOR 32000) AS VARCHAR(32000))
                        END AS ConceptoCorto,
                        respuesta, 
                        cast((fecha || ' ' || hora) AS VARCHAR(24)) fechaHora
                        from serv_hecho 
                        inner join local l on l.df_kioskolocal = serv_hecho.kiosko 
                        where fecha >= '${ startDate }' 
                        and fecha < '${endDate}'
                        order by fecha, hora DESC`;
      const queryCount = `SELECT COUNT(serviciohecho) AS total
                          from serv_hecho 
                          inner join local l on l.df_kioskolocal = serv_hecho.kiosko 
                         where fecha >= '${ startDate}' 
                        and fecha < '${endDate}'`;
      const querySumatoria = `SELECT SUM(total) AS total_recaudacion
                          from serv_hecho 
                          inner join local l on l.df_kioskolocal = serv_hecho.kiosko 
                         where fecha >= '${startDate}' 
                        and fecha < '${endDate}'`;                 
      
      const dataKioscos = await new Promise((resolve, reject) => {
       
        Firebird.attach(dbOptions, (err, db) => {
          if (err) {
            console.error("Error al conectar a Firebird:", err.message);
            return reject(err);
          }
          db.query(newQuery, (err, result) => {
            db.detach();
            if (err) {
              console.error("Error en la consulta:", err.message);
              return reject(err);
            }
            resolve(result);
          });
        });
      });
      const amountRecords = await new Promise((resolve, reject) => {
        Firebird.attach(dbOptions, (err, db) => {
          if (err) return reject(err);
          db.query(queryCount, (err, result) => {
            db.detach();
            if (err) return reject(err);
            resolve(result);
          });
        });
      });
      const amountCollected = await new Promise((resolve, reject) => {
        Firebird.attach(dbOptions, (err, db) => {
          if (err) return reject(err);
          db.query(querySumatoria, (err, result) => {
            db.detach();
            if (err) return reject(err);
            resolve(result);
          });
        });
      });

      
      numberRecords.push({
        id:e.id,
        alias:e.alias,
        numberRecords: Array.isArray(amountRecords) ? amountRecords[0] : amountRecords ,
        cashCollected: Array.isArray(amountCollected) ? amountCollected[0] : amountCollected,
      })
      results.push(...dataKioscos);
    }
    return {
      status: 200,
      records: numberRecords,
      data: results,
      message: "success",
      errors: errors
    };

  } catch (e) {
    return {
      status: 500,
      data: [],
      message: e.message,

    };
  }
  finally {
    if (poolGR) {
      try {
        await poolGR.close();
      } catch (closeError) {
        console.error('Error al cerrar la conexión:', closeError);
      }
    }
  } 
})

// function to upload all the records to a conciliacion database
ipcMain.handle('subir-datos', async (event, items) => {
  let poolSD = null;
  poolSD = await sql.connect(recaudacionDB);
  // poolSD = await sql.connect(msqlserverOptions);

  const transaction = new sql.Transaction(poolSD);
  const chunkSize = 500;
  try {
    await transaction.begin();
    for (let i = 0; i < items.length; i += chunkSize) {
      // const item = items[i];
      const chunk = items.slice(i, i + chunkSize);
      
      for (const item of chunk) {
        // const fechaFormat = moment(item.FECHA).format('YYYY-MM-DD');
        // const fechaFormat = moment(item.FECHA).format('YYYY-MM-DD');
        if (item.KIOSKO == 1150) { //kiosco payfritour
          await new sql.Request(transaction)
            .input('SERVICIOHECHO', sql.Float, item.SERVICIOHECHO)
            .input('FECHA', sql.SmallDateTime, new Date(item.FECHA))
            .input('HORA', sql.SmallDateTime, new Date(item.HORA))
            .input('TOTAL', sql.Float, item.TOTAL)
            .input('LC', sql.NVarChar(255), item.LC_MESSAGES)
            .input('KIOSKO', sql.Float, item.KIOSKO)
            .input('FOLIO', sql.Float, item.FOLIO)
            .input('DE_NUMERORECAUDADORA', sql.Float, 0)
            .input('FOLIOINICIAL', sql.Float, item.FOLIOINICIAL)
            .input('SERVICIOHECHO1', sql.Float, item.SERVICIOHECHO)
            .input('TIPOPAGO', sql.NVarChar(255), item.TIPOPAGO)
            .input('TIEMPOTOTAL', sql.SmallDateTime, item.TIEMPOTOTAL)
            .input('ID_TRAMITE', sql.NVarChar(255), item.ID_TRAMITE)
            .input('CONCEPTO', sql.VarChar(255), item.CONCEPTOCORTO)
            .input('RESPUESTA', sql.Text, item.RESPUESTA)
            .input('FECHAHORA', sql.SmallDateTime, new Date(item.FECHAHORA))
            .query(`INSERT INTO GTO_KSCS_SERVICIOS_TOUR (
                  SERVICIOHECHO,
                  FECHA,
                  HORA,
                  TOTAL,
                  LC,
                  KIOSKO,
                  FOLIO,
                  DE_NUMERORECAUDADORA,
                  FOLIOINICIAL,
                  SERVICIOHECHO1,
                  TIPOPAGO,
                  TIEMPOTOTAL,
                  ID_TRAMITE,
                  CONCEPTO,
                  RESPUESTA,
                  FECHAHORA
                )
                VALUES (
                  @SERVICIOHECHO,
                  @FECHA,
                  @HORA,
                  @TOTAL,
                  @LC,
                  @KIOSKO,
                  @FOLIO,
                  @DE_NUMERORECAUDADORA,
                  @FOLIOINICIAL,
                  @SERVICIOHECHO1,
                  @TIPOPAGO,
                  @TIEMPOTOTAL,
                  @ID_TRAMITE,
                  @CONCEPTO,
                  @RESPUESTA,
                  @FECHAHORA
                )`);
        }else{
          await new sql.Request(transaction)
            .input('SERVICIOHECHO', sql.Float, item.SERVICIOHECHO)
            .input('FECHA', sql.SmallDateTime, new Date(item.FECHA))
            .input('HORA', sql.SmallDateTime, new Date(item.HORA))
            .input('TOTAL', sql.Float, item.TOTAL)
            .input('LC', sql.NVarChar(255), item.LC_MESSAGES)
            .input('KIOSKO', sql.Float, item.KIOSKO)
            .input('FOLIO', sql.Float, item.FOLIO)
            .input('DE_NUMERORECAUDADORA', sql.Float, 0)
            .input('FOLIOINICIAL', sql.Float, item.FOLIOINICIAL)
            .input('SERVICIOHECHO1', sql.Float, item.SERVICIOHECHO)
            .input('TIPOPAGO', sql.NVarChar(255), item.TIPOPAGO)
            .input('TIEMPOTOTAL', sql.SmallDateTime, item.TIEMPOTOTAL)
            .input('ID_TRAMITE', sql.NVarChar(255), item.ID_TRAMITE)
            .input('CONCEPTO', sql.VarChar(255), item.CONCEPTOCORTO)
            .input('RESPUESTA', sql.Text, item.RESPUESTA)
            .input('FECHAHORA', sql.SmallDateTime, new Date(item.FECHAHORA))
            .query(`INSERT INTO GTO_KSCS_SERVICIOS (
                  SERVICIOHECHO,
                  FECHA,
                  HORA,
                  TOTAL,
                  LC,
                  KIOSKO,
                  FOLIO,
                  DE_NUMERORECAUDADORA,
                  FOLIOINICIAL,
                  SERVICIOHECHO1,
                  TIPOPAGO,
                  TIEMPOTOTAL,
                  ID_TRAMITE,
                  CONCEPTO,
                  RESPUESTA,
                  FECHAHORA
                )
                VALUES (
                  @SERVICIOHECHO,
                  @FECHA,
                  @HORA,
                  @TOTAL,
                  @LC,
                  @KIOSKO,
                  @FOLIO,
                  @DE_NUMERORECAUDADORA,
                  @FOLIOINICIAL,
                  @SERVICIOHECHO1,
                  @TIPOPAGO,
                  @TIEMPOTOTAL,
                  @ID_TRAMITE,
                  @CONCEPTO,
                  @RESPUESTA,
                  @FECHAHORA
                )`);
        }
        
      }
      

      // Enviar progreso cada 100 registros o cada X%\
      const porcentaje = Math.round(((i + chunk.length) / items.length) * 100);
      event.sender.send('upload-progress', porcentaje); //  enviar al renderer
    }
    await transaction.commit();
    return { 
      status: 200,
      message: "success",

     };
  } catch (err) {
    console.error('Error al subir datos:', err);
    await transaction.rollback();
    return { 
      status: 500,
      message: err.message,
    };
  }
  finally {
    if (poolSD) {
      try {
        await poolSD.close();
      } catch (closeError) {
        console.error('Error al cerrar la conexión:', closeError);
      }
    }
  }
});

// function to delete all the file with extension .fdb and .zip
ipcMain.handle('operationClear', async (event, file, idArray) => {
  let pool = null;
  try {
    // Conectar a la base de datos
    pool = await sql.connect(msqlserverOptions);
    const res = await pool.request().query('SELECT * FROM Devices');

    let deletedFiles = [];
    let errors = [];
    const filtered = res.recordset.filter(item => idArray.includes(item.id));
    // Procesar cada dispositivo
    for (const item of filtered) {
      const folder = item.located_at;
      const basepath = `C:\\zz\\Kiosco\\DB\\GTO\\${folder}\\db`;

      try {
        // Verificar si el directorio existe
        if (!fs.existsSync(basepath)) {
          console.warn(`Directorio no existe: ${basepath}`);
          continue;
        }

        // Leer archivos del directorio
        const files = fs.readdirSync(basepath);
        if (file == 1) {
          // Buscar archivos que inicien con "FLIO2BKP" y sean .zip
          const zipFiles = files.filter(filename =>
            filename.startsWith('FLIO2BKP') && filename.toLowerCase().endsWith('.zip')
          );

          // Eliminar archivos encontrados
          for (const filename of zipFiles) {
            const filePath = path.join(basepath, filename);
            try {
              fs.unlinkSync(filePath);
              deletedFiles.push(`${folder}/${filename}`);
            } catch (deleteError) {
              errors.push(`Error al eliminar ${filePath}: ${deleteError.message}`);
            }
          }

        } else if (file == 2) {
          // Buscar archivos con patrón FOLIO2_DDMMYYYYHHMMSS.FDB o .fdb
          const fdbPattern = /^FOLIO2_\d{14}\.(FDB|fdb)$/;
          const fdbFiles = files.filter(filename => fdbPattern.test(filename));

          // Eliminar archivos encontrados
          for (const filename of fdbFiles) {
            const filePath = path.join(basepath, filename);
            try {
              fs.unlinkSync(filePath);
              deletedFiles.push(`${folder}/${filename}`);
            } catch (deleteError) {
              errors.push(`Error al eliminar ${filePath}: ${deleteError.message}`);
            }
          }
        }

      } catch (dirError) {
        errors.push(`Error al procesar directorio ${basepath}: ${dirError.message}`);
      }
    }

    // Cerrar conexión a la base de datos
    await pool.close();

    // Evaluar resultado
    if (errors.length > 0) {
      return {
        status: 500,
        message: `Proceso completado con errores. Archivos eliminados: ${deletedFiles.length}`,
        error: errors,
        deletedFiles: deletedFiles,
        errorCount: errors.length
      };
    } else {
      const operationType = file === "1" ? "archivos ZIP de respaldo" : "archivos FDB con timestamp";
      return {
        status: 200,
        message: `Limpieza exitosa de ${operationType}. Total de archivos eliminados: ${deletedFiles.length}`,
        deletedFiles: deletedFiles,
        deletedCount: deletedFiles.length
      };
    }

  } catch (err) {
    console.error('Error en cleanup-files:', err);
    return {
      status: 500,
      message: 'Error en la operación de limpieza',
      error: err.message
    };
  }
});

// function to rename files to (ddmmyy)format
ipcMain.handle('operationRename', async (event, idArray) => {
  let pool= null;
  try {
    // Conectar a la base de datos
    pool = await sql.connect(msqlserverOptions);
    const res = await pool.request().query('SELECT * FROM Devices');

    let renamedFiles = [];
    let errors = [];

    // Generar timestamp en formato DDMMYYYYHHMMSS usando moment
    const timestamp = moment().format('DDMMYYYYHHMMSS');
    const filtered = res.recordset.filter(item => idArray.includes(item.id));
    // Procesar cada dispositivo
    for (const item of filtered) {
      const folder = item.located_at;
      const basepath = `C:\\zz\\Kiosco\\DB\\GTO\\${folder}\\db`;

      try {
        // Verificar si el directorio existe
        if (!fs.existsSync(basepath)) {
          console.warn(`Directorio no existe: ${basepath}`);
          continue;
        }

        // Leer archivos del directorio
        const files = fs.readdirSync(basepath);

        // Buscar archivos FOLIO2.FDB o FOLIO2.fdb (exactamente con ese nombre)
        const folioFiles = files.filter(filename =>
          filename === 'FOLIO2.FDB' || filename === 'FOLIO2.fdb'
        );

        // Renombrar archivos encontrados
        for (const filename of folioFiles) {
          const oldPath = path.join(basepath, filename);

          // Determinar la extensión original para mantenerla
          const isUppercase = filename.endsWith('.FDB');
          const newFilename = `FOLIO2_${timestamp}.${isUppercase ? 'FDB' : 'fdb'}`;
          const newPath = path.join(basepath, newFilename);

          try {
            // Verificar que el archivo nuevo no exista ya
            if (fs.existsSync(newPath)) {
              errors.push(`El archivo destino ya existe: ${folder}/${newFilename}`);
              continue;
            }

            // Renombrar archivo
            fs.renameSync(oldPath, newPath);
            renamedFiles.push({
              folder: folder,
              oldName: filename,
              newName: newFilename,
              fullPath: newPath
            });

          } catch (renameError) {
            errors.push(`Error al renombrar ${folder}/${filename}: ${renameError.message}`);
          }
        }

      } catch (dirError) {
        errors.push(`Error al procesar directorio ${basepath}: ${dirError.message}`);
      }
    }

    // Cerrar conexión a la base de datos
    await pool.close();

    // Evaluar resultado
    if (errors.length > 0) {
      return {
        status: 500,
        message: `Proceso completado con errores. Archivos renombrados: ${renamedFiles.length}`,
        error: errors.join('; '),
        renamedFiles: renamedFiles,
        errorCount: errors.length,
        timestamp: timestamp
      };
    } else {
      return {
        status: 200,
        message: `Renombrado exitoso de archivos FOLIO2. Total de archivos renombrados: ${renamedFiles.length}`,
        renamedFiles: renamedFiles,
        renamedCount: renamedFiles.length,
        timestamp: timestamp
      };
    }

  } catch (err) {
    console.error('Error en rename-folio-files:', err);
    return {
      status: 500,
      message: 'Error en la operación de renombrado',
      error: err.message
    };
  }
});
// function to rename files from flio2.fdb to folio2.fdb format

ipcMain.handle('operationRenameF2', async (event, idArray) => {
  let pool = null;
  try {
    // Conectar a la base de datos
    pool = await sql.connect(msqlserverOptions);
    const res = await pool.request().query('SELECT * FROM Devices');

    let restoredFiles = [];
    let errors = [];

    const filtered = res.recordset.filter(item => idArray.includes(item.id));

    // Procesar cada dispositivo
    for (const item of filtered) {
      const folder = item.located_at;
      const basepath = `C:\\zz\\Kiosco\\DB\\GTO\\${folder}\\db`;

      try {
        // Verificar si el directorio existe
        if (!fs.existsSync(basepath)) {
          console.warn(`Directorio no existe: ${basepath}`);
          continue;
        }

        // Leer archivos del directorio
        const files = fs.readdirSync(basepath);

        // Buscar archivos que inicien con "FLIO2BKP" y tengan extensión .fdb o .FDB
        const backupFiles = files.filter(filename =>
          filename.startsWith('FLIO2BKP') &&
          (filename.toLowerCase().endsWith('.fdb') || filename.toLowerCase().endsWith('.FDB'))
        );

        // Restaurar archivos encontrados
        for (const filename of backupFiles) {
          const oldPath = path.join(basepath, filename);
          const newPath = path.join(basepath, 'FOLIO2.FDB');

          try {
            // Verificar si ya existe un archivo FOLIO2.FDB
            if (fs.existsSync(newPath)) {
              errors.push(`Ya existe un archivo FOLIO2.FDB en ${folder}. No se puede restaurar ${filename}`);
              continue;
            }

            // Renombrar archivo de respaldo a FOLIO2.FDB
            fs.renameSync(oldPath, newPath);
            restoredFiles.push({
              folder: folder,
              oldName: filename,
              newName: 'FOLIO2.FDB',
              fullPath: newPath
            });

          } catch (restoreError) {
            errors.push(`Error al restaurar ${folder}/${filename}: ${restoreError.message}`);
          }
        }

      } catch (dirError) {
        errors.push(`Error al procesar directorio ${basepath}: ${dirError.message}`);
      }
    }

    // Cerrar conexión a la base de datos
    await pool.close();

    // Evaluar resultado
    if (errors.length > 0) {
      return {
        status: 500,
        message: `Proceso completado con errores. Archivos restaurados: ${restoredFiles.length}`,
        error: errors.join('; '),
        restoredFiles: restoredFiles,
        errorCount: errors.length
      };
    } else {
      return {
        status: 200,
        message: `Restauración exitosa de archivos FLIO2BKP. Total de archivos restaurados: ${restoredFiles.length}`,
        restoredFiles: restoredFiles,
        restoredCount: restoredFiles.length
      };
    }

  } catch (err) {
    console.error('Error en restore-backup-files:', err);
    return {
      status: 500,
      message: 'Error en la operación de restauración',
      error: err.message
    };
  }
});
// function to restore files from ddmmyyy.fdb to folio2.fdb
ipcMain.handle('operationRestore', async (event, targetDate, idArray) => {
  let pool = null;
  try {
    // Conectar a la base de datos
    pool = await sql.connect(msqlserverOptions);
    const res = await pool.request().query('SELECT * FROM Devices');

    let restoredFiles = [];
    let errors = [];
    const filtered = res.recordset.filter(item => idArray.includes(item.id));
    // Procesar cada dispositivo
    for (const item of filtered) {
      const folder = item.located_at;
      const basepath = `C:\\zz\\Kiosco\\DB\\GTO\\${folder}\\db`;

      try {
        // Verificar si el directorio existe
        if (!fs.existsSync(basepath)) {
          console.warn(`Directorio no existe: ${basepath}`);
          continue;
        }

        // Leer archivos del directorio
        const files = fs.readdirSync(basepath);

        // Buscar archivos con patrón FOLIO2_DDMMYYYYHHMMSS.FDB/fdb que contengan la fecha target
        const datePattern = new RegExp(`^FOLIO2_${targetDate}\\d{6}\\.(FDB|fdb)$`);
        const matchingFiles = files.filter(filename => datePattern.test(filename));

        if (matchingFiles.length === 0) {
          continue;
        }

        // Si hay múltiples archivos, encontrar el más reciente basado en la hora en el nombre
        let selectedFile = matchingFiles[0];
        if (matchingFiles.length > 1) {
          // Ordenar por timestamp completo (fecha + hora) descendente
          matchingFiles.sort((a, b) => {
            // Extraer timestamp completo DDMMYYYYHHMMSS
            const timestampA = a.match(/FOLIO2_(\d{14})\./)[1];
            const timestampB = b.match(/FOLIO2_(\d{14})\./)[1];
            return timestampB.localeCompare(timestampA); // Orden descendente (más reciente primero)
          });
          selectedFile = matchingFiles[0]; // El más reciente
        }

        const oldPath = path.join(basepath, selectedFile);

        // Determinar la extensión original para mantenerla en el archivo destino
        const isUppercase = selectedFile.endsWith('.FDB');
        const newFilename = `FOLIO2.${isUppercase ? 'FDB' : 'fdb'}`;
        const newPath = path.join(basepath, newFilename);

        try {
          // Si ya existe FOLIO2.FDB/fdb, hacer backup primero
          if (fs.existsSync(newPath)) {
            const backupTimestamp = moment().format('DDMMYYYYHHMMSS');
            const backupFilename = `FOLIO2_${backupTimestamp}_backup.${isUppercase ? 'FDB' : 'fdb'}`;
            const backupPath = path.join(basepath, backupFilename);
            fs.renameSync(newPath, backupPath);

          }

          // Renombrar archivo seleccionado a FOLIO2.FDB
          fs.renameSync(oldPath, newPath);
          restoredFiles.push({
            folder: folder,
            originalFile: selectedFile,
            restoredTo: newFilename,
            fullPath: newPath,
            totalFilesFound: matchingFiles.length,
            allMatchingFiles: matchingFiles
          });

        } catch (renameError) {
          errors.push(`Error al restaurar ${folder}/${selectedFile}: ${renameError.message}`);
        }

      } catch (dirError) {
        errors.push(`Error al procesar directorio ${basepath}: ${dirError.message}`);
      }
    }

    // Cerrar conexión a la base de datos
    await pool.close();

    // Evaluar resultado
    if (errors.length > 0) {
      return {
        status: 500,
        message: `Proceso completado con errores. Archivos restaurados: ${restoredFiles.length}`,
        error: errors.join('; '),
        restoredFiles: restoredFiles,
        errorCount: errors.length,
        searchDate: targetDate
      };
    } else {
      return {
        status: 200,
        message: `Restauración exitosa de archivos FOLIO2 para la fecha ${targetDate}. Total de archivos restaurados: ${restoredFiles.length}`,
        restoredFiles: restoredFiles,
        restoredCount: restoredFiles.length,
        searchDate: targetDate
      };
    }

  } catch (err) {
    console.error('Error en restore-folio-files:', err);
    return {
      status: 500,
      message: 'Error en la operación de restauración',
      error: err.message
    };
  }
});


// function to add a new kiosco
ipcMain.handle('addKiosco', async (event, deviceData) => {
  const { name_device, logmein, located_at, id_kiosco_recaudacion, clave_recaudacion, tipo } = deviceData;
  let poolGK = null;

  try {
    // Crear la carpeta si no existe
    const folderPath = `C:\\zz\\Kiosco\\DB\\GTO\\${located_at}\\db`;
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    // Conectar a la base de datos
    poolGK = await sql.connect(msqlserverOptions);
    let tipo_name = tipo == 1 ? 'MULTISERVICIOS 1':'COBRADOR 1';
    // Insertar el nuevo registro
    const result = await poolGK.request()
      .input('name_device', sql.VarChar, name_device)
      .input('alias', sql.VarChar, logmein)
      .input('located_at', sql.VarChar, located_at)
      .input('id_device_type', 1)
      .input('created_at', sql.DateTime, new Date())
      .input('name_recaudacion', sql.VarChar, name_device)
      .input('id_kiosco_recaudacion', sql.Int, id_kiosco_recaudacion)
      .input('clave_recaudacion', sql.Int, clave_recaudacion)
      .input('tipoKiosco', sql.VarChar, tipo_name)
      .query(`
        INSERT INTO devices (
        name_device, 
        alias, 
        located_at, 
        id_device_type,
        created_at,
        name_recaudacion,
        id_kiosco_recaudacion,
        clave_recaudacion, 
        tipoKiosco) 
        OUTPUT INSERTED.id
        VALUES (@name_device, @alias, @located_at, @id_device_type, @created_at, 
        @name_recaudacion, @id_kiosco_recaudacion, @clave_recaudacion,@tipoKiosco )
      `);

    const newId = result.recordset[0].id;

    return {
      status: 200,
      message: 'Dispositivo insertado exitosamente',
      id: newId
    };

  } catch (err) {
    console.error('Error al insertar dispositivo:', err);
    return {
      status: 500,
      message: 'Error al insertar el dispositivo',
      error: err.message
    };
  } finally {
    // Solo cerrar si poolGK fue inicializado exitosamente
    if (poolGK) {
      try {
        await poolGK.close();
      } catch (closeError) {
        console.error('Error al cerrar la conexión:', closeError);
      }
    }
  }
});
// function to update information about kioscos
ipcMain.handle('updateKiosco', async (event, deviceData) => {
  const { id, name_device, logmein, located_at, id_kiosco_recaudacion, clave_recaudacion, tipo } = deviceData;
  let poolGK = null;

  try {
    // Conectar a la base de datos
    poolGK = await sql.connect(msqlserverOptions);

    // Obtener el located_at actual para verificar si cambió
    const currentDevice = await poolGK.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM devices WHERE id = @id');
    if (currentDevice.recordset.length === 0) {
      return {
        status: 404,
        message: 'Dispositivo no encontrado'
      };
    }

    const currentLocatedAt = currentDevice.recordset[0].located_at;

    // Verificar si cambió el located_at
    if (currentLocatedAt !== located_at) {
      // Rutas de carpetas
      const oldFolderPath = `C:\\zz\\Kiosco\\DB\\GTO\\${currentLocatedAt}\\db`;
      const newFolderPath = `C:\\zz\\Kiosco\\DB\\GTO\\${located_at}\\db`;

      // Crear nueva carpeta si no existe
      if (!fs.existsSync(newFolderPath)) {
        fs.mkdirSync(newFolderPath, { recursive: true });
      }

      // Mover archivos de la carpeta anterior a la nueva (opcional)
      if (fs.existsSync(oldFolderPath)) {
        try {
          const files = fs.readdirSync(oldFolderPath);
          for (const file of files) {
            const oldFilePath = path.join(oldFolderPath, file);
            const newFilePath = path.join(newFolderPath, file);
            fs.renameSync(oldFilePath, newFilePath);
          }

          // Eliminar carpeta anterior si está vacía
          if (fs.readdirSync(oldFolderPath).length === 0) {
            fs.rmdirSync(oldFolderPath);
          }
        } catch (moveError) {
          console.warn('Error al mover archivos:', moveError.message);
          // Continuar con la actualización aunque falle el movimiento de archivos
        }
      }
    } else {
      // Solo asegurar que la carpeta existe
      const folderPath = `C:\\zz\\Kiosco\\DB\\GTO\\${located_at}\\db`;
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }
    }

    let tipo_name = tipo == 1 ? 'MULTISERVICIOS 1' : 'COBRADOR 1';

    // Actualizar el registro
    const result = await poolGK.request()
      .input('id', sql.Int, id)
      .input('name_device', sql.VarChar, name_device)
      .input('alias', sql.VarChar, logmein)
      .input('located_at', sql.VarChar, located_at)
      .input('updated_at', sql.DateTime, new Date())
      .input('name_recaudacion', sql.VarChar, name_device)
      .input('id_kiosco_recaudacion', sql.Int, id_kiosco_recaudacion)
      .input('clave_recaudacion', sql.Int, clave_recaudacion)
      .input('tipoKiosco', sql.VarChar, tipo_name)
      .query(`
        UPDATE devices SET
          name_device = @name_device,
          alias = @alias,
          located_at = @located_at,
          updated_at = @updated_at,
          name_recaudacion = @name_recaudacion,
          id_kiosco_recaudacion = @id_kiosco_recaudacion,
          clave_recaudacion = @clave_recaudacion,
          tipoKiosco = @tipoKiosco
        WHERE id = @id
      `);

    if (result.rowsAffected[0] === 0) {
      return {
        status: 404,
        message: 'No se encontró el dispositivo para actualizar'
      };
    }

    return {
      status: 200,
      message: 'Dispositivo actualizado exitosamente',
      id: id,
      folderChanged: currentLocatedAt !== located_at
    };

  } catch (err) {
    console.error('Error al actualizar dispositivo:', err);
    return {
      status: 500,
      message: 'Error al actualizar el dispositivo',
      error: err.message
    };
  } finally {
    // Solo cerrar si poolGK fue inicializado exitosamente
    if (poolGK) {
      try {
        await poolGK.close();
      } catch (closeError) {
        console.error('Error al cerrar la conexión:', closeError);
      }
    }
  }
});
// get information from a kiosco by ID
ipcMain.handle('getKioscoById', async (event, idkiosco)=>{
  let poolGK = null;
  try {
    poolGK = await sql.connect(msqlserverOptions);
    let idArray = []
    if (!Array.isArray(idkiosco)) {
      idArray.push(idkiosco);
    } else {
      idArray = idkiosco
    }
    const devices = []
    for (var i = 0; i < idArray.length; i++) {
      const query_text = `SELECT * FROM Devices where id = ${idArray[i]}`;
      const res = await poolGK.request().query(query_text);
      devices.push(res.recordset[0])  
    }    
    return {
      status: 200,
      data: devices
    };
  } catch (err) {
    console.error('Error al obtener kioscos:', err);
    return {
      status: 500,
      message: 'Error en la consulta a sqlserver',
      error: err.message
    };
  } finally {
    // Solo cerrar si poolGK fue inicializado exitosamente
    if (poolGK) {
      try {
        await poolGK.close();
      } catch (closeError) {
        console.error('Error al cerrar la conexión:', closeError);
      }
    }
  }
})
// soft-delete 
ipcMain.handle('deleteKiosco',async(event,idk)=>{
  let pool=null
  try {
    pool = await sql.connect(msqlserverOptions);  
    const currentDevice = await pool.request()
      .input('id', sql.Int, idk)
      .query('SELECT * FROM devices WHERE id = @id');
    if (currentDevice.recordset.length === 0) {
      return {
        status: 404,
        message: 'Dispositivo no encontrado'
      };
    }
    const result = await pool.request()
      .input('id', sql.Int, idk)
      .input('deleted_at', sql.DateTime, new Date())
      .query(`
        UPDATE devices SET
          deleted_at = @deleted_at
        WHERE id = @id
      `);
      return {
        status: 200,
        message: 'Dispositivo ELIMINADO exitosamente',
      };
    } catch (error) {
      
  } finally {
    // Solo cerrar si poolGK fue inicializado exitosamente
    if (pool) {
      try {
        await pool.close();
      } catch (closeError) {
        console.error('Error al cerrar la conexión:', closeError);
      }
    }
  }
})
// open file explorer window in the folder route
ipcMain.handle('open-folder', async (event, folder) => {
  const { shell } = require('electron');

  try {
    // Construir la ruta completa
    const folderPath = `C:\\zz\\Kiosco\\DB\\GTO\\${folder}\\db`;

    // Verificar si la carpeta existe
    if (!fs.existsSync(folderPath)) {
      return {
        status: 404,
        message: `La carpeta no existe: ${folderPath}`,
        path: folderPath
      };
    }

    // Abrir el explorador de archivos en la carpeta
    await shell.openPath(folderPath);

    return {
      status: 200,
      message: 'Carpeta abierta exitosamente',
      path: folderPath
    };

  } catch (err) {
    console.error('Error al abrir la carpeta:', err);
    return {
      status: 500,
      message: 'Error al abrir el explorador de archivos',
      error: err.message
    };
  }
});

// get corte efectivo from every kiosco
ipcMain.handle('getCorteEfectivo', async (event, idArray, ) => {
  const results = [];
  const errors = []
  let poolGR = null;
  let filename = 'FOLIO2.FDB'
  console.log(idArray);
  
  try {
    poolGR = await sql.connect(msqlserverOptions);
    const kioscos = await poolGR.request().query('SELECT * FROM Devices');
    const filtered = kioscos.recordset.filter(item => idArray.includes(item.id));
    for (const e of filtered) {
      const dbResult = findDatabaseFile(e, filename);
      // const dbPath = path.join('C:\\zz\\Kiosco\\DB\\GTO', e.located_at, 'db', 'FOLIO2.fdb'); // ajusta el nombre .fdb
      // if (!fs.existsSync(dbPath)) {
      //   console.warn(`Base de datos no encontrada: ${dbPath}`);
      // }
      if(!dbResult.found) {
        errors.push({
          kiosco:e.id,
          carpeta:e.located_at,
          error: dbResult.error
        })
        continue; // Continuar con el siguiente kiosco
      }
      const dbOptions = {
        ...firebirdOptions,
        database: dbResult.path,
        charset: 'UTF8'
      };
      const query = `select id as idKiosco, 
        cast((fecha) as VARCHAR(20)) fecha,
                    BILL1ENT as E50,
                    ENTHOPP1 as E10,
                    ENTHOPP2 as E5,
                    ENTHOPP3 as E2,
                    ENTHOPP4 as E1,
                    BILL50P as A50,
                    HOPP1 as A10,
                    HOPP2 as A5,
                    HOPP3 as A2,
                    HOPP4 as A1,
                    BILLREC1000 as R1000,
                    BILLREC500 as R500,
                    BILLREC200 as R200,
                    BILLREC100 as R100,
                    BILLREC050 as R50,
                    BILLREC020 as R20,
                    MONREC20P as RM20,
                    MONREC10P as RM10,
                    MONREC05P as RM5,
                    MONREC02P as RM2,
                    MONREC01P as RM1,
                    MONREC50C as RM50C
                    from datos `;

      const dataKioscos = await new Promise((resolve, reject) => {
        Firebird.attach(dbOptions, (err, db) => {
          if (err) {
            console.error("Error al conectar a Firebird:", err.message);
            return reject(err);
          }
          db.query(query, (err, result) => {
            db.detach();
            if (err) {
              console.error("Error en la consulta:", err.message);
              return reject(err);
            }
            resolve(result);
          });
        });
      });
      results.push(...dataKioscos);
    }
    return {
      status: 200,
      data: results,
      message: "success",
      errors:errors
    };

  } catch (e) {
    return {
      status: 500,
      data: [],
      message: e.message,
      errors: errors
    };
  }
  finally {
    if (poolGR) {
      try {
        await poolGR.close();
      } catch (closeError) {
        console.error('Error al cerrar la conexión:', closeError);
      }
    }
  }
})
function findDatabaseFile(kioskData, fileName = 'FOLIO2.fdb') {
  const basePath = path.join('C:\\zz\\Kiosco\\DB\\GTO', kioskData.located_at, 'db');

  try {
    // Verificar si el directorio existe
    if (!fs.existsSync(basePath)) {
      return {
        found: false,
        path: null,
        error: `Directorio no encontrado: ${basePath}`
      };
    }

    // Leer archivos del directorio
    const files = fs.readdirSync(basePath);

    // Buscar el archivo ignorando mayúsculas/minúsculas
    const targetFile = files.find(file =>
      file.toLowerCase() === fileName.toLowerCase()
    );

    if (targetFile) {
      return {
        found: true,
        path: path.join(basePath, targetFile),
        actualName: targetFile,
        searchedName: fileName
      };
    }

    return {
      found: false,
      path: null,
      error: `Archivo ${fileName} no encontrado en ${basePath}. Archivos disponibles: [${files.join(', ')}]`
    };

  } catch (error) {
    return {
      found: false,
      path: null,
      error: `Error accediendo al directorio ${basePath}: ${error.message}`
    };
  }
}
// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
