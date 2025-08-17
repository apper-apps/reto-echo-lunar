import healthMetricsData from "@/services/mockData/healthMetrics.json";

let healthMetrics = [...healthMetricsData];

export const healthMetricsService = {
  async getHealthMetrics() {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const userMetrics = healthMetrics.filter(hm => hm.userId === 1);
    
    const result = {
      day0: null,
      day21: null
    };
    
    // Find day 0 and day 21 metrics
    userMetrics.forEach(metric => {
      if (metric.day === 0) {
        result.day0 = metric;
      } else if (metric.day === 21) {
        result.day21 = metric;
      }
    });
    
    return JSON.parse(JSON.stringify(result));
  },

  async createHealthMetrics(metricsData) {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const maxId = healthMetrics.length > 0 ? Math.max(...healthMetrics.map(hm => hm.Id)) : 0;
    const newMetrics = {
      Id: maxId + 1,
      userId: 1,
      ...metricsData,
      createdAt: new Date().toISOString()
    };
    
    healthMetrics.push(newMetrics);
    return JSON.parse(JSON.stringify(newMetrics));
  },

  async updateHealthMetrics(day, metricsData) {
    await new Promise(resolve => setTimeout(resolve, 350));
    
    const metricIndex = healthMetrics.findIndex(hm => hm.userId === 1 && hm.day === day);
    
    if (metricIndex === -1) {
      // Create new metrics if not found
      return await this.createHealthMetrics({ day, ...metricsData });
    }
    
    healthMetrics[metricIndex] = {
      ...healthMetrics[metricIndex],
      ...metricsData,
      updatedAt: new Date().toISOString()
    };
    
    return JSON.parse(JSON.stringify(healthMetrics[metricIndex]));
  },

  async getMetricsByDay(day) {
    await new Promise(resolve => setTimeout(resolve, 250));
    
    const metrics = healthMetrics.find(hm => hm.userId === 1 && hm.day === day);
    if (!metrics) {
      throw new Error(`Métricas del día ${day} no encontradas`);
    }
    
    return JSON.parse(JSON.stringify(metrics));
  },

  async getMetricsComparison() {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const day0 = healthMetrics.find(hm => hm.userId === 1 && hm.day === 0);
    const day21 = healthMetrics.find(hm => hm.userId === 1 && hm.day === 21);
    
    const comparison = {
      hasDay0: !!day0,
      hasDay21: !!day21,
      changes: {}
    };
    
    if (day0 && day21) {
      const metrics = ["weight", "waist", "hip", "bodyFat", "muscle", "visceralFat", "metabolicAge"];
      
      metrics.forEach(metric => {
        if (day0[metric] !== undefined && day21[metric] !== undefined) {
          const change = day21[metric] - day0[metric];
          const percentage = Math.abs((change / day0[metric]) * 100);
          
          comparison.changes[metric] = {
            initial: day0[metric],
            final: day21[metric], 
            change,
            percentage: percentage.toFixed(1),
            improved: metric === "weight" ? change < 0 : change > 0
          };
        }
      });
    }
    
    return JSON.parse(JSON.stringify(comparison));
  },

  async deleteHealthMetrics(day) {
    await new Promise(resolve => setTimeout(resolve, 250));
    
    const metricIndex = healthMetrics.findIndex(hm => hm.userId === 1 && hm.day === day);
    if (metricIndex === -1) {
      throw new Error(`Métricas del día ${day} no encontradas`);
    }
    
    healthMetrics.splice(metricIndex, 1);
    return true;
  }
};