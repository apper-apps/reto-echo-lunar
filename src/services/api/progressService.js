import progressData from "@/services/mockData/progress.json";

let progress = [...progressData];

export const progressService = {
  async getUserProgress() {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Return first progress entry as current user's progress
    const userProgress = progress.find(p => p.userId === 1);
    if (!userProgress) {
      // Return default progress if none exists
      return {
        currentDay: 1,
        streakDays: 0,
        totalPoints: 0,
        currentLevel: 1,
        adherencePercentage: 0,
        completedDays: 0,
        bestStreak: 0,
        totalHabits: 0,
        achievements: []
      };
    }
    
    return JSON.parse(JSON.stringify(userProgress));
  },

  async updateProgress(progressData) {
    await new Promise(resolve => setTimeout(resolve, 350));
    
    const progressIndex = progress.findIndex(p => p.userId === 1);
    
    if (progressIndex === -1) {
      // Create new progress entry
      const maxId = progress.length > 0 ? Math.max(...progress.map(p => p.Id)) : 0;
      const newProgress = {
        Id: maxId + 1,
        userId: 1,
        ...progressData
      };
      progress.push(newProgress);
      return JSON.parse(JSON.stringify(newProgress));
    } else {
      // Update existing progress
      progress[progressIndex] = {
        ...progress[progressIndex],
        ...progressData
      };
      return JSON.parse(JSON.stringify(progress[progressIndex]));
    }
  },

  async getProgressChart() {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    // Mock chart data for weight progression
    const chartData = {
      categories: ["Día 0", "Día 7", "Día 14", "Día 21"],
      series: [
        {
          name: "Peso (kg)",
          data: [72.5, 71.8, 70.9, 69.5]
        },
        {
          name: "Cintura (cm)", 
          data: [88.5, 87.2, 85.8, 84.1]
        },
        {
          name: "% Grasa Corporal",
          data: [28.5, 27.1, 25.6, 24.2]
        }
      ]
    };
    
    return JSON.parse(JSON.stringify(chartData));
  },

  async addPoints(points) {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const progressIndex = progress.findIndex(p => p.userId === 1);
    if (progressIndex !== -1) {
      progress[progressIndex].totalPoints += points;
      return progress[progressIndex].totalPoints;
    }
    
    return points;
  },

  async unlockAchievement(achievementData) {
    await new Promise(resolve => setTimeout(resolve, 250));
    
    const progressIndex = progress.findIndex(p => p.userId === 1);
    if (progressIndex !== -1) {
      const maxId = progress[progressIndex].achievements.length > 0 
        ? Math.max(...progress[progressIndex].achievements.map(a => a.id)) 
        : 0;
      
      const newAchievement = {
        id: maxId + 1,
        ...achievementData,
        unlockedAt: new Date().toISOString()
      };
      
      progress[progressIndex].achievements.push(newAchievement);
      return JSON.parse(JSON.stringify(newAchievement));
    }
    
    return null;
  }
};