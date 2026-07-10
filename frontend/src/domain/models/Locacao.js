export class Locacao {
  constructor({ id, nome, estudantes }) {
    this.id = id;
    this.nome = nome;
    this.estudantes = estudantes || [];
  }
}

export class Estudante {
  constructor({ id, nome, status }) {
    this.id = id;
    this.nome = nome;
    this.status = status; // Ex: 'Embarcou', 'Pendente'
  }
}
