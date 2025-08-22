<script setup>
const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  subtitle: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: ''
  },
  headerBackground: {
    type: String,
    default: 'gradient' // 'gradient', 'solid', 'transparent'
  },
  noPadding: {
    type: Boolean,
    default: false
  },
  compact: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  }
});
</script>

<template>
  <div class="modern-container" :class="{ 'compact': compact, 'loading': loading }">
    <!-- Loading Overlay -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-content">
        <div class="loading-spinner"></div>
        <span class="loading-text">Cargando...</span>
      </div>
    </div>

    <!-- Header Section -->
    <div class="container-header" :class="`header-${headerBackground}`">
      <slot name="header">
        <div class="header-content" v-if="title || subtitle || icon || $slots['header-actions']">
          <div class="header-main">
            <div v-if="icon" class="header-icon">
              <span class="material-icons">{{ icon }}</span>
            </div>
            <div class="header-text" v-if="title || subtitle">
              <h1 v-if="title" class="header-title">{{ title }}</h1>
              <p v-if="subtitle" class="header-subtitle">{{ subtitle }}</p>
            </div>
          </div>
          <div class="header-actions" v-if="$slots['header-actions']">
            <slot name="header-actions"></slot>
          </div>
        </div>
      </slot>
    </div>

    <!-- Body Section -->
    <div class="container-body" :class="{ 'no-padding': noPadding }">
      <slot name="body">
        <slot></slot>
      </slot>
    </div>

    <!-- Footer Section -->
    <div class="container-footer" v-if="$slots.footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<style scoped>
/* ===================================
   CONTAINER MODERNO
   =================================== */

.modern-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto var(--spacing-2xl) auto;
  background: var(--bg-glass);
  backdrop-filter: blur(20px);
  border-radius: var(--border-radius-xl);
  box-shadow: var(--shadow-xl);
  border: 1px solid var(--border-color);
  overflow: hidden;
  animation: slideUp 0.6s ease-out;
  position: relative;
  transition: all var(--transition-normal);
}

.modern-container:hover {
  transform: translateY(-2px);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.1);
}

.modern-container.compact {
  border-radius: var(--border-radius-lg);
  margin-bottom: var(--spacing-lg);
  max-width: 900px;
}

.modern-container.loading {
  pointer-events: none;
}

/* ===================================
   LOADING OVERLAY
   =================================== */

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  border-radius: var(--border-radius-xl);
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-lg);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border-color-light);
  border-top: 3px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  color: var(--text-secondary);
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-sm);
}

/* ===================================
   HEADER STYLES
   =================================== */

.container-header {
  position: relative;
  overflow: hidden;
}

.header-gradient {
  background: var(--gradient-primary);
  color: var(--text-white);
}

.header-gradient::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.1) 0%, 
    rgba(255, 255, 255, 0.05) 50%, 
    rgba(0, 0, 0, 0.05) 100%);
  pointer-events: none;
}

.header-solid {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border-bottom: 1px solid var(--border-color);
}

.header-transparent {
  background: transparent;
  color: var(--text-primary);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-2xl) var(--spacing-3xl);
  position: relative;
  z-index: 2;
}

.header-main {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  flex: 1;
}

.header-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: var(--border-radius-md);
  backdrop-filter: blur(10px);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-normal);
}

.header-icon:hover {
  transform: scale(1.05);
  box-shadow: var(--shadow-md);
}

.header-solid .header-icon {
  background: var(--gradient-primary);
}

.header-solid .header-icon .material-icons {
  color: var(--text-white);
}

.header-transparent .header-icon {
  background: var(--gradient-primary);
}

.header-transparent .header-icon .material-icons {
  color: var(--text-white);
}

.header-icon .material-icons {
  font-size: 24px;
  transition: transform var(--transition-normal);
}

.header-icon:hover .material-icons {
  transform: rotate(5deg);
}

.header-text {
  flex: 1;
}

.header-title {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  margin: 0;
  line-height: 1.2;
  letter-spacing: -0.5px;
  background: linear-gradient(135deg, currentColor 0%, rgba(255, 255, 255, 0.8) 100%);
  -webkit-background-clip: text;
  background-clip: text;
}

.header-subtitle {
  font-size: var(--font-size-md);
  margin: var(--spacing-xs) 0 0 0;
  opacity: 0.9;
  font-weight: var(--font-weight-normal);
  line-height: 1.4;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex-shrink: 0;
}

/* ===================================
   BODY STYLES
   =================================== */

.container-body {
  padding: var(--spacing-3xl);
  min-height: 200px;
  position: relative;
}

.container-body.no-padding {
  padding: 0;
}

