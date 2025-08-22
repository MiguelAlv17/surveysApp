<script setup>
import { onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router'
import ContainerCustom from '../Components/ContainerCustom.vue';
import FlipCard from '../Components/FlipCard.vue';

const router = useRouter()
const route = useRoute()

onMounted(() => {
    const ids = JSON.parse(route.query.ids || '[]');
    let idArray = [];
    if (!Array.isArray(ids)) {
        idArray.push(ids);
    } else {
        idArray = ids
    }
    console.log(ids);
});

// Opciones de procesos disponibles
const processOptions = [
    {
        title: "Recolección de Tramites",
        subtitle: "Extraer registros de tramites",
        description: "Recupera y procesa los datos de tramites de los kioscos seleccionados en un rango de fechas específico. para la recaudacion diaria",
        icon: "cloud_download",
        backIcon: "analytics",
        backTitle: "Proceso de Recolección",
        actionText: "Iniciar Recolección",
        color: "green",
        route: "/recoleccion",
        features: [
            { icon: "date_range", text: "Selección de rango de fechas" },
            { icon: "desktop_windows", text: "Múltiples kioscos simultáneos" },
            { icon: "monetization_on", text: "Cálculo automático de totales" },
            { icon: "cloud_upload", text: "Subida a BD centralizada" }
        ]
    },
    {
        title: "Recoleccion de Cortes",
        subtitle: "Extraer el saldo actual de cada kiosco",
        description: "Recopila el saldo actual en efectivo despues del termino de operaciones",
        icon: "payments",
        backIcon: "local_atm",
        backTitle: "Proceso de Cortes",
        actionText: "REcoleccion de cortes",
        color: "blue", 
        route: "/corterecaudacion",
        features: [
            { icon: "archive", text: "Seleccion de dia" },
            { icon: "verified", text: "Verificación de integridad" },
            { icon: "auto_fix_high", text: "Descompresión automática" },
            { icon: "folder_open", text: "Organización de archivos" }
        ]
    },
    // {
    //     title: "Utilidades",
    //     subtitle: "Operaciones avanzadas",
    //     description: "Realiza operaciones de mantenimiento como renombrado, eliminación y restauración de archivos de base de datos.",
    //     icon: "build",
    //     backIcon: "settings",
    //     backTitle: "Herramientas de Utilidad",
    //     actionText: "Abrir Utilidades",
    //     color: "purple",
    //     route: "/utilities",
    //     features: [
    //         { icon: "edit", text: "Renombrado de archivos" },
    //         { icon: "delete_forever", text: "Eliminación de residuales" },
    //         { icon: "restore", text: "Restauración de backups" },
    //         { icon: "folder", text: "Gestión de carpetas" }
    //     ]
    // },
    // {
    //     title: "Gestión de Kioscos",
    //     subtitle: "Administrar dispositivos",
    //     description: "Administra la información de los kioscos, incluyendo configuración, ubicaciones y parámetros de conexión.",
    //     icon: "desktop_windows",
    //     backIcon: "device_hub",
    //     backTitle: "Administración de Kioscos",
    //     actionText: "Gestionar Kioscos",
    //     color: "blue",
    //     route: "/kioscos",
    //     features: [
    //         { icon: "add_circle", text: "Agregar nuevos kioscos" },
    //         { icon: "edit", text: "Editar configuraciones" },
    //         { icon: "location_on", text: "Gestión de ubicaciones" },
    //         { icon: "computer", text: "Configuración LogMeIn" }
    //     ]
    // }
];

const handleCardClick = (option) => {
    console.log(option);
    
    // Pasar los IDs seleccionados como query params si es necesario
    const ids = JSON.parse(route.query.ids || '[]');
        router.push({
            path: option.route,
            query: { ids: JSON.stringify(ids) }
        });
};
</script>

<template>
    <ContainerCustom 
        title="PÁGINA INTERMEDIA"
        subtitle="Selecciona el siguiente proceso que deseas ejecutar"
        icon="directions_walk"
        header-background="gradient"
        :loading="false"
    >
        <template #body>
            <!-- Sección de información -->
            <div class="info-section">
                <div class="info-card">
                    <div class="info-header">
                        <span class="material-icons info-icon">info</span>
                        <h3 class="info-title">Procesos Disponibles</h3>
                    </div>
                    <div class="info-content">
                        <p class="info-description">
                            Selecciona el proceso que deseas ejecutar a continuación. 
                            Cada opción te llevará a una funcionalidad específica del sistema.
                        </p>
                        <div class="info-stats">
                            <div class="stat-item">
                                <span class="material-icons">memory</span>
                                <span  class="text-stats">{{ JSON.parse(route.query.ids || '[]').length }} Kioscos seleccionados</span>
                            </div>
                            <div class="stat-item">
                                <span class="material-icons">widgets</span>
                                <span class="text-stats">{{ processOptions.length }} Procesos disponibles</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Grid de opciones -->
            <div class="process-grid">
                <FlipCard
                    v-for="(option, index) in processOptions"
                    :key="index"
                    :title="option.title"
                    :subtitle="option.subtitle"
                    :description="option.description"
                    :icon="option.icon"
                    :back-icon="option.backIcon"
                    :back-title="option.backTitle"
                    :features="option.features"
                    :action-text="option.actionText"
                    :color="option.color"
                    size="normal"
                    @click="handleCardClick(option)"
                />
            </div>

            <!-- Sección de ayuda -->
            <div class="help-section">
                <div class="help-card">
                    <div class="help-icon">
                        <span class="material-icons">help_outline</span>
                    </div>
                    <div class="help-content">
                        <h4 class="help-title">¿Necesitas ayuda?</h4>
                        <p class="help-description">
                            Posiciona el cursor sobre cualquier tarjeta para ver más detalles del proceso. 
                            Haz clic para continuar con la operación seleccionada.
                        </p>
                    </div>
                </div>
            </div>
        </template>
    </ContainerCustom>
</template>

<style scoped>
/* ===================================
   SECCIÓN DE INFORMACIÓN
   =================================== */
.text-stats{
    color: var(--text-primary);
}
.info-section {
    margin-bottom: var(--spacing-2xl);
}

.info-card {
    background: var(--bg-glass);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius-lg);
    box-shadow: var(--shadow-sm);
    overflow: hidden;
    transition: all var(--transition-normal);
}

