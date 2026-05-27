import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_BASE_URL } from '../../../core/config/api.config';
import { ApiResponse } from '../../../models/api-response.model';
import { Evidencia, TipoEvidencia } from '../../../models/evidencia.model';

@Injectable({ providedIn: 'root' })
export class EvidenceApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/requests`;

  getEvidence(requestId: string): Observable<Evidencia[]> {
    return this.http
      .get<ApiResponse<Evidencia[]>>(`${this.baseUrl}/${requestId}/evidence`)
      .pipe(map((response) => response.data ?? []));
  }

  uploadEvidence(requestId: string, file: File, type: TipoEvidencia): Observable<Evidencia> {
    const form = new FormData();
    form.append('type', String(type));
    form.append('file', file, file.name);

    return this.http
      .post<ApiResponse<Evidencia>>(`${this.baseUrl}/${requestId}/evidence`, form)
      .pipe(
        map((response) => {
          if (!response.data) {
            throw new Error(response.message ?? 'No se pudo subir la evidencia.');
          }

          return response.data;
        })
      );
  }
}
