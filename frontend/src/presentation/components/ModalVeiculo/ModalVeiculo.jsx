import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faBus, faExclamationTriangle, faPaperPlane, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../hooks/useAuth';
import { httpClient } from '../../../data/api/httpClient';
import { logger } from '../../../utils/logger';
import './ModalVeiculo.css';

export const ModalVeiculo = ({ show, onClose, veiculo }) => {
  const { currentUser } = useAuth();
  const role = currentUser?.role || '';
  const canReport = role === 'adm' || role === 'motorista' || role === 'driver';

  const [showReport, setShowReport] = useState(false);
  const [reportText, setReportText] = useState('');
  const [reportStatus, setReportStatus] = useState(''); // '' | 'sending' | 'success' | 'error'

  const handleReport = async (e) => {
    e.preventDefault();
    if (!reportText.trim()) return;
    setReportStatus('sending');
    try {
      await httpClient.post('/passenger/support', {
        subject: `Problema no Veículo: ${veiculo?.modelo || veiculo?.placa || 'Ônibus'}`,
        message: `Placa: ${veiculo?.placa || 'N/A'} — ${reportText}`,
        vehiclePlate: veiculo?.placa || ''
      });
      logger.success('MODAL VEÍCULO', '✅ Reporte enviado com sucesso!');
      setReportStatus('success');
      setReportText('');
      setTimeout(() => {
        setReportStatus('');
        setShowReport(false);
      }, 2500);
    } catch (err) {
      logger.error('MODAL VEÍCULO', 'Erro ao enviar reporte:', err);
      setReportStatus('error');
    }
  };

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
                defaultValue={veiculo?.acessibilidade === true || veiculo?.acessibilidade === 'Sim (Elevador)' || veiculo?.acessibilidade === 'Sim' ? 'Sim (Possui Elevador)' : 'Não'} 
                readOnly 
              />
            </div>
          </div>

          {/* Botão Reportar - visível apenas para ADM e Motorista */}
          {canReport && !showReport && (
            <div className="d-flex mt-2 pt-2 border-top">
              <button
                type="button"
                className="btn-report-problem w-100"
                onClick={() => { setShowReport(true); setReportStatus(''); }}
              >
                <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
                Reportar problema
              </button>
            </div>
          )}

          {/* Formulário inline de reporte */}
          {canReport && showReport && (
            <form onSubmit={handleReport} className="mt-2 pt-2 border-top">
              <label className="modal-label mb-1">Descreva o problema:</label>
              <textarea
                className="form-control mb-2"
                rows={3}
                placeholder="Ex: Pneu furado, freio com problema, ar-condicionado quebrado..."
                value={reportText}
                onChange={e => setReportText(e.target.value)}
                style={{ borderRadius: '8px', fontSize: '0.9rem', resize: 'none' }}
                disabled={reportStatus === 'sending' || reportStatus === 'success'}
              />
              {reportStatus === 'success' && (
                <div className="alert alert-success d-flex align-items-center gap-2 py-2 mb-2" style={{ fontSize: '0.85rem' }}>
                  <FontAwesomeIcon icon={faCheckCircle} />
                  Reporte enviado com sucesso!
                </div>
              )}
              {reportStatus === 'error' && (
                <div className="alert alert-danger py-2 mb-2" style={{ fontSize: '0.85rem' }}>
                  Erro ao enviar. Tente novamente.
                </div>
              )}
              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-light border flex-grow-1"
                  onClick={() => { setShowReport(false); setReportText(''); setReportStatus(''); }}
                  style={{ borderRadius: '8px', fontSize: '0.85rem' }}
                  disabled={reportStatus === 'sending'}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn flex-grow-1 text-white fw-bold"
                  style={{ background: 'linear-gradient(135deg, #9D00FF 0%, #6800AC 100%)', borderRadius: '8px', fontSize: '0.85rem' }}
                  disabled={reportStatus === 'sending' || !reportText.trim()}
                >
                  <FontAwesomeIcon icon={faPaperPlane} className="me-2" />
                  {reportStatus === 'sending' ? 'Enviando...' : 'Enviar Reporte'}
                </button>
              </div>
            </form>
          )}
        </div>
        
      </div>
    </div>
  );
};
