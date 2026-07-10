export class MarkAvisoAsReadUseCase {
  constructor(avisoRepository) {
    this.avisoRepository = avisoRepository;
  }

  async execute(id = null) {
    if (id === null) {
      return await this.avisoRepository.markAllAsRead();
    }
    return await this.avisoRepository.markAsRead(id);
  }
}
