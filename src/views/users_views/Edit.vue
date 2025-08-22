<script setup>
import { useGetDataUsuarios } from '../../composables/getDataUsuarios.js'
import { onMounted, ref, reactive } from 'vue';
import { useRouter,useRoute } from 'vue-router'
import { alertWarning, alertSuccess, alertError } from '../../constantes/alerts.js';
import ContainerCustom from '../../components/ContainerCustom.vue';
import ModernButton from '../../components/ModernButtons/ModernButton.vue';
import Loading from '../../components/Loading.vue';
import moment from 'moment';
import ModernInput from '../../components/ModernInputs/ModernInput.vue';
import ModernSelect from '../../components/ModernInputs/ModernSelect.vue';
import LoaderBtn from '../../components/LoaderBtn.vue';

const { updateUser,getUserId  } = useGetDataUsuarios();
const router = useRouter();
    const route = useRoute();
    const isloading = ref();
// tabla

// Form data
const formData = reactive({
   usuario:'', 
   contrasena: '',
   nombre: '',
   primer_apellido: '',
   segundo_apellido: '',
   correo: '',
   tipo_usuario: '',
   estado:''
});

// Form state
const isSaving = ref(false);
// Validation
const errors = reactive({
   usuario:'', 
   contrasena: '',
   nombre: '',
   primer_apellido: '',
   segundo_apellido: '',
   correo: '',
   tipo_usuario: '',
   estado:''
});

// Roles disponibles
const roles = [
    { value: 'admin', label: 'Administrador' },
    { value: 'observador', label: 'Observador' }
];

onMounted(() => {
   getUserByid()
});
const getUserByid = async() => {
    const idK = route.params.iduser
    isloading.value=true
    const response = await getUserId(idK);
    isloading.value=false
    const {data, status} = response;
    if (status!=200) {
        alertError("Error","Ocurrio un error al cargar la informacion del usuario",2);
        return
    }
    Object.assign(formData, data[0]);
}
// Validation functions
const validateField = (field, value) => {
    switch (field) {
        case 'nombre':
            if (!value.trim()) {
                errors.nombre = 'El nombre es requerido';
                return false;
            } else if (value.length < 2) {
                errors.nombre = 'El nombre debe tener al menos 2 caracteres';
                return false;
            } else {
                errors.nombre = '';
                return true;
            }
        
        case 'primer_apellido':
            if (!value.trim()) {
                errors.primer_apellido = 'El primer apellido es requerido';
                return false;
            } else if (value.length < 2) {
                errors.primer_apellido = 'El primer apellido debe tener al menos 2 caracteres';
                return false;
            } else {
                errors.primer_apellido = '';
                return true;
            }
        case 'segundo_apellido':
            if (!value.trim()) {
                errors.segundo_apellido = 'El segundo apellido es requerido';
                return false;
            } else if (value.length < 2) {
                errors.segundo_apellido = 'El segundo apellido debe tener al menos 2 caracteres';
                return false;
            } else {
                errors.segundo_apellido = '';
                return true;
            }
        case 'correo':
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!value.trim()) {
                errors.correo = 'El correo es requerido';
                return false;
            } else if (!emailRegex.test(value)) {
                errors.correo = 'Ingrese un correo válido';
                return false;
            } else {
                errors.correo = '';
                return true;
            }
        case 'tipo_usuario':
            if (!value) {
                errors.tipo_usuario = 'Debe seleccionar un tipo de usuario';
                return false;
            } else {
                errors.tipo_usuario = '';
                return true;
            }
        
        default:
            return true;
    }
};

const validateForm = () => {
    const validations = [
        validateField('nombre', formData.nombre),
        validateField('primer_apellido', formData.primer_apellido),
        validateField('segundo_apellido', formData.segundo_apellido),
        validateField('correo', formData.correo),
        validateField('tipo_usuario', formData.tipo_usuario)
    ];
    
    return validations.every(Boolean);
};

