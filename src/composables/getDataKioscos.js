import axios from 'axios';
import { API } from '../constantes/api_constants';
import { useRouter } from 'vue-router'
import moment from 'moment';
import 'moment/locale/es-mx'; // Importa directamente el idioma español (es-mx)

export const useGetDataKioscos = () => {
    const router = useRouter();
    const TOKEN = localStorage.getItem('token');

    const getKioscosList = async() => {
        try {
            const config = {
                method: 'get',
                url: `${API}kiosco`, 
                headers: { Authorization: `Bearer ${TOKEN}`},
            }
            const response  = await axios(config);
            console.log(response);
            const {data,status} = response;
            return {data,status}
        } catch (error) {
            console.log(error)
            if (error.response.status == 401) {
                router.push('/login')
            }
            return{data:error,status:400}
        }
    }
    return {
        getKioscosList
    }

}