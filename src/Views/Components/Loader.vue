<script setup>
    const props= defineProps({
        text:{type: String,
            default:"cargando"
        }
    })
</script>
<template> 

    <div id="loader" class="overlay" style="display: flex; justify-content: center; align-items: center;">
            <div class="d-flex justify-content-center" >
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
               &nbsp; <span class="text-primary">{{ props.text }}</span>
            </div>
        </div>
</template>
<style scoped>
.overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(250, 250, 250, 0.57);
    /* Color negro con transparencia del 90% */
    z-index: 1044;
    /* Valor alto para superponerse a otros elementos */
}
</style>