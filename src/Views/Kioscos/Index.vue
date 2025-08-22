<script setup>
import { onMounted, ref } from 'vue';
import ContainerCustom from '../Components/ContainerCustom.vue';
import Loader from '../Components/Loader.vue';
import TitleContainer from '../Components/TitleContainer.vue';
import { alert_error, alert_success } from '../../constants/alerts';
import ButtonCustom from '../Components/ButtonCustom.vue';
import { useRouter } from 'vue-router'
import Modal from '../Components/Modal.vue';
import { useDynamicCSS } from '../../composables/useDynamicCSS'
import ButtonTable from '../Components/ButtonTable.vue';
useDynamicCSS('./styles/Kioscos/index.css')

// import  '../../assets/styles/Kioscos/index.css'
// router
const router = useRouter()
// table
const headers =ref(  [
    { text: "ID", value: "id" },
    { text: "Nombre", value: "name_device"},
    { text: "LOG-MEIN", value: "alias"},
    // { text: "Carpeta", value: "located_at"},
    { text: "Explorador", value: "folder_custom"},
    { text: "Acciones", value: "actions_custom"},
]);
const items = ref([]) ;
const searchField = ["id", "name_device", "alias", "located_at"]; //campos por los que buscara el filtro
const searchInput = ref("");
// loaders
const isLoading = ref(false);
const btnLoader = ref(false);
// extras
const modalShow = ref(false);
const kioscoTodelete = ref(0);

// functions
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

const addNew = () => {
    router.push("/addkiosco")
}

const editKiosco = (id) => {
    let route = `/editkiosco/${id}`
    router.push(route)
}

const openModal = (item) => {
    console.log(item);
    modalShow.value = true;
    kioscoTodelete.value = item;
}

