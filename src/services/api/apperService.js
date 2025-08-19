// Apper Database Service - Handles all database operations through Apper SDK
class ApperService {
  constructor() {
    this.isInitialized = false;
    this.apper = null;
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

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Wait for Apper SDK to be available
      let attempts = 0;
      while (!window.Apper && attempts < 30) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }

      if (!window.Apper) {
        throw new Error('Apper SDK no disponible');
      }

      // Initialize Apper with project credentials
      this.apper = new window.Apper({
        projectId: import.meta.env.VITE_APPER_PROJECT_ID,
        publicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      await this.apper.connect();
      this.isInitialized = true;
      console.log('Apper Database conectada exitosamente');
    } catch (error) {
      console.error('Error inicializando Apper:', error);
      throw new Error('No se pudo conectar con la base de datos');
    }
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