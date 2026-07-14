import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Form, Alert } from 'react-bootstrap';
import { Logo } from '../../components/Logo/Logo';
import { Input } from '../../components/Input/Input';
import { Button } from '../../components/Button/Button';
import { useAuth } from '../../hooks/useAuth';
import { logger } from '../../../utils/logger';
import './Login.css';

export const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!email) {
      setError('Por favor, digite seu e-mail de acesso');
      return;
    }
    setError('');
    setLoading(true);
    logger.auth('TENTATIVA', `👉 Tentativa de login com e-mail: ${email}`);
    try {
      const user = await login(email, password);
      logger.success('UI LOGIN', `🎉 Redirecionando para /dashboard (Perfil detectado: ${user?.role ? user.role.toUpperCase() : 'AUTENTICADO'})`);
      navigate('/dashboard');
    } catch (err) {
      logger.warn('UI LOGIN', '⚠️ Autenticação falhou. Exibindo alerta de erro no formulário.');
      setError('Usuário ou senha incorretos');
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
              <p className="text-center text-muted mb-4 fs-6">Digite seu e-mail e senha para acessar o sistema</p>
              
              {error && (
                <Alert variant="danger" onClose={() => setError('')} dismissible className="mb-3 text-center py-2 fs-6">
                  {error}
                </Alert>
              )}

              <Form className="w-100 d-flex flex-column gap-3" onSubmit={handleLogin}>
                <Form.Group controlId="formBasicEmail">
                  <Input 
                    type="email" 
                    placeholder="E-mail profissional ou acadêmico" 
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); if (error) setError(''); }}
                    required
                  />
                </Form.Group>

                <Form.Group controlId="formBasicPassword">
                  <Input 
                    type="password" 
                    placeholder="Senha" 
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); if (error) setError(''); }}
                    required
                  />
                </Form.Group>
                
                <Button type="submit" className="mt-2" disabled={loading}>
                  {loading ? 'Autenticando...' : 'Entrar no Sistema'}
                </Button>
              </Form>
              
              <a href="#" onClick={(e) => { e.preventDefault(); navigate('/recuperar-senha'); }} className="forgot-password text-center w-100 d-block mt-3">
                Esqueci minha senha
              </a>

              <div className="text-center mt-3 pt-3 border-top">
                <span className="text-muted small me-2">Ainda não possui acesso como aluno?</span>
                <button 
                  type="button" 
                  className="btn btn-link p-0 fw-bold text-decoration-none" 
                  style={{ color: '#9D00FF' }}
                  onClick={() => navigate('/cadastro')}
                >
                  Cadastre-se
                </button>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};
