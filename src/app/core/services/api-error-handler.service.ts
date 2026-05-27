import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NormalizedApiError } from '../errors/api-error.model';

@Injectable({ providedIn: 'root' })
export class ApiErrorHandlerService {
  normalize(error: unknown): NormalizedApiError {
    if (error instanceof HttpErrorResponse) {
      const body = error.error ?? {};
      const errors = Array.isArray(body.errors)
        ? body.errors.map((item: { message?: string }) => item.message ?? 'Error de validacion')
        : [];

      return {
        message: body.message ?? 'No se pudo procesar la solicitud.',
        status: error.status,
        traceId: body.traceId ?? null,
        errors
      };
    }

    return {
      message: 'Ocurrio un error inesperado.',
      errors: []
    };
  }
}
