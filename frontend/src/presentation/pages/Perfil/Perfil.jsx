import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowLeft, 
  faUser, 
  faIdCard, 
  faBuilding, 
  faBus, 
  faPenToSquare, 
  faCheck, 
  faXmark,
  faRoute,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';
import { usePerfil } from '../../hooks/usePerfil';
import { httpClient } from '../../../data/api/httpClient';
import './Perfil.css';

export const Perfil = () => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [tripsLoading, setTripsLoading] = useState(false);

  const {
    userProfile,
    loading,
    saving,
    isEditing,
    formData,
    saveSuccess,
    handleStartEdit,
    handleCancelEdit,
    handleChange,
    handleSave
  } = usePerfil();

  useEffect(() => {
    setTripsLoading(true);
    httpClient.get('/passenger/trips').then((data) => {
      if (data && Array.isArray(data)) setTrips(data);
    }).catch(() => {}).finally(() => setTripsLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="perfil-container w-100 d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem', color: '#7E22CE' }}>
            <span className="visually-hidden">Carregando...</span>
          </div>
          <h5 className="fw-bold text-secondary">Carregando dados do perfil na API...</h5>
        </div>
      </div>
    );
  }

  return (
    <div className="perfil-container w-100">
      {/* Header com botão voltar */}
      <header className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div className="d-flex align-items-center gap-3">
          <button 
            type="button" 
            className="btn-back-profile"
            onClick={() => navigate(-1)}
            title="Voltar"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
          <div>
            <h3 className="profile-page-title">Meu Perfil</h3>
            <p className="profile-page-subtitle">Gerencie suas informações pessoais e preferências da conta</p>
          </div>
        </div>

        {!isEditing ? (
          <button 
            type="button" 
            className="btn-primary-purple d-flex align-items-center gap-2"
            onClick={handleStartEdit}
          >
            <FontAwesomeIcon icon={faPenToSquare} />
            Editar Perfil
          </button>
        ) : (
          <div className="d-flex gap-2">
            <button 
              type="button" 
              className="btn-outline-gray d-flex align-items-center gap-2"
              onClick={handleCancelEdit}
            >
              <FontAwesomeIcon icon={faXmark} />
              Cancelar
            </button>
            <button 
              type="button" 
              className="btn-primary-purple d-flex align-items-center gap-2"
              onClick={handleSave}
            >
              <FontAwesomeIcon icon={faCheck} />
              Salvar Alterações
            </button>
          </div>
        )}
      </header>

      {/* Alerta de Sucesso */}
      {saveSuccess && (
        <div className="alert alert-success alert-dismissible fade show rounded-3 shadow-sm mb-4 d-flex align-items-center gap-2" role="alert" style={{ backgroundColor: '#DCFCE7', color: '#15803D', border: '1px solid #86EFAC' }}>
          <FontAwesomeIcon icon={faCheck} className="fs-5" />
          <span className="fw-bold">Suas informações foram atualizadas com sucesso!</span>
        </div>
      )}

      {/* Hero Profile Card */}
      <div className="perfil-hero-card mb-4">
        <div className="perfil-hero-accent-bar" />
        
        <div className="perfil-hero-content">
          <div className="perfil-user-meta">
            <div className="perfil-avatar-box">
              <FontAwesomeIcon icon={faUser} />
            </div>

            <div>
              <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                <h2 className="user-name-title">{userProfile.name || 'Usuário'}</h2>
                {userProfile.role && <span className="role-badge-pill">{userProfile.role}</span>}
                {userProfile.status && (
                  <span className="badge rounded-pill bg-success px-3 py-1" style={{ fontSize: '0.8rem', backgroundColor: '#10B981' }}>
                    ● {userProfile.status}
                  </span>
                )}
              </div>
              
              <div className="user-department-info d-flex flex-wrap align-items-center gap-2">
                {userProfile.institution && (
                  <div className="d-flex align-items-center gap-1">
                    <FontAwesomeIcon icon={faBuilding} className="text-secondary" />
                    <span>{userProfile.institution}</span>
                  </div>
                )}
                {userProfile.registration && (
                  <span className="matricula-tag">Matrícula: {userProfile.registration}</span>
                )}
                {userProfile.cnh && (
                  <span className="matricula-tag">CNH: {userProfile.cnh} {userProfile.category ? `(Cat. ${userProfile.category})` : ''}</span>
                )}
                {userProfile.adminId && (
                  <span className="matricula-tag">ID Admin: #{userProfile.adminId}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grade de Informações e Configurações */}
      <div className="row g-4">
        {/* Coluna da Esquerda: Dados Pessoais */}
        <div className="col-12 col-lg-7">
          <div className="perfil-section-card">
            <h4 className="section-header-title">
              <FontAwesomeIcon icon={faIdCard} style={{ color: '#7E22CE' }} />
              Informações Pessoais e de Contato
            </h4>

            {!isEditing ? (
              <div className="info-grid">
                <div>
                  <div className="info-field-label">Nome Completo</div>
                  <div className="info-field-value">{userProfile.name || '—'}</div>
                </div>

                <div>
                  <div className="info-field-label">E-mail Profissional</div>
                  <div className="info-field-value">{userProfile.email || '—'}</div>
                </div>

                {userProfile.phone !== null && (
                  <div>
                    <div className="info-field-label">Telefone / Celular</div>
                    <div className="info-field-value">{userProfile.phone || 'Não informado'}</div>
                  </div>
                )}

                {userProfile.registration !== null && (
                  <div>
                    <div className="info-field-label">Matrícula Acadêmica</div>
                    <div className="info-field-value">{userProfile.registration || 'Não informada'}</div>
                  </div>
                )}

                {userProfile.institution !== null && (
                  <div style={{ gridColumn: '1 / -1' }}>
                    <div className="info-field-label">Instituição / Campus</div>
                    <div className="info-field-value mb-0">{userProfile.institution || 'Não informada'}</div>
                  </div>
                )}

                {userProfile.cnh !== null && (
                  <div>
                    <div className="info-field-label">Número da CNH</div>
                    <div className="info-field-value">{userProfile.cnh || 'Não informada'}</div>
                  </div>
                )}

                {userProfile.category !== null && (
                  <div>
                    <div className="info-field-label">Categoria da CNH</div>
                    <div className="info-field-value">{userProfile.category || '—'}</div>
                  </div>
                )}

                {userProfile.birthDate !== null && (
                  <div>
                    <div className="info-field-label">Data de Nascimento</div>
                    <div className="info-field-value">{userProfile.birthDate || 'Não informada'}</div>
                  </div>
                )}

                {userProfile.validity !== null && (
                  <div>
                    <div className="info-field-label">Validade da CNH</div>
                    <div className="info-field-value">{userProfile.validity || 'Não informada'}</div>
                  </div>
                )}

                {userProfile.adminId !== null && (
                  <div>
                    <div className="info-field-label">ID de Acesso</div>
                    <div className="info-field-value">#{userProfile.adminId}</div>
                  </div>
                )}

                <div>
                  <div className="info-field-label">Status no Sistema</div>
                  <div className="info-field-value mb-0">
                    <span className="text-success fw-bold">● {userProfile.status || 'Ativo'}</span>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSave} className="row g-3">
                <div className="col-12 col-md-6">
                  <label className="form-label fw-bold small text-muted">Nome Completo</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={formData.name || ''}
                    onChange={(e) => handleChange('name', e.target.value)}
                    required
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label fw-bold small text-muted">E-mail Profissional</label>
                  <input 
                    type="email" 
                    className="form-control" 
                    value={formData.email || ''}
                    onChange={(e) => handleChange('email', e.target.value)}
                    required
                  />
                </div>

                {formData.phone !== null && (
                  <div className="col-12 col-md-6">
                    <label className="form-label fw-bold small text-muted">Telefone / Celular</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={formData.phone || ''}
                      onChange={(e) => handleChange('phone', e.target.value)}
                    />
                  </div>
                )}

                {formData.registration !== null && (
                  <div className="col-12 col-md-6">
                    <label className="form-label fw-bold small text-muted">Matrícula Acadêmica</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={formData.registration || ''}
                      onChange={(e) => handleChange('registration', e.target.value)}
                    />
                  </div>
                )}

                {formData.institution !== null && (
                  <div className="col-12">
                    <label className="form-label fw-bold small text-muted">Instituição / Campus</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={formData.institution || ''}
                      onChange={(e) => handleChange('institution', e.target.value)}
                    />
                  </div>
                )}

                {formData.cnh !== null && (
                  <div className="col-12 col-md-6">
                    <label className="form-label fw-bold small text-muted">Número da CNH</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={formData.cnh || ''}
                      onChange={(e) => handleChange('cnh', e.target.value)}
                    />
                  </div>
                )}

                {formData.category !== null && (
                  <div className="col-12 col-md-6">
                    <label className="form-label fw-bold small text-muted">Categoria da CNH</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={formData.category || ''}
                      onChange={(e) => handleChange('category', e.target.value)}
                    />
                  </div>
                )}

                <div className="col-12 mt-4 d-flex justify-content-end gap-2">
                  <button type="button" className="btn-outline-gray" onClick={handleCancelEdit} disabled={saving}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn-primary-purple" disabled={saving}>
                    {saving ? 'Salvando no Banco...' : 'Salvar Alterações'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Coluna da Direita: Estatísticas e Notificações */}
        <div className="col-12 col-lg-5 d-flex flex-column gap-4">
          {/* Box de Estatísticas */}
          <div className="perfil-section-card">
            <h4 className="section-header-title">
              <FontAwesomeIcon icon={faBus} style={{ color: '#7E22CE' }} />
              Visão Geral da Frota
            </h4>

            <div className="stats-grid">
              <div className="stat-item-box">
                <div className="stat-value-num">12</div>
                <div className="stat-label-text">Ônibus Ativos</div>
              </div>

              <div className="stat-item-box">
                <div className="stat-value-num">05</div>
                <div className="stat-label-text">Rotas Atuais</div>
              </div>

              <div className="stat-item-box">
                <div className="stat-value-num">02</div>
                <div className="stat-label-text">Avisos Pendentes</div>
              </div>
            </div>
          </div>

          {/* Minhas Viagens (passageiro) */}
          {trips.length > 0 && (
            <div className="perfil-section-card">
              <h4 className="section-header-title">
                <FontAwesomeIcon icon={faRoute} style={{ color: '#7E22CE' }} />
                Minhas Viagens
              </h4>
              {tripsLoading ? (
                <div className="text-center py-3">
                  <FontAwesomeIcon icon={faSpinner} spin style={{ color: '#7E22CE' }} />
                </div>
              ) : (
                <div className="d-flex flex-column gap-2">
                  {trips.map((t, idx) => (
                    <div key={t.tripId || idx} className="d-flex justify-content-between align-items-center p-2 rounded-3" style={{ backgroundColor: '#FAF5FF' }}>
                      <div>
                        <div className="fw-bold small">{t.routeName || t.routeCode || `Viagem ${idx + 1}`}</div>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>{t.date} - {t.bus || ''}</div>
                      </div>
                      <span className={`badge ${t.status === 'Concluída' || t.status === 'Concluido' ? 'bg-success' : 'bg-warning text-dark'} rounded-pill`}>
                        {t.status || 'Pendente'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
