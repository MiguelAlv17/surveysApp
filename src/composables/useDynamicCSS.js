// composables/useDynamicCSS.js
import { onMounted, onUnmounted } from 'vue'

export function useDynamicCSS(cssPath) {
    let linkElement = null
    const cssId = `dynamic-css-${cssPath.replace(/[^a-zA-Z0-9]/g, '-')}`

    // Función para resolver la ruta correcta
    const resolveCSS = (path) => {
        // Si ya es una URL completa, devolverla tal como está
        if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('/')) {
            return path
        }

        // Para rutas relativas, construir la ruta completa
        const baseUrl = window.location.origin
        const basePath = import.meta.env.DEV ? '' : '' // Ajustar según tu configuración

        // Construir ruta para archivos en assets
        if (path.startsWith('./styles/') || path.startsWith('styles/')) {
            const fileName = path.replace('./styles/', '').replace('styles/', '')
            return `${baseUrl}/src/assets/styles/${fileName}`
        }

        // Para otras rutas relativas
        return `${baseUrl}/${path.replace('./', '')}`
    }

    const loadCSS = () => {
        // Verificar si ya existe para evitar duplicados
        const existingLink = document.getElementById(cssId)
        if (existingLink) {
            return
        }

        // Resolver la ruta correcta
        const resolvedPath = resolveCSS(cssPath)

        // Crear y agregar el elemento link
        linkElement = document.createElement('link')
        linkElement.id = cssId
        linkElement.rel = 'stylesheet'
        linkElement.type = 'text/css'
        linkElement.href = resolvedPath

        // Agregar listener para detectar errores de carga
        linkElement.onerror = () => {
            console.error(`❌ Error cargando CSS: ${resolvedPath}`)
        }

        linkElement.onload = () => {
            console.log(`✅ CSS cargado exitosamente: ${resolvedPath}`)
        }

        // Agregar al head
        document.head.appendChild(linkElement)
    }

    const unloadCSS = () => {
        // Buscar por ID para estar seguros
        const elementToRemove = document.getElementById(cssId)

        if (elementToRemove && document.head.contains(elementToRemove)) {
            document.head.removeChild(elementToRemove)
            console.log(`❌ CSS descargado: ${cssPath}`)
        }

        linkElement = null
    }

    // Auto-carga cuando el componente se monta
    onMounted(() => {
        loadCSS()
    })

    // Auto-descarga cuando el componente se desmonta
    onUnmounted(() => {
        unloadCSS()
    })

    return {
        loadCSS,
        unloadCSS,
        resolveCSS // Exportar para debugging si es necesario
    }
}