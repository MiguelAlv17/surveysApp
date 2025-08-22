<script setup>
import Loading from '../components/Loading.vue'
import { ref, onMounted, computed } from 'vue';
import EasyDataTable from 'vue3-easy-data-table';
import CardInfo from '../components/CardInfo.vue'
import cardExit from '../components/CardsTable/cardExit.vue'
import '../assets/styles/home.css'
import '../assets/styles/generalStyle.css'
import cardHistoricResult from '../components/cardsWithGraphics/cardHistoricResult.vue'
import BarGraphic from '../components/Graphics/barGraphic.vue';



const isloading = ref(true);
onMounted( () => {
    setTimeout(() => {
        isloading.value = false; // Cambiar el valor de errorAuth
    }, 1000); //
});

</script>

<template>
    <Loading v-if="isloading"></Loading>
    <div v-else>
       

    
        <div class="row" style="width: 100%;">
            <div class="col-sm-6">
                <div class="custom-container mx-auto" >
                    <span class="mb-3"> Historial de accesos: </span>
                    <div class="row mx-auto" style="width: 100%; max-height: 300px; overflow-y: auto;" >
                        <div class="col-sm-12 mb-2">
                            <cardExit title="Entrada" texto="24/11/ 11:08" stylecard="entry"/>
                        </div>
                        <div class="col-sm-12 mb-2">
                            <cardExit title="Salida" texto="24/11/ 12:58" stylecard="exit"/>
                        </div>
                        <div class="col-sm-12 mb-2">
                            <cardExit title="Entrada" texto="24/11/ 13:28" stylecard="entry"/>
                        </div>
                        <div class="col-sm-12 mb-2">
                            <cardExit title="Entrada" texto="24/11/ 13:35" stylecard="entry"/>
                        </div>
                        <div class="col-sm-12 mb-2">
                            <cardExit title="Entrada" texto="24/11/ 13:54" stylecard="entry"/>
                        </div>
                    </div>
                
                </div>
            </div>
            <div class="col-sm-6 " style="align-items: center; display: flex; flex-direction: column;">
                <div class="col-6 d-flex justify-content-center" >
                    <CardInfo 
                        texto="TOTAL ACCESSOS" 
                        cantidad="37"
                        :icon="'minor_crash'"
                        iconColor="icon-green"
                        custom="color-custom-green"
                        style="width: 100%;"
                    />
                </div>
                <div class="col-6 d-flex justify-content-center" >
                    <CardInfo 
                    texto="TOTAL SALIDAS" 
                    cantidad="35"
                    :icon="'minor_crash'"
                    iconColor="icon-red"
                    custom="color-custom-red"
                    style="width: 100%;"
                    />
                </div>
                <div class="col-6 d-flex justify-content-center" >
                    <CardInfo 
                    texto="TOTAL LECTURAS QR" 
                    cantidad="72"
                    custom="color-custom-blue-sky"
                    iconColor="icon-blue-sky"
                    :icon="'qr_code_scanner'"
                    style="width: 100%;"
                    />
                </div>
            </div>
        </div>    

        <div class="row" style="width: 100%;">
            <div class="col-12">
                <div class="custom-container mx-auto">
                          <BarGraphic />
                </div>
            </div>            
        </div>

    </div>
</template>
