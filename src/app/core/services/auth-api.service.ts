import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { ApiResponse } from '../../models/api-response.model';
import { Usuario } from '../../models/usuario.model';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  userId: string;
  name: string;
  email: string;
  roles: string[];
  accessToken: string;
  expiresAt: string;
}

export interface AccessValidation {
  userId: string;
  requiredRole: string;
  hasAccess: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/auth`;

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<ApiResponse<AuthResponse>>(`${this.baseUrl}/login`, request)
      .pipe(map((response) => this.unwrap(response)));
  }

  logout(): Observable<{ loggedOut: boolean }> {
    return this.http
      .post<ApiResponse<{ loggedOut: boolean }>>(`${this.baseUrl}/logout`, {})
      .pipe(map((response) => this.unwrap(response)));
  }

  me(): Observable<Usuario> {
    return this.http
      .get<ApiResponse<Usuario>>(`${this.baseUrl}/me`)
      .pipe(map((response) => this.unwrap(response)));
  }

  validateAccess(requiredRole: string): Observable<AccessValidation> {
    return this.http
      .get<ApiResponse<AccessValidation>>(`${this.baseUrl}/validate-access`, {
        params: { requiredRole }
      })
      .pipe(map((response) => this.unwrap(response)));
  }

  private unwrap<T>(response: ApiResponse<T>): T {
    if (!response.succeeded || response.data === null) {
      throw new Error(response.message ?? 'Respuesta invalida del servidor.');
    }

    return response.data;
  }
}
