<script setup>
import   '../../assets/styles/modernDesign.css'
import   '../../assets/styles/Navbar.css'

import { ref, onMounted, onUnmounted } from 'vue'
import {useUserStore} from '../../stores/user'
// Estado del dropdown del perfil
const showProfileDropdown = ref(false)
const isScrolled = ref(false)
const {logout} = useUserStore()
// Función para manejar el scroll y añadir efecto al navbar
const handleScroll = () => {
  isScrolled.value = window.scrollY > 10
}

// Función para cerrar dropdown al hacer clic fuera
const closeDropdown = () => {
  showProfileDropdown.value = false
}

// Función para toggle del dropdown
const toggleProfileDropdown = () => {
  showProfileDropdown.value = !showProfileDropdown.value
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  document.addEventListener('click', closeDropdown)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  document.removeEventListener('click', closeDropdown)
})
</script>

<template>
  <nav class="modern-navbar" :class="{ 'navbar-scrolled': isScrolled }">
    <div class="navbar-container">
      <!-- Brand/Logo -->
      <router-link to="/" class="navbar-brand">
        <div class="brand-icon">
          <span class="material-icons">account_balance</span>
        </div>
        <span class="brand-text">Recaudacion App</span>
      </router-link>

      <!-- Navigation Links -->
      <ul class="navbar-nav">
        <li class="nav-item">
          <router-link to="/" class="nav-link" active-class="active">
            <span class="material-icons nav-icon">home</span>
            <span class="nav-text">Inicio</span>
          </router-link>
        </li>
        
        <li class="nav-item">
          <router-link to="/recaudacion" class="nav-link" active-class="active">
            <span class="material-icons nav-icon">paid</span>
            <span class="nav-text">Recaudación</span>
          </router-link>
        </li>
        
        <li class="nav-item">
          <router-link to="/descompresion" class="nav-link" active-class="active">
            <span class="material-icons nav-icon">unarchive</span>
            <span class="nav-text">Descompresión</span>
          </router-link>
        </li>
        
        <li class="nav-item">
          <router-link to="/utilities" class="nav-link" active-class="active">
            <span class="material-icons nav-icon">token</span>
            <span class="nav-text">Utilidades</span>
          </router-link>
        </li>
        
        <li class="nav-item">
          <router-link to="/kioscos" class="nav-link" active-class="active">
            <span class="material-icons nav-icon">desktop_windows</span>
            <span class="nav-text">Kioscos</span>
          </router-link>
        </li>

        <!-- Profile Dropdown -->
        <li class="nav-item dropdown" @click.stop>
          <button 
            class="nav-link dropdown-toggle"
            :class="{ 'active': showProfileDropdown }"
            @click="toggleProfileDropdown"
          >
            <span class="material-icons nav-icon">account_circle</span>
            <span class="nav-text">Perfil</span>
            <span class="material-icons dropdown-arrow">keyboard_arrow_down</span>
          </button>
          
          <div class="dropdown-menu" :class="{ 'show': showProfileDropdown }">
            <a href="#" class="dropdown-item">
              <span class="material-icons">person</span>
              Mi Perfil
            </a>
            <a href="#" class="dropdown-item">
              <span class="material-icons">settings</span>
              Configuración
            </a>
            <div class="dropdown-divider"></div>
            <a @click="logout" class="dropdown-item logout-item">
              <span class="material-icons">logout</span>
              Cerrar Sesión
            </a>
          </div>
        </li>
      </ul>
    </div>
  </nav>

  <!-- Main Content Area -->
  <div class="main-content">
    <router-view></router-view>
  </div>
</template>

<style scoped>

</style>