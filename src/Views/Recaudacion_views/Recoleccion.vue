<script setup>
import { onMounted, ref } from 'vue';
import {useRoute} from 'vue-router'
import moment from 'moment';
import ContainerCustom from '../Components/ContainerCustom.vue';
import { alert_error } from '../../constants/alerts';
import ButtonCustom from '../Components/ButtonCustom.vue';
import LoaderBtn from '../Components/LoaderBtn.vue';
import CardInfo from '../Components/CardInfo.vue';
import { useDynamicCSS } from '../../composables/useDynamicCSS'
useDynamicCSS('./styles/Recoleccion.css')

const route = useRoute();
const isloading = ref(false);
const isModalShow = ref(false);
// progressive bar 
const progressNow = ref(0)
const isUploadingData = ref(false);
const textUploadingData = ref("");
// tabla general
const items = ref([]);
const searchInput = ref("");
const searchField = ["FOLIO", "datetime", "DE_NUMERORECAUDADORA", "LC_MESSAGES",'ID_TRAMITE','SERVICIOHECHO']; //campos por los que buscara el filtro
const headers =ref(  [
    { text: "Fecha", value: "datetime", width: 150 },
    { text: "Folio", value: "FOLIO" },
    // { text: "Recaudadora", value: "DE_NUMERORECAUDADORA" , width: 400},
    { text: "Linea Cap", value: "LC_MESSAGES" },
    { text: "Id tramite", value: "ID_TRAMITE" ,sortable: true },
    { text: "Servicio hecho", value: "SERVICIOHECHO" },
    { text: "Tipo pago", value: "TIPOPAGO" },
    { text: "Total", value: "TOTAL" },

]);
// tabla de conteo de registros
const items_records = ref([]);
const searchInput_records = ref("");
const searchField_records = ["id", "alias", "records",]; //campos por los que buscara el filtro
const headers_records =ref(  [
    { text: "ID", value: "id" },
    { text: "Nombre", value: "alias" },
    { text: "Total registros", value: "records" },
    { text: "Total recaudado", value: "cash_custom" },

]);
// datetime pickers
const formatMoment = ref("YYYY-MM-DD");
const dateFrom = ref(moment().subtract(1, 'days').format(formatMoment.value));
const dateTo = ref(moment().format(formatMoment.value));
// extras
const totalEfectivo = ref(0);
const totalCredito = ref(0);
onMounted( () => {
    showKioscos()
    window.api.receive('upload-progress', (percent) => {
        progressNow.value = percent;
    });
});

const showKioscos = async() => {
    isloading.value=true;
    const ids = JSON.parse(route.query.ids || '[]');
    let idArray = [];
    if (!Array.isArray(ids)) {
        idArray.push(ids);
    }else{
        idArray = ids
    }
    const response  = await window.api.getKioscoById(idArray)
    const {status, data} = response;
    const recordsKioscos = data.map(e=>{
        return {
            id:e.id,
            alias:e.alias,
            records : 0,
            cash : 0
        }
    })
    items_records.value = recordsKioscos;
    isloading.value=false;
}

const getRecordsTbl = async() => {
    isloading.value=true;
    const ids = JSON.parse(route.query.ids || '[]');
    let idArray = [];
    if (!Array.isArray(ids)) {
        idArray.push(ids);
    }else{
        idArray = ids
    }
    const response = await window.api.getRecords(idArray, moment(dateFrom.value).format('YYYY.MM.DD'), moment(dateTo.value).format('YYYY.MM.DD') );
    console.log(response);
    const {status,data,records} = response;
    if (status!=200) {
        console.log(data);
        alert_error("ocurrio un error al cargar los datos")
        isloading.value=false
        return
    }
    const recordsKioscos = records.map(e=>{
        return {
            id:e.id,
            alias:e.alias,
            records : e.numberRecords.TOTAL,
            cash : e.cashCollected.TOTAL_RECAUDACION

        }
    })
    items_records.value = recordsKioscos;
    items.value = data;

    totalRecaudado();
    isloading.value=false
}

