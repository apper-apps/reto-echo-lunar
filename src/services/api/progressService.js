import progressData from "@/services/mockData/progress.json";
import React from "react";
import Error from "@/components/ui/Error";

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
  },

  // Day 21 bonus points calculation
  async calculateRankingWithBonusPoints() {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const { cohortMembersService } = await import("@/services/api/cohortMembersService");
    const { photosService } = await import("@/services/api/photosService");
    const { healthMetricsService } = await import("@/services/api/healthMetricsService");
    
    const members = await cohortMembersService.getAll();
    const rankings = [];
    
    for (const member of members) {
      let totalPoints = member.totalPoints || 0;
      let bonusPoints = 0;
      
      // Check if Day 21 completed
      if (member.currentDay >= 21) {
        try {
          // Check for final photos (≥2 required for bonus)
          const photos = await photosService.getUserFinalPhotos(member.Id);
          const finalPhotosCount = photos.filter(p => p.type === 'final').length;
          
          // Check for self-evaluation completion
          const metrics = await healthMetricsService.getHealthMetrics(member.Id);
          const hasCompletedSelfEvaluation = metrics.day21 && 
            Object.keys(metrics.day21).length > 0;
          
          // Award bonus points if both conditions met
          if (finalPhotosCount >= 2 && hasCompletedSelfEvaluation) {
            bonusPoints = 50; // Extra points for completing everything
            totalPoints += bonusPoints;
          }
        } catch (error) {
          console.warn(`Error calculating bonus for member ${member.Id}:`, error);
        }
      }
      
      rankings.push({
        ...member,
        totalPoints,
        bonusPoints,
        finalRankingEligible: member.currentDay >= 21
      });
    }
    
    // Sort by total points (including bonus) descending
    rankings.sort((a, b) => b.totalPoints - a.totalPoints);
    
    // Add ranking positions
    rankings.forEach((member, index) => {
      member.rankingPosition = index + 1;
    });
    
    return rankings;
  },

  async getUserRanking(userId = 1) {
    await new Promise(resolve => setTimeout(resolve, 250));
    
    const rankings = await this.calculateRankingWithBonusPoints();
    const userRanking = rankings.find(r => r.Id === userId);
    
    if (!userRanking) {
      throw new Error("Usuario no encontrado en el ranking");
    }
    
    return {
      user: userRanking,
      position: userRanking.rankingPosition,
      totalParticipants: rankings.length,
      topTen: rankings.slice(0, 10)
    };
  },

  async getTopRankings(limit = 10) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
const rankings = await this.calculateRankingWithBonusPoints();
    return {
      rankings: rankings.slice(0, limit),
      totalParticipants: rankings.length,
      lastUpdated: new Date().toISOString()
    };
  },

  async recalculateRanking() {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // This method triggers a fresh calculation of the ranking
    // In a real implementation, this might clear caches, update database indexes, etc.
    console.log('Ranking recalculated at:', new Date().toISOString());
    
    return {
      success: true,
      message: 'Ranking recalculado exitosamente',
      timestamp: new Date().toISOString()
};
  }
};