const handleSubmit = async () => {
    if (!validateForm()) {
        alertWarning('Por favor, corrija los errores en el formulario');
        return;
    }
    
    isSaving.value = true;
    try {
        formData.usuario = formData.correo;
        const response = await updateUser(formData);
        const {data,status}=response
        if (status === 200 || status === 201) {
            await alertSuccess(
               'Registro exitoso',
               "Redirigiendo a pantalla <strong>Usuarios</strong>",
               3
            );
            // Redirigir o hacer algo
            cleanForm();
            redirectToIndex();
        } else {
            alertError('Error durante el registro');
        }
    } catch (error) {
        console.error('Error:', error);
        alertError('Error durante el registro');
    } finally {
        isSaving.value = false;
    }
};
const cleanForm = () => {
  Object.keys(formData).forEach(key => {
      formData[key] = '';
   });
}
const redirectToIndex = () => {
   cleanForm()
    router.push("/users"); // Volver atrás
};

// Real-time validation
const handleInput = (field, value) => {
    formData[field] = value;
    if (errors[field]) {
        validateField(field, value);
    }
};
</script>

<template>
    <!-- <Loading v-if="isLoading" /> -->
    <div >
        <ContainerCustom 
        :loading="isloading" title="Editar Usuario" subtitle="Formulario para editar informacion del usuario" icon="assignment_ind">
            <template v-slot:body>
               <div class="form-container">
                   
                  <div class="form-row">
                     <ModernInput
                        v-model="formData.usuarioId"
                        type="text"
                        label="ID"
                        icon="numbers"
                        @blur="validateField('usuarioId', formData.usuarioId)"
                        @input="handleInput('usuarioId', $event.target.value)"
                        placeholder="Ingrese su usuarioId"
                        :required="true"
                        :error="errors.usuarioId"
                        :disabled="true"
                     />
                     <ModernInput
                        v-model="formData.nombre"
                        type="text"
                        label="Nombre Completo"
                        icon="person"
                        @blur="validateField('nombre', formData.nombre)"
                        @input="handleInput('nombre', $event.target.value)"
                        placeholder="Ingrese su nombre"
                        :required="true"
                        :error="errors.nombre"
                        :disabled="isSaving"
                     />
                     
                  </div>
                  <div class="form-row">
                    <ModernInput
                        v-model="formData.primer_apellido"
                        type="text"
                        label="Primer apellido"
                        icon="person"
                        @blur="validateField('primer_apellido', formData.primer_apellido)"
                        @input="handleInput('primer_apellido', $event.target.value)"

                        placeholder="Ingrese su primer_apellido"
                        :required="true"
                        :error="errors.primer_apellido"
                        :disabled="isSaving"

                     />
                      <ModernInput
                        v-model="formData.segundo_apellido"
                        type="text"
                        label="Segundo apellido"
                        icon="person"
                        @blur="validateField('segundo_apellido', formData.segundo_apellido)"
                        @input="handleInput('segundo_apellido', $event.target.value)"

                        placeholder="Ingrese su segundo_apellido"
                        :required="true"
                        :error="errors.segundo_apellido"
                        :disabled="isSaving"

                     />
                  </div>
                  <!-- Input de Email -->
                  <ModernInput
                     v-model="formData.correo"
                     type="email"
                     label="Correo Electrónico"
                     @input="handleInput('correo', $event.target.value)"
                     @blur="validateField('correo', formData.correo)"
                     icon="email"
                     placeholder="ejemplo@correo.com"
                     :required="true"
                     :error="errors.correo"
                        :disabled="isSaving"

                  />
                  
                  <!-- Select Simple -->
                  <ModernSelect
                     v-model="formData.tipo_usuario"
                     label="tipo de usuario de usuario"
                     icon="badge"
                     :options="[
                        { nombre: 'Administrador', codigo: '1' },
                        { nombre: 'Monitoreo', codigo: '2' },
                     ]"
                     option-label="nombre"
                     option-value="codigo"
                     placeholder="Seleccione un tipo de usuario"
                     @input="handleInput('tipo_usuario', $event.target.value)"
                     @blur="validateField('tipo_usuario', formData.tipo_usuario)"
                     :error="errors.tipo_usuario"
                        :disabled="isSaving"

                     />
                      <ModernSelect
                     v-model="formData.estado"
                     label="Acceso a la aplicacion"
                     icon="lock_open"
                     :options="[
                        { nombre: 'Habilitado', codigo: '1' },
                        { nombre: 'Deshabilitado', codigo: '0' },
                     ]"
                     option-label="nombre"
                     option-value="codigo"
                     placeholder="Seleccione el nivel de acceso "
                     @input="handleInput('estado', $event.target.value)"
                     @blur="validateField('estado', formData.estado)"
                     :error="errors.estado"
                        :disabled="isSaving"
                     />
                  <!-- Información adicional -->
                  <div class="form-info mt-3">
                        <div class="info-item">
                           <span class="material-icons">info</span>
                           <span>Los campos marcados con * son obligatorios</span>
                        </div>
                        <div class="info-item">
                           <span class="material-icons">security</span>
                           <span>La contraseña debe tener al menos 6 caracteres</span>
                        </div>
                  </div>
               </div>
                
            </template>

            <template v-slot:footer>
                <div class="footer-content">
                    <div class="footer-info">
                        <span class="material-icons">info</span>
                        <span>Complete todos los campos requeridos</span>
                    </div>
                    <div class="footer-actions">
                        <!-- <span class="last-update">Última actualización: {{ updated_at }}</span> -->
                        <div class="action-buttons">
                            <ModernButton 
                                color="lile" 
                                :function="redirectToIndex"
                                tooltip="Cancelar y volver"
                                :disabled="isSaving"
                            >
                                <span class="material-icons">arrow_back</span>
                                Cancelar
                            </ModernButton>
                            <ModernButton 
                                color="purple" 
                                :function="handleSubmit"
                                :disabled="isSaving"
                                tooltip="Guardar cambios del formulario"
                            >
                                 <LoaderBtn v-if="isSaving" />
                                <span v-else class="material-icons">save</span>

                                Guardar cambios
                            </ModernButton>
                        </div>
                    </div>
                </div>
            </template>
        </ContainerCustom>
    </div>
