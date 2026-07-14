export class GetMensagensUseCase {
  constructor(mensagemRepository) {
    this.mensagemRepository = mensagemRepository;
  }

  async execute() {
    return await this.mensagemRepository.getAll();
  }
}
