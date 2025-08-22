<script setup>
const props = defineProps({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  id: {
    type: [String, Number],
    default: null
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  estimatedTime: {
    type: String,
    default: ''
  },
  priority: {
    type: String,
    default: 'normal',
    validator: (value) => ['low', 'normal', 'high'].includes(value)
  },
  disabled: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['click', 'survey-selected']);

const handleClick = () => {
  if (props.disabled) return;
  
  emit('click', {
    id: props.id,
    title: props.title,
    description: props.description
  });
  
  emit('survey-selected', props.id);
};
</script>

<template>
  <div 
    class="card-survey" 
    :class="{ 
      'card-completed': isCompleted,
      'card-disabled': disabled,
      [`card-priority-${priority}`]: priority !== 'normal'
    }"
    @click="handleClick"
    role="button"
    tabindex="0"
    @keydown.enter="handleClick"
    @keydown.space.prevent="handleClick"
  >
    <!-- Lado Izquierdo: Contenido de la encuesta -->
    <div class="card-content">
      <div class="card-header">
        <h3 class="survey-title">{{ title }}</h3>
        <div class="survey-meta">
          <span v-if="estimatedTime" class="time-badge">
            <span class="material-icons">schedule</span>
            {{ estimatedTime }}
          </span>
          <span v-if="isCompleted" class="completed-badge">
            <span class="material-icons">check_circle</span>
            Completada
          </span>
        </div>
      </div>
      
      <p class="survey-description">{{ description }}</p>
    </div>
    
    <!-- Lado Derecho: Botón de acción -->
    <div class="card-action">
      <div class="action-content">
        <span class="action-text">
          {{ isCompleted ? 'Ver Resultados' : 'Contestar' }}
        </span>
        <div class="action-icon">
          <span class="material-icons">
            {{ isCompleted ? 'visibility' : 'arrow_forward' }}
          </span>
        </div>
      </div>
    </div>
    
    <!-- Indicador de prioridad -->
    <div v-if="priority === 'high'" class="priority-indicator"></div>
  </div>
</template>

<style scoped>
.card-survey {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 16px;
  box-shadow: 
    0 4px 20px rgba(0, 0, 0, 0.08),
    0 0 0 1px rgba(0, 0, 0, 0.04);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  outline: none;
  user-select: none;
   border: 3px;
    border-color: #6f00fff5 ;
    border-style: solid;
}

/* Hover effects */
.card-survey:hover {
    transform: translateY(-4px);
    box-shadow: 
        0 12px 32px rgba(0, 0, 0, 0.12),
        0 0 0 1px rgba(102, 126, 234, 0.2); 
    border: 5px;
    border-color: #6f00fff5 ;
    border-style: solid;
    
}

.card-survey:active {
  transform: translateY(-2px);
  transition: transform 0.1s ease;
}

/* Focus state */
.card-survey:focus {
  box-shadow: 
    0 8px 24px rgba(0, 0, 0, 0.1),
    0 0 0 3px rgba(102, 126, 234, 0.3);
}

/* Lado Izquierdo - Contenido */
.card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-right: 20px;
}

.card-header {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.survey-title {
  font-size: 20px;
  font-weight: 700;
  color: #1a202c;
  margin: 0;
  line-height: 1.3;
  letter-spacing: -0.5px;
}

.survey-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.time-badge,
.completed-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 6px;
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
}

.completed-badge {
  background: rgba(72, 187, 120, 0.1);
  color: #48bb78;
}

.time-badge .material-icons,
.completed-badge .material-icons {
  font-size: 14px;
}

.survey-description {
  font-size: 15px;
  color: #4a5568;
  line-height: 1.5;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Lado Derecho - Acción */
.card-action {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  min-width: 140px;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
}

.card-survey:hover .card-action {
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

.action-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
}

.action-text {
  font-size: 14px;
  font-weight: 600;
  color: white;
}

.action-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  transition: transform 0.3s ease;
}

.card-survey:hover .action-icon {
  transform: translateX(2px);
}

.action-icon .material-icons {
  font-size: 16px;
  color: white;
}

/* Estados especiales */
.card-completed {
  background: rgba(248, 250, 252, 0.98);
  border: 1px solid rgba(72, 187, 120, 0.2);
}

.card-completed .card-action {
  background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
  box-shadow: 0 4px 12px rgba(72, 187, 120, 0.3);
}

.card-completed:hover .card-action {
  box-shadow: 0 6px 16px rgba(72, 187, 120, 0.4);
}

.card-disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.card-disabled:hover {
  transform: none;
  box-shadow: 
    0 4px 20px rgba(0, 0, 0, 0.08),
    0 0 0 1px rgba(0, 0, 0, 0.04);
}

.card-disabled .card-action {
  background: #a0aec0;
  box-shadow: none;
}

/* Indicador de prioridad alta */
.priority-indicator {
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: linear-gradient(to bottom, #f56565 0%, #e53e3e 100%);
  border-radius: 0 0 0 16px;
}

.card-priority-high {
  border-left: 4px solid #e53e3e;
}

/* Responsive Design */
@media (max-width: 768px) {
  .card-survey {
    flex-direction: column;
    gap: 16px;
    padding: 20px;
    text-align: center;
  }
  
  .card-content {
    padding-right: 0;
    width: 100%;
  }
  
  .survey-title {
    font-size: 18px;
  }
  
  .survey-description {
    -webkit-line-clamp: 3;
  }
  
  .card-action {
    width: 100%;
    min-width: auto;
    justify-content: center;
  }
  
  .survey-meta {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .card-survey {
    padding: 16px;
    margin-bottom: 12px;
    border-radius: 12px;
  }
  
  .survey-title {
    font-size: 16px;
  }
  
  .survey-description {
    font-size: 14px;
  }
  
  .card-action {
    padding: 12px 16px;
    border-radius: 8px;
  }
  
  .action-text {
    font-size: 13px;
  }
}

/* Animación de entrada */
@keyframes cardSlideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card-survey {
  animation: cardSlideIn 0.6s ease-out;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .card-survey {
    background: rgba(45, 55, 72, 0.98);
    box-shadow: 
      0 4px 20px rgba(0, 0, 0, 0.3),
      0 0 0 1px rgba(255, 255, 255, 0.1);
  }
  
  .survey-title {
    color: #f7fafc;
  }
  
  .survey-description {
    color: #e2e8f0;
  }
  
  .card-completed {
    background: rgba(26, 32, 44, 0.98);
    border-color: rgba(72, 187, 120, 0.3);
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .card-survey {
    border: 2px solid #000000;
  }
  
  .card-action {
    border: 2px solid #ffffff;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .card-survey,
  .card-action,
  .action-icon {
    transition: none;
  }
  
  .card-survey {
    animation: none;
  }
}
</style>