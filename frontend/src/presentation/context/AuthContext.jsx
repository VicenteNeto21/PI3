import React, { createContext, useState, useEffect } from 'react';
import { AuthRepository } from '../../data/repositories/AuthRepository';
import { LoginUseCase } from '../../domain/usecases/LoginUseCase';
import { logger } from '../../utils/logger';

export const AuthContext = createContext();

const authRepository = new AuthRepository();
const loginUseCase = new LoginUseCase(authRepository);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      logger.info('AUTH CONTEXT', '🔄 Inicializando autenticação da aplicação...');
      const user = await authRepository.getCurrentUser();
      setCurrentUser(user);
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (roleOrEmail, password = '', selectedRole = null) => {
    setLoading(true);
    try {
      const user = await loginUseCase.execute(roleOrEmail, password, selectedRole);
      setCurrentUser(user);
      return user;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    logger.auth('LOGOUT', '🚪 Realizando logout no contexto da aplicação...');
    await authRepository.logout();
    setCurrentUser(null);
  };

  const switchRole = async (newRole) => {
    logger.info('AUTH CONTEXT', `🔀 Alternando perfil de usuário para: ${newRole.toUpperCase()}`);
    return await login(newRole);
  };

  return (
    <AuthContext.Provider value={{ currentUser, loading, login, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
};
