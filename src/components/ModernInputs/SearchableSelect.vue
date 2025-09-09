<script setup>
import { ref, computed, watch, nextTick } from 'vue';

const props = defineProps({
  modelValue: {
    type: [String, Number, Array],
    default: ''
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
  placeholder: {
    type: String,
    default: 'Buscar y seleccionar...'
  },
  label: {
    type: String,
    default: ''
  },
  multiple: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  required: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: ''
  },
  clearable: {
    type: Boolean,
    default: true
  },
  maxHeight: {
    type: String,
    default: '200px'
  },
  noDataText: {
    type: String,
    default: 'No se encontraron opciones'
  }
});

const emit = defineEmits(['update:modelValue', 'change', 'search', 'focus', 'blur']);

// Estados reactivos
const isOpen = ref(false);
const searchTerm = ref('');
const inputRef = ref(null);
const dropdownRef = ref(null);
const selectedIndex = ref(-1);

// Normalizar opciones
const normalizedOptions = computed(() => {
  return props.options.map(option => {
    if (typeof option === 'string' || typeof option === 'number') {
      return { label: option, value: option };
    }
    return {
      label: option[props.optionLabel] || option.label || option.value || option,
      value: option[props.optionValue] || option.value || option
    };
  });
});

// Filtrar opciones según búsqueda
const filteredOptions = computed(() => {
  if (!searchTerm.value) {
    return normalizedOptions.value;
  }
  
  return normalizedOptions.value.filter(option =>
    option.label.toString().toLowerCase().includes(searchTerm.value.toLowerCase())
  );
});

// Obtener etiqueta de la selección actual
const selectedLabel = computed(() => {
  if (!props.modelValue) return '';
  
  if (props.multiple) {
    const selectedOptions = normalizedOptions.value.filter(option => 
      Array.isArray(props.modelValue) && props.modelValue.includes(option.value)
    );
    return selectedOptions.map(option => option.label).join(', ');
  }
  
  const selected = normalizedOptions.value.find(option => option.value === props.modelValue);
  return selected ? selected.label : '';
});

// Verificar si una opción está seleccionada
const isSelected = (option) => {
  if (props.multiple) {
    return Array.isArray(props.modelValue) && props.modelValue.includes(option.value);
  }
  return props.modelValue === option.value;
};

// Abrir/cerrar dropdown
const toggleDropdown = () => {
  if (props.disabled) return;
  
  if (isOpen.value) {
    closeDropdown();
  } else {
    openDropdown();
  }
};

const openDropdown = async () => {
  isOpen.value = true;
  selectedIndex.value = -1;
  await nextTick();
  if (inputRef.value) {
    inputRef.value.focus();
  }
  emit('focus');
};

const closeDropdown = () => {
  isOpen.value = false;
  searchTerm.value = '';
  selectedIndex.value = -1;
  emit('blur');
};

// Seleccionar opción
const selectOption = (option) => {
  if (props.multiple) {
    const currentValue = Array.isArray(props.modelValue) ? [...props.modelValue] : [];
    
    if (currentValue.includes(option.value)) {
      // Deseleccionar
      const newValue = currentValue.filter(v => v !== option.value);
      emit('update:modelValue', newValue);
    } else {
      // Seleccionar
      currentValue.push(option.value);
      emit('update:modelValue', currentValue);
    }
  } else {
    emit('update:modelValue', option.value);
    closeDropdown();
  }
  
  emit('change', option);
};

// Limpiar selección
const clearSelection = () => {
  const newValue = props.multiple ? [] : '';
  emit('update:modelValue', newValue);
  emit('change', null);
  searchTerm.value = '';
};

// Navegación con teclado
const handleKeydown = (event) => {
  if (!isOpen.value && ['Enter', 'ArrowDown', 'ArrowUp', ' '].includes(event.key)) {
    event.preventDefault();
    openDropdown();
    return;
  }
  
  if (!isOpen.value) return;
  
  switch (event.key) {
    case 'Escape':
      event.preventDefault();
      closeDropdown();
      break;
      
    case 'ArrowDown':
      event.preventDefault();
      selectedIndex.value = Math.min(selectedIndex.value + 1, filteredOptions.value.length - 1);
      scrollToOption();
      break;
      
    case 'ArrowUp':
      event.preventDefault();
      selectedIndex.value = Math.max(selectedIndex.value - 1, -1);
      scrollToOption();
      break;
      
    case 'Enter':
      event.preventDefault();
      if (selectedIndex.value >= 0 && filteredOptions.value[selectedIndex.value]) {
        selectOption(filteredOptions.value[selectedIndex.value]);
      }
      break;
      
    case 'Tab':
      closeDropdown();
      break;
  }
};

