<script setup>
import { onMounted, ref } from 'vue';
import Loader from '../Components/Loader.vue';
import ContainerCustom from '../Components/ContainerCustom.vue';
import TitleContainer from '../Components/TitleContainer.vue';
import Modal from '../Components/Modal.vue';
import { alert_error, alert_success } from '../../constants/alerts';
import LabelForms from '../Components/LabelForms.vue';
import moment from 'moment';
import { useDynamicCSS } from '../../composables/useDynamicCSS'
import ButtonTable from '../Components/ButtonTable.vue';
useDynamicCSS('./styles/Utilities.css')
// import '../../assets/styles/Utilities.css'
const isLoading = ref(false);
const isLoadingBtn = ref(false);
const textLoading = ref("Cargando");
const modalDelete = ref(false);
const modalRename = ref(false);
const modalRestore = ref(false);
const fileSelected = ref(0);
const picked = ref(0);
const errorModal = ref({
    message:"",
    state:false
});

// tabla
const headers =ref(  [
    { text: "ID", value: "id" },
    { text: "Nombre", value: "name_device"},
    { text: "Alias", value: "alias"},
    { text: "Explorador", value: "folder_custom"},

]);
const items = ref([]) ;
const itemsSelected = ref([]);
const searchField = ["id", "name_device", "located_at", "status"]; //campos por los que buscara el filtro
const searchInput = ref("");
const dateTo = ref(moment().format("YYYY-MM-DD"));

onMounted( () => {
    getKioscos()
});

const getKioscos = async() => {
    isLoading.value = true
    const response = await window.api.getJustKioscos()
    console.log(response);
    
    const {data,status} = response;
    isLoading.value=false;
    if (status != 200) {
        alert_error("Ocurrio un error al cargar los datos");
    }
    items.value= data;
}

const deleteFiles = async()=>{
    errorModal.value.state=false;
    if (itemsSelected.value.length<1) {
        errorModal.value.state=true;
        errorModal.value.message="Debes seleccionar almenos un kiosco"
        return
    }
    if (fileSelected.value>0) {
        isLoadingBtn.value=true;
        const idsMap = itemsSelected.value.map(i=> i.id)
        const response = await window.api.operationClear(fileSelected.value, idsMap);
        const{status, message}=response;
        isLoadingBtn.value=false;
        modalDelete.value=false;
        if (status!=200) {
            alert_error("Ocurrio un error al eliminar los archivos")
            return
        }
        alert_success(message);
    }else{
        errorModal.value.state=true;
        errorModal.value.message = "Selecciona un tipo de dato"
        return
    }
}

const renameFiles = ()=>{
    errorModal.value.state=false;
    if (itemsSelected.value.length < 1) {
        errorModal.value.state=true;
        errorModal.value.message="Debes seleccionar almenos un kiosco"
        return
    }
    if (picked.value=="1") {
        renameFlio2toFolio2();
    }else if (picked.value=="2") {
        renameFolio2toFolioddmmyyy();
    }
    return ;
}

const renameFolio2toFolioddmmyyy =async () => {
    isLoadingBtn.value=true;
    const idsMap = itemsSelected.value.map(i=> i.id)
    const response = await window.api.operationRename(idsMap);
    const{status, message}=response;
    isLoadingBtn.value=false;
    modalRename.value=false;
    if (status!=200) {
        alert_error("Ocurrio un error al renombrar archivos")
        return
    }
    alert_success(message);
}

const renameFlio2toFolio2 = async() => {
    isLoadingBtn.value=true;
    const idsMap = itemsSelected.value.map(i=> i.id)
    const response = await window.api.operationRenameF2(idsMap);
    const{status, message}=response;
    isLoadingBtn.value=false;
    modalRename.value=false;
    if (status!=200) {
        alert_error("Ocurrio un error al renombrar archivos")
        return
    }
    alert_success(message);
}

