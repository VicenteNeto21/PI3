import { Usuario } from '../../domain/models/Usuario';

export const mockUsuarios = [
  new Usuario({
    id: '1',
    nome: 'Carlos Souza (ADM)',
    email: 'adm@siti.com',
    role: 'adm',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
  }),
  new Usuario({
    id: '2',
    nome: 'Roberto Silva (Motorista)',
    email: 'motorista@siti.com',
    role: 'motorista',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80',
    rotaId: '1',
  }),
  new Usuario({
    id: '3',
    nome: 'Ana Paula Rodrigues (Estudante)',
    email: 'aluno@siti.com',
    role: 'aluno',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    rotaId: '1',
    paradaId: '3', // Praça Gentil Cardoso
  }),
];
