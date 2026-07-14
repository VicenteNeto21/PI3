import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowLeft, 
  faLocationDot, 
  faUserGraduate,
  faCheckCircle,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';
import { useLocacoes } from '../../hooks/useLocacoes';
import { httpClient, STORAGE_KEY, storage } from '../../../data/api/httpClient';
import { ProfileIcon } from '../../components/ProfileIcon/ProfileIcon';
import './Passageiros.css';

export const Passageiros = () => {
  const navigate = useNavigate();
  const { locacoes, loading, refetch } = useLocacoes();
  const [boardingId, setBoardingId] = useState(null);

  const handleBoardPassenger = async (passengerId) => {
    setBoardingId(passengerId);
    try {
      const stored = storage.getItem(STORAGE_KEY);
      const role = stored ? JSON.parse(stored)?.role?.toUpperCase() : '';
      if (role === 'DRIVE' || role === 'MOTORISTA') {
        await httpClient.put(`/driver/passengers/${passengerId}/status`, { status: 'Embarcado' });
      }
      if (refetch) refetch();
    } catch {
      // fallback
    }
    setBoardingId(null);
  };

  return (
    <div className="passageiros-container w-100 h-100 d-flex flex-column">
      {/* Cabeçalho */}
      <header className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div className="d-flex align-items-center gap-3">
          <button 
            className="btn-back" 
            onClick={() => navigate(-1)}
            title="Voltar"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
          <div>
            <h4 className="text-dark mb-1 fw-bold">Passageiros por Parada</h4>
            <p className="text-muted mb-0 fs-6">Acompanhe a lista de estudantes confirmados em cada ponto da rota.</p>
          </div>
        </div>
        <ProfileIcon />
      </header>

      {loading ? (
        <div className="text-center py-5 my-auto">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
        </div>
      ) : (
        <div className="locations-list pb-4">
          {locacoes.map((loc) => (
            <div key={loc.id} className="location-card shadow-sm">
              <div className="location-accent-bar"></div>
              
              <div className="location-header d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-2">
                  <div className="location-icon-box">
                    <FontAwesomeIcon icon={faLocationDot} />
                  </div>
                  <h6 className="mb-0 fw-bold text-dark">{loc.nome}</h6>
                </div>
                <span className="badge-count">
                  {loc.estudantes.length} {loc.estudantes.length === 1 ? 'aluno' : 'alunos'}
                </span>
              </div>
              
              <div className="student-list">
                {loc.estudantes.map((est) => (
                  <div key={est.id} className="student-item d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center gap-2">
                      <div className="student-avatar">
                        <FontAwesomeIcon icon={faUserGraduate} />
                      </div>
                      <span className="student-name">{est.nome}</span>
                      {est.status && (
                        <span className={`badge ${est.status === 'Embarcado' ? 'bg-success' : 'bg-warning text-dark'} ms-2`} style={{ fontSize: '0.7rem' }}>
                          {est.status}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-success rounded-pill px-3"
                      onClick={() => handleBoardPassenger(est.id)}
                      disabled={boardingId === est.id || est.status === 'Embarcado'}
                    >
                      {boardingId === est.id ? (
                        <FontAwesomeIcon icon={faSpinner} spin />
                      ) : est.status === 'Embarcado' ? (
                        <><FontAwesomeIcon icon={faCheckCircle} className="me-1" />A bordo</>
                      ) : (
                        'Embarcar'
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
