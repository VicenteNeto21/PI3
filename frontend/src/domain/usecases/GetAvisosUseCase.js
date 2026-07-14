export class GetAvisosUseCase {
  constructor(avisoRepository) {
    this.avisoRepository = avisoRepository;
  }

  async execute() {
    return await this.avisoRepository.getAll();
  }
}