const subirProd = async() => {
    isUploadingData.value= true;
    progressNow.value = 0;
    isModalShow.value=true;
    textUploadingData.value="Espera hasta cargar los registros..."

    const safeItems = JSON.parse(JSON.stringify(items.value));
    const data_format = safeItems.map(i=>{
        i.HORA=stringToUtcTime(i.HORA);
        i.FECHAHORA = new Date(i.FECHAHORA.replace(" ", "T") + "Z");
        return i
    })
    const response = await window.api.invoke('subir-datos', data_format);
    textUploadingData.value="Ahora puedes continuar"
    isUploadingData.value= false;
}
    const  stringToUtcTime = (str) => {
        const time = str.split(" ")[1]
        const [h, m, s = 0] = time.split(':').map(Number);
        return new Date(Date.UTC(1970, 0, 1, h, m, s));
    }
    const totalRecaudado = () => {
        totalEfectivo.value = items.value.reduce(
            (acumulador, objeto) => {
                if (objeto.TIPOPAGO == "EFECTIVO") {
                    return acumulador + (objeto.TOTAL || 0);
                }
                return acumulador;
            }, 0)
        totalCredito.value = items.value.reduce(
            (acumulador, objeto) => {
                if (objeto.TIPOPAGO.toUpperCase().includes("TARJETA")) {
                    return acumulador + (objeto.TOTAL || 0);
                }
                return acumulador;
            }, 0)    
    }
    function formatearMoneda(cantidad) {
        return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(cantidad);
    }
</script>

