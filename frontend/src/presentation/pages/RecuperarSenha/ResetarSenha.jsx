import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Container, Row, Col, Form } from 'react-bootstrap';
import { Logo } from '../../components/Logo/Logo';
import { Input } from '../../components/Input/Input';
import { Button } from '../../components/Button/Button';
import { httpClient } from '../../../data/api/httpClient';
import './RecuperarSenha.css';
import '../Login/Login.css';

export const ResetarSenha = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!token) {
      setError('Token de recuperação inválido ou expirado.');
      return;
    }
    if (novaSenha.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres.');
      return;
    }
    if (novaSenha !== confirmarSenha) {
      setError('As senhas não coincidem.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await httpClient.post('/auth/reset-password', { token, newPassword: novaSenha });
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Erro ao redefinir senha. Token pode ter expirado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="recuperar-container">
      <Container className="recuperar-content">
        <Row className="w-100 align-items-center justify-content-between m-0">
          <Col md={5} className="d-flex justify-content-center mb-5 mb-md-0">
            <div className="login-logo-container">
              <Logo />
            </div>
          </Col>
          <Col md={6} className="d-flex justify-content-center p-0">
            <div className="recuperar-card w-100">
              <h2 className="text-center mb-4 fw-bold">Redefinir senha</h2>

              {success ? (
                <div className="text-center py-2">
                  <div className="alert alert-success py-3 px-2 mb-4" style={{ fontSize: '0.9rem', background: '#E8F8F0', borderColor: '#28A745', color: '#155724' }}>
                    <strong>Senha redefinida!</strong> Faça login com sua nova senha.
                  </div>
                  <Button type="button" className="mt-2 mb-3" onClick={() => navigate('/')}>
                    Ir para o Login
                  </Button>
                </div>
              ) : (
                <Form onSubmit={handleSubmit} className="w-100 d-flex flex-column gap-3">
                  <Form.Group controlId="formNewPassword">
                    <Input
                      type="password"
                      placeholder="Nova senha"
                      value={novaSenha}
                      onChange={(e) => setNovaSenha(e.target.value)}
                    />
                  </Form.Group>
                  <Form.Group controlId="formConfirmPassword">
                    <Input
                      type="password"
                      placeholder="Confirmar nova senha"
                      value={confirmarSenha}
                      onChange={(e) => setConfirmarSenha(e.target.value)}
                    />
                  </Form.Group>

                  {error && (
                    <div className="alert alert-danger py-2 px-3 mb-0" style={{ fontSize: '0.85rem' }}>
                      {error}
                    </div>
                  )}

                  <Button type="submit" className="mt-2" onClick={handleSubmit} disabled={loading}>
                    {loading ? 'Redefinindo...' : 'Redefinir senha'}
                  </Button>

                  <a
                    href="#"
                    onClick={(e) => { e.preventDefault(); navigate('/'); }}
                    className="recuperar-link-entrar"
                  >
                    Entrar
                  </a>
                </Form>
              )}
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};
