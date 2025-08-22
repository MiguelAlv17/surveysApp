<script setup>
import { reactive, ref, onMounted, onUnmounted } from 'vue';
import ContainerCustom from '../Components/ContainerCustom.vue';
import ButtonCustom from '../Components/ButtonCustom.vue';
import TitleContainer from '../Components/TitleContainer.vue';
import Loader from '../Components/Loader.vue';
import { alert_error, alert_success } from '../../constants/alerts';
import { useRouter ,useRoute} from 'vue-router'
// router
    const router = useRouter();
    const route = useRoute();

// loaders
    const isLoading = ref(false);
    const loaderText = ref("Cargando");
// extras

    const formData = ref({
        name_device: 'device',
        logmein: '',
        located_at: '',
        id_kiosco_recaudacion: '',
        clave_recaudacion: '',
        tipo: ''
    })
// functions
    onMounted( () => {
        console.log("Editkisoco");
        
        getKiosco();
    });
    const getKiosco = async() => {
        console.log("Getkiosco");
        
        const idkiosco = route.params.idKiosco
        isLoading.value =true;
        loaderText.value="Cargando registro"
        const response = await window.api.getKioscoById(idkiosco)
        const {status, data} = response
        isLoading.value=false;
        if (status!= 200 || !Array.isArray(data)) {
            alert_error("Ocurrio un error al cargar el registro")
            return
        }
        const {id,alias, clave_recaudacion,tipoKiosco, id_kiosco_recaudacion,located_at,name_recaudacion} = data[0]
        formData.value ={
            id:id,
            name_device: name_recaudacion,
            logmein: alias,
            located_at: located_at,
            id_kiosco_recaudacion: id_kiosco_recaudacion,
            clave_recaudacion: clave_recaudacion,
            tipo: tipoKiosco == "MULTISERVICIOS 1"?1:2
        }
        

    }
    const handleSubmit = async()=> {
        isLoading.value = true;
        isLoading.value="Guardando registro"
        const infoK = JSON.parse(JSON.stringify(formData.value))
        console.log(infoK);
        const response = await window.api.updateKiosco(infoK)
        console.log(response);
        const {status, data}  = response;
        isLoading.value = false;
        if (status!=200) {
            alert_error("Ocurrio un error al insertar el registro");
            return
        }
        alert_success("Registro guardado correctamente");
        clearForm();
    }
    const clearForm = () => {
    formData.value = {
        name_device: '',
        logmein: '',
        located_at: '',
        id_kiosco_recaudacion: '',
        clave_recaudacion: '',
        tipo: ''
        }
    }
    const goback = () => {
    router.push('/kioscos')
    }
</script>
<template>
    <Loader v-if="isLoading" :text="loaderText"/>
    <ContainerCustom v-else>
      <template v-slot:header>
        <div class="bg-white shadow-sm rounded-3 py-1">
          <TitleContainer text="Editar Kioscos"/>
        </div>
      </template>
        <template v-slot:body>
      
      <form  class="row g-4">

          <div class="col-md-12">
            <label class="form-label fw-medium">Nombre del dispositivo</label>
            <input type="text" v-model="formData.name_device" class="form-control form-control rounded-3" placeholder="Ej. RECAUDADORA, DOLORES HIDO" />
          </div>

          <div class="col-md-6">
            <label class="form-label fw-medium">Nombre LogMeIn</label>
            <input type="text" v-model="formData.logmein" class="form-control form-control rounded-3" placeholder="Ej. ABASOLO-M" />
          </div>

          <div class="col-md-6">
            <label class="form-label fw-medium">Nombre de la Carpeta (zz/kioscos/db)</label>
            <input type="text" v-model="formData.located_at" class="form-control form-control rounded-3" placeholder="Ej. Abasolo" />
          </div>
          
          <div class="col-md-4">
            <label class="form-label fw-medium">Tipo</label>
            <select class="form-select" v-model="formData.tipo" >
              <option value="0" selected disabled>--selecciona--</option>
              <option value="1">MULTISERVICIOS 1</option>
              <option value="2">COBRADOR 1</option>
            </select>
          </div>

          <div class="col-md-4">
            <label class="form-label fw-medium">ID Kiosco Recaudación</label>
            <input type="number" v-model="formData.id_kiosco_recaudacion" class="form-control form-control rounded-3" placeholder="Ej. 1331" />
          </div>

          <div class="col-md-4">
            <label class="form-label fw-medium">Clave Recaudación</label>
            <input type="number" v-model="formData.clave_recaudacion" class="form-control form-control rounded-3" placeholder="Ej. 331" />
          </div>
          
        </form>
    </template>
    <template v-slot:footer>
      <div class="col-12 mt-4 pb-3 " style="display: flex; justify-content: space-between;">
        <ButtonCustom  text="Regresar" :icon="true" iconName="arrow_back_ios" @function="goback" color="gray"/>
        <ButtonCustom  text="Guardar" :icon="true" iconName="check" @function="handleSubmit"/>
      </div>
    </template>
    </ContainerCustom>
</template>
<style scoped>
input::placeholder{
  color: rgb(167, 166, 166);
}
.line{
  border: .5px;
  border-color: rgb(179, 179, 179);
  border-style: solid;
}
</style>