<script setup>
const props = defineProps({
    text:{
        type: String,
        default:'Title'
    }
}) 
</script>
<template>
        <h5 style="color: gray;">{{ props.text }}</h5>
</template>