<script setup>
import { onMounted, reactive, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router'
const route = useRoute();
const router = useRouter();
import ContainerCustom from '../../components/ContainerCustom.vue';
import ModernButton from '../../components/ModernButtons/ModernButton.vue';
import ModernSelect from '../../components/ModernInputs/ModernSelect.vue'
import SurveyForm from '../../components/SurveyForm.vue'; // Tu nuevo componente
import { alertError, alertSuccess, alertWarning } from '../../constantes/alerts';
import moment from 'moment';
import { useGetDataSurveys } from '../../composables/getDataSurveys'
import SearchableSelect from '../../components/ModernInputs/SearchableSelect.vue';
import VueMultiselect from 'vue-multiselect'
import 'vue-multiselect/dist/vue-multiselect.css'
const { getSurveyByid, saveSurvey,getSucursales } = useGetDataSurveys()
const isloading = ref(false);
const  isSending = ref(false);
const sucursalesList = ref([]);
// table
const headers = ref([
    { text: "Codigo sucursal", value: "codigoSucursal", sortable: true },
    { text: "Sucursal", value: "nombre", sortable: true },
    { text: "Ciudad", value: "ciudad", sortable: true },
    { text: "Estado", value: "tipoUsuario", },
    { text: "Estatus", value: "status", },
    { text: "Acciones", value: "actions", width:150},
]);
const items = ref([
    // {userid:1,nombre:"miguel",correo:"mi@gmail.com",level:"admin"}
]);
const searchField = ["userid", "username", "correo", "level"]; //campos por los que buscara el filtro
const searchInput = ref(""); // va
// 
const surveyData = reactive({
    id: 0,
    titulo: "",
    descripcion: "",
    fechaCreacion: "",
    nombreCreador: "",
    sucursal:0,
    preguntas: []
});
const errors = reactive({
    sucursal:0,
});
onMounted(() => {
    const idK = route.params.idSurvey
    getSurveyInfo(idK)
});

const getSurveyInfo = async (id_survey) => {
    isloading.value = true;
    try {
        const response = await getSurveyByid(id_survey)
        const { data, status } = response
        if (status != 200) {
            alertError("Error", "Ocurrió un error al cargar la información de la encuesta", 3)
            return;
        }
        const { id, titulo, descripcion, fechaCreacion, nombreCreador, preguntas } = data.data
        surveyData.id = id;
        surveyData.titulo = titulo,
        surveyData.descripcion = descripcion
        surveyData.fechaCreacion = moment(fechaCreacion).format('DD/MM/YYYY H:mm a')
        surveyData.nombreCreador = nombreCreador
        surveyData.preguntas = preguntas
        await getsucursalesList()
    } catch (error) {
        console.error('Error:', error);
        alertError("Error", "Error inesperado al cargar la encuesta", 3);
    } finally {
        isloading.value = false;
    }
}

const getsucursalesList = async() => {
    const response = await getSucursales()
    console.log(response);
    const {status,data} =response
    if (status!=200) {
        alertError("Oops", "Ocurrio un error al cargar las sucursales")
        return
    }
    sucursalesList.value = data.data
}

// Manejar envío de encuesta
const handleSurveySubmit = async (surveyResponse) => {
    console.log(surveyResponse);
     const result = surveyResponse.answers.map(i=>{
        if (i.tipo=="opcion_multiple") {
            return {
                preguntaId: i.preguntaId,
                opcionSeleccionada: i.opcionSeleccionada
            }
        }
        if (i.tipo=="texto_libre") {
            return {
                preguntaId: i.preguntaId,
                textoRespuesta: i.opcionSeleccionada
            }
        }
        if (i.tipo =="seleccion_multiple") {
            return {
                preguntaId: i.preguntaId,
                opcionesSeleccionadas: i.opcionSeleccionada
            }
        }
     })
   if (surveyData.sucursal.id!=null && surveyData.sucursal.id!=0) {
        console.log(surveyData.sucursal.id);
        const response = await saveSurvey(surveyResponse.surveyId, result, surveyData.sucursal.id)
        const {status,data}=response
        if (status!=200) {
            alertError("Oops", "Ocurrio un error al enviar la encuesta",2)
            return
        }
        await alertSuccess('Encuesta enviada', 'Sus respuestas han sido guardadas exitosamente',3);
        router.push('/responding'); // Redirigir a la lista de encuestas
   }else {
    alertError("Selecciona una sucursal")
    errors.sucursal="Selecciona sucursal"
    return ;
   }
    
};

// Manejar guardado de borrador
const handleSaveDraft = (draftData) => {
    // console.log('Borrador guardado:', draftData);
    // Lógica adicional si necesitas guardar en servidor
};

// Volver a la lista
const goBack = () => {
    router.push('/responding'); 
};
const validateField = (field, value) => {
    console.log(field);
    console.log(value);
    switch (field) {
        case 'sucursal':
            if (!value) {
                errors.sucursal = 'Debe seleccionar una sucursal';
                return false;
            } else {
                errors.sucursal = '';
                return true;
            }
        
        default:
            return true;
    }
};
const handleInput = (field, value) => {
    surveyData[field] = value;
    if (errors[field]) {
        validateField(field, value);
    }

};
</script>

<template>
    <div>
        <ContainerCustom 
            title="Contestar Encuesta" 
            subtitle="Por favor conteste las preguntas con honestidad" 
            :loading="isloading"
            icon="assignment"
        >
            <template v-slot:body>
                <!-- Información de la encuesta -->
                <div class="form-info-section">
                    <div class="info-card">
                        <div class="info-header">
                            <span class="material-icons info-icon">poll</span>
                            <h3 class="info-title">Información de la Encuesta</h3>
                        </div>
                        <div class="info-content">
                            <div class="info-grid">
                                <div class="info-item">
                                    <span class="material-icons">title</span>
                                    <div class="info-details">
                                        <span class="info-label">Título:</span>
                                        <span class="info-value">{{ surveyData.titulo }}</span>
                                    </div>
                                </div>
                                <div class="info-item">
                                    <span class="material-icons">description</span>
                                    <div class="info-details">
                                        <span class="info-label">Descripción:</span>
                                        <span class="info-value">{{ surveyData.descripcion }}</span>
                                    </div>
                                </div>
                            </div>

                            <div class="info-details mt-3">
                                <span class="info-label">Sucursal:</span>
                            </div>
                            <VueMultiselect
                                v-model="surveyData.sucursal"
                                :options="sucursalesList"
                                label="nombre"
                                track-by="id"
                                placeholder="Selecciona una sucursal"
                                :searchable="true"
                                :close-on-select="true"
                                class="modern-multiselect"
                                select-label="Presiona enter para seleccionar"
                                selected-label="Seleccionado"
                                deselect-label="Presiona enter para remover"
                                :block-keys="['Tab']"
                                :internal-search="true"
                                :clear-on-select="false"
                                :hide-selected="false"
                                :preserve-search="false"
                                :preselect-first="false"
                            />
                             <span v-if="errors.sucursal" class="error-text">
                                <span class="material-icons">error</span>
                                {{ errors.sucursal }}
                            </span>
                        </div>
                    </div>
                </div>
                <!-- <div class="sucursal-container">
                    
                 
                </div> -->
                <!-- Formulario de la encuesta -->
                <div v-if="!isloading && surveyData.preguntas.length > 0" class="survey-section">
                    <SurveyForm 
                        v-if="!isloading"
                        :preguntas="surveyData.preguntas"
                        :surveyData="surveyData"
                        @submit-survey="handleSurveySubmit"
                        @save-draft="handleSaveDraft"
                    />
                </div>

                <!-- Estado de carga -->
                <div v-else-if="isloading" class="loading-state">
                    <div class="loading-content">
                        <span class="material-icons loading-icon">hourglass_empty</span>
                        <p>Cargando encuesta...</p>
                    </div>
                </div>

                <!-- Estado sin preguntas -->
                <div v-else class="empty-state">
                    <div class="empty-content">
                        <span class="material-icons empty-icon">assignment_late</span>
                        <h3>No hay preguntas disponibles</h3>
                        <p>Esta encuesta no contiene preguntas o aún no se han cargado.</p>
                    </div>
                </div>
            </template>

            <template v-slot:footer>

                <div class="footer-content">
                    <div class="footer-info">
                        <span class="material-icons">info</span>
                        <span>{{ surveyData.preguntas.length }} preguntas en total</span>
                    </div>
                    <div class="footer-actions">
                        <ModernButton 
                            color="lile" 
                            @click="goBack"
                            tooltip="Volver a la lista de encuestas"
                        >
                            <span class="material-icons">arrow_back</span>
                            Volver
                        </ModernButton>
                    </div>
                </div>
            </template>
        </ContainerCustom>
    </div>
</template>

<style scoped>
.sucursal-container{
    background: rgba(255, 255, 255, 0.98);
    backdrop-filter: blur(20px);
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    overflow: hidden;
    transition: all 0.3s ease;
     display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
    /* margin-top: 2rem; */
    padding: 2rem;
    margin-bottom: 2rem;
}
.sucursal-container:hover {
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
    transform: translateY(-2px);
}

/* Información de la encuesta */
.form-info-section {
    margin-bottom: 32px;
}

.info-card {
    background: rgba(255, 255, 255, 0.98);
    backdrop-filter: blur(20px);
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    overflow: hidden;
    transition: all 0.3s ease;
}

.info-card:hover {
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
    transform: translateY(-2px);
}

.info-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 20px 24px;
    display: flex;
    align-items: center;
    gap: 12px;
}

