import { httpClient } from '../api/httpClient';
import { logger } from '../../utils/logger';

export class PollRepository {
  async getActivePolls() {
    logger.info('POLLS', '🗳️ Buscando enquetes ativas em /api/polls/active...');
    try {
      const res = await httpClient.get('/api/polls/active');
      if (res && Array.isArray(res) && res.length > 0) {
        logger.success('POLLS', `🗳️ ${res.length} enquete(s) ativa(s) carregada(s)!`);
        return res;
      }
      return [];
    } catch (error) {
      logger.error('POLLS', 'Erro ao carregar enquetes ativas:', error);
      return [];
    }
  }

  async getPollOptions(pollId) {
    logger.info('POLLS', `📋 Buscando opções da enquete ${pollId} em /api/polls/${pollId}/options...`);
    try {
      const res = await httpClient.get(`/api/polls/${pollId}/options`);
      return res || { boardingStops: [], alightingStops: [], schedules: [] };
    } catch (error) {
      logger.error('POLLS', `Erro ao carregar opções da enquete ${pollId}:`, error);
      return { boardingStops: [], alightingStops: [], schedules: [] };
    }
  }

  async vote(payload) {
    logger.info('POLLS', '🗳️ Enviando voto para /passenger/polls/vote...', payload);
    try {
      const res = await httpClient.post('/passenger/polls/vote', payload);
      logger.success('POLLS', '✅ Voto registrado com sucesso na API!');
      return res;
    } catch (error) {
      logger.error('POLLS', 'Erro ao registrar voto na API:', error);
      throw error;
    }
  }
}
