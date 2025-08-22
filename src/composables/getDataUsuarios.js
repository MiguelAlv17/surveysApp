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
            url: `${API}usuarios`,
            headers: { 
                'Content-Type': 'application/json', 
                Authorization: `Bearer ${TOKEN}` 
            },
            data:JSON.stringify(dataForm)
        }
        console.log(config);
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
            url: `${API}usuarios`,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${TOKEN}`
            },
            data: JSON.stringify(dataForm)
        }
        console.log(config);
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
        console.log(config);
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

    // old functions
    const deletUser = async (idUser) => {
      const config = {
        method:'POST',
        url: `${API}users/delete`,
        headers: { Authorization: `Bearer ${TOKEN}` },
        data: {idUser}
      }
      try {
        const {data, status} = await axios(config);
        return {data,status}
      } catch (error) {
          console.log(error);
          if (error.response.status == 401) {
              router.push('/login')
          }
          return []
      }
    }

    const getMyInfo = async() => {
        const config = {
            method: 'get',
            url: `${API}usuario/${IDUSUARIO}`,
            headers: { Authorization: `Bearer ${TOKEN}` },
        }
        try {
            const { data, status } = await axios(config);
            if (Array.isArray(data)) {
                return data[0]
            }
            return data
        } catch (error) {
            console.log(error);
            if (error.response.status == 401) {
                router.push('/login')
            }
            return {}
        }
    }
    const updateMyInfo = async (dataForm) => {
        const config = {
            method: 'post',
            url: `${API}usuario`,
            headers: { 
                'Content-Type': 'application/json',
                Authoriztion: `Bearer ${TOKEN}` 
            },
            data:JSON.stringify(dataForm)
        }
        console.log(config);
        try {
            const { data, status } = await axios(config);
            return status
        } catch (error) {
            console.log(error);
            if (error.response?.status == 401) {
                router.push('/login')
            }
            return 400
        }
    }

    const boletinadoschange = async (id, valor) => {
        // 
        const config = {
            method: 'get',
            url: `${API}boletinados?nombreEntidad=usuario&pk=${id}&valor=${valor}`,
            headers: {
                Authorization: `Bearer ${TOKEN}`
            },
        }
        try {
            const { data, status } = await axios(config);
            return status
        } catch (error) {
            console.log(error);
            if (error.response.status == 401) {
                router.push('/login')
            }
            return 400
        }
    }
    return {
        getListUsers,
        addUser,
        deletUser,
        dataAxios,
        isError,
        getMyInfo,
        updateMyInfo,
        getUserId,
        updateUser,
        isloading,
        boletinadoschange
    }
}