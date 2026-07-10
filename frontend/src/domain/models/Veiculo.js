export class Veiculo {
  constructor({ id, placa, status, capacidade, ano, acessibilidade }) {
    this.id = id;
    this.placa = placa;
    this.status = status; // Ex: 'Ativo', 'Manutenção'
    this.capacidade = capacidade;
    this.ano = ano;
    this.acessibilidade = acessibilidade;
  }

  isManutencao() {
    return this.status === 'Manutenção';
  }
}
