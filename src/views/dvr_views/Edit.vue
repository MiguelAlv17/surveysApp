<script setup>
import { useGetDataUsuarios } from '../../composables/getDataUsuarios.js'
import {useGetDataDvr} from '../../composables/getDataDvr.js'
import { onMounted, ref, reactive } from 'vue';
import { useRouter,useRoute } from 'vue-router'
import { alertWarning, alertSuccess, alertError } from '../../constantes/alerts.js';
import ContainerCustom from '../../components/ContainerCustom.vue';
import ModernButton from '../../components/ModernButtons/ModernButton.vue';
import Loading from '../../components/Loading.vue';
import moment from 'moment';
import ModernInput from '../../components/ModernInputs/ModernInput.vue';
import ModernSelect from '../../components/ModernInputs/ModernSelect.vue';
import LoaderBtn from '../../components/LoaderBtn.vue';
import ModalCustom from '../../components/ModalCustom.vue';
import EasyDataTable from 'vue3-easy-data-table';
import { useGetDataKioscos } from '../../composables/getDataKioscos.js';
import '../../assets/styles/expandtable.css'
import '../../assets/styles/dvr/add.css'

const {getKioscosList} =useGetDataKioscos();
const {updateDvr,getDvrByid} = useGetDataDvr();
const router = useRouter();
const route = useRoute();
// tabla
const headers = ref([
    { text: "Clave", value: "id_kiosco_recaudacion", sortable: true },
    { text: "Nombre Kiosco", value: "name_recaudacion", sortable: true },
    { text: "Nombre Logmein", value: "alias", sortable: true },
    

]);
const items = ref([
{ idLectura: "Stephen Curry", nombre: "GSW", dvrname: 30, state: 'G',},
]);
const searchField = ["id_kiosco_recaudacion", "name_recaudacion", "alias", ]; //campos por los que buscara el filtro
const searchInput = ref(""); // variable para el filtro
// Form data
const formData = reactive({
    dvr_id:"",
    dvr_ip:"",
	dvr_alias:"",
	dvr_camara:"",
	dvr_puerto:"",
	dvr_usuario:"",
	dvr_contrasena:"",
	dvr_id_kiosco:""
});

// Form state
const isSaving = ref(false);
const modalShow = ref(false);
const isLoadingKioscos = ref(false);
const isLoading = ref(false);

// Validation
const errors = reactive({
    dvr_id:"",
    dvr_ip:"",
	dvr_alias:"",
	dvr_camara:"",
	dvr_puerto:"",
	dvr_usuario:"",
	dvr_contrasena:"",
	dvr_id_kiosco:""
});

// Roles disponibles
const roles = [
    { value: 'admin', label: 'Administrador' },
    { value: 'observador', label: 'Observador' }
];

