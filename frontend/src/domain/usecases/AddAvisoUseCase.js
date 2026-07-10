export class AddAvisoUseCase {
  constructor(avisoRepository) {
    this.avisoRepository = avisoRepository;
  }

  async execute(avisoData) {
    return await this.avisoRepository.add(avisoData);
  }
}
