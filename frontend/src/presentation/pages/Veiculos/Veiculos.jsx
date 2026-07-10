import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWheelchair } from '@fortawesome/free-solid-svg-icons';
import { ModalVeiculo } from '../../components/ModalVeiculo/ModalVeiculo';
import { ProfileIcon } from '../../components/ProfileIcon/ProfileIcon';
import { useVeiculos } from '../../hooks/useVeiculos';
import './Veiculos.css';

export const Veiculos = () => {
  const { veiculos, selectedVeiculo, loading, handleOpenModal, handleCloseModal } = useVeiculos();

  return (
    <div className="veiculos-container w-100 h-100 d-flex flex-column">
      <header className="d-flex justify-content-between align-items-center mb-5">
        <div>
          <h3 className="fw-bold mb-1 text-dark">Seja bem-vindo!</h3>
          <p className="text-muted mb-0 fs-6">Monitoramento e Gestão da Frota em tempo real.</p>
        </div>
        <ProfileIcon />
      </header>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
        </div>
      ) : (
        <div className="veiculos-grid mt-2">
          {veiculos.map((veiculo) => (
            <div 
              key={veiculo.id} 
              className={`veiculo-card ${veiculo.isManutencao() ? 'manutencao' : 'ativo'}`}
              onClick={() => handleOpenModal(veiculo)}
              style={{ cursor: 'pointer' }}
            >
              <h5 className="fw-bold mb-3 fs-6">Ônibus Escolar nº {veiculo.id}</h5>
              <div className="veiculo-info">
                <p>Placa: {veiculo.placa}</p>
                <p>Status: {veiculo.status}</p>
                <p>Capacidade: {veiculo.capacidade}</p>
                <p>Ano de fabricação:<br/>{veiculo.ano}</p>
              </div>
              
              {veiculo.acessibilidade && (
                <div className="accessibility-icon">
                  <FontAwesomeIcon icon={faWheelchair} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <ModalVeiculo 
        show={!!selectedVeiculo} 
        onClose={handleCloseModal} 
        veiculo={selectedVeiculo} 
      />
    </div>
  );
};
