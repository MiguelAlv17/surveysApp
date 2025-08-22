<script setup>
import { computed, onMounted, ref } from 'vue';
import ContainerCustom from '../Components/ContainerCustom.vue';
import { useRouter } from 'vue-router'

import { alert_error, alert_success } from '../../constants/alerts';
import IconTable from '../Components/IconTable.vue';
import CardInfo from '../Components/CardInfo.vue';
import Loader from '../Components/Loader.vue';
import ButtonCustom from '../Components/ButtonCustom.vue';
import LoaderBtn from '../Components/LoaderBtn.vue';
import { useDynamicCSS } from '../../composables/useDynamicCSS'
import ButtonTable from '../Components/ButtonTable.vue';
useDynamicCSS('./styles/Recaudacion.css')
// import  '../../assets/styles/Recaudacion.css'  


const headers =ref(  [
    { text: "ID", value: "id" },
    { text: "NOMBRE", value: "name_device"},
    { text: "CARPETA", value: "located_at"},
    { text: "CARPETA", value: "folder_custom"},
    { text: "STATUS", value: "status_custom"},
]);
const router = useRouter()
const items = ref([]) ;
const itemsSelected = ref([]);
const searchField = ["id", "name_device", "located_at", "status"]; //campos por los que buscara el filtro
const searchInput = ref("");
const isLoading_btn = ref(false);
const cardsSection = ref(false);
const fileSelected = ref("0");
const picked = ref('all')
const basesInfo = ref({
    totalBases:0,
    faltantes:0,
    completas:0
});
const prevState = ref({
    isallComplete:false,
    isMissingBases:false,
})

onMounted( () => {
    // getKioscos_tbl()
});

const getKioscos_tbl = async() => {
  isLoading_btn.value=true;
  resetForm()
  const {status,data} = await window.api.getKioscos(fileSelected.value)
      if (status!=200) {
          alert_error("Ocurrio un error al cargar los datos de la tabla")   
          return
      }
      console.log(data);
      items.value = data
     await verify_kioscos()
  isLoading_btn.value=false;
}

const resetForm = () => {
  items.value=[];
  prevState.value.isMissingBases=false;
  prevState.value.isallComplete=false;
  basesInfo.value.completas=0;
  basesInfo.value.faltantes=0;
  basesInfo.value.totalBases=0;
  picked.value='all'
}

const verify_kioscos = async() => {
  const numFaltantes = items.value.filter(item => item.status==false);
  const numCompletas = items.value.filter(item => item.status==true);
  basesInfo.value.totalBases = items.value.length;
  basesInfo.value.faltantes=numFaltantes.length;
  basesInfo.value.completas =numCompletas.length;
  cardsSection.value=true;
  return 
}

const getClass = (card) => {
  // clases para la card de bases completas
  if (card=='BC') {
      if(basesInfo.value.completas==basesInfo.value.totalBases && basesInfo.value.totalBases>0){
          prevState.value.isallComplete=true;
          return "green"
          
      };
      if(basesInfo.value.completas>=0 && basesInfo.value.completas<basesInfo.value.totalBases) {
          prevState.value.isallComplete=false;
          return "red"
      };    
  }

  if (card=='BF') {
      if(basesInfo.value.faltantes>0 || basesInfo.value.totalBases==0) {
          prevState.value.isMissingBases=false;
          

          return "red"
      };    
      if(basesInfo.value.faltantes==0 && basesInfo.value.totalBases>0) {
          prevState.value.isMissingBases=true;
          return "green"
      };    
      
  }
  return "white"
 }

 const claseBF = computed(() => getClass('BF'));
 const claseBC = computed(() => getClass('BC'));
 const afterFilter = computed(()=>{
      console.log(picked.value);
      if(picked.value == 'missing') return items.value.filter(i=>i.status==false);
      if(picked.value == 'complete') return items.value.filter(i=>i.status==true);
      return items.value
 })
 
 const nextStep = () => {
  if (itemsSelected.value.length > 0) {
      const ids = itemsSelected.value.map(e => e.id)
      router.push({
          path: '/intermediate',
          query: {
              ids: JSON.stringify(ids)  // compacta el array
          }
      })
  }
 }
 
 const testConciliacion = async() => {
      isLoading_btn.value=true;
      const response = await window.api.pruebaRecaudacion();
      console.log(response);
      isLoading_btn.value=false;
 }
 const OpenfileExplorer = async(folder) => {
    const response = await window.api.openFolder(folder)
    const {status, data}=response;       
    if (status!=200) {
        alert_error("Ocurrio un error al abrir el explorador");
        return
    } 
    alert_success("Abriendo explorador de archivos");
}
</script> 

