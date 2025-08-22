<script setup>
const props = defineProps({
    show:  {
        type: Boolean,
        default: false
    },
    showHeader: {
        type: Boolean,
        default: true
    },
    showBody: {
        type: Boolean,
        default: true
    },
    showFooter: {
        type: Boolean,
        default: true
    },
    width: {
        type: Number,
        default: 25
    },
    maxWidth: {
        type: String,
        default: '600px'
    },
    title: {
        type: String,
        default: ''
    },
    icon: {
        type: String,
        default: ''
    },
    closable: {
        type: Boolean,
        default: true
    }
});

const emit = defineEmits(['close', 'update:show']);

const closeModal = () => {
    console.log("closemodal");
    
    emit('close');
    emit('update:show', false);
};

const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget && props.closable) {
        closeModal();
    }
};
</script>

<template>
    <Transition name="modal">
        <div 
            v-if="show" 
            class="modal-mask" 
            @click="handleBackdropClick"
        >
            <div 
                class="modal-container" 
                :style="{ 
                    width: width + '%',
                    maxWidth: maxWidth
                }"
                @click.stop
            >
                <!-- Header -->
                <div v-if="showHeader" class="modal-header">
                    <slot name="header">
                        <div class="header-content">
                            <div class="header-main">
                                <div v-if="icon" class="header-icon">
                                    <span class="material-icons">{{ icon }}</span>
                                </div>
                                <div class="header-text">
                                    <h2 v-if="title" class="header-title">{{ title }}</h2>
                                </div>
                            </div>
                            <button 
                                v-if="closable"
                                @click="closeModal"
                                class="close-button"
                                type="button"
                            >
                                <span class="material-icons">close</span>
                            </button>
                        </div>
                    </slot>
                </div>

                <!-- Body -->
                <div v-if="showBody" class="modal-body">
                    <slot name="body"></slot>
                </div>

                <!-- Footer -->
                <div v-if="showFooter" class="modal-footer">
                    <slot name="footer"></slot>
                </div>
            </div>
        </div>
    </Transition>
</template>

<style scoped>
/* Modal Mask */
.modal-mask {
    position: fixed;
    z-index: 9998;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    overflow-y: auto;
}

/* Modal Container */
.modal-container {
    background: rgba(255, 255, 255, 0.98);
    backdrop-filter: blur(20px);
    border-radius: 20px;
    box-shadow: 
        0 20px 40px rgba(0, 0, 0, 0.15),
        0 0 0 1px rgba(255, 255, 255, 0.2);
    overflow: hidden;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    animation: modalSlideUp 0.4s ease-out;
}

@keyframes modalSlideUp {
    from {
        opacity: 0;
        transform: translateY(30px) scale(0.95);
    }
    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

/* Header */
.modal-header {
    /* background: linear-gradient(271deg, #008aff 0%, #0a39a6 100%); */
    /* background: linear-gradient(271deg, #004ccf 0%, #01144c 100%); */
    /* background: linear-gradient(271deg, #3f3f41 0%, #181818ec 100%); */
    background: linear-gradient(271deg, #2d3748 0%, #1a202c 100%);
    color: rgb(161, 161, 161);
    padding: 0;
}

.header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 24px 32px;
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
    /* background: rgba(255, 255, 255, 0.226); */
    background: linear-gradient(271deg, #004ccfc2 0%, #01144cfd 100%);
    border-radius: 14px;
    backdrop-filter: blur(10px);
}

.header-icon .material-icons {
    font-size: 24px;
    color: white;
}

.header-title {
    font-size: 24px;
    font-weight: 700;
    margin: 0;
    line-height: 1.2;
    letter-spacing: -0.5px;
}

.close-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    margin-left: 1rem;
    background: rgba(199, 199, 199, 0.63);
    border: none;
    border-radius: 10px;
    color: white;
    cursor: pointer;
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);
}

.close-button:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.05);
}

.close-button .material-icons {
    font-size: 20px;
}

/* Body */
.modal-body {
    padding: 32px;
    flex: 1;
    overflow-y: auto;
    max-height: calc(90vh - 200px);
}

.modal-body::-webkit-scrollbar {
    width: 8px;
}

.modal-body::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
}

.modal-body::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 4px;
}

.modal-body::-webkit-scrollbar-thumb:hover {
    background: #667eea;
}

/* Footer */
.modal-footer {
    padding: 24px 32px;
    background: #f8fafc;
    border-top: 1px solid rgba(0, 0, 0, 0.06);
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 12px;
}

/* Transition Effects */
.modal-enter-active, .modal-leave-active {
    transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.modal-enter-from, .modal-leave-to {
    opacity: 0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
    transform: translateY(30px) scale(0.95);
}

/* Responsive Design */
@media (max-width: 768px) {
    .modal-mask {
        padding: 16px;
    }
    
    .modal-container {
        width: 100% !important;
        max-width: none !important;
        border-radius: 16px;
        max-height: 95vh;
    }
    
    .header-content {
        padding: 20px 24px;
    }
    
    .header-title {
        font-size: 20px;
    }
    
    .header-icon {
        width: 40px;
        height: 40px;
    }
    
    .header-icon .material-icons {
        font-size: 20px;
    }
    
    .close-button {
        width: 36px;
        height: 36px;
    }
    
    .modal-body {
        padding: 24px;
        max-height: calc(95vh - 180px);
    }
    
    .modal-footer {
        padding: 20px 24px;
        flex-direction: column-reverse;
        align-items: stretch;
    }
    
    .modal-footer :deep(.modern-btn) {
        width: 100%;
        justify-content: center;
    }
}

@media (max-width: 480px) {
    .modal-mask {
        padding: 12px;
    }
    
    .modal-container {
        border-radius: 12px;
    }
    
    .header-content {
        padding: 16px 20px;
    }
    
    .header-title {
        font-size: 18px;
    }
    
    .modal-body {
        padding: 20px;
    }
    
    .modal-footer {
        padding: 16px 20px;
    }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
    .modal-container {
        background: rgba(229, 229, 230, 0.98);
        color: #444444;
    }
    
    .modal-footer {
        background: #06327e;
        /* border-top-color: rgba(255, 255, 255, 0.1); */
        background: linear-gradient(271deg, #2d3748 0%, #1a202c 100%);

    }
}

/* Special styling for content */
.modal-body :deep(.form-group) {
    margin-bottom: 24px;
}

.modal-body :deep(.form-group:last-child) {
    margin-bottom: 0;
}

.modal-body :deep(.search-section) {
    background: #f8fafc;
    padding: 20px;
    border-radius: 12px;
    margin-bottom: 24px;
    border: 1px solid rgba(0, 0, 0, 0.06);
}

.modal-body :deep(.table-section) {
    background: white;
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid rgba(0, 0, 0, 0.06);
}
</style>