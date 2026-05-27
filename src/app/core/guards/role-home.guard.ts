import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { RoleNames } from '../config/roles.config';
import { SessionService } from '../services/session.service';

export const roleHomeGuard: CanActivateFn = () => {
  const session = inject(SessionService);
  const router = inject(Router);
  const roles = session.currentUser()?.roles ?? [];

  if (roles.includes(RoleNames.Proveedor)) {
    return router.createUrlTree(['/proveedor/casos']);
  }

  if (roles.includes(RoleNames.Administrador) || roles.includes(RoleNames.Analista)) {
    return router.createUrlTree(['/admin/dashboard']);
  }

  return router.createUrlTree(['/cliente/pedidos']);
};
