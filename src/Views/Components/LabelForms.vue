<script setup>
    const props = defineProps({
        text:{
            type:String,
            default:'texto'
        }
    })
</script>
<template>
    <label for="exampleInputEmail1" class="form-label" style="color: gray;"
    >{{ props.text }}
    </label>
</template>