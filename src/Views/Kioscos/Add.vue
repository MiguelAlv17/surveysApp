<script setup>
import { reactive, ref, onMounted, onUnmounted } from 'vue';
import ContainerCustom from '../Components/ContainerCustom.vue';
import ButtonCustom from '../Components/ButtonCustom.vue';
import TitleContainer from '../Components/TitleContainer.vue';
import Loader from '../Components/Loader.vue';
import { alert_error, alert_success } from '../../constants/alerts';
import ModernInput from '../Components/ModernInputs/ModernInput.vue'
import ModernSelect from '../Components/ModernInputs/ModernSelect.vue'

import { useRouter } from 'vue-router'

// router
const router = useRouter();
// loaders
const isLoading = ref(false);
const isSaving = ref(false);
// extras
const formData = reactive({
  name_device: '',
  logmein: '',
  located_at: '',
  id_kiosco_recaudacion: '',
  clave_recaudacion: '',
  tipo: ''
})
const errors = reactive({
  name_device: '',
  logmein: '',
  located_at: '',
  id_kiosco_recaudacion: '',
  clave_recaudacion: '',
  tipo: ''
})

// functions
onMounted( () => {
  clearForm();
});

const handleSubmit = async()=> {
   if (!validateForm()) {
      alert_warning('Por favor, corrija los errores en el formulario');
      return;
  }
  isLoading.value = true;
  const infoK = JSON.parse(JSON.stringify(formData))
  console.log(infoK);
  const response = await window.api.addKiosco(infoK)
  const {status, data}  = response;
  isLoading.value = false;
  if (status!=200) {
    alert_error("Ocurrio un error al insertar el registro");
    return
  }
  alert_success("Registro guardado correctamente");
  clearForm();
}

const clearForm = () => {
  formData.value = {
      name_device: '',
      logmein: '',
      located_at: '',
      id_kiosco_recaudacion: '',
      clave_recaudacion: '',
      tipo: ''
    }
}

const goback = () => {
   router.push('/kioscos')
}

const validateField = (field, value) => {
   switch (field) {
        case 'name_device':
            if (!value.trim()) {
                errors.name_device = 'El nombre es requerido';
                return false;
            } else if (value.length < 2) {
                errors.name_device = 'El nombre debe tener al menos 2 caracteres';
                return false;
            } else {
                errors.name_device = '';
                return true;
            }
        
        case 'logmein':
            if (!value.trim()) {
                errors.logmein = 'El logmein es requerido';
                return false;
            } else if (value.length < 2) {
                errors.logmein = 'El logmein debe tener al menos 2 caracteres';
                return false;
            } else {
                errors.logmein = '';
                return true;
            }
        case 'located_at':
             if (!value.trim()) {
                errors.located_at = 'El nombre de la carpeta es requerido';
                return false;
            } else if (length > 2) {
                errors.located_at = 'El nombre de la carpeta debe tener al menos 2 caracteres';
                return false;
            } else if (/\s/.test(value)) {
                errors.located_at = 'El nombre de la carpeta no puede contener espacios';
                return false;
            } else if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
                errors.located_at = 'Solo se permiten letras, números, guiones y guiones bajos';
                return false;
            } else {
                errors.located_at = '';
                return true;
            }
        
        
        case 'clave_recaudacion':
            if (!value) {
                errors.clave_recaudacion = 'La clave de recaudacion es requerida';
                return false;
            } else if (value.length < 2) {
                errors.clave_recaudacion = 'La clave de recaudacion debe tener al menos 2 caracteres';
                return false;
            } else {
                errors.clave_recaudacion = '';
                return true;
            }
        case 'id_kiosco_recaudacion':
            if (!value) {
                errors.id_kiosco_recaudacion = 'El ID del kiosco es requerida';
                return false;
            } else if (value.length < 2) {
                errors.id_kiosco_recaudacion = 'El ID del kiosco debe tener al menos 2 caracteres';
                return false;
            } else {
                errors.id_kiosco_recaudacion = '';
                return true;
            }
        
        case 'tipo':
            if (!value) {
                errors.tipo = 'Debe seleccionar un tipo de kiosco';
                return false;
            } else {
                errors.tipo = '';
                return true;
            }
        
        default:
            return true;
    }
}

const handleInput = (field, value) => {
    formData[field] = value;
    if (errors[field]) {
        validateField(field, value);
    }
};
const validateForm = () => {
    const validations = [
        validateField('name_device', formData.name_device),
        validateField('logmein', formData.logmein),
        validateField('located_at', formData.located_at),
        validateField('id_kiosco_recaudacion', formData.id_kiosco_recaudacion),
        validateField('clave_recaudacion', formData.clave_recaudacion),
        validateField('tipo', formData.tipo)
    ];
    
    return validations.every(Boolean);
};
</script>

