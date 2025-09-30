<script setup>
import { reactive, ref, computed, onMounted } from 'vue';
import ModernButton from '../components/ModernButtons/ModernButton.vue';
import { alertSuccess, alertError, alertWarning } from '../constantes/alerts';

const props = defineProps({
  surveyData: {
    type: Object,
    required: true
  },
  preguntas: {
    type: Array,
    required: true,
    default:[]
  }
});

const emit = defineEmits(['submit-survey', 'save-draft']);

// Respuestas del formulario
const formResponses = reactive({});
const isSubmitting = ref(false);

// Inicializar respuestas vacías
const initializeResponses = () => {
  console.log(props.preguntas);
  props.preguntas.forEach(pregunta => {
    if (pregunta.tipoPregunta === 'seleccion_multiple') {
      formResponses[pregunta.id] = [];
    } else {
      formResponses[pregunta.id] = '';
    }
  });
};

// Validar formulario
const validateForm = () => {
  const errors = [];
  
  props.preguntas.forEach(pregunta => {
    if (pregunta.obligatoria) {
      const response = formResponses[pregunta.id];
      
      if (pregunta.tipoPregunta === 'seleccion_multiple') {
        if (!response || response.length === 0) {
          errors.push(`La pregunta "${pregunta.textoPregunta}" es obligatoria`);
        }
      } else {
        if (!response || response.trim() === '') {
          errors.push(`La pregunta "${pregunta.textoPregunta}" es obligatoria`);
        }
      }
    }
  });
  
  return errors;
};

// Manejar cambio en checkbox (selección múltiple)
const handleCheckboxChange = (preguntaId, opcionValue, isChecked) => {
  if (!formResponses[preguntaId]) {
    formResponses[preguntaId] = [];
  }
  
  if (isChecked) {
    if (!formResponses[preguntaId].includes(opcionValue)) {
      formResponses[preguntaId].push(opcionValue);
    }
  } else {
    const index = formResponses[preguntaId].indexOf(opcionValue);
    if (index > -1) {
      formResponses[preguntaId].splice(index, 1);
    }
  }
};

// Transformar respuestas a formato estructurado
const transformResponsesToArray = () => {
  const answersArray = [];
  
  props.preguntas.forEach(pregunta => {
    const response = formResponses[pregunta.id];
    
    // Solo incluir preguntas que tienen respuesta
    if (response !== undefined && response !== '' && 
        !(Array.isArray(response) && response.length === 0)) {
      
      answersArray.push({
        preguntaId: pregunta.id.toString(),
        opcionSeleccionada: response,
        tipo: pregunta.tipoPregunta
      });
    }
  });
  
  return answersArray;
};

// Enviar formulario
const submitSurvey = async () => {
  const errors = validateForm();
  
  if (errors.length > 0) {
    alertWarning('Por favor completa todos los campos obligatorios');
    console.log('Errores de validación:', errors);
    return;
  }
  
  isSubmitting.value = true;
  
  try {
    // Estructura de respuesta transformada
    const surveyResponse = {
      surveyId: props.surveyData.id,
      answers: transformResponsesToArray(),
      submittedAt: new Date().toISOString()
    };
    // Debug: Mostrar estructura generada
    emit('submit-survey', surveyResponse);
    
  } catch (error) {
    alertError('Error al enviar la encuesta');
    console.error('Error:', error);
  } finally {
    isSubmitting.value = false;
  }
};

// Guardar borrador
const saveDraft = () => {
  const draft = {
    surveyId: props.surveyData.id,
    responses: formResponses,
    savedAt: new Date().toISOString()
  };
  
  localStorage.setItem(`survey_draft_${props.surveyData.id}`, JSON.stringify(draft));
  alertSuccess({
    title: 'Borrador guardado',
    subtitle: 'Puedes continuar más tarde',
    seconds: 2
  });
  
  emit('save-draft', draft);
};

// Cargar borrador si existe
const loadDraft = () => {
  const saved = localStorage.getItem(`survey_draft_${props.surveyData.id}`);
  if (saved) {
    const draft = JSON.parse(saved);
    Object.assign(formResponses, draft.responses);
  }
};

// Computadas
const totalQuestions = computed(() => props.preguntas.length);
const requiredQuestions = computed(() => props.preguntas.filter(p => p.obligatoria).length);
const completedRequired = computed(() => {
  return props.preguntas.filter(p => {
    const response = formResponses[p.id];
    if (p.tipoPregunta === 'seleccion_multiple') {
      return response && response.length > 0;
    }
    return response && response.trim() !== '';
  }).length;
});

// Inicializar al montar

onMounted( () => {
  initializeResponses();
  loadDraft();
});
</script>

