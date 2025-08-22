<script setup>
    import BtnHome from './Components/BtnHome.vue';
    import { useRouter } from 'vue-router'
import ContainerCustom from './Components/ContainerCustom.vue';
    const router = useRouter()
    const redirecTo_recaudacion = () => {
        router.push("/recaudacion")
    }
    const redirecTo_descompresion = () => {
        router.push("/descompresion")
    }
    
    const redirecTo_utilities = () => {
        router.push("/utilities")
    }
    const redirecTo_kioscos = () => {
        router.push("/kioscos")
    }
</script>
<template>
   <ContainerCustom 
        title="Home"
        icon="storage"
        header-background="gradient"
        :loading="false"
        >
        <template #body>
            <div class="row">
                <div class="col">
                    <BtnHome texto="Recaudacion" icon="paid" custom_color="green" @funcion="redirecTo_recaudacion" />
                </div>
                <div class="col">
                    <BtnHome texto="Descompresion" icon="unarchive" custom_color="orange" @funcion="redirecTo_descompresion" />
                </div>
                <div class="col">
                    <BtnHome texto="Utilidades" icon="token" custom_color="blue" @funcion="redirecTo_utilities" />
                </div>
                <div class="col">
                    <BtnHome texto="Kioscos" icon="desktop_windows" custom_color="purple" @funcion="redirecTo_kioscos" />
                </div>
                 <div class="col">
                    <BtnHome texto="Corte Efectivo" icon="payments" custom_color="red" @funcion="redirecTo_kioscos" />
                </div>
            </div>
           
        </template>
    </ContainerCustom>
</template>