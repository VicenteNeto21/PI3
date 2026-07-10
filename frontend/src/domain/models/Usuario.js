export class Usuario {
  constructor({ id, nome, email, role, avatar, rotaId = null, paradaId = null }) {
    this.id = id;
    this.nome = nome;
    this.email = email;
    this.role = role; // 'adm' | 'aluno' | 'motorista'
    this.avatar = avatar || '';
    this.rotaId = rotaId;
    this.paradaId = paradaId;
  }

  isAdmin() {
    return this.role === 'adm';
  }

  isAluno() {
    return this.role === 'aluno';
  }

  isMotorista() {
    return this.role === 'motorista';
  }
}
