import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, 
  faBus, 
  faEdit, 
  faTrash, 
  faWheelchair, 
  faList, 
  faTh, 
  faCheckCircle, 
  faWrench,
  faIdCard,
  faUsers,
  faCalendarAlt,
  faTag
} from '@fortawesome/free-solid-svg-icons';
import { Button } from '../../components/Button/Button';
import { Input } from '../../components/Input/Input';
import { Select } from '../../components/Select/Select';
import { ProfileIcon } from '../../components/ProfileIcon/ProfileIcon';
import { useAuth } from '../../hooks/useAuth';
import { maskPlaca } from '../../utils/masks';
import { httpClient } from '../../../data/api/httpClient';
import { logger } from '../../../utils/logger';
import './VeiculosAdm.css';

export const VeiculosAdm = () => {
  const { currentUser } = useAuth();
  const [view, setView] = useState('figma'); // 'figma' (Grade de Cards do Figma) | 'list' | 'form'
  const [alertMsg, setAlertMsg] = useState('');

  const [veiculos, setVeiculos] = useState([]);
  const [motoristas, setMotoristas] = useState([]);

  // Estados do Formulário de Cadastro / Edição
  const [showModal, setShowModal] = useState(false);
  const [formPlaca, setFormPlaca] = useState('');
  const [formModelo, setFormModelo] = useState('');
  const [formCapacidade, setFormCapacidade] = useState('45');
  const [formAno, setFormAno] = useState('2020');
  const [formStatus, setFormStatus] = useState('Ativo');
  const [formAcessibilidade, setFormAcessibilidade] = useState(true);
  const [formDriverId, setFormDriverId] = useState('');
  const [editingId, setEditingId] = useState(null);

  const fetchVeiculos = async () => {
    try {
      logger.info('VEÍCULOS ADM', 'Buscar a frota pelo /admin/vehicles...');
      const res = await httpClient.get('/admin/vehicles');
      if (res && Array.isArray(res)) {
        logger.success('VEÍCULOS ADM', `${res.length} veiculo(s) carregado(s) da API!`);
        const mapped = res.map((v, idx) => ({
          id: v.id || idx + 1,
          numero: String(v.id || idx + 1).padStart(2, '0'),
          placa: v.plate || v.placa || 'XXX-0000',
          modelo: v.model || v.modelo || 'Onibus Padrao',
          capacidade: parseInt(v.capacity ?? v.capacidade) || 45,
          ano: parseInt(v.year || v.ano) || 2024,
          status: v.status || 'Ativo',
          acessibilidade: v.accessibility === 'Sim' || v.accessibility === 'Sim (Elevador)' || v.acessibilidade === true,
          motorista: v.driverName || '',
          driverId: v.driverId || null
        }));
        setVeiculos(mapped);
      }
    } catch (error) {
      logger.error('VEÍCULOS ADM', 'Erro ao carregar veiculos da API:', error);
    }
  };

  const fetchMotoristas = async () => {
    try {
      const res = await httpClient.get('/admin/drivers');
      if (res && Array.isArray(res)) {
        setMotoristas(res.map(d => ({ id: d.id, nome: d.name || d.nome || 'Motorista' })));
      }
    } catch (e) {
      logger.error('VEÍCULOS ADM', 'Erro ao carregar motoristas:', e);
    }
  };

  useEffect(() => {
    fetchVeiculos();
    fetchMotoristas();
  }, []);

  const handleOpenNewForm = () => {
    setEditingId(null);
    setFormPlaca('');
    setFormModelo('');
    setFormCapacidade('45');
    setFormAno('2024');
    setFormStatus('Ativo');
    setFormAcessibilidade(true);
    setFormDriverId('');
    setShowModal(true);
  };

  const handleOpenEditForm = (v) => {
    setEditingId(v.id);
    setFormPlaca(v.placa);
    setFormModelo(v.modelo || '');
    setFormCapacidade(v.capacidade.toString());
    setFormAno(v.ano.toString());
    setFormStatus(v.status);
    setFormAcessibilidade(v.acessibilidade);
    setFormDriverId(v.driverId ? String(v.driverId) : '');
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    try {
      await httpClient.delete(`/admin/vehicles/${id}`);
      setVeiculos(veiculos.filter(v => v.id !== id));
      setAlertMsg('Veiculo removido da frota com sucesso!');
    } catch (error) {
      logger.error('VEICULOS ADM', 'Erro ao excluir veiculo da API:', error);
      setAlertMsg('Erro ao excluir veiculo. Tente novamente.');
    }
    setTimeout(() => setAlertMsg(''), 4000);
  };

  const handleSalvar = async (e) => {
    e.preventDefault();
    if (!formPlaca) return;

    if (editingId) {
      try {
        await httpClient.put(`/admin/vehicles/${editingId}`, {
          plate: formPlaca.toUpperCase(),
          model: formModelo || 'Onibus Padrao',
          year: formAno.toString(),
          capacity: parseInt(formCapacidade) || 45,
          accessibility: formAcessibilidade ? 'Sim' : 'Nao',
          status: formStatus
        });
        // Atribui ou remove motorista
        await httpClient.put(`/admin/vehicles/${editingId}/driver`, {
          driverId: formDriverId ? parseInt(formDriverId) : null
        });
        logger.success('VEICULOS ADM', 'Veiculo atualizado na API!');
        await fetchVeiculos();
        setAlertMsg('Veiculo atualizado na frota com sucesso!');
      } catch (error) {
        logger.error('VEICULOS ADM', 'Erro ao atualizar veiculo na API:', error);
        setAlertMsg('Erro ao salvar alteracoes. Tente novamente.');
      }
      setShowModal(false);
      setTimeout(() => setAlertMsg(''), 4000);
    } else {
      logger.info('VEÍCULOS ADM', '🚀 Salvando novo veículo na API (/admin/vehicles)...');
      try {
        await httpClient.post('/admin/vehicles', {
          plate: formPlaca.toUpperCase(),
          model: formModelo || 'Ônibus Escolar',
          year: formAno.toString(),
          capacity: parseInt(formCapacidade) || 45,
          accessibility: formAcessibilidade ? 'Sim' : 'Não'
        });
        logger.success('VEÍCULOS ADM', '✅ Veículo salvo no banco de dados da API!');
        await fetchVeiculos();
        setAlertMsg('Novo veículo cadastrado e adicionado à frota com sucesso!');
      } catch (error) {
        logger.error('VEÍCULOS ADM', 'Erro ao salvar veículo na API. Salvando apenas localmente.', error);
        const novoVeiculo = {
          id: veiculos.length > 0 ? Math.max(...veiculos.map(v => v.id)) + 1 : 1,
          numero: veiculos.length + 1,
          placa: formPlaca.toUpperCase(),
          modelo: formModelo || 'Ônibus Escolar',
          capacidade: parseInt(formCapacidade) || 45,
          ano: parseInt(formAno) || 2024,
          status: formStatus,
          acessibilidade: formAcessibilidade
        };
        setVeiculos([...veiculos, novoVeiculo]);
        setAlertMsg('Novo veículo cadastrado localmente!');
      }
      setShowModal(false);
      setTimeout(() => setAlertMsg(''), 4000);
    }
  };

  return (
    <div className="veiculos-adm-container w-100 h-100 d-flex flex-column">
      {/* Alerta de feedback */}
      {alertMsg && (
        <div className="alert alert-success d-flex align-items-center justify-content-between shadow-sm mb-4" role="alert" style={{ background: '#E8F8F0', borderColor: '#28A745', color: '#155724' }}>
          <span>{alertMsg}</span>
          <button type="button" className="btn-close" onClick={() => setAlertMsg('')}></button>
        </div>
      )}

      {/* Header idêntico ao protótipo */}
      <div className="d-flex justify-content-between align-items-center mb-5 pb-1">
        <h2 className="adm-header-title m-0">
          Olá, {currentUser?.nome || 'Bruno'}!
        </h2>

        <div className="d-flex align-items-center gap-3">
          <ProfileIcon />
        </div>
      </div>

      {/* VISÃO FIGMA (100% FIEL AO PROTÓTIPO ENVIADO) */}
      {view === 'figma' && (
        <div className="flex-grow-1">
          <div className="row g-4">
            {veiculos.map((v) => (
              <div key={v.id} className="col-md-6 col-lg-4">
                <div className={`card-veiculo-figma ${v.status === 'Manutenção' ? 'card-veiculo-manutencao' : 'card-veiculo-ativo'}`}>
                  <h4 className="card-veiculo-title">
                    Ônibus Escolar n° {v.numero}
                  </h4>

                  <div className="card-veiculo-details">
                    <div>Placa: {v.placa}</div>
                    <div>Status: {v.status}</div>
                    <div>Capacidade: {v.capacidade}</div>
                    <div>Ano de fabricação: {v.ano}</div>
                    <div style={{ marginTop: '6px', fontWeight: '600', color: v.motorista ? '#2A0041' : '#999' }}>
                      Motorista: {v.motorista || 'Não atribuído'}
                    </div>
                  </div>

                  {/* Ícone de Acessibilidade no canto inferior direito */}
                  {v.acessibilidade && (
                    <div className="icon-acessibilidade" title="Veículo com acessibilidade para cadeirantes">
                      <FontAwesomeIcon icon={faWheelchair} />
                    </div>
                  )}

                  {/* Botões de Ação ao passar o mouse */}
                  <div className="card-veiculo-actions">
                    <button 
                      type="button" 
                      className="btn-action-veiculo" 
                      title="Editar Veículo"
                      onClick={() => handleOpenEditForm(v)}
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button 
                      type="button" 
                      className="btn-action-veiculo" 
                      title="Excluir Veículo"
                      onClick={() => handleDelete(v.id)}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Botão Flutuante (FAB) de Adicionar - Canto Inferior Direito sem sombra */}
          <button 
            type="button" 
            className="btn-fab-add" 
            onClick={handleOpenNewForm}
            title="Cadastrar Novo Veículo"
          >
            <FontAwesomeIcon icon={faPlus} />
          </button>
        </div>
      )}

      {/* VISÃO DE TABELA / LISTAGEM COMPLETA */}
      {view === 'list' && (
        <div className="flex-grow-1 d-flex flex-column">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold text-dark m-0">Frota Completa de Veículos</h5>
            <Button 
              className="btn-add-rota d-flex align-items-center gap-2"
              onClick={handleOpenNewForm}
            >
              <FontAwesomeIcon icon={faPlus} />
              <span>Novo Veículo</span>
            </Button>
          </div>

          <div className="card shadow-sm border-0 flex-grow-1">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th className="ps-4">Veículo</th>
                      <th>Placa</th>
                      <th>Modelo</th>
                      <th>Capacidade</th>
                      <th>Ano</th>
                      <th>Acessibilidade</th>
                      <th>Status</th>
                      <th className="text-end pe-4">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {veiculos.map((v) => (
                      <tr key={v.id}>
                        <td className="ps-4 fw-semibold text-dark">
                          <div className="d-flex align-items-center gap-2">
                            <FontAwesomeIcon icon={faBus} style={{ color: '#9D00FF' }} />
                            <span>Ônibus n° {v.numero}</span>
                          </div>
                        </td>
                        <td className="fw-monospace">{v.placa}</td>
                        <td>{v.modelo}</td>
                        <td>{v.capacidade} lugares</td>
                        <td>{v.ano}</td>
                        <td>
                          {v.acessibilidade ? (
                            <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-1 rounded-pill d-inline-flex align-items-center gap-1">
                              <FontAwesomeIcon icon={faWheelchair} /> Sim
                            </span>
                          ) : (
                            <span className="text-muted fs-7">Não</span>
                          )}
                        </td>
                        <td>
                          <span className={`badge px-3 py-2 rounded-pill ${v.status === 'Ativo' ? 'bg-success bg-opacity-10 text-success' : 'bg-warning bg-opacity-10 text-dark'}`}>
                            {v.status}
                          </span>
                        </td>
                        <td className="text-end pe-4">
                          <button 
                            className="btn btn-sm btn-outline-primary me-2" 
                            title="Editar"
                            onClick={() => handleOpenEditForm(v)}
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                          <button 
                            className="btn btn-sm btn-outline-danger" 
                            title="Excluir"
                            onClick={() => handleDelete(v.id)}
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

      {/* MODAL PADRONIZADO PARA CADASTRO OU EDIÇÃO DE VEÍCULO */}
      {showModal && (
        <div 
          className="modal-overlay-figma"
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(26, 26, 26, 0.65)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1060, padding: '1rem'
          }}
        >
          <div className="modal-card-figma p-0 overflow-hidden shadow-lg" style={{ border: '1px solid #5C2078', borderRadius: '16px', maxWidth: '680px', width: '100%' }}>
            {/* Cabeçalho Roxo com gradiente elegante */}
            <div className="p-4 text-white d-flex justify-content-between align-items-center" style={{ background: 'linear-gradient(135deg, #2A0041 0%, #5C2078 100%)' }}>
              <div className="d-flex align-items-center gap-3">
                <div className="d-flex align-items-center justify-content-center bg-white rounded-circle shadow-sm" style={{ width: '44px', height: '44px', color: '#9D00FF' }}>
                  <FontAwesomeIcon icon={faBus} className="fs-5" />
                </div>
                <div>
                  <h5 className="fw-bold m-0 text-white" style={{ letterSpacing: '0.3px' }}>
                    {editingId ? 'Editar Veículo' : 'Cadastrar Novo Veículo na Frota'}
                  </h5>
                  <span className="small text-white-50" style={{ fontSize: '0.8rem' }}>Gestão técnica e operacional de ônibus e vans</span>
                </div>
              </div>
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => setShowModal(false)}
                aria-label="Fechar"
                style={{ filter: 'invert(1) grayscale(100%) brightness(200%)' }}
              ></button>
            </div>

            <form onSubmit={handleSalvar} className="p-4" style={{ backgroundColor: '#FAF9FC', maxHeight: '80vh', overflowY: 'auto' }}>
              <div className="row g-3 mb-3">
                <div className="col-md-4">
                  <Input
                    label={<><FontAwesomeIcon icon={faIdCard} className="me-2 text-secondary" /> Placa do Veículo</>}
                    placeholder="Ex: ABC-1234"
                    value={formPlaca}
                    onChange={(e) => setFormPlaca(maskPlaca(e.target.value))}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <Input
                    label={<><FontAwesomeIcon icon={faTag} className="me-2 text-secondary" /> Modelo / Carroceria</>}
                    placeholder="Ex: Volare W9 / Marcopolo"
                    value={formModelo}
                    onChange={(e) => setFormModelo(e.target.value)}
                  />
                </div>
                <div className="col-md-4">
                  <Input
                    label={<><FontAwesomeIcon icon={faUsers} className="me-2 text-secondary" /> Capacidade (Assentos)</>}
                    type="number"
                    placeholder="Ex: 45"
                    value={formCapacidade}
                    onChange={(e) => setFormCapacidade(e.target.value)}
                  />
                </div>
                <div className="col-md-4">
                  <Input
                    label={<><FontAwesomeIcon icon={faCalendarAlt} className="me-2 text-secondary" /> Ano de Fabricação</>}
                    type="number"
                    placeholder="Ex: 2024"
                    value={formAno}
                    onChange={(e) => setFormAno(e.target.value)}
                  />
                </div>
                <div className="col-md-4">
                  <Select
                    label={<><FontAwesomeIcon icon={faWrench} className="me-2 text-secondary" /> Status Operacional</>}
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    options={[
                      { value: 'Ativo', label: 'Ativo' },
                      { value: 'Manutenção', label: 'Manutenção' }
                    ]}
                  />
                </div>
                <div className="col-md-12 mt-3">
                  <div className="bg-white p-3 rounded-3 border d-flex align-items-center gap-3 shadow-sm" style={{ borderColor: '#EBE5F0' }}>
                    <input 
                      className="form-check-input m-0 shadow-none" 
                      type="checkbox" 
                      id="checkAcessibilidade"
                      checked={formAcessibilidade}
                      onChange={(e) => setFormAcessibilidade(e.target.checked)}
                      style={{ width: '22px', height: '22px', cursor: 'pointer', accentColor: '#9D00FF' }}
                    />
                    <label className="form-check-label text-dark fw-bold cursor-pointer m-0 d-flex align-items-center gap-2" htmlFor="checkAcessibilidade" style={{ color: '#2A0041', fontSize: '0.9rem' }}>
                      <FontAwesomeIcon icon={faWheelchair} className="fs-5" style={{ color: '#9D00FF' }} />
                      Veículo adaptado com elevador / acessibilidade para cadeirantes
                    </label>
                  </div>
                </div>

                {/* Seleção de Motorista Responsável */}
                <div className="row g-3 mb-3">
                  <div className="col-md-12">
                    <label className="form-label fw-semibold text-dark" style={{ fontSize: '0.88rem', letterSpacing: '0.5px' }}>
                      <FontAwesomeIcon icon={faIdCard} className="me-2 text-secondary" />
                      Motorista Responsável
                    </label>
                    <select
                      className="form-select"
                      value={formDriverId}
                      onChange={(e) => setFormDriverId(e.target.value)}
                      style={{ borderColor: '#C9BFD4', borderRadius: '10px' }}
                    >
                      <option value="">— Sem motorista atribuído —</option>
                      {motoristas.map(m => (
                        <option key={m.id} value={m.id}>{m.nome}</option>
                      ))}
                    </select>
                  </div>
                </div>

              </div>

              <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top" style={{ borderColor: '#EBE5F0' }}>
                <button 
                  type="button" 
                  className="btn btn-light px-4 py-2 rounded-3 fw-semibold text-secondary border"
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="btn px-4 py-2 rounded-3 fw-bold text-white shadow-sm"
                  style={{ background: 'linear-gradient(135deg, #9D00FF 0%, #6800AC 100%)', border: 'none' }}
                >
                  {editingId ? 'Salvar Alterações' : 'Cadastrar Veículo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