<template>
    <!-- <Loader v-if="isloading"/> -->
    
    <ContainerCustom 
        title="PASO 2 RECUPERACION DE DATOS"
        subtitle="Selecciona el rango de fechas y recupera los registros de recaudación"
        icon="cloud_download"
        header-background="gradient"
        :loading="isloading"
    >
        <template #body>
            <!-- Sección de Filtros de Fecha -->
            <div class="date-filters-section">
                <div class="filters-card">
                    <div class="filters-header">
                        <span class="material-icons filter-icon">date_range</span>
                        <h3 class="filters-title">Rango de Fechas</h3>
                    </div>
                    
                    <div class="filters-content">
                        <div class="date-input-group">
                            <label class="modern-label">
                                <span class="label-text">
                                    <span class="material-icons label-icon">event</span>
                                    Desde
                                </span>
                                <input
                                    type="date"
                                    class="modern-date-input"
                                    v-model="dateFrom"
                                />
                            </label>
                        </div>
                        
                        <div class="date-separator">
                            <span class="material-icons">arrow_forward</span>
                        </div>
                        
                        <div class="date-input-group">
                            <label class="modern-label">
                                <span class="label-text">
                                    <span class="material-icons label-icon">event</span>
                                    Hasta
                                </span>
                                <input
                                    type="date"
                                    class="modern-date-input"
                                    v-model="dateTo"
                                />
                            </label>
                        </div>
                        
                        <div class="search-button-container">
                            <!-- BOTÓN ORIGINAL BUSCAR SIN MODIFICAR -->
                            <!-- <button class="btn btn-sm btn-primary d-flex"
                                @click="getRecordsTbl">
                                <span class="material-icons">
                                    search
                                </span>
                                Buscar
                            </button> -->
                            <ButtonCustom  
                                color="blue" @click="getRecordsTbl" 
                                    tooltip="Buscar registros">
                                    <LoaderBtn v-if="isUploadingData"/>
                                    <span v-else class="material-icons">search</span>
                                        Buscar
                            </ButtonCustom>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Sección de Tablas -->
              <div class="tables-section">
                <!-- Tabla Lateral de Kioscos -->
                <div class="sidebar-table-container">
                    <div class="table-card sidebar-card">
                        <div class="table-header">
                            <h3 class="table-title">
                                <span class="material-icons">desktop_windows</span>
                                Kioscos Seleccionados
                            </h3>
                            
                            <!-- Barra de búsqueda lateral -->
                            <div class="search-container ">
                                <div class="search-input-wrapper">
                                    <label class="search-label">Filtrar registros:</label>
                                    <div class="input-wrapper">
                                        <span class="material-icons input-icon">search</span>
                                        <input 
                                            v-model="searchInput_records"
                                            type="text"
                                            class="modern-search-input "
                                            placeholder="Filtrar kioscos..."
                                        />
                                        <button 
                                            v-if="searchInput_records" 
                                            @click="searchInput_records = ''"
                                            class="clear-search-btn"
                                            type="button"
                                        >
                                            <span class="material-icons">close</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                        </div>

                        <div class="table-body">
                            <EasyDataTable
                                :headers="headers_records"
                                :items="items_records"
                                :search-field="searchField_records"
                                :search-value="searchInput_records"
                                header-text-direction="center"
                                body-text-direction="center"
                                rows-per-page-message="Registros por pagina"
                                empty-message="Sin Registros"
                                rows-of-page-separator-message="de"
                                alternating
                                buttons-pagination
                                :rows-per-page="25"
                                :table-height="450"
                                sort-by="records"
                                sort-type="asc"
                                table-class-name="modern-table"
                                theme-color="#667eea"
                                class="custom-data-table sidebar-table"
                            >
                                <template #item-records="item">
                                    <div class="records-cell">
                                        <span class="records-count">{{ item.records }} </span>
                                    </div>
                                </template>
                                <template #item-cash_custom="item">
                                    <div class="records-cell">
                                        <span class="records-count">$ {{ item.cash }} </span>
                                    </div>
                                </template>
                            </EasyDataTable>
                        </div>
                    </div>
                </div>
            </div>
            <div class="tables-section">
                <!-- Tabla Principal de Registros -->
                <div class="main-table-container">
                    <div class="table-card">
                        <div class="table-header">
                            <div class="header-content">
                                <h3 class="table-title">
                                    <span class="material-icons">receipt_long</span>
                                    Registros de Recaudación
                                </h3>
                                <div class="table-info">
                                    <span class="info-badge">{{ items.length }} registros</span>
                                </div>
                            </div>
                            
                            <!-- Barra de búsqueda -->
                            <div class="search-container">
                                <div class="search-input-wrapper">
                                    <label class="search-label">Filtrar registros:</label>
                                    <div class="input-wrapper">
                                        <span class="material-icons input-icon">search</span>
                                        <input 
                                            v-model="searchInput"
                                            type="text"
                                            class="modern-search-input"
                                            placeholder="Buscar por folio, recaudadora, tramite..."
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
                                :table-height="450"
                                table-class-name="modern-table"
                                theme-color="#008aff"
                                class="custom-data-table"
                            >
                                <template #item-datetime="item">
                                    <div class="datetime-cell">
                                        <span class="date-part">{{ moment(item.FECHAHORA).format('DD/MM/YYYY') }}</span>
                                        <span class="time-part">{{ moment(item.FECHAHORA).format('HH:mm') }}</span>
                                    </div>
                                </template>
                                
                                <template #item-TOTAL="item">
                                    <div class="total-cell">
                                        <span class="currency">$</span>
                                        <span class="amount">{{ item.TOTAL }}</span>
                                    </div>
                                </template>
                                <template #expand="item">
                                    {{item.DE_NUMERORECAUDADORA}}
                                </template>
                            </EasyDataTable>
                        </div>
                    </div>
                </div>

                
            </div>
           
            <!-- seccion estadisticas -->
            <div class="results-section">
                <div class="info-cards">
                <CardInfo 
                    title="Total Efectivo" 
                    :subtitle="formatearMoneda(totalEfectivo)"
                    icon="monetization_on"
                    color="green"
                    size="normal"
                    :animated="true"
                />
                <CardInfo 
                    title="Total Tarjetas" 
                    :subtitle="formatearMoneda(totalCredito)"
                    icon="monetization_on"
                    color="blue"
                    size="normal"
                    :animated="true"
                />
                <CardInfo 
                    title="Total " 
                    :subtitle="formatearMoneda((totalCredito + totalEfectivo))"
                    icon="monetization_on"
                    color="purple"
                    size="normal"
                    :animated="true"
                />
                </div>
            </div>
        </template>
        
        <template #footer>
            <div class="footer-content">
                <div class="footer-info">
                    <span class="material-icons">info</span>
                    <div class="info-text">
                        <span class="info-title">Datos Recuperados</span>
                        <span class="info-description">
                            {{ items.length }} registros encontrados de {{ items_records.length }} kioscos
                        </span>
                    </div>
                </div>
                
                <div class="footer-actions">
                    <!-- BOTÓN ORIGINAL SUBIR SIN MODIFICAR -->
                    <!-- <button  class="btn btn-success d-flex" 
                        @click="subirProd"
                        style="justify-content: center;">
                        Subir
                        <span class="material-icons">
                        arrow_forward
                        </span>
                    </button> -->
                      <ButtonCustom color="green" @click="subirProd" :disabled="(isUploadingData || items.length ==0) "
                        tooltip="Subir registros a BD centralizada">
                        <LoaderBtn v-if="isUploadingData"/>
                        <span v-else class="material-icons">cloud_upload</span>
                            Subir datos
                        </ButtonCustom>
                </div>
            </div>
        </template>
    </ContainerCustom>
    
    <!-- Modal de Progreso Modernizado -->
    <div v-if="isModalShow" class="modern-modal-overlay">
        <div class="modern-modal">
            <div class="modal-header">
                <div class="header-icon">
                    <span class="material-icons">cloud_upload</span>
                </div>
                &nbsp;
                <h2 class="modal-title">Subiendo Registros</h2>
            </div>
            
            <div class="modal-body">
                <div class="progress-section">
                    <div class="progress-info">
                        <span class="progress-label">Progreso de carga</span>
                        <span class="progress-percentage">{{ progressNow }}%</span>
                    </div>
                    
                    <div class="progress-bar-container">
                        <div class="progress-bar">
                            <div 
                                class="progress-fill"
                                :style="{ width: progressNow + '%' }"
                            ></div>
                        </div>
                    </div>
                    
                    <div class="progress-status">
                        <span class="status-text">{{ textUploadingData }}</span>
                        <div v-if="isUploadingData" class="status-spinner">
                            <div class="spinner"></div>
                        </div>
                    </div>
                </div>
                
                <div class="modal-actions" v-if="!isUploadingData">
                    <ButtonCustom  v-if="!isUploadingData"
                    color="purple" @click="isModalShow=false" 
                        tooltip="Cerrar modal">
                        <LoaderBtn v-if="isUploadingData"/>
                        <span v-else class="material-icons">check_circle</span>
                            Cerrar
                    </ButtonCustom>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.info-cards {
    display: flex;
    /* grid-template-columns: repeat(2, 1fr); */
    gap: var(--spacing-lg);
    margin-bottom: var(--spacing-xl);
}
.results-section {
    background: var(--bg-glass);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius-lg);
    padding: var(--spacing-xl);
    box-shadow: var(--shadow-sm);
}
.custom-data-table :deep(.vue3-easy-data-table__header th) {
    border-bottom: 2px solid #099910;
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
    --easy-table-body-row-hover-font-color: #079425;
    --easy-table-body-row-hover-background-color: rgba(102, 234, 168, 0.05);
    --easy-table-footer-background-color: #f8fafc;
    --easy-table-footer-font-color: #4a5568;
    --easy-table-footer-font-size: 12px;
    --easy-table-footer-padding: 0px 16px;
    --easy-table-footer-height: 50px;
    --easy-table-scrollbar-track-color: #f1f1f1;
    --easy-table-scrollbar-color: #c1c1c1;
    --easy-table-scrollbar-thumb-color: #099910;
    --easy-table-scrollbar-corner-color: #f1f1f1;
    --easy-table-loading-mask-background-color: rgba(255, 255, 255, 0.9);
}
</style>