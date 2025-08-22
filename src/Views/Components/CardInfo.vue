<script setup>
// import  '../../assets/styles/Components/CardInfo.css'
import { useDynamicCSS } from '../../composables/useDynamicCSS'
useDynamicCSS('./styles/Components/CardInfo.css')
const props = defineProps({
    title: {
        type: String,
        default: "Información",
    },
    subtitle: {
        type: [String, Number],
        default: "---",
    },
    icon: {
        type: String,
        default: 'info'
    },
    color: {
        type: String,
        default: 'blue'
    },
    size: {
        type: String,
        default: 'normal', // 'small', 'normal', 'large'
    },
    animated: {
        type: Boolean,
        default: true
    },
    clickable: {
        type: Boolean,
        default: false
    }
}, ['click'])
</script>

<template>
    <div 
        class="modern-card-info" 
        :class="[
            `card-${color}`, 
            `card-${size}`,
            { 'card-animated': animated },
            { 'card-clickable': clickable }
        ]"
        @click="clickable ? $emit('click') : null"
    >
        <!-- Icono -->
        <div class="card-icon-container">
            <div class="card-icon-wrapper">
                <span class="material-icons card-icon">{{ icon }}</span>
            </div>
            <div class="card-icon-background"></div>
        </div>

        <!-- Contenido -->
        <div class="card-content">
            <div class="card-subtitle">{{ subtitle }}</div>
            <div class="card-title">{{ title }}</div>
        </div>

        <!-- Efecto de brillo -->
        <div class="card-shine" v-if="animated"></div>
    </div>
</template>

<style scoped>

</style>