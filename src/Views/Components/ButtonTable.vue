<script setup>
import '../../assets/styles/Components/ButtonCustom.css'
const props = defineProps({
  function: Function,
  color: {
    type: String,
    default: 'primary'
  },
  tooltip: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['click']);

function handleClick(event) {
  // Ejecutar función
  if (props.function && typeof props.function === 'function') {
    props.function(event);
  }
  
  emit('click', event);
}
</script>

<template>
  <button
    type="button"
    :class="['modern-btn tooltip-button ', `modern-btn--${color}`, { 'modern-btn--disabled': disabled }]"
    :data-tooltip="tooltip"
    
    :disabled="disabled"
    @click="handleClick"
  >
    <slot />
  </button>
</template>

<style scoped>
.modern-btn {
    padding: 10px 10px !important;
    border-radius: 50% !important;
}

/* Modern Tooltip */
.modern-btn[data-tooltip]:not([data-tooltip=""]):hover::before {
  content: attr(data-tooltip);
  position: absolute;
  bottom: calc(100% + 5px);
  left: 50%;
  transform: translateX(-50%) translateY(4px);
  background: rgba(30, 41, 59, 0.95);
  color: white;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  z-index: 1001;
  opacity: 0;
  backdrop-filter: blur(8px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: tooltip-show 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  pointer-events: none;
  max-width: 200px;
  text-align: center;
  line-height: 1.4;
}

.modern-btn[data-tooltip]:not([data-tooltip=""]):hover::after {
  content: '';
  position: absolute;
  bottom: calc(100% + 4px);
  left: 50%;
  transform: translateX(-50%) rotate(45deg) translateY(2px);
  width: 8px;
  height: 8px;
  background: rgba(30, 41, 59, 0.95);
  z-index: 1000;
  opacity: 0;
  animation: tooltip-show 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  pointer-events: none;
}

/* Focus state para accesibilidad */
.modern-btn[data-tooltip]:not([data-tooltip=""]):focus::before,
.modern-btn[data-tooltip]:not([data-tooltip=""]):focus::after {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

.modern-btn[data-tooltip]:not([data-tooltip=""]):focus::after {
  transform: translateX(-50%) rotate(45deg) translateY(0);
}

/* Animación mejorada */
@keyframes tooltip-show {
  0% {
    opacity: 0;
    transform: translateX(-50%) translateY(4px) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translateX(-50%) translateY(0) scale(1);
  }
}

/* Responsive para móviles */
@media (max-width: 768px) {
  .modern-btn[data-tooltip]:not([data-tooltip=""]):hover::before {
    font-size: 12px;
    padding: 6px 10px;
    max-width: 150px;
    white-space: normal;
  }
}

/* Tooltip para botones en diferentes posiciones */
.modern-btn.tooltip-bottom[data-tooltip]:not([data-tooltip=""]):hover::before {
  bottom: auto;
  top: calc(100% + 12px);
  transform: translateX(-50%) translateY(-4px);
}

.modern-btn.tooltip-bottom[data-tooltip]:not([data-tooltip=""]):hover::after {
  bottom: auto;
  top: calc(100% + 4px);
  transform: translateX(-50%) rotate(45deg) translateY(-2px);
}

.modern-btn.tooltip-bottom[data-tooltip]:not([data-tooltip=""]):focus::before {
  transform: translateX(-50%) translateY(0);
}

.modern-btn.tooltip-bottom[data-tooltip]:not([data-tooltip=""]):focus::after {
  transform: translateX(-50%) rotate(45deg) translateY(0);
}

/* Variantes de color para el tooltip */
.modern-btn--green[data-tooltip]:not([data-tooltip=""]):hover::before,
.modern-btn--green[data-tooltip]:not([data-tooltip=""]):hover::after {
  background: rgba(56, 142, 60, 0.95);
}

.modern-btn--orange[data-tooltip]:not([data-tooltip=""]):hover::before,
.modern-btn--orange[data-tooltip]:not([data-tooltip=""]):hover::after {
  background: rgba(245, 124, 0, 0.95);
}

.modern-btn--red[data-tooltip]:not([data-tooltip=""]):hover::before,
.modern-btn--red[data-tooltip]:not([data-tooltip=""]):hover::after {
  background: rgba(211, 47, 47, 0.95);
}

.modern-btn--lile[data-tooltip]:not([data-tooltip=""]):hover::before,
.modern-btn--lile[data-tooltip]:not([data-tooltip=""]):hover::after {
  background: rgba(102, 126, 234, 0.95);
}

.modern-btn--blue[data-tooltip]:not([data-tooltip=""]):hover::before,
.modern-btn--blue[data-tooltip]:not([data-tooltip=""]):hover::after {
  background: rgba(25, 118, 210, 0.95);
}

.modern-btn--purple[data-tooltip]:not([data-tooltip=""]):hover::before,
.modern-btn--purple[data-tooltip]:not([data-tooltip=""]):hover::after {
  background: rgba(167, 0, 245, 0.95);
}

/* Modo de alto contraste */
@media (prefers-contrast: high) {
  .modern-btn[data-tooltip]:not([data-tooltip=""]):hover::before {
    background: #000000;
    border: 2px solid #ffffff;
  }
  
  .modern-btn[data-tooltip]:not([data-tooltip=""]):hover::after {
    background: #000000;
    border: 1px solid #ffffff;
  }
}

/* Reducir animaciones para usuarios que las prefieren */
@media (prefers-reduced-motion: reduce) {
  .modern-btn[data-tooltip]:not([data-tooltip=""]):hover::before,
  .modern-btn[data-tooltip]:not([data-tooltip=""]):hover::after {
    animation: none;
    transition: opacity 0.2s ease;
  }
}
</style>