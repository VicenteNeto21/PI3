import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faEnvelope, faCheckCircle, faInfoCircle, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useMensagens } from '../../hooks/useMensagens';
import { useAuth } from '../../hooks/useAuth';
import { ProfileIcon } from '../../components/ProfileIcon/ProfileIcon';
import './Mensagens.css';

export const Mensagens = () => {
  const { sendContactMessage } = useMensagens();
  const { currentUser } = useAuth();
  
  // Define o e-mail padrão com base no perfil logado
  const defaultEmail = currentUser?.role === 'motorista' || currentUser?.email?.includes('motorista') 
    ? 'motorista@siti.com' 
    : 'aluno@estudante.ufc.br';

  const [formEmail, setFormEmail] = useState(defaultEmail);
  const [formSubject, setFormSubject] = useState('');
  const [formMessage, setFormMessage] = useState('');
  
  // Estado para armazenar a última mensagem enviada e mostrar na tela de confirmação
  const [sentMsgData, setSentMsgData] = useState(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (defaultEmail && !formEmail) {
      setFormEmail(defaultEmail);
    }
  }, [defaultEmail]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formMessage.trim()) return;

    setSending(true);
    
    // Simula tempo de envio de rede/e-mail (400ms) para UX realista
    setTimeout(async () => {
      const sent = {
        email: formEmail || defaultEmail,
        subject: formSubject || 'Dúvida geral / Solicitação',
        message: formMessage,
        date: `Hoje às ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        adminEmail: 'adm@siti.com'
      };

      await sendContactMessage(sent);
      
      setSentMsgData(sent);
      setFormSubject('');
      setFormMessage('');
      setSending(false);
    }, 400);
  };

  const handleReset = () => {
    setSentMsgData(null);
  };

  return (
    <div className="contato-container h-100 d-flex flex-column">
      {/* Cabeçalho */}
      <div className="contato-header mb-4 d-flex justify-content-between align-items-center">
        <div>
          <h2 className="text-dark fw-bold m-0">Caixa de Mensagem e Suporte</h2>
          <p className="text-muted m-0">Envie dúvidas, relatórios ou solicitações direto para o e-mail da coordenação SITI.</p>
        </div>
        <ProfileIcon />
      </div>

      {/* Área Principal em Tela Toda (Preenchimento Completo 100% largura e altura) */}
      <div className="w-100 flex-grow-1 d-flex flex-column mt-1">
        {sentMsgData ? (
          /* Tela de Confirmação e Registro da Solicitação Enviada (Tela Toda) */
          <div className="contato-card flex-grow-1 d-flex flex-column justify-content-center align-items-center text-center py-5 px-4 shadow-sm w-100">
            <div className="text-success mb-3" style={{ fontSize: '4rem' }}>
              <FontAwesomeIcon icon={faCheckCircle} />
            </div>
            <h3 className="fw-bold text-dark mb-2 fs-2">E-mail Enviado e Registrado com Sucesso!</h3>
            <p className="text-muted mb-4 mx-auto fs-6" style={{ maxWidth: '650px', lineHeight: '1.6' }}>
              Sua solicitação foi encaminhada diretamente para o e-mail do Administrador.
            </p>

            {/* Box de Resumo da Solicitação */}
            <div className="bg-light p-4 rounded-4 border text-start mx-auto mb-4 w-100" style={{ maxWidth: '750px', borderColor: '#E2E8F0' }}>
              <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 pb-3 border-bottom gap-2">
                <span className="fw-bold text-dark fs-5">{sentMsgData.subject}</span>
              </div>
              <p className="text-secondary mb-4 fs-6" style={{ whiteSpace: 'pre-line', lineHeight: '1.6' }}>
                "{sentMsgData.message}"
              </p>
              <div className="d-flex flex-wrap justify-content-between align-items-center text-muted border-top pt-3 mt-2" style={{ fontSize: '0.88rem' }}>
                <span><strong>De:</strong> {sentMsgData.email}</span>
                <span><strong>Para:</strong> {sentMsgData.adminEmail}</span>
                <span className="fw-semibold">{sentMsgData.date}</span>
              </div>
            </div>

            <button 
              type="button" 
              onClick={handleReset} 
              className="btn-enviar-email mx-auto py-3 px-5 fs-6"
              style={{ maxWidth: '350px' }}
            >
              <FontAwesomeIcon icon={faArrowLeft} />
              Enviar Outra Mensagem
            </button>
          </div>
        ) : (
          /* Formulário de Envio de E-mail para a Administração em Tela Toda */
          <div className="contato-card flex-grow-1 d-flex flex-column justify-content-between shadow-sm w-100">
            <div>
              <h3 className="contato-card-title mb-4 fs-4 border-bottom pb-3">
                <FontAwesomeIcon icon={faEnvelope} style={{ color: '#9D00FF' }} />
                Enviar E-mail para a Administração (SITI)
              </h3>

              <div className="contato-info-box d-flex align-items-center gap-3 py-3 px-4 mb-4">
                <FontAwesomeIcon icon={faInfoCircle} className="fs-4 flex-shrink-0" />
                <div className="fs-6">
                  Aqui não é um chat instantâneo. Preencha o formulário abaixo e sua mensagem será enviada direto para o e-mail oficial da Coordenação.
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="d-flex flex-column flex-grow-1">
              <div className="row g-4 mb-3">
                <div className="col-md-6">
                  <label className="contato-label fs-6 mb-2">Seu E-mail para Resposta</label>
                  <input 
                    type="email" 
                    className="contato-input py-2 px-3 fs-6" 
                    placeholder="Ex: aluno@estudante.ufc.br"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="contato-label fs-6 mb-2">Assunto</label>
                  <input 
                    type="text" 
                    className="contato-input py-2 px-3 fs-6" 
                    placeholder="Ex: Dúvida sobre itinerário ou ponto de parada"
                    value={formSubject}
                    onChange={(e) => setFormSubject(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="mb-4 flex-grow-1 d-flex flex-column">
                <label className="contato-label fs-6 mb-2">Mensagem detalhada</label>
                <textarea 
                  className="contato-textarea flex-grow-1 p-3 fs-6" 
                  style={{ minHeight: '220px', resize: 'vertical' }}
                  placeholder="Escreva detalhadamente sua dúvida, sugestão ou solicitação para a coordenação do transporte universitário..."
                  value={formMessage}
                  onChange={(e) => setFormMessage(e.target.value)}
                  required
                ></textarea>
              </div>

              <div className="border-top pt-4 mt-auto d-flex justify-content-end">
                <button type="submit" className="btn-enviar-email py-3 px-5 fs-6 w-100" style={{ maxWidth: '380px' }} disabled={sending || !formMessage.trim()}>
                  {sending ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      Enviando e-mail...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faPaperPlane} />
                      Enviar Mensagem para o ADM
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
