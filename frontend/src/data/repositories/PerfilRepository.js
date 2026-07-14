import { httpClient, STORAGE_KEY, storage } from '../api/httpClient';
import { logger } from '../../utils/logger';

const formatDate = (dateStr) => {
  if (!dateStr) return null;
  const str = String(dateStr);
  if (str.includes('-')) {
    const parts = str.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
  }
  return str;
};

export class PerfilRepository {
  async getProfile() {
    let role = 'ALUNO';
    let storedUser = null;

    try {
      const stored = storage.getItem(STORAGE_KEY);
      if (stored) {
        storedUser = JSON.parse(stored);
        if (storedUser.role) {
          role = String(storedUser.role).toUpperCase();
        }
      }
    } catch (e) {
      logger.error('PERFIL', 'Erro ao ler usuário do storage:', e);
    }

    let endpoint = '/auth/authenticate';
    if (role === 'DRIVE' || role === 'DRIVER' || role === 'MOTORISTA') {
      endpoint = '/driver/profile';
    } else if (role === 'USER' || role === 'ALUNO' || role === 'PASSENGER') {
      endpoint = '/passenger/profile';
    }

    logger.info('PERFIL', `👤 Buscando dados de perfil no endpoint: ${endpoint}`);
    let apiData = {};
    try {
      const res = await httpClient.get(endpoint);
      if (res) {
        apiData = res;
        logger.success('PERFIL', '✅ Dados de perfil carregados da API com sucesso!', apiData);
      }
    } catch (err) {
      logger.warn('PERFIL', `⚠️ Não foi possível obter de ${endpoint}, usando fallback de sessão.`, err);
      if (endpoint !== '/auth/authenticate') {
        try {
          const authRes = await httpClient.get('/auth/authenticate');
          if (authRes) apiData = authRes;
        } catch {
          // ignora fallback
        }
      }
    }

    const mapRoleDisplay = (r) => {
      if (!r) return '';
      const upper = String(r).toUpperCase();
      if (upper === 'ADMIN' || upper === 'ADM') return 'Coordenador / Administrador';
      if (upper === 'DRIVE' || upper === 'DRIVER' || upper === 'MOTORISTA') return 'Motorista';
      if (upper === 'USER' || upper === 'ALUNO' || upper === 'PASSENGER') return 'Estudante';
      return r;
    };

    const roleCode = String(apiData.role || storedUser?.role || role || '').toUpperCase();

    return {
      name: apiData.name || apiData.nome || storedUser?.nome || '',
      email: apiData.email || storedUser?.email || '',
      role: mapRoleDisplay(roleCode),
      roleCode: roleCode,
      status: apiData.status || storedUser?.status || 'Ativo',
      avatarUrl: apiData.photoUrl || apiData.avatar || storedUser?.avatar || null,
      
      // Campos dinâmicos vindos diretamente da API
      cpf: apiData.cpf ? String(apiData.cpf).replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') : null,
      phone: apiData.phone || apiData.telefone || null,
      registration: apiData.registration || apiData.matricula || null,
      institution: apiData.institution || apiData.department || apiData.setor || null,
      cnh: apiData.cnh || null,
      category: apiData.category || null,
      birthDate: formatDate(apiData.birthDate),
      validity: formatDate(apiData.validity),
      adminId: (roleCode === 'ADMIN' || roleCode === 'ADM') ? String(apiData.id || storedUser?.id || '') : null,
      trips: Array.isArray(apiData.trips) ? apiData.trips : [],
      assignedVehicle: apiData.assignedVehicle || null,

      settings: {
        notifications: true,
        whatsappAlerts: true,
        autoReport: false,
      }
    };
  }

  async updateProfile(payload) {
    let role = 'ALUNO';
    let storedUser = null;

    try {
      const stored = storage.getItem(STORAGE_KEY);
      if (stored) {
        storedUser = JSON.parse(stored);
        if (storedUser.role) {
          role = String(storedUser.role).toUpperCase();
        }
      }
    } catch (e) {
      logger.error('PERFIL', 'Erro ao ler usuário do storage:', e);
    }

    let endpoint = '/auth/profile';
    if (role === 'DRIVE' || role === 'DRIVER' || role === 'MOTORISTA') {
      endpoint = '/driver/profile';
    } else if (role === 'USER' || role === 'ALUNO' || role === 'PASSENGER') {
      endpoint = '/passenger/profile';
    }

    logger.info('PERFIL', `💾 Enviando atualização de perfil para o banco de dados da API (${endpoint})...`, payload);

    let successApi = false;
    try {
      const res = await httpClient.put(endpoint, payload);
      if (res) {
        logger.success('PERFIL', '✅ Perfil atualizado no banco de dados da API com sucesso!', res);
        successApi = true;
      }
    } catch (err) {
      logger.warn('PERFIL', `⚠️ Falha ao atualizar via PUT ${endpoint}. Tentando endpoint geral /auth/profile...`, err);
      if (endpoint !== '/auth/profile') {
        try {
          await httpClient.put('/auth/profile', payload);
          successApi = true;
          logger.success('PERFIL', '✅ Perfil atualizado via /auth/profile com sucesso!');
        } catch (e2) {
          logger.warn('PERFIL', '💡 DICA: O backend Spring Boot precisa ser REINICIADO para reconhecer o novo endpoint PUT criado na API. Salvando alterações na sessão da aplicação...');
        }
      } else {
        logger.warn('PERFIL', '💡 DICA: O backend Spring Boot precisa ser REINICIADO para reconhecer o novo endpoint PUT. Salvando alterações na sessão da aplicação...');
      }
    }

    const currentProfile = await this.getProfile();
    const mergedProfile = {
      ...currentProfile,
      ...payload
    };

    // Atualiza o storage com os novos dados modificados para manter consistência imediata no frontend
    try {
      const stored = storage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (payload.name) {
          parsed.nome = payload.name;
          parsed.name = payload.name;
        }
        if (payload.email) parsed.email = payload.email;
        if (payload.status) parsed.status = payload.status;
        storage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      }
    } catch (e) {
      // ignora
    }

    return mergedProfile;
  }
}

