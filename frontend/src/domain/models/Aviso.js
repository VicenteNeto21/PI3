export class Aviso {
  constructor({ id, title, date, description, type, read }) {
    this.id = id;
    this.title = title;
    this.date = date;
    this.description = description;
    this.type = type; // Ex: 'info', 'warning', 'danger', 'success'
    this.read = read;
  }

  markAsRead() {
    this.read = true;
    return this;
  }
}
