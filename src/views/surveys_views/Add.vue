<!-- Actualización de AddQuestions.vue -->
<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router'
const route = useRoute();
const router = useRouter();
import ContainerCustom from '../../components/ContainerCustom.vue';
import BtnTable from '../../components/TableButtons/BtnTable.vue';
import ModernButton from '../../components/ModernButtons/ModernButton.vue';
import ModernInput from '../../components/ModernInputs/ModernInput.vue';
import ModernSelect from '../../components/ModernInputs/ModernSelect.vue';
import LoaderBtn from '../../components/LoaderBtn.vue';
import ModalCustom from '../../components/ModalCustom.vue';
import { alertError, alertSuccess, alertWarning } from '../../constantes/alerts';
import moment from 'moment';
import { useGetDataSurveys } from '../../composables/getDataSurveys'

const { addNewSurvey } = useGetDataSurveys()
const isloading = ref(false);
const isSaving = ref(false);

// Variables para el modal de agregar pregunta
const showAddQuestionModal = ref(false);
const isSavingQuestion = ref(false);

// variables tabla
const headers = ref([
    { text: "Orden", value: "orden", sortable: true },
    { text: "Pregunta", value: "textoPregunta", sortable: true },
    { text: "Tipo", value: "tipoPregunta", sortable: true },
    { text: "Obligatoria", value: "obligatoria", sortable: true },
    { text: "Acciones", value: "actions" }
]);
const items = ref([]);
const searchField = ["textoPregunta", "tipoPregunta"];
const searchInput = ref("");

// Datos de la encuesta
const surveyData = reactive({
  titulo: "",
  descripcion: "",
  permitirAsesor: false,
  permitirFacilitador: false,
  preguntas: []
});

// Validaciones
const errors = reactive({
  titulo: "",
  descripcion: "",
  permisos: ""
});

// Datos para el formulario de nueva pregunta
const questionForm = reactive({
  orden:0,
  textoPregunta: "",
  tipoPregunta: "",
  obligatoria: "",
  opciones: []
});

// Validaciones para la pregunta
const questionErrors = reactive({
  textoPregunta: "",
  tipoPregunta: "",
  obligatoria: ""
});

// Variables para opciones dinámicas
const newOption = ref("");
const optionError = ref("");

// Opciones para el selector de tipo de pregunta
const questionTypes = [
  { label: "Texto libre", value: "texto_libre" },
  { label: "Opción múltiple", value: "opcion_multiple" },
  { label: "Selección múltiple", value: "seleccion_multiple" }
];

// Opciones para obligatoria
const requiredOptions = [
  { label: "Sí", value: true },
  { label: "No", value: false }
];

// Headers para la tabla de opciones
const optionHeaders = ref([
  { text: "Orden", value: "orden", sortable: true },
  { text: "Texto de Opción", value: "textoOpcion", sortable: true },
  { text: "Acciones", value: "actions" }
]);

onMounted(() => {
  // Datos de ejemplo para testing
  // surveyData.preguntas = [
  //   {
  //     textoPregunta: "¿Cómo califica nuestro servicio?",
  //     tipoPregunta: "opcion_multiple",
  //     obligatoria: true,
  //     orden: 1,
  //     opciones: [
  //       { textoOpcion: "Excelente", valor: "5", orden: 1 },
  //       { textoOpcion: "Bueno", valor: "4", orden: 2 },
  //       { textoOpcion: "Regular", valor: "3", orden: 3 }
  //     ]
  //   },
  //   {
  //     textoPregunta: "Comentarios adicionales",
  //     tipoPregunta: "texto_libre",
  //     obligatoria: false,
  //     orden: 2,
  //     opciones: []
  //   }
  // ];
  // items.value = surveyData.preguntas;
});

