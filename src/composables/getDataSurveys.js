import axios from 'axios';
import { API } from '../constantes/api_constants';
import { useRouter } from 'vue-router'

export const useGetDataSurveys = () => {
    const router = useRouter();
    const TOKEN = localStorage.getItem('token');

    const getSurveysList = async () => {
        try {
            const config = {
                method: 'get',
                url: `${API}encuestas`,
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

    const getSurveyByid = async (id) => {
        try {
            const config = {
                method: 'get',
                url: `${API}encuestas/${id}`,
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
    const saveSurvey = async (id,answers) => {
        try {
            const config = {
                method: 'post',
                url: `${API}encuestas/${id}/responder`,
                headers: { Authorization: `Bearer ${TOKEN}` },
                data:
                {
                    respuestas:answers
                }
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
    const getSucursales = async () => {
        try {
            const config = {
                method: 'get',
                url: `${API}sucursales`,
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
        getSurveysList,
        saveSurvey,
        getSurveyByid,
        getSucursales
    }

}