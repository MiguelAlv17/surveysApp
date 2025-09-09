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
            { path: '', component: () => import('./views/surveys_views/IndexAdmin.vue'), meta: { auth: true } },
        ]
    },
    {
        path: "/surveys/add",
        component: () => import('./views/layout/Navbar.vue'),
        children: [

            // {path: '', component: () => import('./views/bitacora_views/bitacora.vue'),meta:{auth:true}},
            { path: '', component: () => import('./views/surveys_views/Add.vue'), meta: { auth: true } },
        ]
    },
    
    {
        path: "/responding",
        component: () => import('./views/layout/Navbar.vue'),
        children: [

            // {path: '', component: () => import('./views/bitacora_views/bitacora.vue'),meta:{auth:true}},
            { path: '', component: () => import('./views/surveys_views/IndexUser.vue'), meta: { auth: true } },
        ]
    },
    {
        path: "/responding/questions/:idSurvey",
        component: () => import('./views/layout/Navbar.vue'),
        children: [

            // {path: '', component: () => import('./views/bitacora_views/bitacora.vue'),meta:{auth:true}},
            { path: '', component: () => import('./views/surveys_views/answering_survey.vue'), meta: { auth: true } },
        ]
    },
    // old routes
    // {
    //     path: "/dvr",
    //     component: () => import('./views/layout/Navbar.vue'),
    //     children: [

    //         // {path: '', component: () => import('./views/bitacora_views/bitacora.vue'),meta:{auth:true}},
    //         { path: '', component: () => import('./views/dvr_views/Index.vue'), meta: { auth: true } },
    //     ]
    // },
    
    // {
    //     path: "/history",
    //     component: () => import('./views/layout/Navbar.vue'),
    //     children: [
    //         { path: '', component: () => import('./views/History/Index.vue'), meta: { auth: true } },
    //     ]
    // },

    // // user routes
    {   
        path:"/users",
        component: () => import('./views/layout/Navbar.vue'),
        children:[
            {path: '', component: () => import('./views/users_views/Index.vue'),meta:{auth:true}},
        ]
    },
    {
        path: "/users/add",
        component: () => import('./views/layout/Navbar.vue'),
        children: [
            { path: '', component: () => import('./views/users_views/Add.vue'), meta: { auth: true } },
        ]
    },
    {
        path: "/users/edit/:iduser",
        component: () => import('./views/layout/Navbar.vue'),
        children: [
            { path: '', component: () => import('./views/users_views/Edit.vue'), meta: { auth: true } },
        ]
    },
    // // dvr routes
    // {
    //     path: "/dvr/add",
    //     component: () => import('./views/layout/Navbar.vue'),
    //     children: [

    //         // {path: '', component: () => import('./views/bitacora_views/bitacora.vue'),meta:{auth:true}},
    //         { path: '', component: () => import('./views/dvr_views/Add.vue'), meta: { auth: true } },
    //     ]
    // },
    // {
    //     path: "/dvr/edit/:idDvr",
    //     component: () => import('./views/layout/Navbar.vue'),
    //     children: [

    //         // {path: '', component: () => import('./views/bitacora_views/bitacora.vue'),meta:{auth:true}},
    //         { path: '', component: () => import('./views/dvr_views/Edit.vue'), meta: { auth: true } },
    //     ]
    // },
    {
        path: "/myaccount/profile",
        component: () => import('./views/layout/Navbar.vue'),
        children: [
            { path: '', component: () => import('./views/my_account/Profile.vue'), meta: { auth: true } },
        ]
    },

    { path: '/login', component: () => import('./views/auth/Login.vue'), },
    // {path: '/register', component:Register},

];

const router = createRouter({
    routes,
    history: createWebHistory(),
});

router.beforeEach(async (to, from, next) =>{
    const userStore = useUserStore()
    const requireAuth = to.meta.auth
    if (requireAuth) {
        const status = await userStore.refreshToken();
        if (userStore.tokenAccess != null && status == 200) {
            return next()
        } else {
            return next('/login');
        } 
    }
    next()
})
export default router;