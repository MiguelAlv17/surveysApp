<script setup>
import Loading from '../components/Loading.vue'
import { ref, onMounted, computed } from 'vue';
import EasyDataTable from 'vue3-easy-data-table';
import ContainerCustom from '../components/ContainerCustom.vue';
import '../assets/styles/table.css';
import '../assets/styles/home.css'
import {useGetDataKioscos} from '../composables/getDataKioscos'
import { alertError } from '../constantes/alerts';
import {tableHeigh} from '../constantes/api_constants'

// compsoables
const {getKioscosList} = useGetDataKioscos();
// tabla
const headers = ref([
    { text: "Clave", value: "id_kiosco_recaudacion", sortable: true },
    { text: "Nombre Kiosco", value: "name_recaudacion", sortable: true },
    { text: "Nombre Logmein", value: "alias", sortable: true },
    { text: "Tipo", value: "tipoKiosco", sortable: true },
    { text: "DVR", value: "dvrname", sortable: true },
    { text: "status", value: "state", sortable: true },
]);
const items = ref([
{ idLectura: "Stephen Curry", nombre: "GSW", dvrname: 30, state: 'G',},
]);
const searchField = ["userid", "nombre", "idLectura", "dvrname"]; //campos por los que buscara el filtro
const searchInput = ref(""); // variable para el filtro
const filterSearch = ref('');
// loaders
const isloading = ref(false);
// extras

// functions
onMounted( () => {
    getList()
});
const getList = async() => {
    isloading.value = true;
    const response = await getKioscosList();
    console.log(response);
    isloading.value = false;
    const {data,status}= response;
    if (status!=200) {
        alertError("Ocurrio un error al cargar los registros")
        return
    }
    items.value = data;
    


}
</script>

<template>+
    <Loading v-if="isloading"></Loading>
    <div v-else>
        <ContainerCustom title="Inicio" subtitle="Listado de Kioscos" icon="home">
            <template v-slot:header-actions ></template>
            <template v-slot:body>
                <!-- Search and Actions Section -->
                <div class="search-and-actions">
                    <div class="search-section">
                        <div class="search-container">
                            <div class="search-input-wrapper">
                                <label class="search-label">Buscar:</label>
                                <div class="input-group">
                                    <div class="input-icon">
                                        <span class="material-icons">search</span>
                                    </div>
                                    <input 
                                        v-model="searchInput"
                                        type="text"
                                        class="search-input"
                                        placeholder="Filtrar por coincidencia..."
                                    />
                                    <button 
                                        v-if="searchInput" 
                                        @click="searchInput = ''"
                                        class="clear-search"
                                        type="button"
                                    >
                                        <span class="material-icons">close</span>
                                    </button>
                                </div>
                            </div>
                            <div class="search-actions">
                                <ModernButton 
                                    color="primary" 
                                    :function="handleAddNew"
                                    tooltip="Agregar nuevo registro"
                                >
                                    <span class="material-icons">add</span>
                                    Agregar
                                </ModernButton>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Table Section -->
                <div class="table-section">
                    <EasyDataTable 
                        :headers="headers" 
                        :items="items"
                        :search-field="searchField"
                        :search-value="searchInput"
                        header-text-direction="center"
                        body-text-direction="center"
                        rows-per-page-message="Registros por página"
                        empty-message="Sin registros disponibles"
                        rows-of-page-separator-message="de"
                        alternating
                        :table-height="tableHeigh"

                        buttons-pagination
                        table-class-name="modern-table"
                        theme-color="#667eea"
                        class="custom-data-table"
                    />
                </div>

            </template>
            <template v-slot:footer>
                <div class="footer-content">
                    <div class="footer-info">
                        <span class="material-icons">info</span>
                        <span>{{ items.length }} registros en total</span>
                    </div>
                    <div class="footer-actions">
                        <span class="last-update">Última actualización: {{ new Date().toLocaleString() }}</span>
                    </div>
                </div>
            </template>
        </ContainerCustom>
    </div>
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