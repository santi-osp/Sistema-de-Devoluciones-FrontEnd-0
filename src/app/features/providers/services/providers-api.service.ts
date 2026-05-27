import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_BASE_URL } from '../../../core/config/api.config';
import { ApiResponse } from '../../../models/api-response.model';
import { ProductReceptionRequest, ProductReceptionResult } from '../../../models/product-reception.model';
import { ProviderCaseDetail } from '../../../models/provider-case-detail.model';
import { ProviderCase } from '../../../models/provider-case.model';
import { ProviderDecisionResult } from '../../../models/provider-decision.model';
import { TechnicalReportRequest, TechnicalReportResult } from '../../../models/technical-report.model';
import {
  WarrantyValidationRequest,
  WarrantyValidationResult
} from '../../../models/warranty-validation.model';

@Injectable({ providedIn: 'root' })
export class ProvidersApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/providers`;

  getCases(): Observable<ProviderCase[]> {
    return this.http
      .get<ApiResponse<ProviderCase[]>>(`${this.baseUrl}/cases`)
      .pipe(map((response) => response.data ?? []));
  }

  getCaseById(id: string): Observable<ProviderCaseDetail | null> {
    return this.http
      .get<ApiResponse<ProviderCaseDetail>>(`${this.baseUrl}/cases/${id}`)
      .pipe(map((response) => response.data));
  }

  validateWarranty(
    id: string,
    dto: WarrantyValidationRequest
  ): Observable<WarrantyValidationResult> {
    return this.http
      .post<ApiResponse<WarrantyValidationResult>>(
        `${this.baseUrl}/cases/${id}/warranty-validation`,
        dto
      )
      .pipe(
        map((response) => {
          if (!response.data) {
            throw new Error(response.message ?? 'No se pudo validar la garantia.');
          }

          return response.data;
        })
      );
  }

  registerTechnicalReport(
    id: string,
    dto: TechnicalReportRequest
  ): Observable<TechnicalReportResult> {
    return this.http
      .post<ApiResponse<TechnicalReportResult>>(`${this.baseUrl}/cases/${id}/technical-report`, dto)
      .pipe(
        map((response) => {
          if (!response.data) {
            throw new Error(response.message ?? 'No se pudo registrar el dictamen.');
          }

          return response.data;
        })
      );
  }

  authorizeRepair(id: string): Observable<ProviderDecisionResult> {
    return this.authorize(id, 'authorize-repair');
  }

  authorizeReplacement(id: string): Observable<ProviderDecisionResult> {
    return this.authorize(id, 'authorize-replacement');
  }

  registerReception(id: string, dto: ProductReceptionRequest): Observable<ProductReceptionResult> {
    return this.http
      .post<ApiResponse<ProductReceptionResult>>(`${this.baseUrl}/cases/${id}/reception`, dto)
      .pipe(
        map((response) => {
          if (!response.data) {
            throw new Error(response.message ?? 'No se pudo registrar la recepcion.');
          }

          return response.data;
        })
      );
  }

  private authorize(
    id: string,
    action: 'authorize-repair' | 'authorize-replacement'
  ): Observable<ProviderDecisionResult> {
    return this.http
      .post<ApiResponse<ProviderDecisionResult>>(`${this.baseUrl}/cases/${id}/${action}`, {})
      .pipe(map((response) => response.data ?? { authorized: false }));
  }
}
