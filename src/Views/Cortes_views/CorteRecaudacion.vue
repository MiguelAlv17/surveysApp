<script setup> 
import { computed, onMounted, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router'
import ContainerCustom from '../Components/ContainerCustom.vue';
import { alert_error, alert_success } from '../../constants/alerts';
import ButtonTable from '../Components/ButtonTable.vue';
import {useGetDataDvrApp} from '../../composables/useGetDataDvrApp'
import moment from 'moment';
import ButtonCustom from '../Components/ButtonCustom.vue';
import LoaderBtn from '../Components/LoaderBtn.vue';
const {sendingDataCorte} = useGetDataDvrApp()
const router = useRouter()
const route = useRoute()
const headers =ref(  [
    { text: "ID", value: "id_kiosco_recaudacion" },
    { text: "Nombre", value: "name_recaudacion"},
    { text: "Log-mein", value: "alias"},
    { text: "Carpeta", value: "folder_custom"},

]);
const isLoading = ref(false);
const isSending = ref(false);

const items = ref([]) ;
const searchField = ["id", "name_device", "located_at", "status"]; //campos por los que buscara el filtro
const searchInput = ref("");
// tablaefectivo
const headers_efe = ref(  [
    { text: "ID", value: "IDKIOSCO" },
    { text: "Fecha", value: "FECHA"},
    {text:"BILL1ENT",value:"E50"},
    {text:"ENTHOPP1",value:"E10"},
    {text:"ENTHOPP2",value:"E5"}, 
    {text:"ENTHOPP3",value:"E2"},
    {text:"ENTHOPP4",value:"E1"},
    {text:"BILL50P",value:"A50"},
    {text:"HOPP1",value:"A10"},
    {text:"HOPP2",value:"A5"}, 
    {text:"HOPP3",value:"A2"},
    {text:"HOPP4",value:"A1"},
    {text:"BILLREC1000",value:"R1000"},
    {text:"BILLREC500",value:"R500"},
    {text:"BILLREC200",value:"R200"},
    {text:"BILLREC100",value:"R100"},
    {text:"BILLREC050",value:"R50"},
    {text:"BILLREC020",value:"R20"},
    {text:"MONREC20P",value:"RM20"},
    {text:"MONREC10P",value:"RM10"},
    {text:"MONREC05P",value:"RM5"},
    {text:"MONREC02P",value:"RM2"},
    {text:"MONREC01P",value:"RM1"},
    {text:"MONREC50C",value:"RM50C"},
]);
const items_efe = ref([]) ;
const searchField_efe = ["ID","Fecha"]; //campos por los que buscara el filtro
const searchInput_efe = ref("");
// extras
const picked = ref('all');
onMounted(() => {
    showKioscos();
});
const showKioscos = async() => {
    isLoading.value=true
    const ids = JSON.parse(route.query.ids || '[]');
    let idArray = [];
    if (!Array.isArray(ids)) {
        idArray.push(ids);
    } else {
        idArray = ids
    }
    const response  = await window.api.getKioscoById(idArray)
    const {status, data} = response;
    if (status!=200) {
        alert_error("Ooops","Ocurrio un error al cargar los kioscos", 2)
    }
    items.value=data
    await getCorteBykioscos(idArray)
    isLoading.value=false
    
}
const getCorteBykioscos = async(ids_Array) => {
    console.log(ids_Array);
    
    const response = await window.api.getCorteEfectivo(ids_Array)
    const{data,status}=response
    if (status!=200) {
        alert_error("Ooops","Ocurrio un error al cargar los cortes", 2)
        return
    }
    console.log(response);
     items_efe.value = data
    return
}
// const filter_applied = computed(()=>{
//     if(picked.value=='complete') return items.value.filter(i=>i.status==true);
//     if(picked.value=='missing') return items.value.filter(i=>i.status==false);
//     return items.value;
// })
const uploadDataCorte = async() => {
    isSending.value=true
  const formated = items_efe.value.map(e=>{
    e.FECHA= moment(e.FECHA).format('YYYY-MM-DDTHH:mm:ss')
    return e
  })
  console.log(formated);
  
    const response = await sendingDataCorte(formated)
    const {status,data} =response
    isSending.value=false
    if (status!=200) {
        alert_error("Ooops", "ocurrio un error al subir los datos", 2)
        return
    }
    alert_success ("Exito", "Envio correcto de datos");

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
        title="Corte de efectivo"
        subtitle="Subir datos de corte de efectivo de cada kiosco"
        icon="payments"
        header-background="gradient"
        :loading="isLoading || isSending"
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
                    </div>
                </div>
            </div>
            <div class="table-section">
                    <div class="table-header">
                        <h3 class="table-title">
                            <span class="material-icons">desktop_windows</span>
                            Kioscos seleccionados 
                        </h3>
                        <div class="table-info">
                            <span class="info-badge"> Registros: {{ items.length }}</span>
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

            <div class="config-section mt-4">
                <div class="config-card">
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
                    </div>
                </div>
            </div>
            <div class="table-section">
                    <div class="table-header">
                        <h3 class="table-title">
                            <span class="material-icons">payments</span>
                            Corte Efectivo 
                        </h3>
                        <div class="table-info">
                            <span class="info-badge"> Registros: {{ items.length }}</span>
                        </div>
                    </div>

                    <div class="table-container">
                        <EasyDataTable
                             :headers="headers_efe"
                                :items="items_efe"
                                :search-field="searchField_efe"
                                :search-value="searchInput_efe"
                                header-text-direction="center"
                                body-text-direction="center"
                                rows-per-page-message="Registros por pagina"
                                empty-message="Sin Registros"
                                rows-of-page-separator-message="de"
                                alternating
                                buttons-pagination
                                :rows-per-page="25"
                                :table-height="500"
                                table-class-name="modern-table"
                                theme-color="#9c27b0"
                                class="custom-data-table"
                        >
                        </EasyDataTable>
                    </div>
            </div>

            
        </template>
        <template #footer>
            <ButtonCustom color="green" @click="uploadDataCorte" :disabled="items_efe.length==0"
            tooltip="Subir datos a DVRAPP">
                <LoaderBtn v-if="isSending" />
                <span v-else  class="material-icons">cloud_upload</span>
                    Enviar
            </ButtonCustom> 
        </template>
    </ContainerCustom>
</template>
<style scoped>

.config-section {
    margin-bottom: var(--spacing-2xl);
}

.config-card {
    background: var(--bg-glass);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius-lg);
    box-shadow: var(--shadow-sm);
    overflow: hidden;
    transition: all var(--transition-normal);
}

.config-card:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
}

