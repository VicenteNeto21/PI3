import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUserCircle,
  faChevronDown,
  faChevronUp,
  faPhone, 
  faBus, 
  faIdCard, 
  faRoute,
  faCheckCircle,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';
import { ProfileIcon } from '../../components/ProfileIcon/ProfileIcon';
import { useAuth } from '../../hooks/useAuth';
import { httpClient } from '../../../data/api/httpClient';
import './MinhaRotaAluno.css';

const MOCK_MOTORISTAS = [
  {
    id: 1,
    nome: 'Everton Peres Neto',
    veiculo: 'Ônibus n° 09 (Marcopolo Torino / Volvo)',
    placa: 'PNV-4A21',
    telefone: '(85) 99876-5432',
    rota: 'Linha 01 - Centro / Universitária (Saída e Retorno)',
    status: 'Em Operação',
    cnh: '04928172930'
  },
  {
    id: 2,
    nome: 'Romário Andrade Sousa',
    veiculo: 'Ônibus n° 12 (Volare W9 / Mercedes-Benz)',
    placa: 'RAS-8B33',
    telefone: '(85) 98765-4321',
    rota: 'Linha 02 - Sul / Campus Novo',
    status: 'Disponível',
    cnh: '09182736450'
  },
  {
    id: 3,
    nome: 'William Rodrigues Catunda',
    veiculo: 'Ônibus n° 15 (Marcopolo Paradiso / Scania)',
    placa: 'WRC-9C45',
    telefone: '(85) 99123-4567',
    rota: 'Linha 03 - Norte / Campus Pici',
    status: 'Disponível',
    cnh: '01827364591'
  }
];

export const MotoristasAluno = () => {
  const { currentUser } = useAuth();
  const [expandedId, setExpandedId] = useState(null);
  const [motoristasRota, setMotoristasRota] = useState(MOCK_MOTORISTAS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    httpClient.get('/admin/drivers').then((data) => {
      if (data && Array.isArray(data) && data.length > 0) {
        setMotoristasRota(data.map((d, i) => ({
          id: d.id || i + 1,
          nome: d.name || d.nome || 'Motorista',
          veiculo: d.vehicle || d.bus || MOCK_MOTORISTAS[i]?.veiculo || 'Ônibus',
          placa: d.plate || d.placa || MOCK_MOTORISTAS[i]?.placa || 'XXX-0000',
          telefone: d.phone || d.telefone || '(00) 0000-0000',
          rota: d.route || d.rota || `Rota ${i + 1}`,
          status: d.status || 'Disponível',
          cnh: d.cnh || '00000000000'
        })));
      }
    }).catch(() => {
      httpClient.get('/passenger/contacts').then((data) => {
        if (data?.driver) {
          setMotoristasRota([{
            id: 1,
            nome: data.driver.name || 'Motorista',
            veiculo: MOCK_MOTORISTAS[0].veiculo,
            placa: MOCK_MOTORISTAS[0].placa,
            telefone: data.driver.phone || '(00) 0000-0000',
            rota: data.driver.route || 'Rota Atual',
            status: 'Em Operação',
            cnh: '***********'
          }]);
        }
      }).catch(() => {});
    }).finally(() => setLoading(false));
  }, []);

  const toggleAccordion = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const primeiroNome = currentUser?.name 
    ? currentUser.name.split(' ')[0] 
    : 'Bruno';

  return (
    <div className="minha-rota-aluno-container w-100 h-100 d-flex flex-column">
      {/* Top Bar padronizado e alinhado na mesma altura das outras telas */}
      <header className="d-flex justify-content-between align-items-center mb-4 pb-2">
        <h2 className="aluno-header-title m-0">
          Olá, {primeiroNome}!
        </h2>
        <ProfileIcon />
      </header>

      {/* Lista em formato Accordion idêntica ao protótipo */}
      {loading ? (
        <div className="text-center py-5">
          <FontAwesomeIcon icon={faSpinner} spin size="2x" style={{ color: '#2A0041' }} />
        </div>
      ) : (
        <div className="d-flex flex-column gap-3 max-w-100">
          {motoristasRota.map((motorista) => {
            const isOpen = expandedId === motorista.id;
            return (
              <div key={motorista.id} className="w-100">
                <div 
                  className={`motorista-accordion-item ${isOpen ? 'open' : ''}`}
                  onClick={() => toggleAccordion(motorista.id)}
                >
                  <div className="d-flex align-items-center">
                    <FontAwesomeIcon icon={faUserCircle} className="fs-5 me-3 text-dark" />
                    <span>{motorista.nome}</span>
                  </div>
                  <FontAwesomeIcon icon={isOpen ? faChevronUp : faChevronDown} className="text-secondary small" />
                </div>

                {isOpen && (
                  <div className="motorista-accordion-body shadow-sm">
                    <div className="row g-3">
                      <div className="col-md-6 d-flex align-items-center gap-2">
                        <FontAwesomeIcon icon={faPhone} className="text-secondary" style={{ width: '16px' }} />
                        <span><strong>Contato:</strong> {motorista.telefone}</span>
                      </div>
                      <div className="col-md-6 d-flex align-items-center gap-2">
                        <FontAwesomeIcon icon={faBus} className="text-secondary" style={{ width: '16px' }} />
                        <span><strong>Veículo:</strong> {motorista.veiculo}</span>
                      </div>
                      <div className="col-md-6 d-flex align-items-center gap-2">
                        <FontAwesomeIcon icon={faIdCard} className="text-secondary" style={{ width: '16px' }} />
                        <span><strong>Placa:</strong> {motorista.placa}</span>
                      </div>
                      <div className="col-md-6 d-flex align-items-center gap-2">
                        <FontAwesomeIcon icon={faRoute} className="text-secondary" style={{ width: '16px' }} />
                        <span><strong>Atuação:</strong> {motorista.rota}</span>
                      </div>
                    </div>

                    <div className="pt-3 border-top mt-3 d-flex justify-content-between align-items-center">
                      <span className="text-success small fw-semibold">
                        <FontAwesomeIcon icon={faCheckCircle} className="me-1" />
                        Motorista Verificado SITI ({motorista.status})
                      </span>
                      <span className="text-muted small" style={{ fontSize: '0.75rem' }}>
                        CNH: ***{motorista.cnh.slice(-4)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
