<script setup>
import { nextTick, onMounted, reactive, ref } from 'vue';
import {useRoute, useRouter} from 'vue-router'
import { useGetDataSurveys } from "../../composables/getDataSurveys";
// components
import ContainerCustom from '../../components/ContainerCustom.vue';
import moment from 'moment';
import ModernButton from '../../components/ModernButtons/ModernButton.vue';
import { alertError } from '../../constantes/alerts';
import LoaderBtn from '../../components/LoaderBtn.vue'
import 'moment/locale/es'; // ← Importar locale español
const route = useRoute();
 const {getSurveyReport, getSurveyByid} = useGetDataSurveys()
// loaders
const isloading = ref(false)
const isLoadingReport = ref(false)
// extras
const formatMoment = ref("YYYY-MM-DD");
// const dateTo = ref(moment().add(1, 'days').format(formatMoment.value));
// const dateFrom = ref(moment().format(formatMoment.value));
const dateFrom = ref(moment().startOf('month').format(formatMoment.value))
const dateTo = ref(moment().add(1, 'days').format(formatMoment.value));
const surveyData = reactive({
    id: 6,
    titulo: "Registro de trámites",
    descripcion: "Registro de trámites realizados en kiosco OXXO",
    fechaCreacion: "2025-09-19T13:51:05.4362635Z",
    nombreCreador: "María Eugenia de la Mora",
    permitirAsesor:false,
    permitirFacilitador:false,
    totalpreguntas: 0
})
const questionsReports = ref([]);
const collapsedQuestions = reactive({});
onMounted( () => {
      const idSurvey = route.params.idSurvey
      getSurveyInfo(idSurvey)
});
const toggleQuestion = (index) => {
    collapsedQuestions[index] = !collapsedQuestions[index];
};
const formatQuestionType = (tipo) => {
    const tipos = {
        'opcion_multiple': 'Opción Múltiple',
        'texto_libre': 'Texto Libre',
        'seleccion_multiple': 'Selección Múltiple',
        'escala': 'Escala',
        'fecha': 'Fecha'
    };
    return tipos[tipo] || tipo;
};
const getSurveyInfo = async(idSurvey) => {
    isloading.value=true;
    
    const response = await getSurveyByid(idSurvey)
    console.log(response);
    const {data,status} = response
    const { 
        preguntas,
    } = data.data
    Object.assign(surveyData, data.data)
    surveyData.totalpreguntas = preguntas.length

    isloading.value = false
    getReportInfo()
}

