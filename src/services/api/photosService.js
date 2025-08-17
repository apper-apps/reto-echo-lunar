// Mock photos data
let photos = [];

export const photosService = {
  async getPhotosByPhase(phase) {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const userPhotos = photos.find(p => p.user_id === 1 && p.phase === phase);
    if (!userPhotos) {
      return null;
    }
    
    return JSON.parse(JSON.stringify(userPhotos));
  },

async savePhotos(phase, photoUrls) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const existingIndex = photos.findIndex(p => p.user_id === 1 && p.phase === phase);
    const maxId = photos.length > 0 ? Math.max(...photos.map(p => p.Id)) : 0;
    
    const photoRecord = {
      Id: existingIndex >= 0 ? photos[existingIndex].Id : maxId + 1,
      user_id: 1,
      cohort_id: 1,
      phase: phase,
      foto_frente_url: photoUrls.foto_frente_url || null,
      foto_espalda_url: photoUrls.foto_espalda_url || null,
      foto_perfil_url: photoUrls.foto_perfil_url || null,
      created_at: existingIndex >= 0 ? photos[existingIndex].created_at : new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      photos[existingIndex] = photoRecord;
    } else {
      photos.push(photoRecord);
    }

    return JSON.parse(JSON.stringify(photoRecord));
  },

  async deletePhotos(phase) {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const photoIndex = photos.findIndex(p => p.user_id === 1 && p.phase === phase);
    if (photoIndex === -1) {
      throw new Error(`Fotos de la fase ${phase} no encontradas`);
    }
    
    photos.splice(photoIndex, 1);
    return true;
  }
};