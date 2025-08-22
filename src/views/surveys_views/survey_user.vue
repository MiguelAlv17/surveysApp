<script setup >
import { onMounted, ref } from 'vue';
import CardSurvey from '../../components/CardSurvey.vue';
import ContainerCustom from '../../components/ContainerCustom.vue';
import ModernButton from '../../components/ModernButtons/ModernButton.vue';
import {useGetDataSurveys} from '../../composables/getDataSurveys'
import { alertError } from '../../constantes/alerts';
import { useRouter,useRoute } from 'vue-router'
const router = useRouter()
const {getSurveysList}=useGetDataSurveys()

const suverysList = ref([]);
const isloading = ref(false);
onMounted( () => {
    getList()

});

const getList = async() => {
    isloading.value=true
    const response = await getSurveysList();
    const {status,data}=response;
    isloading.value=false
    if (status!=200) {
        alertError("Ooops", "Ocurrio un error al cargar las encuestas",3)
        return
    }
    console.log(response);
    suverysList.value=data.data
}
const handleSurveyClick = (surveyId) => {
  console.log('Encuesta seleccionada:', surveyId);
  router.push(`/responding/questions/${surveyId}`);
  // Aquí puedes manejar la navegación o abrir el modal de la encuesta
};
</script>

<template>
    <!-- <Loading v-if="isloading"></Loading> -->
    <div >
        <ContainerCustom 
        title="Bienvenido a la Encuesta" 
        subtitle="Responde la siguientes preguntas" 
        :loading="isloading"
        icon="file_present">
            <template v-slot:body>
                <!-- Search and Actions Section -->
                <div class="search-and-actions">
                    <div class="search-section">
                        <div class="search-container">
                           <h2 class="title-page">Encuestas Disponibles</h2>
                        </div>
                    </div>
                </div>

                <!-- Table Section -->
                <div class="surveys-container">
                    
                    
                    <div class="surveys-list">
                    <CardSurvey
                        v-for="(option, index) in  suverysList"
                        :key="index"
                        :title="option.titulo"
                        :description="option.descripcion"
                        :id="option.id"
                        estimated-time="8 min"
                        @survey-selected="handleSurveyClick(option.id)"
                    />
                    
                    <!-- <CardSurvey
                        title="Evaluación del Producto"
                        description="Queremos conocer tu opinión sobre las nuevas funcionalidades que hemos implementado en la plataforma DVR."
                        :id="2"
                        estimated-time="3 min"
                        @survey-selected="handleSurveyClick"
                    /> -->
<!--                     
                    <CardSurvey
                        title="Feedback de Capacitación"
                        description="Comparte tu experiencia sobre el último curso de capacitación en el uso del sistema de videovigilancia."
                        :id="3"
                        :is-completed="true"
                        estimated-time="7 min"
                        @survey-selected="handleSurveyClick"
                    />
                    
                    <CardSurvey
                        title="Encuesta Anual"
                        description="Participación en la encuesta anual de clima organizacional y satisfacción laboral."
                        :id="4"
                        estimated-time="15 min"
                        :disabled="true"
                        @survey-selected="handleSurveyClick"
                    /> -->
                    </div>
                </div>

            </template>
            <template v-slot:footer>
                <div class="footer-content">
                    <div class="footer-info">
                        <span class="material-icons">info</span>
                        <span>son un total de 60 preguntas</span>
                    </div>
                    <div class="footer-actions">
                        <span class="last-update">Última actualización: info</span>
                         <!-- <ModernButton 
                            color="lile" 
                            :function="getList"
                            tooltip="Recargar la tabla"
                        >
                            <span class="material-icons">update</span>
                        </ModernButton> -->
                    </div>
                </div>
            </template>
        </ContainerCustom>
    </div>


   

</template>
<style scoped>
.surveys-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
}

.surveys-list {
  display: flex;
  flex-direction: column;
  gap: 0; 
  /* // El gap está manejado por margin-bottom del componente */
}

h2 {
  font-size: 28px;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 24px;
  text-align: center;
}
.title-page{
    color: rgb(83, 83, 83);
}
@media (prefers-color-scheme: dark) {
   .title-page{
        color: white;
    }
}
</style>