<template>
  <div class="survey-form-container">
    <!-- Encabezado de progreso -->
    <div class="progress-header">
      <div class="progress-info">
        <h3 class="progress-title">Progreso de la encuesta</h3>
        <div class="progress-stats">
          <span class="stat-item">
            <span class="material-icons">quiz</span>
            {{ totalQuestions }} preguntas
          </span>
          <span class="stat-item">
            <span class="material-icons">assignment_turned_in</span>
            {{ completedRequired }}/{{ requiredQuestions }} obligatorias
          </span>
        </div>
      </div>
      <div class="progress-bar">
        <div 
          class="progress-fill" 
          :style="{ width: `${((completedRequired * 100) / props.preguntas.length)}%` }"
        ></div>
      </div>
    </div>

    <!-- Formulario de preguntas -->
    <form @submit.prevent="submitSurvey" class="survey-form">
      <div 
        v-for="(pregunta, index) in preguntas" 
        :key="pregunta.id"
        class="question-container"
      >
        <!-- Encabezado de pregunta -->
        <div class="question-header">
          <div class="question-number">{{ index + 1 }}</div>
          <div class="question-content">
            <h4 class="question-title">
              {{ pregunta.textoPregunta }}
              <span v-if="pregunta.obligatoria" class="required-mark">*</span>
            </h4>
            <div class="question-meta">
              <span class="question-type">
                <span class="material-icons">
                  {{ pregunta.tipoPregunta === 'opcion_multiple' ? 'radio_button_checked' : 
                     pregunta.tipoPregunta === 'seleccion_multiple' ? 'check_box' : 'text_fields' }}
                </span>
                {{ pregunta.tipoPregunta === 'opcion_multiple' ? 'Opción única' : 
                   pregunta.tipoPregunta === 'seleccion_multiple' ? 'Selección múltiple' : 'Texto libre' }}
              </span>
              <span v-if="pregunta.obligatoria" class="required-badge">Obligatoria</span>
            </div>
          </div>
        </div>

        <!-- Opciones de respuesta -->
        <div class="question-answers">
          
          <!-- OPCIÓN MÚLTIPLE (Radio buttons) -->
          <div v-if="pregunta.tipoPregunta === 'opcion_multiple'" class="radio-group">
            <label 
              v-for="opcion in pregunta.opciones"
              :key="opcion.id"
              class="radio-option"
            >
              <input 
                type="radio"
                :name="`question_${pregunta.id}`"
                :value="opcion.valor"
                v-model="formResponses[pregunta.id]"
                class="radio-input"
              />
              <div class="radio-custom"></div>
              <span class="radio-text">{{ opcion.textoOpcion }}</span>
            </label>
          </div>

          <!-- SELECCIÓN MÚLTIPLE (Checkboxes) -->
          <div v-else-if="pregunta.tipoPregunta === 'seleccion_multiple'" class="checkbox-group">
            <label 
              v-for="opcion in pregunta.opciones"
              :key="opcion.id"
              class="checkbox-option"
            >
              <input 
                type="checkbox"
                :value="opcion.valor"
                @change="handleCheckboxChange(pregunta.id, opcion.valor, $event.target.checked)"
                :checked="formResponses[pregunta.id]?.includes(opcion.valor)"
                class="checkbox-input"
              />
              <div class="checkbox-custom">
                <span class="material-icons">check</span>
              </div>
              <span class="checkbox-text">{{ opcion.textoOpcion }}</span>
            </label>
          </div>

          <!-- TEXTO LIBRE (Input) -->
          <div v-else-if="pregunta.tipoPregunta === 'texto_libre'" class="text-input-group">
            <textarea
              v-model="formResponses[pregunta.id]"
              :placeholder="`Escribe tu respuesta para: ${pregunta.textoPregunta}`"
              class="text-input"
              rows="3"
              maxlength="500"
            ></textarea>
            <div class="char-counter">
              {{ (formResponses[pregunta.id] || '').length }}/500 caracteres
            </div>
          </div>

        </div>
      </div>

      <!-- Botones de acción -->
      <div class="form-actions">
        <div class="action-info">
          <span class="material-icons">info</span>
          <span>Has clic en el boton para enviar la encuesta</span>
        </div>
        <div class="action-buttons">
          <!-- <ModernButton 
            type="button"
            color="gray" 
            @click="saveDraft"
            :disabled="isSubmitting"
            tooltip="Guardar progreso actual"
          >
            <span class="material-icons">save</span>
            Guardar Borrador
          </ModernButton> -->
          
          <ModernButton 
            type="submit"
            color="green" 
            :disabled="isSubmitting || completedRequired < requiredQuestions"
            tooltip="Enviar encuesta completa"
          >
            <span v-if="isSubmitting" class="loading-spinner"></span>
            <span v-else class="material-icons">send</span>
            {{ isSubmitting ? 'Enviando...' : 'Enviar Encuesta' }}
          </ModernButton>
        </div>
      </div>
    </form>
  </div>
</template>

<style scoped>
.survey-form-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0;
   /* padding-top: 100px;
  max-width: 800px;
  margin: 0 auto;
  padding-left: 16px;
  padding-right: 16px; */
}

/* ===================================
   ENCABEZADO DE PROGRESO
   =================================== */