<template>
    <Loader v-if="isLoading"/>
    
    <ContainerCustom 
        v-else
        title="REGISTRO DE KIOSCOS"
        subtitle="Agrega un nuevo kiosco al sistema de recaudación"
        icon="add_circle"
        header-background="gradient"
    >
        <template #body>
            <!-- Información del Formulario -->
            <div class="form-info-section">
                <div class="info-card">
                    <div class="info-header">
                        <span class="material-icons info-icon">info</span>
                        <h3 class="info-title">Información del Formulario</h3>
                    </div>
                    <div class="info-content">
                        <div class="info-grid">
                            <div class="info-item">
                                <span class="material-icons">check_circle</span>
                                <span>Completa todos los campos requeridos</span>
                            </div>
                            <div class="info-item">
                                <span class="material-icons">security</span>
                                <span>Los datos serán validados automáticamente</span>
                            </div>
                            <div class="info-item">
                                <span class="material-icons">save</span>
                                <span>El registro se guarda inmediatamente</span>
                            </div>
                            <div class="info-item">
                                <span class="material-icons">visibility</span>
                                <span>Podrás ver el kiosco en el listado principal</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Formulario Principal -->
            <div class="form-section">
                <div class="form-card">
                    <div class="form-header">
                        <span class="material-icons form-icon">desktop_windows</span>
                        <h3 class="form-title">Datos del Kiosco</h3>
                    </div>
                    
                    <div class="form-content">
                        <form class="modern-form">
                            <!-- Información Básica -->
                            <div class="form-group-section">
                                <h4 class="section-title">
                                    <span class="material-icons">info</span>
                                    Información Básica
                                </h4>
                                
                                <div class="form-row">
                                    <div class="form-field full-width">
                                        <!-- INPUT ORIGINAL SIN MODIFICAR -->
                                        <ModernInput
                                            v-model="formData.name_device"
                                            type="text"
                                            label="Nombre del disposisitvo"
                                            icon="desktop_windows"
                                            @blur="validateField('name_device', formData.name_device)"
                                            @input="handleInput('name_device', $event.target.value)"
                                            placeholder="Ej. Recaudadora Dolores"
                                            :required="true"
                                            :error="errors.name_device"
                                            :disabled="isSaving"
                                        />
                                    </div>
                                </div>

                                <div class="form-row">
                                    <div class="form-field">
                                        <!-- INPUT ORIGINAL SIN MODIFICAR -->
                                        <ModernInput
                                            v-model="formData.logmein"
                                            type="text"
                                            label="Nombre en LogMein"
                                            icon="desktop_windows"
                                            @blur="validateField('logmein', formData.logmein)"
                                            @input="handleInput('logmein', $event.target.value)"
                                            placeholder="Ej. ABASOLO-M"
                                            :required="true"
                                            :error="errors.logmein"
                                            :disabled="isSaving"
                                        />
                                    </div>

                                    <div class="form-field">
                                        <!-- INPUT ORIGINAL SIN MODIFICAR -->
                                        <ModernInput
                                            v-model="formData.located_at"
                                            type="text"
                                            label="Nombre de la carpeta (zz/kioscos/db)"
                                            icon="folder"
                                            @blur="validateField('located_at', formData.located_at)"
                                            @input="handleInput('located_at', $event.target.value)"
                                            placeholder="Ej. Abasolo_m"
                                            :required="true"
                                            :error="errors.located_at"
                                            :disabled="isSaving"
                                        />
                                    </div>
                                </div>
                            </div>

                            <!-- Configuración del Sistema -->
                            <div class="form-group-section">
                                <h4 class="section-title">
                                    <span class="material-icons">settings</span>
                                    Configuración de recaudacion
                                </h4>
                                
                                <div class="form-row">
                                    <div class="form-field">
                                        <!-- SELECT ORIGINAL SIN MODIFICAR -->
                                        <ModernSelect
                                            v-model="formData.tipo"
                                            label="Tipo de kiosco"
                                            icon="format_list_bulleted"
                                            :options="[
                                                { nombre: 'MULTISERVICIOS', codigo: '1' },
                                                { nombre: 'COBRADOR', codigo: '2' },
                                            ]"
                                            option-label="nombre"
                                            option-value="codigo"
                                            placeholder="Seleccione un tipo de usuario"
                                            @input="handleInput('tipo', $event.target.value)"
                                            @blur="validateField('tipo', formData.tipo)"
                                            :error="errors.tipo"
                                            :disabled="isSaving"
                                        />
                                    </div>

                                    <div class="form-field">
                                        <!-- INPUT ORIGINAL SIN MODIFICAR -->
                                        <ModernInput
                                            v-model="formData.id_kiosco_recaudacion"
                                            type="text"
                                            label="ID Kiosco Recaudación"
                                            icon="desktop_windows"
                                            @blur="validateField('id_kiosco_recaudacion', formData.id_kiosco_recaudacion)"
                                            @input="handleInput('id_kiosco_recaudacion', $event.target.value)"
                                            placeholder="Ej. 1331"
                                            :required="true"
                                            :error="errors.id_kiosco_recaudacion"
                                            :disabled="isSaving"
                                        />
                                    </div>

                                    <div class="form-field">
                                        <!-- INPUT ORIGINAL SIN MODIFICAR -->
                                        <ModernInput
                                            v-model="formData.clave_recaudacion"
                                            type="text"
                                            label="Clave de Recaudación"
                                            icon="desktop_windows"
                                            @blur="validateField('clave_recaudacion', formData.clave_recaudacion)"
                                            @input="handleInput('clave_recaudacion', $event.target.value)"
                                            placeholder="Ej. 331"
                                            :required="true"
                                            :error="errors.clave_recaudacion"
                                            :disabled="isSaving"
                                        />
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

           
        </template>

        <template #footer>
            <div class="footer-content">
                <div class="footer-info">
                    <span class="material-icons">info</span>
                    <div class="info-text">
                        <span class="info-title">¿Listo para guardar?</span>
                        <span class="info-description">
                            Revisa que todos los datos sean correctos antes de continuar
                        </span>
                    </div>
                </div>
                
                <div class="footer-actions">
                    <!-- BOTONES ORIGINALES SIN MODIFICAR -->
                    <ButtonCustom 
                        color="gray" 
                        @click="goback"
                        tooltip="Cancelar registro"
                    >
                        <span class="material-icons">cancel</span>
                        Cancelar
                    </ButtonCustom>
                    
                    <ButtonCustom 
                        color="green" 
                        @click="handleSubmit"
                        tooltip="Guardar registro"
                    >
                        <span class="material-icons">save</span>
                        Guardar
                    </ButtonCustom>
                </div>
            </div>
        </template>
    </ContainerCustom>
