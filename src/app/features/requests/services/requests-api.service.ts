import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_BASE_URL } from '../../../core/config/api.config';
import { ApiResponse } from '../../../models/api-response.model';
import { CreateRequest } from '../../../models/create-request.model';
import { RequestTimeline } from '../../../models/request-timeline.model';
import { Solicitud, SolicitudDetalle } from '../../../models/solicitud.model';

@Injectable({ providedIn: 'root' })
export class RequestsApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/requests`;

  createRequest(dto: CreateRequest): Observable<SolicitudDetalle> {
    return this.http.post<ApiResponse<SolicitudDetalle>>(this.baseUrl, dto).pipe(
      map((response) => {
        if (!response.data) {
          throw new Error(response.message ?? 'No se pudo crear la solicitud.');
        }

        return response.data;
      })
    );
  }

  getRequests(): Observable<Solicitud[]> {
    return this.http
      .get<ApiResponse<Solicitud[]>>(this.baseUrl)
      .pipe(map((response) => response.data ?? []));
  }

  getRequestById(id: string): Observable<SolicitudDetalle | null> {
    return this.http
      .get<ApiResponse<SolicitudDetalle>>(`${this.baseUrl}/${id}`)
      .pipe(map((response) => response.data));
  }

  getTimeline(id: string): Observable<RequestTimeline[]> {
    return this.http
      .get<ApiResponse<RequestTimeline[]>>(`${this.baseUrl}/${id}/timeline`)
      .pipe(map((response) => response.data ?? []));
  }
}
