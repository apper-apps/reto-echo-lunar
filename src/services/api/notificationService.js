// Mock notifications data
let notifications = [
  {
    Id: 1,
    title: "¡Bienvenidos al Reto 21 Días!",
    message: "Estamos emocionados de acompañarlos en este increíble viaje de transformación. ¡Vamos por todo!",
    type: "info",
    targetUsers: "all",
    sentBy: 1,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    readBy: [],
    status: "sent"
  },
  {
    Id: 2,
    title: "¡Excelente progreso grupal!",
    message: "El grupo mantiene un 78% de adherencia promedio. ¡Sigamos así!",
    type: "success",
    targetUsers: "all",
    sentBy: 1,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    readBy: [],
    status: "sent"
  }
];

export const notificationService = {
  async getRecentNotifications(limit = 20) {
    await new Promise(resolve => setTimeout(resolve, 250));
    
    return JSON.parse(JSON.stringify(notifications.slice(0, limit).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))));
  },

  async sendNotification(notificationData) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    if (!notificationData.title || !notificationData.message) {
      throw new Error("Título y mensaje son obligatorios");
    }
    
    // Calculate recipient count based on target
    let recipientCount = 0;
    switch (notificationData.targetUsers) {
      case 'all':
        recipientCount = 25;
        break;
      case 'active':
        recipientCount = 22;
        break;
      case 'inactive':
        recipientCount = 3;
        break;
      case 'top-performers':
        recipientCount = 10;
        break;
      default:
        recipientCount = 25;
    }
    
    const maxId = notifications.length > 0 ? Math.max(...notifications.map(n => n.Id)) : 0;
    const newNotification = {
      Id: maxId + 1,
      title: notificationData.title,
      message: notificationData.message,
      type: notificationData.type || 'info',
      targetUsers: notificationData.targetUsers || 'all',
      sentBy: 1, // Coach ID
      createdAt: new Date().toISOString(),
      readBy: [],
      status: "sent",
      recipientCount
    };
    
    notifications.unshift(newNotification); // Add to beginning
    return JSON.parse(JSON.stringify(newNotification));
  },

  async getUserNotifications(userId = 1, limit = 50) {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Filter notifications that should be visible to this user
    const userNotifications = notifications.filter(notification => {
      // For simplicity, all users see all notifications in this mock
      // In a real app, you'd filter based on targetUsers and user criteria
      return true;
    }).slice(0, limit);
    
    return JSON.parse(JSON.stringify(userNotifications));
  },

  async markNotificationAsRead(notificationId, userId = 1) {
    await new Promise(resolve => setTimeout(resolve, 150));
    
    if (!Number.isInteger(notificationId) || notificationId <= 0) {
      throw new Error("ID debe ser un número entero positivo");
    }
    
    const notificationIndex = notifications.findIndex(n => n.Id === notificationId);
    if (notificationIndex === -1) {
      throw new Error("Notificación no encontrada");
    }
    
    // Add user to readBy array if not already present
    if (!notifications[notificationIndex].readBy.includes(userId)) {
      notifications[notificationIndex].readBy.push(userId);
    }
    
    return JSON.parse(JSON.stringify(notifications[notificationIndex]));
  },

  async getUnreadCount(userId = 1) {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const unreadNotifications = notifications.filter(notification => 
      !notification.readBy.includes(userId)
    );
    
    return unreadNotifications.length;
  },

  async deleteNotification(id) {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error("ID debe ser un número entero positivo");
    }
    
    const notificationIndex = notifications.findIndex(n => n.Id === id);
    if (notificationIndex === -1) {
      throw new Error("Notificación no encontrada");
    }
    
    notifications.splice(notificationIndex, 1);
    return { success: true };
  },

  async getNotificationStats() {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const stats = {
      totalSent: notifications.length,
      totalRecipients: notifications.reduce((sum, n) => sum + (n.recipientCount || 0), 0),
      averageReadRate: Math.floor(Math.random() * 30) + 65, // 65-95%
      byType: {
        info: notifications.filter(n => n.type === 'info').length,
        success: notifications.filter(n => n.type === 'success').length,
        warning: notifications.filter(n => n.type === 'warning').length,
        error: notifications.filter(n => n.type === 'error').length
      },
      recentActivity: Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        sent: Math.floor(Math.random() * 5),
        read: Math.floor(Math.random() * 15) + 10
      })).reverse()
    };
    
    return JSON.parse(JSON.stringify(stats));
  },

  async sendScheduledNotification(notificationData, scheduleDate) {
    await new Promise(resolve => setTimeout(resolve, 250));
    
    if (!notificationData.title || !notificationData.message) {
      throw new Error("Título y mensaje son obligatorios");
    }
    
    if (!scheduleDate || new Date(scheduleDate) <= new Date()) {
      throw new Error("Fecha de programación debe ser futura");
    }
    
    const maxId = notifications.length > 0 ? Math.max(...notifications.map(n => n.Id)) : 0;
    const scheduledNotification = {
      Id: maxId + 1,
      ...notificationData,
      sentBy: 1,
      createdAt: new Date().toISOString(),
      scheduledFor: scheduleDate,
      status: "scheduled",
      readBy: [],
      recipientCount: 0 // Will be calculated when sent
    };
    
    // In a real app, this would be stored and processed by a scheduler
    notifications.unshift(scheduledNotification);
    return JSON.parse(JSON.stringify(scheduledNotification));
  },

  async getScheduledNotifications() {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const scheduled = notifications.filter(n => n.status === 'scheduled');
    return JSON.parse(JSON.stringify(scheduled));
  },

  async cancelScheduledNotification(id) {
    await new Promise(resolve => setTimeout(resolve, 150));
    
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error("ID debe ser un número entero positivo");
    }
    
    const notificationIndex = notifications.findIndex(n => n.Id === id && n.status === 'scheduled');
    if (notificationIndex === -1) {
      throw new Error("Notificación programada no encontrada");
    }
    
    notifications.splice(notificationIndex, 1);
    return { success: true };
  }
};