<template>
  <nav class="modern-navbar ">
    <div class="navbar-container">
      <!-- Brand/Logo -->
      <div class="navbar-brand">
        <div class="brand-icon">
          <span class="material-icons">file_present</span>
        </div>
        <span class="brand-text">Encuestas app</span>
      </div>

      <!-- Navigation Items -->
      <ul class="navbar-nav">
        <!-- <li class="nav-item">
          <router-link 
            to="/home" 
            class="nav-link" 
            :class="{ active: selected === 'inicio' }" 
            @click="selectItem('inicio')"
          >
            <span class="nav-icon material-icons">home</span>
            <span class="nav-text">Inicio</span>
          </router-link>
        </li> -->
        <li v-if="roleId=='asesor'" class="nav-item" >
          <router-link 
            to="/responding" 
            class="nav-link" 
            :class="{ active: selected === 'responding' }" 
            @click="selectItem('responding')"
          >
            <span class="nav-icon material-icons">newspaper</span>
            <span class="nav-text">Encuesta</span>
          </router-link>
        </li>
        <li v-if="roleId=='administrador'" class="nav-item">
          <router-link 
            to="/surveys" 
            class="nav-link" 
            :class="{ active: selected === 'surveys' }" 
            @click="selectItem('surveys')"
          >
            <span class="nav-icon material-icons">file_present</span>
            <span class="nav-text">Encuestas</span>
          </router-link>
        </li>
        <li v-if="roleId=='administrador'" class="nav-item">
          <router-link 
            to="/users" 
            class="nav-link" 
            :class="{ active: selected === 'users' }" 
            @click="selectItem('users')"
          >
            <span class="nav-icon material-icons">groups</span>
            <span class="nav-text">Usuarios</span>
          </router-link>
        </li>

        

        <!-- Profile Dropdown -->
        <li class="nav-item dropdown" ref="dropdownRef">
          <button 
            class="nav-link dropdown-toggle" 
            data-bs-toggle="dropdown"
            :class="{ active: selected === 'cuenta' || showDropdown }"
            @click="toggleDropdown"
            @blur="handleDropdownBlur"
          >
            <span class="nav-icon material-icons">account_circle</span>
            <span class="nav-text">Mi Perfil</span>
          </button>
          
          <div class="dropdown-menu " >
            <router-link 
              class="dropdown-item" 
              to="/myaccount/profile"
              @click="closeDropdown"
            >
              <span class="material-icons">account_box</span>
              <span>Mi Perfil</span>
            </router-link>
            
            <div class="dropdown-divider"></div>
            
            <button 
              class="dropdown-item logout-item" 
              @click="handleLogout"
            >
              <span class="material-icons">logout</span>
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </li>
      </ul>
    </div>
  </nav>
  
  <main class="main-content ">
    <router-view></router-view>
  </main>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { useUserStore } from '../../stores/user';
import '../../assets/styles/navbar.css'
const userStore = useUserStore();
const route = useRoute();
const dropdownRef = ref(null);
const showDropdown = ref(false);

const roleId = ref(null);
const selected = ref('inicio');

const navItems = [
  { route: 'home', selection: 'inicio' },
  { route: 'responding', selection: 'responding' },
  { route: 'surveys', selection: 'surveys' },
  { route: 'users', selection: 'users' },
  { route: 'micuenta', selection: 'cuenta' },
];

const updateSelected = (path) => {
  console.log(path);
  const selectedRoute = navItems.find((navItem) => {
    const res = path.includes(navItem.route)
    console.log(`${res} | ${navItem.route}`);
    
    return res
  });
  console.log(selectedRoute);
  selected.value = selectedRoute ? selectedRoute.selection : 'inicio';
};

const selectItem = (item) => {
  selected.value = item;
  closeDropdown();
};

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value;
  selectItem('cuenta');
};

const closeDropdown = () => {
  showDropdown.value = false;
};

const handleDropdownBlur = (event) => {
  // Cerrar dropdown si el foco sale del elemento
  setTimeout(() => {
    if (!dropdownRef.value?.contains(document.activeElement)) {
      closeDropdown();
    }
  }, 150);
};

const handleLogout = () => {
  closeDropdown();
  userStore.logout();
};

// Cerrar dropdown al hacer click fuera
const handleClickOutside = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    closeDropdown();
  }
};

onMounted(async () => {
  roleId.value = localStorage.getItem('userRole');
  updateSelected(route.path);
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>

</style>