const getReportInfo = async() => {
     // Array para almacenar reportes de cada pregunta
    const allReports = [];
    try {
    // Iterar sobre cada pregunta de la encuesta
    for (const pregunta of surveyData.preguntas) {
        // console.log(`Obteniendo reporte de pregunta ${pregunta.id}: ${pregunta.textoPregunta}`);
        // Llamar a la API por cada pregunta
        if (pregunta.tipoPregunta.toUpperCase() != "TEXTO_LIBRE") {
            const response = await getSurveyReport(
            dateFrom.value,    // Fecha desde
            dateTo.value,       // Fecha hasta
            pregunta.id,       // ID pregunta
            );
            
            const { data, status } = response;
            
            if (status === 200) {
                // Guardar el reporte completo
                allReports.push({
                    ...data.data,  // Toda la estructura de la API
                    // Datos adicionales calculados
                    kpis: calculateKPIs(data.data),
                    topFive: calculateTop5(data.data.datos),
                    topDays:calculateTopDays(data.data.datos)

                });
            }     
        }
       
    }
    questionsReports.value = allReports;

    console.log('Reportes cargados:', allReports);
    await nextTick();
    linearGraphic()
    donnaGraphic()
    barsGraphic()
    // tableDetails()
    } catch (error) {
        console.error('Error al obtener reportes:', error);
        alertError('Error al cargar los reportes');
    } finally {

    }

}
const calculateKPIs = (reportData) => {
    const { datos, opciones, totalRespuestas } = reportData;
    
    // Separar fila de totales del resto
    const datosDiarios = datos.filter(d => d.fecha !== 'Total');
    
    const totales = datos.find(d => d.fecha === 'Total');
    
    // Calcular promedio diario
    const diasConDatos = datosDiarios.filter(d => d.total > 0).length;
    const promedioDiario = diasConDatos > 0 
        ? Math.round(totalRespuestas / diasConDatos) 
        : 0;
    
    // Encontrar día con mayor actividad
    const diaMaximo = datosDiarios.reduce((max, dia) => 
        dia.total > (max?.total || 0) ? dia : max
    , null);
    
    // Encontrar opción más seleccionada
    let opcionMasSeleccionada = '';
    let maxValor = 0;
    // console.log(opciones);
    for (const prop in totales) {
        if (prop != "fecha" && prop != "total") {
            if (totales[prop] > maxValor) {
                maxValor = totales[prop]
                opcionMasSeleccionada = prop
            }
        }
    }
    
    return {
        total: totalRespuestas,
        promedioDiario,
        diaMaximo: diaMaximo ? {
            fecha: diaMaximo.fecha,
            valor: diaMaximo.total
        } : null,
        opcionMasSeleccionada: {
            texto: opcionMasSeleccionada,
            cantidad: maxValor,
            porcentaje: totalRespuestas > 0 
                ? Math.round((maxValor / totalRespuestas) * 100) 
                : 0
        }
    };
}
const calculateTop5 = (datos) => {
     const totales = {};
    let granTotal = 0;
    
    // Encontrar la fila de totales
    const totalRow = datos.find(d => d.fecha === 'Total');
    
    if (totalRow) {
        Object.keys(totalRow).forEach(key => {
            if (key !== 'fecha' && key !== 'total') {
                totales[key] = totalRow[key];
                granTotal += totalRow[key];
            }
        });
    } else {
        datos.forEach(dia => {
            Object.keys(dia).forEach(key => {
                if (key !== 'fecha' && key !== 'total') {
                    totales[key] = (totales[key] || 0) + dia[key];
                    granTotal += dia[key];
                }
            });
        });
    }
    
    // Convertir a array con porcentajes
    const ranking = Object.entries(totales)
        .map(([nombre, cantidad]) => ({
            nombre: nombre,
            cantidad: cantidad,
            porcentaje: granTotal > 0 ? Math.round((cantidad / granTotal) * 100) : 0
        }))
        .sort((a, b) => b.cantidad - a.cantidad);
    
    return ranking.slice(0, 5);

}
const calculateTopDays = (datos) => {
   // Objeto para acumular totales por día de la semana
    const totalesPorDia = {
        'Monday': { total: 0, count: 0 },
        'Tuesday': { total: 0, count: 0 },
        'Wednesday': { total: 0, count: 0 },
        'Thursday': { total: 0, count: 0 },
        'Friday': { total: 0, count: 0 },
        'Saturday': { total: 0, count: 0 },
        'Sunday': { total: 0, count: 0 }
    };
    
    // Filtrar días válidos (excluir "Total" y días sin datos)
    const diasValidos = datos.filter(d => d.fecha !== 'Total' && d.total > 0);
    
    // Procesar cada día
    diasValidos.forEach(dia => {
        // Convertir fecha string a moment
        const fecha = moment(dia.fecha, 'DD/MM/YYYY');
        
        // Obtener nombre del día de la semana en español
        const diaSemana = fecha.format('dddd'); // "lunes", "martes", etc.
        
        // Capitalizar primera letra
        const diaCapitalizado = diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1);
        
        // Acumular totales
        if (totalesPorDia[diaCapitalizado]) {
            totalesPorDia[diaCapitalizado].total += dia.total;
            totalesPorDia[diaCapitalizado].count += 1;
        }
    });
    
    // Convertir a array y calcular promedios
    const resultados = Object.entries(totalesPorDia)
        .map(([dia, stats]) => ({
            dia: dia,
            total: stats.total,
            ocurrencias: stats.count,
            promedio: stats.count > 0 ? Math.round(stats.total / stats.count) : 0
        }))
        .sort((a, b) => b.promedio - a.promedio); // Ordenar por promedio
    
    return resultados;
}
const linearGraphic = () => {
    for (const q of questionsReports.value) {
        const chartId = `linearGraphic${q.pregunta.id}`;
        q.datos.pop()
        const days = q.datos.map(e => e.fecha)
        const resultPerDay = q.datos.map(e=>e.total)
        var option = {
            title: {
                text: 'Historico de encuestas'
            },
            tooltip: {
                trigger: 'axis'
            },
            legend: {},
            toolbox: {
                show: true,
                feature: {
                    dataZoom: {
                        yAxisIndex: 'none'
                    },
                    dataView: { readOnly: false },
                    magicType: { type: ['line', 'bar'] },
                    restore: {},
                    saveAsImage: {}
                }
            },
            xAxis: {
                type: 'category',
                boundaryGap: false,
                data: days
            },
            yAxis: {
                type: 'value',
                axisLabel: {
                    formatter: '{value} Total'
                }
            },
            series: [
                {
                    name: 'Encuestas realizadas',
                    type: 'line',
                    data: resultPerDay,
                    markPoint: {
                        data: [
                        { type: 'max', name: 'Max' },
                        { type: 'min', name: 'Min' }
                        ]
                    },
                    markLine: {
                        data: [{ type: 'average', name: 'Avg' }]
                    }
                },
                
            ]    
        }

        echarts.init(document.getElementById(chartId)).setOption(option);
    }

}

const donnaGraphic = () => {
    for (const q of questionsReports.value) {
        if (q.topFive.length == 0) {
            return
        }
        const chartId = `PieGraphic${q.pregunta.id}`;
        const dataGraphic = q.topFive.map(e=> {
            return {
                value:e.porcentaje,
                name: e.nombre
            }
        });
       
       var option = {
            title: {
                text: 'Top 5 mas seleccionados',
                subtext: 'Resultados en porcentaje (%)',
                left: 'center'
            },
            tooltip: {
                trigger: 'item'
            },
            legend: {
                orient: 'vertical',
                left: 'left'
            },
            series: [
                {
                name: 'Tramites',
                type: 'pie',
                radius: '50%',
                data: dataGraphic,
                emphasis: {
                    itemStyle: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
                }
            ]
        };
        echarts.init(document.getElementById(chartId)).setOption(option);
    }
}

const barsGraphic = () => {
    for (const q of questionsReports.value) {
        if (q.topDays.length == 0) {
            return
        }
        const chartId = `BarsGraphic${q.pregunta.id}`;
        const days = q.topDays.map(e=> e.dia);
        const total = q.topDays.map(e=> e.total);

    //    console.log(dataGraphic);

       var option = {
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                // Use axis to trigger tooltip
                type: 'shadow' // 'shadow' as default; can also be 'line' or 'shadow'
                }
            },
            legend: {},
            xAxis: {
                type: 'value'
            },
            yAxis: {
                type: 'category',
                data: days
            },
            series: [
                {
                name: 'Realizadas',
                type: 'bar',
                stack: 'total',
                label: {
                    show: true
                },
                emphasis: {
                    focus: 'series'
                },
                data: total
                },
                
            ]
        }
        echarts.init(document.getElementById(chartId)).setOption(option);

    }    
}
const isInfoCollapsed = ref(false);

const toggleInfoCollapse = () => {
    isInfoCollapsed.value = !isInfoCollapsed.value;
};