const deleteKiosco = async() => {
    btnLoader.value=true
    const response = await window.api.deleteKiosco(kioscoTodelete.value)
    btnLoader.value=true
    const {status, data}=response;       
    if (status!=200) {
        alert_error("Ocurrio un error al eliminar el regsitro");
        return
    } 
    alert_success("Registro eliminado correctamente");
    getKioscos();
    kioscoTodelete.value = 0;
    modalShow.value = false;
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
    
    <ContainerCustom 
        title="LISTADO DE KIOSCOS"
        subtitle="Gestiona y administra todos los kioscos del sistema"
        icon="desktop_windows"
        header-background="gradient"
        :loading="isLoading"
    >
        <template #body>
            

            <!-- Sección de Búsqueda y Filtros -->
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
                                    placeholder="Buscar por ID, nombre, alias o carpeta..."
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

            <!-- Sección de Tabla -->
            <div class="table-section">
                <div class="table-header">
                    <div class="header-content">
                        <h3 class="table-title">
                            <span class="material-icons">view_list</span>
                            Registro de Kioscos
                        </h3>
                        <div class="table-info">
                            <span class="info-badge total">{{ items.length }} registros</span>
                            <span class="info-badge filtered" v-if="searchInput">
                                Filtrados: {{ items.filter(item => 
                                    searchField.some(field => 
                                        item[field]?.toString().toLowerCase().includes(searchInput.toLowerCase())
                                    )
                                ).length }}
                            </span>
                        </div>
                    </div>
                </div>

                <div class="table-container">
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
                        :table-height="450"

                        table-class-name="modern-table"
                        theme-color="#4caf50"
                        class="custom-data-table"
                    >
                        <template #item-actions_custom="item">
                            <div class="actions-container">
                                <!-- BOTONES ORIGINALES SIN MODIFICAR -->
                                <ButtonTable 
                                    iconName="create"
                                    color="blue"
                                    tooltip="Editar informacion"
                                    @function="editKiosco(item.id)" 
                                >
                                <span  class="material-icons">edit</span>

                            </ButtonTable>
                            <ButtonTable 
                                color="red" 
                                @click="openModal(item.id)"
                                tooltip="Eliminar kiosco"
                                >
                                <span  class="material-icons">delete</span>
                            </ButtonTable>
                            </div>
                        </template>
                        <template #item-folder_custom="item">
                            <ButtonTable 
                                    color="green" 
                                    tooltip="Abrir carpeta"
                                    @click="OpenfileExplorer(item.located_at)"
                                >
                                <span  class="material-icons">source</span>
                            </ButtonTable>
                        </template>
                        <!-- <template #item-name_device="item">
                            <div class="device-info">
                                <div class="device-name">{{ item.name_device }}</div>
                                <div class="device-id">#{{ item.id }}</div>
                            </div>
                        </template>

                        <template #item-alias="item">
                            <div class="alias-container">
                                <span class="material-icons alias-icon">computer</span>
                                <span class="alias-text">{{ item.alias }}</span>
                            </div>
                        </template>

                        <template #item-located_at="item">
                            <div class="location-container">
                                <span class="material-icons location-icon">folder</span>
                                <span class="location-path">{{ item.located_at }}</span>
                            </div>
                        </template> -->
                    </EasyDataTable>
                </div>
            </div>

            <!-- Estado vacío mejorado -->
            <div v-if="items.length === 0 && !isLoading" class="empty-state">
                <div class="empty-icon">
                    <span class="material-icons">desktop_windows</span>
                </div>
                <h3 class="empty-title">No hay kioscos registrados</h3>
                <p class="empty-description">
                    Comienza agregando tu primer kiosco al sistema
                </p>
                <div class="empty-actions">
                    <!-- BOTÓN ORIGINAL SIN MODIFICAR -->
                   <ButtonCustom 
                        color="green" 
                        @click="addNew"
                    >
                    <span  class="material-icons">add</span>
                    Agregar nuevo
                </ButtonCustom>
                </div>
            </div>
            <!-- Sección de Estadísticas Rápidas -->
            <div class="stats-section">
                <div class="stat-card">
                    <div class="stat-icon">
                        <span class="material-icons">desktop_windows</span>
                    </div>
                    <div class="stat-content">
                        <div class="stat-number">{{ items.length }}</div>
                        <div class="stat-label">Total Kioscos</div>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon active">
                        <span class="material-icons">check_circle</span>
                    </div>
                    <div class="stat-content">
                        <div class="stat-number">{{ items.length }}</div>
                        <div class="stat-label">Activos</div>
                    </div>
                </div>
                
                <div class="stat-card" @click="addNew">
                    <div class="stat-icon recent">
                        <span class="material-icons">add_circle</span>
                    </div>
                    <div class="stat-content">
                        <div class="stat-number">+</div>
                        <div class="stat-label">Agregar Nuevo</div>
                    </div>
                </div>
            </div>
        </template>
        
        <template #footer >
            
            <div class="footer-content">
                <div class="footer-info">
                    <span class="material-icons">info</span>
                    <div class="info-text">
                        <span class="info-title">Sistema de Gestión</span>
                        <span class="info-description">
                            Total de {{ items.length }} kioscos registrados en el sistema
                        </span>
                    </div>
                </div>
                
                <div class="footer-actions">
                    <!-- BOTÓN ORIGINAL SIN MODIFICAR -->
                    <!-- <ButtonCustom 
                        text="Agregar nuevo" 
                        iconName="add"
                        color="green" 
                        @function="addNew"
                    /> -->
                </div>
            </div>
        </template>
    </ContainerCustom>

    <!-- Modal Modernizado -->
    <div v-if="modalShow" class="modern-modal-overlay">
        <div class="modern-modal">
            <div class="modal-header">
                <div class="header-icon danger">
                    <span class="material-icons">warning</span>
                </div>
                <div class="header-content">
                    <h2 class="modal-title">Eliminar Kiosco</h2>
                    <p class="modal-subtitle">Esta acción no se puede deshacer</p>
                </div>
                <button @click="modalShow = false" class="close-btn">
                    <span class="material-icons">close</span>
                </button>
            </div>
            
            <div class="modal-body">
                <div class="warning-section">
                    <div class="warning-card">
                        <span class="material-icons">delete_forever</span>
                        <div class="warning-content">
                            <h4 class="warning-title">¿Estás seguro?</h4>
                            <p class="warning-text">
                                Esta acción eliminará permanentemente el kiosco seleccionado y todos sus datos asociados.
                            </p>
                        </div>
                    </div>
                </div>

                <div class="info-section">
                    <div class="info-item">
                        <span class="material-icons">info</span>
                        <span>Una vez eliminado, no podrás recuperar esta información</span>
                    </div>
                    <div class="info-item">
                        <span class="material-icons">backup</span>
                        <span>Asegúrate de tener un respaldo si es necesario</span>
                    </div>
                </div>
            </div>
            
            <div class="modal-footer">
                <div class="modal-actions">
                    
                    <ButtonCustom 
                        color="gray" 
                        @click="modalShow=false"
                    >
                    <span  class="material-icons">cancel</span>
                    Cancelar
                    </ButtonCustom>
                    <ButtonCustom 
                        color="red" 
                        @click="deleteKiosco"
                    >
                    <span  class="material-icons">delete</span>
                    Eliminar
                    </ButtonCustom>
                </div>
            </div>
        </div>
    </div>
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
    --easy-table-body-row-hover-font-color: #667eea;
    --easy-table-body-row-hover-background-color: rgba(102, 126, 234, 0.05);
    --easy-table-footer-background-color: #f8fafc;
    --easy-table-footer-font-color: #4a5568;
    --easy-table-footer-font-size: 12px;
    --easy-table-footer-padding: 0px 16px;
    --easy-table-footer-height: 50px;
    --easy-table-scrollbar-track-color: #f1f1f1;
    --easy-table-scrollbar-color: #c1c1c1;
    --easy-table-scrollbar-thumb-color: #667eea;
    --easy-table-scrollbar-corner-color: #f1f1f1;
    --easy-table-loading-mask-background-color: rgba(255, 255, 255, 0.9);
}
</style>