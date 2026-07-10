import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { Sidebar } from '../../components/Sidebar/Sidebar';
import { Rotas } from '../Rotas/Rotas';
import { Veiculos } from '../Veiculos/Veiculos';
import { Passageiros } from '../Passageiros/Passageiros';
import { Mensagens } from '../Mensagens/Mensagens';
import { Avisos } from '../Avisos/Avisos';
import { Perfil } from '../Perfil/Perfil';
import { RotasAdm } from '../adm/RotasAdm';
import { VeiculosAdm } from '../adm/VeiculosAdm';
import { MotoristasAdm } from '../adm/MotoristasAdm';
import { AlunosAdm } from '../adm/AlunosAdm';
import { MinhaRotaAluno } from '../aluno/MinhaRotaAluno';
import { MotoristasAluno } from '../aluno/MotoristasAluno';
import { useAvisos } from '../../hooks/useAvisos';
import { useAuth } from '../../hooks/useAuth';

export const Dashboard = () => {
  const { avisos, unreadCount, markAsRead, markAllAsRead, addAviso } = useAvisos();
  const { currentUser } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const role = currentUser?.role || 'motorista';
  const defaultRoute = role === 'adm' ? 'adm/rotas' : role === 'aluno' ? 'aluno/rota' : 'rotas';

  return (
    <div className="d-flex flex-column flex-md-row" style={{ minHeight: '100vh', backgroundColor: '#FFFFFF' }}>
      <Sidebar unreadAvisosCount={unreadCount} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <main className="flex-grow-1 d-flex flex-column" style={{ minWidth: 0 }}>
        {/* Mobile Header */}
        <div className="d-md-none d-flex align-items-center p-3 bg-white shadow-sm border-bottom">
          <button className="btn btn-link text-dark p-0 me-3" onClick={() => setIsSidebarOpen(true)}>
            <FontAwesomeIcon icon={faBars} size="lg" />
          </button>
          <h5 className="m-0 fw-bold" style={{ color: '#2A0041' }}>SITI App</h5>
        </div>

        <div className="p-3 p-md-5 flex-grow-1 overflow-auto">
          <Routes>
            <Route path="/" element={<Navigate to={defaultRoute} replace />} />
            
            {/* Rotas do Motorista */}
            <Route path="rotas" element={<Rotas />} />
            <Route path="rotas/passageiros" element={<Passageiros />} />
            <Route path="veiculos" element={<Veiculos />} />
            
            {/* Rotas do Administrador */}
            <Route path="adm/rotas" element={<RotasAdm />} />
            <Route path="adm/veiculos" element={<VeiculosAdm />} />
            <Route path="adm/motoristas" element={<MotoristasAdm />} />
            <Route path="adm/alunos" element={<AlunosAdm />} />
            <Route path="adm/passageiros" element={<AlunosAdm />} />

            {/* Rotas do Aluno */}
            <Route path="aluno/rota" element={<MinhaRotaAluno tipo="Saída" />} />
            <Route path="aluno/saida" element={<MinhaRotaAluno tipo="Saída" />} />
            <Route path="aluno/retorno" element={<MinhaRotaAluno tipo="Retorno" />} />
            <Route path="aluno/motoristas" element={<MotoristasAluno />} />

            {/* Rotas Compartilhadas */}
            <Route path="avisos" element={<Avisos avisos={avisos} markAsRead={markAsRead} markAllAsRead={markAllAsRead} addAviso={addAviso} />} />
            <Route path="mensagens" element={<Mensagens />} />
            <Route path="perfil" element={<Perfil />} />
            
            <Route path="*" element={<Navigate to={defaultRoute} replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};
