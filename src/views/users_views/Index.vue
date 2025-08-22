<script setup>
import { onMounted, ref, computed } from 'vue';
import { useGetDataUsuarios } from '../../composables/getDataUsuarios';
import Loading from '../../components/Loading.vue'
import { useRouter } from 'vue-router'
import EasyDataTable from 'vue3-easy-data-table';
import ContainerCustom from '../../components/ContainerCustom.vue';
import ModernButton from '../../components/ModernButtons/ModernButton.vue';
import BtnTable from '../../components/TableButtons/BtnTable.vue';
import ModalCustom from '../../components/ModalCustom.vue';
import LoaderBtn from '../../components/LoaderBtn.vue';
import { alertError, alertSuccess, alertWarning } from '../../constantes/alerts';
import moment from 'moment';
import { utils, writeFileXLSX } from 'xlsx';

// composables
const { getListUsers, updateUser } = useGetDataUsuarios();

const router = useRouter();
// table
const headers = ref([
    { text: "ID", value: "id", sortable: true },
    { text: "Nombre", value: "nombre", sortable: true },
    { text: "Email", value: "email", sortable: true },
    { text: "Perfil", value: "tipoUsuario", },
    { text: "Estatus", value: "status", },
    { text: "Acciones", value: "actions", width:150},
]);
const items = ref([
    // {userid:1,nombre:"miguel",correo:"mi@gmail.com",level:"admin"}
]);
const searchField = ["userid", "username", "correo", "level"]; //campos por los que buscara el filtro
const searchInput = ref(""); // variable para el filtro
// loader
const isloading = ref(false);
const isExporting = ref(false);
// extras
const modalShow = ref(false);
const userSelected = ref(0);
const isDeleting = ref(false);
const updated_at = ref("--/--/--");
const modalMessage = ref("");
const dateFormat='DD/MM/YYYY hh:mm:ss'

onMounted( () => {
    getList()
});

const getList = async() => {
    isloading.value = true;
    const response = await getListUsers();
    isloading.value = false;
    const{status, data} = response
    if (status!=200) {
        alertError("ocurrio un error al cargar los datos")
        return
    }
    const arrayFormated = data.data.map(item=>{
        item.tipo_usuario_name = usertype(item.tipo_usuario);
        item.estado = item.estado==1?"Habilitado":"Deshabilitado"
        return item
    })
    items.value = arrayFormated;

    updated_at.value = moment().format(dateFormat)
}
const usertype = (tipo) => {
    
    if (tipo == 1) return "Administrador";
    if (tipo == 2) return "Monitoreo";
    return "--"
}


const redirectToEdit = async (id) => {
    let ruta =`/users/edit/${id}`
    router.push(ruta)
}
const redirectToAdd = async () => {
    router.push("/users/add")
}
const seeuser = async (id) => {
    let ruta = `/usuarios/ver/${id}`
    router.push(ruta)
}

