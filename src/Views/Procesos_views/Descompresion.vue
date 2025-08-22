<script setup>
import { computed, onMounted, ref } from 'vue';
import ContainerCustom from '../Components/ContainerCustom.vue';
import moment from 'moment';
import IconTable from '../Components/IconTable.vue';
import ButtonCustom from '../Components/ButtonCustom.vue';
 import { useDynamicCSS } from '../../composables/useDynamicCSS'
useDynamicCSS('./styles/Descompresion.css')
const dateSelected = ref(moment().subtract(1, 'days').format('YYYY-MM-DD'));
const headers =ref(  [
    { text: "ID", value: "id" },
    { text: "Nombre", value: "name_device"},
    { text: "Carpeta", value: "located_at"},
    { text: "Encontrado", value: "status_custom"},
    { text: "Descompresion", value: "descomp_custom"},

]);
const isLoading = ref(false);
const items = ref([]) ;
const itemsSelected = ref([]);
const searchField = ["id", "name_device", "located_at", "status"]; //campos por los que buscara el filtro
const searchInput = ref("");
const picked = ref('all');
const textLoader = ref("Cargando");

onMounted( () => {
    getKioscosList()
});

const getKioscosList = async() => {
    // textLoader.value= "Descomprimiendo archivos"
    isLoading.value=true;
    const dateFormated = moment(dateSelected.value).format('DDMMYYYY');
    console.log(dateFormated);
    // const response = await window.api.getListCompressed(dateFormated);
    const response = await window.api.getJustKioscos()
    console.log(response);
    items.value = response.data;
    isLoading.value=false;
}
const descomprimirFiles = async() => {
    const idsMap = itemsSelected.value.map(i=> i.id)
    isLoading.value=true
    // const response = await window.api.getListCompressed(idsMap,dateFormated);
    console.log(response);
    // if (status!=200) {
    //     alert_error("Ocurrio un error al renombrar archivos")
    //     return
    // }
    // alert_success(message);
  isLoading.value=false
}
const filter_applied = computed(()=>{
    if(picked.value=='complete') return items.value.filter(i=>i.status==true);
    if(picked.value=='missing') return items.value.filter(i=>i.status==false);
    return items.value;
})
</script>

