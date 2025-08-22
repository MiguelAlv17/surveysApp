import axios from 'axios';
import { API } from '../constants/api_constants';
import { useRouter } from 'vue-router'

export const useGetDataDvrApp = () => {
    const router = useRouter();
    const TOKEN = localStorage.getItem('token');

    const sendingDataCorte = async (data_corte) => {
        try {
            const config = {
                method: 'post',
                url: `${API}datos`,
                headers: { Authorization: `Bearer ${TOKEN}` },
                data: data_corte
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
        sendingDataCorte,
    }

}