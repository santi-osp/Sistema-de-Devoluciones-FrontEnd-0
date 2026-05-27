import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { ApiErrorHandlerService } from '../services/api-error-handler.service';
import { NotificationService } from '../services/notification.service';
import { SessionService } from '../services/session.service';

export const errorInterceptor: HttpInterceptorFn = (request, next) => {
  const session = inject(SessionService);
  const router = inject(Router);
  const errors = inject(ApiErrorHandlerService);
  const notifications = inject(NotificationService);

  return next(request).pipe(
    catchError((error: unknown) => {
      const normalized = errors.normalize(error);

      if (error instanceof HttpErrorResponse && error.status === 401) {
        session.clearSession();
        router.navigate(['/login']);
      }

      notifications.show(normalized.message, 'error');
      return throwError(() => error);
    })
  );
};
