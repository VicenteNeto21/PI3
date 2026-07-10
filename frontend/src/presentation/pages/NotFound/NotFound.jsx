import React from 'react';
import logoGlass from '../../../assets/logo-glass-siti-404.png';
import './NotFound.css';

export const NotFound = () => {
  return (
    <div className="not-found-container">
      <div className="not-found-glow" />

      <div className="not-found-bg-image-container">
        <img src={logoGlass} alt="SITI 404 Background" className="not-found-bg-image" />
      </div>

      <div className="not-found-content">
        <h1 className="not-found-title">ERRO 404</h1>
        <p className="not-found-subtitle">Página não encontrada</p>
      </div>
    </div>
  );
};
