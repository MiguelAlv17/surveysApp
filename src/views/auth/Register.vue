<template>
    <div class="container-fluid">
        <div class="content">
                  <img :src="imagen" alt="Imagen" />
            </div>
        <div class="sidebar ">
           <div class="form-section">
            <h2 class="titleRegister mb-5">Registro de Usuario</h2>
            <form @submit.prevent="submitForm">
              <div class="mb-3">
                <label for="nombre" class="form-label">Nombre:</label>
                <input type="text" id="nombre" class="form-control form-control-sm" v-model="nombre" required>
              </div>
              <div class="mb-3">
                <label for="email" class="form-label">Correo Electrónico:</label>
                <input type="email" id="email" class="form-control form-control-sm" v-model="email" required>
              </div>
              <div class="mb-3">
                <label for="password" class="form-label">Contraseña</label>
                <input type="password" id="password" class="form-control form-control-sm" v-model="password" required>
              </div>
              <div class="mb-3">
                <label for="confirm-password" class="form-label">Verificación de Contraseña:</label>
                <input type="password" id="confirm-password" class="form-control form-control-sm" v-model="confirmPassword" required>
              </div>
              <div class="d-grid gap-2 mt-5">
                <button  type="submit" class="btn btn-success" >Registrarse</button>
                </div>
            </form>
          </div>
        </div>
    </div>
</template>
<script setup>
  import { useUserStore } from '../../stores/user';
  import { ref } from 'vue';
  // import imagen from '../../assets/img1.jpg';
  import '../../assets/styles/auth.css'

  const userStore = useUserStore();
    
</script>








