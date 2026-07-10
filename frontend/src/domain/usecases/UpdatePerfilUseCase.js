export class UpdatePerfilUseCase {
  constructor(perfilRepository) {
    this.perfilRepository = perfilRepository;
  }

  async execute(payload) {
    return await this.perfilRepository.updateProfile(payload);
  }
}
