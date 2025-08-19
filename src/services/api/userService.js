import { apperService } from "@/services/api/apperService";
import React from "react";
import Error from "@/components/ui/Error";

// Validate data structure
const validateUserData = (user) => {
  if (!user || typeof user !== 'object') {
    throw new Error("Datos de usuario inválidos");
  }
  if (!user.Id || typeof user.Id !== 'number') {
    throw new Error("ID de usuario requerido");
  }
  return true;
};
export const userService = {
  async getCurrentUser(userId = null) {
    try {
      const targetUserId = userId || parseInt(localStorage.getItem('reto21d_userId') || '1');
      
      const user = await apperService.findById(apperService.tables.users, targetUserId);
      if (!user) {
        throw new Error("Usuario no encontrado");
      }
      
      validateUserData(user);
      return user;
    } catch (error) {
      console.error('Error obteniendo usuario actual:', error);
      throw error;
    }
  },

  async getUserProfile(userId = null) {
    try {
      const targetUserId = userId || parseInt(localStorage.getItem('reto21d_userId') || '1');
      const user = await apperService.findById(apperService.tables.users, targetUserId);
      
      if (!user) {
        throw new Error("Perfil de usuario no encontrado");
      }
      
      validateUserData(user);
      
      if (!user.profile) {
        // Create default profile if none exists
        const defaultProfile = {
          firstName: user.name || '',
          lastName: '',
          email: user.email || '',
          phone: '',
          dateOfBirth: '',
          createdAt: new Date().toISOString()
        };
        
        await apperService.update(apperService.tables.users, targetUserId, {
          profile: defaultProfile
        });
        
        return defaultProfile;
      }
      
      return user.profile;
    } catch (error) {
      console.error('Error obteniendo perfil de usuario:', error);
      throw error;
    }
  },

  async updateProfile(profileData, userId = null) {
    try {
      if (!profileData || typeof profileData !== 'object') {
        throw new Error("Datos de perfil inválidos");
      }
      
      const targetUserId = userId || parseInt(localStorage.getItem('reto21d_userId') || '1');
      const user = await apperService.findById(apperService.tables.users, targetUserId);
      
      if (!user) {
        throw new Error("Usuario no encontrado");
      }
      
      const updatedProfile = {
        ...user.profile,
        ...profileData,
        updatedAt: new Date().toISOString()
      };
      
      await apperService.update(apperService.tables.users, targetUserId, {
        profile: updatedProfile
      });
      
      return updatedProfile;
    } catch (error) {
      console.error('Error actualizando perfil:', error);
      throw error;
    }
  },

  async updateUser(userData, userId = null) {
    try {
      if (!userData || typeof userData !== 'object') {
        throw new Error("Datos de usuario inválidos");
      }
      
      const targetUserId = userId || parseInt(localStorage.getItem('reto21d_userId') || '1');
      
      // Prevent ID modification
      const { Id, ...safeUserData } = userData;
      const updateData = {
        ...safeUserData,
        updatedAt: new Date().toISOString()
      };
      
      const updatedUser = await apperService.update(apperService.tables.users, targetUserId, updateData);
      validateUserData(updatedUser);
      
      return updatedUser;
    } catch (error) {
      console.error('Error actualizando usuario:', error);
      throw error;
    }
  },

  async getNotificationPreferences(userId = null) {
    try {
      const targetUserId = userId || parseInt(localStorage.getItem('reto21d_userId') || '1');
      const user = await apperService.findById(apperService.tables.users, targetUserId);
      
      if (!user) {
        throw new Error("Usuario no encontrado");
      }

      return user.notificationPreferences || this.getDefaultNotificationSettings();
    } catch (error) {
      console.error('Error obteniendo preferencias de notificación:', error);
      throw error;
    }
  },

  async updateNotificationPreferences(preferences) {
    try {
      const userId = parseInt(localStorage.getItem('reto21d_userId') || '1');
      const user = await apperService.findById(apperService.tables.users, userId);
      
      if (!user) {
        throw new Error("Usuario no encontrado");
      }

      let updatedPreferences = { ...user.notificationPreferences };
      
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

      await apperService.update(apperService.tables.users, userId, {
        notificationPreferences: updatedPreferences
      });
      
      return updatedPreferences;
    } catch (error) {
      console.error('Error actualizando preferencias de notificación:', error);
      throw error;
    }
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
    try {
      const targetUserId = userId || parseInt(localStorage.getItem('reto21d_userId') || '1');
      const user = await apperService.findById(apperService.tables.users, targetUserId);
      
      if (!user) {
        throw new Error("Usuario no encontrado");
      }

      return user.role || 'Participante';
    } catch (error) {
      console.error('Error obteniendo tipo de rol:', error);
      throw error;
    }
  },

  async setUserRole(userId, role) {
    try {
      await apperService.update(apperService.tables.users, userId, { role });
      return await apperService.findById(apperService.tables.users, userId);
    } catch (error) {
      console.error('Error estableciendo rol de usuario:', error);
      throw error;
    }
  },

  async getDayZeroStatus() {
    try {
      const userId = parseInt(localStorage.getItem('reto21d_userId') || '1');
      const user = await apperService.findById(apperService.tables.users, userId);
      
      if (!user) {
        throw new Error("Usuario no encontrado");
      }

      return {
        day0_completed: user.day0_completed || false,
        day21_completed: user.day21_completed || false
      };
    } catch (error) {
      console.error('Error obteniendo estado día cero:', error);
      throw error;
    }
  },

  async updateDayZeroStatus(completed = true) {
    try {
      const userId = parseInt(localStorage.getItem('reto21d_userId') || '1');
      
      await apperService.update(apperService.tables.users, userId, {
        day0_completed: completed
      });
      
      const user = await apperService.findById(apperService.tables.users, userId);
      
      return {
        day0_completed: completed,
        day21_completed: user.day21_completed || false
      };
    } catch (error) {
      console.error('Error actualizando estado día cero:', error);
      throw error;
    }
  },

  async getPrivacySettings() {
    try {
      const userId = parseInt(localStorage.getItem('reto21d_userId') || '1');
      const user = await apperService.findById(apperService.tables.users, userId);
      
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
    } catch (error) {
      console.error('Error obteniendo configuración de privacidad:', error);
      throw error;
    }
  },

  async updatePrivacySetting(setting, value) {
    try {
      const userId = parseInt(localStorage.getItem('reto21d_userId') || '1');
      const user = await apperService.findById(apperService.tables.users, userId);
      
      if (!user) {
        throw new Error("Usuario no encontrado");
      }

      const currentSettings = user.privacySettings || {
        dataUsageConsent: true,
        imageShareConsent: true,
        analyticsConsent: true,
        consentDate: new Date().toISOString()
      };

      const updatedSettings = {
        ...currentSettings,
        [setting]: value,
        lastUpdated: new Date().toISOString()
      };

      await apperService.update(apperService.tables.users, userId, {
        privacySettings: updatedSettings
      });

      return updatedSettings;
    } catch (error) {
      console.error('Error actualizando configuración de privacidad:', error);
      throw error;
    }
  },

  async exportUserData(dataType) {
    try {
      const userId = parseInt(localStorage.getItem('reto21d_userId') || '1');
      const user = await apperService.findById(apperService.tables.users, userId);
      
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
    } catch (error) {
      console.error('Error exportando datos de usuario:', error);
      throw error;
    }
  },

  async requestAccountDeletion() {
    try {
      const userId = parseInt(localStorage.getItem('reto21d_userId') || '1');
      const user = await apperService.findById(apperService.tables.users, userId);
      
      if (!user) {
        throw new Error("Usuario no encontrado");
      }

      const deletionRequest = {
        userId: user.Id,
        requestDate: new Date().toISOString(),
        status: 'pending',
        scheduledDeletion: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        confirmationRequired: true
      };

      await apperService.update(apperService.tables.users, userId, {
        deletionRequest: deletionRequest
      });

      return deletionRequest;
    } catch (error) {
      console.error('Error solicitando eliminación de cuenta:', error);
      throw error;
    }
  }
};
