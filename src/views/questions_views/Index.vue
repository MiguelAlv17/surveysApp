<script setup>
import { onMounted, reactive, ref, version } from 'vue';
import { useRouter,useRoute } from 'vue-router'
const route = useRoute();
import ContainerCustom from '../../components/ContainerCustom.vue';
import BtnTable from '../../components/TableButtons/BtnTable.vue';
import ModernButton from '../../components/ModernButtons/ModernButton.vue';
import CardInfo from '../../components/CardInfo.vue';
import { utils, writeFileXLSX } from 'xlsx';
import { alertError, alertSuccess, alertWarning } from '../../constantes/alerts';
import moment from 'moment';
import {useGetDataSurveys} from '../../composables/getDataSurveys'
const {getSurveyByid}=useGetDataSurveys()
const isExporting = ref(false);
const isloading =ref(false);
const headers = ref([
    { text: "ID", value: "id", sortable: true },
    { text: "Campo", value: "textoPregunta", sortable: true },
    { text: "Tipo", value: "tipoPregunta", sortable: true },
    { text: "Obligatoria", value: "obligatory", sortable: true },
    { text: "Acciones", value: "actions", sortable: true },
]);
const items = ref([ ]);
const searchField = ["dvr_id_kiosco", "name_device", "alias", "tipoKiosco"]; //campos por los que buscara el filtro
const searchInput = ref(""); // variable para el filtro
const filterSearch = ref('');

const surveyData = reactive({
    id:0,
    titulo:"",
    descripcion:"",
    fechaCreacion:"",
    nombreCreador:""
});
onMounted( () => {
    const idK = route.params.idSurvey
    getSurveyInfo(idK)
});

const getSurveyInfo = async(id_survey) => {
    isloading.value=true;
    const response = await getSurveyByid(id_survey)
    const {data,status}=response
    if (status!=200) {
        alertError("Error","Ocurrio un error al cargar la informacion de la encuesta", 3)
    }
    console.log(response);
    isloading.value=false
    const {id, titulo, descripcion, fechaCreacion, nombreCreador,preguntas} =data.data
    surveyData.id=id;
    surveyData.titulo=titulo,
    surveyData.descripcion=descripcion
    surveyData.fechaCreacion=moment(fechaCreacion).format('DD/MM/YYYY H:mm a')
    surveyData.nombreCreador=nombreCreador
    items.value=preguntas
}
const exportToExcel = () => {
    try {
        isExporting.value = true;
        
        let dataToExport = items.value;
        // Filtrar los datos según el filtro actual (si existe)
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
            'ID':item.id,
            'Pregunta':item.textoPregunta,
            'Tipo pregunta': item.tipoPregunta,
            'Obligatoria':item.obligatoria ?'Si':'No'
        }));
         
        // Crear workbook y worksheet
        const wb = utils.book_new();
        const ws = utils.json_to_sheet(excelData);
        
        // Configurar ancho de columnas
        const colWidths = [
            { wch: 15 }, // id
            { wch: 25 }, // nombre
            { wch: 30 }, // total respuestas
            { wch: 25 }  // elaborada
        ];
        ws['!cols'] = colWidths;
        
        // Agregar hoja al workbook
        utils.book_append_sheet(wb, ws, "Questions List");
        
        // Generar nombre del archivo con fecha actual
        const fileName = `QuestionsList_${moment().format('YYYY-MM-DD_HH-mm')}.xlsx`;
        
        // Descargar el archivo
        writeFileXLSX(wb, fileName);
        
        alertWarning("Generando archivo excel","generando",4);
        
    } catch (error) {
        console.error('Error al exportar:', error);
        alertError("Error al exportar el archivo Excel");
    } finally {
        isExporting.value = false;
    }
}
</script>

<template>
    <div >
        <ContainerCustom 
        title="Preguntas" 
        subtitle="Listado de Preguntas de la encuesta" 
        :loading="isloading||isExporting"
        icon="file_present">
            <template v-slot:body>
                <div class="form-info-section">
                <div class="info-card">
                    <div class="info-header">
                        <span class="material-icons info-icon">info</span>
                        <h3 class="info-title">Información de la encuesta</h3>
                    </div>
                    <div class="info-content">
                        <div class="info-grid">
                            <div class="info-item">
                                <span class="material-icons">numbers</span>
                                <span>{{ surveyData.id }}</span>
                            </div>
                            <div class="info-item">
                                <span class="material-icons">title</span>
                                <span>{{ surveyData.titulo }}</span>
                            </div>
                            <div class="info-item">
                                <span class="material-icons">description</span>
                                <span>{{ surveyData.descripcion }}</span>
                            </div>
                            <div class="info-item">
                                <span class="material-icons">assignment_ind</span>
                                <span>{{ surveyData.nombreCreador }}</span>
                            </div>
                            <div class="info-item">
                                <span class="material-icons">calendar_month</span>
                                <span>{{ surveyData.fechaCreacion }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
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
                        :table-height="450"
                        buttons-pagination
                        table-class-name="modern-table"
                        theme-color="#667eea"
                        class="custom-data-table"
                    >
                    <template #item-obligatory="item">
                        <span v-if="item.obligatoria==true" class="material-icons text-danger-custom">
                        check_circle
                        </span>
                        <span v-else  class="material-icons text-success-custom">
                        cancel
                        </span>

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
                        <span>registros en total</span>
                    </div>
                    <div class="footer-actions">
                        <span class="last-update">Última actualización: </span>
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


   

</template>
<style scoped>
.text-danger-custom{
 color: var(--danger-dark);
}
.text-success-custom{
    color: var(--success-dark);
}
/* ===================================
   SECCIÓN DE INFORMACIÓN
   =================================== */

.form-info-section {
    margin-bottom: var(--spacing-2xl);
}

.info-card {
    background: var(--bg-glass);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius-lg);
    box-shadow: var(--shadow-sm);
    overflow: hidden;
    transition: all var(--transition-normal);
}

.info-card:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
}

.info-header {
    background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
    color: var(--text-white);
    padding: var(--spacing-lg) var(--spacing-xl);
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
}

.info-icon {
    font-size: 20px;
}

.info-title {
    margin: 0;
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-semibold);
}

.info-content {
    padding: var(--spacing-xl);
}

.info-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-lg);
}

.info-item {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
}

.info-item .material-icons {
    font-size: 18px;
    color: var(--primary-color);
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
    --easy-table-scrollbar-thumb-color: #43aaff;
    --easy-table-scrollbar-corner-color: #f1f1f1;
    
    --easy-table-loading-mask-background-color: rgba(37, 43, 65, 0.9);
    }
    .text-danger-custom{
        color: var(--danger-light);
    }
    .text-success-custom{
        color: var(--success-light);
    }
    /* card */
    .info-card {
        background: var(--bg-dark);
        border: 1px solid var(--border-color-medium);
        border-radius: var(--border-radius-lg);
    }
    .info-header {
        background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
        color: var(--text-white);
    }

    .info-item {
        color: var(--text-light);
    }

    .info-item .material-icons {
        color: var(--primary-color);
    }
    .search-section{
        background: var(--bg-dark)!important;
        border: 1px solid var(--border-color-medium)!important;

    }
}
</style>