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
            <span class="material-icons">assignment</span>
          </div>
          <h1 class="app-title">Encuestas App</h1>
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
              v-model.trim="email"
              type="email"
              id="email"
              class="form-input"
              placeholder="tu@email.com"
              required
              autocomplete="email"
            />
          </div>
        </div>

        <!-- Password Field -->
        <div class="form-group">
          <label for="password" class="form-label">Contraseña</label>
          <div class="input-wrapper">
            <div class="input-icon">
              <span class="material-icons">lock</span>
            </div>
            <input
              v-model.trim="password"
              :type="showPassword ? 'text' : 'password'"
              id="password"
              class="form-input"
              placeholder="Tu contraseña"
              required
              autocomplete="current-password"
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
        <ModernButton 
          type="submit" 
          color="primary" 
          :disabled="loading"
          class="login-button"
        >
          <span v-if="loading" class="loading-spinner"></span>
          <span class="material-icons" v-if="!loading">login</span>
          {{ loading ? 'Iniciando sesión...' : 'Iniciar Sesión' }}
        </ModernButton>

        <!-- Error Message -->
        <div v-if="userStore.errorAuth" class="error-message">
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
import { ref } from 'vue';
import '../../assets/styles/auth.css'
import ModernButton from '../../components/ModernButtons/ModernButton.vue';

const userStore = useUserStore();
const email = ref('');
const password = ref('');
const showPassword = ref(false);
const rememberMe = ref(false);
const loading = ref(false);

const handleSubmit = async () => {
  loading.value = true;
  userStore.errorAuth = false;
  
  try {
    await userStore.loginUser(email.value, password.value);
    clearForm();
  } catch (error) {
    console.error('Login error:', error);
  } finally {
    loading.value = false;
  }
};

const clearForm = () => {
  email.value = '';
  password.value = '';
  showPassword.value = false;
};

const togglePassword = () => {
  showPassword.value = !showPassword.value;
};
</script>

<style scoped>

</style>