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
            userData.value = data.data;
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
    
    const logout = async() =>{
        console.log('logout');
        await removeLocalStorageItems();
        router.push('/login')
    }
    const removeLocalStorageItems = () => {
        tokenAccess.value = null
        userData.value =null
        localStorage.removeItem('token');
        localStorage.removeItem('userInfo');
    }
    const refreshToken = async() => {
        const storedToken = localStorage.getItem('token');
        const storedUserInfo = localStorage.getItem('userInfo');
        // Si no hay token o info de usuario
        if (!storedToken || !storedUserInfo) {
            console.warn('[User Store] No token or user info found in localStorage');
            return 401;
        }

        let parsedUserData;
        try {
            parsedUserData = JSON.parse(storedUserInfo);
        } catch (parseError) {
            console.error('[User Store] Error parsing user info:', parseError);
            return 401;
        }
        // Validar que tenga los datos necesarios
        if (!parsedUserData || !parsedUserData.expiracion) {
            console.warn('[User Store] Invalid user data structure');
            return 401;
        }

        // Verificar expiración del token
        const expirationDate = moment(parsedUserData.expiracion);
        const now = moment();

        // Validar que la fecha sea válida
        if (!expirationDate.isValid()) {
            console.error('[User Store] Invalid expiration date format');
            return 401;
        }
        if (expirationDate.isBefore(now)) {
            console.warn('[User Store] Token has expired');
            return 401;
        }

        // Token válido, actualizar el store
        tokenAccess.value = storedToken;
        userData.value = parsedUserData;

        // Opcional: Log del tiempo restante
        const minutesRemaining = expirationDate.diff(now, 'minutes');
        console.log(`[User Store] Token valid for ${minutesRemaining} more minutes`);

        return 200;
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
        errorAuth,
        removeLocalStorageItems
    }

})