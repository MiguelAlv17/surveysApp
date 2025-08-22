<script setup>
const props = defineProps({
  title: {
    type: String,
    default: 'hder'
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
  <div class="modern-container" :class="{ 'compact': compact ,'loading': loading}">
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
        <div class="header-content">
          <div class="header-main">
            <div v-if="icon" class="header-icon">
              <span class="material-icons">{{ icon }}</span>
            </div>
            <div class="header-text">
              <h1 v-if="title" class="header-title">{{ title }}</h1>
              <p v-if="subtitle" class="header-subtitle">{{ subtitle }}</p>
            </div>
          </div>
          <div class="header-actions">
            <slot name="header-actions"></slot>
          </div>
        </div>
      </slot>
    </div>

    <!-- Body Section -->
    <div class="container-body" :class="{ 'no-padding': noPadding }">
      <slot name="body">
        <!-- <slot></slot> -->
      </slot>
    </div>

    <!-- Footer Section -->
    <div class="container-footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<style scoped>
.modern-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.08),
    0 0 0 1px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  animation: slideUp 0.6s ease-out;
  margin-bottom: 24px;
}

.modern-container.compact {
  border-radius: 16px;
  margin-bottom: 16px;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Header Styles */
.container-header {
  position: relative;
  overflow: hidden;
}

.header-gradient {
  /* background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); */
  background: linear-gradient(135deg, #0059fff5 0%, #62acf1 100%);;
  color: white;
}

.header-solid {
  background: #f8fafc;
  color: #2d3748;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.header-transparent {
  background: transparent;
  color: #2d3748;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 32px;
  position: relative;
  z-index: 2;
}

.header-main {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.header-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 14px;
  backdrop-filter: blur(10px);
}

.header-solid .header-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.header-solid .header-icon .material-icons {
  color: white;
}

.header-transparent .header-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.header-transparent .header-icon .material-icons {
  color: white;
}

.header-icon .material-icons {
  font-size: 24px;
}

.header-text {
  flex: 1;
}

.header-title {
  font-size: 28px;
  font-weight: 700;
  margin: 0;
  line-height: 1.2;
  letter-spacing: -0.5px;
}

.header-subtitle {
  font-size: 16px;
  margin: 4px 0 0 0;
  opacity: 0.8;
  font-weight: 400;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* Body Styles */
.container-body {
  padding: 32px;
  min-height: 200px;
}

.container-body.no-padding {
  padding: 0;
}

/* Footer Styles */
.container-footer {
  padding: 24px 32px;
  background: #f8fafc;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* Responsive Design */
@media (max-width: 768px) {
  .modern-container {
    margin: 0 16px 20px 16px;
    border-radius: 16px;
  }
  
  .header-content {
    padding: 20px 24px;
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .header-main {
    width: 100%;
  }
  
  .header-actions {
    width: 100%;
    justify-content: flex-end;
  }
  
  .header-title {
    font-size: 24px;
  }
  
  .header-subtitle {
    font-size: 14px;
  }
  
  .container-body {
    padding: 24px;
  }
  
  .container-footer {
    padding: 20px 24px;
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
}

@media (max-width: 480px) {
  .modern-container {
    margin: 0 12px 16px 12px;
    border-radius: 12px;
  }
  
  .header-content {
    padding: 16px 20px;
  }
  
  .header-icon {
    width: 40px;
    height: 40px;
  }
  
  .header-icon .material-icons {
    font-size: 20px;
  }
  
  .header-title {
    font-size: 20px;
  }
  
  .container-body {
    padding: 20px;
  }
  
  .container-footer {
    padding: 16px 20px;
  }
}

/* Special utilities */
.container-body :deep(.search-section) {
  background: #f8fafc;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 24px;
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.container-body :deep(.action-section) {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  gap: 16px;
}

.container-body :deep(.table-section) {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.06);
}

/* Animation for content changes */
.container-body :deep(.fade-enter-active),
.container-body :deep(.fade-leave-active) {
  transition: all 0.3s ease;
}

.container-body :deep(.fade-enter-from),
.container-body :deep(.fade-leave-to) {
  opacity: 0;
  transform: translateY(10px);
}

/* container section  */
/* ===================================
   LOADING OVERLAY
   =================================== */

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.527);
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
  border: 3px solid rgb(8, 45, 207);
  border-top: 3px solid rgb(204, 201, 201);
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
.search-container {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 24px;
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

.last-update {
    color: #718096;
    font-size: 12px;
}

/* Responsive */
@media (max-width: 768px) {
    .home-container {
        padding: 16px;
    }

    .search-container {
        flex-direction: column;
        align-items: stretch;
        gap: 16px;
    }

    .search-input-wrapper {
        max-width: none;
    }

    .search-actions {
        justify-content: flex-end;
    }

    .footer-content {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
    }
}

@media (max-width: 480px) {
    .search-section {
        padding: 16px;
    }

    .search-input {
        padding: 10px 12px 10px 44px;
    }

    .input-icon {
        left: 12px;
    } }

@media (prefers-color-scheme: dark) {
  .loading-spinner {
    border: 3px solid rgb(1, 2, 61);
    border-top: 3px solid rgb(236, 236, 236);
  }
  .loading-overlay {
    background: rgba(41, 53, 75, 0.534);
    backdrop-filter: blur(8px);
  }
  .loading-text {
    color: white;
    font-weight: var(--font-weight-medium);
    font-size: var(--font-size-sm);
  }
  
  .modern-container {
    background: rgba(41, 53, 75, 0.973);
  }
  .container-footer {
    background: rgba(66, 85, 121, 0.863);
  }
  .container-body :deep(.search-section) {
    background: rgba(66, 85, 121, 0.863);
  }
  .search-container{
    color: white;
  }
 .footer-info {
        color: #96a6c4;
    }
    
    .footer-info .material-icons {
        color: #c3c3c4;
    }
    
    .last-update {
        color: #babbbd;
    }
  .container-body :deep(.table-section) {
    background: #425579dc
  }
}

</style>