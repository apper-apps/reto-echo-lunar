import { userService } from '@/services/api/userService';
import { progressService } from '@/services/api/progressService';
import { cohortMembersService } from '@/services/api/cohortMembersService';

// Mock recommendations data
let recommendations = [
  {
    Id: 1,
    title: "Mantén la hidratación",
    description: "Recuerda beber al menos 8 vasos de agua al día. El agua es fundamental para el metabolismo y la pérdida de grasa.",
    category: "nutrition",
    targetGroup: "all",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: 1
  },
  {
    Id: 2,
    title: "Progresión en ejercicios",
    description: "Si ya dominas los ejercicios básicos, intenta aumentar las repeticiones o la intensidad gradualmente.",
    category: "exercise",
    targetGroup: "advanced",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: 1
  }
];

export const coachService = {
  async getGroupStats() {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    // Mock group statistics
    const stats = {
      totalParticipants: 25,
      activeParticipants: 22,
      averageAdherence: 78,
      completedChallenges: 156,
      totalPoints: 12450,
      averageProgress: 68
    };
    
    return JSON.parse(JSON.stringify(stats));
  },

  async getAllParticipants() {
    await new Promise(resolve => setTimeout(resolve, 350));
    
    // Mock participants data with varying progress
    const participants = Array.from({ length: 25 }, (_, index) => {
      const id = index + 1;
      const currentDay = Math.floor(Math.random() * 21) + 1;
      const adherencePercentage = Math.floor(Math.random() * 40) + 60; // 60-100%
      const totalPoints = Math.floor(adherencePercentage * 2.5) + Math.floor(Math.random() * 100);
      
      return {
        Id: id,
        email: `participante${id}@ejemplo.com`,
        role: "Participante",
        profile: {
          fullName: `Participante ${id}`,
          objective: Math.random() > 0.5 ? "Bajar grasa" : "Ganar músculo",
          activityLevel: ["Bajo", "Moderado", "Alto"][Math.floor(Math.random() * 3)]
        },
        currentDay,
        totalPoints,
        adherencePercentage,
        bestStreak: Math.floor(Math.random() * currentDay) + 1,
        completedDays: Math.floor((adherencePercentage / 100) * currentDay),
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
      };
    });

    // Sort by total points descending
    participants.sort((a, b) => b.totalPoints - a.totalPoints);
    
    return JSON.parse(JSON.stringify(participants));
  },

  async getParticipantDetails(participantId) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    if (!Number.isInteger(participantId) || participantId <= 0) {
      throw new Error("ID debe ser un número entero positivo");
    }
    
    const participants = await this.getAllParticipants();
    const participant = participants.find(p => p.Id === participantId);
    
    if (!participant) {
      throw new Error("Participante no encontrado");
    }
    
    // Add detailed progress data
    const detailedProgress = {
      ...participant,
      weeklyProgress: Array.from({ length: 3 }, (_, weekIndex) => ({
        week: weekIndex + 1,
        adherence: Math.floor(Math.random() * 30) + 70,
        habitsCompleted: Math.floor(Math.random() * 15) + 20,
        pointsEarned: Math.floor(Math.random() * 50) + 100
      })),
      recentActivity: Array.from({ length: 7 }, (_, dayIndex) => ({
        day: dayIndex + 1,
        completed: Math.random() > 0.3,
        habits: Math.floor(Math.random() * 3) + 4,
        points: Math.floor(Math.random() * 30) + 15
      }))
    };
    
    return JSON.parse(JSON.stringify(detailedProgress));
  },

  async getRecommendations() {
    await new Promise(resolve => setTimeout(resolve, 250));
    
    return JSON.parse(JSON.stringify(recommendations.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))));
  },

  async createRecommendation(recommendationData) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    if (!recommendationData.title || !recommendationData.description) {
      throw new Error("Título y descripción son obligatorios");
    }
    
    const maxId = recommendations.length > 0 ? Math.max(...recommendations.map(r => r.Id)) : 0;
    const newRecommendation = {
      Id: maxId + 1,
      title: recommendationData.title,
      description: recommendationData.description,
      category: recommendationData.category || 'general',
      targetGroup: recommendationData.targetGroup || 'all',
      createdAt: new Date().toISOString(),
      createdBy: 1 // Coach ID
    };
    
    recommendations.push(newRecommendation);
    return JSON.parse(JSON.stringify(newRecommendation));
  },

  async updateRecommendation(id, updateData) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error("ID debe ser un número entero positivo");
    }
    
    const recommendationIndex = recommendations.findIndex(r => r.Id === id);
    if (recommendationIndex === -1) {
      throw new Error("Recomendación no encontrada");
    }
    
    recommendations[recommendationIndex] = {
      ...recommendations[recommendationIndex],
      ...updateData,
      Id: id, // Ensure ID doesn't change
      updatedAt: new Date().toISOString()
    };
    
    return JSON.parse(JSON.stringify(recommendations[recommendationIndex]));
  },

  async deleteRecommendation(id) {
    await new Promise(resolve => setTimeout(resolve, 250));
    
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error("ID debe ser un número entero positivo");
    }
    
    const recommendationIndex = recommendations.findIndex(r => r.Id === id);
    if (recommendationIndex === -1) {
      throw new Error("Recomendación no encontrada");
    }
    
    recommendations.splice(recommendationIndex, 1);
    return { success: true };
  },

  async getProgressAnalytics() {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const analytics = {
      weeklyCompletion: Array.from({ length: 3 }, (_, weekIndex) => ({
        week: weekIndex + 1,
        totalParticipants: 25,
        activeParticipants: Math.floor(Math.random() * 5) + 20,
        averageAdherence: Math.floor(Math.random() * 20) + 70,
        totalPoints: Math.floor(Math.random() * 1000) + 2000
      })),
      categoryProgress: [
        { category: 'Nutrición', completion: 85, participants: 23 },
        { category: 'Ejercicio', completion: 78, participants: 22 },
        { category: 'Hábitos', completion: 82, participants: 24 },
        { category: 'Bienestar', completion: 71, participants: 19 }
      ],
      challengeEngagement: {
        dailyChallenges: {
          totalCreated: 45,
          averageParticipation: 78,
          completionRate: 65
        },
        weeklyChallenges: {
          totalCreated: 12,
          averageParticipation: 85,
          completionRate: 72
        }
      }
    };
    
    return JSON.parse(JSON.stringify(analytics));
  },

  async getLeaderboard(limit = 10) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const participants = await this.getAllParticipants();
    const leaderboard = participants.slice(0, limit).map((participant, index) => ({
      ...participant,
      position: index + 1,
      badge: index < 3 ? ['🥇', '🥈', '🥉'][index] : null
    }));
    
    return JSON.parse(JSON.stringify(leaderboard));
  },

  async sendGroupMessage(messageData) {
    await new Promise(resolve => setTimeout(resolve, 350));
    
    if (!messageData.title || !messageData.message) {
      throw new Error("Título y mensaje son obligatorios");
    }
    
    // In a real implementation, this would send notifications to all participants
    const message = {
      Id: Date.now(),
      title: messageData.title,
      message: messageData.message,
      type: messageData.type || 'info',
      targetGroup: messageData.targetGroup || 'all',
      sentAt: new Date().toISOString(),
      sentBy: 1, // Coach ID
      recipients: 25 // Number of participants
    };
    
    return JSON.parse(JSON.stringify(message));
  },

  async exportParticipantData() {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const participants = await this.getAllParticipants();
    
    // Format data for export
    const exportData = participants.map(p => ({
      Nombre: p.profile?.fullName || 'Usuario',
      Email: p.email,
      'Día Actual': p.currentDay,
      'Adherencia (%)': p.adherencePercentage,
      'Puntos Totales': p.totalPoints,
      'Mejor Racha': p.bestStreak,
      'Días Completados': p.completedDays,
      'Fecha Registro': new Date(p.createdAt).toLocaleDateString()
    }));
    
    return {
      data: exportData,
      filename: `participantes_${new Date().toISOString().split('T')[0]}.csv`,
      totalRecords: exportData.length
    };
  }
};