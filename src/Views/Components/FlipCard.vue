<script setup>
const props = defineProps({
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    default: 'widgets'
  },
  backIcon: {
    type: String,
    default: 'info'
  },
  backTitle: {
    type: String,
    default: ''
  },
  features: {
    type: Array,
    default: () => []
  },
  actionText: {
    type: String,
    default: 'Continuar'
  },
  color: {
    type: String,
    default: 'blue',
    validator: (value) => ['blue', 'green', 'orange', 'purple', 'red', 'gray'].includes(value)
  },
  size: {
    type: String,
    default: 'normal',
    validator: (value) => ['small', 'normal', 'large'].includes(value)
  },
  disabled: {
    type: Boolean,
    default: false
  },
  clickable: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['click']);

const handleClick = () => {
  if (!props.disabled && props.clickable) {
    emit('click');
  }
};
</script>
<template>
  <div 
    class="flip-card-container" 
    :class="[`card-${color}`, `card-${size}`, { 'card-disabled': disabled }]"
    @click="handleClick"
  >
    <div class="flip-card">
      <!-- Cara Frontal -->
      <div class="flip-card-front">
        <div class="card-icon-container" v-if="icon">
          <div class="card-icon-wrapper">
            <span class="material-icons card-icon">{{ icon }}</span>
          </div>
          <div class="card-icon-glow"></div>
        </div>
        
        <div class="card-content">
          <h3 class="card-title">{{ title }}</h3>
          <p class="card-subtitle" v-if="subtitle">{{ subtitle }}</p>
        </div>
        
        <div class="card-arrow">
          <span class="material-icons">flip</span>
        </div>
      </div>
      
      <!-- Cara Posterior -->
      <div class="flip-card-back">
        <div class="back-icon" v-if="backIcon">
          <span class="material-icons">{{ backIcon }}</span>
        </div>
        
        <div class="back-content">
          <h4 class="back-title">{{ backTitle || title }}</h4>
          <p class="back-description">{{ description }}</p>
          
          <div class="back-features" v-if="features && features.length">
            <div class="feature-item" v-for="(feature, index) in features" :key="index">
              <span class="material-icons feature-icon">{{ feature.icon || 'check_circle' }}</span>
              <span class="feature-text">{{ feature.text }}</span>
            </div>
          </div>
        </div>
        
        <div class="back-action" v-if="actionText">
          <span class="action-text">{{ actionText }}</span>
          <span class="material-icons action-arrow">arrow_forward</span>
        </div>
      </div>
    </div>
    
    <!-- Efectos adicionales -->
  </div>
</template>



<style scoped>
/* ===================================
   CONTENEDOR PRINCIPAL
   =================================== */

.flip-card-container {
  perspective: 1000px;
  width: 100%;
  height: 280px;
  cursor: pointer;
  position: relative;
  transition: all var(--transition-normal);
}

.flip-card-container.card-small {
  height: 220px;
}

.flip-card-container.card-large {
  height: 340px;
}

.flip-card-container.card-disabled {
  opacity: 0.6;
  cursor: not-allowed;
  pointer-events: none;
}

.flip-card-container:hover {
  transform: translateY(-4px);
}

/* ===================================
   CARD PRINCIPAL CON FLIP
   =================================== */

.flip-card {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.flip-card-container:hover .flip-card {
  transform: rotateY(180deg);
}

/* ===================================
   CARAS DEL CARD
   =================================== */

.flip-card-front,
.flip-card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--border-color);
  background: var(--bg-glass);
  backdrop-filter: blur(20px);
  box-shadow: var(--shadow-md);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding: var(--spacing-xl);
}

.flip-card-back {
  transform: rotateY(180deg);
}

/* ===================================
   CARA FRONTAL
   =================================== */

.card-icon-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  position: relative;
}

.card-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: var(--border-radius-lg);
  position: relative;
  z-index: 2;
  transition: all var(--transition-normal);
}

.card-small .card-icon-wrapper {
  width: 48px;
  height: 48px;
}

.card-large .card-icon-wrapper {
  width: 80px;
  height: 80px;
}

.card-icon {
  font-size: 32px;
  transition: all var(--transition-normal);
}

.card-small .card-icon {
  font-size: 24px;
}

.card-large .card-icon {
  font-size: 40px;
}

.card-icon-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: var(--border-radius-lg);
  opacity: 0.1;
  transition: all var(--transition-normal);
}

.flip-card-container:hover .card-icon-glow {
  opacity: 0.3;
  transform: scale(1.2);
}

.card-content {
  flex: 1;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.card-title {
  margin: 0 0 var(--spacing-sm) 0;
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  transition: all var(--transition-normal);
}

.card-small .card-title {
  font-size: var(--font-size-lg);
}

.card-large .card-title {
  font-size: var(--font-size-2xl);
}

.card-subtitle {
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
  line-height: 1.4;
}

.card-arrow {
  display: flex;
  justify-content: center;
  margin-top: var(--spacing-lg);
  opacity: 0.7;
  transition: all var(--transition-normal);
}

.card-arrow .material-icons {
  font-size: 24px;
  color: var(--text-light);
  animation: float 2s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-4px); }
}

/* ===================================
   CARA POSTERIOR
   =================================== */

.back-icon {
  display: flex;
  justify-content: center;
  margin-bottom: var(--spacing-lg);
}

.back-icon .material-icons {
  font-size: 28px;
  opacity: 0.8;
}

.back-content {
  flex: 1;
  text-align: center;
}