.progress-header {
  z-index: 1000;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 24px;
  border-radius: 16px;
  margin-bottom: 24px;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
  position: sticky;
  
  /* position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 16px 24px;
  border-radius: 0;
  margin-bottom: 0;
  box-shadow: 
    0 4px 12px rgba(102, 126, 234, 0.3),
    0 2px 4px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1); */
}

.progress-info {
  margin-bottom: 16px;
}

.progress-title {
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 12px 0;
}

.progress-stats {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 500;
}

.stat-item .material-icons {
  font-size: 18px;
}

.progress-bar {
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 4px;
  transition: width 0.3s ease;
}

/* ===================================
   FORMULARIO DE PREGUNTAS
   =================================== */
.survey-form {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.question-container {
  background: rgba(255, 255, 255, 0.98);
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.question-container:hover {
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

/* Encabezado de pregunta */
.question-header {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
}

.question-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 50%;
  font-weight: 700;
  font-size: 16px;
  flex-shrink: 0;
}

.question-content {
  flex: 1;
}

.question-title {
  font-size: 18px;
  font-weight: 600;
  color: #1a202c;
  margin: 0 0 8px 0;
  line-height: 1.4;
}

.required-mark {
  color: #e53e3e;
  font-weight: bold;
  margin-left: 4px;
}

.question-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.question-type {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #4a5568;
  font-weight: 500;
}

.question-type .material-icons {
  font-size: 16px;
  color: #667eea;
}

.required-badge {
  background: rgba(229, 62, 62, 0.1);
  color: #e53e3e;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}

/* ===================================
   RESPUESTAS - RADIO BUTTONS
   =================================== */
.radio-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.radio-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fafafa;
}

.radio-option:hover {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.02);
}

.radio-input {
  display: none;
}

.radio-custom {
  width: 20px;
  height: 20px;
  border: 2px solid #cbd5e0;
  border-radius: 50%;
  position: relative;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.radio-input:checked + .radio-custom {
  border-color: #667eea;
  background: #667eea;
}

.radio-input:checked + .radio-custom::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 8px;
  height: 8px;
  background: white;
  border-radius: 50%;
}

.radio-text {
  font-size: 15px;
  color: #2d3748;
  line-height: 1.4;
}

/* ===================================
   RESPUESTAS - CHECKBOXES
   =================================== */
.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 300px;
  overflow-y: auto;
  padding-right: 8px;
}

.checkbox-group::-webkit-scrollbar {
  width: 6px;
}

.checkbox-group::-webkit-scrollbar-thumb {
  background: #667eea;
  border-radius: 3px;
}

.checkbox-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fafafa;
}

.checkbox-option:hover {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.02);
}

.checkbox-input {
  display: none;
}

.checkbox-custom {
  width: 20px;
  height: 20px;
  border: 2px solid #cbd5e0;
  border-radius: 6px;
  position: relative;
  transition: all 0.3s ease;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.checkbox-input:checked + .checkbox-custom {
  border-color: #667eea;
  background: #667eea;
}

.checkbox-custom .material-icons {
  font-size: 14px;
  color: white;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.checkbox-input:checked + .checkbox-custom .material-icons {
  opacity: 1;
}

.checkbox-text {
  font-size: 15px;
  color: #2d3748;
  line-height: 1.4;
}

/* ===================================
   RESPUESTAS - TEXTO LIBRE
   =================================== */
.text-input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.text-input {
  width: 100%;
  padding: 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 15px;
  font-family: inherit;
  resize: vertical;
  outline: none;
  transition: all 0.3s ease;
  background: #fafafa;
}

.text-input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  background: white;
}

.char-counter {
  font-size: 12px;
  color: #718096;
  text-align: right;
}

/* ===================================
   ACCIONES DEL FORMULARIO
   =================================== */
.form-actions {
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.action-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #4a5568;
  font-size: 14px;
  justify-content: center;
}

.action-info .material-icons {
  font-size: 18px;
  color: #667eea;
}

.action-buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* ===================================
   RESPONSIVE
   =================================== */
@media (max-width: 768px) {
  /* .survey-form-container {
    padding: 0 16px;
  }
  
  .progress-header {
    padding: 20px;
    margin-bottom: 20px;
  }
   */
   .progress-header {
    padding: 12px 16px;
  }
  
  .survey-form-container {
    padding-top: 80px; /* Menos espacio en móvil */
    padding-left: 12px;
    padding-right: 12px;
  }
  .progress-stats {
    flex-direction: column;
    gap: 12px;
  }
  
  .question-container {
    padding: 20px;
  }
  
  .question-header {
    flex-direction: column;
    gap: 12px;
  }
  
  .question-number {
    align-self: flex-start;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .action-buttons :deep(.modern-btn) {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
   .progress-header {
    padding: 10px 12px;
  }
  
  .progress-stats {
    flex-direction: column;
    gap: 8px;
  }
  
  .survey-form-container {
    padding-top: 75px;
  }
  .checkbox-group {
    max-height: 200px;
  }
  
  .question-title {
    font-size: 16px;
  }
  
  .radio-option,
  .checkbox-option {
    padding: 10px 12px;
  }
  
  .form-actions {
    padding: 20px 16px;
  }
}

</style>