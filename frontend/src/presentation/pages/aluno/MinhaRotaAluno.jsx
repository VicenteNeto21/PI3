import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faArrowLeft, faWheelchair } from '@fortawesome/free-solid-svg-icons';
import { ProfileIcon } from '../../components/ProfileIcon/ProfileIcon';
import { useAuth } from '../../hooks/useAuth';
import { usePerfil } from '../../hooks/usePerfil';
import { httpClient, storage } from '../../../data/api/httpClient';
import { PollRepository } from '../../../data/repositories/PollRepository';
import './MinhaRotaAluno.css';

const MOCK_ROTAS = [
  {
    linha: 'Linha 01 - Centro / Universitária',
    motorista: 'Everton Peres Neto',
    telefone: '(88) 9999-9999',
    veiculo: 'ABC-1234 (Volare W9)',
    pontos: [
      'Cosmos',
      'Praça da Matriz',
      'Praça Gentil Cardoso',
      'Policlínica',
      'UFC - Campus Benfica'
    ]
  },
  {
    linha: 'Linha 02 - Sul / Campus Novo',
    motorista: 'Roberto Silva',
    telefone: '(85) 98888-7777',
    veiculo: 'DEF-5678 (Mercedes OF-1519)',
    pontos: [
      'Terminal Sul',
      'Shopping Sul',
      'Praça da Estação',
      'Hospital Regional',
      'IFCE - Campus Central',
      'UFC - Campus Pici'
    ]
  },
  {
    linha: 'Linha 03 - Norte / Itaperi',
    motorista: 'Marcos Oliveira',
    telefone: '(85) 97777-6666',
    veiculo: 'GHI-9012 (Volksbus 15.190)',
    pontos: [
      'Terminal Norte',
      'Av. Dom Luís',
      'Praça Portugal',
      'UECE - Campus Itaperi',
      'Centro Universitário (UNIFOR)'
    ]
  }
];

