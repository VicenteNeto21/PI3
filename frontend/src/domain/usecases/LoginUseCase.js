export class LoginUseCase {
  constructor(authRepository) {
    this.authRepository = authRepository;
  }

  async execute(roleOrEmail, password = '', selectedRole = null) {
    return await this.authRepository.login(roleOrEmail, password, selectedRole);
  }
}