.back-title {
  margin: 0 0 var(--spacing-md) 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.back-description {
  margin: 0 0 var(--spacing-lg) 0;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  line-height: 1.5;
}

.back-features {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-lg);
}

.feature-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

.feature-icon {
  font-size: 16px !important;
  opacity: 0.8;
}

.feature-text {
  flex: 1;
  text-align: left;
}

.back-action {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  margin-top: auto;
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--border-color);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  opacity: 0.9;
}

.action-arrow {
  font-size: 18px !important;
  transition: transform var(--transition-normal);
}

.flip-card-container:hover .action-arrow {
  transform: translateX(4px);
}

/* ===================================
   VARIANTES DE COLOR
   =================================== */

/* Azul */
.card-blue .card-icon-wrapper {
  background: rgba(0, 138, 255, 0.1);
  color: var(--primary-color);
}

.card-blue .card-icon-glow {
  background: var(--primary-color);
}

.card-blue .flip-card-front {
  border: 4px solid var(--primary-color);
}

.card-blue .back-icon .material-icons,
.card-blue .feature-icon,
.card-blue .action-arrow {
  color: var(--primary-color);
}

/* Verde */
.card-green .card-icon-wrapper {
  background: rgba(56, 142, 60, 0.1);
  color: var(--success-color);
}

.card-green .card-icon-glow {
  background: var(--success-color);
}

.card-green .flip-card-front {
  border: 4px solid var(--success-color);
}

.card-green .back-icon .material-icons,
.card-green .feature-icon,
.card-green .action-arrow {
  color: var(--success-color);
}

/* Naranja */
.card-orange .card-icon-wrapper {
  background: rgba(245, 124, 0, 0.1);
  color: var(--warning-color);
}

.card-orange .card-icon-glow {
  background: var(--warning-color);
}

.card-orange .flip-card-front {
  border: 4px solid var(--warning-color);
}

.card-orange .back-icon .material-icons,
.card-orange .feature-icon,
.card-orange .action-arrow {
  color: var(--warning-color);
}

/* Púrpura */
.card-purple .card-icon-wrapper {
  background: rgba(156, 39, 176, 0.1);
  color: #9c27b0;
}

.card-purple .card-icon-glow {
  background: #9c27b0;
}

.card-purple .flip-card-front {
  border: 4px solid #9c27b0;
}

.card-purple .back-icon .material-icons,
.card-purple .feature-icon,
.card-purple .action-arrow {
  color: #9c27b0;
}

/* Rojo */
.card-red .card-icon-wrapper {
  background: rgba(211, 47, 47, 0.1);
  color: var(--danger-color);
}

.card-red .card-icon-glow {
  background: var(--danger-color);
}

.card-red .flip-card-front {
  border: 4px solid var(--danger-color);
}

.card-red .back-icon .material-icons,
.card-red .feature-icon,
.card-red .action-arrow {
  color: var(--danger-color);
}

/* Gris */
.card-gray .card-icon-wrapper {
  background: rgba(96, 125, 139, 0.1);
  color: var(--text-light);
}

.card-gray .card-icon-glow {
  background: var(--text-light);
}

.card-gray .flip-card-front {
  border: 4px solid var(--text-light);
}

.card-gray .back-icon .material-icons,
.card-gray .feature-icon,
.card-gray .action-arrow {
  color: var(--text-light);
}

/* ===================================
   EFECTOS ESPECIALES
   =================================== */

/* .card-shine {
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
  opacity: 0;
  transition: opacity var(--transition-normal);
  pointer-events: none;
  z-index: 1;
} */

/* .flip-card-container:hover .card-shine {
  opacity: 1;
  animation: shine 1.5s ease-out;
} */

/* @keyframes shine {
  0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
  100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
} */

/* ===================================
   RESPONSIVE DESIGN
   =================================== */

@media (max-width: 768px) {
  .flip-card-container {
    height: 260px;
  }
  
  .flip-card-container.card-small {
    height: 200px;
  }
  
  .flip-card-container.card-large {
    height: 300px;
  }
  
  .flip-card-front,
  .flip-card-back {
    padding: var(--spacing-lg);
  }
  
  .card-title {
    font-size: var(--font-size-lg);
  }
  
  .card-icon-wrapper {
    width: 48px !important;
    height: 48px !important;
  }
  
  .card-icon {
    font-size: 24px !important;
  }
}

@media (max-width: 480px) {
  .flip-card-container {
    height: 240px;
  }
  
  .card-title {
    font-size: var(--font-size-md);
  }
  
  .card-subtitle,
  .back-description {
    font-size: var(--font-size-xs);
  }
}

/* ===================================
   MEJORAS DE ACCESIBILIDAD
   =================================== */

.flip-card-container:focus {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  .flip-card,
  .card-icon-wrapper,
  .card-icon-glow,
  /* .card-shine {
    transition: none;
  } */
  
  .card-arrow .material-icons {
    animation: none;
  }
}

/* ===================================
   MODO OSCURO
   =================================== */

@media (prefers-color-scheme: dark) {
  .flip-card-front,
  .flip-card-back {
    background: rgba(45, 55, 72, 0.95);
    border-color: rgba(255, 255, 255, 0.1);
  }
  
  .card-title {
    color: var(--text-white);
  }
  
  .back-title {
    color: var(--text-white);
  }
  .back-description{
    color: var(--text-tertiary);
  }
  .feature-text{
    color: var(--text-light);
  }
}
</style>