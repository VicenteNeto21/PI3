import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './presentation/context/AuthContext';
import { Login } from './presentation/pages/Login/Login';
import { CadastroAluno } from './presentation/pages/Cadastro/CadastroAluno';
import { RecuperarSenha } from './presentation/pages/RecuperarSenha/RecuperarSenha';
import { Dashboard } from './presentation/pages/Dashboard/Dashboard';
import { NotFound } from './presentation/pages/NotFound/NotFound';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/cadastro" element={<CadastroAluno />} />
          <Route path="/recuperar-senha" element={<RecuperarSenha />} />
          {/* Rota para o Dashboard e suas sub-rotas */}
          <Route path="/dashboard/*" element={<Dashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