const restoreFiles = async()=>{
    errorModal.value.state=false;
    if (itemsSelected.value.length<1) {
        errorModal.value.state=true;
        errorModal.value.message="Debes seleccionar almenos un kiosco"
        return
    }
    isLoadingBtn.value=true;
    const idsMap = itemsSelected.value.map(i=> i.id)
    const dateFormated = moment(dateTo.value).format("DDMMYYYY");
    const response = await window.api.operationRestore(dateFormated, idsMap);
    const{status, message}=response;
    isLoadingBtn.value=false;
    modalRestore.value=false;
    if (status!=200) {
        alert_error("Ocurrio un error al renombrar archivos")
        return
    }
    alert_success(message);
}
const OpenfileExplorer = async(folder) => {
    const response = await window.api.openFolder(folder)
    const {status, data}=response;       
    if (status!=200) {
        alert_error("Ocurrio un error al abrir el explorador");
        return
    } 
    alert_success("Abriendo explorador de archivos");
}
</script>

<template>
    <!-- <Loader v-if="isLoading" :text="textLoading"/> -->
    
    <ContainerCustom 
        title="UTILIDADES"
        subtitle="Gestiona operaciones avanzadas en bases de datos y archivos del sistema"
        icon="build"
        header-background="gradient"
        :loading="isLoading"
    >
        <template #body>
            <!-- Sección de Búsqueda -->
            <div class="search-section">
                <div class="search-card">
                    <div class="search-header">
                        <span class="material-icons search-icon">search</span>
                        <h3 class="search-title">Buscar Kioscos</h3>
                    </div>
                    
                    <div class="search-content">
                        <div class="search-input-wrapper">
                            <label class="search-label">Filtrar por coincidencia:</label>
                            <div class="input-wrapper">
                                <span class="material-icons input-icon">search</span>
                                <input 
                                    v-model="searchInput"
                                    type="text"
                                    class="modern-search-input"
                                    placeholder="Buscar por ID, nombre o carpeta..."
                                />
                                <button 
                                    v-if="searchInput" 
                                    @click="searchInput = ''"
                                    class="clear-search-btn"
                                    type="button"
                                >
                                    <span class="material-icons">close</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Sección Principal: Tabla + Panel de Acciones -->
            <div class="main-section">
                <!-- Tabla de Kioscos -->
                <div class="table-container">
                    <div class="table-card">
                        <div class="table-header">
                            <h3 class="table-title">
                                <span class="material-icons">desktop_windows</span>
                                Kioscos Disponibles
                            </h3>
                            <div class="table-info">
                                <span class="info-badge total">{{ items.length }} total</span>
                                <span class="info-badge selected">{{ itemsSelected.length }} seleccionados</span>
                            </div>
                        </div>

                        <div class="table-body">
                            <EasyDataTable
                                :headers="headers"
                                :items="items"
                                :search-field="searchField"
                                :search-value="searchInput"
                                header-text-direction="center"
                                body-text-direction="center"
                                rows-per-page-message="Registros por pagina"
                                empty-message="Sin Registros"
                                rows-of-page-separator-message="de"
                                alternating
                                buttons-pagination
                                :rows-per-page="25"
                                :table-height="500"
                                v-model:items-selected="itemsSelected"
                                table-class-name="modern-table"
                                theme-color="#9c27b0"
                                class="custom-data-table"
                            >
                            <template #item-folder_custom="item">
                                <ButtonTable 
                                        color="green" 
                                        tooltip="Abrir carpeta"
                                        @click="OpenfileExplorer(item.located_at)"
                                    >
                                    <span  class="material-icons">source</span>
                                </ButtonTable>
                            </template>
                        </EasyDataTable>
                        </div>
                    </div>
                </div>

                <!-- Panel de Operaciones -->
                <div class="operations-panel">
                    <div class="panel-header">
                        <span class="material-icons panel-icon">settings</span>
                        <h3 class="panel-title">Operaciones</h3>
                    </div>

                    <div class="operations-list">
                        <!-- Eliminar Residuales -->
                        <div class="operation-card delete-card" @click="modalDelete=true" >
                            <div class="operation-icon">
                                <span class="material-icons">delete_forever</span>
                            </div>
                            <div class="operation-content">
                                <h4 class="operation-title">Eliminar Residuales</h4>
                                <p class="operation-description">
                                    Elimina archivos (.zip) y (folio2ddmmyyy)
                                </p>
                                <div class="operation-badge danger">
                                    <span class="material-icons">warning</span>
                                    Destructivo
                                </div>
                            </div>
                            <div class="operation-arrow">
                                <span class="material-icons">arrow_forward_ios</span>
                            </div>
                        </div>

                        <!-- Renombrar Bases -->
                        <div class="operation-card rename-card" @click="modalRename=true">
                            <div class="operation-icon">
                                <span class="material-icons">edit</span>
                            </div>
                            <div class="operation-content">
                                <h4 class="operation-title">Renombrar Bases</h4>
                                <p class="operation-description">
                                    Cambiar nombres a FOLIO2_DDMMYYYY
                                </p>
                                <div class="operation-badge warning">
                                    <span class="material-icons">info</span>
                                    Modificación
                                </div>
                            </div>
                            <div class="operation-arrow">
                                <span class="material-icons">arrow_forward_ios</span>
                            </div>
                        </div>

                        <!-- Restaurar Bases -->
                        <div class="operation-card restore-card" @click="modalRestore=true">
                            <div class="operation-icon">
                                <span class="material-icons">restore</span>
                            </div>
                            <div class="operation-content">
                                <h4 class="operation-title">Restaurar Bases</h4>
                                <p class="operation-description">
                                    De FOLIO2_DDMMYYYY a FOLIO2.FDB
                                </p>
                                <div class="operation-badge success">
                                    <span class="material-icons">check_circle</span>
                                    Seguro
                                </div>
                            </div>
                            <div class="operation-arrow">
                                <span class="material-icons">arrow_forward_ios</span>
                            </div>
                        </div>
                    </div>

                    <!-- Info Panel -->
                    <div class="info-panel">
                        <div class="info-header">
                            <span class="material-icons">info</span>
                            <span>Información</span>
                        </div>
                        <div class="info-content">
                            <div class="info-item">
                                <span class="material-icons">check_box</span>
                                <span>Selecciona kioscos de la tabla</span>
                            </div>
                            <div class="info-item">
                                <span class="material-icons">touch_app</span>
                                <span>Haz clic en una operación</span>
                            </div>
                            <div class="info-item">
                                <span class="material-icons">security</span>
                                <span>Confirma los cambios</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </template>
    </ContainerCustom>

    <!-- Modal: Eliminar Archivos -->
    <Modal :show="modalDelete" :showHeader="true" :showfooter="false" width="30">
        <template v-slot:header>
            <div class="modal-header-content">
                <div class="modal-icon danger">
                    <span class="material-icons">delete_forever</span>
                </div>
                <div class="modal-title-section">
                    <h5 class="modal-title">Eliminar Archivos Residuales</h5>
                    <p class="modal-subtitle">Esta acción no se puede deshacer</p>
                </div>
                <button @click="modalDelete=false" :disabled="isLoadingBtn" class="close-btn">
                    <span class="material-icons">close</span>
                </button>
            </div>
        </template>
        
        <template v-slot:body>
            <div class="modal-body-content">
                <div class="selection-section">
                    <label class="modern-label">
                        <span class="label-text">
                            <span class="material-icons label-icon">folder</span>
                            Tipo de archivo a eliminar
                        </span>
                        <select class="modern-select" v-model="fileSelected">
                            <option value="0" selected>--Selecciona--</option>
                            <option value="2">FOLIO2_DDMMYYYHHMMSS.FDB</option>
                            <option value="1">FLIO2BKP.ZIP</option>
                        </select>
                    </label>
                </div>

                <div class="warning-section">
                    <div class="warning-card">
                        <span class="material-icons">warning</span>
                        <div class="warning-text">
                            <strong>¡Atención!</strong> Esta operación eliminará permanentemente los archivos seleccionados.
                        </div>
                    </div>
                </div>
            </div>
        </template>
        
        <template v-slot:footer class="modal-footer-content">
                <div class="footer-info">
                    <span class="material-icons">desktop_windows</span>
                    <span>Kioscos seleccionados: <strong>{{ itemsSelected.length }}</strong></span>
                </div>
                <div class="footer-actions">
                    <button 
                        @click="deleteFiles" 
                        :disabled="isLoadingBtn"
                        class="danger-btn"
                    >
                        <div v-if="isLoadingBtn" class="btn-spinner">
                            <div class="spinner"></div>
                        </div>
                        <span v-else class="material-icons">delete_forever</span>
                        Eliminar Archivos
                    </button>
                </div>
                <small v-if="errorModal.state" class="error-message">{{ errorModal.message }}</small>
        </template>
    </Modal>

    <!-- Modal: Renombrar Bases -->
    <Modal :show="modalRename" :showHeader="true" :showfooter="false" width="40">
        <template v-slot:header>
            <div class="modal-header-content">
                <div class="modal-icon warning">
                    <span class="material-icons">edit</span>
                </div>
                <div class="modal-title-section">
                    <h5 class="modal-title">Renombrar Bases de Datos</h5>
                    <p class="modal-subtitle">Selecciona el tipo de renombrado</p>
                </div>
                <button @click="modalRename=false" class="close-btn">
                    <span class="material-icons">close</span>
                </button>
            </div>
        </template>
        
        <template v-slot:body>
            <div class="modal-body-content">
                <div class="rename-options">
                    <div class="option-card" :class="{ active: picked === '1' }">
                        <input 
                            class="option-input" 
                            type="radio" 
                            name="renameOption" 
                            id="rename1"
                            value="1" 
                            v-model="picked"
                        >
                        <label class="option-label" for="rename1">
                            <div class="option-icon">
                                <span class="material-icons">arrow_forward</span>
                            </div>
                            <div class="option-content">
                                <h4 class="option-title">FLIO2BKP → FOLIO2</h4>
                                <p class="option-description">Renombra archivos de backup a formato estándar</p>
                            </div>
                            <div class="option-check">
                                <span class="material-icons">radio_button_unchecked</span>
                                <span class="material-icons checked">radio_button_checked</span>
                            </div>
                        </label>
                    </div>

                    <div class="option-card" :class="{ active: picked === '2' }">
                        <input 
                            class="option-input" 
                            type="radio" 
                            name="renameOption" 
                            id="rename2"
                            value="2" 
                            v-model="picked"
                        >
                        <label class="option-label" for="rename2">
                            <div class="option-icon">
                                <span class="material-icons">arrow_forward</span>
                            </div>
                            <div class="option-content">
                                <h4 class="option-title">FOLIO2 → FOLIO2_DDMMYYYY</h4>
                                <p class="option-description">Agrega timestamp al nombre del archivo</p>
                            </div>
                            <div class="option-check">
                                <span class="material-icons">radio_button_unchecked</span>
                                <span class="material-icons checked">radio_button_checked</span>
                            </div>
                        </label>
                    </div>
                </div>
            </div>
        </template>
        
        <template v-slot:footer>
            <div class="modal-footer-content">
                <div class="footer-info">
                    <span class="material-icons">desktop_windows</span>
                    <span>Kioscos seleccionados: <strong>{{ itemsSelected.length }}</strong></span>
                </div>
                <div class="footer-actions">
                    <button 
                        @click="renameFiles" 
                        :disabled="isLoadingBtn"
                        class="warning-btn"
                    >
                        <div v-if="isLoadingBtn" class="btn-spinner">
                            <div class="spinner"></div>
                        </div>
                        <span v-else class="material-icons">edit</span>
                        Renombrar Archivos
                    </button>
                </div>
                <small v-if="errorModal.state" class="error-message">{{ errorModal.message }}</small>
            </div>
        </template>
    </Modal>

    <!-- Modal: Restaurar Bases -->
    <Modal :show="modalRestore" :showHeader="true" :showfooter="false" width="30">
        <template v-slot:header>
            <div class="modal-header-content">
                <div class="modal-icon success">
                    <span class="material-icons">restore</span>
                </div>
                <div class="modal-title-section">
                    <h5 class="modal-title">Restaurar Bases de Datos</h5>
                    <p class="modal-subtitle">De FOLIO2_DDMMYYYY a FOLIO2.FDB</p>
                </div>
                <button @click="modalRestore=false" class="close-btn">
                    <span class="material-icons">close</span>
                </button>
            </div>
        </template>
        
        <template v-slot:body>
            <div class="modal-body-content">
                <div class="date-section">
                    <label class="modern-label">
                        <span class="label-text">
                            <span class="material-icons label-icon">event</span>
                            Fecha de la base a restaurar
                        </span>
                        <input
                            type="date"
                            class="modern-date-input"
                            v-model="dateTo"
                        />
                        <small class="input-helper">
                            Se restaurará desde: FOLIO2_{{ moment(dateTo).format('DDMMYYYY') }}
                        </small>
                    </label>
                </div>

                <div class="info-section">
                    <div class="info-card success">
                        <span class="material-icons">info</span>
                        <div class="info-text">
                            <strong>Operación segura:</strong> Esta acción restaura las bases de datos sin eliminar los archivos originales.
                        </div>
                    </div>
                </div>
            </div>
        </template>
        
        <template v-slot:footer>
            <div class="modal-footer-content">
                <div class="footer-info">
                    <span class="material-icons">desktop_windows</span>
                    <span>Kioscos seleccionados: <strong>{{ itemsSelected.length }}</strong></span>
                </div>
                <div class="footer-actions">
                    <button 
                        @click="restoreFiles" 
                        :disabled="isLoadingBtn"
                        class="success-btn"
                    >
                        <div v-if="isLoadingBtn" class="btn-spinner">
                            <div class="spinner"></div>
                        </div>
                        <span v-else class="material-icons">restore</span>
                        Restaurar Bases
                    </button>
                </div>
                <small v-if="errorModal.state" class="error-message">{{ errorModal.message }}</small>
            </div>
        </template>
    </Modal>
