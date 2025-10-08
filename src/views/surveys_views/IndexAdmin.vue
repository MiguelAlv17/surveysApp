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
const items = ref( [ ] );
const searchField = ["id", "titulo", "descripcion", "nombreCreador"]; //campos por los que buscara el filtro
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
const addnewSurvey = () => {
    router.push("/surveys/add")
}
const deleteSurvey = () => {
  alertSuccess("Oops", "Trabajo en proceso", 3)
}
const filteredItems = computed(() => {
    if (!searchInput.value || searchInput.value.trim() === '') {
        return items.value;
    }
    
    const searchTerm = searchInput.value.toLowerCase();
    return items.value.filter(item => {
        return searchField.some(field => {
            const fieldValue = item[field];
            return fieldValue && fieldValue.toString().toLowerCase().includes(searchTerm);
        });
    });
});

// Función para formatear tipos de usuario
const formatUserType = (tipo) => {
    const tipos = {
        'facilitador': 'Facilitador',
        'asesor': 'Asesor',
        'administrador': 'Administrador'
    };
    return tipos[tipo] || tipo;
};

// Función para ver detalles (por ahora solo log)
const viewDetails = (survey) => {
    console.log('Ver detalles de:', survey);
    let ruta =`/surveys/details&results/${survey.id}`
    router.push(ruta)

    // Aquí puedes agregar la navegación o modal más adelante
};

</script>
<template>
    <ContainerCustom 
        title="Encuestas" 
        subtitle="Listado de las encuestas existentes" 
        :loading="isloading"
        icon="file_present"
        :width="80"
    >
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
                            <ModernButton  
                                color="blue" 
                                :function="addnewSurvey"
                                tooltip="Agregar nuevo registro"
                            >
                                <span class="material-icons">add</span>
                                Agregar
                            </ModernButton>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Cards Section -->
            <div class="cards-section">
                <!-- Empty State -->
                <div v-if="filteredItems.length === 0" class="empty-state">
                    <div class="empty-content">
                        <span class="material-icons empty-icon">folder_open</span>
                        <h3>No se encontraron encuestas</h3>
                        <p v-if="searchInput">
                            No hay resultados para "{{ searchInput }}"
                        </p>
                        <p v-else>
                            Comienza creando tu primera encuesta
                        </p>
                    </div>
                </div>

                <!-- Cards Grid -->
                <div v-else class="cards-grid">
                    <div 
                        v-for="survey in filteredItems" 
                        :key="survey.id"
                        class="survey-card"
                    >
                        <!-- Card Header -->
                        <div class="card-header">
                            <div class="card-icon">
                                <span class="material-icons">assignment</span>
                            </div>
                            <div class="card-id">
                                <span class="id-label">#ID</span> &nbsp;
                                <span class="id-value">{{ survey.id }}</span>
                            </div>
                        </div>

                        <!-- Card Body -->
                        <div class="card-body">
                            <div class="info-item">
                                <span class="material-icons info-icon">title</span>
                                <div class="info-content">
                                    <span class="info-label">Titulo: </span>
                                    <h3 class="card-title">{{ survey.titulo }}</h3>
                                </div>
                            </div>
                            <div class="info-item">
                                <span class="material-icons info-icon">description</span>
                                <div class="info-content">
                                    <p class="card-description">{{ survey.descripcion }}</p>
                                </div>
                            </div>
                            <!-- Info Grid -->
                                <div class="info-item">
                                    <span class="material-icons info-icon">person</span>
                                    <div class="info-content">
                                        <span class="info-label">Creada por</span>
                                        <span class="info-value">{{ survey.nombreCreador }}</span>
                                    </div>
                                </div>
                            <div class="info-item">
                                <span class="material-icons info-icon">calendar_today</span>
                                <div class="info-content">
                                    <span class="info-label">Fecha</span>
                                    <span class="info-value">{{ survey.fechaFormated }}</span>
                                </div>
                            </div>    
                            <!-- <div class="card-info-grid">
                                <div class="info-item">
                                    <span class="material-icons info-icon">person</span>
                                    <div class="info-content">
                                        <span class="info-label">Creada por</span>
                                        <span class="info-value">{{ survey.nombreCreador }}</span>
                                    </div>
                                </div>

                                <div class="info-item">
                                    <span class="material-icons info-icon">calendar_today</span>
                                    <div class="info-content">
                                        <span class="info-label">Fecha</span>
                                        <span class="info-value">{{ survey.fechaFormated }}</span>
                                    </div>
                                </div>
                            </div> -->

                            <!-- Tipos de Usuario Permitidos -->
                            <div class="card-permissions">
                                <span class="permissions-label">
                                    <span class="material-icons">group</span>
                                    Permitido para:
                                </span>
                                <div class="permissions-badges">
                                    <span 
                                        v-for="tipo in survey.tiposUsuarioPermitidos" 
                                        :key="tipo"
                                        class="permission-badge"
                                        :class="`badge-${tipo}`"
                                    >
                                        {{ formatUserType(tipo) }}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <!-- Card Footer -->
                        <div class="card-footer">
                            <ModernButton 
                                color="blue" 
                                @click="viewDetails(survey)"
                                tooltip="Ver detalles de la encuesta"
                            >
                                <span class="material-icons">visibility</span>
                                Ver detalles
                            </ModernButton>
                            <ModernButton 
                                color="red" 
                                @click="deleteSurvey(survey)"
                                tooltip="Eliminar encuesta"
                            >
                                <span class="material-icons">delete</span>
                            </ModernButton>
                        </div>
                    </div>
                </div>
            </div>
        </template>

        <template v-slot:footer>
            <div class="footer-content">
                <div class="footer-info">
                    <span class="material-icons">info</span>
                    <span>{{ filteredItems.length }} de {{ items.length }} encuestas</span>
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
</template>
<style scoped>
/* ===================================
   CARDS SECTION
   =================================== */