const formatDate = (date) => {
    return moment(date).format('DD/MM/YYYY HH:mm');
};
</script>
<template>
    <ContainerCustom 
        title="Encuestas/Detalle" 
        subtitle="Detalles de las encuestas y resultados" 
        :loading="isloading"
        icon="file_present"
        :width="95"
    >
        <template #body>
            <!-- Información de la encuesta - Colapsable -->
            <div class="survey-info-wrapper">
                <div class="info-card-collapsible" :class="{ 'collapsed': isInfoCollapsed }">
                    <!-- Header con botón de colapsar -->
                    <div class="info-header" @click="toggleInfoCollapse">
                        <div class="header-left">
                            <span class="material-icons info-icon">poll</span>
                            <h3 class="info-title">Información de la Encuesta</h3>
                            <span class="info-badge">{{ surveyData.totalpreguntas }} preguntas</span>
                        </div>
                        <button class="collapse-btn" type="button">
                            <span class="material-icons">
                                {{ isInfoCollapsed ? 'expand_more' : 'expand_less' }}
                            </span>
                        </button>
                    </div>

                        <!-- Contenido colapsable -->
                        <Transition name="collapse">
                            <div v-show="!isInfoCollapsed" class="info-content">
                                <div class="info-grid">
                                    <!-- ID -->
                                    <div class="info-item">
                                        <div class="info-item-header">
                                            <span class="material-icons item-icon">tag</span>
                                            <span class="item-label">ID de la Encuesta</span>
                                    </div>
                                        <span class="item-value">#{{ surveyData.id }}</span>
                                    </div>

                                    <!-- Título -->
                                    <div class="info-item">
                                        <div class="info-item-header">
                                            <span class="material-icons item-icon">title</span>
                                            <span class="item-label">Título</span>
                                        </div>
                                        <span class="item-value">{{ surveyData.titulo }}</span>
                                    </div>
                                     <!-- Creador -->
                                    <div class="info-item">
                                        <div class="info-item-header">
                                            <span class="material-icons item-icon">person</span>
                                            <span class="item-label">Creada por</span>
                                        </div>
                                        <span class="item-value">{{ surveyData.nombreCreador }}</span>
                                    </div>
                                    <!-- Fecha de creación -->
                                    <div class="info-item">
                                        <div class="info-item-header">
                                            <span class="material-icons item-icon">calendar_today</span>
                                            <span class="item-label">Fecha de Creación</span>
                                        </div>
                                        <span class="item-value">{{ formatDate(surveyData.fechaCreacion) }}</span>
                                    </div>
                                    <!-- Descripción -->
                                    <div class="info-item full-width">
                                        <div class="info-item-header">
                                            <span class="material-icons item-icon">description</span>
                                            <span class="item-label">Descripción</span>
                                        </div>
                                        <span class="item-value description-text">{{ surveyData.descripcion }}</span>
                                    </div>

                                   

                                   

                                    <!-- Permisos -->
                                    <div class="info-item full-width">
                                        <div class="info-item-header">
                                            <span class="material-icons item-icon">group</span>
                                            <span class="item-label">Permisos de Acceso</span>
                                        </div>
                                        <div class="permissions-tags">
                                            <span 
                                                v-if="surveyData.permitirAsesor" 
                                                class="permission-tag tag-asesor"
                                            >
                                                <span class="material-icons">check_circle</span>
                                                Asesores
                                            </span>
                                            <span 
                                                v-if="surveyData.permitirFacilitador" 
                                                class="permission-tag tag-facilitador"
                                            >
                                                <span class="material-icons">check_circle</span>
                                                Facilitadores
                                            </span>
                                            <span 
                                                v-if="!surveyData.permitirAsesor && !surveyData.permitirFacilitador" 
                                                class="permission-tag tag-none"
                                            >
                                                <span class="material-icons">block</span>
                                                Sin permisos asignados
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Transition>
                </div>
            </div>

           <div class="generate-report-section">
                <div class="report-card">
                    <div class="report-header">
                        <div class="header-content">
                            <span class="material-icons header-icon">analytics</span>
                            <div class="header-text">
                                <h3 class="header-title">Generar Reporte</h3>
                                <p class="header-subtitle">Selecciona el rango de fechas para visualizar los resultados</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="report-content">
                        <div class="date-inputs-row">
                            <!-- Input Fecha Desde -->
                            <div class="date-input-group">
                                <label class="date-label">
                                    <span class="material-icons label-icon">event</span>
                                    <span class="label-text">Desde</span>
                                </label>
                                <div class="date-input-wrapper">
                                    <input
                                        type="date"
                                        class="date-input"
                                        v-model="dateFrom"
                                    />
                                </div>
                            </div>
                            
                            <!-- Separador -->
                            <div class="date-separator">
                                <span class="material-icons">arrow_forward</span>
                            </div>
                            
                            <!-- Input Fecha Hasta -->
                            <div class="date-input-group">
                                <label class="date-label">
                                    <span class="material-icons label-icon">event</span>
                                    <span class="label-text">Hasta</span>
                                </label>
                                <div class="date-input-wrapper">
                                    <input
                                        type="date"
                                        class="date-input"
                                        v-model="dateTo"
                                    />
                                </div>
                            </div>
                            
                            <!-- Botón Generar -->
                            <div class="generate-button-wrapper">
                                <ModernButton 
                                    color="blue" 
                                    :function="getReportInfo"
                                    :disabled="isLoadingReport || !dateFrom || !dateTo"
                                    tooltip="Generar reporte con el rango seleccionado"
                                >
                                    <LoaderBtn v-if="isLoadingReport" />
                                    <span v-else class="material-icons">auto_graph</span>
                                    {{ isLoadingReport ? 'Generando...' : 'Generar Reporte' }}
                                </ModernButton>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

               <!-- Sección de Reportes por Pregunta -->
            <div class="reports-section">
                <!-- Iterar sobre cada pregunta -->
                <div 
                    v-for="(report, index) in questionsReports" 
                    :key="report.pregunta.id"
                    class="question-report-wrapper"
                >
                    <!-- Card colapsable por pregunta -->
                    <div class="question-report-card" :class="{ 'collapsed': collapsedQuestions[index] }">
                        
                        <!-- Header de la pregunta -->
                        <div class="question-header" @click="toggleQuestion(index)">
                            <div class="header-left">
                                <div class="question-number">
                                    <span class="number-text">{{ index + 1 }}</span>
                                </div>
                                <div class="question-info">
                                    <h3 class="question-title">{{ report.pregunta.texto }}</h3>
                                    <span class="question-meta">
                                        <span class="material-icons">help_outline</span>
                                        {{ formatQuestionType(report.pregunta.tipoPregunta) }}
                                        · {{ report.totalRespuestas }} respuestas
                                    </span>
                                </div>
                            </div>
                            <button class="toggle-btn" type="button">
                                <span class="material-icons">
                                    {{ collapsedQuestions[index] ? 'expand_more' : 'expand_less' }}
                                </span>
                            </button>
                        </div>

                        <!-- Contenido colapsable -->
                        <Transition name="collapse">
                            <div v-show="!collapsedQuestions[index]" class="question-content">
                                
                                <!-- KPIs Cards -->
                                <div class="kpis-section">
                                    <div class="kpis-grid">
                                        <!-- KPI 1: Total de Respuestas -->
                                        <div class="kpi-card kpi-primary">
                                            <div class="kpi-icon">
                                                <span class="material-icons">assessment</span>
                                            </div>
                                            <div class="kpi-content">
                                                <span class="kpi-label">Total Respuestas</span>
                                                <span class="kpi-value">{{ report.kpis?.total || 0 }}</span>
                                            </div>
                                        </div>

                                        <!-- KPI 2: Promedio Diario -->
                                        <div class="kpi-card kpi-success">
                                            <div class="kpi-icon">
                                                <span class="material-icons">trending_up</span>
                                            </div>
                                            <div class="kpi-content">
                                                <span class="kpi-label">Promedio Diario</span>
                                                <span class="kpi-value">{{ report.kpis?.promedioDiario || 0 }}</span>
                                            </div>
                                        </div>

                                        <!-- KPI 3: Día Máximo -->
                                        <div class="kpi-card kpi-warning">
                                            <div class="kpi-icon">
                                                <span class="material-icons">event</span>
                                            </div>
                                            <div class="kpi-content">
                                                <span class="kpi-label">Día con Mayor Actividad</span>
                                                <span class="kpi-value">
                                                    {{ report.kpis?.diaMaximo?.fecha || 'N/A' }}
                                                </span>
                                                <span class="kpi-subtitle">
                                                    {{ report.kpis?.diaMaximo?.valor || 0 }} respuestas
                                                </span>
                                            </div>
                                        </div>

                                        <!-- KPI 4: Opción más seleccionada -->
                                        <div class="kpi-card kpi-info">
                                            <div class="kpi-icon">
                                                <span class="material-icons">star</span>
                                            </div>
                                            <div class="kpi-content">
                                                <span class="kpi-label">Más Seleccionada</span>
                                                <span class="kpi-value truncate">
                                                    {{ report.kpis?.opcionMasSeleccionada?.texto || 'N/A' }}
                                                </span>
                                                <span class="kpi-subtitle">
                                                    {{ report.kpis?.opcionMasSeleccionada?.porcentaje || 0 }}% 
                                                    ({{ report.kpis?.opcionMasSeleccionada?.cantidad || 0 }})
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Gráfica Principal: Líneas (Evolución Temporal) -->
                                <div class="chart-section">
                                    <div class="chart-container chart-main">
                                        <div class="chart-header">
                                            <h4 class="chart-title">
                                                <span class="material-icons">show_chart</span>
                                                Evolución Temporal
                                            </h4>
                                        </div>
                                        <div class="chart-placeholder">
                                            <!-- Aquí irá la gráfica de líneas (Recharts) -->
                                            <!-- <div class="placeholder-content">
                                                <span class="material-icons">insert_chart</span>
                                                <p>Gráfica de líneas</p>
                                            </div> -->
                                            <div :id="`linearGraphic${report.pregunta.id}`"  style=" width: 100%; height: 500px;"></div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Sección Inferior: Dos columnas -->
                                <div class="charts-row">
                                    <!-- Gráfica de Barras Verticales -->
                                    <div class="chart-container chart-half">
                                        <div class="chart-header">
                                            <h4 class="chart-title">
                                                <span class="material-icons">bar_chart</span>
                                                Total por Categoría
                                            </h4>
                                        </div>
                                        <div class="chart-placeholder">
                                            <!-- Aquí irá la gráfica de barras verticales -->
                                            <!-- <div class="placeholder-content">
                                                <span class="material-icons">bar_chart</span>
                                                <p>Gráfica de barras</p>
                                            </div> -->
                                             <div :id="`BarsGraphic${report.pregunta.id}`"  style=" width: 100%; height: 500px;"></div>
                                        </div>
                                    </div>

                                    <!-- Gráfica de Dona -->
                                    <div class="chart-container chart-half">
                                        <div class="chart-header">
                                            <h4 class="chart-title">
                                                <span class="material-icons">donut_large</span>
                                                Distribución Porcentual
                                            </h4>
                                        </div>
                                        <div class="chart-placeholder">
                                            <!-- Aquí irá la gráfica de dona -->
                                            <!-- <div class="placeholder-content">
                                                <span class="material-icons">donut_large</span>
                                                <p>Gráfica de dona</p>
                                            </div> -->
                                             <div :id="`PieGraphic${report.pregunta.id}`"  style=" width: 100%; height: 500px;"></div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Tabla Detallada -->
                                <div class="table-section" v-if="false">
                                    <div class="table-header">
                                        <h4 class="table-title">
                                            <span class="material-icons">table_chart</span>
                                            Detalle por Día
                                        </h4>
                                        <ModernButton 
                                            color="green" 
                                            size="small"
                                            tooltip="Exportar a Excel"
                                        >
                                            <span class="material-icons">file_download</span>
                                            Exportar
                                        </ModernButton>
                                    </div>
                                    <div class="table-container">
                                        <!-- Aquí irá EasyDataTable -->

                                    </div>
                                </div>

                            </div>
                        </Transition>
                    </div>
                </div>

                <!-- Empty State -->
                <div v-if="questionsReports.length === 0 && !isLoadingReport" class="empty-reports">
                    <div class="empty-content">
                        <span class="material-icons empty-icon">analytics</span>
                        <h3>No hay reportes generados</h3>
                        <p>Selecciona un rango de fechas y haz clic en "Generar" para ver los resultados</p>
                    </div>
                </div>

                <!-- Loading State -->
                <div v-if="isLoadingReport" class="loading-reports">
                    <div class="loading-content">
                        <div class="loading-spinner"></div>
                        <p>Generando reportes...</p>
                    </div>
                </div>
            </div>

        </template>
        <template #footer>
            
        </template>
    </ContainerCustom>