// Función de validación para encuesta
const validateField = (field, value) => {
  switch (field) {
    case 'titulo':
      if (!value.trim()) {
        errors.titulo = 'El título es requerido';
        return false;
      } else if (value.length < 5) {
        errors.titulo = 'El título debe tener al menos 5 caracteres';
        return false;
      } else {
        errors.titulo = '';
        return true;
      }
    
    case 'descripcion':
      if (!value.trim()) {
        errors.descripcion = 'La descripción es requerida';
        return false;
      } else if (value.length < 10) {
        errors.descripcion = 'La descripción debe tener al menos 10 caracteres';
        return false;
      } else {
        errors.descripcion = '';
        return true;
      }
    
    case 'permisos':
      if (!surveyData.permitirAsesor && !surveyData.permitirFacilitador) {
        errors.permisos = 'Debe seleccionar al menos un tipo de usuario';
        return false;
      } else {
        errors.permisos = '';
        return true;
      }
    
    default:
      return true;
  }
};

// Validaciones para la pregunta
const validateQuestionField = (field, value) => {
  switch (field) {
    case 'textoPregunta':
      if (!value.trim()) {
        questionErrors.textoPregunta = 'El texto de la pregunta es requerido';
        return false;
      } else if (value.length < 5) {
        questionErrors.textoPregunta = 'La pregunta debe tener al menos 5 caracteres';
        return false;
      } else {
        questionErrors.textoPregunta = '';
        return true;
      }
    
    case 'tipoPregunta':
      if (!value) {
        questionErrors.tipoPregunta = 'Debe seleccionar un tipo de pregunta';
        return false;
      } else {
        questionErrors.tipoPregunta = '';
        return true;
      }
    
    case 'obligatoria':
      if (value === "") {
        questionErrors.obligatoria = 'Debe indicar si la pregunta es obligatoria';
        return false;
      } else {
        questionErrors.obligatoria = '';
        return true;
      }
    
    default:
      return true;
  }
};

// Validar formulario completo
const validateForm = () => {
  const validations = [
    validateField('titulo', surveyData.titulo),
    validateField('descripcion', surveyData.descripcion),
    validateField('permisos', '')
  ];
  
  return validations.every(Boolean);
};

// Validar formulario de pregunta
const validateQuestionForm = () => {
  const validations = [
    validateQuestionField('textoPregunta', questionForm.textoPregunta),
    validateQuestionField('tipoPregunta', questionForm.tipoPregunta),
    validateQuestionField('obligatoria', questionForm.obligatoria)
  ];
  
  // Si es pregunta con opciones, validar que tenga al menos una opción
  if ((questionForm.tipoPregunta === 'opcion_multiple' || questionForm.tipoPregunta === 'seleccion_multiple') 
      && questionForm.opciones.length === 0) {
    alertWarning('Debe agregar al menos una opción para este tipo de pregunta');
    return false;
  }
  
  return validations.every(Boolean);
};

// Manejar entrada de datos
const handleInput = (field, value) => {
  surveyData[field] = value;
  if (errors[field]) {
    validateField(field, value);
  }
};

// Manejar entrada de datos para pregunta
const handleQuestionInput = (field, value) => {
  questionForm[field] = value;
  if (questionErrors[field]) {
    validateQuestionField(field, value);
  }
};

// Manejar cambio de permisos
const handlePermissionChange = (type) => {
  if (type === 'asesor') {
    surveyData.permitirAsesor = !surveyData.permitirAsesor;
  } else if (type === 'facilitador') {
    surveyData.permitirFacilitador = !surveyData.permitirFacilitador;
  }
  
  validateField('permisos', '');
};

// Abrir modal de agregar pregunta
const openAddQuestionModal = () => {
  // Limpiar formulario
  cleanQuestionForm();
  showAddQuestionModal.value = true;
};

// Limpiar formulario de pregunta
const cleanQuestionForm = () => {
  Object.assign(questionForm, {
    textoPregunta: "",
    tipoPregunta: "",
    obligatoria: "",
    opciones: []
  });
  
  Object.keys(questionErrors).forEach(key => {
    questionErrors[key] = '';
  });
  
  newOption.value = "";
  optionError.value = "";
};

