import usersData from "@/services/mockData/users.json";

let users = [...usersData];

export const userService = {
  async getCurrentUser() {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Return first user as current user (mock authentication)
    const user = users.find(u => u.Id === 1);
    if (!user) {
      throw new Error("Usuario no encontrado");
    }
    
    return JSON.parse(JSON.stringify(user));
  },

  async getUserProfile() {
    await new Promise(resolve => setTimeout(resolve, 250));
    
    const user = users.find(u => u.Id === 1);
    if (!user) {
      throw new Error("Perfil de usuario no encontrado");
    }
    
    return JSON.parse(JSON.stringify(user.profile));
  },

  async updateProfile(profileData) {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const userIndex = users.findIndex(u => u.Id === 1);
    if (userIndex === -1) {
      throw new Error("Usuario no encontrado");
    }
    
    users[userIndex].profile = {
      ...users[userIndex].profile,
      ...profileData
    };
    
    return JSON.parse(JSON.stringify(users[userIndex].profile));
  },

  async updateUser(userData) {
    await new Promise(resolve => setTimeout(resolve, 350));
    
    const userIndex = users.findIndex(u => u.Id === 1);
    if (userIndex === -1) {
      throw new Error("Usuario no encontrado");
    }
    
    users[userIndex] = {
      ...users[userIndex],
      ...userData
    };
    
    return JSON.parse(JSON.stringify(users[userIndex]));
  }
};