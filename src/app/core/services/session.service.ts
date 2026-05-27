import { Injectable, signal } from '@angular/core';
import { Sesion } from '../../models/sesion.model';
import { Usuario } from '../../models/usuario.model';

const TOKEN_KEY = 'dg_access_token';
const USER_KEY = 'dg_current_user';
const EXPIRES_KEY = 'dg_token_expires_at';

@Injectable({ providedIn: 'root' })
export class SessionService {
  readonly currentUser = signal<Usuario | null>(this.readUser());

  saveSession(session: Sesion): void {
    localStorage.setItem(TOKEN_KEY, session.accessToken);
    localStorage.setItem(USER_KEY, JSON.stringify(session.user));
    localStorage.setItem(EXPIRES_KEY, session.expiresAt);
    this.currentUser.set(session.user);
  }

  updateUser(user: Usuario): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    this.currentUser.set(user);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  getExpiresAt(): string | null {
    return localStorage.getItem(EXPIRES_KEY);
  }

  hasSession(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }

    const expiresAt = this.getExpiresAt();
    if (!expiresAt) {
      return true;
    }

    return new Date(expiresAt).getTime() > Date.now();
  }

  hasRole(roles: string[]): boolean {
    const userRoles = this.currentUser()?.roles ?? [];
    return roles.some((role) => userRoles.includes(role));
  }

  clearSession(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(EXPIRES_KEY);
    this.currentUser.set(null);
  }

  private readUser(): Usuario | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as Usuario;
    } catch {
      this.clearSession();
      return null;
    }
  }
}
