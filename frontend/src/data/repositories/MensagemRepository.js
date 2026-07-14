import { Mensagem } from '../../domain/models/Mensagem';
import { httpClient } from '../api/httpClient';

export class MensagemRepository {
  async getAll() {
    try {
      const res = await httpClient.get('/admin/support-messages');
      if (res && Array.isArray(res)) {
        return res.map(data => new Mensagem({
          id: data.id,
          email: data.email || data.userEmail,
          subject: data.subject || data.assunto || 'Suporte SITI',
          message: data.message || data.mensagem || '',
          date: data.date || data.data || 'Hoje',
          status: data.status || 'Respondido',
          adminEmail: data.adminEmail || 'adm@siti.com'
        }));
      }
    } catch (e) {
      // Perfis não-admin recebem 403 / Access denied ao tentar ler mensagens de suporte de admin
      if (e.message && (e.message.includes('403') || e.message.includes('Access denied'))) {
        return [];
      }
      throw e;
    }
    return [];
  }

  async add(mensagemData) {
    await httpClient.post('/passenger/support', mensagemData);
    return await this.getAll();
  }
}