.info-card:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
}

.info-header {
    background: var(--gradient-secondary);
    color: var(--text-white);
    padding: var(--spacing-lg) var(--spacing-xl);
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
}

.info-icon {
    font-size: 20px;
}

.info-title {
    margin: 0;
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-semibold);
}

.info-content {
    padding: var(--spacing-xl);
}

.info-description {
    margin: 0 0 var(--spacing-lg) 0;
    color: var(--text-secondary);
    font-size: var(--font-size-sm);
    line-height: 1.5;
}

.info-stats {
    display: flex;
    gap: var(--spacing-xl);
    align-items: center;
}

.stat-item {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
    font-weight: var(--font-weight-medium);
}

.stat-item .material-icons {
    font-size: 18px;
    color: var(--secondary-color);
}

/* ===================================
   GRID DE PROCESOS
   =================================== */

.process-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: var(--spacing-2xl);
    margin-bottom: var(--spacing-2xl);
}

/* ===================================
   SECCIÓN DE AYUDA
   =================================== */

.help-section {
    margin-top: var(--spacing-2xl);
}

.help-card {
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
    border: 1px solid rgba(102, 126, 234, 0.2);
    border-radius: var(--border-radius-lg);
    padding: var(--spacing-xl);
    display: flex;
    align-items: center;
    gap: var(--spacing-lg);
    transition: all var(--transition-normal);
}

.help-card:hover {
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%);
    border-color: rgba(102, 126, 234, 0.3);
    transform: translateY(-1px);
}

.help-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    background: rgba(102, 126, 234, 0.1);
    color: var(--secondary-color);
    border-radius: var(--border-radius-md);
    flex-shrink: 0;
}

.help-icon .material-icons {
    font-size: 24px;
}

.help-content {
    flex: 1;
}

.help-title {
    margin: 0 0 var(--spacing-sm) 0;
    font-size: var(--font-size-md);
    font-weight: var(--font-weight-semibold);
    color: var(--text-primary);
}

.help-description {
    margin: 0;
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
    line-height: 1.4;
}

/* ===================================
   RESPONSIVE DESIGN
   =================================== */

@media (max-width: 1024px) {
    .process-grid {
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: var(--spacing-xl);
    }
    
    .info-stats {
        flex-direction: column;
        align-items: flex-start;
        gap: var(--spacing-md);
    }
}

@media (max-width: 768px) {
    .process-grid {
        grid-template-columns: 1fr;
        gap: var(--spacing-lg);
    }
    
    .info-header {
        padding: var(--spacing-md) var(--spacing-lg);
    }
    
    .info-content {
        padding: var(--spacing-lg);
    }
    
    .help-card {
        flex-direction: column;
        text-align: center;
        gap: var(--spacing-md);
    }
    
    .help-content {
        text-align: center;
    }
}

@media (max-width: 480px) {
    .process-grid {
        gap: var(--spacing-md);
    }
    
    .info-header {
        padding: var(--spacing-sm) var(--spacing-md);
    }
    
    .info-content {
        padding: var(--spacing-md);
    }
    
    .help-card {
        padding: var(--spacing-lg);
    }
    
    .help-icon {
        width: 40px;
        height: 40px;
    }
    
    .help-icon .material-icons {
        font-size: 20px;
    }
}

/* ===================================
   ANIMACIONES
   =================================== */

.info-section,
.process-grid,
.help-section {
    animation: slideUp 0.6s ease-out;
}

.process-grid {
    animation-delay: 0.2s;
}

.help-section {
    animation-delay: 0.4s;
}

@keyframes slideUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Animación de entrada escalonada para las cards */
.process-grid > :nth-child(1) { animation-delay: 0.3s; }
.process-grid > :nth-child(2) { animation-delay: 0.4s; }
.process-grid > :nth-child(3) { animation-delay: 0.5s; }
.process-grid > :nth-child(4) { animation-delay: 0.6s; }

/* ===================================
   MODO OSCURO
   =================================== */

@media (prefers-color-scheme: dark) {
    .info-card {
        background: rgba(45, 55, 72, 0.95);
        border-color: rgba(255, 255, 255, 0.1);
    }
    
    .help-card {
        background: linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%);
        border-color: rgba(102, 126, 234, 0.3);
    }
    
    .help-card:hover {
        background: linear-gradient(135deg, rgba(102, 126, 234, 0.12) 0%, rgba(118, 75, 162, 0.12) 100%);
    }
    
    .info-title,
    .help-title {
        color: var(--text-white);
    }
    
    .info-description,
    .help-description {
        color: var(--text-light);
    }
    .text-stats{
    color: var(--text-light);
}
}
</style>