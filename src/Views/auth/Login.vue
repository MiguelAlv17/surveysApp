<template>
  <div class="login-container">
    <!-- Background Effects -->
    <div class="background-effects">
      <div class="floating-shapes">
        <div class="shape shape-1"></div>
        <div class="shape shape-2"></div>
        <div class="shape shape-3"></div>
        <div class="shape shape-4"></div>
        <div class="shape shape-5"></div>
      </div>
    </div>

    <!-- Main Login Card -->
    <div class="login-card">
      <!-- Header -->
      <div class="login-header">
        <div class="logo-container">
          <div class="logo-icon">
            <span class="material-icons">account_balance</span>
          </div>
          <h1 class="app-title">DVR-RECAUDACION APP</h1>
        </div>
        <p class="login-subtitle">Inicio de sesion</p>
      </div>

      <!-- Login Form -->
      <form @submit.prevent="handleSubmit" class="login-form">
        <!-- Email Field -->
        <div class="form-group">
          <label for="email" class="form-label">Correo Electrónico</label>
          <div class="input-wrapper">
            <div class="input-icon">
              <span class="material-icons">person</span>
            </div>
            <input
              v-model.trim="userData.username"
              type="email"
              id="email"
              class="form-input"
              placeholder="tu@email.com"
              required
              autocomplete="email"
               @blur="validateField('username', userData.username)"
                  @input="handleInput('username', $event.target.value)"
            />
          </div>
            <span v-if="errors.username" class="error-message">
                {{ errors.username }}
              </span>
        </div>

        <!-- Password Field -->
        <div class="form-group">
          <label for="password" class="form-label">Contraseña</label>
          <div class="input-wrapper">
            <div class="input-icon">
              <span class="material-icons">lock</span>
            </div>
            <input
              v-model.trim="userData.password"
              :type="showPassword ? 'text' : 'password'"
              id="password"
              class="form-input"
              placeholder="Tu contraseña"
              required
              autocomplete="current-password"
                @blur="validateField('password', userData.password)"
                @input="handleInput('password', $event.target.value)"
            />
            <button
              type="button"
              class="password-toggle"
              @click="togglePassword"
              tabindex="-1"
            >
              <span class="material-icons">
                {{ showPassword ? 'visibility_off' : 'visibility' }}
              </span>
            </button>
          </div>
           <span v-if="errors.password" class="error-message">
                {{ errors.password }}
              </span>
        </div>

        <!-- Remember Me -->
        <!-- <div class="form-options">
          <label class="checkbox-container">
            <input type="checkbox" v-model="rememberMe" />
            <span class="checkmark"></span>
            Recordarme
          </label>
          <a href="#" class="forgot-password">¿Olvidaste tu contraseña?</a>
        </div> -->

        <!-- Submit Button -->
        <ButtonCustom 
          type="submit" 
          color="green" 
          :disabled="loading"
          class="login-button"
        >
          <span v-if="loading" class="loading-spinner"></span>
          <span class="material-icons" v-if="!loading">login</span>
          {{ loading ? 'Iniciando sesión...' : 'Iniciar Sesión' }}
        </ButtonCustom>

        <!-- Error Message -->
        <div v-if="errorAuth!=''" class="error-message">
            <span class="material-icons">error</span>
            <span>Las credenciales son incorrectas. Inténtalo de nuevo.</span>
        </div>
    </form>

      <!-- Footer -->
      <div class="login-footer">
        <!-- <p>¿No tienes una cuenta? <a href="#" class="signup-link">Regístrate aquí</a></p> -->
      </div>
    </div>
  </div>
</template>

<script setup>
import { useUserStore } from '../../stores/user';
import { reactive, ref } from 'vue';
import '../../assets/styles/Login.css'
import ButtonCustom from '../Components/ButtonCustom.vue';
import { alert_error } from '../../constants/alerts';
import { useRouter } from 'vue-router'
    const router = useRouter();

const loading = ref(false);
const showPassword = ref(false);
const errorAuth = ref("");
const userData = reactive({
    username:"developerzz@zz.com",
    password:"123456"
});
const {loginUser} =useUserStore()
const errors = reactive({
    username:"",
    password:""
});
// Validación del formulario
const validateField = (field, value) => {
  switch (field) {
    case 'username':
      if (!value.trim()) {
        errors.username = 'El usuario es requerido';
        return false;
      } else if (value.length < 3) {
        errors.username = 'El usuario debe tener al menos 3 caracteres';
        return false;
      } else {
        errors.username = '';
        return true;
      }
    
    case 'password':
      if (!value.trim()) {
        errors.password = 'La contraseña es requerida';
        return false;
      } else if (value.length < 6) {
        errors.password = 'La contraseña debe tener al menos 6 caracteres';
        return false;
      } else {
        errors.password = '';
        return true;
      }
    
    default:
      return true;
  }
};
const handleInput = (field, value) => {
  userData[field] = value;
  if (errors[field]) {
    validateField(field, value);
  }
};

const validateForm = () => {
  const validations = [
    validateField('username', userData.username),
    validateField('password', userData.password)
  ];
  
  return validations.every(Boolean);
};
const handleSubmit = async () => {
  if (!validateForm()) {
    alert_error('Por favor, corrige los errores en el formulario');
    return;
  }
  loading.value = true;
   const response = await loginUser(userData.username, userData.password)
   const {status,message} =response
   if (status==400) {
    errorAuth.value = message;
    return
   }    
    router.push('/')

  
};

</script>

<style scoped>

</style>