.info-icon {
    font-size: 24px;
}

.info-title {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
}

.info-content {
    padding: 24px;
}

.info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
}

.info-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 16px;
    background: #f8fafc;
    border-radius: 10px;
    border: 1px solid #e2e8f0;
}

.info-item .material-icons {
    font-size: 20px;
    color: #667eea;
    margin-top: 2px;
    flex-shrink: 0;
}

.info-details {
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex: 1;
}

.info-label {
    font-size: 12px;
    font-weight: 600;
    color: #4a5568;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.info-value {
    font-size: 15px;
    color: #1a202c;
    font-weight: 500;
    line-height: 1.4;
}

/* Sección de la encuesta */
.survey-section {
    margin-top: 8px;
}

/* Estados especiales */
.loading-state,
.empty-state {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 300px;
    background: #f8fafc;
    border-radius: 16px;
    border: 2px dashed #e2e8f0;
}

.loading-content,
.empty-content {
    text-align: center;
    color: #4a5568;
}

.loading-icon,
.empty-icon {
    font-size: 48px;
    color: #a0aec0;
    margin-bottom: 16px;
}

.loading-icon {
    animation: spin 2s linear infinite;
}

@keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}

.loading-content h3,
.empty-content h3 {
    margin: 0 0 8px 0;
    font-size: 20px;
    font-weight: 600;
    color: #2d3748;
}

.loading-content p,
.empty-content p {
    margin: 0;
    font-size: 14px;
    color: #718096;
}

/* Footer */
.footer-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
}

.footer-info {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #4a5568;
    font-size: 14px;
    font-weight: 500;
}

.footer-info .material-icons {
    font-size: 18px;
    color: #667eea;
}

.footer-actions {
    display: flex;
    align-items: center;
    gap: 16px;
}

/* Responsive */
@media (max-width: 768px) {
    .info-grid {
        grid-template-columns: 1fr;
        gap: 16px;
    }
    
    .info-item {
        padding: 12px;
    }
    
    .footer-content {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
    }
    
    .footer-actions {
        width: 100%;
        justify-content: center;
    }
    
    .footer-actions .modern-btn {
        width: 100%;
        justify-content: center;
    }
}

@media (max-width: 480px) {
    .form-info-section {
        margin-bottom: 24px;
    }
    
    .info-header {
        padding: 16px 20px;
    }
    
    .info-content {
        padding: 20px;
    }
    
    .info-title {
        font-size: 16px;
    }
}
:deep(.multiselect__content-wrapper) {
    position: relative !important;
}

</style>