</template>

<style scoped>
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

/* ===================================
   SECCIÓN DEL FORMULARIO
   =================================== */

.form-section {
    margin-bottom: var(--spacing-2xl);
}

.form-card {
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius-lg);
    box-shadow: var(--shadow-sm);
    overflow: hidden;
    transition: all var(--transition-normal);
}

.form-card:hover {
    box-shadow: var(--shadow-md);
}

.form-header {
    background: linear-gradient(135deg, #4caf50 0%, #388e3c 100%);
    color: var(--text-white);
    padding: var(--spacing-lg) var(--spacing-xl);
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
}

.form-icon {
    font-size: 20px;
}

.form-title {
    margin: 0;
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-semibold);
}

.form-content {
    padding: var(--spacing-2xl);
}

.modern-form {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-2xl);
}

/* ===================================
   SECCIONES DEL FORMULARIO
   =================================== */

.form-group-section {
    background: var(--bg-secondary);
    border-radius: var(--border-radius-md);
    padding: var(--spacing-xl);
    border: 1px solid var(--border-color);
}

.section-title {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    margin: 0 0 var(--spacing-xl) 0;
    font-size: var(--font-size-md);
    font-weight: var(--font-weight-semibold);
    color: var(--text-primary);
    padding-bottom: var(--spacing-md);
    border-bottom: 2px solid var(--border-color);
}

.section-title .material-icons {
    font-size: 20px;
    color: var(--primary-color);
}

.form-row {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-xl);
    margin-bottom: var(--spacing-lg);
}

.form-row:last-child {
    margin-bottom: 0;
}

.form-field {
    display: flex;
    flex-direction: column;
}

.form-field.full-width {
    grid-column: 1 / -1;
}

/* ===================================
   VISTA PREVIA
   =================================== */

.preview-section {
    margin-bottom: var(--spacing-2xl);
}

.preview-card {
    background: var(--bg-glass);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius-lg);
    box-shadow: var(--shadow-sm);
    overflow: hidden;
    transition: all var(--transition-normal);
}

.preview-card:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-1px);
}

.preview-header {
    background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
    color: var(--text-white);
    padding: var(--spacing-lg) var(--spacing-xl);
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
}

.preview-icon {
    font-size: 20px;
}

.preview-title {
    margin: 0;
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-semibold);
}

.preview-content {
    padding: var(--spacing-xl);
}

.preview-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-lg);
    margin-bottom: var(--spacing-2xl);
}

.preview-item {
    background: var(--bg-primary);
    padding: var(--spacing-lg);
    border-radius: var(--border-radius-md);
    border: 1px solid var(--border-color);
    transition: all var(--transition-normal);
}

.preview-item:hover {
    background: var(--bg-secondary);
    transform: translateY(-1px);
}