// Scroll a la opción seleccionada
const scrollToOption = async () => {
  await nextTick();
  if (dropdownRef.value && selectedIndex.value >= 0) {
    const option = dropdownRef.value.children[selectedIndex.value];
    if (option) {
      option.scrollIntoView({ block: 'nearest' });
    }
  }
};

// Cerrar al hacer clic fuera
const handleClickOutside = (event) => {
  if (!dropdownRef.value?.contains(event.target) && !inputRef.value?.contains(event.target)) {
    closeDropdown();
  }
};

// Watchers
watch(searchTerm, (newValue) => {
  selectedIndex.value = -1;
  emit('search', newValue);
});

watch(isOpen, (newValue) => {
  if (newValue) {
    document.addEventListener('click', handleClickOutside);
  } else {
    document.removeEventListener('click', handleClickOutside);
  }
});

// Cleanup
import { onUnmounted } from 'vue';
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<template>
  <div class="searchable-select">
    <!-- Label -->
    <label v-if="label" class="select-label">
      {{ label }}
      <span v-if="required" class="required-mark">*</span>
    </label>
    
    <!-- Select Container -->
    <div 
      class="select-container"
      :class="{ 
        'is-open': isOpen, 
        'is-disabled': disabled,
        'has-error': error,
        'has-selection': modelValue && (Array.isArray(modelValue) ? modelValue.length > 0 : true)
      }"
    >
      <!-- Input Display -->
      <div class="select-input" @click="toggleDropdown">
        <!-- Selected Values Display -->
        <div class="selected-display">
          <span v-if="!selectedLabel" class="placeholder">
            {{ placeholder }}
          </span>
          <span v-else class="selected-text">
            {{ selectedLabel }}
          </span>
        </div>
        
        <!-- Actions -->
        <div class="select-actions">
          <button
            v-if="clearable && selectedLabel && !disabled"
            type="button"
            class="clear-btn"
            @click.stop="clearSelection"
          >
            <span class="material-icons">close</span>
          </button>
          
          <div class="dropdown-arrow" :class="{ 'is-open': isOpen }">
            <span class="material-icons">expand_more</span>
          </div>
        </div>
      </div>
      
      <!-- Dropdown -->
      <Transition name="dropdown">
        <div v-if="isOpen" class="dropdown-menu" :style="{ maxHeight }">
          <!-- Search Input -->
          <div class="search-container">
            <div class="search-wrapper">
              <span class="material-icons search-icon">search</span>
              <input
                ref="inputRef"
                v-model="searchTerm"
                type="text"
                class="search-input"
                :placeholder="`Buscar en ${normalizedOptions.length} opciones...`"
                @keydown="handleKeydown"
                @click.stop
              />
            </div>
          </div>
          
          <!-- Options -->
          <div ref="dropdownRef" class="options-container">
            <div
              v-for="(option, index) in filteredOptions"
              :key="option.value"
              class="option-item"
              :class="{ 
                'is-selected': isSelected(option),
                'is-highlighted': index === selectedIndex
              }"
              @click="selectOption(option)"
              @mouseenter="selectedIndex = index"
            >
              <!-- Checkbox para múltiple -->
              <div v-if="multiple" class="option-checkbox">
                <span class="material-icons">
                  {{ isSelected(option) ? 'check_box' : 'check_box_outline_blank' }}
                </span>
              </div>
              
              <!-- Texto de la opción -->
              <span class="option-text">{{ option.label }}</span>
              
              <!-- Check para single -->
              <span v-if="!multiple && isSelected(option)" class="material-icons check-icon">
                check
              </span>
            </div>
            
            <!-- Sin resultados -->
            <div v-if="filteredOptions.length === 0" class="no-options">
              <span class="material-icons">search_off</span>
              <span>{{ noDataText }}</span>
            </div>
          </div>
        </div>
      </Transition>
    </div>
    
    <!-- Error Message -->
    <span v-if="error" class="error-text">
      <span class="material-icons">error</span>
      {{ error }}
    </span>
  </div>
