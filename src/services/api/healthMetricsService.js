import { apperService } from "@/services/api/apperService";

// Health metrics service now uses Apper database

export const healthMetricsService = {
  async getHealthMetrics(userId = null) {
    try {
      const targetUserId = userId || parseInt(localStorage.getItem('reto21d_userId') || '1');
      const userMetrics = await apperService.findWhere(apperService.tables.healthMetrics, { user_id: targetUserId });
      
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
      
      return result;
    } catch (error) {
      console.error('Error obteniendo métricas de salud:', error);
      throw error;
    }
  },

  async createHealthMetrics(metricsData) {
    try {
      const userId = parseInt(localStorage.getItem('reto21d_userId') || '1');
      
      // Calculate BMI if weight and height provided
      let imc = null;
      if (metricsData.peso_kg && metricsData.estatura_cm) {
        const heightInMeters = metricsData.estatura_cm / 100;
        imc = Number((metricsData.peso_kg / (heightInMeters * heightInMeters)).toFixed(1));
      } else if (metricsData.peso_kg && metricsData.phase === "fin") {
        // For final metrics, try to get height from initial metrics
        const initialMetrics = await apperService.findWhere(apperService.tables.healthMetrics, { 
          user_id: userId, 
          phase: "inicio" 
        });
        if (initialMetrics.length > 0 && initialMetrics[0].estatura_cm) {
          const heightInMeters = initialMetrics[0].estatura_cm / 100;
          imc = Number((metricsData.peso_kg / (heightInMeters * heightInMeters)).toFixed(1));
        }
      }
      
      const newMetrics = {
        user_id: userId,
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
      
      return await apperService.create(apperService.tables.healthMetrics, newMetrics);
    } catch (error) {
      console.error('Error creando métricas de salud:', error);
      throw error;
    }
  },

  async updateHealthMetrics(phase, metricsData) {
    try {
      const userId = parseInt(localStorage.getItem('reto21d_userId') || '1');
      const existingMetrics = await apperService.findWhere(apperService.tables.healthMetrics, { 
        user_id: userId, 
        phase 
      });
      
      if (existingMetrics.length === 0) {
        // Create new metrics if not found
        return await this.createHealthMetrics({ phase, ...metricsData });
      }
      
      // Calculate BMI if weight and height provided
      let imc = existingMetrics[0].imc;
      if (metricsData.peso_kg && metricsData.estatura_cm) {
        const heightInMeters = metricsData.estatura_cm / 100;
        imc = Number((metricsData.peso_kg / (heightInMeters * heightInMeters)).toFixed(1));
      } else if (metricsData.peso_kg && phase === "fin") {
        // For final metrics, try to get height from initial metrics
        const initialMetrics = await apperService.findWhere(apperService.tables.healthMetrics, { 
          user_id: userId, 
          phase: "inicio" 
        });
        if (initialMetrics.length > 0 && initialMetrics[0].estatura_cm) {
          const heightInMeters = initialMetrics[0].estatura_cm / 100;
          imc = Number((metricsData.peso_kg / (heightInMeters * heightInMeters)).toFixed(1));
        }
      }
      
      const updateData = {
        ...metricsData,
        imc: imc,
        updated_at: new Date().toISOString()
      };
      
      return await apperService.update(apperService.tables.healthMetrics, existingMetrics[0].Id, updateData);
    } catch (error) {
      console.error('Error actualizando métricas de salud:', error);
      throw error;
    }
  },

  async getMetricsByPhase(phase) {
    try {
      const userId = parseInt(localStorage.getItem('reto21d_userId') || '1');
      const metrics = await apperService.findWhere(apperService.tables.healthMetrics, { 
        user_id: userId, 
        phase 
      });
      
      return metrics.length > 0 ? metrics[0] : null;
    } catch (error) {
      console.error('Error obteniendo métricas por fase:', error);
      throw error;
    }
  },

  async getMetricsComparison() {
    try {
      const userId = parseInt(localStorage.getItem('reto21d_userId') || '1');
      const allMetrics = await apperService.findWhere(apperService.tables.healthMetrics, { user_id: userId });
      
      const inicio = allMetrics.find(hm => hm.phase === "inicio");
      const fin = allMetrics.find(hm => hm.phase === "fin");
      
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
      
      return comparison;
    } catch (error) {
      console.error('Error obteniendo comparación de métricas:', error);
      throw error;
    }
  },

  async deleteHealthMetrics(phase) {
    try {
      const userId = parseInt(localStorage.getItem('reto21d_userId') || '1');
      const metrics = await apperService.findWhere(apperService.tables.healthMetrics, { 
        user_id: userId, 
        phase 
      });
      
      if (metrics.length === 0) {
        throw new Error(`Métricas de la fase ${phase} no encontradas`);
      }
      
      await apperService.delete(apperService.tables.healthMetrics, metrics[0].Id);
      return true;
    } catch (error) {
      console.error('Error eliminando métricas de salud:', error);
      throw error;
    }
  },

  calculateBMI(peso_kg, estatura_cm) {
    if (!peso_kg || !estatura_cm) return null;
    const heightInMeters = estatura_cm / 100;
    return Number((peso_kg / (heightInMeters * heightInMeters)).toFixed(1));
  }
};