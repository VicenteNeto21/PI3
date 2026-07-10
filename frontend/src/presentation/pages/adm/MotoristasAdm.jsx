import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, 
  faUserCircle, 
  faChevronDown, 
  faChevronUp, 
  faEdit, 
  faTrash, 
  faPhone, 
  faEnvelope, 
  faIdCard, 
  faTimes, 
  faList, 
  faThList,
  faCalendarAlt,
  faLock,
  faUser,
  faCheckCircle
} from '@fortawesome/free-solid-svg-icons';
import { Input } from '../../components/Input/Input';
import { Select } from '../../components/Select/Select';
import { Button } from '../../components/Button/Button';
import { ProfileIcon } from '../../components/ProfileIcon/ProfileIcon';
import { useAuth } from '../../hooks/useAuth';
import { maskCNH, maskDate, maskCPF, maskPhone } from '../../utils/masks';
import { httpClient } from '../../../data/api/httpClient';
import { logger } from '../../../utils/logger';
import './MotoristasAdm.css';

const formatDate = (iso) => {
  if (!iso || iso.length !== 10) return iso || '';
  const parts = iso.split('-');
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
};

const parseDate = (d) => {
  if (!d || d.length !== 10) return '2000-01-01';
  const parts = d.split('/');
  return `${parts[2]}-${parts[1]}-${parts[0]}`;
};

