import {defineStore} from 'pinia';
import {ref} from 'vue';
import axios from 'axios';
import {API} from '../constantes/api_constants'    
import {useRouter} from 'vue-router'

export const useUserStore = defineStore('userStore',()=>{
    const userData = ref(null);
    const tokenAccess = ref(null);
    const role_user = ref(null);
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
        console.log(config);
        
        try {
            const response = await axios(config);
            const { data, status } = response;
            console.log(response);
            localStorage.setItem('token', data.data.token);
            localStorage.setItem('userName', data.data.nombre);
            localStorage.setItem('userRole', data.data.tipoUsuario);
            // localStorage.setItem('userid', data.userid);

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
        localStorage.removeItem('email');
        localStorage.removeItem('userName');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userid');
        router.push('/login')
    }

    const refreshToken = async() => {
        let TOKEN = localStorage.getItem('token')
        tokenAccess.value = TOKEN;
        return 200;
        // const config ={
        //     method:'GET',
        //     url: `${API}refreshToken`,
        //     headers: { Authorization: `Bearer ${TOKEN}` },
        // }
        // localStorage.removeItem('token');
        // localStorage.removeItem('role_id');
        // localStorage.removeItem('user');
        // try {
        //     const {data,status} = await axios(config);
        //     const { token_access, user } = data;
        //     localStorage.setItem('token', token_access );
        //     localStorage.setItem('role_id', user.role_id);
        //     localStorage.setItem('user', JSON.stringify(user));
        //     userData.value = user;
        //     role_user.value = user.role_id;

        //     return  status;
        // } 
        // catch (error) {
        //     console.log(error);
        //     tokenAccess.value=null;
        //     return 400
        // }
    }
    
    const changePassword = (form) => {
      console.log(form);
    }
    // const setTime_expires =()=>{
    //     setTimeout(() => {
    //         refreshToken();
    //     }, 9000);
    // }
    return {
        changePassword,
        loginUser,
        refreshToken,
        userData,
        tokenAccess,
        role_user,
        logout,
        errorAuth
    }

})