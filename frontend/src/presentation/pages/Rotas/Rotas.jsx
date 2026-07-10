import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { Button } from '../../components/Button/Button';
import { ProfileIcon } from '../../components/ProfileIcon/ProfileIcon';
import './Rotas.css';

export const Rotas = () => {
  const navigate = useNavigate();
  return (
    <div className="rotas-container w-100 h-100 d-flex flex-column">
      <header className="d-flex justify-content-between align-items-center mb-5">
        <div>
          <h3 className="fw-bold mb-1 text-dark">Monitoramento de Rotas</h3>
          <p className="text-muted mb-0 fs-6">Acompanhe os trajetos e paradas do transporte escolar.</p>
        </div>
        <ProfileIcon />
      </header>

      <div className="flex-grow-1 d-flex flex-column align-items-center justify-content-start mt-5 pt-4">
        <h6 className="fw-bold text-dark mb-3 fs-6">Rota Atual</h6>

        <div className="route-box d-flex align-items-center flex-wrap justify-content-center gap-3 w-100">
          <span className="route-stop fw-bold">Cosmos</span>
          <FontAwesomeIcon icon={faArrowRight} className="route-arrow" />
          <span className="route-stop fw-bold">Praça da Matriz</span>
          <FontAwesomeIcon icon={faArrowRight} className="route-arrow" />
          <span className="route-stop fw-bold">Praça Gentil Cardoso</span>
          <FontAwesomeIcon icon={faArrowRight} className="route-arrow" />
          <span className="route-stop fw-bold">Policlínica</span>
          <FontAwesomeIcon icon={faArrowRight} className="route-arrow" />
          <span className="route-stop fw-bold">UFC</span>
        </div>

        <div className="d-flex gap-3 mt-4 flex-wrap justify-content-center w-100 action-buttons">
          <Button type="button" className="btn-report">
            Reportar problema no ônibus
          </Button>
          <Button type="button" className="btn-passengers" onClick={() => navigate('/dashboard/rotas/passageiros')}>
            Lista de passageiros
          </Button>
        </div>
      </div>
    </div>
  );
};
