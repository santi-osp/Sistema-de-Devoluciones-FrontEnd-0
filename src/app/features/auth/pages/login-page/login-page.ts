import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthApiService } from '../../../../core/services/auth-api.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { SessionService } from '../../../../core/services/session.service';
import { RoleNames } from '../../../../core/config/roles.config';

@Component({
  selector: 'app-login-page',
  imports: [ReactiveFormsModule],
  templateUrl: './login-page.html',
  styleUrl: './login-page.scss'
})
export class LoginPage {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthApiService);
  private readonly session = inject(SessionService);
  private readonly router = inject(Router);
  private readonly notifications = inject(NotificationService);

  readonly loading = signal(false);
  readonly showPassword = signal(false);
  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.notifications.show('Ingresa correo y contrasena.', 'error');
      return;
    }

    this.loading.set(true);
    this.auth.login(this.form.getRawValue()).subscribe({
      next: (response) => {
        this.session.saveSession({
          accessToken: response.accessToken,
          expiresAt: response.expiresAt,
          user: {
            userId: response.userId,
            name: response.name,
            email: response.email,
            roles: response.roles
          }
        });
        this.router.navigate([this.routeFor(response.roles)]);
      },
      error: () => this.loading.set(false),
      complete: () => this.loading.set(false)
    });
  }

  private routeFor(roles: string[]): string {
    if (roles.includes(RoleNames.Proveedor)) {
      return '/proveedor/casos';
    }
    if (roles.includes(RoleNames.Administrador) || roles.includes(RoleNames.Analista)) {
      return '/admin/dashboard';
    }
    return '/cliente/pedidos';
  }
}
