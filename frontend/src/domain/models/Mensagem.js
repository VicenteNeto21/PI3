export class Mensagem {
  constructor({ id, email, subject, message, text, date, time, status, adminEmail }) {
    this.id = id;
    this.email = email || 'aluno@estudante.ufc.br';
    this.subject = subject || 'Sem assunto';
    this.message = message || text || '';
    this.date = date || time || 'Hoje';
    this.status = status || 'Aguardando Resposta';
    this.adminEmail = adminEmail || 'adm@siti.com';
  }
}
