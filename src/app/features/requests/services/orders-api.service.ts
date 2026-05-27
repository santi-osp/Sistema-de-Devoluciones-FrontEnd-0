import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_BASE_URL } from '../../../core/config/api.config';
import { ApiResponse } from '../../../models/api-response.model';
import { EligibilityResult } from '../../../models/eligibility-result.model';
import { Pedido } from '../../../models/pedido.model';
import { Producto } from '../../../models/producto.model';
import { TipoSolicitud } from '../../../models/solicitud.model';

@Injectable({ providedIn: 'root' })
export class OrdersApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/orders`;

  getOrders(): Observable<Pedido[]> {
    return this.http
      .get<ApiResponse<Pedido[]>>(this.baseUrl)
      .pipe(map((response) => response.data ?? []));
  }

  getOrderById(orderId: string): Observable<Pedido | null> {
    return this.http
      .get<ApiResponse<Pedido>>(`${this.baseUrl}/${orderId}`)
      .pipe(map((response) => response.data));
  }

  getOrderProducts(orderId: string): Observable<Producto[]> {
    return this.http
      .get<ApiResponse<Producto[]>>(`${this.baseUrl}/${orderId}/products`)
      .pipe(map((response) => response.data ?? []));
  }

  getProductEligibility(
    orderId: string,
    productId: string,
    type: TipoSolicitud
  ): Observable<EligibilityResult> {
    return this.http
      .get<ApiResponse<EligibilityResult>>(`${API_BASE_URL}/products/${productId}/eligibility`, {
        params: {
          orderId,
          type
        }
      })
      .pipe(
        map((response) => {
          if (!response.data) {
            return { isEligible: false, reason: response.message ?? 'No se pudo validar elegibilidad.' };
          }

          return response.data;
        })
      );
  }
}