</template>
<style scoped>
/* ===================================
   GENERATE REPORT SECTION
   =================================== */

.generate-report-section {
    margin-bottom: var(--spacing-2xl);
}

.report-card {
    background: var(--bg-glass);
    backdrop-filter: blur(20px);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius-lg);
    box-shadow: var(--shadow-md);
    overflow: hidden;
    transition: all var(--transition-normal);
}

.report-card:hover {
    box-shadow: var(--shadow-lg);
}

/* ===================================
   REPORT HEADER
   =================================== */

.report-header {
    background: var(--gradient-dark);
    padding: var(--spacing-xl) var(--spacing-2xl);
}

.header-content {
    display: flex;
    align-items: center;
    gap: var(--spacing-lg);
}

.header-icon {
    font-size: 32px;
    color: var(--text-white);
    padding: var(--spacing-md);
    background: rgba(255, 255, 255, 0.15);
    border-radius: var(--border-radius-md);
    backdrop-filter: blur(10px);
}

.header-text {
    flex: 1;
}

.header-title {
    margin: 0;
    font-size: var(--font-size-2xl);
    font-weight: var(--font-weight-bold);
    color: var(--text-white);
    line-height: 1.2;
}

.header-subtitle {
    margin: var(--spacing-xs) 0 0 0;
    font-size: var(--font-size-sm);
    color: rgba(255, 255, 255, 0.8);
    line-height: 1.4;
}