.cards-section {
    margin-top: var(--spacing-2xl);
}

.cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
    gap: var(--spacing-2xl);
    margin-top: var(--spacing-xl);
}

/* ===================================
   SURVEY CARD
   =================================== */

.survey-card {
    background: var(--bg-glass);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius-lg);
    overflow: hidden;
    transition: all var(--transition-normal);
    box-shadow: var(--shadow-sm);
    display: flex;
    flex-direction: column;
    height: 100%;
}

.survey-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
    border-color: var(--primary-color);
}

/* Card Header */
.card-header {
    background: var(--gradient-primary);
    padding: var(--spacing-sm);
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: var(--text-white);
}

.card-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 35px;
    height: 35px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: var(--border-radius-md);
    backdrop-filter: blur(10px);
}

.card-icon .material-icons {
    font-size: 18px;
}

.card-id {
    display: flex;
    /* align-items: flex-end; */
        align-items: center;
}

.id-label {
    font-size: var(--font-size-xs);
    opacity: 0.8;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.id-value {
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-bold);
}

/* Card Body */
.card-body {
    padding: var(--spacing-2xl);
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg);
}

.card-title {
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-bold);
    color: var(--text-primary);
    margin: 0;
    line-height: 1.3;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.card-description {
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
    line-height: 1.6;
    margin: 0;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

/* Info Grid */
.card-info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-md);
}

.info-item {
    display: flex;
    align-items: flex-start;
    gap: var(--spacing-sm);
    padding: var(--spacing-md);
    background: var(--bg-secondary);
    border-radius: var(--border-radius-sm);
}

.info-icon {
    font-size: 18px;
    color: var(--primary-color);
    flex-shrink: 0;
    margin-top: 2px;
}

.info-content {
    display: flex;
    flex-direction: column;
    gap: 2px;
    flex: 1;
    min-width: 0;
}