<template>
    <!-- <Loader v-if="isLoading_btn" text="Buscando bases"/> -->
    
    <ContainerCustom 
        
        title="PASO 1 VERIFICACION DE ARCHIVOS"
        subtitle="Selecciona el tipo de archivo y verifica el estado de las bases de datos"
        icon="assignment_turned_in"
        header-background="gradient"
        :loading="isLoading_btn"
    >
        <template #body>
            <!-- Sección de Configuración -->
            <div class="config-section">
                <div class="config-card">
                    <div class="config-header">
                        <span class="material-icons config-icon">settings</span>
                        <h3 class="config-title">Configuración de Búsqueda</h3>
                    </div>
                    
                    <div class="config-content">
                        <div class="file-selector">
                            <label class="modern-label">
                                <span class="label-text">
                                    <span class="material-icons label-icon">description</span>
                                    Tipo de archivo
                                </span>
                                <select class="modern-select" v-model="fileSelected">
                                    <option disabled selected value="0">Selecciona uno</option>
                                    <option value="FOLIO2.FDB">FOLIO2.FDB</option>
                                    <option value="FLIO2BKP.fdb">FLIO2BCKP.FDB</option>
                                </select>
                            </label>
                        </div>
                        
                        <div class="search-button-container">
                            <!-- BOTÓN ORIGINAL SIN MODIFICAR -->
                            <!-- <button class="btn btn-sm btn-primary d-flex"
                                @click="getKioscos_tbl"
                                :disabled="fileSelected=='0'?true:false">
                                <span class="material-icons">
                                    search
                                </span>
                                Buscar
                            </button> -->
                             <ButtonCustom  
                                color="blue" 
                                @click="getKioscos_tbl"
                                    tooltip="Buscar archivos"
                                    :disabled="fileSelected=='0'?true:false">
                                    
                                    <span  class="material-icons">search</span>
                                        Buscar
                            </ButtonCustom>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Sección de Filtros y Búsqueda -->
            <div class="filters-section">
                <div class="search-container">
                    <div class="search-input-group">
                        <label class="modern-label">
                            <span class="label-text">
                                <span class="material-icons label-icon">search</span>
                                Buscar en registros
                            </span>
                            <div class="input-wrapper">
                                <span class="material-icons input-icon">search</span>
                                <input 
                                    v-model="searchInput"
                                    type="text"
                                    class="modern-search-input"
                                    placeholder="Filtrar por coincidencia..."
                                />
                                <button 
                                    v-if="searchInput" 
                                    @click="searchInput = ''"
                                    class="clear-search-btn"
                                    type="button"
                                >
                                    <span class="material-icons">close</span>
                                </button>
                                
                            </div>
                        </label>
                    </div>
                </div>

                <div class="filter-buttons">
                    <div class="filter-group">
                        <span class="filter-label">Filtrar por estado:</span>
                        <div class="btn-group-modern">
                            <input type="radio" value="all" v-model="picked" class="btn-check" name="btnradio" id="btnradio1" autocomplete="off" checked>
                            <label class="btn-filter btn-filter-all" for="btnradio1">
                                <span class="material-icons">view_list</span>
                                Todos
                            </label>

                            <input type="radio" value="complete" v-model="picked" class="btn-check" name="btnradio" id="btnradio2" autocomplete="off">
                            <label class="btn-filter btn-filter-success" for="btnradio2">
                                <span class="material-icons">check_circle</span>
                                Descargados
                            </label>

                            <input type="radio" value="missing" v-model="picked" class="btn-check" name="btnradio" id="btnradio3" autocomplete="off">
                            <label class="btn-filter btn-filter-danger" for="btnradio3">
                                <span class="material-icons">cancel</span>
                                Faltantes
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Tabla -->
            <div class="table-section">
                <div class="table-header">
                    <h3 class="table-title">
                        <span class="material-icons">storage</span>
                        Bases de Datos Encontradas
                    </h3>
                    <div class="table-info">
                        <span class="info-badge">{{ afterFilter.length }} registros</span>
                    </div>
                </div>

                <div class="table-container">
                    <EasyDataTable
                        :headers="headers"
                        :items="afterFilter"
                        :search-field="searchField"
                        :search-value="searchInput"
                        header-text-direction="center"
                        body-text-direction="center"
                        rows-per-page-message="Registros por pagina"
                        empty-message="Sin Registros"
                        rows-of-page-separator-message="de"
                        alternating
                        buttons-pagination
                        :rows-per-page="25"
                        v-model:items-selected="itemsSelected"
                        table-class-name="modern-table"
                        :table-height="350"
                        theme-color="#008aff"
                        class="custom-data-table"
                        
                    >
                        <template #item-status_custom="item">
                            <div class="status-container">
                                <IconTable v-if="item.status==false" icon="cancel" color="red"/>
                                <IconTable v-if="item.status==true" icon="check_circle" color="green"/>
                            </div>
                        </template>
                        <template #item-folder_custom="item">
                            <ButtonTable 
                                    color="green" 
                                    tooltip="Abrir carpeta"
                                    @click="OpenfileExplorer(item.located_at)"
                                >
                                <span  class="material-icons">source</span>
                            </ButtonTable>
                        </template>
                    </EasyDataTable>
                </div>
            </div>

            <!-- Cards de Información y Acción -->
            <div v-if="cardsSection" class="results-section">
                <div class="info-cards">
                   <!-- Reemplaza tus CardInfo actuales con: -->
                    <CardInfo 
                        title="Bases completas" 
                        :subtitle="`${basesInfo.completas}/${basesInfo.totalBases}`"
                        icon="check_circle"
                        color="green"
                        size="normal"
                        :animated="true"
                    />

                    <CardInfo 
                        title="Bases faltantes" 
                        :subtitle="basesInfo.faltantes"
                        icon="error"
                        color="red"
                        size="normal"
                        :animated="true"
                    />

                    <!-- Nueva card para seleccionadas -->
                    <CardInfo 
                        title="Seleccionadas" 
                        :subtitle="itemsSelected.length"
                        icon="checklist"
                        color="blue"
                        size="normal"
                        :animated="true"
                    />
                </div>

                <div class="action-container">
                    <div class="action-info">
                        <span class="material-icons">info</span>
                        <div class="info-text">
                            <span class="info-title">¿Listo para continuar?</span>
                            <span class="info-description">
                                {{ itemsSelected.length > 0 
                                   ? `${itemsSelected.length} elemento(s) seleccionado(s)` 
                                   : 'Selecciona al menos un elemento para continuar' }}
                            </span>
                        </div>
                    </div>
                    
                <!-- Botón básico (mantiene compatibilidad total) -->
                <ButtonCustom color="green" @click="nextStep" :disabled="itemsSelected.length==0"
                tooltip="Siguiente paso">
                    <span  class="material-icons">arrow_forward</span>
                        Avanzar
                </ButtonCustom>
                
                </div>
            </div>
        </template>
    </ContainerCustom>
