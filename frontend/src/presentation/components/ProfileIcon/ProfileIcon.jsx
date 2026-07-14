import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { usePerfil } from '../../hooks/usePerfil';
import './ProfileIcon.css';

export const ProfileIcon = () => {
  const navigate = useNavigate();
  const { userProfile } = usePerfil();

  const getRoleLabel = () => {
    const r = String(userProfile?.roleCode || userProfile?.role || '').toUpperCase();
    if (r.includes('ADMIN') || r.includes('ADM') || r.includes('COORD')) return 'Administrador';
    if (r.includes('DRIV') || r.includes('MOTOR')) return 'Motorista';
    if (r.includes('USER') || r.includes('ALUN') || r.includes('ESTUD') || r.includes('PASS')) return 'Estudante';

    try {
      const stored = JSON.parse(sessionStorage.getItem('siti_current_user') || '{}');
      const sr = String(stored.role || stored.roleCode || '').toUpperCase();
      if (sr.includes('ADMIN') || sr.includes('ADM')) return 'Administrador';
      if (sr.includes('DRIV') || sr.includes('MOTOR')) return 'Motorista';
    } catch (e) {}

    return userProfile?.role || 'Estudante';
  };

  const initial = userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : 'U';
  const displayName = userProfile?.name || 'Usuário';
  const roleLabel = getRoleLabel();

  return (
    <button 
      type="button"
      className="profile-pill-btn"
      onClick={() => navigate('/dashboard/perfil')}
      title="Acessar Meu Perfil"
      aria-label="Acessar Meu Perfil"
    >
      <div className="profile-pill-avatar">
        <span>{initial}</span>
      </div>

      <div className="profile-pill-info d-none d-sm-flex">
        <span className="profile-pill-name">{displayName}</span>
        <span className="profile-pill-role">{roleLabel}</span>
      </div>

      <FontAwesomeIcon icon={faChevronRight} className="profile-pill-arrow d-none d-sm-inline-block" />
    </button>
  );
};