<template>
    
    <ContainerCustom 
        title="DESCOMPRESION DE ARCHIVOS (FLIO2.ZIP)"
        subtitle="Selecciona la fecha del archivo y procesa la descompresión automática"
        icon="unarchive"
        header-background="gradient"
        :loading="isLoading"
    >
        <template #body>
            <!-- Sección de Filtros y Búsqueda -->
             <div class="config-section">
                <div class="config-card">
                    <div class="config-header">
                        <span class="material-icons config-icon">settings</span>
                        <h3 class="config-title">Configuración de Descompresión</h3>
                    </div>
                    
                    <div class="config-content">
                        <div class="search-container">
                    <div class="search-input-group">
                        <label class="modern-label">
                            <span class="label-text">
                                <span class="material-icons label-icon">search</span>
                                Buscar en resultados
                            </span>
                            <div class="input-wrapper">
                                <span class="material-icons input-icon">search</span>
                                <input 
                                    v-model="searchInput"
                                    type="text"
                                    class="modern-search-input"
                                    placeholder="Filtrar por ID, nombre o carpeta..."
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
                        </label>
                    </div>
                </div>

                <div class="filter-buttons">
                    <div class="filter-group">
                        <span class="filter-label">Filtrar por estado:</span>
                        <div class="btn-group-modern">
                            <input type="radio" value="all" v-model="picked" class="btn-check" name="btnradio" id="btnradio1" autocomplete="off" checked>
                            <label class="btn-filter btn-filter-all" for="btnradio1">
                                <span class="material-icons">view_list</span>
                                Todos
                            </label>

                            <input type="radio" value="complete" v-model="picked" class="btn-check" name="btnradio" id="btnradio2" autocomplete="off">
                            <label class="btn-filter btn-filter-success" for="btnradio2">
                                <span class="material-icons">check_circle</span>
                                Descomprimidos
                            </label>

                            <input type="radio" value="missing" v-model="picked" class="btn-check" name="btnradio" id="btnradio3" autocomplete="off">
                            <label class="btn-filter btn-filter-danger" for="btnradio3">
                                <span class="material-icons">error</span>
                                Sin archivo
                            </label>
                        </div>
                    </div>
                </div>
                        
                    </div>
                </div>
            </div>
            

            <!-- Sección de Resultados -->
            <div class="results-section" v-if="items.length > 0">
                <!-- <div class="stats-overview">
                    <div class="stat-card stat-total">
                        <div class="stat-icon">
                            <span class="material-icons">storage</span>
                        </div>
                        <div class="stat-content">
                            <div class="stat-number">{{ items.length }}</div>
                            <div class="stat-label">Total</div>
                        </div>
                    </div>
                    
                    <div class="stat-card stat-success">
                        <div class="stat-icon">
                            <span class="material-icons">check_circle</span>
                        </div>
                        <div class="stat-content">
                            <div class="stat-number">{{ items.filter(i => i.status).length }}</div>
                            <div class="stat-label">Encontrados</div>
                        </div>
                    </div>
                    
                    <div class="stat-card stat-error">
                        <div class="stat-icon">
                            <span class="material-icons">error</span>
                        </div>
                        <div class="stat-content">
                            <div class="stat-number">{{ items.filter(i => !i.status).length }}</div>
                            <div class="stat-label">Faltantes</div>
                        </div>
                    </div>
                    
                    <div class="stat-card stat-info">
                        <div class="stat-icon">
                            <span class="material-icons">filter_list</span>
                        </div>
                        <div class="stat-content">
                            <div class="stat-number">{{ filter_applied.length }}</div>
                            <div class="stat-label">Filtrados</div>
                        </div>
                    </div>
                </div> -->

                <!-- Tabla de Resultados -->
                <div class="table-section">
                    <div class="table-header">
                        <h3 class="table-title">
                            <span class="material-icons">folder_zip</span>
                            Archivos Procesados
                        </h3>
                        <div class="table-info">
                            <span class="info-badge">{{ filter_applied.length }} de {{ items.length }}</span>
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
                                :table-height="500"
                                v-model:items-selected="itemsSelected"
                                table-class-name="modern-table"
                                theme-color="#9c27b0"
                                class="custom-data-table"
                        >
                            <template #item-status_custom="item">
                                <div class="status-container">
                                    <div class="status-indicator" :class="{ 'status-success': item.status, 'status-error': !item.status }">
                                        <IconTable v-if="item.status==false" icon="cancel" color="red"/>
                                        <IconTable v-if="item.status==true" icon="check_circle" color="green"/>
                                        <span class="status-text">{{ item.status ? 'Encontrado' : 'Faltante' }}</span>
                                    </div>
                                </div>
                            </template>
                            
                            <template #item-descomp_custom="item">
                                <div class="status-container">
                                    <div class="status-indicator" :class="{ 'status-success': item.error_zip, 'status-error': !item.error_zip }">
                                        <IconTable v-if="item.error_zip==false" icon="cancel" color="red"/>
                                        <IconTable v-if="item.error_zip==true" icon="check_circle" color="green"/>
                                        <span class="status-text">{{ item.error_zip ? 'Exitoso' : 'Error' }}</span>
                                    </div>
                                </div>
                            </template>
                        </EasyDataTable>
                    </div>
                </div>
            </div>

            <!-- Estado vacío mejorado -->
            <div v-else class="empty-state">
                <div class="empty-icon">
                    <span class="material-icons">folder_open</span>
                </div>
                <h3 class="empty-title">No hay archivos procesados</h3>
                <p class="empty-description">
                    Selecciona una fecha y presiona "Descomprimir" para comenzar el proceso
                </p>
                <div class="empty-actions">
                    <div class="suggested-date">
                        <span class="material-icons">today</span>
                        Fecha sugerida: {{ moment().subtract(1, 'days').format('DD/MM/YYYY') }}
                    </div>
                </div>
            </div>

            <!-- desompresion opcion -->
            <div class="filters-section">
                <div class="date-selector">
                    <label class="modern-label">
                        <span class="label-text">
                            <span class="material-icons label-icon">folder_zip</span>
                            Archivo a descomprimir (FLIO2.ZIP)
                        </span>
                        <input
                            type="date"
                            class="modern-date-input"
                            v-model="dateSelected"
                        />
                        <small class="input-helper">
                            Formato del archivo: FLIO2_{{ moment(dateSelected).format('DDMMYYYY') }}.ZIP
                        </small>
                    </label>
                </div>
                        
                <div class="decompress-button-container">
                    <!-- BOTÓN ORIGINAL DESCOMPRIMIR SIN MODIFICAR -->
                    <ButtonCustom  
                        color="blue" 
                        @click="getKioscosList"
                            tooltip="Descomprimir archivos"
                            :disabled="fileSelected=='0'?true:false">
                            
                            <span  class="material-icons">folder_zip</span>
                                Descomprimir
                    </ButtonCustom>
                </div>
            </div>


        </template>
    </ContainerCustom>
</template>

<style scoped>
.custom-data-table :deep(.vue3-easy-data-table__header th) {
    border-bottom: 2px solid #ff7043;
}
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
    --easy-table-body-row-hover-font-color: #e24c06;
    --easy-table-body-row-hover-background-color: rgba(253, 183, 126, 0.05);
    --easy-table-footer-background-color: #f8fafc;
    --easy-table-footer-font-color: #4a5568;
    --easy-table-footer-font-size: 12px;
    --easy-table-footer-padding: 0px 16px;
    --easy-table-footer-height: 50px;
    --easy-table-scrollbar-track-color: #f1f1f1;
    --easy-table-scrollbar-color: #c1c1c1;
    --easy-table-scrollbar-thumb-color: #da5407;
    --easy-table-scrollbar-corner-color: #f1f1f1;
    --easy-table-loading-mask-background-color: rgba(255, 255, 255, 0.9);
     /* 🆕 BORDER INFERIOR DEL HEADER */
}

</style>

