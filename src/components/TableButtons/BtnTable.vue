<script setup>
const props = defineProps({
  
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
},["function"]);


</script>

<template>
  <button
    type="button"
    :class="['modern-btn', `modern-btn--${color}`, { 'modern-btn--disabled': disabled }]"
    :data-tooltip="tooltip"
    :disabled="disabled"
    @click="$emit('function')"
  >
    <slot />
  </button>
</template>

<style scoped>
.modern-btn {
  position: relative;
  /* overflow: hidden; */
  padding: 10px 10px;
  border: none;
  border-radius: 100%;
  font-weight: 500;
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
  min-height: 40px;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  outline: none;
}

/* Color variants */
.modern-btn--blue {
  background: #1976d2;
  color: white;
  box-shadow: 0 3px 6px rgba(25, 118, 210, 0.3);
}

.modern-btn--blue:hover {
  background: #0e427e;
  box-shadow: 0 6px 12px rgba(25, 118, 210, 0.4);
  transform: translateY(-2px);
}
.modern-btn--blue:active {
  transform: translateY(0);
}

.modern-btn--lile {
  background: #667eea;
  color: white;
  box-shadow: 0 3px 6px rgba(25, 118, 210, 0.3);
}

.modern-btn--lile:hover {
  background: #3f4e91;
  box-shadow: 0 6px 12px rgba(25, 118, 210, 0.4);
  transform: translateY(-2px);
}
.modern-btn--lile:active {
  transform: translateY(0);
}
.modern-btn--red {
  background: #d32f2f;
  color: white;
  box-shadow: 0 3px 6px rgba(211, 47, 47, 0.3);
}

.modern-btn--red:hover {
  background: #7c1919;
  box-shadow: 0 6px 12px rgba(211, 47, 47, 0.4);
  transform: translateY(-2px);
}

.modern-btn--red:active {
  transform: translateY(0);
}

.modern-btn--green {
  background: #388e3c;
  color: white;
  box-shadow: 0 3px 6px rgba(56, 142, 60, 0.3);
}

.modern-btn--green:hover {
  background: #1f5321;
  box-shadow: 0 6px 12px rgba(56, 142, 60, 0.4);
  transform: translateY(-2px);
}

.modern-btn--green:active {
  transform: translateY(0);
}

.modern-btn--orange {
  background: #f57c00;
  color: white;
  box-shadow: 0 3px 6px rgba(245, 124, 0, 0.3);
}

.modern-btn--orange:hover {
  background: #ef6c00;
  box-shadow: 0 6px 12px rgba(245, 124, 0, 0.4);
  transform: translateY(-2px);
}

.modern-btn--orange:active {
  transform: translateY(0);
}

.modern-btn--purple {
  background: #a700f5;
  color: white;
  box-shadow: 0 3px 6px rgba(147, 0, 245, 0.3);
}

.modern-btn--purple:hover {
  background: #8301a3;
  box-shadow: 0 6px 12px rgba(188, 0, 245, 0.4);
  transform: translateY(-2px);
}

.modern-btn--purple:active {
  transform: translateY(0);
}

.modern-btn--gray {
  background: #a7a7a7;
  color: white;
  box-shadow: 0 3px 6px rgba(59, 59, 59, 0.3);
}

.modern-btn--gray:hover {
  background: #535353;
  box-shadow: 0 6px 12px rgba(77, 76, 76, 0.4);
  transform: translateY(-2px);
}

.modern-btn--gray:active {
  transform: translateY(0);
}

/* Disabled state */
.modern-btn--disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

.modern-btn--disabled:hover {
  transform: none;
  box-shadow: none;
}

/* Tooltip */
.modern-btn[data-tooltip]:not([data-tooltip=""]):hover::before {
  content: attr(data-tooltip);
  position: absolute;
  bottom: 120%;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  z-index: 1000;
  opacity: 0;
  animation: tooltip-show 0.3s ease forwards;
}

.modern-btn[data-tooltip]:not([data-tooltip=""]):hover::after {
  content: '';
  position: absolute;
  bottom: 110%;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 5px solid rgba(0, 0, 0, 0.9);
  z-index: 1000;
  opacity: 0;
  animation: tooltip-show 0.3s ease forwards;
}

@keyframes tooltip-show {
  to {
    opacity: 1;
  }
}
</style>