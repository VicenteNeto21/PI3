import { useState, useEffect } from 'react';
import { VeiculoRepository } from '../../data/repositories/VeiculoRepository';
import { GetVeiculosUseCase } from '../../domain/usecases/GetVeiculosUseCase';
import { logger } from '../../utils/logger';

const veiculoRepository = new VeiculoRepository();
const getVeiculosUseCase = new GetVeiculosUseCase(veiculoRepository);

export const useVeiculos = () => {
  const [veiculos, setVeiculos] = useState([]);
  const [selectedVeiculo, setSelectedVeiculo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVeiculos = async () => {
      setLoading(true);
      try {
        const data = await getVeiculosUseCase.execute();
        setVeiculos(data);
      } catch (error) {
        logger.error('USE VEÍCULOS', 'Erro ao buscar veículos na API:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVeiculos();
  }, []);

  const handleOpenModal = (veiculo) => {
    logger.info('VEÍCULOS', `🔍 Abrindo detalhes do veículo: Placa ${veiculo?.placa || 'N/A'}`);
    setSelectedVeiculo(veiculo);
  };

  const handleCloseModal = () => {
    logger.info('VEÍCULOS', '❌ Fechando modal do veículo.');
    setSelectedVeiculo(null);
  };

  return {
    veiculos,
    selectedVeiculo,
    loading,
    handleOpenModal,
    handleCloseModal
  };
};
