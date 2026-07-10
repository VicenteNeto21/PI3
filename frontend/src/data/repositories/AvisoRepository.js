import { Aviso } from '../../domain/models/Aviso';
import { httpClient } from '../api/httpClient';

export class AvisoRepository {
  async getAll() {
    try {
      const res = await httpClient.get('/passenger/notices');
      if (res && Array.isArray(res)) {
        return res.map(data => new Aviso({
          id: data.id || data.noticeId,
          title: data.title || data.titulo || 'Aviso do Sistema',
          date: data.date || data.data || new Date().toLocaleDateString('pt-BR'),
          description: data.message || data.description || data.descricao || '',
          type: data.type || data.tipo || 'info',
          read: data.read || false
        }));
      }
    } catch (e) {
      if (e.message && (e.message.includes('403') || e.message.includes('Access denied'))) {
        return [];
      }
      throw e;
    }
    return [];
  }

  async add(avisoData) {
    await httpClient.post('/admin/notices', {
      title: avisoData.title,
      message: avisoData.description || avisoData.message
    });
    return await this.getAll();
  }

  async markAsRead(id) {
    await httpClient.post(`/passenger/notices/${id}/read`);
    return await this.getAll();
  }

  async markAllAsRead() {
    await httpClient.post('/passenger/notices/read-all');
    return await this.getAll();
  }
}