onMounted(() => {
   getRecord()
});
const getRecord = async() => {
    const idK = route.params.idDvr
    isLoading.value=true;
    const response = await getDvrByid(idK)
    isLoading.value=false;
    const{status,data}=response
    if (status!=200) {
        alertError("Oops", "Ocurrio un error al cargar el registro",3);
        return
    }
    const  {dvr_id,
        dvr_alias,
        dvr_camara,
        dvr_puerto,
        dvr_usuario,
        dvr_contrasena,
        dvr_id_kiosco,
    dvr_ip,name_device} = data[0];
    Object.assign(formData, {
        dvr_id,
        dvr_ip,
        dvr_alias,
        dvr_camara,
        dvr_puerto,
        dvr_usuario,
        dvr_contrasena,
        dvr_id_kiosco:`${dvr_id_kiosco}|${name_device}`,
    });

}
// Validation functions
const validateField = (field, value) => {
    const stringValue = value != null ? String(value) : '';
    switch (field) {
        case 'dvr_ip':
            if (!stringValue.trim()) {
                errors.dvr_ip = 'La IP es requerida';
                return false;
            } else if (stringValue.length < 8) {
                errors.dvr_ip = 'La IP debe tener al menos 8 caracteres';
                return false;
            } else {
                errors.dvr_ip = '';
                return true;
            }
        case 'dvr_puerto':
            if (!stringValue.trim()) {
                errors.dvr_puerto = 'El puerto es requerido';
                return false;
            } else if (stringValue.length < 2) {
                errors.dvr_puerto = 'La puerto debe tener al menos 4 caracteres';
                return false;
            } else {
                errors.dvr_puerto = '';
                return true;
            }
        case 'dvr_camara':
            if (!stringValue.trim()) {
                errors.dvr_camara = 'La camara es requerido';
                return false;
            } else if (stringValue.length < 1) {
                errors.dvr_camara = 'La camara debe tener al menos 1 caracter';
                return false;
            } else {
                errors.dvr_camara = '';
                return true;
            }
        case 'dvr_alias':
            if (!stringValue.trim()) {
                errors.dvr_alias = 'El alias es requerido';
                return false;
            } else if (stringValue.length < 2) {
                errors.dvr_alias = 'El alias debe tener al menos 2 caracteres';
                return false;
            } else {
                errors.dvr_alias = '';
                return true;
            }
        case 'dvr_usuario':
            if (!stringValue.trim()) {
                errors.dvr_usuario = 'El usuario es requerido';
                return false;
            } else if (stringValue.length < 2) {
                errors.dvr_usuario = 'El usuario debe tener al menos 2 caracteres';
                return false;
            } else {
                errors.dvr_usuario = '';
                return true;
            }
        
        case 'dvr_contrasena':
            if (!stringValue) {
                errors.dvr_contrasena = 'La contraseña es requerida';
                return false;
            } else if (stringValue.length < 6) {
                errors.dvr_contrasena = 'La contraseña debe tener al menos 6 caracteres';
                return false;
            } else {
                errors.dvr_contrasena = '';
                return true;
            }
        
        case 'dvr_id_kiosco':
            if (!stringValue.trim()) {
                errors.dvr_id_kiosco = 'El kiosco es requerido';
                return false;
            } else {
                errors.dvr_id_kiosco = '';
                return true;
            }
        
        default:
            return true;
    }
};

const validateForm = () => {
    const validations = [
        validateField('dvr_ip', formData.dvr_ip),
        validateField('dvr_alias', formData.dvr_alias),
        validateField('dvr_camara', formData.dvr_camara),
        validateField('dvr_puerto', formData.dvr_puerto),
        validateField('dvr_usuario', formData.dvr_usuario),
        validateField('dvr_contrasena', formData.dvr_contrasena),
        validateField('dvr_id_kiosco', formData.dvr_id_kiosco),

    ];
    return validations.every(Boolean);
};

const handleSubmit = async () => {
    if (!validateForm()) {
        alertWarning('Por favor, corrija los errores en el formulario');
        return;
    }
    
    isSaving.value = true;
    formData.dvr_id_kiosco = formData.dvr_id_kiosco.split("|")[0]
    try {
        const response = await updateDvr(formData);
        const {data,status}=response
        if (status === 200 || status === 201) {
            await alertSuccess(
               'Registro exitoso',
               "Redirigiendo a pantalla <strong>DVR'S</strong>",
               3
            );
            // Redirigir o hacer algo
            cleanForm();
            redirectToIndex();
        } else {
            alertError('Error durante el registro');
        }
    } catch (error) {
        console.error('Error:', error);
        alertError('Error durante el registro');
    } finally {
        isSaving.value = false;
    }
};
const cleanForm = () => {
  Object.keys(formData).forEach(key => {
      formData[key] = '';
   });
}
const redirectToIndex = () => {
   cleanForm()
    router.push("/dvr"); // Volver atrás
};

// Real-time validation
const handleInput = (field, value) => {
    formData[field] = value;
    if (errors[field]) {
        validateField(field, value);
    }
};

const openModal = async() => {
    isLoadingKioscos.value=true
    const response = await getKioscosList();
    const {status, data} = response
    isLoadingKioscos.value=false
    if (status!=200) {
        alertError("Oops!", "Ocurrio un error al cargar la lista de kioscos", 2);
        return
    }
    modalShow.value=true;
    items.value= data;
}
const assignKiosco = (item) => {
    formData.dvr_id_kiosco= `${item.id_kiosco_recaudacion}|${item.name_recaudacion}`;
    modalShow.value=false;
}
</script>

