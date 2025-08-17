import healthMetricsData from "@/services/mockData/healthMetrics.json";

let healthMetrics = [...healthMetricsData];

export const healthMetricsService = {
  async getHealthMetrics() {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const userMetrics = healthMetrics.filter(hm => hm.user_id === 1);
    
    const result = {
      day0: null,
      day21: null
    };
    
    // Find inicio and fin metrics
    userMetrics.forEach(metric => {
      if (metric.phase === "inicio") {
        result.day0 = metric;
      } else if (metric.phase === "fin") {
        result.day21 = metric;
      }
    });
    
    return JSON.parse(JSON.stringify(result));
  },

async createHealthMetrics(metricsData) {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const maxId = healthMetrics.length > 0 ? Math.max(...healthMetrics.map(hm => hm.Id)) : 0;
    
    // Calculate BMI if weight and height provided
    let imc = null;
    if (metricsData.peso_kg && metricsData.estatura_cm) {
      const heightInMeters = metricsData.estatura_cm / 100;
      imc = Number((metricsData.peso_kg / (heightInMeters * heightInMeters)).toFixed(1));
    } else if (metricsData.peso_kg && metricsData.phase === "fin") {
      // For final metrics, try to get height from initial metrics
      const initialMetrics = healthMetrics.find(hm => hm.user_id === 1 && hm.phase === "inicio");
      if (initialMetrics && initialMetrics.estatura_cm) {
        const heightInMeters = initialMetrics.estatura_cm / 100;
        imc = Number((metricsData.peso_kg / (heightInMeters * heightInMeters)).toFixed(1));
      }
    }
    
    const newMetrics = {
      Id: maxId + 1,
      user_id: 1,
      cohort_id: 1,
      phase: metricsData.phase || "inicio",
      peso_kg: metricsData.peso_kg,
      estatura_cm: metricsData.estatura_cm,
      edad_anios: metricsData.edad_anios,
      cintura_cm: metricsData.cintura_cm,
      cadera_cm: metricsData.cadera_cm,
      body_fat_pct: metricsData.body_fat_pct,
      muscle_pct: metricsData.muscle_pct,
      grasa_visceral: metricsData.grasa_visceral,
      edad_metabolica: metricsData.edad_metabolica,
      agua_vasos_promedio: metricsData.agua_vasos_promedio,
      pasos_promedio: metricsData.pasos_promedio,
      horas_sueno: metricsData.horas_sueno,
      cafeina_fuente: metricsData.cafeina_fuente,
      imc: imc,
      // Additional fields for final metrics
      energia_percibida: metricsData.energia_percibida,
      habitos_mantener: metricsData.habitos_mantener,
      satisfaccion_general: metricsData.satisfaccion_general,
      testimonio: metricsData.testimonio,
      permiso_uso_testimonio: metricsData.permiso_uso_testimonio,
      created_at: new Date().toISOString()
    };
    
    healthMetrics.push(newMetrics);
    return JSON.parse(JSON.stringify(newMetrics));
  },

  async updateHealthMetrics(phase, metricsData) {
    await new Promise(resolve => setTimeout(resolve, 350));
    
    const metricIndex = healthMetrics.findIndex(hm => hm.user_id === 1 && hm.phase === phase);
    
    if (metricIndex === -1) {
      // Create new metrics if not found
      return await this.createHealthMetrics({ phase, ...metricsData });
    }
    
    // Calculate BMI if weight and height provided
    let imc = healthMetrics[metricIndex].imc;
    if (metricsData.peso_kg && metricsData.estatura_cm) {
      const heightInMeters = metricsData.estatura_cm / 100;
      imc = Number((metricsData.peso_kg / (heightInMeters * heightInMeters)).toFixed(1));
    }
    
    healthMetrics[metricIndex] = {
      ...healthMetrics[metricIndex],
      ...metricsData,
      imc: imc,
      updated_at: new Date().toISOString()
    };
    
    return JSON.parse(JSON.stringify(healthMetrics[metricIndex]));
  },

  async getMetricsByPhase(phase) {
    await new Promise(resolve => setTimeout(resolve, 250));
    
    const metrics = healthMetrics.find(hm => hm.user_id === 1 && hm.phase === phase);
    if (!metrics) {
      return null;
    }
    
    return JSON.parse(JSON.stringify(metrics));
  },

  async getMetricsComparison() {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const inicio = healthMetrics.find(hm => hm.user_id === 1 && hm.phase === "inicio");
    const fin = healthMetrics.find(hm => hm.user_id === 1 && hm.phase === "fin");
    
    const comparison = {
      hasInicio: !!inicio,
      hasFin: !!fin,
      changes: {}
    };
    
    if (inicio && fin) {
      const metrics = ["peso_kg", "cintura_cm", "cadera_cm", "body_fat_pct", "muscle_pct", "grasa_visceral", "edad_metabolica", "imc"];
      
      metrics.forEach(metric => {
        if (inicio[metric] !== undefined && fin[metric] !== undefined) {
          const change = fin[metric] - inicio[metric];
          const percentage = Math.abs((change / inicio[metric]) * 100);
          
          comparison.changes[metric] = {
            initial: inicio[metric],
            final: fin[metric], 
            change,
            percentage: percentage.toFixed(1),
            improved: ["peso_kg", "cintura_cm", "cadera_cm", "body_fat_pct", "grasa_visceral", "edad_metabolica", "imc"].includes(metric) ? change < 0 : change > 0
          };
        }
      });
    }
    
    return JSON.parse(JSON.stringify(comparison));
  },

  async deleteHealthMetrics(phase) {
    await new Promise(resolve => setTimeout(resolve, 250));
    
    const metricIndex = healthMetrics.findIndex(hm => hm.user_id === 1 && hm.phase === phase);
    if (metricIndex === -1) {
      throw new Error(`Métricas de la fase ${phase} no encontradas`);
    }
    
    healthMetrics.splice(metricIndex, 1);
    return true;
  },

  calculateBMI(peso_kg, estatura_cm) {
    if (!peso_kg || !estatura_cm) return null;
    const heightInMeters = estatura_cm / 100;
    return Number((peso_kg / (heightInMeters * heightInMeters)).toFixed(1));
  }
};