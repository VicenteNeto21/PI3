import { Locacao } from '../../domain/models/Locacao';
import { httpClient, STORAGE_KEY, storage } from '../api/httpClient';
import { logger } from '../../utils/logger';

export class LocacaoRepository {
  async getAll() {
    try {
      const stored = storage.getItem(STORAGE_KEY);
      let role = '';
      if (stored) {
        const user = JSON.parse(stored);
        role = user?.role ? String(user.role).toUpperCase() : '';
      }

      if (role === 'DRIVE' || role === 'DRIVER' || role === 'MOTORISTA') {
        logger.info('ROTAS', '🚌 Buscando passageiros por parada do motorista...');
        const res = await httpClient.get('/driver/passengers-by-stop');
        if (res && Array.isArray(res)) {
          return res.map(data => new Locacao({
            id: data.id,
            nome: data.nome,
            estudantes: (data.estudantes || []).map(p => ({
              id: p.id,
              nome: p.nome,
              status: p.status || 'Pendente'
            }))
          }));
        }
        return [];
      }

      const endpoint = role === 'USER' || role === 'ALUNO' || role === 'PASSENGER'
        ? '/passenger/routes' : '/admin/routes';

      logger.info('ROTAS', `🗺️ Buscando paradas/rotas em: ${endpoint}`);
      const res = await httpClient.get(endpoint);
      if (res && Array.isArray(res)) {
        logger.success('ROTAS', `📍 ${res.length} rotas carregadas com sucesso!`);
        return res.map((data, index) => {
          const stopsList = data.stops
            ? (Array.isArray(data.stops) ? data.stops : String(data.stops).split(',').map(s => s.trim()))
            : [];
          const passengersList = data.passengers || data.estudantes || [];
          return new Locacao({
            id: data.id || String(index + 1),
            nome: data.nome || data.name || (stopsList[0] ? `Parada - ${stopsList[0]}` : `Rota ${index + 1}`),
            estudantes: passengersList.map((p, i) => ({
              id: p.id || i + 1,
              nome: p.name || p.nome || 'Estudante Confirmado'
            }))
          });
        });
      }
      logger.warn('ROTAS', '⚠️ Nenhuma rota retornada ou formato inválido.');
      return [];
    } catch (e) {
      logger.error('ROTAS', 'Erro ao buscar dados:', e);
      return [];
    }
  }
}
