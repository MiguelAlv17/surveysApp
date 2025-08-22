import axios from 'axios';
import { ref } from 'vue';
import { API } from '../constantes/api_constants';
import moment from 'moment';
import 'moment/locale/es-mx'; // Importa directamente el idioma español (es-mx)

export const useGetData = () => {
    moment.locale('es-mx');
    const dataAxios = ref([]);
    const isloading = ref(false);
    const TOKEN = localStorage.getItem('token');

    const getListOfKioscos = async () => {
        isloading.value = true;
        const config = {
            method: 'post',
            url: `${API}speedTest/getDevices`,
            headers: { Authorization: `Bearer ${TOKEN}` },
        };

        try {
            const { data } = await axios(config);
            isloading.value = false;

            const newArray = data.map(item => {
                item.descarga = item.descarga == null ? '0.00' : item.descarga;
                item.subida = item.subida == null ? '0.00' : item.subida;
                item.fecha = item.fecha == null ? '--/--/---- 00:00' : moment(item.fecha).format('DD/MM/YYYY HH:MM');
                return item;
            });

            dataAxios.value = newArray;
            return newArray;
        } catch (error) {
            console.log(error);
        }
    };

    const getLastResult  = async (device) =>{
        const config = {
            method: 'post',
            url: `${API}speedTest/getLastResult`,
            headers: { Authorization: `Bearer ${TOKEN}` },
            data:{device}
        };
        try {
            const { data } = await axios(config);
            return (Array.isArray(data)) ? data[0]: data;
        } catch (error) {
            console.log(error);
        }
    }

    const getAverageResult = async (device) => {
        const config = {
            method: 'post',
            url: `${API}speedTest/getAverageSpeed`,
            headers: { Authorization: `Bearer ${TOKEN}` },
            data:{device}
        };
        const response = {
            isError:false,
            data:null,
        }
        try {
            const { data } = await axios(config);
            response.data = Array.isArray(data) ? data[0] : data;
        } catch (error) {
            response.isError = true;
        } finally{
            return response;
        }
        

    }

    const getHistoricResult = async (device) =>{
        isloading.value = true;
        const config = {
            method: 'post',
            url: `${API}speedTest/getDataDevice_ById`,
            headers: { Authorization: `Bearer ${TOKEN}` },
            data:{device}
        };
        try {
            const { data } = await axios(config);
            isloading.value = false;
            return data;
        } catch (error) {
        }
    }

    const getNameDevice = async (id) =>{
        const config ={
            method: 'post',
            url: `${API}speedTest/getNameDevice`,
            headers: { Authorization: `Bearer ${TOKEN}` },
            data:{sku:id}
        }
        try {
            const { data } = await axios(config);
            isloading.value = false;
            return data;
        } catch (error) {
        
        }
    }

   
    return {
        getListOfKioscos,
        getAverageResult,
        getHistoricResult,
        getLastResult,
        dataAxios,
        isloading,
        getNameDevice,
    };
};