</template>

<style scoped>
.form-container {
    max-width: 800px;
    margin: 0 auto;
}


/* Form Row para campos lado a lado */
.form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
}

/* Form Groups */
.form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
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

.last-update {
    color: #718096;
    font-size: 12px;
}

/* Responsive */
@media (max-width: 768px) {
    .form-row {
        grid-template-columns: 1fr;
        gap: 16px;
    }
    
    
    
    .form-input,
    .form-select {
        padding: 14px 16px;
        font-size: 16px; /* Evita zoom en iOS */
    }
    
    .form-select {
        padding-right: 44px;
    }
    
    .footer-content {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
    }
    
    .footer-actions {
        width: 100%;
        justify-content: space-between;
        flex-direction: column;
        gap: 12px;
    }
    
    .action-buttons {
        width: 100%;
        flex-direction: column-reverse;
    }
    
    .action-buttons :deep(.modern-btn) {
        width: 100%;
        justify-content: center;
    }
}

@media (max-width: 480px) {
    .form-container {
        padding: 0;
    }
    
    .form-input,
    .form-select {
        padding: 12px 16px;
    }
    
    .form-select {
        padding-right: 40px;
    }
    
    .password-toggle {
        right: 12px;
    }
    
    .select-arrow {
        right: 12px;
    }
}

/* Animation para campos con error */
.input-wrapper.has-error,
.select-wrapper.has-error {
    animation: shake 0.5s ease-in-out;
}

@keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-4px); }
    75% { transform: translateX(4px); }
}


</style>