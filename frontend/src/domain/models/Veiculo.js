export class Veiculo {
  constructor({ id, placa, modelo, status, capacidade, ano, acessibilidade }) {
    this.id = id;
    this.placa = placa;
    this.modelo = modelo || '';
    this.status = status;
    this.capacidade = capacidade;
    this.ano = ano;
    this.acessibilidade = acessibilidade;
  }

  isManutencao() {
    return this.status === 'Manutenção';
  }
}
