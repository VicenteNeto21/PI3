import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { Button } from '../../components/Button/Button';
import { ProfileIcon } from '../../components/ProfileIcon/ProfileIcon';
import { httpClient } from '../../../data/api/httpClient';
import './Rotas.css';

const ROTA_MOCK = ['Cosmos', 'Praça da Matriz', 'Praça Gentil Cardoso', 'Policlínica', 'UFC'];

export const Rotas = () => {
  const navigate = useNavigate();
  const [stops, setStops] = useState(ROTA_MOCK);
  const [routeName, setRouteName] = useState('Rota Atual');
  const [routeId, setRouteId] = useState(null);
  const [tripId, setTripId] = useState(null);
  const [tripStatus, setTripStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);

  useEffect(() => {
    httpClient.get('/driver/routes').then((data) => {
      if (data && Array.isArray(data) && data.length > 0) {
        const r = data[0];
        setRouteName(r.name || r.nome || 'Rota Atual');
        setRouteId(r.id || r.routeId || null);
        setTripId(r.tripId || r.id || null);
        setTripStatus(r.status || '');
        if (Array.isArray(r.stops) && r.stops.length > 0) {
          setStops(r.stops.map(s => s.name || s.stop || s));
        }
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleUpdateStatus = async (status) => {
    if (!tripId) return;
    setStatusLoading(true);
    try {
      await httpClient.put(`/driver/routes/${tripId}/status`, { status });
      setTripStatus(status);
    } catch {
      setTripStatus(status);
    }
    setStatusLoading(false);
  };

  const handleReportProblem = () => {
    const issueType = prompt('Tipo de problema:\n1 - Mecânico\n2 - Elétrico\n3 - Pneu\n4 - Outro');
    if (!issueType) return;
    const description = prompt('Descrição do problema:');
    if (!description) return;
    httpClient.post('/driver/failures', {
      issueType: ['Mecânico', 'Elétrico', 'Pneu', 'Outro'][parseInt(issueType) - 1] || 'Outro',
      severity: 'Médio',
      description
    }).then(() => alert('Problema reportado com sucesso!'))
    .catch(() => alert('Erro ao reportar problema.'));
  };

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
        <h6 className="fw-bold text-dark mb-3 fs-6">{routeName}</h6>

        {loading ? (
          <FontAwesomeIcon icon={faSpinner} spin size="2x" style={{ color: '#2A0041' }} />
        ) : (
          <div className="route-box d-flex align-items-center flex-wrap justify-content-center gap-3 w-100">
            {stops.map((stop, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <FontAwesomeIcon icon={faArrowRight} className="route-arrow" />}
                <span className="route-stop fw-bold">{stop}</span>
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Status da Viagem */}
        {tripStatus && (
          <div className="d-flex gap-2 mt-3 flex-wrap justify-content-center">
            {['Pendente', 'Em Andamento', 'Concluída'].map((s) => (
              <button
                key={s}
                type="button"
                className={`btn btn-sm rounded-pill px-4 fw-semibold ${tripStatus === s ? 'btn-dark' : 'btn-outline-secondary'}`}
                onClick={() => handleUpdateStatus(s)}
                disabled={statusLoading || tripStatus === s}
              >
                {statusLoading && tripStatus !== s ? <FontAwesomeIcon icon={faSpinner} spin className="me-1" /> : null}
                {s}
              </button>
            ))}
          </div>
        )}

        <div className="d-flex gap-3 mt-4 flex-wrap justify-content-center w-100 action-buttons">
          <Button type="button" className="btn-report" onClick={handleReportProblem}>
            Reportar problema no ônibus
          </Button>
          <Button type="button" className="btn-passengers" onClick={() => navigate('/dashboard/rotas/passageiros', { state: { routeId } })}>
            Lista de passageiros
          </Button>
        </div>
      </div>
    </div>
  );
};
