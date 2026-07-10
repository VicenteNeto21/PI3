import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faRoute, 
  faBus, 
  faBell, 
  faEnvelope, 
  faArrowRightFromBracket, 
  faTimes,
  faUsers,
  faUserGraduate,
  faIdCard,
  faUserShield,
  faLocationArrow,
  faRotateLeft
} from '@fortawesome/free-solid-svg-icons';
import logoSidebar from '../../../assets/logo-siti.svg';
import { useAuth } from '../../hooks/useAuth';
import './Sidebar.css';

export const Sidebar = ({ unreadAvisosCount = 0, isOpen, onClose }) => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  const handleLogout = async (e) => {
    e.preventDefault();
    await logout();
    navigate('/');
  };

  const role = currentUser?.role || 'motorista';

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'open' : ''} d-md-none`} onClick={onClose}></div>
      
      <aside className={`sidebar d-flex flex-column py-3 ${isOpen ? 'open' : ''}`}>
        <button className="btn btn-link text-white d-md-none position-absolute top-0 end-0 m-2" onClick={onClose}>
          <FontAwesomeIcon icon={faTimes} size="lg" />
        </button>
        
        <div className="sidebar-logo text-center mb-3 mt-2">
          <img src={logoSidebar} alt="SITI Logo Sidebar" className="img-fluid" />
        </div>

        {currentUser && (
          <div className="sidebar-user-info px-3 mb-4 text-center">
            <span className="badge w-100 py-2 d-flex align-items-center justify-content-center gap-2" style={{ backgroundColor: '#380143', border: '1px solid #9D00FF', color: '#FFF', fontSize: '0.75rem' }}>
              <FontAwesomeIcon icon={role === 'adm' ? faUserShield : role === 'aluno' ? faUserGraduate : faIdCard} />
              {role === 'adm' ? 'Administrador' : role === 'aluno' ? 'Área do Aluno' : 'Motorista'}
            </span>
          </div>
        )}

        <nav className="sidebar-nav flex-grow-1 d-flex flex-column px-3 gap-2 overflow-auto">
          {/* Links do ADM */}
          {role === 'adm' && (
            <>
              <NavLink to="/dashboard/adm/rotas" className="sidebar-link" onClick={onClose}>
                <FontAwesomeIcon icon={faRoute} className="sidebar-icon" />
                <span>Rotas</span>
              </NavLink>
              
              <NavLink to="/dashboard/adm/veiculos" className="sidebar-link" onClick={onClose}>
                <FontAwesomeIcon icon={faBus} className="sidebar-icon" />
                <span>Veículos</span>
              </NavLink>

              <NavLink to="/dashboard/adm/motoristas" className="sidebar-link" onClick={onClose}>
                <FontAwesomeIcon icon={faIdCard} className="sidebar-icon" />
                <span>Motoristas</span>
              </NavLink>

              <NavLink to="/dashboard/adm/passageiros" className="sidebar-link" onClick={onClose}>
                <FontAwesomeIcon icon={faUsers} className="sidebar-icon" />
                <span>Passageiros</span>
              </NavLink>

              <NavLink to="/dashboard/avisos" className="sidebar-link d-flex justify-content-between align-items-center" onClick={onClose}>
                <div className="d-flex align-items-center">
                  <FontAwesomeIcon icon={faBell} className="sidebar-icon" />
                  <span>Avisos</span>
                </div>
                {unreadAvisosCount > 0 && (
                  <span className="badge rounded-pill" style={{ background: '#9D00FF' }}>
                    {unreadAvisosCount}
                  </span>
                )}
              </NavLink>
            </>
          )}

          {/* Links do ALUNO */}
          {role === 'aluno' && (
            <>
              <NavLink to="/dashboard/aluno/rota" className="sidebar-link" onClick={onClose}>
                <FontAwesomeIcon icon={faLocationArrow} className="sidebar-icon" />
                <span>Saída</span>
              </NavLink>

              <NavLink to="/dashboard/aluno/retorno" className="sidebar-link" onClick={onClose}>
                <FontAwesomeIcon icon={faRotateLeft} className="sidebar-icon" />
                <span>Retorno</span>
              </NavLink>

              <NavLink to="/dashboard/aluno/motoristas" className="sidebar-link" onClick={onClose}>
                <FontAwesomeIcon icon={faIdCard} className="sidebar-icon" />
                <span>Motoristas</span>
              </NavLink>

              <NavLink to="/dashboard/avisos" className="sidebar-link d-flex justify-content-between align-items-center" onClick={onClose}>
                <div className="d-flex align-items-center">
                  <FontAwesomeIcon icon={faBell} className="sidebar-icon" />
                  <span>Avisos</span>
                </div>
                {unreadAvisosCount > 0 && (
                  <span className="badge rounded-pill" style={{ background: '#9D00FF' }}>
                    {unreadAvisosCount}
                  </span>
                )}
              </NavLink>
              
              <NavLink to="/dashboard/mensagens" className="sidebar-link" onClick={onClose}>
                <FontAwesomeIcon icon={faEnvelope} className="sidebar-icon" />
                <span>Caixa de Mensagem</span>
              </NavLink>
            </>
          )}

          {/* Links do MOTORISTA */}
          {role === 'motorista' && (
            <>
              <NavLink to="/dashboard/rotas" className="sidebar-link" onClick={onClose}>
                <FontAwesomeIcon icon={faRoute} className="sidebar-icon" />
                <span>Rotas</span>
              </NavLink>
              
              <NavLink to="/dashboard/veiculos" className="sidebar-link" onClick={onClose}>
                <FontAwesomeIcon icon={faBus} className="sidebar-icon" />
                <span>Veículos</span>
              </NavLink>

              <NavLink to="/dashboard/avisos" className="sidebar-link d-flex justify-content-between align-items-center" onClick={onClose}>
                <div className="d-flex align-items-center">
                  <FontAwesomeIcon icon={faBell} className="sidebar-icon" />
                  <span>Avisos</span>
                </div>
                {unreadAvisosCount > 0 && (
                  <span className="badge rounded-pill" style={{ background: '#9D00FF' }}>
                    {unreadAvisosCount}
                  </span>
                )}
              </NavLink>
              
              <NavLink to="/dashboard/mensagens" className="sidebar-link" onClick={onClose}>
                <FontAwesomeIcon icon={faEnvelope} className="sidebar-icon" />
                <span>Caixa de Mensagem</span>
              </NavLink>
            </>
          )}
        </nav>

        <div className="sidebar-footer px-3 mt-auto pt-2">
          <a href="/" onClick={handleLogout} className="sidebar-link logout-link justify-content-center">
            <FontAwesomeIcon icon={faArrowRightFromBracket} className="sidebar-icon" style={{ marginRight: '8px' }} />
            <span>Sair</span>
          </a>
        </div>
      </aside>
    </>
  );
};
