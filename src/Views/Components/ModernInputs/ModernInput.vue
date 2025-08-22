<!-- ModernInput.vue -->
<script setup>
import { computed, ref } from 'vue';

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  type: {
    type: String,
    default: 'text',
    validator: (value) => ['text', 'email', 'password', 'number', 'tel', 'url'].includes(value)
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
    default: ''
  },
  required: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  readonly: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: ''
  },
  min: {
    type: [String, Number],
    default: null
  },
  max: {
    type: [String, Number],
    default: null
  },
  step: {
    type: [String, Number],
    default: null
  },
  autocomplete: {
    type: String,
    default: ''
  },
  showPasswordToggle: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['update:modelValue', 'blur', 'focus', 'input']);

const showPassword = ref(false);
const isFocused = ref(false);

const inputType = computed(() => {
  if (props.type === 'password' && showPassword.value) {
    return 'text';
  }
  return props.type;
});

const hasError = computed(() => !!props.error);

const handleInput = (event) => {
  let value = event.target.value;
  
  if (props.type === 'number') {
    value = value === '' ? '' : Number(value);
  }
  
  emit('update:modelValue', value);
  emit('input', event);
};

const handleFocus = (event) => {
  isFocused.value = true;
  emit('focus', event);
};

const handleBlur = (event) => {
  isFocused.value = false;
  emit('blur', event);
};

const togglePassword = () => {
  showPassword.value = !showPassword.value;
};
</script>

<template>
  <div class="modern-input-group mt-2">
    <label :for="$attrs.id" class="input-label">
      <span v-if="icon" class="material-icons label-icon">{{ icon }}</span>
      {{ label }}
      <span v-if="required" class="required-mark">*</span>
    </label>
    
    <div class="input-wrapper" :class="{ 
      'has-error': hasError, 
      'is-focused': isFocused,
      'is-disabled': disabled 
    }">
      <input
        :value="modelValue"
        :type="inputType"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :min="min"
        :max="max"
        :step="step"
        :autocomplete="autocomplete"
        class="modern-input"
        v-bind="$attrs"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
      />
      
      <!-- Password Toggle -->
      <button
        v-if="type === 'password' && showPasswordToggle"
        type="button"
        class="input-action-btn"
        @click="togglePassword"
        tabindex="-1"
      >
        <span class="material-icons">
          {{ showPassword ? 'visibility_off' : 'visibility' }}
        </span>
      </button>
      
      <!-- Number Controls -->
      <div v-if="type === 'number'" class="number-controls">
        <button
          type="button"
          class="number-btn"
          @click="$emit('update:modelValue', (Number(modelValue) || 0) + (Number(step) || 1))"
          :disabled="disabled || readonly"
          tabindex="-1"
        >
          <span class="material-icons">keyboard_arrow_up</span>
        </button>
        <button
          type="button"
          class="number-btn"
          @click="$emit('update:modelValue', Math.max((Number(modelValue) || 0) - (Number(step) || 1), Number(min) || -Infinity))"
          :disabled="disabled || readonly"
          tabindex="-1"
        >
          <span class="material-icons">keyboard_arrow_down</span>
        </button>
      </div>
    </div>
    
    <span v-if="hasError" class="error-text">
      <span class="material-icons">error</span>
      {{ error }}
    </span>
  </div>
</template>

<style scoped>
/* Input Group */
.modern-input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

/* Label */
.input-label {
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

/* Input Wrapper */
.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-wrapper.has-error .modern-input {
  border-color: #e53e3e;
  box-shadow: 0 0 0 3px rgba(229, 62, 62, 0.1);
}

.input-wrapper.is-focused .modern-input {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.input-wrapper.is-disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Input */
.modern-input {
  width: 100%;
  padding: 16px 20px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 16px;
  background: #fff;
  transition: all 0.3s ease;
  outline: none;
  font-family: inherit;
}

.modern-input:disabled {
  background-color: #f7fafc;
  cursor: not-allowed;
}

.modern-input:read-only {
  background-color: #f7fafc;
}

.modern-input::placeholder {
  color: #a0aec0;
}

/* Action Button (Password toggle, etc.) */
.input-action-btn {
  position: absolute;
  right: 16px;
  background: none;
  border: none;
  color: #a0aec0;
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  transition: color 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.input-action-btn:hover {
  color: #667eea;
}

.input-action-btn .material-icons {
  font-size: 20px;
}

/* Number Controls */
.number-controls {
  position: absolute;
  right: 8px;
  display: flex;
  flex-direction: column;
}

.number-btn {
  background: none;
  border: none;
  color: #a0aec0;
  cursor: pointer;
  padding: 2px;
  border-radius: 4px;
  transition: color 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 20px;
  width: 24px;
}

.number-btn:hover:not(:disabled) {
  color: #667eea;
  background: rgba(102, 126, 234, 0.1);
}

.number-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.number-btn .material-icons {
  font-size: 16px;
}

.input-wrapper:has(.number-controls) .modern-input {
  padding-right: 50px;
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
.input-wrapper.has-error {
  animation: shake 0.5s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}

/* Responsive */
@media (max-width: 480px) {
  .modern-input {
    padding: 14px 16px;
    font-size: 16px; /* Evita zoom en iOS */
  }
  
  .input-action-btn {
    right: 12px;
  }
  
  .number-controls {
    right: 4px;
  }
  
  .input-wrapper:has(.number-controls) .modern-input {
    padding-right: 44px;
  }
}
</style>
