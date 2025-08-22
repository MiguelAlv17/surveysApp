<script setup>
import { ref, onMounted, computed } from 'vue';
import EasyDataTable from 'vue3-easy-data-table';
import moment from 'moment';
import { useRouter } from 'vue-router'
import { alertError, alertSuccess } from '../../constantes/alerts';
import ContainerCustom from '../../components/ContainerCustom.vue';
import ModernButton from '../../components/ModernButtons/ModernButton.vue';
import ModalCustom from '../../components/ModalCustom.vue';
import BtnTable from '../../components/TableButtons/BtnTable.vue';
import LoaderBtn from '../../components/LoaderBtn.vue';
import '../../assets/styles/table.css';
import '../../assets/styles/home.css'
import {tableHeigh} from '../../constantes/api_constants'
import { utils, writeFileXLSX } from 'xlsx';
import {useGetDataSurveys} from '../../composables/getDataSurveys'
// compsoables
const {getSurveysList} =useGetDataSurveys()
const router = useRouter();

// tablas
const headers = ref([
    { text: "Clave", value: "id", sortable: true },
    { text: "Nombre", value: "titulo", sortable: true },
    { text: "Descripcion", value: "descripcion", sortable: true },
    { text: "Elaborada por", value: "nombreCreador", sortable: true },
    { text: "Elaborada el dia", value: "fechaFormated", sortable: true },
    { text: "Acciones", value: "actions", sortable: true },
]);
const items = ref([
{ id: "0075", nombre: "Kioscos oxxos", created_at: "18/11/2025", responses: '78',},
]);
const searchField = ["dvr_id_kiosco", "name_device", "alias", "tipoKiosco"]; //campos por los que buscara el filtro
const searchInput = ref(""); // variable para el filtro
const filterSearch = ref('');
// loaders
const isloading = ref(false);
const isOpenning = ref(false);
const isExporting = ref(false); // Nuevo loader para exportación
// extras
const updated_at = ref(null);
const dateFormat='DD/MM/YYYY hh:mm:ss'
const modalShow = ref(false);
const deviceSelected = ref(0);
const roleId = ref(0);
// functions
onMounted( () => {
    roleId.value = localStorage.getItem('userRole');
    getList()
});
const getList = async() => {
    isloading.value = true;
    const response = await getSurveysList()
    console.log(response);
    
    isloading.value = false;
    updated_at.value = moment().format(dateFormat)
    const {status,data} = response
    if (status!=200) {
        alertError("Ocurrio un error al cargar los datos")
        return
    }

    items.value = data.data.map(i=>{
        i.fechaFormated= moment(i.fechaCreacion).format('DD/MM/YYYY hh:mm a')
        return i
    });
}
const addnewDvr = () => {
    router.push("/dvr/add")
}
const redirectToEdit = (item) => {
    const route_to = `/surveys/edit/${item.id}`;
     router.push(route_to)
}
const openingDvr = async() => {
    isOpenning.value=true;
    // deviceSelected.value
    // const response = await 
    const request = {
        id_kiosco:deviceSelected.value.dvr_id_kiosco,
        id_dvr:deviceSelected.value.dvr_id,
        solicito:1
    }
    const response = await openDvr(request);
    const{status}=response
    modalShow.value=false;
    isOpenning.value=false;
    if (status!=200) {
        alertError("Oops!", "Ocurrio un abrir al enviar la solicitud de apertura")
        return
    }
    alertSuccess("Apertura realizada")
}

