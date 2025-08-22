<script setup>
import { computed } from 'vue';

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  label: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'Seleccione una opción'
  },
  options: {
    type: Array,
    required: true,
    default: () => []
  },
  optionLabel: {
    type: String,
    default: 'label'
  },
  optionValue: {
    type: String,
    default: 'value'
  },
  required: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['update:modelValue', 'blur', 'focus', 'change']);

const hasError = computed(() => !!props.error);

const normalizedOptions = computed(() => {
  return props.options.map(option => {
    // Si es string o number, usar como label y value
    if (typeof option === 'string' || typeof option === 'number') {
      return { label: option, value: option };
    }
    // Si es objeto, usar las propiedades especificadas
    return {
      label: option[props.optionLabel] || option.label || option.value,
      value: option[props.optionValue] || option.value || option
    };
  });
});

const handleChange = (event) => {
  const value = event.target.value;
  emit('update:modelValue', value);
  emit('change', event);
};

const handleFocus = (event) => {
  emit('focus', event);
};

const handleBlur = (event) => {
  emit('blur', event);
};
</script>

<template>
  <div class="modern-select-group mt-2">
    <label :for="$attrs.id" class="select-label">
      <span v-if="icon" class="material-icons label-icon">{{ icon }}</span>
      {{ label }}
      <span v-if="required" class="required-mark">*</span>
    </label>
    
    <div class="select-wrapper" :class="{ 
      'has-error': hasError,
      'is-disabled': disabled 
    }">
      <select
        :value="modelValue"
        :disabled="disabled"
        :required="required"
        class="modern-select"
        v-bind="$attrs"
        @change="handleChange"
        @focus="handleFocus"
        @blur="handleBlur"
      >
        <option value="" disabled>{{ placeholder }}</option>
        <option
          v-for="option in normalizedOptions"
          :key="option.value"
          :value="option.value"
        >
          {{ option.label }}
        </option>
      </select>
      
      <div class="select-arrow">
        <span class="material-icons">expand_more</span>
      </div>
    </div>
    
    <span v-if="hasError" class="error-text">
      <span class="material-icons">error</span>
      {{ error }}
    </span>
  </div>
</template>

<style scoped>
/* Select Group */
.modern-select-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

/* Label */
.select-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #2d3748;
  font-size: 14px;
  cursor: pointer;
}

.label-icon {
  font-size: 18px;
  color: #667eea;
}

.required-mark {
  color: #e53e3e;
  font-weight: bold;
}

/* Select Wrapper */
.select-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.select-wrapper.has-error .modern-select {
  border-color: #e53e3e;
  box-shadow: 0 0 0 3px rgba(229, 62, 62, 0.1);
}

.select-wrapper.is-disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Select */
.modern-select {
  width: 100%;
  padding: 16px 50px 16px 20px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 16px;
  background: #fff;
  transition: all 0.3s ease;
  outline: none;
  appearance: none;
  cursor: pointer;
  font-family: inherit;
  color: #2d3748;
}

.modern-select:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.modern-select:disabled {
  background-color: #f7fafc;
  cursor: not-allowed;
  color: #a0aec0;
}

/* Placeholder option styling */
.modern-select option:disabled {
  color: #a0aec0;
  font-style: italic;
}

.modern-select option:not(:disabled) {
  color: #2d3748;
  background: #fff;
}

.modern-select option:checked {
  background: #667eea;
  color: white;
}

/* Select Arrow */
.select-arrow {
  position: absolute;
  right: 16px;
  color: #a0aec0;
  pointer-events: none;
  transition: color 0.3s ease;
}

.select-wrapper:focus-within .select-arrow {
  color: #667eea;
}

.select-arrow .material-icons {
  font-size: 20px;
}

/* Error Text */
.error-text {
  color: #e53e3e;
  font-size: 12px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
}

.error-text .material-icons {
  font-size: 14px;
}

/* Animation para error */
.select-wrapper.has-error {
  animation: shake 0.5s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}

/* Responsive */
@media (max-width: 480px) {
  .modern-select {
    padding: 14px 44px 14px 16px;
    font-size: 16px; /* Evita zoom en iOS */
  }
  
  .select-arrow {
    right: 12px;
  }
}

/* Mejoras visuales para diferentes navegadores */
.modern-select::-ms-expand {
  display: none; /* IE/Edge */
}

.modern-select::-webkit-scrollbar {
  width: 8px;
}

.modern-select::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.modern-select::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.modern-select::-webkit-scrollbar-thumb:hover {
  background: #667eea;
}

/* Estados adicionales */
.modern-select:hover:not(:disabled) {
  border-color: #cbd5e0;
}

.modern-select:focus:hover {
  border-color: #667eea;
}

/* Estilo para opciones en algunos navegadores */
.modern-select option {
  padding: 8px 12px;
  font-size: 16px;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .modern-select {
    background: #ffffff;
    color: #474747;
    border-color: #e2e8f0;
  }
  
  .modern-select:focus {
    border-color: #667eea;
  }
  
  .modern-select:disabled {
    background-color: #f0f3f8;
    color: #718096;
  }
  
  .modern-select option {
    background: #2d3748;
    color: #f7fafc;
  }
}
</style>