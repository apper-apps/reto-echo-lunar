import dayPlansData from "@/services/mockData/dayPlans.json";

let dayPlans = [...dayPlansData];

export const dayPlanService = {
  async getDayPlan(day) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const dayPlan = dayPlans.find(dp => dp.day === day);
    if (!dayPlan) {
// Return a default day plan with interactive content types
      const contentVariations = [
        {
          morning: {
            type: 'educational',
            title: `Aprende algo nuevo - Día ${day}`,
            content: "El conocimiento es poder. Cada día aprende algo que te acerque a tus objetivos.",
            imageUrl: '/images/morning-learning.jpg',
            readTime: '3 min lectura',
            completed: false
          },
          midday: {
            type: 'survey',
            title: `Evaluación del Día ${day}`,
            content: "Momento perfecto para hacer una pausa y evaluar tu progreso.",
            survey: "¿Qué tan productiva ha sido tu mañana?",
            completed: false
          },
          afternoon: {
            type: 'reflection',
            title: `Reflexión de la Tarde - Día ${day}`,
            content: "La tarde es ideal para reflexionar sobre tus experiencias y aprendizajes.",
            reflection: "¿Qué has aprendido sobre ti mismo hoy? Describe una situación que te haya desafiado.",
            completed: false
          },
          night: {
            type: 'confirmation',
            title: `Celebración Nocturna - Día ${day}`,
            content: "¡Has completado otro día de crecimiento personal! Reconoce tus logros, por pequeños que sean.",
            completed: false
          }
        },
        {
          morning: {
            type: 'reflection',
            title: `Intención Matutina - Día ${day}`,
            content: "Establece una intención clara para guiar tu día hacia el éxito.",
            reflection: "¿Cuál es tu intención principal para hoy? ¿Cómo vas a honrarla?",
            completed: false
          },
          midday: {
            type: 'educational',
            title: `Pausa Educativa - Día ${day}`,
            content: "Aprovecha este momento para nutrir tu mente con conocimiento valioso.",
            imageUrl: '/images/midday-education.jpg',
            readTime: '2 min lectura',
            completed: false
          },
          afternoon: {
            type: 'survey',
            title: `Chequeo Vespertino - Día ${day}`,
            content: "Evalúa tu estado de ánimo y energía para optimizar el resto del día.",
            survey: "¿Cómo describirías tu nivel de energía en este momento?",
            completed: false
          },
          night: {
            type: 'confirmation',
            title: `Logros del Día ${day}`,
            content: "Cada paso cuenta en tu viaje de transformación. ¡Celebra lo que has logrado hoy!",
            completed: false
          }
        }
      ];

      const selectedVariation = contentVariations[day % contentVariations.length];
      
      return {
        day,
        ...selectedVariation
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