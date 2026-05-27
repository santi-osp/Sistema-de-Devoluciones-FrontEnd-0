import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthApiService } from '../../core/services/auth-api.service';
import { RoleNames } from '../../core/config/roles.config';
import { SessionService } from '../../core/services/session.service';

interface NavItem {
  label: string;
  route: string;
  mark: string;
}

@Component({
  selector: 'app-private-layout',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="shell">
      <aside class="sidebar" [class.sidebar--closed]="sidebarClosed()">
        <div class="brand">
          <div class="brand__mark">GP</div>
          @if (!sidebarClosed()) {
            <div>
              <strong>GarantiaPro</strong>
              <span>{{ portalLabel() }}</span>
            </div>
          }
        </div>

        <div class="user-card" [class.user-card--compact]="sidebarClosed()">
          <div class="avatar">{{ initials() }}</div>
          @if (!sidebarClosed()) {
            <div>
              <strong>{{ user()?.name }}</strong>
              <span>{{ primaryRole() }}</span>
            </div>
          }
        </div>

        <nav>
          @for (item of navItems(); track item.route) {
            <a [routerLink]="item.route" routerLinkActive="active" [title]="item.label">
              <span>{{ item.mark }}</span>
              @if (!sidebarClosed()) {
                <strong>{{ item.label }}</strong>
              }
            </a>
          }
        </nav>

        <button class="logout" type="button" (click)="logout()" [title]="'Cerrar sesion'">
          <span>×</span>
          @if (!sidebarClosed()) {
            <strong>Cerrar sesion</strong>
          }
        </button>
      </aside>

      <section class="workspace">
        <header class="topbar">
          <button type="button" class="icon-button" (click)="sidebarClosed.set(!sidebarClosed())">☰</button>
          <div>
            <span>Gestion de devoluciones y garantias</span>
            <strong>{{ portalLabel() }}</strong>
          </div>
        </header>
        <main>
          <router-outlet />
        </main>
      </section>
    </div>
  `,
  styleUrl: './private-layout.scss'
})
export class PrivateLayout {
  private readonly session = inject(SessionService);
  private readonly auth = inject(AuthApiService);
  private readonly router = inject(Router);

  readonly sidebarClosed = signal(false);
  readonly user = this.session.currentUser;
  readonly primaryRole = computed(() => this.user()?.roles?.[0] ?? 'Usuario');
  readonly initials = computed(() =>
    (this.user()?.name ?? 'Usuario')
      .split(' ')
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase()
  );
  readonly portalLabel = computed(() => {
    const role = this.primaryRole();
    if (role === RoleNames.Proveedor) {
      return 'Portal Proveedor';
    }
    if (role === RoleNames.Administrador || role === RoleNames.Analista) {
      return 'Panel Operativo';
    }
    return 'Portal Cliente';
  });
  readonly navItems = computed<NavItem[]>(() => {
    const roles = this.user()?.roles ?? [];
    if (roles.includes(RoleNames.Proveedor)) {
      return [{ label: 'Casos asignados', route: '/proveedor/casos', mark: 'P' }];
    }
    if (roles.includes(RoleNames.Administrador) || roles.includes(RoleNames.Analista)) {
      return [
        { label: 'Dashboard', route: '/admin/dashboard', mark: 'D' },
        { label: 'Solicitudes', route: '/admin/solicitudes', mark: 'S' },
        { label: 'Reportes', route: '/reportes', mark: 'R' }
      ];
    }
    return [
      { label: 'Pedidos', route: '/cliente/pedidos', mark: 'O' },
      { label: 'Solicitudes', route: '/cliente/solicitudes', mark: 'S' }
    ];
  });

  logout(): void {
    this.auth.logout().subscribe({
      next: () => this.finishLogout(),
      error: () => this.finishLogout()
    });
  }

  private finishLogout(): void {
    this.session.clearSession();
    this.router.navigate(['/login']);
  }
}
