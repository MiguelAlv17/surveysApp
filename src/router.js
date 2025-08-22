import { createRouter, createWebHashHistory } from 'vue-router'
import { useUserStore } from './stores/user'

const routes = [
    { path: '/login', component: () => import('./Views/auth/Login.vue'), },
    {
        path: '/', 
        component: () => import('./Views/Layout/Navbar.vue'),
        children:[
            { path: '', component: () => import('./Views/Home.vue'), meta: { auth: true } },
        ]
    },
    {
        path: '/recaudacion',
        component: () => import('./Views/Layout/Navbar.vue'),
        children: [
            { path: '', component: () => import('./Views/Recaudacion_views/Recaudacion.vue'),meta: { auth: true } },
        ]
    },
    {
        path: '/intermediate',
        component: () => import('./Views/Layout/Navbar.vue'),
        children: [
            { path: '', component: () => import('./Views/Recaudacion_views/IntermediatePage.vue'), meta: { auth: true } },
        ]
    },
    {
        path: '/corterecaudacion',
        component: () => import('./Views/Layout/Navbar.vue'),
        children: [
            { path: '', component: () => import('./Views/Cortes_views/CorteRecaudacion.vue'), meta: { auth: true } },
        ]
    },
    {
        path: '/recoleccion',
        component: () => import('./Views/Layout/Navbar.vue'),
        children: [
            { path: '', component: () => import('./Views/Recaudacion_views/Recoleccion.vue'),meta: { auth: true } },
        ]
    },
    {
        path: '/descompresion',
        component: () => import('./Views/Layout/Navbar.vue'),
        children: [
            { path: '', component: () => import('./Views/Procesos_views/Descompresion.vue'),meta: { auth: true } },
        ]
    },
    {
        path: '/utilities',
        component: () => import('./Views/Layout/Navbar.vue'),
        children: [
            { path: '', component: () => import('./Views/Procesos_views/Utilities.vue'),meta: { auth: true } },
        ]
    },
    {
        path: '/kioscos',
        component: () => import('./Views/Layout/Navbar.vue'),
        children: [
            { path: '', component: () => import('./Views/Kioscos/Index.vue'),meta: { auth: true } },
        ]
    },
    {
        path: '/addkiosco',
        component: () => import('./Views/Layout/Navbar.vue'),
        children: [
            { path: '', component: () => import('./Views/Kioscos/Add.vue'),meta: { auth: true } },
        ]
    },
    {
        path: '/editkiosco/:idKiosco',
        component: () => import('./Views/Layout/Navbar.vue'),
        children: [
            { path: '', component: () => import('./Views/Kioscos/Edit.vue'),meta: { auth: true } },
        ]
    }
];
const router = createRouter({
    routes,
    history: createWebHashHistory()
})
router.beforeEach(async (to, from, next) => {
    const userStore = useUserStore()
    const requireAuth = to.meta.auth
    if (requireAuth) {
        const status = await userStore.refreshToken();
        if ( status == 200) {
            return next()
        } else {
            return next('/login');
        }
    }
    next()
})
export default router;