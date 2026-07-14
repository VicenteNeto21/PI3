import { useState, useEffect } from 'react';
import { AvisoRepository } from '../../data/repositories/AvisoRepository';
import { GetAvisosUseCase } from '../../domain/usecases/GetAvisosUseCase';
import { MarkAvisoAsReadUseCase } from '../../domain/usecases/MarkAvisoAsReadUseCase';
import { AddAvisoUseCase } from '../../domain/usecases/AddAvisoUseCase';
import { logger } from '../../utils/logger';

// Instâncias singleton de repositório para manter o estado na sessão
const avisoRepository = new AvisoRepository();
const getAvisosUseCase = new GetAvisosUseCase(avisoRepository);
const markAvisoAsReadUseCase = new MarkAvisoAsReadUseCase(avisoRepository);
const addAvisoUseCase = new AddAvisoUseCase(avisoRepository);

export const useAvisos = () => {
  const [avisos, setAvisos] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAvisos = async () => {
    setLoading(true);
    try {
      const data = await getAvisosUseCase.execute();
      setAvisos(data);
    } catch (error) {
      logger.error('AVISOS', 'Erro ao carregar avisos na API:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvisos();
  }, []);

  const unreadCount = avisos.filter(a => !a.read).length;

  const markAsRead = async (id) => {
    logger.info('AVISOS', `👀 Marcando aviso como lido: ID ${id}`);
    const updated = await markAvisoAsReadUseCase.execute(id);
    setAvisos(updated);
  };

  const markAllAsRead = async () => {
    logger.success('AVISOS', '📖 Marcando todos os avisos como lidos.');
    const updated = await markAvisoAsReadUseCase.execute(null);
    setAvisos(updated);
  };

  const addAviso = async (avisoData) => {
    logger.info('AVISOS', `📢 Adicionando novo aviso: "${avisoData?.titulo || avisoData?.title || 'Sem título'}"`);
    const updated = await addAvisoUseCase.execute(avisoData);
    setAvisos(updated);
    logger.success('AVISOS', '✅ Aviso publicado com sucesso!');
  };

  return {
    avisos,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    addAviso
  };
};
