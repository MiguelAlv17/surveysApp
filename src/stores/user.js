import {defineStore} from 'pinia';
import {ref} from 'vue';
import axios from 'axios';
import {API} from '../constantes/api_constants'    
import {useRouter} from 'vue-router'
import moment from 'moment';

export const useUserStore = defineStore('userStore',()=>{
    const userData = ref(null);
    const tokenAccess = ref(null);
    const errorAuth = ref(false);
    const router = useRouter();
    
    const loginUser = async (email, password) =>{
        let data = JSON.stringify({
            "Email": email,
            "Password": password
        });
        const basicAuth = `Basic ${btoa(`${email}:${password}`)}`;
        const config = {
            method:'post',
            url:`${API}login`,
            maxBodyLength: Infinity,
            headers: {
                // 'Authorization': basicAuth
                'Content-Type': 'application/json'
            },
           data:data
        }
        
        try {
            const response = await axios(config);
            const { data, status } = response;
            console.log(response);
            
            localStorage.setItem('token', data.data.token);
            localStorage.setItem('userInfo', JSON.stringify(data.data));
            tokenAccess.value = data.data.token; 
            if (data.data.tipoUsuario =="administrador") {
                 router.push('/')
            }
            else{
                router.push('/responding')

            }
           
        } catch (error) {
            console.log(error);
            errorAuth.value = true;
            
        }


      
    }
    
    const logout = () =>{
        console.log('logout');
        tokenAccess.value = null
        localStorage.removeItem('token');
        localStorage.removeItem('userName');
        localStorage.removeItem('userRole');
        localStorage.removeItem('email');
        localStorage.removeItem('IdUser');
        router.push('/login')
    }

    const refreshToken = async() => {
        tokenAccess.value = localStorage.getItem('token')
        userData.value = JSON.parse(localStorage.getItem('userInfo'))
        
        if (moment(userData.value.expiracion).isBefore(moment(), 'day')) {
            return 401;

        }else{
            return 200;
        }
    }
    
    const changePassword = (form) => {
    }
    const setTime_expires =()=>{
        setTimeout(() => {
            refreshToken();
        }, 9000);
    }
    return {
        changePassword,
        loginUser,
        refreshToken,
        userData,
        tokenAccess,
        logout,
        errorAuth
    }

})