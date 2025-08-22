import { defineStore } from 'pinia';
import { API } from '../constants/api_constants'    
import { useRouter } from 'vue-router'
import axios from 'axios';
import { ref } from 'vue';

export const useUserStore = defineStore('userStore', () => {
    const tokenAccess = ref(null);
    const router = useRouter();

    const loginUser = async (email, password) => {
        console.log(email);
        console.log(password);
        
        const basicAuth = `Basic ${btoa(`${email}:${password}`)}`;
        const config = {
            method: 'post',
            url: `${API}login`,
            maxBodyLength: Infinity,
            headers: {
                'Authorization': basicAuth
            },
        }
        console.log(config);

        try {
            const response = await axios(config);
            console.log(response);
            const { data, status } = response;
            localStorage.setItem('token', data.token);
            localStorage.setItem('email', data.correo);
            localStorage.setItem('userName', data.nombre);
            localStorage.setItem('userRole', data.rol);
            localStorage.setItem('userid', data.userid);
            tokenAccess.value = data.token;
            router.push('/')
            return {data,status}

        } catch (error) {
            console.log(error);
            return {status:400, message:"Error con las credenciales"}
        }

    }
    const logout = () => {
        console.log('logout');
        tokenAccess.value = null
        localStorage.removeItem('token');
        localStorage.removeItem('email');
        localStorage.removeItem('userName');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userid');
        router.push('/login')
    }
    const refreshToken = async () => {
        let TOKEN = localStorage.getItem('token')
        tokenAccess.value = TOKEN;
        return 200;
    }
    return {
        loginUser,
        refreshToken,
        logout,
    }
})