import { Veiculo } from '../../domain/models/Veiculo';
import { httpClient, STORAGE_KEY, storage } from '../api/httpClient';
import { logger } from '../../utils/logger';

export class VeiculoRepository {
  async getAll() {
    let endpoint = '/admin/vehicles';
    let isSingle = false;
    try {
      const stored = storage.getItem(STORAGE_KEY);
      if (stored) {
        const user = JSON.parse(stored);
        const role = user?.role ? String(user.role).toUpperCase() : '';
        if (role === 'DRIVE' || role === 'DRIVER' || role === 'MOTORISTA') {
          endpoint = '/driver/vehicle';
          isSingle = true;
        }
      }
    } catch (e) {
      logger.error('VEÍCULOS', 'Erro ao ler role para veiculos:', e);
    }

    logger.info('VEÍCULOS', `🚌 Buscando veículos do endpoint: ${endpoint}`);
    const res = await httpClient.get(endpoint);
    let list = [];
    if (res) {
      if (Array.isArray(res)) {
        list = res;
      } else if (isSingle && (res.id || res.placa || res.plate || res.vehicleId)) {
        list = [res];
      }
    }

    if (list.length > 0) {
      logger.success('VEÍCULOS', `🚍 ${list.length} veículo(s) carregado(s) com sucesso!`);
    } else {
      logger.warn('VEÍCULOS', '⚠️ Nenhum veículo retornado pela API.');
    }

    return list.map(data => new Veiculo({
      id: data.id || data.vehicleId,
      placa: data.placa || data.plate || 'ABC-1234',
      status: data.status || 'Ativo',
      capacidade: data.capacidade || data.capacity || 40,
      ano: data.ano || data.year || 2023,
      acessibilidade: data.acessibilidade !== undefined ? data.acessibilidade : true
    }));
  }
}