.info-label {
    font-size: var(--font-size-xs);
    color: var(--text-tertiary);
    font-weight: var(--font-weight-medium);
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.info-value {
    font-size: var(--font-size-sm);
    color: var(--text-primary);
    font-weight: var(--font-weight-semibold);
    word-break: break-word;
}

/* Permissions */
.card-permissions {
    padding: var(--spacing-md);
    background: var(--bg-secondary);
    border-radius: var(--border-radius-sm);
    border-left: 3px solid var(--primary-color);
}

.permissions-label {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    font-size: var(--font-size-xs);
    color: var(--text-secondary);
    font-weight: var(--font-weight-semibold);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: var(--spacing-sm);
}

.permissions-label .material-icons {
    font-size: 16px;
}

.permissions-badges {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-sm);
}

.permission-badge {
    display: inline-flex;
    align-items: center;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-semibold);
    text-transform: capitalize;
}

.badge-facilitador {
    background: rgba(76, 175, 80, 0.1);
    color: var(--success-color);
    border: 1px solid var(--success-light);
}

.badge-asesor {
    background: rgba(33, 150, 243, 0.1);
    color: var(--info-color);
    border: 1px solid var(--info-light);
}

.badge-administrador {
    background: rgba(156, 39, 176, 0.1);
    color: #9c27b0;
    border: 1px solid #ba68c8;
}

/* Card Footer */
.card-footer {
    padding: var(--spacing-lg) var(--spacing-2xl);
    background: var(--bg-secondary);
    border-top: 1px solid var(--border-color);
    display: flex;
    gap: var(--spacing-md);
}

.card-footer :deep(.modern-btn) {
    flex: 1;
}

/* ===================================
   EMPTY STATE
   =================================== */

.empty-state {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 400px;
    background: var(--bg-secondary);
    border-radius: var(--border-radius-lg);
    border: 2px dashed var(--border-color-medium);
}

.empty-content {
    text-align: center;
    max-width: 400px;
    padding: var(--spacing-3xl);
}

.empty-icon {
    font-size: 64px;
    color: var(--text-light);
    margin-bottom: var(--spacing-lg);
}

.empty-content h3 {
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-semibold);
    color: var(--text-primary);
    margin: 0 0 var(--spacing-sm) 0;
}

.empty-content p {
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
    margin: 0;
}

/* ===================================
   RESPONSIVE
   =================================== */

@media (max-width: 1024px) {
    .cards-grid {
        grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
        gap: var(--spacing-xl);
    }
}

@media (max-width: 768px) {
    .cards-grid {
        grid-template-columns: 1fr;
        gap: var(--spacing-lg);
    }
    
    .card-info-grid {
        grid-template-columns: 1fr;
    }
    
    .card-header {
        padding: var(--spacing-md);
    }
    
    .card-body {
        padding: var(--spacing-lg);
    }
    
    .card-footer {
        padding: var(--spacing-md) var(--spacing-lg);
        flex-direction: column;
    }
    
    .card-footer :deep(.modern-btn) {
        width: 100%;
        justify-content: center;
    }
}

@media (max-width: 480px) {
    .card-icon {
        width: 40px;
        height: 40px;
    }
    
    .card-icon .material-icons {
        font-size: 20px;
    }
    
    .card-title {
        font-size: var(--font-size-lg);
    }
}

/* ===================================
   DARK MODE
   =================================== */

@media (prefers-color-scheme: dark) {
    .survey-card {
        background: var(--bg-dark);
        border-color: var(--border-color-medium);
    }
    
    .survey-card:hover {
        border-color: var(--primary-light);
    }
    
    .card-title {
        color: #e2e8f0;
    }
    
    .card-description {
        color: #a0aec0;
    }
    
    .info-item {
        background: #1a202c;
    }
    
    .info-value {
        color: #e2e8f0;
    }
    
    .card-permissions {
        background: #1a202c;
    }
    
    .card-footer {
        background: #1a202c;
        border-top-color: var(--border-color-medium);
    }
    
    .empty-state {
        background: var(--bg-dark);
        border-color: var(--border-color-medium);
    }
    
    .empty-content h3 {
        color: #e2e8f0;
    }
    
    .empty-content p {
        color: #a0aec0;
    }
}
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