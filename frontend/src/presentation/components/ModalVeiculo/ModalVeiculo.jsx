import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faBus } from '@fortawesome/free-solid-svg-icons';
import { Button } from '../Button/Button';
import './ModalVeiculo.css';

export const ModalVeiculo = ({ show, onClose, veiculo }) => {
  if (!show) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        
        <div className="modal-header-custom">
          <button className="modal-close-btn" onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
          <div className="d-flex align-items-center gap-3">
            <div className="bg-white text-dark rounded-circle d-flex align-items-center justify-content-center" style={{ width: 40, height: 40 }}>
              <FontAwesomeIcon icon={faBus} className="fs-5" style={{ color: '#2A0041' }} />
            </div>
            <div>
              <h4 className="m-0 fw-bold fs-5">Detalhes do Veículo</h4>
              <p className="m-0 opacity-75 small">Consulta de informações cadastradas</p>
            </div>
          </div>
        </div>

        <div className="modal-body-custom">
          <div className="form-group mb-3">
            <label className="modal-label">Identificação / Modelo</label>
            <input 
              type="text" 
              className="form-control modal-input" 
              defaultValue={veiculo?.modelo || `Ônibus Escolar nº ${veiculo?.id}`} 
              readOnly 
            />
          </div>

          <div className="row mb-3 g-3">
            <div className="col-sm-6">
              <label className="modal-label">Placa</label>
              <input 
                type="text" 
                className="form-control modal-input text-uppercase" 
                defaultValue={veiculo?.placa || ''} 
                readOnly 
              />
            </div>
            <div className="col-sm-6">
              <label className="modal-label">Ano de fabricação</label>
              <input 
                type="text" 
                className="form-control modal-input" 
                defaultValue={veiculo?.ano || ''} 
                readOnly 
              />
            </div>
          </div>

          <div className="row mb-4 g-3">
            <div className="col-sm-6">
              <label className="modal-label">Capacidade (Passageiros)</label>
              <input 
                type="text" 
                className="form-control modal-input" 
                defaultValue={veiculo?.capacidade || ''} 
                readOnly 
              />
            </div>
            <div className="col-sm-6">
              <label className="modal-label">Acessibilidade</label>
              <input 
                type="text" 
                className="form-control modal-input" 
                defaultValue={veiculo?.acessibilidade ? 'Sim (Possui Elevador)' : 'Não'} 
                readOnly 
              />
            </div>
          </div>

          <div className="d-flex flex-column flex-sm-row gap-3 mt-4 pt-2 border-top">
            <Button type="button" className="btn-report-problem w-100">
              Reportar problema
            </Button>
            <Button type="button" className="btn-cadastrar-modal w-100" onClick={onClose}>
              Salvar / Fechar
            </Button>
          </div>
        </div>
        
      </div>
    </div>
  );
};