// Agregar opción a la pregunta
const addOption = () => {
  if (!newOption.value.trim()) {
    optionError.value = 'El texto de la opción es requerido';
    return;
  }
  
  if (questionForm.opciones.some(opt => opt.textoOpcion.toLowerCase() === newOption.value.toLowerCase())) {
    optionError.value = 'Esta opción ya existe';
    return;
  }
  
  const nuevaOpcion = {
    textoOpcion: newOption.value.trim(),
    valor: questionForm.opciones.length + 1,
    orden: questionForm.opciones.length + 1
  };
  
  questionForm.opciones.push(nuevaOpcion);
  newOption.value = "";
  optionError.value = "";
};

// Eliminar opción
const removeOption = (index) => {
  questionForm.opciones.splice(index, 1);
  // Reordenar
  questionForm.opciones.forEach((option, idx) => {
    option.orden = idx + 1;
  });
};

// Guardar pregunta
const saveQuestion = async () => {
  if (!validateQuestionForm()) {
    return;
  }
  
  isSavingQuestion.value = true;
  if (questionForm.orden!=0) {
    // es una edicion de pregunta
    const indexQ= surveyData.preguntas.findIndex(q => q.orden == questionForm.orden)
    if (indexQ !== -1) {
      // Eliminar la pregunta
      surveyData.preguntas.splice(indexQ, 1);
    }else{
      alertError("No se pudo editar la pregunta correctmanet")
      return
    }
  }
  try {
    // Simular guardado
    const nuevaPregunta = {
      textoPregunta: questionForm.textoPregunta,
      tipoPregunta: questionForm.tipoPregunta,
      obligatoria: questionForm.obligatoria,
      orden: surveyData.preguntas.length + 1,
      opciones: [...questionForm.opciones]
    };
    
    surveyData.preguntas.push(nuevaPregunta);
    items.value = surveyData.preguntas;
    
    showAddQuestionModal.value = false;
    
    await alertSuccess('Pregunta agregada correctamente');
    
  } catch (error) {
    console.error('Error:', error);
    alertError('Error al agregar la pregunta');
  } finally {
    isSavingQuestion.value = false;
  }
};

// Cerrar modal
const closeAddQuestionModal = () => {
  showAddQuestionModal.value = false;
  cleanQuestionForm();
};

// Guardar encuesta básica
const handleSubmit = async () => {
  if (!validateForm()) {
    alertWarning('Por favor, corrija los errores en el formulario');
    return;
  }
  
  isSaving.value = true;
  try {
    console.log('Datos a enviar:', surveyData);
    
    const response = await addNewSurvey(surveyData)
    const {data,status} = response;
    if (status!=200) {
      alertError("Oops", "Ocurrio un error al crear la encuesta",2);
    }
    await alertSuccess(
      'Encuesta creada',
      'La encuesta se ha guardado correctamente',
      3
    );
    
    router.push('/surveys');
    
  } catch (error) {
    console.error('Error:', error);
    alertError('Error al guardar la encuesta');
  } finally {
    isSaving.value = false;
  }
};

// Limpiar formulario
const cleanForm = () => {
  Object.assign(surveyData, {
    titulo: "",
    descripcion: "",
    permitirAsesor: false,
    permitirFacilitador: false,
    preguntas: []
  });
  
  Object.keys(errors).forEach(key => {
    errors[key] = '';
  });
};

// Volver
const goBack = () => {
  router.push('/surveys');
};

const editQuestion = (index) => {
  cleanQuestionForm();
  showAddQuestionModal.value = true;
  questionForm.orden = index.orden;
  questionForm.obligatoria=index.obligatoria;
  questionForm.tipoPregunta=index.tipoPregunta;
  questionForm.opciones=index.opciones;
  questionForm.textoPregunta=index.textoPregunta;
};

const confirmDeleteQuestion = async (index) => {
  const pregunta = surveyData.preguntas[index];
  const result = await alertWarning(
    '¿Está seguro de eliminar esta pregunta?',
    `"${pregunta.textoPregunta}" será eliminada permanentemente`
  );
  
  if (result.isConfirmed) {
    deleteQuestion(index);
  }
};

const deleteQuestion = (index) => {
  surveyData.preguntas.splice(index, 1);
  
  surveyData.preguntas.forEach((pregunta, idx) => {
    pregunta.orden = idx + 1;
  });
  
  items.value = surveyData.preguntas;
  alertSuccess('Pregunta eliminada correctamente');
};