</template>

<style scoped>

:deep(.modern-table) {
    --easy-table-border: 1px solid #e2e8f0;
    --easy-table-row-border: 1px solid #f7fafc;
    --easy-table-header-font-size: 14px;
    --easy-table-header-height: 50px;
    --easy-table-header-font-color: #4a5568;
    --easy-table-header-background-color: #f8fafc;
    --easy-table-body-even-row-font-color: #4a5568;
    --easy-table-body-even-row-background-color: #ffffff;
    --easy-table-body-odd-row-font-color: #4a5568;
    --easy-table-body-odd-row-background-color: #f8fafc;
    --easy-table-body-row-height: 46px;
    --easy-table-body-row-font-size: 14px;
    --easy-table-body-row-hover-font-color: #667eea;
    --easy-table-body-row-hover-background-color: rgba(102, 126, 234, 0.05);
    --easy-table-footer-background-color: #f8fafc;
    --easy-table-footer-font-color: #4a5568;
    --easy-table-footer-font-size: 12px;
    --easy-table-footer-padding: 0px 16px;
    --easy-table-footer-height: 50px;
    --easy-table-scrollbar-track-color: #f1f1f1;
    --easy-table-scrollbar-color: #c1c1c1;
    --easy-table-scrollbar-thumb-color: #667eea;
    --easy-table-scrollbar-corner-color: #f1f1f1;
    --easy-table-loading-mask-background-color: rgba(255, 255, 255, 0.9);
}
</style>