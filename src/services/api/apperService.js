// Apper Database Service - Handles all database operations through Apper SDK
class ApperService {
constructor() {
    this.isInitialized = false;
    this.isInitializing = false;
    this.connectionState = 'disconnected'; // 'disconnected', 'connecting', 'connected', 'failed'
    this.apper = null;
    this.retryAttempts = 0;
    this.maxRetryAttempts = 3;
    this.tables = {
      users: 'users',
      progress: 'progress', 
      healthMetrics: 'health_metrics',
      dayPlans: 'day_plans',
      habits: 'habits',
      miniChallenges: 'mini_challenges',
      cohortMembers: 'cohort_members',
      notifications: 'notifications',
      calendar: 'calendar',
      photos: 'photos'
    };
  }

  // Get current connection state
  getConnectionState() {
    return this.connectionState;
  }

  // Manual retry method
  async retry() {
    this.retryAttempts = 0;
    this.connectionState = 'disconnected';
    this.isInitialized = false;
    this.isInitializing = false;
    return this.initialize();
  }

async initialize() {
    if (this.isInitialized) return { success: true, state: 'connected' };
    if (this.isInitializing) {
      while (this.isInitializing) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return { success: this.isInitialized, state: this.connectionState };
    }

    this.isInitializing = true;
    this.connectionState = 'connecting';

    try {
      if (!import.meta.env.VITE_APPER_PROJECT_ID || !import.meta.env.VITE_APPER_PUBLIC_KEY) {
        throw new Error('CREDENTIALS_MISSING');
      }

      const sdkLoaded = await this.waitForSDK();
      if (!sdkLoaded) throw new Error('SDK_TIMEOUT');

      this.apper = new window.Apper({
        projectId: import.meta.env.VITE_APPER_PROJECT_ID,
        publicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      await Promise.race([
        this.apper.connect(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('CONNECTION_TIMEOUT')), 15000)
        )
      ]);

      this.isInitialized = true;
      this.connectionState = 'connected';
      this.retryAttempts = 0;
      
      return { success: true, state: 'connected' };

    } catch (error) {
      this.connectionState = 'failed';
      
      let userMessage = 'Error conectando con la base de datos';
      let canRetry = false;

      if (error.message === 'CREDENTIALS_MISSING') {
        userMessage = 'Credenciales no configuradas';
      } else if (error.message === 'SDK_TIMEOUT') {
        userMessage = 'SDK no se cargó. Verifica tu conexión';
        canRetry = true;
      } else if (error.message === 'CONNECTION_TIMEOUT') {
        userMessage = 'Tiempo de conexión agotado';
        canRetry = true;
      } else {
        canRetry = true;
      }

      if (canRetry && this.retryAttempts < this.maxRetryAttempts) {
        this.retryAttempts++;
        const retryDelay = Math.min(1000 * Math.pow(2, this.retryAttempts - 1), 5000);
        
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        this.isInitializing = false;
        return this.initialize();
      }

      const finalError = new Error(userMessage);
      finalError.canRetry = canRetry && this.retryAttempts >= this.maxRetryAttempts;
      throw finalError;

    } finally {
      this.isInitializing = false;
    }
  }

  async waitForSDK() {
    const maxAttempts = 150; // 30 seconds at 200ms intervals
    let attempts = 0;
    
    while (!window.Apper && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 200));
      attempts++;
    }
    
    return !!window.Apper;
  }

  async query(tableName, options = {}) {
    await this.initialize();
    
    try {
      return await this.apper.table(tableName).select(options);
    } catch (error) {
      console.error(`Error consultando tabla ${tableName}:`, error);
      throw error;
    }
  }

  async create(tableName, data) {
    await this.initialize();
    
    try {
      return await this.apper.table(tableName).insert(data);
    } catch (error) {
      console.error(`Error creando registro en ${tableName}:`, error);
      throw error;
    }
  }

  async update(tableName, id, data) {
    await this.initialize();
    
    try {
      return await this.apper.table(tableName).update(id, data);
    } catch (error) {
      console.error(`Error actualizando registro ${id} en ${tableName}:`, error);
      throw error;
    }
  }

  async delete(tableName, id) {
    await this.initialize();
    
    try {
      return await this.apper.table(tableName).delete(id);
    } catch (error) {
      console.error(`Error eliminando registro ${id} de ${tableName}:`, error);
      throw error;
    }
  }

  async findById(tableName, id) {
    await this.initialize();
    
    try {
      const result = await this.apper.table(tableName).select({ 
        where: { Id: id },
        limit: 1 
      });
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error(`Error buscando registro ${id} en ${tableName}:`, error);
      throw error;
    }
  }

  async findWhere(tableName, conditions) {
    await this.initialize();
    
    try {
      return await this.apper.table(tableName).select({ where: conditions });
    } catch (error) {
      console.error(`Error buscando registros en ${tableName}:`, error);
      throw error;
    }
  }
}

// Export singleton instance
export const apperService = new ApperService();