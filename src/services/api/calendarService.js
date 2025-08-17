import dayPlansData from "@/services/mockData/dayPlans.json";

let dayPlans = [...dayPlansData];

export const calendarService = {
  async getCalendarData() {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Return all day plans for calendar view
    return JSON.parse(JSON.stringify(dayPlans));
  },

  async getDayProgress(day) {
    await new Promise(resolve => setTimeout(resolve, 250));
    
    const dayPlan = dayPlans.find(dp => dp.day === day);
    if (!dayPlan) {
      return {
        day,
        completed: false,
        sectionsCompleted: 0,
        totalSections: 4
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
      completed: completedSections === 4,
      sectionsCompleted: completedSections,
      totalSections: 4
    };
  },

  async updateDayStatus(day, sectionData) {
    await new Promise(resolve => setTimeout(resolve, 350));
    
    const dayPlanIndex = dayPlans.findIndex(dp => dp.day === day);
    if (dayPlanIndex === -1) {
      throw new Error("Plan de día no encontrado");
    }
    
    dayPlans[dayPlanIndex] = {
      ...dayPlans[dayPlanIndex],
      ...sectionData
    };
    
    return JSON.parse(JSON.stringify(dayPlans[dayPlanIndex]));
  },

  async getCalendarStats() {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    let completedDays = 0;
    let partialDays = 0;
    let totalSections = 0;
    let completedSections = 0;
    
    dayPlans.forEach(dayPlan => {
      const sections = [
        dayPlan.morning?.completed,
        dayPlan.midday?.completed,
        dayPlan.afternoon?.completed,
        dayPlan.night?.completed
      ];
      
      const dayCompletedSections = sections.filter(Boolean).length;
      totalSections += 4;
      completedSections += dayCompletedSections;
      
      if (dayCompletedSections === 4) {
        completedDays++;
      } else if (dayCompletedSections > 0) {
        partialDays++;
      }
    });
    
    return {
      completedDays,
      partialDays,
      totalDays: dayPlans.length,
      adherencePercentage: totalSections > 0 ? Math.round((completedSections / totalSections) * 100) : 0
    };
  }
};