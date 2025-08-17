// Mock cohort members data
let cohortMembers = [
  {
    Id: 1,
    user_id: 1,
    cohort_id: 1,
    day0_completed: false,
    day21_completed: false,
    adherence_pct: 0.0,
    created_at: "2024-01-15T10:00:00Z"
  }
];

export const cohortMembersService = {
  async getMemberStatus(userId = 1) {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const member = cohortMembers.find(m => m.user_id === userId);
    if (!member) {
      throw new Error("Miembro del cohort no encontrado");
    }
    
    return JSON.parse(JSON.stringify(member));
  },

  async updateMemberStatus(userId = 1, updates) {
    await new Promise(resolve => setTimeout(resolve, 250));
    
    const memberIndex = cohortMembers.findIndex(m => m.user_id === userId);
    if (memberIndex === -1) {
      throw new Error("Miembro del cohort no encontrado");
    }
    
    cohortMembers[memberIndex] = {
      ...cohortMembers[memberIndex],
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    return JSON.parse(JSON.stringify(cohortMembers[memberIndex]));
  },

  async markDay0Completed(userId = 1) {
    return await this.updateMemberStatus(userId, { day0_completed: true });
  },

  async markDay21Completed(userId = 1) {
    return await this.updateMemberStatus(userId, { day21_completed: true });
  },

  async updateAdherence(userId = 1, adherencePercentage) {
    return await this.updateMemberStatus(userId, { 
      adherence_pct: Math.min(100, Math.max(0, adherencePercentage))
    });
  }
};