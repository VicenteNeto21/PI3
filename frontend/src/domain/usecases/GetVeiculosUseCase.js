export class GetVeiculosUseCase {
  constructor(veiculoRepository) {
    this.veiculoRepository = veiculoRepository;
  }

  async execute() {
    return await this.veiculoRepository.getAll();
  }
}
