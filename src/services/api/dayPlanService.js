import dayPlansData from "@/services/mockData/dayPlans.json";

let dayPlans = [...dayPlansData];

export const dayPlanService = {
  async getDayPlan(day) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const dayPlan = dayPlans.find(dp => dp.day === day);
    if (!dayPlan) {
      // Return a default day plan if specific day not found
      return {
        day,
        morning: {
          title: `Mañana del Día ${day}`,
          content: "Comienza tu día con energía y propósito. Cada día es una nueva oportunidad para crecer.",
          reflection: "¿Qué quieres lograr hoy?",
          checklist: [
            "Hidrátate al despertar",
            "Establece tu intención del día",
            "Revisa tus hábitos pendientes"
          ],
          completed: false
        },
        midday: {
          title: `Mediodía del Día ${day}`,
          content: "Momento perfecto para hacer una pausa y evaluar cómo va tu día.",
          completed: false
        },
        afternoon: {
          title: `Tarde del Día ${day}`,
          content: "La tarde es ideal para mantener el momentum y prepararte para un cierre exitoso.",
          survey: "¿Cómo te sientes con tu progreso hasta ahora?",
          completed: false
        },
        night: {
          title: `Noche del Día ${day}`,
          content: "Reflexiona sobre tus logros del día y prepárate para un descanso reparador.",
          reflection: "¿Qué lograste hoy que te haga sentir orgulloso?",
          completed: false
        }
      };
    }
    
    return JSON.parse(JSON.stringify(dayPlan));
  },

  async completeDaySection(day, section) {
    await new Promise(resolve => setTimeout(resolve, 350));
    
    const dayPlanIndex = dayPlans.findIndex(dp => dp.day === day);
    
    if (dayPlanIndex === -1) {
      // Create new day plan if it doesn't exist
      const maxId = dayPlans.length > 0 ? Math.max(...dayPlans.map(dp => dp.Id)) : 0;
      const newDayPlan = {
        Id: maxId + 1,
        day,
        morning: { completed: false },
        midday: { completed: false },
        afternoon: { completed: false },
        night: { completed: false }
      };
      dayPlans.push(newDayPlan);
      
      // Set the specific section as completed
      newDayPlan[section].completed = true;
      return JSON.parse(JSON.stringify(newDayPlan));
    }
    
    // Update existing day plan
    if (!dayPlans[dayPlanIndex][section]) {
      dayPlans[dayPlanIndex][section] = {};
    }
    
    dayPlans[dayPlanIndex][section].completed = true;
    
    return JSON.parse(JSON.stringify(dayPlans[dayPlanIndex]));
  },

  async getDayProgress(day) {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const dayPlan = dayPlans.find(dp => dp.day === day);
    if (!dayPlan) {
      return {
        day,
        sectionsCompleted: 0,
        totalSections: 4,
        completed: false
      };
    }
    
    const completedSections = [
      dayPlan.morning?.completed,
      dayPlan.midday?.completed,
      dayPlan.afternoon?.completed,
      dayPlan.night?.completed
    ].filter(Boolean).length;
    
    return {
      day,
      sectionsCompleted: completedSections,
      totalSections: 4,
      completed: completedSections === 4
    };
  },

  async updateDayPlan(day, dayPlanData) {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const dayPlanIndex = dayPlans.findIndex(dp => dp.day === day);
    
    if (dayPlanIndex === -1) {
      const maxId = dayPlans.length > 0 ? Math.max(...dayPlans.map(dp => dp.Id)) : 0;
      const newDayPlan = {
        Id: maxId + 1,
        day,
        ...dayPlanData
      };
      dayPlans.push(newDayPlan);
      return JSON.parse(JSON.stringify(newDayPlan));
    }
    
    dayPlans[dayPlanIndex] = {
      ...dayPlans[dayPlanIndex],
      ...dayPlanData
    };
    
    return JSON.parse(JSON.stringify(dayPlans[dayPlanIndex]));
  }
};