</template>

<style scoped>
.searchable-select {
  position: relative;
  width: 100%;
}

/* Label */
.select-label {
  display: block;
  font-weight: 600;
  color: #2d3748;
  font-size: 14px;
  margin-bottom: 8px;
}

.required-mark {
  color: #e53e3e;
  margin-left: 4px;
}

/* Select Container */
.select-container {
  position: relative;
  width: 100%;
}

/* Select Input */
.select-input {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-height: 48px;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  background: #fff;
  cursor: pointer;
  transition: all 0.3s ease;
  outline: none;
}

.select-input:hover:not(.is-disabled) {
  border-color: #cbd5e0;
}

.select-container.is-open .select-input,
.select-input:focus-within {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.select-container.has-error .select-input {
  border-color: #e53e3e;
  box-shadow: 0 0 0 3px rgba(229, 62, 62, 0.1);
}

.select-container.is-disabled .select-input {
  background: #f7fafc;
  color: #a0aec0;
  cursor: not-allowed;
}

/* Selected Display */
.selected-display {
  flex: 1;
  overflow: hidden;
}

.placeholder {
  color: #a0aec0;
  font-size: 15px;
}

.selected-text {
  color: #2d3748;
  font-size: 15px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Actions */
.select-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 12px;
}

.clear-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background: none;
  border: none;
  color: #a0aec0;
  cursor: pointer;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.clear-btn:hover {
  color: #e53e3e;
  background: rgba(229, 62, 62, 0.1);
}

.clear-btn .material-icons {
  font-size: 16px;
}

.dropdown-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #a0aec0;
  transition: all 0.3s ease;
}

.dropdown-arrow.is-open {
  transform: rotate(180deg);
  color: #667eea;
}

.dropdown-arrow .material-icons {
  font-size: 20px;
}

/* Dropdown Menu */
.dropdown-menu {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
  border: 1px solid #e2e8f0;
  z-index: 1000;
  overflow: hidden;
}

/* Search Container */
.search-container {
  padding: 12px;
  border-bottom: 1px solid #f7fafc;
}

.search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  color: #a0aec0;
  font-size: 18px;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 8px 12px 8px 40px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.3s ease;
  background: #fafafa;
}

.search-input:focus {
  border-color: #667eea;
  background: #fff;
}

/* Options Container */
.options-container {
  overflow-y: auto;
}

.options-container::-webkit-scrollbar {
  width: 6px;
}

.options-container::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.options-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.options-container::-webkit-scrollbar-thumb:hover {
  background: #667eea;
}

/* Option Item */
.option-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-bottom: 1px solid #f7fafc;
  gap: 12px;
}

.option-item:last-child {
  border-bottom: none;
}

.option-item:hover,
.option-item.is-highlighted {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
}

.option-item.is-selected {
  background: rgba(102, 126, 234, 0.15);
  color: #667eea;
  font-weight: 600;
}

.option-checkbox {
  color: #667eea;
}

.option-checkbox .material-icons {
  font-size: 20px;
}

.option-text {
  flex: 1;
  font-size: 14px;
  line-height: 1.4;
}

.check-icon {
  font-size: 18px;
  color: #667eea;
}

/* No Options */
.no-options {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 24px 16px;
  color: #a0aec0;
  font-size: 14px;
  font-style: italic;
}

.no-options .material-icons {
  font-size: 20px;
}

/* Error Text */
.error-text {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #e53e3e;
  font-size: 12px;
  font-weight: 500;
  margin-top: 4px;
}

.error-text .material-icons {
  font-size: 14px;
}

/* Dropdown Transition */
.dropdown-enter-active, .dropdown-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.dropdown-enter-from, .dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

/* Responsive */
@media (max-width: 768px) {
  .select-input {
    min-height: 44px;
    padding: 10px 14px;
  }
  
  .dropdown-menu {
    max-height: 250px !important;
  }
  
  .option-item {
    padding: 10px 14px;
  }
  
  .search-input {
    font-size: 16px; /* Evita zoom en iOS */
  }
}
</style>