/* ===================================
   REPORT CONTENT
   =================================== */

.report-content {
    padding: var(--spacing-2xl);
}

.date-inputs-row {
    display: grid;
    grid-template-columns: 1fr auto 1fr auto;
    gap: var(--spacing-xl);
    align-items: end;
    margin-bottom: var(--spacing-xl);
}

/* ===================================
   DATE INPUT GROUP
   =================================== */

.date-input-group {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
}

.date-label {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-semibold);
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.label-icon {
    font-size: 16px;
    color: var(--primary-color);
}

.label-text {
    color: var(--text-primary);
}

.date-input-wrapper {
    position: relative;
}

.date-input {
    width: 100%;
    padding: var(--spacing-md) var(--spacing-lg);
    border: 2px solid var(--border-color-light);
    border-radius: var(--border-radius-md);
    font-size: var(--font-size-md);
    font-family: inherit;
    background: var(--bg-primary);
    color: var(--text-primary);
    transition: all var(--transition-fast);
    outline: none;
}

.date-input:hover {
    border-color: var(--border-color-medium);
}

.date-input:focus {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.date-input:disabled {
    background: var(--bg-tertiary);
    cursor: not-allowed;
    opacity: 0.6;
}

/* ===================================
   DATE SEPARATOR
   =================================== */

.date-separator {
    display: flex;
    align-items: center;
    justify-content: center;
    padding-bottom: var(--spacing-sm);
}

.date-separator .material-icons {
    font-size: 24px;
    color: var(--text-tertiary);
}

/* ===================================
   GENERATE BUTTON
   =================================== */

.generate-button-wrapper {
    display: flex;
    align-items: flex-end;
}

.generate-button-wrapper :deep(.modern-btn) {
    width: 100%;
    min-width: 180px;
}

/* ===================================
   RESPONSIVE
   =================================== */

@media (max-width: 1024px) {
    .date-inputs-row {
        grid-template-columns: 1fr auto 1fr;
        gap: var(--spacing-lg);
    }
    
    .generate-button-wrapper {
        grid-column: 1 / -1;
    }
    
    .generate-button-wrapper :deep(.modern-btn) {
        width: 100%;
    }
}

@media (max-width: 768px) {
    .report-header {
        padding: var(--spacing-lg);
    }
    
    .header-icon {
        font-size: 24px;
        padding: var(--spacing-sm);
    }
    
    .header-title {
        font-size: var(--font-size-xl);
    }
    
    .header-subtitle {
        font-size: var(--font-size-xs);
    }
    
    .report-content {
        padding: var(--spacing-lg);
    }
    
    .date-inputs-row {
        grid-template-columns: 1fr;
        gap: var(--spacing-md);
    }
    
    .date-separator {
        display: none;
    }
    
    .generate-button-wrapper {
        grid-column: 1;
    }
}

@media (max-width: 480px) {
    .report-header {
        padding: var(--spacing-md);
    }
    
    .header-content {
        gap: var(--spacing-md);
    }
    
    .report-content {
        padding: var(--spacing-md);
    }
    
    .date-input {
        padding: var(--spacing-sm) var(--spacing-md);
        font-size: var(--font-size-sm);
    }
    
    .report-info {
        padding: var(--spacing-md);
    }
}

/* ===================================
   DARK MODE
   =================================== */

@media (prefers-color-scheme: dark) {
    .report-card {
        background: var(--bg-dark);
        border-color: var(--border-color-medium);
    }
    
    .header-title {
        color: #e2e8f0;
    }
    
    .header-subtitle {
        color: #cbd5e0;
    }
    
    .date-input {
        background: #1a202c;
        border-color: #2d3748;
        color: #e2e8f0;
    }
    
    .date-input:hover {
        border-color: #4a5568;
    }
    
    .date-input:focus {
        border-color: var(--primary-light);
    }
    
    .report-info {
        background: #1a202c;
        border-left-color: var(--primary-light);
    }
    
    .info-item {
        color: #cbd5e0;
    }
    
    .label-text {
        color: #cbd5e0;
    }
}

/* ===================================
   CALENDAR ICON STYLING
   =================================== */

/* Ocultar el icono nativo del calendario en algunos navegadores */
.date-input::-webkit-calendar-picker-indicator {
    cursor: pointer;
    filter: invert(0.5);
}

.date-input::-webkit-calendar-picker-indicator:hover {
    filter: invert(0.3);
}

@media (prefers-color-scheme: dark) {
    .date-input::-webkit-calendar-picker-indicator {
        filter: invert(0.8);
    }
    
    .date-input::-webkit-calendar-picker-indicator:hover {
        filter: invert(1);
    }
}
/* ===================================
   REPORTS SECTION
   =================================== */

.reports-section {
    margin-top: var(--spacing-2xl);
}

.question-report-wrapper {
    margin-bottom: var(--spacing-2xl);
}

/* ===================================
   QUESTION REPORT CARD
   =================================== */

.question-report-card {
    background: var(--bg-glass);
    backdrop-filter: blur(20px);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius-lg);
    box-shadow: var(--shadow-md);
    overflow: hidden;
    transition: all var(--transition-normal);
}

