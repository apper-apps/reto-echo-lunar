import miniChallengesData from "@/services/mockData/miniChallenges.json";

let miniChallenges = [...miniChallengesData];
let userChallenges = []; // Track user participation in challenges

export const miniChallengeService = {
  async getAllChallenges() {
    await new Promise(resolve => setTimeout(resolve, 300));
    return JSON.parse(JSON.stringify(miniChallenges));
  },

  async getActiveChallenges() {
    await new Promise(resolve => setTimeout(resolve, 250));
    
    const now = new Date();
    const activeChallenges = miniChallenges.filter(challenge => {
      const startDate = new Date(challenge.startDate);
      const endDate = new Date(challenge.endDate);
      return now >= startDate && now <= endDate && challenge.status === 'active';
    });
    
    return JSON.parse(JSON.stringify(activeChallenges));
  },

  async getChallengeById(id) {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error("ID debe ser un número entero positivo");
    }
    
    const challenge = miniChallenges.find(c => c.Id === id);
    if (!challenge) {
      throw new Error("Mini-reto no encontrado");
    }
    
    return JSON.parse(JSON.stringify(challenge));
  },

  async getUserActiveChallenges(userId = 1) {
    await new Promise(resolve => setTimeout(resolve, 250));
    
    const userActiveChallenges = userChallenges.filter(uc => 
      uc.userId === userId && uc.status === 'active'
    );
    
    const challengesWithDetails = [];
    for (const userChallenge of userActiveChallenges) {
      const challenge = miniChallenges.find(c => c.Id === userChallenge.challengeId);
      if (challenge) {
        // Calculate days remaining
        const endDate = new Date(challenge.endDate);
        const now = new Date();
        const daysRemaining = Math.max(0, Math.ceil((endDate - now) / (1000 * 60 * 60 * 24)));
        
        challengesWithDetails.push({
          ...challenge,
          userProgress: userChallenge.progress,
          joinedAt: userChallenge.joinedAt,
          daysRemaining,
          userChallengeId: userChallenge.Id
        });
      }
    }
    
    return JSON.parse(JSON.stringify(challengesWithDetails));
  },

  async getUserCompletedChallenges(userId = 1) {
    await new Promise(resolve => setTimeout(resolve, 250));
    
    const userCompletedChallenges = userChallenges.filter(uc => 
      uc.userId === userId && uc.status === 'completed'
    );
    
    const challengesWithDetails = [];
    for (const userChallenge of userCompletedChallenges) {
      const challenge = miniChallenges.find(c => c.Id === userChallenge.challengeId);
      if (challenge) {
        challengesWithDetails.push({
          ...challenge,
          finalProgress: userChallenge.progress,
          completedAt: userChallenge.completedAt,
          pointsEarned: userChallenge.pointsEarned,
          userChallengeId: userChallenge.Id
        });
      }
    }
    
    return JSON.parse(JSON.stringify(challengesWithDetails));
  },

  async joinChallenge(challengeId, userId = 1) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    if (!Number.isInteger(challengeId) || challengeId <= 0) {
      throw new Error("ID del reto debe ser un número entero positivo");
    }
    
    const challenge = miniChallenges.find(c => c.Id === challengeId);
    if (!challenge) {
      throw new Error("Mini-reto no encontrado");
    }
    
    // Check if already joined
    const existingUserChallenge = userChallenges.find(uc => 
      uc.userId === userId && uc.challengeId === challengeId && uc.status === 'active'
    );
    
    if (existingUserChallenge) {
      throw new Error("Ya te has unido a este mini-reto");
    }
    
    // Check if challenge is still active
    const now = new Date();
    const startDate = new Date(challenge.startDate);
    const endDate = new Date(challenge.endDate);
    
    if (now > endDate) {
      throw new Error("Este mini-reto ya ha terminado");
    }
    
    if (now < startDate) {
      throw new Error("Este mini-reto aún no ha comenzado");
    }
    
    const maxId = userChallenges.length > 0 ? Math.max(...userChallenges.map(uc => uc.Id)) : 0;
    const newUserChallenge = {
      Id: maxId + 1,
      userId,
      challengeId,
      progress: 0,
      status: 'active',
      joinedAt: new Date().toISOString()
    };
    
    userChallenges.push(newUserChallenge);
    
    // Update challenge participant count
    const challengeIndex = miniChallenges.findIndex(c => c.Id === challengeId);
    if (challengeIndex !== -1) {
      miniChallenges[challengeIndex].participants += 1;
    }
    
    return JSON.parse(JSON.stringify(newUserChallenge));
  },

  async leaveChallenge(challengeId, userId = 1) {
    await new Promise(resolve => setTimeout(resolve, 250));
    
    if (!Number.isInteger(challengeId) || challengeId <= 0) {
      throw new Error("ID del reto debe ser un número entero positivo");
    }
    
    const userChallengeIndex = userChallenges.findIndex(uc => 
      uc.userId === userId && uc.challengeId === challengeId && uc.status === 'active'
    );
    
    if (userChallengeIndex === -1) {
      throw new Error("No estás participando en este mini-reto");
    }
    
    // Remove user challenge
    userChallenges.splice(userChallengeIndex, 1);
    
    // Update challenge participant count
    const challengeIndex = miniChallenges.findIndex(c => c.Id === challengeId);
    if (challengeIndex !== -1) {
      miniChallenges[challengeIndex].participants = Math.max(0, miniChallenges[challengeIndex].participants - 1);
    }
    
    return { success: true };
  },

  async updateProgress(challengeId, newProgress, userId = 1) {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    if (!Number.isInteger(challengeId) || challengeId <= 0) {
      throw new Error("ID del reto debe ser un número entero positivo");
    }
    
    const userChallengeIndex = userChallenges.findIndex(uc => 
      uc.userId === userId && uc.challengeId === challengeId && uc.status === 'active'
    );
    
    if (userChallengeIndex === -1) {
      throw new Error("No estás participando en este mini-reto");
    }
    
    const challenge = miniChallenges.find(c => c.Id === challengeId);
    if (!challenge) {
      throw new Error("Mini-reto no encontrado");
    }
    
    // Validate progress
    const validatedProgress = Math.max(0, Math.min(newProgress, challenge.target));
    
    userChallenges[userChallengeIndex].progress = validatedProgress;
    userChallenges[userChallengeIndex].lastUpdated = new Date().toISOString();
    
    // Check if challenge is completed
    if (validatedProgress >= challenge.target) {
      userChallenges[userChallengeIndex].status = 'completed';
      userChallenges[userChallengeIndex].completedAt = new Date().toISOString();
      userChallenges[userChallengeIndex].pointsEarned = challenge.pointsReward;
      
      // Award points through progress service
      try {
        const { progressService } = await import("@/services/api/progressService");
        await progressService.addMiniChallengePoints(challengeId, challenge.pointsReward);
      } catch (error) {
        console.warn("Error adding mini-challenge points:", error);
      }
    }
    
    return JSON.parse(JSON.stringify(userChallenges[userChallengeIndex]));
  },

  async createChallenge(challengeData) {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    if (!challengeData.title || !challengeData.description) {
      throw new Error("Título y descripción son obligatorios");
    }
    
    const maxId = miniChallenges.length > 0 ? Math.max(...miniChallenges.map(c => c.Id)) : 0;
    const newChallenge = {
      Id: maxId + 1,
      title: challengeData.title,
      description: challengeData.description,
      type: challengeData.type || 'incremental',
      target: challengeData.target || 7,
      unit: challengeData.unit || 'días',
      difficulty: challengeData.difficulty || 'Fácil',
      pointsReward: challengeData.pointsReward || 25,
      duration: challengeData.duration || 7,
      startDate: challengeData.startDate || new Date().toISOString(),
      endDate: challengeData.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: challengeData.status || 'active',
      participants: 0,
      createdAt: new Date().toISOString()
    };
    
    miniChallenges.push(newChallenge);
    return JSON.parse(JSON.stringify(newChallenge));
  },

  async updateChallenge(id, updateData) {
    await new Promise(resolve => setTimeout(resolve, 350));
    
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error("ID debe ser un número entero positivo");
    }
    
    const challengeIndex = miniChallenges.findIndex(c => c.Id === id);
    if (challengeIndex === -1) {
      throw new Error("Mini-reto no encontrado");
    }
    
    miniChallenges[challengeIndex] = {
      ...miniChallenges[challengeIndex],
      ...updateData,
      Id: id, // Ensure ID doesn't change
      updatedAt: new Date().toISOString()
    };
    
    return JSON.parse(JSON.stringify(miniChallenges[challengeIndex]));
  },

  async deleteChallenge(id) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error("ID debe ser un número entero positivo");
    }
    
    const challengeIndex = miniChallenges.findIndex(c => c.Id === id);
    if (challengeIndex === -1) {
      throw new Error("Mini-reto no encontrado");
    }
    
    // Remove all user challenges related to this challenge
    const initialLength = userChallenges.length;
    userChallenges = userChallenges.filter(uc => uc.challengeId !== id);
    
    // Remove the challenge
    miniChallenges.splice(challengeIndex, 1);
    
    return {
      success: true,
      removedUserChallenges: initialLength - userChallenges.length
    };
  }
};