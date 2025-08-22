const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
    // get's
    getKioscos: (fileSelected) => ipcRenderer.invoke('get-kioscos',fileSelected),
    
    getListCompressed: (ids, dateSelected) => ipcRenderer.invoke('descompresion',ids,  dateSelected),
    
    getJustKioscos: () => ipcRenderer.invoke('get-justKioscos'),
    
    getKioscoById: (idkiosco) => ipcRenderer.invoke('getKioscoById', idkiosco),
    
    // utilities
    operationRename: (idArray) => ipcRenderer.invoke('operationRename', idArray),

    operationRenameF2: (idArray) => ipcRenderer.invoke('operationRenameF2', idArray),

    operationRestore: (targetDate, idArray) => ipcRenderer.invoke('operationRestore', targetDate, idArray),
    
    operationClear: (file, idArray) => ipcRenderer.invoke('operationClear',file,idArray),
    //    kioscos
    addKiosco: (data) => ipcRenderer.invoke('addKiosco', data),
    
    updateKiosco: (data) => ipcRenderer.invoke('updateKiosco', data),
    
    deleteKiosco: (idk) => ipcRenderer.invoke('deleteKiosco', idk),

    
    // recaudacion
    
    getRecords: (idArray, from, to) => ipcRenderer.invoke('get-records', idArray, from, to),
    
    invoke: (channel, data) => ipcRenderer.invoke(channel, data),
    
    receive: (channel, callback) => ipcRenderer.on(channel, (_, ...args) => callback(...args)),

    // pruebaRecaudacion: () => ipcRenderer.invoke('pruebaRecaudacion',),
    // actions-file explorer
    openFolder: (folder) => ipcRenderer.invoke('open-folder',folder),

    // getcorteefectivo
    getCorteEfectivo: (idArray) => ipcRenderer.invoke('getCorteEfectivo',idArray),




})