export const MotoristasAdm = () => {
  const { currentUser } = useAuth();
  const [view, setView] = useState('figma');
  const [expandedId, setExpandedId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [alertMsg, setAlertMsg] = useState('');

  const [motoristas, setMotoristas] = useState([]);

  const [formNome, setFormNome] = useState('');
  const [formCnh, setFormCnh] = useState('');
  const [formCategoria, setFormCategoria] = useState('D');
  const [formValidade, setFormValidade] = useState('');
  const [formCpf, setFormCpf] = useState('');
  const [formNascimento, setFormNascimento] = useState('');
  const [formTelefone, setFormTelefone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formSenha, setFormSenha] = useState('');
  const [editingId, setEditingId] = useState(null);

  const fetchMotoristas = async () => {
    try {
      logger.info('MOTORISTAS ADM', 'Buscando motoristas pelo /admin/drivers...');
      const res = await httpClient.get('/admin/drivers');
      if (res && Array.isArray(res) && res.length > 0) {
        logger.success('MOTORISTAS ADM', `${res.length} motorista(s) carregado(s) da API!`);
        const mapped = res.map((m, idx) => ({
          id: m.id || idx + 1,
          nome: m.name || m.nome || 'Motorista Sem Nome',
          cnh: m.cnh || '00000000000',
          categoria: m.category || m.categoria || 'D',
          validade: formatDate(m.validity || m.validade) || '31/12/2028',
          cpf: m.cpf || '000.000.000-00',
          nascimento: formatDate(m.birthDate || m.nascimento) || '01/01/1980',
          telefone: m.phone || m.telefone || '(00) 00000-0000',
          email: m.email || `${idx}@siti.com`,
          status: m.status || 'Ativo'
        }));
        setMotoristas(mapped);
      }
    } catch (error) {
      logger.error('MOTORISTAS ADM', 'Erro ao carregar motoristas da API:', error);
    }
  };

  useEffect(() => {
    fetchMotoristas();
  }, []);

  const handleOpenNewModal = () => {
    setEditingId(null);
    setFormNome('');
    setFormCnh('');
    setFormCategoria('D / AD');
    setFormValidade('10/12/2028');
    setFormCpf('');
    setFormNascimento('');
    setFormTelefone('');
    setFormEmail('');
    setFormSenha('');
    setShowModal(true);
  };

  const handleOpenEditModal = (m, e) => {
    e.stopPropagation();
    setEditingId(m.id);
    setFormNome(m.nome);
    setFormCnh(m.cnh);
    setFormCategoria(m.categoria);
    setFormValidade(m.validade);
    setFormCpf(m.cpf);
    setFormNascimento(m.nascimento);
    setFormTelefone(m.telefone);
    setFormEmail(m.email);
    setFormSenha('••••••••');
    setShowModal(true);
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    try {
      await httpClient.delete(`/admin/drivers/${id}`);
      setMotoristas(motoristas.filter(m => m.id !== id));
      setAlertMsg('Motorista removido do cadastro com sucesso!');
    } catch (error) {
      logger.error('MOTORISTAS ADM', 'Erro ao excluir motorista da API:', error);
      setAlertMsg('Erro ao excluir motorista. Tente novamente.');
    }
    setTimeout(() => setAlertMsg(''), 4000);
  };

  const handleSalvar = async (e) => {
    e.preventDefault();
    if (!formNome) return;

    if (editingId) {
      try {
        await httpClient.put(`/admin/drivers/${editingId}`, {
          name: formNome,
          cnh: (formCnh || '00000000000').replace(/\D/g, ''),
          category: formCategoria,
          phone: formTelefone,
          birthDate: parseDate(formNascimento || '01/01/1985'),
          validity: parseDate(formValidade || '01/01/2030')
        });
        logger.success('MOTORISTAS ADM', 'Motorista atualizado na API!');
        await fetchMotoristas();
        setAlertMsg('Dados do motorista atualizados com sucesso!');
      } catch (error) {
        logger.error('MOTORISTAS ADM', 'Erro ao atualizar motorista na API:', error);
        setAlertMsg('Erro ao salvar alteracoes. Tente novamente.');
      }
      setShowModal(false);
      setTimeout(() => setAlertMsg(''), 4000);
    } else {
      logger.info('MOTORISTAS ADM', 'Cadastrando novo motorista na API (/admin/drivers)...');

      try {
        await httpClient.post('/admin/drivers', {
          name: formNome,
          email: formEmail || `${formNome.toLowerCase().split(' ')[0]}@siti.com`,
          cnh: (formCnh || '00000000000').replace(/\D/g, ''),
          category: formCategoria,
          phone: formTelefone,
          birthDate: parseDate(formNascimento || '01/01/1985'),
          validity: parseDate(formValidade || '01/01/2030')
        });
        logger.success('MOTORISTAS ADM', '✅ Motorista cadastrado no banco de dados da API!');
        await fetchMotoristas();
        setAlertMsg('Novo motorista cadastrado com sucesso na API!');
      } catch (error) {
        logger.error('MOTORISTAS ADM', 'Erro ao salvar motorista na API. Salvando apenas localmente.', error);
        const novoMotorista = {
          id: motoristas.length > 0 ? Math.max(...motoristas.map(m => m.id)) + 1 : 1,
          nome: formNome,
          cnh: formCnh || '00000000000',
          categoria: formCategoria || 'D',
          validade: formValidade || '01/01/2030',
          cpf: formCpf || '000.000.000-00',
          nascimento: formNascimento || '01/01/1985',
          telefone: formTelefone || '(85) 99999-9999',
          email: formEmail || `${formNome.toLowerCase().split(' ')[0]}@siti.com`,
          status: 'Ativo'
        };
        setMotoristas([...motoristas, novoMotorista]);
        setAlertMsg('Novo motorista cadastrado localmente (Erro na API)!');
      }
      setShowModal(false);
      setTimeout(() => setAlertMsg(''), 4000);
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="motoristas-adm-container w-100 h-100 d-flex flex-column">
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
          <button 
            onClick={() => setView(view === 'figma' ? 'table' : 'figma')} 
            className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2 px-3 py-2 rounded-3"
            title="Alternar entre a visão de Acordeão (Figma) e em Tabela"
          >
            <FontAwesomeIcon icon={view === 'figma' ? faList : faThList} />
            <span>{view === 'figma' ? 'Ver em Tabela' : 'Acordeão do Figma'}</span>
          </button>
          <ProfileIcon />
        </div>
      </div>

      {/* VISÃO FIGMA (100% FIEL AO PROTÓTIPO ENVIADO - BARRAS EM ACORDEÃO) */}
      {view === 'figma' && (
        <div className="flex-grow-1 w-100">
          <div className="d-flex flex-column w-100">
            {motoristas.map((m) => (
              <div key={m.id} className="w-100">
                {/* Barra do Acordeão */}
                <button
                  type="button"
                  className={`accordion-bar-figma w-100 ${expandedId === m.id ? 'accordion-bar-active' : ''}`}
                  onClick={() => toggleExpand(m.id)}
                >
                  <div className="d-flex align-items-center gap-3">
                    <FontAwesomeIcon icon={faUserCircle} style={{ fontSize: '1.4rem', color: '#2D2D2D' }} />
                    <span>{m.nome}</span>
                  </div>
                  <FontAwesomeIcon icon={expandedId === m.id ? faChevronUp : faChevronDown} style={{ color: '#444' }} />
                </button>

                {/* Detalhes Expansíveis */}
                {expandedId === m.id && (
                  <div className="accordion-details-figma w-100">
                    <div className="accordion-details-grid">
                      <div className="detail-item-figma">
                        <span>CNH / Categoria</span>
                        <span>{m.cnh} ({m.categoria})</span>
                      </div>
                      <div className="detail-item-figma">
                        <span>Validade da CNH</span>
                        <span>{m.validade}</span>
                      </div>
                      <div className="detail-item-figma">
                        <span>CPF</span>
                        <span>{m.cpf}</span>
                      </div>
                      <div className="detail-item-figma">
                        <span>Data de Nascimento</span>
                        <span>{m.nascimento}</span>
                      </div>
                      <div className="detail-item-figma">
                        <span>Telefone / Celular</span>
                        <span>{m.telefone}</span>
                      </div>
                      <div className="detail-item-figma">
                        <span>E-mail Corporativo</span>
                        <span>{m.email}</span>
                      </div>
                    </div>

                    <div className="d-flex justify-content-end gap-2 pt-3 border-top">
                      <button 
                        type="button" 
                        className="btn btn-sm btn-outline-primary px-3 py-1"
                        onClick={(e) => handleOpenEditModal(m, e)}
                      >
                        <FontAwesomeIcon icon={faEdit} className="me-1" /> Editar
                      </button>
                      <button 
                        type="button" 
                        className="btn btn-sm btn-outline-danger px-3 py-1"
                        onClick={(e) => handleDelete(m.id, e)}
                      >
                        <FontAwesomeIcon icon={faTrash} className="me-1" /> Excluir
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Botão Flutuante (FAB) de Adicionar - Canto Inferior Direito sem sombra */}
          <button 
            type="button" 
            className="btn-fab-add" 
            onClick={handleOpenNewModal}
            title="Cadastrar Novo Motorista"
          >
            <FontAwesomeIcon icon={faPlus} />
          </button>
        </div>
      )}

      {/* VISÃO DE TABELA (ALTERNATIVO PARA GERENCIAMENTO LINEAR) */}
      {view === 'table' && (
        <div className="flex-grow-1 d-flex flex-column">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold text-dark m-0">Equipe de Motoristas Registrados</h5>
            <Button 
              className="btn-add-rota d-flex align-items-center gap-2"
              onClick={handleOpenNewModal}
            >
              <FontAwesomeIcon icon={faPlus} />
              <span>Novo Motorista</span>
            </Button>
          </div>

          <div className="card shadow-sm border-0 flex-grow-1">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th className="ps-4">Motorista</th>
                      <th>CNH</th>
                      <th>Categoria</th>
                      <th>Telefone</th>
                      <th>E-mail</th>
                      <th>Status</th>
                      <th className="text-end pe-4">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {motoristas.map((m) => (
                      <tr key={m.id}>
                        <td className="ps-4 fw-semibold text-dark">
                          <div className="d-flex align-items-center gap-2">
                            <FontAwesomeIcon icon={faIdCard} style={{ color: '#9D00FF' }} />
                            <span>{m.nome}</span>
                          </div>
                        </td>
                        <td className="fw-monospace">{m.cnh}</td>
                        <td>Cat. {m.categoria}</td>
                        <td>{m.telefone}</td>
                        <td>{m.email}</td>
                        <td>
                          <span className="badge bg-success bg-opacity-10 text-success px-3 py-2 rounded-pill">
                            {m.status}
                          </span>
                        </td>
                        <td className="text-end pe-4">
                          <button 
                            className="btn btn-sm btn-outline-primary me-2" 
                            title="Editar"
                            onClick={(e) => handleOpenEditModal(m, e)}
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                          <button 
                            className="btn btn-sm btn-outline-danger" 
                            title="Excluir"
                            onClick={(e) => handleDelete(m.id, e)}
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

      {/* MODAL PADRONIZADO PARA CADASTRO OU EDIÇÃO DE MOTORISTA */}
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
                  <FontAwesomeIcon icon={faUser} className="fs-5" />
                </div>
                <div>
                  <h5 className="fw-bold m-0 text-white" style={{ letterSpacing: '0.3px' }}>
                    {editingId ? 'Editar Motorista' : 'Cadastro de Motorista'}
                  </h5>
                  <span className="small text-white-50" style={{ fontSize: '0.8rem' }}>Gestão de condutores e habilitações do sistema</span>
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
              <div className="row g-3">
                <div className="col-md-12">
                  <Input
                    label={<><FontAwesomeIcon icon={faUser} className="me-2 text-secondary" /> Nome Completo</>}
                    placeholder="Ex: Everton Peres Neto"
                    value={formNome}
                    onChange={(e) => setFormNome(e.target.value)}
                    required
                    autoFocus
                  />
                </div>

                <div className="col-md-6">
                  <Input
                    label={<><FontAwesomeIcon icon={faIdCard} className="me-2 text-secondary" /> CNH</>}
                    placeholder="Ex: 01234567890"
                    value={formCnh}
                    onChange={(e) => setFormCnh(maskCNH(e.target.value))}
                  />
                </div>

                <div className="col-md-3">
                  <Select
                    label="Categoria"
                    value={formCategoria}
                    onChange={(e) => setFormCategoria(e.target.value)}
                    options={[
                      { value: 'B', label: 'B' },
                      { value: 'C', label: 'C' },
                      { value: 'D', label: 'D' },
                      { value: 'D / AD', label: 'D / AD' },
                      { value: 'E', label: 'E' }
                    ]}
                  />
                </div>

                <div className="col-md-3">
                  <Input
                    label={<><FontAwesomeIcon icon={faCalendarAlt} className="me-2 text-secondary" /> Validade</>}
                    placeholder="Ex: 12/08/2028"
                    value={formValidade}
                    onChange={(e) => setFormValidade(maskDate(e.target.value))}
                  />
                </div>

                <div className="col-md-6">
                  <Input
                    label={<><FontAwesomeIcon icon={faIdCard} className="me-2 text-secondary" /> CPF</>}
                    placeholder="Ex: 111.222.333-44"
                    value={formCpf}
                    onChange={(e) => setFormCpf(maskCPF(e.target.value))}
                  />
                </div>

                <div className="col-md-6">
                  <Input
                    label={<><FontAwesomeIcon icon={faCalendarAlt} className="me-2 text-secondary" /> Data de Nascimento</>}
                    placeholder="Ex: 14/05/1985"
                    value={formNascimento}
                    onChange={(e) => setFormNascimento(maskDate(e.target.value))}
                  />
                </div>

                <div className="col-md-6">
                  <Input
                    label={<><FontAwesomeIcon icon={faPhone} className="me-2 text-secondary" /> Telefone</>}
                    placeholder="Ex: (85) 99988-7766"
                    value={formTelefone}
                    onChange={(e) => setFormTelefone(maskPhone(e.target.value))}
                  />
                </div>

                <div className="col-md-6">
                  <Input
                    label={<><FontAwesomeIcon icon={faEnvelope} className="me-2 text-secondary" /> E-mail</>}
                    type="email"
                    placeholder="Ex: motorista@siti.com"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                  />
                </div>

                <div className="col-md-12">
                  <Input
                    label={<><FontAwesomeIcon icon={faLock} className="me-2 text-secondary" /> Senha de Acesso</>}
                    type="password"
                    placeholder="••••••••"
                    value={formSenha}
                    onChange={(e) => setFormSenha(e.target.value)}
                  />
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
                  {editingId ? 'Salvar Alterações' : 'Cadastrar Motorista'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
