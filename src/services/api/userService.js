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
  },

  async getNotificationPreferences() {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const user = users.find(u => u.Id === 1);
    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    // Return notification preferences or defaults
    const notifications = user.notificationPreferences || this.getDefaultNotificationSettings();
    return JSON.parse(JSON.stringify(notifications));
  },

  async updateNotificationPreferences(preferences) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const userIndex = users.findIndex(u => u.Id === 1);
    if (userIndex === -1) {
      throw new Error("Usuario no encontrado");
    }

    // Handle nested property updates (e.g., 'dailyMoments.morning')
    let updatedPreferences = { ...users[userIndex].notificationPreferences };
    
    Object.keys(preferences).forEach(key => {
      if (key.includes('.')) {
        const [parent, child] = key.split('.');
        updatedPreferences[parent] = {
          ...updatedPreferences[parent],
          [child]: preferences[key]
        };
      } else {
        updatedPreferences[key] = preferences[key];
      }
    });

    users[userIndex].notificationPreferences = updatedPreferences;
    
    return JSON.parse(JSON.stringify(updatedPreferences));
  },

  getDefaultNotificationSettings() {
    return {
      enabled: true,
      dailyMoments: {
        morning: true,
        noon: true,
        evening: true,
        night: true
      },
      times: {
        morning: '07:00',
        noon: '12:00',
        evening: '18:00',
        night: '21:00'
      },
habitCompletion: true
    };
},

  async getRoleType() {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const user = users.find(u => u.Id === 1);
    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    // Return role type from user data, default to 'Participante'
    return user.role || user.profile?.role || 'Participante';
  },

  async getDayZeroStatus() {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const user = users.find(u => u.Id === 1);
    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    return {
      day0_completed: user.day0_completed || false,
      day21_completed: user.day21_completed || false
    };
  },

  async updateDayZeroStatus(completed = true) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const userIndex = users.findIndex(u => u.Id === 1);
    if (userIndex === -1) {
      throw new Error("Usuario no encontrado");
    }

    users[userIndex].day0_completed = completed;
    
    return {
      day0_completed: completed,
      day21_completed: users[userIndex].day21_completed || false
    };
  },

  async getPrivacySettings() {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const user = users.find(u => u.Id === 1);
    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    return user.privacySettings || {
      dataUsageConsent: true,
      imageShareConsent: true,
      analyticsConsent: true,
      consentDate: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };
  },

  async updatePrivacySetting(setting, value) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const userIndex = users.findIndex(u => u.Id === 1);
    if (userIndex === -1) {
      throw new Error("Usuario no encontrado");
    }

    if (!users[userIndex].privacySettings) {
      users[userIndex].privacySettings = {
        dataUsageConsent: true,
        imageShareConsent: true,
        analyticsConsent: true,
        consentDate: new Date().toISOString()
      };
    }

    users[userIndex].privacySettings[setting] = value;
    users[userIndex].privacySettings.lastUpdated = new Date().toISOString();

    return users[userIndex].privacySettings;
  },

  async exportUserData(dataType) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const user = users.find(u => u.Id === 1);
    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    const exportData = {
      exportDate: new Date().toISOString(),
      userId: user.Id,
      dataType: dataType
    };

    switch (dataType) {
      case 'personal':
        exportData.data = {
          profile: user.profile || {},
          preferences: user.preferences || {},
          privacySettings: user.privacySettings || {},
          notifications: user.notifications || {}
        };
        break;
        
      case 'photos':
        exportData.data = {
          profilePhotos: user.photos || [],
          progressPhotos: user.progressPhotos || [],
          uploadHistory: user.photoHistory || []
        };
        break;
        
      case 'metrics':
        exportData.data = {
          habits: user.habits || [],
          healthMetrics: user.healthMetrics || [],
          progress: user.progress || [],
          dailyLogs: user.dailyLogs || []
        };
        break;
        
      case 'complete':
        exportData.data = {
          profile: user.profile || {},
          preferences: user.preferences || {},
          privacySettings: user.privacySettings || {},
          notifications: user.notifications || {},
          photos: user.photos || [],
          progressPhotos: user.progressPhotos || [],
          habits: user.habits || [],
          healthMetrics: user.healthMetrics || [],
          progress: user.progress || [],
          dailyLogs: user.dailyLogs || [],
          completionStats: {
            day0_completed: user.day0_completed || false,
            day21_completed: user.day21_completed || false
          }
        };
        break;
        
      default:
        throw new Error("Tipo de datos no válido");
    }

    return exportData;
  },

  async requestAccountDeletion() {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const user = users.find(u => u.Id === 1);
    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    // In a real app, this would create a deletion request record
    const deletionRequest = {
      userId: user.Id,
      requestDate: new Date().toISOString(),
      status: 'pending',
      scheduledDeletion: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      confirmationRequired: true
    };

    // Mark user for deletion (in real app, would be in separate table)
    user.deletionRequest = deletionRequest;

    return deletionRequest;
  }
};