// Computed para saber si mostrar opciones
const showOptionsSection = computed(() => {
  return questionForm.tipoPregunta === 'opcion_multiple' || questionForm.tipoPregunta === 'seleccion_multiple';
});
</script>

<template>
  <div>
    <ContainerCustom 
      title="Crear Nueva Encuesta" 
      subtitle="Complete la información básica de la encuesta" 
      :loading="isloading"
      icon="assignment_add"
    >
      <template v-slot:body>
        <!-- Formulario de información básica -->
        <div class="form-container">
          <!-- Título de la encuesta -->
          <ModernInput
            v-model="surveyData.titulo"
            type="text"
            label="Título de la Encuesta"
            icon="title"
            @blur="validateField('titulo', surveyData.titulo)"
            @input="handleInput('titulo', $event.target.value)"
            placeholder="Ej: Encuesta de Satisfacción del Cliente"
            :required="true"
            :error="errors.titulo"
            :disabled="isSaving"
          />

          <!-- Descripción -->
          <div class="form-group mt-3">
            <label class="input-label">
              <span class="material-icons label-icon">description</span>
              Descripción de la Encuesta
              <span class="required-mark">*</span>
            </label>
            
            <div class="textarea-wrapper" :class="{ 'has-error': errors.descripcion }">
              <textarea
                v-model="surveyData.descripcion"
                @blur="validateField('descripcion', surveyData.descripcion)"
                @input="handleInput('descripcion', $event.target.value)"
                placeholder="Describa el propósito y contexto de esta encuesta..."
                class="modern-textarea"
                rows="4"
                :disabled="isSaving"
              ></textarea>
            </div>
            
            <span v-if="errors.descripcion" class="error-text">
              <span class="material-icons">error</span>
              {{ errors.descripcion }}
            </span>
          </div>

          <!-- Permisos de usuario -->
          <div class="form-group mt-4">
            <label class="input-label">
              <span class="material-icons label-icon">group</span>
              ¿Quién puede responder esta encuesta?
              <span class="required-mark">*</span>
            </label>
            
            <div class="permission-options">
              <!-- Permitir Asesor -->
              <div class="permission-item" @click="handlePermissionChange('asesor')">
                <div class="radio-wrapper">
                  <input
                    type="checkbox"
                    :checked="surveyData.permitirAsesor"
                    @change="handlePermissionChange('asesor')"
                    class="permission-checkbox"
                    :disabled="isSaving"
                  />
                  <div class="custom-checkbox">
                    <span v-if="surveyData.permitirAsesor" class="material-icons">check</span>
                  </div>
                </div>
                <div class="permission-content">
                  <div class="permission-icon">
                    <span class="material-icons">support_agent</span>
                  </div>
                  <div class="permission-text">
                    <h4>Asesores</h4>
                    <p>Personal de atención al cliente y ventas</p>
                  </div>
                </div>
              </div>

              <!-- Permitir Facilitador -->
              <div class="permission-item" @click="handlePermissionChange('facilitador')">
                <div class="radio-wrapper">
                  <input
                    type="checkbox"
                    :checked="surveyData.permitirFacilitador"
                    @change="handlePermissionChange('facilitador')"
                    class="permission-checkbox"
                    :disabled="isSaving"
                  />
                  <div class="custom-checkbox">
                    <span v-if="surveyData.permitirFacilitador" class="material-icons">check</span>
                  </div>
                </div>
                <div class="permission-content">
                  <div class="permission-icon">
                    <span class="material-icons">school</span>
                  </div>
                  <div class="permission-text">
                    <h4>Facilitadores</h4>
                    <p>Personal de capacitación y entrenamiento</p>
                  </div>
                </div>
              </div>
            </div>
            
            <span v-if="errors.permisos" class="error-text">
              <span class="material-icons">error</span>
              {{ errors.permisos }}
            </span>
          </div>

          <!-- Sección de Preguntas -->
          <div class="questions-section mt-5">
            <div class="section-header">
              <div class="section-title">
                <span class="material-icons">quiz</span>
                <h3>Preguntas de la Encuesta</h3>
              </div>
              <ModernButton 
                color="blue" 
                @click="openAddQuestionModal"
                tooltip="Agregar nueva pregunta"
                :disabled="isSaving"
              >
                <span class="material-icons">add</span>
                Agregar Pregunta
              </ModernButton>
            </div>

            <!-- Tabla de preguntas -->
            <div class="questions-table-container">
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
                <template #item-obligatoria="item">
                  <span v-if="item.obligatoria==true" class="material-icons text-success-custom">
                    check_circle
                  </span>
                  <span v-else class="material-icons text-danger-custom">
                    cancel
                  </span>
                </template>
                <template #item-actions="item">
                  <BtnTable 
                    color="purple" 
                    @function="editQuestion(item)"
                    tooltip="Editar pregunta"
                  >
                    <span class="material-icons">edit</span>
                  </BtnTable>
                  <BtnTable 
                    class="ms-2"
                    color="red" 
                    @function="confirmDeleteQuestion(items.indexOf(item))"
                    tooltip="Eliminar"
                  >
                    <span class="material-icons">delete</span>
                  </BtnTable>
                </template>
              </EasyDataTable>
            </div>
          </div>

          <!-- Información adicional -->
          <div class="form-info mt-4">
            <div class="info-item">
              <span class="material-icons">info</span>
              <span>Los campos marcados con * son obligatorios</span>
            </div>
            <div class="info-item">
              <span class="material-icons">help_outline</span>
              <span>Agregue al menos una pregunta para completar la encuesta</span>
            </div>
          </div>
        </div>
      </template>

      <template v-slot:footer>
        <div class="footer-content">
          <div class="footer-info">
            <span class="material-icons">info</span>
            <span>{{ surveyData.preguntas.length }} pregunta(s) agregada(s)</span>
          </div>
          <div class="footer-actions">
            <div class="action-buttons">
              <ModernButton 
                color="lile" 
                @click="goBack"
                tooltip="Cancelar y volver"
                :disabled="isSaving"
              >
                <span class="material-icons">arrow_back</span>
                Cancelar
              </ModernButton>
              <ModernButton 
                color="green" 
                @click="handleSubmit"
                :disabled="isSaving || surveyData.preguntas.length === 0"
                tooltip="Guardar encuesta completa"
              >
                <LoaderBtn v-if="isSaving" />
                <span v-else class="material-icons">save</span>
                Guardar Encuesta
              </ModernButton>
            </div>
          </div>
        </div>
      </template>
    </ContainerCustom>

    <!-- Modal para agregar pregunta -->
    <ModalCustom 
      v-model:show="showAddQuestionModal"
      title="Agregar Nueva Pregunta"
      icon="quiz"
      :width="60"
      max-width="900px"
      :closable="!isSavingQuestion"
    >
      <template #body>
        <div class="question-form">
          <!-- Texto de la pregunta -->
          <ModernInput
            v-model="questionForm.textoPregunta"
            type="text"
            label="Texto de la Pregunta"
            icon="help_outline"
            @blur="validateQuestionField('textoPregunta', questionForm.textoPregunta)"
            @input="handleQuestionInput('textoPregunta', $event.target.value)"
            placeholder="Escriba aquí el texto de la pregunta..."
            :required="true"
            :error="questionErrors.textoPregunta"
            :disabled="isSavingQuestion"
          />
  <!-- Pregunta obligatoria -->
          <div class="form-group mt-3">
            <label class="input-label">
              <span class="material-icons label-icon">priority_high</span>
              ¿Es obligatoria esta pregunta?
              <span class="required-mark">*</span>
            </label>
            
            <div class="radio-group">
              <div 
                v-for="option in requiredOptions" 
                :key="option.value"
                class="radio-option"
                @click="handleQuestionInput('obligatoria', option.value)"
              >
                <div class="radio-wrapper">
                  <input
                    type="radio"
                    :checked="questionForm.obligatoria === option.value"
                    :value="option.value"
                    class="radio-input"
                    :disabled="isSavingQuestion"
                    @change="handleQuestionInput('obligatoria', option.value)"
                  />
                  <div class="custom-radio">
                    <div v-if="questionForm.obligatoria === option.value" class="radio-dot"></div>
                  </div>
                </div>
                <span class="radio-label">{{ option.label }}</span>
              </div>
            </div>
            
            <span v-if="questionErrors.obligatoria" class="error-text">
              <span class="material-icons">error</span>
              {{ questionErrors.obligatoria }}
            </span>
          </div>

          <!-- Tipo de pregunta -->
          <ModernSelect
            v-model="questionForm.tipoPregunta"
            label="Tipo de Pregunta"
            icon="category"
            :options="questionTypes"
            option-label="label"
            option-value="value"
            placeholder="Seleccione el tipo de pregunta"
            @blur="validateQuestionField('tipoPregunta', questionForm.tipoPregunta)"
            @change="handleQuestionInput('tipoPregunta', $event.target.value)"
            :error="questionErrors.tipoPregunta"
            :disabled="isSavingQuestion"
            :required="true"
          />

        
          <!-- Sección de opciones (solo para múltiple opción/selección) -->
          <div v-if="showOptionsSection" class="options-section mt-4">
            <div class="section-header-small">
              <h4 class="section-title-small">
                <span class="material-icons">list</span>
                Opciones de Respuesta
              </h4>
            </div>

            <!-- Campo para agregar nueva opción -->
            <div class="add-option-container">
              <div class="add-option-row">
                <div class="option-input-wrapper">
                  <ModernInput
                    v-model="newOption"
                    type="text"
                    label="Texto de la Opción"
                    icon="add_circle_outline"
                    placeholder="Escriba el texto de la opción..."
                    :error="optionError"
                    :disabled="isSavingQuestion"
                    @keyup.enter="addOption"
                  />
                </div>
                <div class="add-option-button">
                  <ModernButton 
                    color="blue" 
                    @click="addOption"
                    :disabled="isSavingQuestion || !newOption.trim()"
                    tooltip="Agregar opción"
                  >
                    <span class="material-icons">add</span>
                    Agregar
                  </ModernButton>
                </div>
              </div>
            </div>

            <!-- Tabla de opciones -->
            <div v-if="questionForm.opciones.length > 0" class="options-table">
              <EasyDataTable  
                :headers="optionHeaders" 
                :items="questionForm.opciones"
                header-text-direction="center"
                body-text-direction="center"
                hide-footer
                :table-height="200"
                table-class-name="modern-table"
                theme-color="#667eea"
                class="custom-data-table"
              >
                <template #item-actions="item">
                  <BtnTable 
                    color="red" 
                    @function="removeOption(questionForm.opciones.indexOf(item))"
                    tooltip="Eliminar opción"
                    :disabled="isSavingQuestion"
                  >
                    <span class="material-icons">delete</span>
                  </BtnTable>
                </template>
              </EasyDataTable>
            </div>

            <!-- Mensaje cuando no hay opciones -->
            <div v-else class="no-options-message">
              <span class="material-icons">info</span>
              <span>No se han agregado opciones aún. Agregue al menos una opción para este tipo de pregunta.</span>
            </div>
          </div>
        </div>
      </template>

      <template #footer>
        <div class="modal-footer-buttons">
          <ModernButton 
            color="lile" 
            @click="closeAddQuestionModal"
            :disabled="isSavingQuestion"
            tooltip="Cancelar"
          >
            <span class="material-icons">close</span>
            Cancelar
          </ModernButton>
          <ModernButton 
            color="green" 
            @click="saveQuestion"
            :disabled="isSavingQuestion"
            tooltip="Guardar pregunta"
          >
            <LoaderBtn v-if="isSavingQuestion" />
            <span v-else class="material-icons">save</span>
            Guardar Pregunta
          </ModernButton>
        </div>
      </template>
    </ModalCustom>
  </div>
