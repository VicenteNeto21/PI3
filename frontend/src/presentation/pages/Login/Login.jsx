import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Form, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserShield, faUserGraduate, faIdCard } from '@fortawesome/free-solid-svg-icons';
import { Logo } from '../../components/Logo/Logo';
import { Input } from '../../components/Input/Input';
import { Button } from '../../components/Button/Button';
import { useAuth } from '../../hooks/useAuth';
import { logger } from '../../../utils/logger';
import './Login.css';

export const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [selectedRole, setSelectedRole] = useState('motorista');
  const [email, setEmail] = useState('motorista@siti.com');
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setError('');
    setLoading(true);
    logger.auth('TENTATIVA', `👉 Usuário tentou login na tela inicial como: ${selectedRole.toUpperCase()}`);
    try {
      await login(email || selectedRole, password, selectedRole);
      logger.success('UI LOGIN', `🎉 Redirecionando para /dashboard como ${selectedRole.toUpperCase()}`);
      navigate('/dashboard');
    } catch (err) {
      logger.warn('UI LOGIN', '⚠️ Autenticação negada. Exibindo alerta de erro no formulário.');
      setError('Usuário ou senha errado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <Container className="login-content">
        <Row className="w-100 align-items-center justify-content-between m-0">
          <Col md={5} className="d-flex justify-content-center mb-5 mb-md-0">
            <div className="login-logo-container">
              <Logo />
            </div>
          </Col>
          
          <Col md={6} className="d-flex justify-content-center p-0">
            <div className="login-card w-100">
              <h2 className="text-center mb-2 fw-bold">Entrar</h2>
              <p className="text-center text-muted mb-4 fs-6">Selecione o seu perfil de acesso:</p>
              
              <div className="role-selector d-flex gap-2 mb-4">
                <button
                  type="button"
                  className={`role-btn flex-grow-1 d-flex align-items-center justify-content-center gap-1 ${selectedRole === 'adm' ? 'active' : ''}`}
                  onClick={() => { setSelectedRole('adm'); setEmail('admin@siti.com'); setPassword('123456'); setError(''); }}
                >
                  <FontAwesomeIcon icon={faUserShield} />
                  <span>ADM</span>
                </button>
                <button
                  type="button"
                  className={`role-btn flex-grow-1 d-flex align-items-center justify-content-center gap-1 ${selectedRole === 'aluno' ? 'active' : ''}`}
                  onClick={() => { setSelectedRole('aluno'); setEmail('aluno@siti.com'); setPassword('123456'); setError(''); }}
                >
                  <FontAwesomeIcon icon={faUserGraduate} />
                  <span>Aluno</span>
                </button>
                <button
                  type="button"
                  className={`role-btn flex-grow-1 d-flex align-items-center justify-content-center gap-1 ${selectedRole === 'motorista' ? 'active' : ''}`}
                  onClick={() => { setSelectedRole('motorista'); setEmail('motorista@siti.com'); setPassword('123456'); setError(''); }}
                >
                  <FontAwesomeIcon icon={faIdCard} />
                  <span>Motorista</span>
                </button>
              </div>

              {error && (
                <Alert variant="danger" onClose={() => setError('')} dismissible className="mb-3 text-center py-2 fs-6">
                  {error}
                </Alert>
              )}

              <Form className="w-100 d-flex flex-column gap-3" onSubmit={handleLogin}>
                <Form.Group controlId="formBasicEmail">
                  <Input 
                    type="email" 
                    placeholder="E-mail (ou deixe vazio para teste)" 
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); if (error) setError(''); }}
                  />
                </Form.Group>

                <Form.Group controlId="formBasicPassword">
                  <Input 
                    type="password" 
                    placeholder="Senha" 
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); if (error) setError(''); }}
                  />
                </Form.Group>
                
                <Button type="submit" className="mt-2" disabled={loading}>
                  {loading ? 'Entrando...' : `Entrar como ${selectedRole.toUpperCase()}`}
                </Button>
              </Form>
              
              <a href="#" onClick={(e) => { e.preventDefault(); navigate('/recuperar-senha'); }} className="forgot-password text-center w-100 d-block mt-3">
                Esqueci minha senha
              </a>

              {/* Botão de Cadastro para Alunos, direcionando para o formulário completo do protótipo */}
              {selectedRole === 'aluno' && (
                <div className="text-center mt-3 pt-3 border-top">
                  <span className="text-muted small me-2">Ainda não possui acesso?</span>
                  <button 
                    type="button" 
                    className="btn btn-link p-0 fw-bold text-decoration-none" 
                    style={{ color: '#9D00FF' }}
                    onClick={() => navigate('/cadastro')}
                  >
                    Cadastre-se como Aluno
                  </button>
                </div>
              )}

              {/* Guia de Contas de Teste */}
              <div className="mt-4 p-3 rounded-3" style={{ backgroundColor: '#F8F4FC', border: '1px dashed #9D00FF' }}>
                <div className="d-flex align-items-center gap-2 mb-2" style={{ color: '#5C2078' }}>
                  <span className="fw-bold small">🔑 Contas de Teste Cadastradas (Senha: 123456):</span>
                </div>
                <div className="d-flex flex-column gap-1 small text-muted">
                  <div><strong>ADM:</strong> admin@siti.com</div>
                  <div><strong>Motorista:</strong> motorista@siti.com</div>
                  <div><strong>Aluno:</strong> aluno@siti.com</div>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};
