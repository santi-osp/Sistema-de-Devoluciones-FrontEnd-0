import { Injectable, inject } from '@angular/core';
import { AuthApiService } from '../../../core/services/auth-api.service';

@Injectable({ providedIn: 'root' })
export class AuthFacade {
  readonly api = inject(AuthApiService);
}
