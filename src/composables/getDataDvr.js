import axios from 'axios';
import { API } from '../constantes/api_constants';
import { useRouter } from 'vue-router'
import moment from 'moment';
import 'moment/locale/es-mx'; // Importa directamente el idioma español (es-mx)

export const useGetDataDvr = () => {
    const router = useRouter();
    const TOKEN = localStorage.getItem('token');

    const getDvrList = async() => {
        try {
            const config = {
                method: 'get',
                url: `${API}dvr`, 
                headers: { Authorization: `Bearer ${TOKEN}`},
            }
            const response  = await axios(config);
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
    const addDvr = async (dataForm) => {
        try {
            const config = {
                method: 'post',
                url: `${API}dvr`,
                headers: { 
                    'Content-Type': 'application/json', 
                    Authorization: `Bearer ${TOKEN}`
                },
                data: JSON.stringify(dataForm)
            }
            const response = await axios(config);
            const { data, status } = response;
            return { data, status }
        } catch (error) {
            console.log(error)
            if (error.response.status == 401) {
                router.push('/login')
            }
            return { data: error, status: 400 }
        }
    }
    const openDvr = async (dataForm) => {
        try {
            const config = {
                method: 'post',
                url: `${API}solicitudApertura`,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${TOKEN}`
                },
                data: JSON.stringify(dataForm)
            }
            console.log(config);
            const response = await axios(config);
            const { data, status } = response;
            return { data, status }
        } catch (error) {
            console.log(error)
            if (error.response.status == 401) {
                router.push('/login')
            }
            return { data: error, status: 400 }
        }
    }
    const getDvrByid = async (id) => {
        try {
            const config = {
                method: 'get',
                url: `${API}dvr/${id}`,
                headers: { Authorization: `Bearer ${TOKEN}` },
            }
            const response = await axios(config);
            const { data, status } = response;
            return { data, status }
        } catch (error) {
            console.log(error)
            if (error.response.status == 401) {
                router.push('/login')
            }
            return { data: error, status: 400 }
        }
    }
    const updateDvr = async (dataForm) => {
        try {
            const config = {
                method: 'post',
                url: `${API}dvr`,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${TOKEN}`
                },
                data: JSON.stringify(dataForm)
            }
            console.log(config);
            const response = await axios(config);
            const { data, status } = response;
            return { data, status }
        } catch (error) {
            console.log(error)
            if (error.response.status == 401) {
                router.push('/login')
            }
            return { data: error, status: 400 }
        }
    }
    const getRequestsList = async () => {
        try {
            const config = {
                method: 'get',
                url: `${API}solicitudApertura`,
                headers: { Authorization: `Bearer ${TOKEN}` },
            }
            const response = await axios(config);
            const { data, status } = response;
            return { data, status }
        } catch (error) {
            console.log(error)
            if (error.response.status == 401) {
                router.push('/login')
            }
            return { data: error, status: 400 }
        }
    }
    return {
        getDvrList,
        addDvr,
        openDvr, getDvrByid, updateDvr, getRequestsList
    }

}