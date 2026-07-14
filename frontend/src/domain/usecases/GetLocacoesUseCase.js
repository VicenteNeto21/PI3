export class GetLocacoesUseCase {
  constructor(locacaoRepository) {
    this.locacaoRepository = locacaoRepository;
  }

  async execute() {
    return await this.locacaoRepository.getAll();
  }
}
