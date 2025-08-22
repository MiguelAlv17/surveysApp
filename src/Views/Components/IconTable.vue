<script setup>
    const props = defineProps({
        icon:{
            type: String,
            Default: 'error'
        },
        color:{
            type: String,
            Default: 'green'
        }
    })
</script>
<template>
    <span class="material-icons" :class="color">
        {{props.icon}}
    </span>
</template>
<style scoped>
.green{
    color: rgb(81, 160, 81);
}
.red{
    /* background-color: red; */
    color: rgb(228, 85, 85);
}
</style>