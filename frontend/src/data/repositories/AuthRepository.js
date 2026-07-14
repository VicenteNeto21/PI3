import { Usuario } from '../../domain/models/Usuario';
import { httpClient, STORAGE_KEY, mapRoleToFrontend, storage } from '../api/httpClient';
import { logger } from '../../utils/logger';

export class AuthRepository {
  async login(roleOrEmail, password = '', selectedRole = null) {
    const email = (roleOrEmail && roleOrEmail.includes('@')) 
      ? roleOrEmail 
      : (selectedRole ? `${selectedRole}@siti.com` : 'motorista@siti.com');
    
    const senha = password || '123456'; // Senha padrão caso não informada

    logger.auth('LOGIN', `⏳ Invocando API de autenticação para: ${email}`);
    try {
      const res = await httpClient.post('/auth/login', { email, password: senha });
      if (res && (res.token || res.accessKey || res.user)) {
        const userRole = mapRoleToFrontend(res.role || selectedRole || 'aluno');
        const userData = {
          id: String(res.user?.id || '1'),
          nome: res.user?.name || res.user?.nome || email.split('@')[0],
          email: res.user?.email || email,
          role: userRole,
          token: res.token || res.accessKey,
          accessKey: res.token || res.accessKey,
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80'
        };
        storage.setItem(STORAGE_KEY, JSON.stringify(userData));
        logger.auth('SUCESSO', `🎉 Autenticado como ${userData.nome} (${userRole.toUpperCase()})`);
        return new Usuario(userData);
      }
      logger.auth('FALHA', `⚠️ Resposta inválida da API ao tentar autenticar ${email}`);
      throw new Error('Falha ao autenticar com a API');
    } catch (err) {
      logger.auth('ERRO', `❌ Falha no login para ${email}`, err);
      throw err;
    }
  }

  async getCurrentUser() {
    const stored = storage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.token) {
          httpClient.get('/auth/authenticate').catch(() => {});
        }
        logger.info('SESSÃO', `👤 Sessão ativa restaurada para: ${parsed.email || parsed.nome}`);
        return new Usuario(parsed);
      } catch (e) {
        logger.error('SESSÃO', 'Erro ao ler usuário da sessão no storage:', e);
      }
    }
    return null;
  }

  async logout() {
    logger.auth('LOGOUT', '👋 Removendo sessão local do usuário.');
    storage.removeItem(STORAGE_KEY);
    return null;
  }
}
