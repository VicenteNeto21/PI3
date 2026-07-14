import { useState, useEffect } from 'react';
import { MensagemRepository } from '../../data/repositories/MensagemRepository';
import { GetMensagensUseCase } from '../../domain/usecases/GetMensagensUseCase';
import { SendMensagemUseCase } from '../../domain/usecases/SendMensagemUseCase';
import { logger } from '../../utils/logger';

const mensagemRepository = new MensagemRepository();
const getMensagensUseCase = new GetMensagensUseCase(mensagemRepository);
const sendMensagemUseCase = new SendMensagemUseCase(mensagemRepository);

export const useMensagens = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      try {
        const data = await getMensagensUseCase.execute();
        setMessages(data);
      } catch (error) {
        logger.error('MENSAGENS', 'Erro ao carregar mensagens na API:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  const sendContactMessage = async ({ email, subject, message }) => {
    if (!message || !message.trim()) return;

    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const date = `Hoje às ${timeString}`;
    
    logger.info('MENSAGENS', `✉️ Enviando mensagem de contato: "${subject || 'Sem assunto'}" para adm@siti.com`);
    const updated = await sendMensagemUseCase.execute({
      email: email || 'aluno@estudante.ufc.br',
      subject: subject || 'Dúvida sobre o sistema SITI',
      message: message.trim(),
      date,
      status: 'Aguardando Resposta',
      adminEmail: 'adm@siti.com'
    });
    
    setMessages(updated);
    logger.success('MENSAGENS', '✅ Mensagem enviada e salva com sucesso!');
    return updated;
  };

  // Mantido para retrocompatibilidade
  const sendMessage = async (text) => {
    return sendContactMessage({ subject: 'Mensagem Geral', message: text });
  };

  return {
    messages,
    loading,
    sendContactMessage,
    sendMessage
  };
};