.question-report-card:hover {
    box-shadow: var(--shadow-lg);
}

.question-report-card.collapsed {
    box-shadow: var(--shadow-sm);
}

/* ===================================
   QUESTION HEADER
   =================================== */

.question-header {
    background: var(--gradient-secondary);
    color: var(--text-white);
    padding: var(--spacing-lg) var(--spacing-2xl);
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    user-select: none;
    transition: all var(--transition-fast);
}

.question-header:hover {
    background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
}

.question-header:active {
    transform: scale(0.99);
}

.header-left {
    display: flex;
    align-items: center;
    gap: var(--spacing-lg);
    flex: 1;
}

.question-number {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    backdrop-filter: blur(10px);
}

.number-text {
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-bold);
}

.question-info {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
    flex: 1;
}

.question-title {
    margin: 0;
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-semibold);
    line-height: 1.3;
}

.question-meta {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    font-size: var(--font-size-sm);
    opacity: 0.9;
}

.question-meta .material-icons {
    font-size: 16px;
}

.toggle-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    background: rgba(255, 255, 255, 0.15);
    border: none;
    border-radius: var(--border-radius-sm);
    color: var(--text-white);
    cursor: pointer;
    transition: all var(--transition-fast);
}

.toggle-btn:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: scale(1.05);
}

.toggle-btn .material-icons {
    font-size: 20px;
}

/* ===================================
   QUESTION CONTENT
   =================================== */

.question-content {
    padding: var(--spacing-2xl);
}

/* ===================================
   KPIs SECTION
   =================================== */

.kpis-section {
    margin-bottom: var(--spacing-2xl);
}

.kpis-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: var(--spacing-lg);
}

.kpi-card {
    display: flex;
    align-items: center;
    gap: var(--spacing-lg);
    padding: var(--spacing-xl);
    border-radius: var(--border-radius-md);
    background: var(--bg-secondary);
    border: 1px solid var(--border-color-light);
    transition: all var(--transition-fast);
    position: relative;
    overflow: hidden;
}

.kpi-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: currentColor;
}

.kpi-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-md);
}

/* KPI Variants */
.kpi-primary {
    color: var(--primary-color);
}

.kpi-success {
    color: var(--success-color);
}

.kpi-warning {
    color: var(--warning-color);
}

.kpi-info {
    color: var(--info-color);
}

.kpi-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 56px;
    height: 56px;
    border-radius: var(--border-radius-md);
    background: var(--gradient-secondary);
    color: var(--text-white);
    flex-shrink: 0;
}

.kpi-icon .material-icons {
    font-size: 28px;
}

.kpi-content {
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex: 1;
    min-width: 0;
}

.kpi-label {
    font-size: var(--font-size-xs);
    color: var(--text-tertiary);
    font-weight: var(--font-weight-semibold);
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.kpi-value {
    font-size: var(--font-size-2xl);
    color: var(--text-primary);
    font-weight: var(--font-weight-bold);
    line-height: 1.2;
}

.kpi-value.truncate {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.kpi-subtitle {
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
    font-weight: var(--font-weight-medium);
}

/* ===================================
   CHARTS SECTION
   =================================== */

.chart-section {
    margin-bottom: var(--spacing-2xl);
}

.charts-row {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-lg);
    margin-bottom: var(--spacing-2xl);
}

.chart-container {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color-light);
    border-radius: var(--border-radius-md);
    overflow: hidden;
}

.chart-main {
    min-height: 400px;
}

.chart-half {
    min-height: 350px;
}

.chart-header {
    padding: var(--spacing-lg) var(--spacing-xl);
    border-bottom: 1px solid var(--border-color-light);
    background: var(--bg-primary);
}

.chart-title {
    margin: 0;
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-semibold);
    color: var(--text-primary);
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
}

.chart-title .material-icons {
    font-size: 20px;
    color: var(--primary-color);
}

.chart-placeholder {
    padding: var(--spacing-3xl);
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 300px;
}

.placeholder-content {
    text-align: center;
    color: var(--text-tertiary);
}

.placeholder-content .material-icons {
    font-size: 64px;
    opacity: 0.3;
    margin-bottom: var(--spacing-md);
}

.placeholder-content p {
    margin: 0;
    font-size: var(--font-size-sm);
}

/* ===================================
   TABLE SECTION
   =================================== */

.table-section {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color-light);
    border-radius: var(--border-radius-md);
    overflow: hidden;
}

.table-header {
    padding: var(--spacing-lg) var(--spacing-xl);
    border-bottom: 1px solid var(--border-color-light);
    background: var(--bg-primary);
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.table-title {
    margin: 0;
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-semibold);
    color: var(--text-primary);
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
}

