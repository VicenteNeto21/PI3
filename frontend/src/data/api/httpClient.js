import { logger } from '../../utils/logger';
export const STORAGE_KEY = 'siti_current_user';
export const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// Gerenciador de armazenamento em sessão / memória da aplicação
const inMemoryStore = {};

export const storage = {
  getItem(key) {
    try {
      const val = sessionStorage.getItem(key);
      if (val !== null) return val;
    } catch (e) {
      // ignora se sessionStorage não estiver disponível
    }
    return inMemoryStore[key] || null;
  },
  setItem(key, value) {
    try {
      sessionStorage.setItem(key, value);
    } catch (e) {
      // ignora
    }
    inMemoryStore[key] = value;
  },
  removeItem(key) {
    try {
      sessionStorage.removeItem(key);
    } catch (e) {
      // ignora
    }
    delete inMemoryStore[key];
  }
};

export const mapRoleToBackend = (role) => {
  if (!role) return 'USER';
  const r = role.toLowerCase();
  if (r === 'adm' || r === 'admin') return 'ADMIN';
  if (r === 'motorista' || r === 'drive' || r === 'driver') return 'DRIVE';
  return 'USER';
};

export const mapRoleToFrontend = (role) => {
  if (!role) return 'aluno';
  const r = role.toUpperCase();
  if (r === 'ADMIN') return 'adm';
  if (r === 'DRIVE' || r === 'DRIVER') return 'motorista';
  return 'aluno';
};

const getHeaders = (customHeaders = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };

  try {
    const stored = storage.getItem(STORAGE_KEY);
    if (stored) {
      const user = JSON.parse(stored);
      const token = user.token || user.accessKey;
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      if (user.role) {
        headers['Role'] = mapRoleToBackend(user.role);
      }
    }
  } catch (e) {
    logger.error('SESSÃO', 'Erro ao ler token da sessão:', e);
  }

  return headers;
};

export const httpClient = {
  async request(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
    const headers = getHeaders(options.headers);

    const config = {
      ...options,
      headers,
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    const method = config.method || 'GET';
    const startTime = performance.now();
    logger.http(method, endpoint);

    try {
      const response = await fetch(url, config);
      const elapsed = Math.round(performance.now() - startTime);

      if (!response.ok) {
        let errorMsg = `Erro HTTP ${response.status}`;
        try {
          const errData = await response.json();
          if (errData.erro || errData.error || errData.message) {
            errorMsg = errData.erro || errData.error || errData.message;
          }
        } catch {
          // ignora se não for JSON
        }
        logger.http(method, endpoint, response.status, elapsed, new Error(errorMsg));
        throw new Error(errorMsg);
      }

      logger.http(method, endpoint, response.status, elapsed);

      if (response.status === 204 || response.headers.get('content-length') === '0') {
        return null;
      }

      try {
        return await response.json();
      } catch {
        return null;
      }
    } catch (err) {
      if (!err.message.startsWith('Erro HTTP')) {
        const elapsed = Math.round(performance.now() - startTime);
        logger.http(method, endpoint, null, elapsed, err);
      }
      throw err;
    }
  },

  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  },

  post(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: 'POST', body });
  },

  put(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: 'PUT', body });
  },

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
};