.config-header {
    background: linear-gradient(135deg, #ff7043 0%, #ff5722 100%);
    color: var(--text-white);
    padding: var(--spacing-lg) var(--spacing-xl);
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
}

.config-icon {
    font-size: 20px;
}

.config-title {
    margin: 0;
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-semibold);
}

.config-content {
    padding: var(--spacing-xl);
    display: flex;
    align-items: center;
    gap: var(--spacing-xl);
}

.date-selector {
    flex: 1;
    max-width: 400px;
}

.modern-label {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
    width: 100%;
}

.label-text {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    font-weight: var(--font-weight-semibold);
    color: var(--text-secondary);
    font-size: var(--font-size-sm);
}

.label-icon {
    font-size: 18px;
    color: #ff7043;
}

.modern-date-input {
    width: 100%;
    padding: var(--spacing-md) var(--spacing-lg);
    border: 2px solid var(--border-color-light);
    border-radius: var(--border-radius-md);
    font-size: var(--font-size-sm);
    background: var(--bg-primary);
    color: var(--text-primary);
    transition: all var(--transition-normal);
    outline: none;
}

.modern-date-input:focus {
    border-color: #ff7043;
    box-shadow: 0 0 0 3px rgba(255, 112, 67, 0.1);
}

.input-helper {
    color: var(--text-tertiary);
    font-size: var(--font-size-xs);
    margin-top: var(--spacing-xs);
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
}

.input-helper::before {
    content: 'ℹ️';
    font-size: var(--font-size-xs);
}