</template>

<style scoped>

:deep(.modern-table) {
    --easy-table-border: 1px solid #e2e8f0;
    --easy-table-row-border: 1px solid #f7fafc;
    --easy-table-header-font-size: 14px;
    --easy-table-header-height: 50px;
    --easy-table-header-font-color: #4a5568;
    --easy-table-header-background-color: #f8fafc;
    --easy-table-body-even-row-font-color: #4a5568;
    --easy-table-body-even-row-background-color: #ffffff;
    --easy-table-body-odd-row-font-color: #4a5568;
    --easy-table-body-odd-row-background-color: #f8fafc;
    --easy-table-body-row-height: 46px;
    --easy-table-body-row-font-size: 14px;
    --easy-table-body-row-hover-font-color:var(--primary-color);;
    --easy-table-body-row-hover-background-color: rgba(126, 156, 253, 0.05);
    --easy-table-footer-background-color: #f8fafc;
    --easy-table-footer-font-color: #4a5568;
    --easy-table-footer-font-size: 12px;
    --easy-table-footer-padding: 0px 16px;
    --easy-table-footer-height: 50px;
    --easy-table-scrollbar-track-color: #f1f1f1;
    --easy-table-scrollbar-color: #c1c1c1;
    --easy-table-scrollbar-thumb-color: var(--primary-color);
    --easy-table-scrollbar-corner-color: #f1f1f1;
    --easy-table-loading-mask-background-color: rgba(255, 255, 255, 0.9);
}
.custom-data-table :deep(.vue3-easy-data-table__header th) {
    border-bottom: 2px solid var(--primary-color);;
}
</style>