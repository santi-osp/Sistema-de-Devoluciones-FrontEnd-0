import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { RoleNames } from '../config/roles.config';
import { NotificationService } from '../services/notification.service';
import { SessionService } from '../services/session.service';

export const roleGuard: CanActivateFn = (route) => {
  const session = inject(SessionService);
  const router = inject(Router);
  const notifications = inject(NotificationService);
  const allowedRoles = (route.data['roles'] as string[] | undefined) ?? [];

  if (allowedRoles.length === 0 || session.hasRole(allowedRoles)) {
    return true;
  }

  notifications.show('No tienes permisos para acceder a esta seccion.', 'error');

  const roles = session.currentUser()?.roles ?? [];
  if (roles.includes(RoleNames.Proveedor)) {
    return router.createUrlTree(['/proveedor/casos']);
  }

  if (roles.includes(RoleNames.Administrador) || roles.includes(RoleNames.Analista)) {
    return router.createUrlTree(['/admin/dashboard']);
  }

  return router.createUrlTree(['/cliente/pedidos']);
};
