import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Form } from 'react-bootstrap';
import { Logo } from '../../components/Logo/Logo';
import { Input } from '../../components/Input/Input';
import { Button } from '../../components/Button/Button';
import './RecuperarSenha.css';
import '../Login/Login.css'; // Importando Login.css para padronização total da logo e classes

export const RecuperarSenha = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!email) return;
    setSent(true);
  };

  return (
    <div className="recuperar-container">
      <Container className="recuperar-content">
        <Row className="w-100 align-items-center justify-content-between m-0">
          {/* Lado Esquerdo - Logo SITI usando a classe exata login-logo-container da tela de Login */}
          <Col md={5} className="d-flex justify-content-center mb-5 mb-md-0">
            <div className="login-logo-container">
              <Logo />
            </div>
          </Col>
          
          {/* Lado Direito - Card com dimensões e paddings idênticos ao login-card */}
          <Col md={6} className="d-flex justify-content-center p-0">
            <div className="recuperar-card w-100">
              <h2 className="text-center mb-4 fw-bold">Recuperar senha</h2>
              
              {sent ? (
                <div className="text-center py-2">
                  <div className="alert alert-success py-3 px-2 mb-4" style={{ fontSize: '0.9rem', background: '#E8F8F0', borderColor: '#28A745', color: '#155724' }}>
                    <strong>E-mail enviado!</strong> Verifique sua caixa de entrada e spam para redefinir sua senha.
                  </div>
                  <Button 
                    type="button" 
                    className="mt-2 mb-3"
                    onClick={() => setSent(false)}
                  >
                    Tentar outro e-mail
                  </Button>
                  <a 
                    href="#" 
                    onClick={(e) => { e.preventDefault(); navigate('/'); }} 
                    className="recuperar-link-entrar m-0 mt-3"
                  >
                    Entrar
                  </a>
                </div>
              ) : (
                <Form onSubmit={handleSubmit} className="w-100 d-flex flex-column gap-3">
                  <Form.Group controlId="formBasicEmail">
                    <Input 
                      type="email" 
                      placeholder="E-mail" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                    />
                  </Form.Group>
                  
                  <Button type="submit" className="mt-2" onClick={handleSubmit}>
                    Enviar e-mail de recuperação
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