const exportToExcel = () => {
    try {
        isExporting.value = true;
        
        // Filtrar los datos según el filtro actual (si existe)
        let dataToExport = items.value;
        
        if (searchInput.value && searchInput.value.trim() !== '') {
            const searchTerm = searchInput.value.toLowerCase();
            dataToExport = items.value.filter(item => {
                return searchField.some(field => {
                    const fieldValue = item[field];
                    return fieldValue && fieldValue.toString().toLowerCase().includes(searchTerm);
                });
            });
        }
        
        // Preparar los datos para Excel (excluir columna de acciones)
        const excelData = dataToExport.map(item => ({
            'ID': item.id,
            'Titulo': item.titulo,
            'Descripccion': item.descripcion,
            'Elaborada por': item.nombreCreador,
            'Elaborada el dia': item.fechaFormated
        }));
        
        // Crear workbook y worksheet
        const wb = utils.book_new();
        const ws = utils.json_to_sheet(excelData);
        
        // Configurar ancho de columnas
        const colWidths = [
            { wch: 15 }, // id
            { wch: 25 }, // nombre
            { wch: 45 }, // total respuestas
            { wch: 25 }  // elaborada
        ];
        ws['!cols'] = colWidths;
        
        // Agregar hoja al workbook
        utils.book_append_sheet(wb, ws, "Surveys List");
        
        // Generar nombre del archivo con fecha actual
        const fileName = `SurveysList_${moment().format('YYYY-MM-DD_HH-mm')}.xlsx`;
        
        // Descargar el archivo
        writeFileXLSX(wb, fileName);
        
        alertSuccess("Archivo Excel Generado exitosamente");
        
    } catch (error) {
        console.error('Error al exportar:', error);
        alertError("Error al exportar el archivo Excel");
    } finally {
        isExporting.value = false;
    }
}
</script>
<template>
    <!-- <Loading v-if="isloading"></Loading> -->
    <div >
        <ContainerCustom 
        title="Encuestas" 
        subtitle="Listado de usuarios con sus encuestas" 
        :loading="isloading"
        icon="file_present">
            <template v-slot:body>
                
                <!-- Search and Actions Section -->
                <div class="search-and-actions">
                    <div class="search-section">
                        <div class="search-container">
                            <div class="search-input-wrapper">
                                <label class="search-label">Buscar:</label>
                                <div class="input-group">
                                    <div class="input-icon">
                                        <span class="material-icons">search</span>
                                    </div>
                                    <input 
                                        v-model="searchInput"
                                        type="text"
                                        class="search-input"
                                        placeholder="Filtrar por coincidencia..."
                                    />
                                    <button 
                                        v-if="searchInput" 
                                        @click="searchInput = ''"
                                        class="clear-search"
                                        type="button"
                                    >
                                        <span class="material-icons">close</span>
                                    </button>
                                </div>
                            </div>
                            <div class="search-actions">
                                <ModernButton  
                                    color="green" 
                                    :function="exportToExcel"
                                    :disabled="isExporting || items.length === 0"
                                    tooltip="Exportar a Excel"
                                >
                                    <LoaderBtn v-if="isExporting"/>
                                    <span v-else class="material-icons">file_download</span>
                                    {{ isExporting ? 'Exportando...' : 'Exportar Excel' }}
                                </ModernButton>
                                <!-- <ModernButton  v-if="roleId==1"
                                    color="blue" 
                                    :function="addnewDvr"
                                    tooltip="Agregar nuevo registro"
                                >
                                    <span class="material-icons">add</span>
                                    Agregar
                                </ModernButton> -->
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Table Section -->
                <div class="table-section">
                    <EasyDataTable 
                        :headers="headers" 
                        :items="items"
                        :search-field="searchField"
                        :search-value="searchInput"
                        header-text-direction="center"
                        body-text-direction="center"
                        rows-per-page-message="Registros por página"
                        empty-message="Sin registros disponibles"
                        rows-of-page-separator-message="de"
                        alternating
                        :table-height="tableHeigh"
                        buttons-pagination
                        table-class-name="modern-table"
                        theme-color="#667eea"
                        class="custom-data-table"
                    >
                    <template #item-lastupdated="item">
                        {{ moment(item.last_updated).format('DD/MM/YYYY hh:mm a') }}

                    </template>
                    <template #item-actions="item" >
                         <!-- <BtnTable 
                            color="purple" 
                            @function="openModal(item)"
                            tooltip="Solicitud de apertura"
                        >
                            <span class="material-icons">meeting_room</span>
                        </BtnTable> -->
                        <BtnTable 
                        class="ms-2"
                        color="purple" 
                        @function="redirectToEdit(item)"
                            tooltip="Editar registro"
                        >
                            <span class="material-icons">edit</span>
                        </BtnTable>
                    </template>
                </EasyDataTable>

                </div>

            </template>
            <template v-slot:footer>
                <div class="footer-content">
                    <div class="footer-info">
                        <span class="material-icons">info</span>
                        <span>{{ items.length }} registros en total</span>
                    </div>
                    <div class="footer-actions">
                        <span class="last-update">Última actualización: {{ updated_at }}</span>
                         <ModernButton 
                            color="lile" 
                            :function="getList"
                            tooltip="Recargar la tabla"
                        >
                            <span class="material-icons">update</span>
                        </ModernButton>
                    </div>
                </div>
            </template>
        </ContainerCustom>
    </div>


    <!--MODAL DE APERTURA DE PUERTA  -->
    <ModalCustom 
         v-model:show="modalShow"
        title="Confirmacion de apertura DVR"
        icon="meeting_room"
        :width="40"
        maxWidth="800px"
        :closable="false"
        >
        <template #body>
            <h6>Esta seguro de <strong>abrir</strong> la puerta del DVR?</h6>
            <small class="text-secondary">La accion no podra deshacerse</small>
        </template>
        
        <template #footer>
            <ModernButton color="lile" @click="modalShow = false">
            Cancelar
            </ModernButton>
            <ModernButton color="green" @click="openingDvr" :disabled="isOpenning">
            <LoaderBtn v-if="isOpenning"/>
            <span v-else class="material-icons">login</span>
                Apertura
            </ModernButton>
        </template>
    </ModalCustom>


</template>
<style scoped>

:deep(.modern-table) {

    --easy-table-header-font-size: 14px;
    --easy-table-header-height: 50px;
    --easy-table-header-font-color: #4a5568;
    --easy-table-header-background-color: #f8fafc;
    
    --easy-table-body-even-row-font-color: #4a5568;
    --easy-table-body-even-row-background-color: #ffffff;
    
    --easy-table-body-row-font-color: #4a5568;
    --easy-table-body-row-background-color: #f8fafc;
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

@media (prefers-color-scheme: dark) {
    .custom-data-table :deep(.vue3-easy-data-table__header th) {
        border-bottom: 2px solid #43aaff;
    }
    :deep(.modern-table) {
    --easy-table-border: 1px solid #222e3d;
    --easy-table-row-border: 1px solid #2c4453;

    --easy-table-header-font-color: #babfc9;
    --easy-table-header-background-color: #1c2935;
    
    --easy-table-body-even-row-font-color: #c0c5ce;
    --easy-table-body-even-row-background-color: #263646;
    
    --easy-table-body-row-font-color: #9da1a7;
    --easy-table-body-row-background-color: rgb(32, 47, 75);

    --easy-table-body-row-hover-font-color: #9899a0;
    --easy-table-body-row-hover-background-color: rgba(179, 179, 179, 0.096);
    
    --easy-table-footer-background-color: #243649;
    --easy-table-footer-font-color: #acacad;
    
    --easy-table-scrollbar-track-color: #f1f1f1;
    --easy-table-scrollbar-color: #c1c1c1;
    --easy-table-scrollbar-thumb-color: #667eea;
    --easy-table-scrollbar-corner-color: #f1f1f1;
    
    --easy-table-loading-mask-background-color: rgba(37, 43, 65, 0.9);
    }
}
</style>