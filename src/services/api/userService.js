import usersData from "@/services/mockData/users.json";
import React from "react";
import Error from "@/components/ui/Error";

// Initialize users data with validation
let users = [...usersData];

// Validate data structure on initialization
const validateUserData = (user) => {
  if (!user || typeof user !== 'object') {
    throw new Error("Datos de usuario inválidos");
  }
  if (!user.Id || typeof user.Id !== 'number') {
    throw new Error("ID de usuario requerido");
  }
  return true;
};

// Validate initial data
users.forEach(validateUserData);

export const userService = {
  async getCurrentUser(userId = null) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Get user ID from localStorage or use provided
    const targetUserId = userId || parseInt(localStorage.getItem('reto21d_userId') || '1');
    
    // Find user by ID
    const user = users.find(u => u.Id === targetUserId);
    if (!user) {
      throw new Error("Usuario no encontrado");
    }
    
    // Validate user data structure
    validateUserData(user);
    
    return JSON.parse(JSON.stringify(user));
  },

async getUserProfile(userId = null) {
    await new Promise(resolve => setTimeout(resolve, 250));
    
    const targetUserId = userId || parseInt(localStorage.getItem('reto21d_userId') || '1');
    const user = users.find(u => u.Id === targetUserId);
    if (!user) {
      throw new Error("Perfil de usuario no encontrado");
    }
    
    validateUserData(user);
    
    if (!user.profile) {
      // Create default profile if none exists
      user.profile = {
        firstName: user.name || '',
        lastName: '',
        email: user.email || '',
        phone: '',
        dateOfBirth: '',
        createdAt: new Date().toISOString()
      };
    }
    
    return JSON.parse(JSON.stringify(user.profile));
  },

  async updateProfile(profileData, userId = null) {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    // Validate input data
    if (!profileData || typeof profileData !== 'object') {
      throw new Error("Datos de perfil inválidos");
    }
    
    const targetUserId = userId || parseInt(localStorage.getItem('reto21d_userId') || '1');
    const userIndex = users.findIndex(u => u.Id === targetUserId);
    if (userIndex === -1) {
      throw new Error("Usuario no encontrado");
    }
    
    // Ensure profile exists
    if (!users[userIndex].profile) {
      users[userIndex].profile = {};
    }
    
    users[userIndex].profile = {
      ...users[userIndex].profile,
      ...profileData,
      updatedAt: new Date().toISOString()
    };
    
    return JSON.parse(JSON.stringify(users[userIndex].profile));
  },
async updateUser(userData, userId = null) {
    await new Promise(resolve => setTimeout(resolve, 350));
    
    // Validate input data
    if (!userData || typeof userData !== 'object') {
      throw new Error("Datos de usuario inválidos");
    }
    
    const targetUserId = userId || parseInt(localStorage.getItem('reto21d_userId') || '1');
    const userIndex = users.findIndex(u => u.Id === targetUserId);
    if (userIndex === -1) {
      throw new Error("Usuario no encontrado");
    }
    
    // Prevent ID modification
    const { Id, ...safeUserData } = userData;
    
    users[userIndex] = {
      ...users[userIndex],
      ...safeUserData,
      updatedAt: new Date().toISOString()
    };
    
    validateUserData(users[userIndex]);
    
    return JSON.parse(JSON.stringify(users[userIndex]));
  },

  async getNotificationPreferences(userId = null) {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const targetUserId = userId || parseInt(localStorage.getItem('reto21d_userId') || '1');
    const user = users.find(u => u.Id === targetUserId);
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
      habitCompletion: true,
      milestones: true,
      reminders: true
    };
  },

  async getRoleType(userId = null) {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const targetUserId = userId || parseInt(localStorage.getItem('reto21d_userId') || '1');
const user = users.find(u => u.Id === targetUserId);
    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    // For demo: user ID 1 is coach, others are participants
    // In production, this would check actual role from user data
    return user.Id === 1 && user.role === 'Coach' ? 'Coach' : user.role || 'Participante';
  },

  async setUserRole(userId, role) {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const userIndex = users.findIndex(u => u.Id === userId);
    if (userIndex === -1) {
      throw new Error("Usuario no encontrado");
    }

    users[userIndex].role = role;
    return JSON.parse(JSON.stringify(users[userIndex]));
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