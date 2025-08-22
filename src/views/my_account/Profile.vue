<script setup>
import { useGetDataUsuarios } from '../../composables/getDataUsuarios.js'
import { onMounted, ref, reactive } from 'vue';
import { useRouter } from 'vue-router'
import { alertWarning, alertSuccess, alertError } from '../../constantes/alerts.js';
import ContainerCustom from '../../components/ContainerCustom.vue';
import ModernButton from '../../components/ModernButtons/ModernButton.vue';
import ModernInput from '../../components/ModernInputs/ModernInput.vue';
import LoaderBtn from '../../components/LoaderBtn.vue';
import { useUserStore } from '../../stores/user';

const {logout} = useUserStore();

const { addUser } = useGetDataUsuarios();
const router = useRouter();

// Form data
const formData = reactive({
   usuario: '',
   correo: '',
   tipo_usuario: '',
   contrasena_v:'',
   contrasena:'',

});

// Form state
const isSaving = ref(false);
// Validation
const errors = reactive({
   usuario: '',
   correo: '',
   tipo_usuario: '',
   contrasena_v:'',
   contrasena:'',

});

// Roles disponibles
const roles = [
    { value: 'admin', label: 'Administrador' },
    { value: 'observador', label: 'Observador' }
];

onMounted(() => {
   getUserInfo()
});
const  getUserInfo = () => {
   formData.correo=localStorage.getItem('email');
    // formData.nombre=localStorage.getItem('userName');
    const rol_number = localStorage.getItem('userRole');
    formData.tipo_usuario = rol_number==1?"Administrador":"Monitoreo"
}
// Validation functions
const validateField = (field, value) => {
    switch (field) {
        // case 'nombre':
        //     if (!value.trim()) {
        //         errors.nombre = 'El nombre es requerido';
        //         return false;
        //     } else if (value.length < 2) {
        //         errors.nombre = 'El nombre debe tener al menos 2 caracteres';
        //         return false;
        //     } else {
        //         errors.nombre = '';
        //         return true;
        //     }
        
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
        
        case 'contrasena':
            if (!value) {
                errors.contrasena = 'La contraseña es requerida';
                return false;
            } else if (value.length < 6) {
                errors.contrasena = 'La contraseña debe tener al menos 6 caracteres';
                return false;
            } else {
                errors.contrasena = '';
                return true;
            }
        case 'contrasena_v':
            if (!value) {
                errors.contrasena_v = 'La contraseña de comprobacion es requerida';
                return false;
            } else if (value.length < 6) {
                errors.contrasena_v = 'La contraseña de comprobacion debe tener al menos 6 caracteres';
                return false;
            } else {
                errors.contrasena_v = '';
                return true;
            }
        // case 'tipo_usuario':
        //     if (!value) {
        //         errors.tipo_usuario = 'Debe seleccionar un tipo de usuario';
        //         return false;
        //     } else {
        //         errors.tipo_usuario = '';
        //         return true;
        //     }
        
        default:
            return true;
    }
};

const validateForm = () => {
    const validations = [
        // validateField('nombre', formData.nombre),
        validateField('correo', formData.correo),
        validateField('contrasena', formData.contrasena),
        validateField('contrasena_v', formData.contrasena_v),
    ];
    
    return validations.every(Boolean);
};
const validatePassword = () => {
    if (formData.contrasena== formData.contrasena_v) {
        return true
    }else{
        errors.contrasena = "Las contraseñas no coinciden"
        errors.contrasena_v = "Las contraseñas no coinciden"
    }
}
const handleSubmit = async () => {
    if (!validateForm()) {
        alertWarning('Por favor, corrija los errores en el formulario');
        return;
    }
    if (!validatePassword()) {
        alertWarning('Por favor, corrija los errores en el formulario');
        return;
        
    }
    isSaving.value = true;
    try {
        formData.usuario = formData.correo;
        const userInfo = {
            usuario:formData.usuario, 
            contrasena: formData.contrasena,
            correo: formData.usuario,
            usuarioId: localStorage.getItem('userid')
        };
        const response = await addUser(userInfo);
        const {data,status}=response
        if (status === 200 || status === 201) {
            await alertSuccess(
               'Actualizacion exitosa',
               "Redirigiendo a pantalla <strong>Login</strong>",
               3
            );
            // Redirigir o hacer algo
            logout();
            cleanForm();
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
   Object.keys(errors).forEach(key => {
      errors[key] = '';
   });
   getUserInfo()
}
const redirectToIndex = () => {
   cleanForm()
    // router.push("/users"); // Volver atrás
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
        <ContainerCustom title="Editar perfil" subtitle="Formulario para editar mi informacion" icon="account_circle">
            <template v-slot:body>
               <div class="form-container">
                  <!-- <div class="form-row"> -->
                  <!-- </div> -->
<!-- 
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
                     /> -->
                     
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
                  <!-- Input de Contraseña -->
                  <ModernInput
                     v-model="formData.contrasena"
                     type="password"
                     label="Contraseña"
                     icon="lock"
                     placeholder="Mínimo 6 caracteres"
                     :required="true"
                     @input="handleInput('contrasena', $event.target.value)"
                     @blur="validateField('contrasena', formData.contrasena)"
                     :error="errors.contrasena"
                        :disabled="isSaving"
                  />
                  <ModernInput
                     v-model="formData.contrasena_v"
                     type="password"
                     label="Contraseña verificacion"
                     icon="lock"
                     placeholder="Mínimo 6 caracteres"
                     :required="true"
                     @input="handleInput('contrasena_v', $event.target.value)"
                     @blur="validateField('contrasena_v', formData.contrasena_v)"
                     :error="errors.contrasena_v"
                        :disabled="isSaving"
                  />
                  <!-- Select Simple -->
                  <ModernInput
                        v-model="formData.tipo_usuario"
                        type="text"
                        label="Rol de usuario"
                        icon="person"
                        :disabled="true"
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
                                tooltip="Actualizar informacion"
                            >
                                 <LoaderBtn v-if="isSaving" />
                                <span v-else class="material-icons">save</span>

                                Guardar Usuario
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


@media (prefers-color-scheme: dark) {
    .footer-info {
        color: #bfb9c2;
    }
}
</style>