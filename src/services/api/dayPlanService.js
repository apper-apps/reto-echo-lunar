import { apperService } from "@/services/api/apperService";

// Day plan service now uses Apper database

export const dayPlanService = {
  async getDayPlan(day) {
    try {
      const userId = parseInt(localStorage.getItem('reto21d_userId') || '1');
      const dayPlans = await apperService.findWhere(apperService.tables.dayPlans, { day, user_id: userId });
      
      if (dayPlans.length === 0) {
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
          user_id: userId,
          ...selectedVariation
        };
      }
      
      return dayPlans[0];
    } catch (error) {
      console.error('Error obteniendo plan del día:', error);
      throw error;
    }
  },

  async completeDaySection(day, section) {
    try {
      const userId = parseInt(localStorage.getItem('reto21d_userId') || '1');
      const existingDayPlans = await apperService.findWhere(apperService.tables.dayPlans, { 
        day, 
        user_id: userId 
      });
      
      if (existingDayPlans.length === 0) {
        // Create new day plan if it doesn't exist
        const newDayPlan = {
          day,
          user_id: userId,
          morning: { completed: false },
          midday: { completed: false },
          afternoon: { completed: false },
          night: { completed: false }
        };
        
        // Set the specific section as completed
        newDayPlan[section].completed = true;
        
        return await apperService.create(apperService.tables.dayPlans, newDayPlan);
      }
      
      // Update existing day plan
      const currentPlan = existingDayPlans[0];
      const updatedSections = {
        ...currentPlan.morning && { morning: currentPlan.morning },
        ...currentPlan.midday && { midday: currentPlan.midday },
        ...currentPlan.afternoon && { afternoon: currentPlan.afternoon },
        ...currentPlan.night && { night: currentPlan.night }
      };
      
      if (!updatedSections[section]) {
        updatedSections[section] = {};
      }
      
      updatedSections[section].completed = true;
      
      return await apperService.update(apperService.tables.dayPlans, currentPlan.Id, updatedSections);
    } catch (error) {
      console.error('Error completando sección del día:', error);
      throw error;
    }
  },

  async getDayProgress(day) {
    try {
      const userId = parseInt(localStorage.getItem('reto21d_userId') || '1');
      const dayPlans = await apperService.findWhere(apperService.tables.dayPlans, { 
        day, 
        user_id: userId 
      });
      
      if (dayPlans.length === 0) {
        return {
          day,
          sectionsCompleted: 0,
          totalSections: 4,
          completed: false
        };
      }
      
      const dayPlan = dayPlans[0];
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
    } catch (error) {
      console.error('Error obteniendo progreso del día:', error);
      throw error;
    }
  },

  async updateDayPlan(day, dayPlanData) {
    try {
      const userId = parseInt(localStorage.getItem('reto21d_userId') || '1');
      const existingDayPlans = await apperService.findWhere(apperService.tables.dayPlans, { 
        day, 
        user_id: userId 
      });
      
      if (existingDayPlans.length === 0) {
        const newDayPlan = {
          day,
          user_id: userId,
          ...dayPlanData
        };
        return await apperService.create(apperService.tables.dayPlans, newDayPlan);
      }
      
      const updateData = {
        ...dayPlanData,
        updated_at: new Date().toISOString()
      };
      
      return await apperService.update(apperService.tables.dayPlans, existingDayPlans[0].Id, updateData);
    } catch (error) {
      console.error('Error actualizando plan del día:', error);
      throw error;
    }
}
};