/* Efectos para el contenido del body */
.container-body > :first-child {
  animation: fadeIn 0.6s ease-out 0.2s both;
}

.container-body > :nth-child(2) {
  animation: fadeIn 0.6s ease-out 0.3s both;
}

.container-body > :nth-child(3) {
  animation: fadeIn 0.6s ease-out 0.4s both;
}

/* ===================================
   FOOTER STYLES
   =================================== */

.container-footer {
  padding: var(--spacing-2xl) var(--spacing-3xl);
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-lg);
  position: relative;
}

.container-footer::before {
  content: '';
  position: absolute;
  top: 0;
  left: var(--spacing-3xl);
  right: var(--spacing-3xl);
  height: 1px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    var(--border-color) 20%, 
    var(--border-color) 80%, 
    transparent 100%);
}

/* ===================================
   RESPONSIVE DESIGN
   =================================== */

@media (max-width: 768px) {
  .modern-container {
    margin: 0 var(--spacing-lg) var(--spacing-xl) var(--spacing-lg);
    border-radius: var(--border-radius-lg);
  }
  
  .header-content {
    padding: var(--spacing-xl) var(--spacing-2xl);
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-lg);
  }
  
  .header-main {
    width: 100%;
  }
  
  .header-actions {
    width: 100%;
    justify-content: flex-end;
  }
  
  .header-title {
    font-size: var(--font-size-2xl);
  }
  
  .header-subtitle {
    font-size: var(--font-size-sm);
  }
  
  .container-body {
    padding: var(--spacing-2xl);
  }
  
  .container-footer {
    padding: var(--spacing-xl) var(--spacing-2xl);
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-lg);
  }

  .container-footer::before {
    left: var(--spacing-2xl);
    right: var(--spacing-2xl);
  }
}

@media (max-width: 480px) {
  .modern-container {
    margin: 0 var(--spacing-md) var(--spacing-lg) var(--spacing-md);
    border-radius: var(--border-radius-md);
  }
  
  .header-content {
    padding: var(--spacing-lg) var(--spacing-xl);
  }
  
  .header-icon {
    width: 40px;
    height: 40px;
  }
  
  .header-icon .material-icons {
    font-size: 20px;
  }
  
  .header-title {
    font-size: var(--font-size-xl);
  }
  
  .container-body {
    padding: var(--spacing-xl);
  }
  
  .container-footer {
    padding: var(--spacing-lg) var(--spacing-xl);
  }

  .container-footer::before {
    left: var(--spacing-xl);
    right: var(--spacing-xl);
  }
}

/* ===================================
   UTILIDADES ESPECIALES
   =================================== */

/* Para secciones dentro del body */
.container-body :deep(.search-section) {
  background: var(--bg-secondary);
  /* padding: var(--spacing-xl); */
  border-radius: var(--border-radius-md);
  margin-bottom: var(--spacing-2xl);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-normal);
}

.container-body :deep(.search-section:hover) {
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.container-body :deep(.action-section) {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-2xl);
  gap: var(--spacing-lg);
  flex-wrap: wrap;
}

.container-body :deep(.table-section) {
  background: var(--bg-primary);
  border-radius: var(--border-radius-md);
  overflow: hidden;
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-normal);
}

.container-body :deep(.table-section:hover) {
  box-shadow: var(--shadow-md);
}

/* ===================================
   EFECTOS ESPECIALES
   =================================== */

/* Efecto de brillo en el header */
.header-gradient::after {
    display: none; /*ANIMACION*/ 
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg, 
    transparent 40%, 
    rgba(255, 255, 255, 0.1) 50%, 
    transparent 60%);
  transform: rotate(45deg);
  animation: shine 10s ease-in-out infinite;
}

@keyframes shine {
  0%, 100% {
    transform: translateX(-100%) translateY(-100%) rotate(45deg);
  }
  50% {
    transform: translateX(100%) translateY(100%) rotate(45deg);
  }
}

/* Animación de entrada mejorada */
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Estado de focus para accesibilidad */
.modern-container:focus-within {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}

/* Modo oscuro */
@media (prefers-color-scheme: dark) {
  .modern-container {
    background: rgba(45, 55, 72, 0.95);
    border-color: rgba(255, 255, 255, 0.1);
  }
  
  .container-footer {
    background: rgba(26, 32, 44, 0.8);
    border-top-color: rgba(255, 255, 255, 0.1);
  }
  
  .loading-overlay {
    background: rgba(45, 55, 72, 0.9);
  }
  
  .container-body :deep(.search-section) {
    background: rgba(26, 32, 44, 0.8);
    border-color: rgba(255, 255, 255, 0.1);
  }
  .loading-text {
    color: var(--text-white);
  }
}
</style>