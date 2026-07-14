import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle, faExclamationTriangle, faCircleExclamation, faCheckCircle, faCheckDouble, faChevronLeft, faChevronRight, faPlus, faBullhorn } from '@fortawesome/free-solid-svg-icons';
import { ProfileIcon } from '../../components/ProfileIcon/ProfileIcon';
import { useAuth } from '../../hooks/useAuth';
import './Avisos.css';

export const Avisos = ({ avisos = [], markAsRead, markAllAsRead, addAviso }) => {
  const { currentUser } = useAuth();
  const role = currentUser?.role || '';
  const canSendAviso = role === 'adm' || role === 'motorista' || role === 'driver';

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState('info');
  const [newDescription, setNewDescription] = useState('');
  const [alertMsg, setAlertMsg] = useState('');

  const handleCreateAviso = async (e) => {
    e.preventDefault();
    if (!canSendAviso || !newTitle.trim() || !newDescription.trim()) return;

    if (addAviso) {
      await addAviso({
        title: newTitle,
        type: newType,
        description: newDescription,
        date: 'Hoje'
      });
    }

    setNewTitle('');
    setNewType('info');
    setNewDescription('');
    setShowModal(false);
    setAlertMsg('Novo aviso cadastrado e enviado com sucesso!');
    setTimeout(() => setAlertMsg(''), 5000);
  };

  const unreadCount = avisos.filter(a => !a.read).length;

  const totalPages = Math.ceil(avisos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentAvisos = avisos.slice(startIndex, startIndex + itemsPerPage);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const getIcon = (type) => {
    switch (type) {
      case 'info': return faInfoCircle;
      case 'warning': return faExclamationTriangle;
      case 'danger': return faCircleExclamation;
      case 'success': return faCheckCircle;
      default: return faInfoCircle;
    }
  };

  return (
    <div className="avisos-container w-100">
      {alertMsg && (
        <div className="alert alert-success d-flex align-items-center justify-content-between shadow-sm mb-4" role="alert" style={{ background: '#E8F8F0', borderColor: '#28A745', color: '#155724' }}>
          <span>{alertMsg}</span>
          <button type="button" className="btn-close" onClick={() => setAlertMsg('')}></button>
        </div>
      )}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="text-dark fw-bold m-0 d-flex align-items-center flex-wrap gap-2">
            Avisos do Sistema
            {unreadCount > 0 && (
              <span className="badge rounded-pill badge-unread fs-6">
                {unreadCount} novo{unreadCount !== 1 ? 's' : ''}
              </span>
            )}
          </h2>
          <p className="text-muted mt-2 mb-0">Acompanhe as notificações e alertas importantes.</p>
        </div>
        
        <div className="d-flex align-items-center gap-3 align-self-start align-self-md-auto">
          {unreadCount > 0 && (
            <button 
              onClick={markAllAsRead} 
              className="btn btn-outline-primary rounded-3 px-4" 
              style={{ borderColor: '#9D00FF', color: '#9D00FF' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#9D00FF';
                e.currentTarget.style.color = '#fff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#9D00FF';
              }}
            >
              <FontAwesomeIcon icon={faCheckDouble} className="me-2" />
              Marcar todos como lidos
            </button>
          )}
          <ProfileIcon />
        </div>
      </div>

      <div className="avisos-list d-flex flex-column gap-3">
        {currentAvisos.map((aviso) => (
          <div key={aviso.id} className={`aviso-card p-3 p-md-4 d-flex flex-row gap-3 gap-md-4 ${!aviso.read ? 'unread' : ''}`}>
            <div className={`aviso-icon-container type-${aviso.type}`}>
              <FontAwesomeIcon icon={getIcon(aviso.type)} />
            </div>
            
            <div className="aviso-content flex-grow-1">
              <div className="d-flex flex-wrap justify-content-between align-items-start gap-2">
                <div>
                  <h5 className="aviso-title">{aviso.title}</h5>
                  <span className="aviso-date">{aviso.date}</span>
                </div>
                {!aviso.read && (
                  <button onClick={() => markAsRead(aviso.id)} className="mark-read-btn text-nowrap">
                    Marcar como lido
                  </button>
                )}
              </div>
              <p className="aviso-desc mb-0">{aviso.description}</p>
            </div>
          </div>
        ))}

        {avisos.length === 0 && (
          <div className="text-center py-5 text-muted">
            <p>Nenhum aviso no momento.</p>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-5 mb-3">
          <div className="pagination d-flex gap-3 align-items-center bg-white p-2 px-4 rounded-pill shadow-sm border">
            <button 
              className="btn btn-sm btn-light rounded-circle p-0" 
              style={{ width: '32px', height: '32px' }}
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <FontAwesomeIcon icon={faChevronLeft} className="text-muted" />
            </button>
            <span className="text-muted fw-bold small">
              Página {currentPage} de {totalPages}
            </span>
            <button 
              className="btn btn-sm btn-light rounded-circle p-0" 
              style={{ width: '32px', height: '32px' }}
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <FontAwesomeIcon icon={faChevronRight} className="text-muted" />
            </button>
          </div>
        </div>
      )}

      {/* Botão Flutuante (+) para Cadastrar Novo Aviso - apenas ADM e Motorista */}
      {canSendAviso && (
        <button
          type="button"
          className="btn-fab-add"
          onClick={() => setShowModal(true)}
          title="Cadastrar Novo Aviso do Sistema"
        >
          <FontAwesomeIcon icon={faPlus} />
        </button>
      )}

      {/* Modal Flutuante para Cadastro de Novo Aviso - apenas ADM e Motorista */}
      {canSendAviso && showModal && (
        <div 
          className="modal-overlay-figma"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false);
          }}
        >
          <div className="modal-card-figma p-0 overflow-hidden shadow-lg" style={{ border: '1px solid #5C2078', borderRadius: '16px', maxWidth: '550px' }}>
            {/* Cabeçalho Roxo com gradiente elegante */}
            <div className="p-4 text-white d-flex justify-content-between align-items-center" style={{ background: 'linear-gradient(135deg, #2A0041 0%, #5C2078 100%)' }}>
              <div className="d-flex align-items-center gap-3">
                <div className="d-flex align-items-center justify-content-center bg-white rounded-circle shadow-sm" style={{ width: '44px', height: '44px', color: '#9D00FF' }}>
                  <FontAwesomeIcon icon={faBullhorn} className="fs-5" />
                </div>
                <div>
                  <h5 className="fw-bold m-0 text-white" style={{ letterSpacing: '0.3px' }}>Cadastrar Novo Aviso</h5>
                  <span className="small text-white-50" style={{ fontSize: '0.8rem' }}>Comunicação institucional com alunos e motoristas</span>
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

            <form onSubmit={handleCreateAviso} className="p-4" style={{ backgroundColor: '#FAF9FC' }}>
              <div className="mb-3">
                <label className="form-label fw-bold" style={{ color: '#2A0041', fontSize: '0.9rem' }}>
                  Título do Aviso <span className="text-danger">*</span>
                </label>
                <input 
                  type="text" 
                  className="form-control p-2 shadow-none bg-white" 
                  placeholder="Ex: Manutenção Programada no Sistema" 
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required 
                  style={{ borderColor: '#D8D8D8', borderRadius: '8px' }}
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold" style={{ color: '#2A0041', fontSize: '0.9rem' }}>
                  Tipo / Categoria
                </label>
                <select 
                  className="form-select p-2 shadow-none bg-white" 
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  style={{ borderColor: '#D8D8D8', borderRadius: '8px' }}
                >
                  <option value="info">Informação Geral (Azul)</option>
                  <option value="warning">Atenção / Alerta (Amarelo)</option>
                  <option value="danger">Urgente / Importante (Vermelho)</option>
                  <option value="success">Conclusão / Sucesso (Verde)</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="form-label fw-bold" style={{ color: '#2A0041', fontSize: '0.9rem' }}>
                  Descrição / Conteúdo <span className="text-danger">*</span>
                </label>
                <textarea 
                  className="form-control p-2 shadow-none bg-white" 
                  rows="4" 
                  placeholder="Ex: Informamos que neste sábado o sistema passará por uma atualização técnica..." 
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  required 
                  style={{ borderColor: '#D8D8D8', borderRadius: '8px' }}
                ></textarea>
              </div>

              <div className="d-flex justify-content-end gap-2 pt-2 border-top" style={{ borderColor: '#EBE5F0' }}>
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
                  Cadastrar Aviso
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