</template>

<style scoped>
/* Estilos base ya existentes... */
.form-container {
  max-width: 1000px;
  margin: 0 auto;
}

/* Form Groups */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

/* Label Styles */
.input-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #2d3748;
  font-size: 14px;
  cursor: pointer;
}

.label-icon {
  font-size: 18px;
  color: #667eea;
}

.required-mark {
  color: #e53e3e;
  font-weight: bold;
}

/* Textarea Styles */
.textarea-wrapper {
  position: relative;
  display: flex;
  align-items: flex-start;
}

.textarea-wrapper.has-error .modern-textarea {
  border-color: #e53e3e;
  box-shadow: 0 0 0 3px rgba(229, 62, 62, 0.1);
}

.modern-textarea {
  width: 100%;
  padding: 16px 20px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 16px;
  background: #fff;
  transition: all 0.3s ease;
  outline: none;
  font-family: inherit;
  resize: vertical;
  min-height: 100px;
}

.modern-textarea:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.modern-textarea:disabled {
  background-color: #f7fafc;
  cursor: not-allowed;
}

.modern-textarea::placeholder {
  color: #a0aec0;
}

/* Permission Options */
.permission-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-top: 12px;
}

.permission-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fff;
}

.permission-item:hover {
  border-color: #667eea;
  background: rgb(206 218 239)
}

