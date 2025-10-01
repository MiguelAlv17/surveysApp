import {createRouter, createWebHistory} from 'vue-router'
import  Login from './views/auth/Login.vue'
import Register from './views/auth/Register.vue'
import Home from './views/Home.vue'
// import Navbar from './views/layout/navbar.vue'

import {useUserStore} from './stores/user'



const routes = [
    //    nuevas rutas navbar
    {
        path: "/",
        redirect: "/surveys"
    },
    // {
    //     path:"/home",
    //     component: () => import('./views/layout/Navbar.vue'),
    //     children:[
            
    //         // {path: '', component: () => import('./views/bitacora_views/bitacora.vue'),meta:{auth:true}},
    //         {path: '', component: () => import('./views/Home.vue'),meta:{auth:true}},
    //     ]
    // },
    {
        path: "/surveys",
        component: () => import('./views/layout/Navbar.vue'),
        children: [

            // {path: '', component: () => import('./views/bitacora_views/bitacora.vue'),meta:{auth:true}},
            { path: '', component: () => import('./views/surveys_views/IndexAdmin.vue'), meta: { auth: true, role:"admin" } },
        ]
    },
    {
        path: "/surveys/add",
        component: () => import('./views/layout/Navbar.vue'),
        children: [

            // {path: '', component: () => import('./views/bitacora_views/bitacora.vue'),meta:{auth:true}},
            { path: '', component: () => import('./views/surveys_views/Add.vue'), meta: { auth: true, role: "admin" } },
        ]
    },
    
    {
        path: "/responding",
        component: () => import('./views/layout/Navbar.vue'),
        children: [

            // {path: '', component: () => import('./views/bitacora_views/bitacora.vue'),meta:{auth:true}},
            { path: '', component: () => import('./views/surveys_views/IndexUser.vue'), meta: { auth: true, role: "sub" } },
        ]
    },
    {
        path: "/responding/questions/:idSurvey",
        component: () => import('./views/layout/Navbar.vue'),
        children: [

            // {path: '', component: () => import('./views/bitacora_views/bitacora.vue'),meta:{auth:true}},
            { path: '', component: () => import('./views/surveys_views/answering_survey.vue'), meta: { auth: true, role: "sub" } },
        ]
    },

    // // user routes
    {   
        path:"/users",
        component: () => import('./views/layout/Navbar.vue'),
        children:[
            { path: '', component: () => import('./views/users_views/index.vue'), meta: { auth: true, role: "admin" }},
        ]
    },
    {
        path: "/users/add",
        component: () => import('./views/layout/Navbar.vue'),
        children: [
            { path: '', component: () => import('./views/users_views/Add.vue'), meta: { auth: true, role: "admin" } },
        ]
    },
    {
        path: "/users/edit/:iduser",
        component: () => import('./views/layout/Navbar.vue'),
        children: [
            { path: '', component: () => import('./views/users_views/Edit.vue'), meta: { auth: true, role: "admin" } },
        ]
    },
  
    {
        path: "/myaccount/profile",
        component: () => import('./views/layout/Navbar.vue'),
        children: [
            { path: '', component: () => import('./views/my_account/Profile.vue'), meta: { auth: true, role: "both" } },
        ]
    },

    { path: '/login', component: () => import('./views/auth/Login.vue'), meta: { auth: false, role: "both" } },
    // {path: '/register', component:Register},

];

const router = createRouter({
    routes,
    history: createWebHistory(),
});
const validateRole = (userRole, pageRole) => {
    // Normalizar el rol del usuario a minúsculas para comparación
    const normalizedUserRole = userRole?.toLowerCase() || '';

    if (pageRole === "both") return true;
    // Si la página requiere rol de administrador
    if (pageRole === "admin") {
        return normalizedUserRole === "administrador";
    }
    // Si la página requiere rol de usuario regular (asesor o facilitador)
    if (pageRole === "sub") {
        return normalizedUserRole === "asesor" ||
            normalizedUserRole === "facilitador";
    }

    return false;
}
const handleLogout = (userStore, next, message = '') => {
    if (message) {
        console.warn(`[Auth Guard] ${message}`);
    }
    userStore.removeLocalStorageItems();
    return next('/login');
}

router.beforeEach(async (to, from, next) => {
    const userStore = useUserStore();
    const requireAuth = to.meta.auth;
    const requiredRole = to.meta.role;

    // Caso 1: Ruta pública (no requiere autenticación)
    if (!requireAuth) {
        // Si el usuario está autenticado y va a login, redirigir al home
        if (to.path === '/login' && userStore.tokenAccess) {
            const userRole = userStore.userData?.tipoUsuario?.toLowerCase();

            // Redirigir según el rol del usuario
            if (userRole === 'administrador') {
                return next('/surveys');
            } else if (userRole === 'asesor' || userRole === 'facilitador') {
                return next('/responding');
            }
        }

        return next();
    }

    // Caso 2: Ruta requiere autenticación pero no hay token
    // console.log("here");
    // console.log(userStore.tokenAccess);
    
    // if (!userStore.tokenAccess) {
    //     console.log("notfound");
        
    //     console.warn('[Auth Guard] No token found, redirecting to login');
    //     return next('/login');
    // }

    // Caso 3: Hay token, validar autenticación
    try {
        const status = await userStore.refreshToken();
        // console.log(status);

        // Token inválido o expirado
        if (status !== 200) {
            return handleLogout(
                userStore,
                next,
                'Token expired or invalid'
            );
        }

        // Token válido pero no hay datos de usuario
        if (!userStore.userData) {
            return handleLogout(
                userStore,
                next,
                'No user data found'
            );
        }

        // Validar permisos de rol
        const userRole = userStore.userData.tipoUsuario;
        const hasPermission = validateRole(userRole, requiredRole);

        if (!hasPermission) {
            console.warn(
                `[Auth Guard] User role "${userRole}" does not have permission to access "${to.path}" (requires: ${requiredRole})`
            );

            // Redirigir al área correspondiente según su rol
            const normalizedRole = userRole?.toLowerCase();
            if (normalizedRole === 'administrador') {
                return next('/surveys');
            } else if (normalizedRole === 'asesor' || normalizedRole === 'facilitador') {
                return next('/responding');
            }

            // Si no se identifica el rol, hacer logout
            return handleLogout(
                userStore,
                next,
                'Unrecognized user role'
            );
        }

        // Todo correcto, permitir navegación
        return next();

    } catch (error) {
        console.error('[Auth Guard] Error during authentication:', error);
        return handleLogout(
            userStore,
            next,
            'Authentication error'
        );
    }
});
export default router;