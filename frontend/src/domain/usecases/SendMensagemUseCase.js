export class SendMensagemUseCase {
  constructor(mensagemRepository) {
    this.mensagemRepository = mensagemRepository;
  }

  async execute(mensagem) {
    return await this.mensagemRepository.add(mensagem);
  }
}