<template>
    <div  >
        <ContainerCustom 
        :loading="isLoading"
        title="Editar DVR" subtitle="Formulario para editar la informacion del DVR" icon="video_camera_front">
            <template v-slot:body>
               <div class="form-container">
                  <div class="form-row">
                     <ModernInput
                        v-model="formData.dvr_ip"
                        type="text"
                        label="IP"
                        icon="123"
                        @blur="validateField('dvr_ip', formData.dvr_ip)"
                        @input="handleInput('dvr_ip', $event.target.value)"
                        placeholder="Ingrese su ip"
                        :required="true"
                        :error="errors.dvr_ip"
                        :disabled="isSaving"
                     />
                     <ModernInput
                        v-model="formData.dvr_puerto"
                        type="text"
                        label="Puerto"
                        icon="numbers"
                        @blur="validateField('dvr_puerto', formData.dvr_puerto)"
                        @input="handleInput('dvr_puerto', $event.target.value)"

                        placeholder="Ingrese su puerto"
                        :required="true"
                        :error="errors.dvr_puerto"
                        :disabled="isSaving"

                     />
                      <ModernInput
                        v-model="formData.dvr_camara"
                        type="text"
                        label="Camara"
                        icon="camera_alt"
                        @blur="validateField('dvr_camara', formData.dvr_camara)"
                        @input="handleInput('dvr_camara', $event.target.value)"

                        placeholder="Ejem : 1"
                        :required="true"
                        :error="errors.dvr_camara"
                        :disabled="isSaving"

                     />
                      <ModernInput
                     v-model="formData.dvr_alias"
                     type="text"
                     label="Alias"
                     @input="handleInput('dvr_alias', $event.target.value)"
                     @blur="validateField('dvr_alias', formData.dvr_alias)"
                     icon="badge"
                     placeholder="altacia dvr"
                     :required="true"
                     :error="errors.dvr_alias"
                        :disabled="isSaving"

                  />
                  </div>
                  <div class="form-row">
                     
                  </div>
                 
                  <ModernInput
                     v-model="formData.dvr_usuario"
                     type="text"
                     label="Usuario"
                     @input="handleInput('dvr_usuario', $event.target.value)"
                     @blur="validateField('dvr_usuario', formData.dvr_usuario)"
                     icon="account_circle"
                     placeholder="altacia dvr"
                     :required="true"
                     :error="errors.dvr_usuario"
                        :disabled="isSaving"

                  />
                  <!-- Input de Contraseña -->
                  <ModernInput
                     v-model="formData.dvr_contrasena"
                     type="password"
                     label="Contraseña"
                     icon="lock"
                     placeholder="Mínimo 6 caracteres"
                     :required="true"
                     @input="handleInput('dvr_contrasena', $event.target.value)"
                     @blur="validateField('dvr_contrasena', formData.dvr_contrasena)"
                     :error="errors.dvr_contrasena"
                        :disabled="isSaving"


                  />
                    <div class="" style="display: flex; align-items: end;">
                        <ModernInput
                        v-model="formData.dvr_id_kiosco"
                        type="text"
                        label="Kiosco asignado"
                        @input="handleInput('dvr_id_kiosco', $event.target.value)"
                        @blur="validateField('dvr_id_kiosco', formData.dvr_id_kiosco)"
                        icon="desktop_windows"
                        placeholder="Recaudadora ejemplo"
                        :required="true"
                        :error="errors.dvr_id_kiosco"
                        :disabled="true"

                        />
                        <ModernButton 
                            color="blue" 
                            :function="openModal"
                            tooltip="Asignar kiosco"
                            :disabled="isSaving"
                            class="mt-2"
                            >
                            <LoaderBtn v-if="isLoadingKioscos"/>
                            <span v-else class="material-icons">desktop_windows</span>
                            Asignar kiosco
                        </ModernButton>
                    </div>
                    
                    
                   

                  
                  <!-- Información adicional -->
                  <div class="form-info mt-3">
                        <div class="info-item">
                           <span class="material-icons">info</span>
                           <span>Los campos marcados con * son obligatorios</span>
                        </div>
                        <div class="info-item">
                           <span class="material-icons">security</span>
                           <span>La contraseña debe tener al menos 6 caracteres</span>
                        </div>
                  </div>
               </div>
                
            </template>

            <template v-slot:footer>
                <div class="footer-content">
                    <div class="footer-info">
                        <span class="material-icons">info</span>
                        <span>Complete todos los campos requeridos</span>
                    </div>
                    <div class="footer-actions">
                        <!-- <span class="last-update">Última actualización: {{ updated_at }}</span> -->
                        <div class="action-buttons">
                            <ModernButton 
                                color="lile" 
                                :function="redirectToIndex"
                                tooltip="Cancelar y volver"
                                :disabled="isSaving"
                            >
                                <span class="material-icons">arrow_back</span>
                                Cancelar
                            </ModernButton>
                            <ModernButton 
                                color="green" 
                                :function="handleSubmit"
                                :disabled="isSaving"
                                tooltip="Guardar nuevo usuario"
                            >
                                 <LoaderBtn v-if="isSaving" />
                                <span v-else class="material-icons">save</span>

                                Guardar Usuario
                            </ModernButton>
                        </div>
                    </div>
                </div>
            </template>
        </ContainerCustom>
    </div>
    <ModalCustom 
         v-model:show="modalShow"
        title="Asignar DVR  a Kiosco"
        icon="desktop_windows"
        :width="40"
        maxWidth="800px"
        :closable="false"
        >
        <template #body>
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
                    </div>
                </div>
            </div>            
           
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
                        class="custom-data-table"
                        :table-height="400"
                        fixed-header
                    >
                    <template #item-actions="item" >
                         
                    </template>
                    <template #expand="item">
                        <div class="expand-container">
        <!-- Header del expand -->
        <div class="expand-header">
            <div class="kiosco-icon">
                <span class="material-icons">desktop_windows</span>
            </div>
            <div class="kiosco-details">
                <h4 class="kiosco-name">{{ item.name_recaudacion }}</h4>
                <p class="kiosco-meta">
                    <span class="meta-item">
                        <span class="material-icons">tag</span>
                        ID: {{ item.id_kiosco_recaudacion }}
                    </span>
                    <span class="meta-item">
                        <span class="material-icons">computer</span>
                        Alias: {{ item.alias }}
                    </span>
                </p>
            </div>
        </div>

        <!-- Información adicional (opcional) -->
        <div class="expand-info">
            <div class="info-card">
                <span class="material-icons">info</span>
                <div class="info-content">
                    <span class="info-title">Asignación de DVR</span>
                    <span class="info-description">
                        Este DVR será configurado para monitorear el kiosco <strong>{{ item.name_recaudacion }}</strong>
                    </span>
                </div>
            </div>
        </div>

        <!-- Botones de acción -->
        <div class="expand-actions">
            <div class="action-info">
                <span class="material-icons">link</span>
                <span>¿Confirmar asignación?</span>
            </div>
            <div class="action-buttons">
                <ModernButton 
                    color="lile" 
                    @click="cancelAssignment"
                    tooltip="Cancelar asignación"
                    :disabled="isOpenning"
                >
                    <span class="material-icons">close</span>
                    Cancelar
                </ModernButton>
                <ModernButton 
                    color="green" 
                    @click="assignKiosco(item)" 
                    :disabled="isLoadingKioscos"
                    tooltip="Confirmar asignación de kiosco"
                >
                    <LoaderBtn v-if="isLoadingKioscos"/>
                    <span v-else class="material-icons">check_circle_outline</span>
                    Asignar Kiosco
                </ModernButton>
            </div>
        </div>
    </div>
                    </template>
                </EasyDataTable>

            </div>
            <div class="form-info mt-3">
                <div class="info-item">
                    <span class="material-icons">info</span>
                    <h6>Utiliza la tabla para <strong>Seleccionar</strong> El kiosco al que pertenece el nuevo DVR</h6>
                </div>
                <div class="info-item">
                    <span class="material-icons">info</span>
                    <small class="text-secondary">Solo puede seleccionarse un solo kiosco por DVR</small>
                </div>

            </div>
        </template>
        
        <template #footer>
            <ModernButton color="lile" @click="modalShow = false">
            Cancelar
            </ModernButton>
            
        </template>
    </ModalCustom>
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