.preview-label {
    font-size: var(--font-size-xs);
    color: var(--text-tertiary);
    margin-bottom: var(--spacing-xs);
    font-weight: var(--font-weight-medium);
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.preview-value {
    font-size: var(--font-size-sm);
    color: var(--text-primary);
    font-weight: var(--font-weight-semibold);
    min-height: 20px;
    display: flex;
    align-items: center;
}

.preview-value:empty::after {
    content: 'Sin especificar';
    color: var(--text-light);
    font-style: italic;
    font-weight: var(--font-weight-normal);
}

/* ===================================
   INDICADOR DE PROGRESO
   =================================== */

.completion-indicator {
    background: var(--bg-primary);
    padding: var(--spacing-lg);
    border-radius: var(--border-radius-md);
    border: 1px solid var(--border-color);
}

.completion-bar {
    width: 100%;
    height: 8px;
    background: var(--bg-tertiary);
    border-radius: var(--border-radius-full);
    overflow: hidden;
    margin-bottom: var(--spacing-md);
}

.completion-fill {
    height: 100%;
    background: linear-gradient(90deg, #4caf50 0%, #8bc34a 100%);
    border-radius: var(--border-radius-full);
    transition: width 0.3s ease;
    position: relative;
}

.completion-fill::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, 
        transparent 0%, 
        rgba(255, 255, 255, 0.4) 50%, 
        transparent 100%);
    animation: progressShine 2s ease-in-out infinite;
}

@keyframes progressShine {
    0% { left: -100%; }
    100% { left: 100%; }
}

.completion-text {
    text-align: center;
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
    font-weight: var(--font-weight-medium);
}

/* ===================================
   FOOTER
   =================================== */

.footer-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--spacing-lg);
    width: 100%;
}

.footer-info {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
}

.footer-info .material-icons {
    color: var(--success-color);
    font-size: 24px;
}

.info-text {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
}

.info-title {
    font-weight: var(--font-weight-semibold);
    color: var(--text-primary);
    font-size: var(--font-size-sm);
}

.info-description {
    font-size: var(--font-size-xs);
    color: var(--text-tertiary);
}

.footer-actions {
    display: flex;
    align-items: center;
    gap: var(--spacing-lg);
}

/* ===================================
   RESPONSIVE DESIGN
   =================================== */

@media (max-width: 1024px) {
    .info-grid {
        grid-template-columns: 1fr;
    }
    
    .preview-grid {
        grid-template-columns: 1fr;
    }
    
    .form-row {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 768px) {
    .form-content {
        padding: var(--spacing-xl);
    }
    
    .form-group-section {
        padding: var(--spacing-lg);
    }
    
    .info-content,
    .preview-content {
        padding: var(--spacing-lg);
    }
    
    .footer-content {
        flex-direction: column;
        align-items: stretch;
        text-align: center;
        gap: var(--spacing-lg);
    }
    
    .footer-actions {
        justify-content: center;
        flex-wrap: wrap;
    }
}

@media (max-width: 480px) {
    .info-header,
    .form-header,
    .preview-header {
        padding: var(--spacing-md);
    }
    
    .info-content,
    .form-content,
    .preview-content {
        padding: var(--spacing-md);
    }
    
    .form-group-section {
        padding: var(--spacing-md);
    }
    
    .footer-actions {
        flex-direction: column;
        width: 100%;
    }
    
    .footer-actions .ButtonCustom {
        width: 100%;
    }
}

/* ===================================
   ANIMACIONES
   =================================== */

.form-info-section,
.form-section,
.preview-section {
    animation: slideUp 0.6s ease-out;
}

.form-section {
    animation-delay: 0.1s;
}

.preview-section {
    animation-delay: 0.2s;
}

.info-item,
.preview-item {
    animation: slideUp 0.6s ease-out;
}

.info-item:nth-child(1) { animation-delay: 0.1s; }
.info-item:nth-child(2) { animation-delay: 0.2s; }
.info-item:nth-child(3) { animation-delay: 0.3s; }
.info-item:nth-child(4) { animation-delay: 0.4s; }

.preview-item:nth-child(1) { animation-delay: 0.1s; }
.preview-item:nth-child(2) { animation-delay: 0.2s; }
.preview-item:nth-child(3) { animation-delay: 0.3s; }
.preview-item:nth-child(4) { animation-delay: 0.4s; }
.preview-item:nth-child(5) { animation-delay: 0.5s; }
.preview-item:nth-child(6) { animation-delay: 0.6s; }

.section-title .material-icons {
    animation: pulse 3s ease-in-out infinite;
}

@keyframes pulse {
    0%, 100% {
        opacity: 1;
        transform: scale(1);
    }
    50% {
        opacity: 0.8;
        transform: scale(0.95);
    }
}
@media (prefers-color-scheme: dark) {
  .info-title {
    color: var(--text-white);
  }
}
</style>