const openModal = (id) => {
    
    modalShow.value=true;
    userSelected.value=id;
    const user = items.value.filter(i=> i.usuarioId==userSelected.value);
    
    if (user == undefined) {
        alertError("oops","Ocurrio un error al mostrar el modal", 2.5)
        return;
    }
    modalMessage.value=`Esta seguro de DESHABILITAR al usuario: "${user[0].fullname}"?`
}
const delet_User = async() => {
   const user = items.value.filter(i=> i.usuarioId==userSelected.value);
   if (user == undefined) {
        alertError("oops","Ocurrio un error al eliminar el usuario", 2.5)
        return;
   }
    isDeleting.value=true
    user[0].estado =0;
    const response = await updateUser(user[0])
    const {status, data} = response
    isDeleting.value=false;
    modalShow.value=false;
    if (status!=200) {
        alertError("Oops!","Ocurrio un error al eliminar el usuario");
        return
    }
    await alertSuccess("Exito!","Usuario deshabilitado correctamente");
    getList();
    
}
const exportToExcel = async() => {
    try {
        isExporting.value = true;
        
        let dataToExport = items.value;
        // Filtrar los datos según el filtro actual (si existe)
        if (searchInput.value && searchInput.value.trim() !== '') {
            const searchTerm = searchInput.value.toLowerCase();
            dataToExport = items.value.filter(item => {
                return searchField.some(field => {
                    const fieldValue = item[field];
                    return fieldValue && fieldValue.toString().toLowerCase().includes(searchTerm);
                });
            });
        }
        
        // Preparar los datos para Excel (excluir columna de acciones)
        const excelData = dataToExport.map(item => ({
            'ID':item.id,
            'Nombre':item.nombre,
            'Correo':item.email,
            'Rol de usuario':item.tipoUsuario,
            'Estado':item.activo == true ? 'Habilitado':'Deshabilitado',
        }));
        
        // Crear workbook y worksheet
        const wb = utils.book_new();
        const ws = utils.json_to_sheet(excelData);
        
        // Configurar ancho de columnas
        const colWidths = [
            { wch: 10 }, // id
            { wch: 30 }, // nombre
            { wch: 30 }, // email
            { wch: 15 },  // tipoUsuario
            { wch: 15 }  // tipoUsuario

        ];
        ws['!cols'] = colWidths;
        
        // Agregar hoja al workbook
        utils.book_append_sheet(wb, ws, "Users List");
        
        // Generar nombre del archivo con fecha actual
        const fileName = `UsersList_${moment().format('YYYY-MM-DD_HH-mm')}.xlsx`;
        
        // Descargar el archivo
        writeFileXLSX(wb, fileName);
        
        await alertWarning("Generando archivo excel","generando",4);
        
    } catch (error) {
        console.error('Error al exportar:', error);
        alertError("Error al exportar el archivo Excel");
    } finally {
        isExporting.value = false;

    }
}
</script>
<template>
    <div >
        <ContainerCustom 
        :loading="isloading"
        title="USUARIOS" subtitle="Listado de usuarios y acciones" icon="groups">
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
                                    color="green" 
                                    :function="exportToExcel"
                                    :disabled="isExporting || items.length === 0"
                                    tooltip="Exportar a Excel"
                                >
                                    <LoaderBtn v-if="isExporting"/>
                                    <span v-else class="material-icons">file_download</span>
                                    {{ isExporting ? 'Exportando...' : 'Exportar Excel' }}
                                </ModernButton>
                                 <ModernButton 
                                    color="blue" 
                                    :function="redirectToAdd"
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
                        buttons-pagination
                        table-class-name="modern-table"
                        theme-color="#667eea"
                        :table-height="500"
                        class="custom-data-table"
                    >
                    <template #item-actions="item" >
                         <BtnTable 
                            color="gray" 
                            @function="redirectToEdit(item.usuarioId)"
                            tooltip="Editar usuario"
                        >
                            <span class="material-icons">edit</span>
                        </BtnTable>
                        <BtnTable 
                            color="red" 
                            @function="openModal(item.usuarioId)"
                            tooltip="Eliminar usuario"
                        >
                            <span class="material-icons">delete</span>
                        </BtnTable>
                    </template>
                    <template #item-status="item" >
                        <span v-if="item.activo" class="material-icons text-success-custom">
                        toggle_on
                        </span>
                        <span v-if="!item.activo" class="material-icons text-danger-custom">
                        toggle_off
                        </span>
                    </template>
                </EasyDataTable>

                </div>

            </template>
            <template v-slot:footer>
                <div class="footer-content">
                    <div class="footer-info">
                        <span class="material-icons">info</span>
                        <span>{{ items.length }} registros en total</span>
                    </div>
                    <div class="footer-actions">
                        <span class="last-update">Última actualización: {{ updated_at }}</span>
                         <ModernButton 
                            color="lile" 
                            :function="getList"
                            tooltip="Recargar la tabla"
                        >
                            <span class="material-icons">update</span>
                        </ModernButton>
                    </div>
                </div>
            </template>
        </ContainerCustom>
    </div>
    <ModalCustom 
         v-model:show="modalShow"
        title="Deshabilitar usuario"
        icon="group_remove"
        :width="40"
        maxWidth="800px"
        :closable="false"
        >
        <template #body>
            <h6>{{ modalMessage }}</h6>
            <small class="text-secondary">La accion no podra deshacerse</small>
        </template>
        
        <template #footer>
            <ModernButton color="lile" @click="modalShow = false">
            Cancelar
            </ModernButton>
            <ModernButton color="red" @click="delet_User" :disabled="isDeleting">
            <LoaderBtn v-if="isDeleting" />
            <span v-else class="material-icons">do_not_disturb_alt</span>
                Deshabilitar
            </ModernButton>
        </template>
    </ModalCustom>
</template>
<style scoped>
.text-success-custom{
    color: var(--success-light);
}
.text-danger-custom{
    color: var(--danger-light);

}
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
@media (prefers-color-scheme: dark) {
    .custom-data-table :deep(.vue3-easy-data-table__header th) {
        border-bottom: 2px solid #43aaff;
    }
    :deep(.modern-table) {
    --easy-table-border: 1px solid #222e3d;
    --easy-table-row-border: 1px solid #2c4453;

    --easy-table-header-font-color: #babfc9;
    --easy-table-header-background-color: #1c2935;
    
    --easy-table-body-even-row-font-color: #c0c5ce;
    --easy-table-body-even-row-background-color: #263646;
    
    --easy-table-body-row-font-color: #9da1a7;
    --easy-table-body-row-background-color: rgb(32, 47, 75);

    --easy-table-body-row-hover-font-color: #9899a0;
    --easy-table-body-row-hover-background-color: rgba(179, 179, 179, 0.096);
    
    --easy-table-footer-background-color: #243649;
    --easy-table-footer-font-color: #acacad;
    
    --easy-table-scrollbar-track-color: #f1f1f1;
    --easy-table-scrollbar-color: #c1c1c1;
    --easy-table-scrollbar-thumb-color: #43aaff;
    --easy-table-scrollbar-corner-color: #f1f1f1;
    
    --easy-table-loading-mask-background-color: rgba(37, 43, 65, 0.9);
    }
}
</style>