.table-title .material-icons {
    font-size: 20px;
    color: var(--primary-color);
}

.table-container {
    padding: var(--spacing-xl);
}

.table-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 250px;
    color: var(--text-tertiary);
}

.table-placeholder .material-icons {
    font-size: 64px;
    opacity: 0.3;
    margin-bottom: var(--spacing-md);
}

.table-placeholder p {
    margin: 0;
    font-size: var(--font-size-sm);
}

/* ===================================
   EMPTY & LOADING STATES
   =================================== */

.empty-reports,
.loading-reports {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 400px;
    background: var(--bg-secondary);
    border-radius: var(--border-radius-lg);
    border: 2px dashed var(--border-color-medium);
}

.empty-content,
.loading-content {
    text-align: center;
    padding: var(--spacing-3xl);
}

.empty-icon {
    font-size: 80px;
    color: var(--text-light);
    margin-bottom: var(--spacing-lg);
}

.empty-content h3 {
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-semibold);
    color: var(--text-primary);
    margin: 0 0 var(--spacing-sm) 0;
}

.empty-content p {
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
    margin: 0;
    max-width: 400px;
}

.loading-spinner {
    width: 48px;
    height: 48px;
    border: 4px solid var(--border-color-light);
    border-top: 4px solid var(--primary-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto var(--spacing-lg);
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.loading-content p {
    margin: 0;
    font-size: var(--font-size-md);
    color: var(--text-secondary);
    font-weight: var(--font-weight-medium);
}

/* ===================================
   COLLAPSE TRANSITION
   =================================== */

.collapse-enter-active,
.collapse-leave-active {
    transition: all var(--transition-normal);
    overflow: hidden;
}

.collapse-enter-from,
.collapse-leave-to {
    opacity: 0;
    max-height: 0;
    padding-top: 0;
    padding-bottom: 0;
}

.collapse-enter-to,
.collapse-leave-from {
    opacity: 1;
    max-height: 5000px;
}

/* ===================================
   RESPONSIVE
   =================================== */

@media (max-width: 1200px) {
    .kpis-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (max-width: 768px) {
    .question-header {
        padding: var(--spacing-md) var(--spacing-lg);
    }

    .header-left {
        gap: var(--spacing-md);
    }

    .question-number {
        width: 40px;
        height: 40px;
    }

    .number-text {
        font-size: var(--font-size-lg);
    }

    .question-title {
        font-size: var(--font-size-lg);
    }

    .question-content {
        padding: var(--spacing-lg);
    }

    .kpis-grid {
        grid-template-columns: 1fr;
    }

    .charts-row {
        grid-template-columns: 1fr;
    }

    .chart-main,
    .chart-half {
        min-height: 300px;
    }

    .chart-placeholder {
        padding: var(--spacing-xl);
        min-height: 200px;
    }

    .table-header {
        flex-direction: column;
        align-items: flex-start;
        gap: var(--spacing-md);
    }
}

@media (max-width: 480px) {
    .question-header {
        padding: var(--spacing-sm) var(--spacing-md);
    }

    .question-title {
        font-size: var(--font-size-md);
    }

    .question-content {
        padding: var(--spacing-md);
    }

    .kpi-card {
        padding: var(--spacing-lg);
    }

    .kpi-icon {
        width: 48px;
        height: 48px;
    }

    .kpi-icon .material-icons {
        font-size: 24px;
    }

    .kpi-value {
        font-size: var(--font-size-xl);
    }

    .chart-header,
    .table-header {
        padding: var(--spacing-md);
    }
}

/* ===================================
   DARK MODE
   =================================== */

/* @media (prefers-color-scheme: dark) {
    .question-report-card {
        background: var(--bg-dark);
        border-color: var(--border-color-medium);
    }

    .kpi-card,
    .chart-container,
    .table-section {
        background: #1a202c;
        border-color: #2d3748;
    }

    .chart-header,
    .table-header {
        background: #2d3748;
        border-color: #4a5568;
    }

    .chart-title,
    .table-title {
        color: #e2e8f0;
    }

    .kpi-value {
        color: #e2e8f0;
    }

    .kpi-label,
    .kpi-subtitle {
        color: #a0aec0;
    }
    .kpi-icon{
        background: var(--bg-dark);
        color: white;
    }
    .empty-reports,
    .loading-reports {
        background: var(--bg-dark);
        border-color: var(--border-color-medium);
    }

    .empty-content h3 {
        color: #e2e8f0;
    }

    .empty-content p,
    .loading-content p {
        color: #a0aec0;
    }
} */
/* ===================================
   SURVEY INFO WRAPPER
   =================================== */

.survey-info-wrapper {
    margin-bottom: var(--spacing-2xl);
}

.info-card-collapsible {
    background: var(--bg-glass);
    backdrop-filter: blur(20px);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius-lg);
    box-shadow: var(--shadow-md);
    overflow: hidden;
    transition: all var(--transition-normal);
}

.info-card-collapsible:hover {
    box-shadow: var(--shadow-lg);
}

.info-card-collapsible.collapsed {
    box-shadow: var(--shadow-sm);
}

/* ===================================
   INFO HEADER
   =================================== */

.info-header {
    background: var(--gradient-primary);
    color: var(--text-white);
    padding: var(--spacing-lg) var(--spacing-2xl);
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    user-select: none;
    transition: all var(--transition-fast);
}

.info-header:hover {
    background: linear-gradient(135deg, #0066ff 0%, #004ccf 100%);
}

.info-header:active {
    transform: scale(0.99);
}

.header-left {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    flex: 1;
}

.info-icon {
    font-size: 24px;
}

.info-title {
    margin: 0;
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-semibold);
}

.info-badge {
    display: inline-flex;
    align-items: center;
    padding: 4px 12px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 20px;
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-semibold);
    backdrop-filter: blur(10px);
}

.collapse-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    background: rgba(255, 255, 255, 0.15);
    border: none;
    border-radius: var(--border-radius-sm);
    color: var(--text-white);
    cursor: pointer;
    transition: all var(--transition-fast);
}

