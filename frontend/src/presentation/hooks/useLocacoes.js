import { useState, useEffect } from 'react';
import { LocacaoRepository } from '../../data/repositories/LocacaoRepository';
import { GetLocacoesUseCase } from '../../domain/usecases/GetLocacoesUseCase';
import { logger } from '../../utils/logger';

const locacaoRepository = new LocacaoRepository();
const getLocacoesUseCase = new GetLocacoesUseCase(locacaoRepository);

export const useLocacoes = () => {
  const [locacoes, setLocacoes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLocacoes = async () => {
    setLoading(true);
    try {
      const data = await getLocacoesUseCase.execute();
      setLocacoes(data);
    } catch (error) {
      logger.error('LOCAÇÕES', 'Erro ao buscar locações na API:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocacoes();
  }, []);

  return {
    locacoes,
    loading,
    refetch: fetchLocacoes
  };
};
