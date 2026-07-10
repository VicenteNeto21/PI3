import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { usePerfil } from '../../hooks/usePerfil';
import './ProfileIcon.css';

export const ProfileIcon = () => {
  const navigate = useNavigate();
  const { userProfile } = usePerfil();

  const initial = userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : 'B';
  const displayName = userProfile?.name || 'Bruno Silva';

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
        <span className="profile-pill-role">Coordenador de Frota</span>
      </div>

      <FontAwesomeIcon icon={faChevronRight} className="profile-pill-arrow d-none d-sm-inline-block" />
    </button>
  );
};
