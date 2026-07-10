export class GetPerfilUseCase {
  constructor(perfilRepository) {
    this.perfilRepository = perfilRepository;
  }

  async execute() {
    return await this.perfilRepository.getProfile();
  }
}
