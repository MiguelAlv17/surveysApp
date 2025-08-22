import axios from 'axios';
import { ref } from 'vue';
import { API } from '../constantes/api_constants';
import moment from 'moment';
import 'moment/locale/es-mx'; // Importa directamente el idioma español (es-mx)
export const useGetCatalogs  = () => {
    const isLoading = ref(false);
    const TOKEN = localStorage.getItem('token');
   
    const getKioscosList = async (idUser) => {
        const config = {
            method: 'post',
            url: `${API}catalogs/getKioscos`,
            headers: { Authorization: `Bearer ${TOKEN}` },
            data:{idUser}
        };
        try {
            const {data,status}  = await axios(config);
            return { data, status }

        } catch (error) {
            console.log(error);
        } 
    }
    const addKioscosToUser = async (devicesSelected, idUser) => {
        const config ={
            method: 'POST',
            url: `${API}users/addKioscosToUser`,
            headers: { Authorization: `Bearer ${TOKEN}` },
            data: { devicesSelected, idUser }
        }
        try {
            const {data, status} = await axios(config)
            return {data, status}
        } catch (error) {
            const { data, status } = error.response;
            return { data, status }
        }
    }
    return {
        getKioscosList,
        isLoading,
        addKioscosToUser
    }
}