.permission-item:has(.permission-checkbox:checked) {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.05);
}

.radio-wrapper {
  position: relative;
  flex-shrink: 0;
}

.permission-checkbox {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.custom-checkbox {
  width: 20px;
  height: 20px;
  border: 2px solid #e2e8f0;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  background: #fff;
}

.permission-checkbox:checked + .custom-checkbox {
  background: #667eea;
  border-color: #667eea;
  color: white;
}

.custom-checkbox .material-icons {
  font-size: 14px;
}

.permission-content {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.permission-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
  color: white;
}

.permission-icon .material-icons {
  font-size: 20px;
}

.permission-text h4 {
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 4px 0;
}

.permission-text p {
  font-size: 14px;
  color: #718096;
  margin: 0;
}

/* Questions Section */
.questions-section {
  border-top: 1px solid #e2e8f0;
  padding-top: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.section-title .material-icons {
  font-size: 24px;
  color: #667eea;
}

.section-title h3 {
  font-size: 20px;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
}

/* Questions Table */
.questions-table-container {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

.text-danger-custom {
  color: #e53e3e;
}

.text-success-custom {
  color: #38a169;
}

/* Error Text */
.error-text {
  color: #e53e3e;
  font-size: 12px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
}

.error-text .material-icons {
  font-size: 14px;
}

/* Form Info */
.form-info {
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #4a5568;
  font-size: 14px;
}

.info-item .material-icons {
  font-size: 16px;
  color: #667eea;
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

.action-buttons {
  display: flex;
  gap: 12px;
}

/* Modal Styles */
.question-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Radio Group Styles */
.radio-group {
  display: flex;
  gap: 20px;
  margin-top: 12px;
}

.radio-option {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: background-color 0.3s ease;
}

.radio-option:hover {
  background: rgba(102, 126, 234, 0.05);
}

.radio-input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.custom-radio {
  width: 20px;
  height: 20px;
  border: 2px solid #e2e8f0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  background: #fff;
}

.radio-input:checked + .custom-radio {
  border-color: #667eea;
}

.radio-dot {
  width: 10px;
  height: 10px;
  background: #667eea;
  border-radius: 50%;
}

.radio-label {
  font-size: 14px;
  font-weight: 500;
  color: #2d3748;
}

/* Options Section */
.options-section {
  border-top: 1px solid #e2e8f0;
  padding-top: 20px;
}

.section-header-small {
  margin-bottom: 16px;
}

.section-title-small {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
}

.section-title-small .material-icons {
  font-size: 20px;
  color: #667eea;
}

/* Add Option Container */
.add-option-container {
  margin-bottom: 20px;
}

.add-option-row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 16px;
  align-items: end;
}

.option-input-wrapper {
  flex: 1;
}

.add-option-button {
  display: flex;
  align-items: end;
}

/* Options Table */
.options-table {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

/* No Options Message */
.no-options-message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 20px;
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  color: #4a5568;
  font-size: 14px;
}

.no-options-message .material-icons {
  color: #667eea;
  font-size: 18px;
}

/* Modal Footer */
.modal-footer-buttons {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  width: 100%;
}

/* Table Styles */
:deep(.modern-table) {
  --easy-table-border: 1px solid #e2e8f0;
  --easy-table-row-border: 1px solid #f1f1f1;
  --easy-table-header-font-color: #4a5568;
  --easy-table-header-background-color: #f8fafc;
  --easy-table-body-even-row-font-color: #4a5568;
  --easy-table-body-even-row-background-color: #ffffff;
  --easy-table-body-odd-row-font-color: #4a5568;
  --easy-table-body-odd-row-background-color: #f8fafc;
  --easy-table-body-row-hover-font-color: #667eea;
  --easy-table-body-row-hover-background-color: rgba(102, 126, 234, 0.05);
  --easy-table-footer-background-color: #f8fafc;
  --easy-table-footer-font-color: #4a5568;
  --easy-table-scrollbar-thumb-color: #667eea;
  --easy-table-loading-mask-background-color: rgba(255, 255, 255, 0.9);
}

/* Responsive Design */
@media (max-width: 768px) {
  .permission-options {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .permission-item {
    padding: 16px;
  }
  
  .section-header {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
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
  
  .action-buttons {
    width: 100%;
    flex-direction: column-reverse;
  }
  
  .action-buttons :deep(.modern-btn) {
    width: 100%;
    justify-content: center;
  }
  
  .radio-group {
    flex-direction: column;
    gap: 12px;
  }
  
  .add-option-row {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .modal-footer-buttons {
    flex-direction: column-reverse;
  }
  
  .modal-footer-buttons :deep(.modern-btn) {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .form-container {
    padding: 0;
  }
  
  .permission-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .permission-icon {
    width: 32px;
    height: 32px;
  }
  
  .permission-icon .material-icons {
    font-size: 16px;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .input-label {
    color: #b1b6be;
  }
  
  .section-title h3 {
    color: #b1b6be;
  }
  
  .section-title-small {
    color: #b1b6be;
  }
  
  .modern-textarea {
    background: #ffffff;
    color: #474747;
    border-color: #e2e8f0;
  }
  
  .modern-textarea:focus {
    border-color: #667eea;
  }
  
  .modern-textarea:disabled {
    background-color: #f0f3f8;
    color: #718096;
  }
  
  .permission-item {
    background: #ffffff;
    border-color: #e2e8f0;
    color: #bdbaba !important;
  }
  
  .permission-text h4 {
    color: #4b4a4a;
  }
   
  .permission-text p {
    color: #718096;
  }
  
  .custom-checkbox {
    background: #ffffff;
    border-color: #e2e8f0;
  }
  
  .custom-radio {
    background: #ffffff;
    border-color: #e2e8f0;
  }
  
  .radio-label {
    color: #b3afaf;
  }
  
  .questions-table-container {
    background: #ffffff;
    border-color: #e2e8f0;
  }
  
  .options-table {
    background: #ffffff;
    border-color: #e2e8f0;
  }
  
  .form-info {
    background: #f0f3f8;
    border-color: #e2e8f0;
    color: #474747;
  }
  
  .info-item {
    color: #474747;
  }
  
  .no-options-message {
    background: #f0f3f8;
    border-color: #e2e8f0;
    color: #474747;
  }
  
  :deep(.modern-table) {
    --easy-table-border: 1px solid #e2e8f0;
    --easy-table-row-border: 1px solid #f1f1f1;
    --easy-table-header-font-color: #474747;
    --easy-table-header-background-color: #f0f3f8;
    --easy-table-body-even-row-font-color: #474747;
    --easy-table-body-even-row-background-color: #ffffff;
    --easy-table-body-odd-row-font-color: #474747;
    --easy-table-body-odd-row-background-color: #f8fafc;
    --easy-table-body-row-hover-font-color: #667eea;
    --easy-table-body-row-hover-background-color: rgba(102, 126, 234, 0.05);
    --easy-table-footer-background-color: #f0f3f8;
    --easy-table-footer-font-color: #474747;
    --easy-table-scrollbar-thumb-color: #667eea;
    --easy-table-loading-mask-background-color: rgba(255, 255, 255, 0.9);
  }
}
</style>