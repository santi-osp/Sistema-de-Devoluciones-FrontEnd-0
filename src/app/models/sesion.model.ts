import { Usuario } from './usuario.model';

export interface Sesion {
  accessToken: string;
  expiresAt: string;
  user: Usuario;
}