export const MinhaRotaAluno = ({ tipo = 'Saída' }) => {
  const { currentUser } = useAuth();
  const storageKey = tipo === 'Saída' ? 'siti_voto_saida' : 'siti_voto_retorno';
  const horarioKey = `${storageKey}_horarios_lista`;
  const submittedKey = `${storageKey}_enviado`;

  const [rotasCompletas, setRotasCompletas] = useState(MOCK_ROTAS);
  const [driverContact, setDriverContact] = useState(null);

  useEffect(() => {
    httpClient.get('/passenger/routes').then((data) => {
      if (data && Array.isArray(data) && data.length > 0) {
        const mapeadas = data.map((r) => ({
          linha: r.name || r.nome || `Rota ${r.code || r.id}`,
          motorista: r.driverName || MOCK_ROTAS.find(m => m.linha.includes(r.name?.split(' - ')[0] || ''))?.motorista || 'Motorista',
          telefone: r.driverPhone || MOCK_ROTAS.find(m => m.linha.includes(r.name?.split(' - ')[0] || ''))?.telefone || '(00) 0000-0000',
          veiculo: r.bus || r.vehicle || MOCK_ROTAS.find(m => m.linha.includes(r.name?.split(' - ')[0] || ''))?.veiculo || 'Ônibus',
          pontos: Array.isArray(r.stops) ? r.stops : []
        }));
        setRotasCompletas(mapeadas);
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    httpClient.get('/passenger/contacts').then((data) => {
      if (data?.driver) {
        setDriverContact(data.driver);
      }
    }).catch(() => {});
  }, []);

  const [pontoSelecionado, setPontoSelecionado] = useState(() => {
    return storage.getItem(storageKey) || null;
  });

  const [horariosSelecionados, setHorariosSelecionados] = useState(() => {
    const salvo = storage.getItem(horarioKey);
    if (!salvo) {
      const antigo = storage.getItem(`${storageKey}_horario`);
      return antigo ? [antigo] : [];
    }
    try {
      const p = JSON.parse(salvo);
      return Array.isArray(p) ? p : [salvo];
    } catch (e) {
      return [salvo];
    }
  });

  const [rotaSelecionada, setRotaSelecionada] = useState(() => {
    const salva = storage.getItem(`${storageKey}_rota_info`);
    if (salva) {
      try { return JSON.parse(salva); } catch (e) { return null; }
    }
    const salvoPonto = storage.getItem(storageKey);
    if (salvoPonto) {
      return rotasCompletas.find(r => r.pontos.includes(salvoPonto)) || rotasCompletas[0];
    }
    return null;
  });

  const [isSubmitted, setIsSubmitted] = useState(() => {
    return storage.getItem(submittedKey) === 'true';
  });

  const [step, setStep] = useState(() => {
    if (storage.getItem(submittedKey) === 'true') return 4;
    const salvoPonto = storage.getItem(storageKey);
    const salvoHorarios = storage.getItem(horarioKey) || storage.getItem(`${storageKey}_horario`);
    if (salvoPonto && salvoHorarios) return 3;
    if (salvoPonto) return 2;
    return 1;
  });

  // Horários disponíveis na enquete
  const [horariosEnquete, setHorariosEnquete] = useState([
    '07:00',
    '09:00',
    '12:00',
    '17:00',
    '19:00'
  ]);
  const horarios = horariosEnquete;

  useEffect(() => {
    const salvoPonto = storage.getItem(storageKey);
    const salvoHorarios = storage.getItem(horarioKey) || storage.getItem(`${storageKey}_horario`);
    const salvaRota = storage.getItem(`${storageKey}_rota_info`);
    const env = storage.getItem(submittedKey) === 'true';
    
    setPontoSelecionado(salvoPonto || null);
    setIsSubmitted(env);

    if (salvoHorarios) {
      try {
        const p = JSON.parse(salvoHorarios);
        setHorariosSelecionados(Array.isArray(p) ? p : [salvoHorarios]);
      } catch (e) {
        setHorariosSelecionados([salvoHorarios]);
      }
    } else {
      setHorariosSelecionados([]);
    }

    if (salvaRota) {
      try { setRotaSelecionada(JSON.parse(salvaRota)); } catch (e) { setRotaSelecionada(null); }
    } else if (salvoPonto) {
      setRotaSelecionada(rotasCompletas.find(r => r.pontos.includes(salvoPonto)) || rotasCompletas[0]);
    } else {
      setRotaSelecionada(null);
    }

    if (env) {
      setStep(4);
    } else if (salvoPonto && salvoHorarios) {
      setStep(3);
    } else if (salvoPonto) {
      setStep(2);
    } else {
      setStep(1);
    }
  }, [tipo, storageKey, horarioKey, submittedKey]);

  const handleSelectPonto = (ponto, rota) => {
    setPontoSelecionado(ponto);
    setRotaSelecionada(rota);
    storage.setItem(storageKey, ponto);
    storage.setItem(`${storageKey}_rota_info`, JSON.stringify(rota));
    setStep(2);
  };

  const handleSelectHorario = (hora) => {
    setHorariosSelecionados((prev) => {
      const exists = prev.includes(hora);
      const atualizados = exists 
        ? prev.filter(h => h !== hora) 
        : [...prev, hora].sort();
      storage.setItem(horarioKey, JSON.stringify(atualizados));
      return atualizados;
    });
  };

  const handleProximo = () => {
    if (horariosSelecionados.length === 0) return;
    setStep(3);
  };

  const [pollOptions, setPollOptions] = useState({ boardingStops: [], alightingStops: [], schedules: [] });
  const [isEnqueteOpen, setIsEnqueteOpen] = useState(() => {
    return localStorage.getItem('siti_enquete_aberta') === 'true';
  });

  useEffect(() => {
    const pollRepo = new PollRepository();
    pollRepo.getActivePolls().then((res) => {
      if (res && Array.isArray(res) && res.length > 0) {
        setIsEnqueteOpen(true);
      }
    }).catch(() => {});

    pollRepo.getPollOptions(1).then((res) => {
      if (res) setPollOptions(res);
      if (res && Array.isArray(res.schedules) && res.schedules.length > 0) {
        setHorariosEnquete(res.schedules.map(s => s.time || s));
      }
    }).catch(() => {});
  }, []);

  const handleEnviar = async () => {
    const boardingStop = pollOptions.boardingStops?.[0];
    const alightingStop = pollOptions.alightingStops?.[0];
    const schedule = pollOptions.schedules?.[0];
    try {
      const pollRepo = new PollRepository();
      await pollRepo.vote({
        pollId: 1,
        boardingStopId: boardingStop?.id || 1,
        boardingScheduleId: schedule?.id || 2,
        alightingStopId: alightingStop?.id || 4,
        alightingScheduleId: schedule?.id || 5
      });
    } catch (e) {
      // Falha silenciosa ou fallback local
    }
    storage.setItem(submittedKey, 'true');
    setIsSubmitted(true);
    setStep(4);
  };

  const handleEditar = () => {
    storage.setItem(submittedKey, 'false');
    setIsSubmitted(false);
    setStep(1);
  };

  const { userProfile } = usePerfil();
  const nomeCompleto = userProfile?.name || currentUser?.name || 'Estudante';
  const primeiroNome = nomeCompleto.split(' ')[0];

  const contatoAtual = driverContact || {};
  const rotaAtual = rotaSelecionada || rotasCompletas.find(r => r.pontos.includes(pontoSelecionado)) || rotasCompletas[0];
  const todosPontos = React.useMemo(() => {
    if (pollOptions.boardingStops && pollOptions.boardingStops.length > 0) {
      return pollOptions.boardingStops.map((s) => ({
        ponto: s.street || s.nome || s,
        rota: rotasCompletas[0] || { linha: 'Linha 01 - Centro / Universitária' }
      }));
    }
    return rotasCompletas.flatMap(r => r.pontos.map(p => ({ ponto: p, rota: r })));
  }, [pollOptions.boardingStops, rotasCompletas]);

  if (!isEnqueteOpen) {
    return (
      <div className="minha-rota-aluno-container w-100 h-100 d-flex flex-column">
        <header className="d-flex justify-content-between align-items-center mb-4 pb-2">
          <h2 className="aluno-header-title m-0">
            Olá, {primeiroNome}!
          </h2>
          <ProfileIcon />
        </header>

        <div className="flex-grow-1 d-flex align-items-center justify-content-center py-4">
          <div className="card shadow-sm border-0 rounded-4 p-5 text-center mx-auto" style={{ maxWidth: '680px', backgroundColor: '#FAF9FC' }}>
            <div className="d-inline-flex align-items-center justify-content-center rounded-circle p-4 mb-4 shadow-sm" style={{ backgroundColor: '#F3E8FF', color: '#7E22CE', width: '88px', height: '88px' }}>
              <span style={{ fontSize: '2.5rem' }}>🔒</span>
            </div>
            <h3 className="fw-bold text-dark mb-2" style={{ color: '#2A0041' }}>
              Enquete em Preparação
            </h3>
            <p className="text-muted fs-6 mb-4">
              A administração está cadastrando as rotas e locais de embarque e desembarque para o transporte universitário.
            </p>
            <div className="p-4 rounded-4 text-start bg-white shadow-sm border" style={{ borderColor: '#EBE5F0' }}>
              <div className="d-flex align-items-center gap-2 mb-2">
                <span className="badge rounded-pill" style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}>Aguardando Liberação</span>
              </div>
              <p className="text-dark small mb-0" style={{ lineHeight: '1.6' }}>
                Assim que a administração concluir o cadastro das rotas e clicar em <strong>Disponibilizar Enquete</strong> no painel de controle, você poderá visualizar os pontos e horários disponíveis e registrar sua escolha aqui.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="minha-rota-aluno-container w-100 h-100 d-flex flex-column">
      {/* Top Bar padronizado */}
      <header className="d-flex justify-content-between align-items-center mb-4 pb-2">
        <h2 className="aluno-header-title m-0">
          Olá, {primeiroNome}!
        </h2>
        <ProfileIcon />
      </header>

      {/* Subtítulo centralizado da Enquete */}
      <div className="text-center mb-4">
        <h5 className="fw-bold m-0" style={{ color: '#2A0041', fontSize: '0.95rem' }}>
          {step === 3 ? 'Enquete para utilização do transporte' : 'Enquete de votação do ônibus.'}
        </h5>
      </div>

      {/* Container que preenche a tela toda */}
      <div className="d-flex justify-content-center align-items-stretch flex-grow-1 pb-3">
        <div className="enquete-card">
          {/* PASSO 1: ESCOLHA DO PONTO */}
          {step === 1 && (
            <div className="d-flex flex-column justify-content-between h-100">
              <div>
                <h4 className="card-paradas-title m-0 mb-3">
                  {tipo === 'Saída' ? 'Ponto de Embarque' : 'Ponto de Desembarque'}
                </h4>

                {/* Timeline Passo 1 */}
                <div className="enquete-timeline-track">
                  <div className="enquete-timeline-node dark-node"></div>
                  <div className="enquete-timeline-line light-line"></div>
                  <div className="enquete-timeline-node light-node"></div>
                  <div className="enquete-timeline-line light-line"></div>
                  <div className="enquete-timeline-node light-node"></div>
                </div>

                {/* Lista Completa das Paradas - 100% Fiel ao Protótipo */}
                <div className="d-flex flex-column gap-3 mx-auto mt-4" style={{ maxWidth: '650px' }}>
                  {todosPontos.map(({ ponto, rota }) => {
                    const isSelected = pontoSelecionado === ponto && rotaSelecionada?.linha === rota.linha;
                    return (
                       <button
                         key={`${rota.linha}-${ponto}`}
                         type="button"
                         onClick={() => handleSelectPonto(ponto, rota)}
                         className={`enquete-btn-ponto ${isSelected ? 'selecionado' : ''}`}
                       >
                         <span>{ponto}</span>
                         {isSelected && (
                           <FontAwesomeIcon icon={faCheckCircle} className="position-absolute end-0 me-3" style={{ fontSize: '0.95rem' }} />
                         )}
                       </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* PASSO 2: ESCOLHA DO HORÁRIO (MÚLTIPLA SELEÇÃO) */}
          {step === 2 && (
            <div className="d-flex flex-column justify-content-between h-100">
              <div>
                {/* Header com Voltar */}
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <button 
                    type="button" 
                    onClick={() => setStep(1)} 
                    className="btn btn-link text-dark p-0 m-0 border-0 shadow-none"
                    style={{ fontSize: '1.25rem' }}
                    title="Voltar"
                  >
                    <FontAwesomeIcon icon={faArrowLeft} />
                  </button>
                  <h4 className="card-paradas-title m-0 flex-grow-1 text-center pe-3">Horários</h4>
                </div>

                {/* Timeline Passo 2 */}
                <div className="enquete-timeline-track">
                  <div className="enquete-timeline-node dark-node"></div>
                  <div className="enquete-timeline-line dark-line"></div>
                  <div className="enquete-timeline-node dark-node"></div>
                  <div className="enquete-timeline-line light-line"></div>
                  <div className="enquete-timeline-node light-node"></div>
                </div>

                {/* Botões dos Horários */}
                <div className="d-flex flex-column gap-3 mx-auto mt-4" style={{ maxWidth: '650px' }}>
                  {horarios.map((hora) => {
                    const isSelected = horariosSelecionados.includes(hora);
                    return (
                       <button
                         key={hora}
                         type="button"
                         onClick={() => handleSelectHorario(hora)}
                         className={`enquete-btn-horario ${isSelected ? 'selecionado' : ''}`}
                       >
                         <span>{hora}</span>
                       </button>
                    );
                  })}
                </div>
              </div>

              {/* Botão Próximo */}
              <div className="mx-auto w-100 mt-4 pt-3" style={{ maxWidth: '650px' }}>
                <button 
                  type="button"
                  onClick={handleProximo}
                  disabled={horariosSelecionados.length === 0}
                  className="btn-proximo-figma w-100 py-3 shadow-sm"
                >
                  Próximo
                </button>
              </div>
            </div>
          )}

          {/* PASSO 3: CONFIRMAÇÃO DO FLUXO (FIEL À IMAGEM 2) */}
          {step === 3 && (
            <div className="d-flex flex-column justify-content-between h-100">
              <div>
                {/* Header com Voltar */}
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <button 
                    type="button" 
                    onClick={() => setStep(2)} 
                    className="btn btn-link text-dark p-0 m-0 border-0 shadow-none"
                    style={{ fontSize: '1.25rem' }}
                    title="Voltar"
                  >
                    <FontAwesomeIcon icon={faArrowLeft} />
                  </button>
                  <h4 className="card-paradas-title m-0 flex-grow-1 text-center pe-3">Confirmação</h4>
                </div>

                {/* Timeline Passo 3 - 100% Preenchida */}
                <div className="enquete-timeline-track">
                  <div className="enquete-timeline-node dark-node"></div>
                  <div className="enquete-timeline-line dark-line"></div>
                  <div className="enquete-timeline-node dark-node"></div>
                  <div className="enquete-timeline-line dark-line"></div>
                  <div className="enquete-timeline-node dark-node"></div>
                </div>

                {/* Resumo da Escolha */}
                <div className="mx-auto mt-4" style={{ maxWidth: '650px' }}>
                  <h6 className="fw-bold text-dark text-center mb-2 fs-5">Local</h6>
                  <div className="enquete-btn-ponto py-3 fw-bold mb-4 shadow-sm" style={{ cursor: 'default' }}>
                    {pontoSelecionado || 'Cosmos'}
                  </div>

                  <h6 className="fw-bold text-dark text-center mb-2 fs-5">Horários</h6>
                  <div className="d-flex flex-column gap-3 mb-4">
                    {horariosSelecionados.length > 0 ? (
                      horariosSelecionados.map((hora) => (
                        <div 
                          key={hora} 
                          className="py-3 fw-bold shadow-sm text-center bg-white rounded-3" 
                          style={{ border: '2px solid #8C00FF', color: '#1A1A1A', fontSize: '1rem', cursor: 'default' }}
                        >
                          {hora}
                        </div>
                      ))
                    ) : (
                      <div 
                        className="py-3 fw-bold shadow-sm text-center bg-white rounded-3" 
                        style={{ border: '2px solid #8C00FF', color: '#1A1A1A', fontSize: '1rem', cursor: 'default' }}
                      >
                        07:00
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Botão Enviar */}
              <div className="mx-auto w-100 mt-4 pt-3" style={{ maxWidth: '650px' }}>
                <button 
                  type="button"
                  onClick={handleEnviar}
                  className="btn-proximo-figma w-100 py-3 shadow-sm"
                  style={{ backgroundColor: '#2A0041', fontSize: '1.1rem' }}
                >
                  Enviar
                </button>
              </div>
            </div>
          )}

          {/* PASSO 4: SUCESSO E ÔNIBUS EM ROTA */}
          {step === 4 && (
            <div className="d-flex flex-column justify-content-center h-100 py-2">
              <div className="mx-auto w-100" style={{ maxWidth: '680px' }}>
                {/* Card 1: Formulário preenchido com sucesso */}
                <div className="confirma-box-card mb-4 text-center p-4">
                  <h5 className="fw-bold text-dark mb-4">Formulário preenchido com sucesso!</h5>
                  <button 
                    type="button"
                    onClick={handleEditar}
                    className="btn-proximo-figma w-100 py-3 shadow-sm"
                    style={{ backgroundColor: '#2A0041', fontSize: '1.05rem' }}
                  >
                    Editar
                  </button>
                </div>

                {/* Card 2: Ônibus em Rota com Acessibilidade */}
                <div className="confirma-box-card position-relative p-4 pb-5">
                  <h5 className="fw-bold text-dark text-center mb-4">Ônibus em Rota ({rotaAtual.veiculo})</h5>
                  <div className="text-start text-dark" style={{ fontSize: '1rem', lineHeight: '1.8' }}>
                    <div><strong>Linha:</strong> {rotaAtual.linha}</div>
                    <div><strong>Motorista:</strong> {contatoAtual.name || rotaAtual.motorista}</div>
                    <div><strong>Telefone:</strong> {contatoAtual.phone || rotaAtual.telefone}</div>
                    <div><strong>Ponto:</strong> {pontoSelecionado}</div>
                    <div><strong>Horário(s):</strong> {horariosSelecionados.join(', ')}</div>
                  </div>
                  <div className="position-absolute bottom-0 end-0 p-3 m-1" style={{ color: '#2A0041', fontSize: '1.85rem' }} title="Veículo com Acessibilidade">
                    <FontAwesomeIcon icon={faWheelchair} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
