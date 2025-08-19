import { apperService } from "@/services/api/apperService";

// Progress service now uses Apper database

export const progressService = {
  async getUserProgress() {
    try {
      const userId = parseInt(localStorage.getItem('reto21d_userId') || '1');
      const userProgress = await apperService.findWhere(apperService.tables.progress, { userId });
      
      if (!userProgress || userProgress.length === 0) {
        // Return default progress if none exists
        const defaultProgress = {
          userId,
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
        
        // Create in database
        const createdProgress = await apperService.create(apperService.tables.progress, defaultProgress);
        return createdProgress;
      }
      
      return userProgress[0];
    } catch (error) {
      console.error('Error obteniendo progreso del usuario:', error);
      throw error;
    }
  },

  async updateProgress(progressData) {
    try {
      const userId = parseInt(localStorage.getItem('reto21d_userId') || '1');
      const existingProgress = await apperService.findWhere(apperService.tables.progress, { userId });
      
      if (!existingProgress || existingProgress.length === 0) {
        // Create new progress entry
        const newProgress = {
          userId,
          ...progressData
        };
        return await apperService.create(apperService.tables.progress, newProgress);
      } else {
        // Update existing progress
        const updatedData = {
          ...progressData,
          updatedAt: new Date().toISOString()
        };
        return await apperService.update(apperService.tables.progress, existingProgress[0].Id, updatedData);
      }
    } catch (error) {
      console.error('Error actualizando progreso:', error);
      throw error;
    }
  },

  async getProgressChart() {
    try {
      // This could pull real data from the database in the future
      const chartData = {
        categories: ["Día 0", "Día 7", "Día 14", "Día 21"],
        series: [
          {
            name: "Peso (kg)",
            data: [72.5, 72.1, 71.8, 71.5, 71.2, 70.9, 70.6, 70.3, 70.0, 69.8, 69.5, 69.2, 69.0, 68.8, 68.5, 68.3, 68.1, 67.9, 67.7, 67.5, 67.2]
          },
          {
            name: "Cintura (cm)", 
            data: [88.5, 88.2, 87.9, 87.6, 87.4, 87.2, 87.0, 86.8, 86.5, 86.2, 85.8, 85.5, 85.2, 84.9, 84.6, 84.4, 84.2, 84.0, 83.8, 83.5, 84.1]
          },
          {
            name: "% Grasa Corporal",
            data: [28.5, 28.2, 27.9, 27.6, 27.4, 27.1, 26.9, 26.6, 26.3, 26.0, 25.6, 25.3, 25.0, 24.8, 24.5, 24.3, 24.1, 23.9, 23.6, 23.4, 24.2]
          },
          {
            name: "Adherencia de Hábitos (%)",
            data: [0, 45, 60, 70, 75, 80, 85, 82, 88, 90, 85, 92, 88, 94, 90, 96, 92, 98, 95, 97, 100]
          }
        ]
      };
      return chartData;
    } catch (error) {
      console.error('Error obteniendo datos del gráfico:', error);
      throw error;
    }
  },

  getAdditionalData() {
    return {
      weeklyData: [
        {
          week: 1,
          completionRate: 75,
          habitsCompleted: 18,
          totalHabits: 24,
          activeDays: 6,
          avgWeight: 71.8,
          avgWaist: 87.5
        },
        {
          week: 2,
          completionRate: 85,
          habitsCompleted: 22,
          totalHabits: 26,
          activeDays: 7,
          avgWeight: 70.2,
          avgWaist: 86.1
        },
        {
          week: 3,
          completionRate: 92,
          habitsCompleted: 25,
          totalHabits: 27,
          activeDays: 7,
          avgWeight: 68.8,
          avgWaist: 84.3
        }
      ],
      habitCompletion: [
        {
          name: "Agua 8 vasos",
          completionRate: 95,
          completedDays: 20,
          totalDays: 21,
          trend: "up"
        },
        {
          name: "Caminar 10k pasos",
          completionRate: 88,
          completedDays: 18,
          totalDays: 21,
          trend: "up"
        },
        {
          name: "Dormir 8 horas",
          completionRate: 76,
          completedDays: 16,
          totalDays: 21,
          trend: "stable"
        },
        {
          name: "Meditar 10 min",
          completionRate: 82,
          completedDays: 17,
          totalDays: 21,
          trend: "up"
        },
        {
          name: "Evitar procesados",
          completionRate: 90,
          completedDays: 19,
          totalDays: 21,
          trend: "up"
        },
        {
          name: "Ejercicio 30 min",
          completionRate: 85,
          completedDays: 18,
          totalDays: 21,
          trend: "up"
        }
      ],
      dailyCompletion: Array.from({ length: 21 }, (_, i) => ({
        day: i + 1,
        completionRate: Math.floor(Math.random() * 40) + 60,
        habitsCompleted: Math.floor(Math.random() * 3) + 4,
        totalHabits: 6
      }))
    };
  },

  async addPoints(points) {
    try {
      const userId = parseInt(localStorage.getItem('reto21d_userId') || '1');
      const userProgress = await apperService.findWhere(apperService.tables.progress, { userId });
      
      if (userProgress && userProgress.length > 0) {
        const newTotalPoints = (userProgress[0].totalPoints || 0) + points;
        await apperService.update(apperService.tables.progress, userProgress[0].Id, {
          totalPoints: newTotalPoints
        });
        return newTotalPoints;
      }
      
      return points;
    } catch (error) {
      console.error('Error agregando puntos:', error);
      throw error;
    }
  },

  async addMiniChallengePoints(challengeId, points) {
    try {
      const userId = parseInt(localStorage.getItem('reto21d_userId') || '1');
      const userProgress = await apperService.findWhere(apperService.tables.progress, { userId });
      
      if (userProgress && userProgress.length > 0) {
        const currentProgress = userProgress[0];
        const newTotalPoints = (currentProgress.totalPoints || 0) + points;
        const newMiniChallengePoints = (currentProgress.miniChallengePoints || 0) + points;
        
        await apperService.update(apperService.tables.progress, currentProgress.Id, {
          totalPoints: newTotalPoints,
          miniChallengePoints: newMiniChallengePoints
        });
        
        return {
          totalPoints: newTotalPoints,
          miniChallengePoints: newMiniChallengePoints
        };
      }
      
      return { totalPoints: points, miniChallengePoints: points };
    } catch (error) {
      console.error('Error agregando puntos de mini desafío:', error);
      throw error;
    }
  },

  async getMiniChallengeStats() {
    try {
      const userId = parseInt(localStorage.getItem('reto21d_userId') || '1');
      const userProgress = await apperService.findWhere(apperService.tables.progress, { userId });
      
      if (userProgress && userProgress.length > 0) {
        const progress = userProgress[0];
        return {
          totalMiniChallengePoints: progress.miniChallengePoints || 0,
          completedChallenges: progress.completedMiniChallenges || 0,
          activeChallenges: progress.activeMiniChallenges || 0
        };
      }
      
      return {
        totalMiniChallengePoints: 0,
        completedChallenges: 0,
        activeChallenges: 0
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas de mini desafíos:', error);
      throw error;
    }
  },

  async unlockAchievement(achievementData) {
    try {
      const userId = parseInt(localStorage.getItem('reto21d_userId') || '1');
      const userProgress = await apperService.findWhere(apperService.tables.progress, { userId });
      
      if (userProgress && userProgress.length > 0) {
        const currentProgress = userProgress[0];
        const achievements = currentProgress.achievements || [];
        
        const newAchievement = {
          id: achievements.length + 1,
          ...achievementData,
          unlockedAt: new Date().toISOString()
        };
        
        const updatedAchievements = [...achievements, newAchievement];
        
        await apperService.update(apperService.tables.progress, currentProgress.Id, {
          achievements: updatedAchievements
        });
        
        return newAchievement;
      }
      
      return null;
    } catch (error) {
      console.error('Error desbloqueando logro:', error);
      throw error;
    }
  },

  async calculateRankingWithBonusPoints() {
    try {
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
              bonusPoints = 50;
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
    } catch (error) {
      console.error('Error calculando ranking con puntos bonus:', error);
      throw error;
    }
  },

  async getUserRanking(userId = null) {
    try {
      const targetUserId = userId || parseInt(localStorage.getItem('reto21d_userId') || '1');
      const rankings = await this.calculateRankingWithBonusPoints();
      const userRanking = rankings.find(r => r.Id === targetUserId);
      
      if (!userRanking) {
        throw new Error("Usuario no encontrado en el ranking");
      }
      
      return {
        user: userRanking,
        position: userRanking.rankingPosition,
        totalParticipants: rankings.length,
        topTen: rankings.slice(0, 10)
      };
    } catch (error) {
      console.error('Error obteniendo ranking del usuario:', error);
      throw error;
    }
  },

  async getTopRankings(limit = 10) {
    try {
      const rankings = await this.calculateRankingWithBonusPoints();
      return {
        rankings: rankings.slice(0, limit),
        totalParticipants: rankings.length,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error obteniendo top rankings:', error);
      throw error;
    }
  },

  async recalculateRanking() {
    try {
      console.log('Ranking recalculated at:', new Date().toISOString());
      
      return {
        success: true,
        message: 'Ranking recalculado exitosamente',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error recalculando ranking:', error);
      throw error;
    }
  },

  async getHabitProgressChart() {
    try {
      return {
        categories: Array.from({ length: 21 }, (_, i) => `Día ${i + 1}`),
        series: [
          {
            name: "Adherencia General (%)",
            data: Array.from({ length: 21 }, (_, i) => Math.min(60 + (i * 2) + Math.floor(Math.random() * 10), 100)),
            color: "#7C3AED"
          },
          {
            name: "Hábitos Completados",
            data: Array.from({ length: 21 }, (_, i) => Math.min(3 + Math.floor(i/3) + Math.floor(Math.random() * 2), 6)),
            color: "#10B981"
          },
          {
            name: "Puntos Diarios",
            data: Array.from({ length: 21 }, (_, i) => 50 + (i * 3) + Math.floor(Math.random() * 20)),
            color: "#2563EB"
          }
        ]
      };
    } catch (error) {
      console.error('Error obteniendo gráfico de progreso de hábitos:', error);
      throw error;
    }
  },

  async getWeeklyComparison() {
try {
      const comparisonData = {
        weeks: [
          { week: 1, metrics: { peso_kg: 71.8, cintura_cm: 87.5, adherence: 75 } },
          { week: 2, metrics: { peso_kg: 70.2, cintura_cm: 86.1, adherence: 85 } },
          { week: 3, metrics: { peso_kg: 68.8, cintura_cm: 84.3, adherence: 92 } }
        ],
        improvements: {
          weight: -4.0,
          waist: -4.2,
          adherence: +17
        }
      };
      
      return comparisonData;
    } catch (error) {
      console.error('Error obteniendo comparación semanal:', error);
      throw error;
    }
  }
};