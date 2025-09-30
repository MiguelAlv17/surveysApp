import axios from 'axios';
import { ref } from 'vue';
import { API } from '../constantes/api_constants';
import { useRouter } from 'vue-router'
import moment from 'moment';
import 'moment/locale/es-mx'; // Importa directamente el idioma español (es-mx)

export const useGetDataUsuarios = () => {
    const dataAxios = ref(null);
    const isError = ref(false);
    const isloading = ref(false);
    const router = useRouter();

    const TOKEN = localStorage.getItem('token');
    const IDUSUARIO = localStorage.getItem('idusuario');

    
    const getListUsers = async() =>{
        // isloading.value = true;
        const config ={
            method: 'get',
            url: `${API}usuarios`,
            headers: { Authorization: `Bearer ${TOKEN}` },
        }
        try {
            const {data, status} = await axios(config);
            return { data, status }
        } catch (error) {
            console.log(error);
            if (error.response.status == 401) {
                router.push('/login')
            }
            return { data:[], status:400, error:error.message }
        }
    }

    const addUser = async (dataForm) => {
        const config = {
            method: 'post',
            url: `${API}register`,
            headers: { 
                'Content-Type': 'application/json', 
                Authorization: `Bearer ${TOKEN}` 
            },
            data:JSON.stringify(dataForm)
        }
        try {
            const {data,status} = await axios(config);
            return { data, status }
        } catch (error) {
            console.log(error);
            if (error.response.status == 401) {
                router.push('/login')
            }
            return 400
        }

    }

    const updateUser = async (dataForm) => {
        const config = {
            method: 'post',
            url: `${API}update`,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${TOKEN}`
            },
            data: JSON.stringify(dataForm)
        }
        try {
            const { data, status } = await axios(config);
            return { data, status }
        } catch (error) {
            console.log(error);
            if (error.response.status == 401) {
                router.push('/login')
            }
            return { data:[], status:400 }
        }

    }

    const getUserId = async (id) => {
        const config = {
            method: 'get',
            url: `${API}usuarios/${id}`,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${TOKEN}`
            },
        }
        try {
            const { data, status } = await axios(config);
            return { data, status }
        } catch (error) {
            console.log(error);
            if (error.response.status == 401) {
                router.push('/login')
            }
            return { data:[], status:400 }
        }
    }

  
    return {
        getListUsers,
        addUser,
        getUserId,
        updateUser,
    }
}