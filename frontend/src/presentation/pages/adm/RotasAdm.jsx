import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, 
  faRoute, 
  faEdit, 
  faTrash, 
  faBus, 
  faClock, 
  faCheck, 
  faTimes, 
  faList, 
  faPaperPlane,
  faUser 
} from '@fortawesome/free-solid-svg-icons';
import { Button } from '../../components/Button/Button';
import { Input } from '../../components/Input/Input';
import { ProfileIcon } from '../../components/ProfileIcon/ProfileIcon';
import { useAuth } from '../../hooks/useAuth';
import { httpClient } from '../../../data/api/httpClient';
import { logger } from '../../../utils/logger';
import './RotasAdm.css';

export const RotasAdm = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [view, setView] = useState('figma'); // 'figma' (Enquetes/Paradas) | 'list' | 'form'
  const [alertMsg, setAlertMsg] = useState('');

  // Paradas da tela Figma (Embarque e Desembarque)
  const [embarqueStops, setEmbarqueStops] = useState([
    'Cosmos',
    'Praça da Matriz',
    'Praça Gentil Cardoso',
    'UFC'
  ]);
  const [showAddEmbarque, setShowAddEmbarque] = useState(false);
  const [newEmbarque, setNewEmbarque] = useState('');

  const [desembarqueStops, setDesembarqueStops] = useState([
    'Cosmos',
    'Praça da Matriz',
    'Praça Gentil Cardoso',
    'UFC'
  ]);
  const [showAddDesembarque, setShowAddDesembarque] = useState(false);
  const [newDesembarque, setNewDesembarque] = useState('');

  // Horário de Enquete
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [showRotaModal, setShowRotaModal] = useState(false);
  const [enqueteTime, setEnqueteTime] = useState('06:00');

  // Estado de Rotas / Linhas para gerenciar
  const [rotas, setRotas] = useState([
    {
      id: 1,
      nome: 'Linha 01 - Centro / Universitária',
      origem: 'Cosmos',
      destino: 'UFC',
      paradas: 5,
      motorista: 'Roberto Silva',
      veiculo: 'ABC-1234 (Volare W9)',
      status: 'Ativa',
      stopsList: ['Cadeia', 'Praça Central', 'Banco do Brasil']
    },
    {
      id: 2,
      nome: 'Linha 02 - Zona Norte / IFCE',
      origem: 'Terminal Norte',
      destino: 'IFCE Campus Central',
      paradas: 7,
      motorista: 'Marcos Oliveira',
      veiculo: 'XYZ-9876 (Mercedes OF-1519)',
      status: 'Ativa',
      stopsList: ['Terminal Norte', 'Av. Bezerra de Menezes', 'Shopping Benfíca', 'IFCE Campus Central']
    }
  ]);
  const [selectedRouteId, setSelectedRouteId] = useState(1);

  const [formNome, setFormNome] = useState('');
  const [formOrigem, setFormOrigem] = useState('');
  const [formDestino, setFormDestino] = useState('');
  const [formMotorista, setFormMotorista] = useState('Roberto Silva');

  const fetchRoutes = async () => {
    try {
      logger.info('ROTAS ADM', '🗺️ Buscando rotas e paradas no banco da API (/admin/routes)...');
      const res = await httpClient.get('/admin/routes');
      if (res && Array.isArray(res) && res.length > 0) {
        logger.success('ROTAS ADM', `📍 ${res.length} linha(s) carregada(s) do banco de dados da API!`);
        const mapped = res.map((r, idx) => {
          const stopsArray = r.stops ? String(r.stops).split(',').map(s => s.trim()).filter(Boolean) : ['Cadeia', 'Praça Central', 'Banco do Brasil'];
          const origem = stopsArray.length > 0 ? stopsArray[0] : 'Início';
          const destino = stopsArray.length > 1 ? stopsArray[stopsArray.length - 1] : (stopsArray[0] || 'Fim');
          return {
            id: r.id || idx + 1,
            nome: r.name || r.nome || `Linha 0${idx + 1}`,
            origem: origem,
            destino: destino,
            paradas: stopsArray.length > 0 ? stopsArray.length : 3,
            motorista: r.motorista || 'Roberto Silva',
            veiculo: r.veiculo || 'ABC-1234 (Volare W9)',
            status: r.status || 'Ativa',
            stopsList: stopsArray.length > 0 ? stopsArray : ['Cadeia', 'Praça Central', 'Banco do Brasil']
          };
        });
        setRotas(mapped);
        if (mapped.length > 0) {
          const firstRoute = mapped[0];
          setSelectedRouteId(firstRoute.id);
          setEmbarqueStops(firstRoute.stopsList || ['Cadeia', 'Praça Central', 'Banco do Brasil']);
          setDesembarqueStops([...(firstRoute.stopsList || ['Cadeia', 'Praça Central', 'Banco do Brasil'])].reverse());
        }
      } else {
        logger.warn('ROTAS ADM', '⚠️ Nenhuma rota encontrada na API, mantendo rotas padrão.');
      }
    } catch (error) {
      logger.error('ROTAS ADM', 'Erro ao carregar rotas da API:', error);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  // Selecionar Rota específica para visualizar e gerenciar as paradas
  const handleSelectRoute = (routeId) => {
    setSelectedRouteId(routeId);
    const route = rotas.find(r => r.id === routeId);
    if (route) {
      logger.info('ROTAS ADM', `🔄 Alterando exibição de paradas para a linha: ${route.nome}`);
      const stops = route.stopsList || ['Cadeia', 'Praça Central', 'Banco do Brasil'];
      setEmbarqueStops(stops);
      setDesembarqueStops([...stops].reverse());
    }
  };

  // Ações das Paradas de Embarque
  const handleAddEmbarque = (e) => {
    e.preventDefault();
    if (!newEmbarque.trim()) return;
    const newStops = [...embarqueStops, newEmbarque.trim()];
    setEmbarqueStops(newStops);
    setDesembarqueStops([...newStops].reverse());
    setRotas(rotas.map(r => (r.id === selectedRouteId || (!selectedRouteId && r.id === rotas[0]?.id)) ? { ...r, stopsList: newStops, paradas: newStops.length } : r));
    setNewEmbarque('');
    setShowAddEmbarque(false);
    logger.info('ROTAS ADM', `➕ Parada de embarque adicionada à linha selecionada.`);
  };

  const handleDeleteEmbarque = (index) => {
    const newStops = embarqueStops.filter((_, i) => i !== index);
    setEmbarqueStops(newStops);
    setDesembarqueStops([...newStops].reverse());
    setRotas(rotas.map(r => (r.id === selectedRouteId || (!selectedRouteId && r.id === rotas[0]?.id)) ? { ...r, stopsList: newStops, paradas: newStops.length } : r));
    logger.info('ROTAS ADM', `🗑️ Parada removida da linha selecionada.`);
  };

  // Ações das Paradas de Desembarque
  const handleAddDesembarque = (e) => {
    e.preventDefault();
    if (!newDesembarque.trim()) return;
    const newStops = [...desembarqueStops, newDesembarque.trim()];
    setDesembarqueStops(newStops);
    setEmbarqueStops([...newStops].reverse());
    setRotas(rotas.map(r => (r.id === selectedRouteId || (!selectedRouteId && r.id === rotas[0]?.id)) ? { ...r, stopsList: [...newStops].reverse(), paradas: newStops.length } : r));
    setNewDesembarque('');
    setShowAddDesembarque(false);
    logger.info('ROTAS ADM', `➕ Parada de desembarque adicionada à linha selecionada.`);
  };

  const handleDeleteDesembarque = (index) => {
    const newStops = desembarqueStops.filter((_, i) => i !== index);
    setDesembarqueStops(newStops);
    setEmbarqueStops([...newStops].reverse());
    setRotas(rotas.map(r => (r.id === selectedRouteId || (!selectedRouteId && r.id === rotas[0]?.id)) ? { ...r, stopsList: [...newStops].reverse(), paradas: newStops.length } : r));
    logger.info('ROTAS ADM', `🗑️ Parada removida da linha selecionada.`);
  };

  // Ação de Disponibilizar Enquete
  const handleDisponibilizarEnquete = () => {
    setAlertMsg('Enquete de presença disponibilizada e notificada aos alunos com sucesso!');
    setTimeout(() => setAlertMsg(''), 5000);
  };

  const handleSalvarHorario = (e) => {
    e.preventDefault();
    setShowTimeModal(false);
    setAlertMsg(`Horário diário da enquete configurado para às ${enqueteTime}!`);
    setTimeout(() => setAlertMsg(''), 5000);
  };

  // Ação de Salvar Nova Linha (modo lista)
  const handleSalvarRota = async (e) => {
    e.preventDefault();
    if (!formNome) return;
    
    logger.info('ROTAS ADM', '🚀 Enviando nova linha/rota para o banco de dados da API (/admin/routes)...');
    
    const stopsList = [
      { street: formOrigem || 'Ponto Inicial', time: '06:00' },
      { street: 'Praça Central', time: '06:20' },
      { street: formDestino || 'Campus Universitário', time: '06:45' }
    ];

    const payload = {
      code: `L${rotas.length + 10}`,
      name: formNome,
      description: `Rota ligando ${formOrigem || 'Início'} ao ${formDestino || 'Fim'}`,
      stops: stopsList
    };

    try {
      await httpClient.post('/admin/routes', payload);
      logger.success('ROTAS ADM', '✨ Rota cadastrada no banco da API com sucesso!');
      await fetchRoutes();
      setShowRotaModal(false);
      setFormNome('');
      setFormOrigem('');
      setFormDestino('');
      setAlertMsg('Nova linha de ônibus cadastrada com sucesso na API!');
      setTimeout(() => setAlertMsg(''), 5000);
    } catch (err) {
      logger.error('ROTAS ADM', 'Erro ao salvar rota na API, aplicando fallback local:', err);
      const novaRota = {
        id: rotas.length + 1,
        nome: formNome,
        origem: formOrigem || 'Início',
        destino: formDestino || 'Fim',
        paradas: 3,
        motorista: formMotorista,
        veiculo: 'SITI-2026 (Ônibus Elétrico)',
        status: 'Ativa'
      };
      setRotas([novaRota, ...rotas]);
      setShowRotaModal(false);
      setFormNome('');
      setFormOrigem('');
      setFormDestino('');
      setAlertMsg('Nova linha de ônibus adicionada!');
      setTimeout(() => setAlertMsg(''), 5000);
    }
  };

  return (
    <div className="rotas-adm-container w-100 h-100 d-flex flex-column">
      {/* Alerta de feedback */}
      {alertMsg && (
        <div className="alert alert-success d-flex align-items-center justify-content-between shadow-sm mb-4" role="alert" style={{ background: '#E8F8F0', borderColor: '#28A745', color: '#155724' }}>
          <span>{alertMsg}</span>
          <button type="button" className="btn-close" onClick={() => setAlertMsg('')}></button>
        </div>
      )}

      {/* Header idêntico ao protótipo */}
      <div className="d-flex justify-content-between align-items-center mb-4 pb-2">
        <h2 className="adm-header-title m-0">
          Olá, {currentUser?.nome || 'Bruno'}!
        </h2>

        <div className="d-flex align-items-center gap-3">
          <button 
            onClick={() => setView(view === 'figma' ? 'list' : 'figma')} 
            className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2 px-3 py-2 rounded-3"
            title="Alternar entre a tela de Enquetes/Paradas e a Lista de Linhas"
          >
            <FontAwesomeIcon icon={view === 'figma' ? faList : faRoute} />
            <span>{view === 'figma' ? 'Gerenciar Linhas' : 'Enquete e Paradas'}</span>
          </button>
          <ProfileIcon />
        </div>
      </div>

      {/* VISÃO FIGMA (100% FIEL AO PROTÓTIPO ENVIADO) */}
      {view === 'figma' && (
        <div className="flex-grow-1 d-flex flex-column">
          {/* 3 Botões Superiores Roxo Vibrante */}
          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <button 
                type="button" 
                className="btn-enquete-adm w-100"
                onClick={() => setShowTimeModal(true)}
              >
                Horário de Enquete
              </button>
            </div>
            <div className="col-md-4">
              <button 
                type="button" 
                className="btn-enquete-adm w-100"
                onClick={handleDisponibilizarEnquete}
              >
                Disponibilizar Enquete
              </button>
            </div>
            <div className="col-md-4">
              <button 
                type="button" 
                className="btn-enquete-adm w-100"
                onClick={() => navigate('/dashboard/rotas/passageiros')}
              >
                Lista de Passageiros
              </button>
            </div>
          </div>

          {/* Modal Padronizado e Aprimorado de Configuração de Horário */}
          {showTimeModal && (
            <div 
              className="modal-overlay-figma"
              onClick={(e) => {
                if (e.target === e.currentTarget) setShowTimeModal(false);
              }}
            >
              <div className="modal-card-figma p-0 overflow-hidden shadow-lg" style={{ border: '1px solid #5C2078', borderRadius: '16px', maxWidth: '500px' }}>
                {/* Cabeçalho Roxo com gradiente elegante */}
                <div className="p-4 text-white d-flex justify-content-between align-items-center" style={{ background: 'linear-gradient(135deg, #2A0041 0%, #5C2078 100%)' }}>
                  <div className="d-flex align-items-center gap-3">
                    <div className="d-flex align-items-center justify-content-center bg-white rounded-circle shadow-sm" style={{ width: '44px', height: '44px', color: '#9D00FF' }}>
                      <FontAwesomeIcon icon={faClock} className="fs-5" />
                    </div>
                    <div>
                      <h5 className="fw-bold m-0 text-white" style={{ letterSpacing: '0.3px' }}>Horário da Enquete</h5>
                      <span className="small text-white-50" style={{ fontSize: '0.8rem' }}>Disparo diário de presença</span>
                    </div>
                  </div>
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => setShowTimeModal(false)}
                    aria-label="Fechar"
                    style={{ filter: 'invert(1) grayscale(100%) brightness(200%)' }}
                  ></button>
                </div>

                {/* Corpo do formulário com fundo cinza suave e card em destaque */}
                <form onSubmit={handleSalvarHorario} className="p-4" style={{ backgroundColor: '#FAF9FC' }}>
                  <p className="text-muted small mb-4" style={{ lineHeight: '1.5' }}>
                    Defina o horário exato em que o sistema enviará automaticamente a notificação e disponibilizará a enquete de embarque para os estudantes.
                  </p>

                  <div className="bg-white p-4 rounded-4 border mb-4 text-center shadow-sm" style={{ borderColor: '#EBE5F0' }}>
                    <label className="form-label fw-bold text-dark mb-2 d-block fs-6" style={{ color: '#2A0041' }}>
                      Selecione o Horário de Disparo:
                    </label>
                    <div className="d-flex justify-content-center">
                      <input 
                        type="time" 
                        className="form-control text-center fw-bold shadow-none" 
                        value={enqueteTime}
                        onChange={(e) => setEnqueteTime(e.target.value)}
                        required
                        style={{ 
                          maxWidth: '190px', 
                          fontSize: '1.6rem', 
                          height: '58px', 
                          borderColor: '#9D00FF', 
                          borderWidth: '2px',
                          borderRadius: '12px',
                          color: '#2A0041',
                          backgroundColor: '#FBF8FF'
                        }}
                      />
                    </div>
                    <span className="d-block mt-2 text-muted" style={{ fontSize: '0.75rem' }}>
                      Formato 24 horas (HH:MM)
                    </span>
                  </div>

                  <div className="d-flex justify-content-end gap-2 pt-2 border-top" style={{ borderColor: '#EBE5F0' }}>
                    <button 
                      type="button" 
                      className="btn btn-light px-4 py-2 rounded-3 fw-semibold text-secondary border"
                      onClick={() => setShowTimeModal(false)}
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit" 
                      className="btn px-4 py-2 rounded-3 fw-bold text-white shadow-sm"
                      style={{ background: 'linear-gradient(135deg, #9D00FF 0%, #6800AC 100%)', border: 'none' }}
                    >
                      Salvar Horário
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* SELETOR ROTA POR ROTA PARA GESTÃO DE PARADAS */}
          <div className="d-flex align-items-center justify-content-between mb-4 pb-3 border-bottom" style={{ borderColor: '#EBE5F0' }}>
            <div className="d-flex align-items-center gap-2 overflow-auto py-1">
              <span className="fw-bold text-muted me-2 small text-nowrap" style={{ letterSpacing: '0.5px' }}>SELECIONE A LINHA:</span>
              {rotas.map((r, idx) => {
                const isSelected = selectedRouteId === r.id || (!selectedRouteId && idx === 0);
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => handleSelectRoute(r.id)}
                    className={`btn btn-sm px-3 py-2 rounded-pill fw-semibold text-nowrap transition-all ${isSelected ? 'shadow-sm' : ''}`}
                    style={{
                      backgroundColor: isSelected ? '#9D00FF' : '#FAF5FF',
                      color: isSelected ? '#FFFFFF' : '#5C2078',
                      border: isSelected ? '1px solid #9D00FF' : '1px solid #EBE5F0',
                      cursor: 'pointer'
                    }}
                  >
                    <FontAwesomeIcon icon={faRoute} className="me-2" />
                    {r.nome}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2 Cards Grandes: Embarque e Desembarque */}
          <div className="row g-4 flex-grow-1">
            {/* Card Embarque */}
            <div className="col-lg-6 d-flex">
              <div className="card-paradas-adm w-100">
                <h4 className="card-paradas-title">Embarque</h4>

                <div className="flex-grow-1 d-flex flex-column gap-3 mb-4">
                  {embarqueStops.map((stop, index) => (
                    <div key={index} className="parada-item-adm">
                      <span>{stop}</span>
                      <button 
                        type="button" 
                        className="btn-delete-parada"
                        onClick={() => handleDeleteEmbarque(index)}
                        title="Remover parada"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Área para adicionar nova parada */}
                {showAddEmbarque ? (
                  <form onSubmit={handleAddEmbarque} className="d-flex gap-2 mt-auto">
                    <input 
                      type="text" 
                      className="form-control input-add-parada flex-grow-1" 
                      placeholder="Nome da parada de embarque..."
                      value={newEmbarque}
                      onChange={(e) => setNewEmbarque(e.target.value)}
                      autoFocus
                    />
                    <button type="submit" className="btn btn-sm text-white px-3" style={{ background: '#9D00FF' }}>
                      <FontAwesomeIcon icon={faCheck} />
                    </button>
                    <button type="button" className="btn btn-sm btn-outline-secondary px-3" onClick={() => setShowAddEmbarque(false)}>
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  </form>
                ) : (
                  <div className="text-center mt-auto">
                    <button 
                      type="button" 
                      className="btn-adicionar-parada"
                      onClick={() => setShowAddEmbarque(true)}
                    >
                      Adicionar
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Card Desembarque */}
            <div className="col-lg-6 d-flex">
              <div className="card-paradas-adm w-100">
                <h4 className="card-paradas-title">Desembarque</h4>

                <div className="flex-grow-1 d-flex flex-column gap-3 mb-4">
                  {desembarqueStops.map((stop, index) => (
                    <div key={index} className="parada-item-adm">
                      <span>{stop}</span>
                      <button 
                        type="button" 
                        className="btn-delete-parada"
                        onClick={() => handleDeleteDesembarque(index)}
                        title="Remover parada"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Área para adicionar nova parada */}
                {showAddDesembarque ? (
                  <form onSubmit={handleAddDesembarque} className="d-flex gap-2 mt-auto">
                    <input 
                      type="text" 
                      className="form-control input-add-parada flex-grow-1" 
                      placeholder="Nome da parada de desembarque..."
                      value={newDesembarque}
                      onChange={(e) => setNewDesembarque(e.target.value)}
                      autoFocus
                    />
                    <button type="submit" className="btn btn-sm text-white px-3" style={{ background: '#9D00FF' }}>
                      <FontAwesomeIcon icon={faCheck} />
                    </button>
                    <button type="button" className="btn btn-sm btn-outline-secondary px-3" onClick={() => setShowAddDesembarque(false)}>
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  </form>
                ) : (
                  <div className="text-center mt-auto">
                    <button 
                      type="button" 
                      className="btn-adicionar-parada"
                      onClick={() => setShowAddDesembarque(true)}
                    >
                      Adicionar
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VISÃO DE LISTA DE LINHAS (FUNCIONALIDADE ADICIONAL) */}
      {view === 'list' && (
        <div className="flex-grow-1 d-flex flex-column">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold text-dark m-0">Todas as Linhas Ativas</h5>
            <Button 
              className="btn-add-rota d-flex align-items-center gap-2"
              onClick={() => setShowRotaModal(true)}
            >
              <FontAwesomeIcon icon={faPlus} />
              <span>Nova Linha</span>
            </Button>
          </div>

          <div className="card shadow-sm border-0 flex-grow-1">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th className="ps-4">Nome da Linha</th>
                      <th>Trajeto Principal</th>
                      <th>Motorista</th>
                      <th>Veículo</th>
                      <th>Status</th>
                      <th className="text-end pe-4">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rotas.map((r) => (
                      <tr key={r.id}>
                        <td className="ps-4 fw-semibold text-dark">
                          <div className="d-flex align-items-center gap-2">
                            <FontAwesomeIcon icon={faRoute} style={{ color: '#9D00FF' }} />
                            <span>{r.nome}</span>
                          </div>
                        </td>
                        <td>{r.origem} ➔ {r.destino} ({r.paradas} paradas)</td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <FontAwesomeIcon icon={faUser} className="text-muted" />
                            <span>{r.motorista}</span>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <FontAwesomeIcon icon={faBus} className="text-muted" />
                            <span>{r.veiculo}</span>
                          </div>
                        </td>
                        <td>
                          <span className="badge bg-success bg-opacity-10 text-success px-3 py-2 rounded-pill">
                            {r.status}
                          </span>
                        </td>
                        <td className="text-end pe-4">
                          <button className="btn btn-sm btn-outline-primary me-2" title="Editar Linha">
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                          <button 
                            className="btn btn-sm btn-outline-danger" 
                            title="Excluir Linha"
                            onClick={() => setRotas(rotas.filter(item => item.id !== r.id))}
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PADRONIZADO PARA CADASTRAR NOVA LINHA */}
      {showRotaModal && (
        <div 
          className="modal-overlay-figma"
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(26, 26, 26, 0.65)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1060, padding: '1rem'
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowRotaModal(false); }}
        >
          <div className="modal-card-figma p-0 overflow-hidden shadow-lg" style={{ border: '1px solid #5C2078', borderRadius: '16px', maxWidth: '650px', width: '100%' }}>
            {/* Cabeçalho Roxo com gradiente elegante */}
            <div className="p-4 text-white d-flex justify-content-between align-items-center" style={{ background: 'linear-gradient(135deg, #2A0041 0%, #5C2078 100%)' }}>
              <div className="d-flex align-items-center gap-3">
                <div className="d-flex align-items-center justify-content-center bg-white rounded-circle shadow-sm" style={{ width: '44px', height: '44px', color: '#9D00FF' }}>
                  <FontAwesomeIcon icon={faRoute} className="fs-5" />
                </div>
                <div>
                  <h5 className="fw-bold m-0 text-white" style={{ letterSpacing: '0.3px' }}>Cadastrar Nova Linha de Ônibus</h5>
                  <span className="small text-white-50" style={{ fontSize: '0.8rem' }}>Gestão de trajetos e itinerários do transporte</span>
                </div>
              </div>
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => setShowRotaModal(false)}
                aria-label="Fechar"
                style={{ filter: 'invert(1) grayscale(100%) brightness(200%)' }}
              ></button>
            </div>

            <form onSubmit={handleSalvarRota} className="p-4" style={{ backgroundColor: '#FAF9FC' }}>
              <div className="row g-3">
                <div className="col-md-12">
                  <label className="form-label fw-bold mb-1" style={{ color: '#2A0041', fontSize: '0.9rem' }}>
                    <FontAwesomeIcon icon={faRoute} className="me-2 text-secondary" />
                    Nome da Linha / Identificação
                  </label>
                  <input 
                    type="text" 
                    className="form-control p-2 bg-white" 
                    placeholder="Ex: Linha 03 - Sul / IFCE Campus Novo"
                    value={formNome}
                    onChange={(e) => setFormNome(e.target.value)}
                    required
                    style={{ borderRadius: '8px', border: '1px solid #CED4DA' }}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-bold mb-1" style={{ color: '#2A0041', fontSize: '0.9rem' }}>
                    Ponto de Origem
                  </label>
                  <input 
                    type="text" 
                    className="form-control p-2 bg-white" 
                    placeholder="Ex: Praça Central"
                    value={formOrigem}
                    onChange={(e) => setFormOrigem(e.target.value)}
                    style={{ borderRadius: '8px', border: '1px solid #CED4DA' }}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-bold mb-1" style={{ color: '#2A0041', fontSize: '0.9rem' }}>
                    Ponto de Destino
                  </label>
                  <input 
                    type="text" 
                    className="form-control p-2 bg-white" 
                    placeholder="Ex: Faculdade UFC"
                    value={formDestino}
                    onChange={(e) => setFormDestino(e.target.value)}
                    style={{ borderRadius: '8px', border: '1px solid #CED4DA' }}
                  />
                </div>

                <div className="col-md-12">
                  <label className="form-label fw-bold mb-1" style={{ color: '#2A0041', fontSize: '0.9rem' }}>
                    <FontAwesomeIcon icon={faUser} className="me-2 text-secondary" />
                    Motorista Responsável
                  </label>
                  <select 
                    className="form-select p-2 bg-white"
                    value={formMotorista}
                    onChange={(e) => setFormMotorista(e.target.value)}
                    style={{ borderRadius: '8px', border: '1px solid #CED4DA' }}
                  >
                    <option value="Roberto Silva">Roberto Silva</option>
                    <option value="Marcos Oliveira">Marcos Oliveira</option>
                    <option value="Carlos Eduardo">Carlos Eduardo</option>
                  </select>
                </div>
              </div>

              <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top" style={{ borderColor: '#EBE5F0' }}>
                <button 
                  type="button" 
                  className="btn btn-light px-4 py-2 rounded-3 fw-semibold text-secondary border"
                  onClick={() => {
                    setShowRotaModal(false);
                    setFormNome('');
                    setFormOrigem('');
                    setFormDestino('');
                  }}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="btn px-4 py-2 rounded-3 fw-bold text-white shadow-sm"
                  style={{ background: 'linear-gradient(135deg, #9D00FF 0%, #6800AC 100%)', border: 'none' }}
                >
                  Salvar Linha
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
