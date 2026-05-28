import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_BASE_URL } from '../../../core/config/api.config';
import { ApiResponse } from '../../../models/api-response.model';
import { CreateComment, InternalComment } from '../../../models/internal-comment.model';
import { DecisionRequest, DecisionResult } from '../../../models/decision.model';
import { EstadoSolicitud } from '../../../models/solicitud.model';
import { OperationDashboard } from '../../../models/operation-dashboard.model';
import { OperationRequest } from '../../../models/operation-request.model';
import { OperationRequestDetail } from '../../../models/operation-request-detail.model';
import { RequestInformation } from '../../../models/request-information.model';

@Injectable({ providedIn: 'root' })
export class OperationApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/operation`;

  getDashboard(): Observable<OperationDashboard | null> {
    return this.http
      .get<ApiResponse<OperationDashboard>>(`${this.baseUrl}/dashboard`)
      .pipe(map((response) => response.data));
  }

  getRequests(status?: EstadoSolicitud | null): Observable<OperationRequest[]> {
    const options = status ? { params: { status } } : {};

    return this.http
      .get<ApiResponse<OperationRequest[]>>(`${this.baseUrl}/requests`, options)
      .pipe(map((response) => response.data ?? []));
  }

  getRequestById(id: string): Observable<OperationRequestDetail | null> {
    return this.http
      .get<ApiResponse<OperationRequestDetail>>(`${this.baseUrl}/requests/${id}`)
      .pipe(map((response) => response.data));
  }

  addComment(requestId: string, dto: CreateComment): Observable<InternalComment> {
    return this.http.post<ApiResponse<InternalComment>>(`${this.baseUrl}/requests/${requestId}/comments`, dto).pipe(
      map((response) => {
        if (!response.data) {
          throw new Error(response.message ?? 'No se pudo crear el comentario.');
        }

        return response.data;
      })
    );
  }

  requestInformation(requestId: string, dto: RequestInformation): Observable<{ requested: boolean }> {
    return this.http
      .post<ApiResponse<{ requested: boolean }>>(
        `${this.baseUrl}/requests/${requestId}/request-information`,
        dto
      )
      .pipe(map((response) => response.data ?? { requested: false }));
  }

  sendToReview(requestId: string): Observable<{ requestId: string; providerId: string; requestStatus: EstadoSolicitud; assignmentStatus: number } | null> {
    return this.http
      .post<ApiResponse<{ requestId: string; providerId: string; requestStatus: EstadoSolicitud; assignmentStatus: number }>>(`${this.baseUrl}/requests/${requestId}/send-to-review`, {})
      .pipe(map((response) => response.data ?? null));
  }

  approveRequest(requestId: string, dto: DecisionRequest): Observable<DecisionResult> {
    return this.decide(requestId, 'approve', dto);
  }

  rejectRequest(requestId: string, dto: DecisionRequest): Observable<DecisionResult> {
    return this.decide(requestId, 'reject', dto);
  }

  private decide(
    requestId: string,
    action: 'approve' | 'reject',
    dto: DecisionRequest
  ): Observable<DecisionResult> {
    return this.http
      .post<ApiResponse<DecisionResult>>(`${this.baseUrl}/requests/${requestId}/${action}`, dto)
      .pipe(
        map((response) => {
          if (!response.data) {
            throw new Error(response.message ?? 'No se pudo registrar la decision.');
          }

          return response.data;
        })
      );
  }
}
