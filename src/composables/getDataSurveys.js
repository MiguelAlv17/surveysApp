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
    const saveSurvey = async (id,answers,sucursal) => {
        try {
            const config = {
                method: 'post',
                url: `${API}encuestas/${id}/responder`,
                headers: { Authorization: `Bearer ${TOKEN}` },
                data:
                {
                    sucursalId:sucursal,
                    respuestas:answers
                }
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
    const addNewSurvey = async(formdata) => {
        try {
            const config = {
                method: 'post',
                url: `${API}encuestas`,
                headers: { Authorization: `Bearer ${TOKEN}` },
                data:formdata
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

    const getSurveyReport = async(datefrom, dateTo, questionId) => {
        let routeApi = `reportes/pregunta/${questionId}/reporte-simple?fechaInicio=${datefrom}&fechaFin=${dateTo}`
        try {
            const config = {
                method: 'get',
                url: `${API}${routeApi}`,
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
        getSurveyReport,
        getSurveysList,
        saveSurvey,
        getSurveyByid,
        getSucursales,
        addNewSurvey
    }

}