.collapse-btn:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: scale(1.05);
}

.collapse-btn .material-icons {
    font-size: 20px;
    transition: transform var(--transition-normal);
}

.info-card-collapsible.collapsed .collapse-btn .material-icons {
    transform: rotate(0deg);
}

/* ===================================
   INFO CONTENT
   =================================== */

.info-content {
    padding: var(--spacing-2xl);
}

.info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: var(--spacing-lg);
}

.info-item {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
    padding: var(--spacing-lg);
    background: var(--bg-secondary);
    border-radius: var(--border-radius-md);
    border: 1px solid var(--border-color-light);
    transition: all var(--transition-fast);
}

.info-item:hover {
    background: var(--bg-tertiary);
    border-color: var(--primary-color);
    transform: translateY(-2px);
    box-shadow: var(--shadow-sm);
}

.info-item.full-width {
    grid-column: 1 / -1;
}

.info-item-header {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
}

.item-icon {
    font-size: 18px;
    color: var(--primary-color);
}

.item-label {
    font-size: var(--font-size-xs);
    color: var(--text-tertiary);
    font-weight: var(--font-weight-semibold);
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.item-value {
    font-size: var(--font-size-md);
    color: var(--text-primary);
    font-weight: var(--font-weight-medium);
    line-height: 1.5;
}

.description-text {
    line-height: 1.6;
}

/* ===================================
   PERMISSIONS TAGS
   =================================== */

.permissions-tags {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-sm);
    margin-top: var(--spacing-xs);
}

.permission-tag {
    display: inline-flex;
    align-items: center;
    gap: var(--spacing-xs);
    padding: var(--spacing-sm) var(--spacing-md);
    border-radius: 20px;
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-semibold);
    transition: all var(--transition-fast);
}

.permission-tag .material-icons {
    font-size: 16px;
}

.tag-asesor {
    background: rgba(33, 150, 243, 0.1);
    color: var(--info-color);
    border: 1px solid var(--info-light);
}

.tag-asesor:hover {
    background: rgba(33, 150, 243, 0.2);
}

.tag-facilitador {
    background: rgba(76, 175, 80, 0.1);
    color: var(--success-color);
    border: 1px solid var(--success-light);
}

.tag-facilitador:hover {
    background: rgba(76, 175, 80, 0.2);
}

.tag-none {
    background: rgba(158, 158, 158, 0.1);
    color: var(--text-tertiary);
    border: 1px solid var(--border-color-medium);
}

/* ===================================
   COLLAPSE TRANSITION
   =================================== */

.collapse-enter-active,
.collapse-leave-active {
    transition: all var(--transition-normal);
    overflow: hidden;
}

.collapse-enter-from,
.collapse-leave-to {
    opacity: 0;
    max-height: 0;
    padding-top: 0;
    padding-bottom: 0;
}

.collapse-enter-to,
.collapse-leave-from {
    opacity: 1;
    max-height: 1000px;
}

/* ===================================
   RESPONSIVE
   =================================== */

@media (max-width: 768px) {
    .info-header {
        padding: var(--spacing-md) var(--spacing-lg);
    }

    .header-left {
        gap: var(--spacing-sm);
    }

    .info-icon {
        font-size: 20px;
    }

    .info-title {
        font-size: var(--font-size-lg);
    }

    .info-badge {
        display: none;
    }

    .info-content {
        padding: var(--spacing-lg);
    }

    .info-grid {
        grid-template-columns: 1fr;
        gap: var(--spacing-md);
    }

    .info-item {
        padding: var(--spacing-md);
    }
}

@media (max-width: 480px) {
    .info-header {
        padding: var(--spacing-sm) var(--spacing-md);
    }

    .info-title {
        font-size: var(--font-size-md);
    }

    .collapse-btn {
        width: 32px;
        height: 32px;
    }

    .info-content {
        padding: var(--spacing-md);
    }

    .permissions-tags {
        flex-direction: column;
    }

    .permission-tag {
        width: 100%;
        justify-content: center;
    }
}

/* ===================================
   DARK MODE
   =================================== */

@media (prefers-color-scheme: dark) {
    .info-card-collapsible {
        background: var(--bg-dark);
        border-color: var(--border-color-medium);
    }

    .info-item {
        background: #1a202c;
        border-color: #2d3748;
    }

    .info-item:hover {
        background: #2d3748;
        border-color: var(--primary-light);
    }

    .item-value {
        color: #87898b;
    }

    .description-text {
        color: #76787a;
    }
}
/* =========================== */
/* input dates */
/* =========================== */
.date-input-group {
    flex: 1;
    min-width: 200px;
}

/* Información de la encuesta */
.form-info-section {
    margin-bottom: 32px;
}

.info-card {
    background: rgba(255, 255, 255, 0.98);
    backdrop-filter: blur(20px);
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    overflow: hidden;
    transition: all 0.3s ease;
}

.info-card:hover {
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
    transform: translateY(-2px);
}

.info-header {
    background: var(--gradient-dark);
    color: white;
    padding: 20px 24px;
    display: flex;
    align-items: center;
    gap: 12px;
}

.info-icon {
    font-size: 24px;
}

.info-title {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
}

.info-content {
    padding: 24px;
}

.info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
}

.info-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 16px;
    background: #f8fafc;
    border-radius: 10px;
    border: 1px solid #e2e8f0;
}

.info-item .material-icons {
    font-size: 20px;
    color: #667eea;
    margin-top: 2px;
    flex-shrink: 0;
}

.info-details {
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex: 1;
}

.info-label {
    font-size: 12px;
    font-weight: 600;
    color: #4a5568;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.info-value {
    font-size: 15px;
    color: #1a202c;
    font-weight: 500;
    line-height: 1.4;
}
</style>