.decompress-button-container {
    display: flex;
    align-items: flex-end;
}
/* ===================================
   SECCIÓN DE FILTROS
   =================================== */

.filters-section {
    background: var(--bg-secondary);
    padding: var(--spacing-xl);
    border-radius: var(--border-radius-lg);
    margin-top: var(--spacing-2xl);
    border: 1px solid var(--border-color);
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--spacing-xl);
    flex-wrap: wrap;
}

.search-container {
    flex: 1;
    max-width: 400px;
}

.search-input-group {
    width: 100%;
}

.input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
}

.input-icon {
    position: absolute;
    left: var(--spacing-lg);
    color: var(--text-light);
    font-size: 20px;
    z-index: 2;
    pointer-events: none;
}

.modern-search-input {
    width: 100%;
    padding: var(--spacing-md) var(--spacing-4xl) var(--spacing-md) var(--spacing-4xl);
    border: 2px solid var(--border-color-light);
    border-radius: var(--border-radius-md);
    font-size: var(--font-size-sm);
    background: var(--bg-primary);
    color: var(--text-primary);
    transition: all var(--transition-normal);
    outline: none;
}

.modern-search-input:focus {
    border-color: #ff7043;
    box-shadow: 0 0 0 3px rgba(255, 112, 67, 0.1);
}

.clear-search-btn {
    position: absolute;
    right: var(--spacing-md);
    background: none;
    border: none;
    color: var(--text-light);
    cursor: pointer;
    padding: var(--spacing-xs);
    border-radius: var(--border-radius-sm);
    transition: all var(--transition-normal);
    display: flex;
    align-items: center;
    justify-content: center;
}

.clear-search-btn:hover {
    color: #ff7043;
    background: rgba(255, 112, 67, 0.1);
}

/* ===================================
   SECCIÓN DE TABLA
   =================================== */

.results-section {
    animation: slideUp 0.6s ease-out;
}

.table-section {
    background: var(--bg-primary);
    border-radius: var(--border-radius-lg);
    border: 1px solid var(--border-color);
    box-shadow: var(--shadow-sm);
    overflow: hidden;
    transition: all var(--transition-normal);
}

.table-section:hover {
    box-shadow: var(--shadow-md);
}

.table-header {
    background: var(--bg-secondary);
    padding: var(--spacing-lg) var(--spacing-xl);
    border-bottom: 1px solid var(--border-color);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.table-title {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    margin: 0;
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-semibold);
    color: var(--text-primary);
}

.table-title .material-icons {
    color: #ff7043;
    font-size: 22px;
}

.table-info {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
}

.info-badge {
    background: linear-gradient(135deg, #ff7043 0%, #ff5722 100%);
    color: var(--text-white);
    padding: var(--spacing-xs) var(--spacing-md);
    border-radius: var(--border-radius-sm);
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-semibold);
    box-shadow: var(--shadow-sm);
}

.table-container {
    padding: var(--spacing-lg);
}
.custom-data-table :deep(.vue3-easy-data-table__header th) {
    border-bottom: 2px solid #ff7043;
}

/* Mejoras en accesibilidad */
.btn-filter {
    position: relative;
}

.btn-filter:focus {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
}

.modern-date-input:focus,
.modern-search-input:focus {
    outline: none;
}

/* Estados de hover mejorados */
.empty-state:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
    transition: all var(--transition-normal);
}

.input-helper:hover::before {
    transform: scale(1.2);
    transition: transform var(--transition-normal);
}

/* Indicadores visuales para tipos de archivo */

.config-header {
    position: relative;
}

/* Modo oscuro */
@media (prefers-color-scheme: dark) {
    .config-header {
        background: linear-gradient(135deg, #d84315 0%, #bf360c 100%);
    }

    .stat-card {
        background: rgba(45, 55, 72, 0.95);
        border-color: rgba(255, 255, 255, 0.1);
    }

    .empty-state {
        background: rgba(45, 55, 72, 0.95);
        border-color: rgba(255, 255, 255, 0.1);
    }
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