import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { DataTable } from '../../../../shared/components/data-table/data-table';
import { StatusBadge } from '../../../../shared/components/status-badge/status-badge';
import { OperationDashboard } from '../../../../models/operation-dashboard.model';
import { OperationApiService } from '../../services/operation-api.service';
import { requestTypeLabel, statusLabel } from '../../../../shared/utils/request-labels';

@Component({
  selector: 'app-admin-dashboard-page',
  imports: [PageHeader, EmptyState, DataTable, StatusBadge, RouterLink],
  template: `
    <section class="dashboard-page">
      <app-page-header eyebrow="Operacion" title="Dashboard operativo" />

      @if (dashboard()) {
        <section class="metrics">
          <article><span>Abiertas</span><strong>{{ dashboard()?.totalOpen ?? 0 }}</strong></article>
          <article><span>En revision</span><strong>{{ dashboard()?.inReview ?? 0 }}</strong></article>
          <article><span>Pendiente info</span><strong>{{ dashboard()?.pendingInformation ?? 0 }}</strong></article>
          <article><span>Aprobadas</span><strong>{{ dashboard()?.approved ?? 0 }}</strong></article>
          <article><span>Rechazadas</span><strong>{{ dashboard()?.rejected ?? 0 }}</strong></article>
        </section>

        <section class="ops-hero">
          <div>
            <span>Estado operativo real</span>
            <h2>Gestion de casos activos</h2>
            <p>Monitoreo de solicitudes en curso, aprobadas y pendientes de informacion.</p>
          </div>
          <a routerLink="/admin/solicitudes">Ver bandeja</a>
        </section>

        <div class="section-head">
          <h2>Solicitudes recientes</h2>
          <a routerLink="/admin/solicitudes">Ver bandeja</a>
        </div>

        @if ((dashboard()?.recentRequests ?? []).length === 0) {
          <app-empty-state title="Sin solicitudes recientes" description="La bandeja operativa no tiene movimientos recientes." />
        } @else {
          <app-data-table>
            <table>
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Estado</th>
                  <th>Motivo</th>
                  <th>Creada</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                @for (request of dashboard()?.recentRequests ?? []; track request.id) {
                  <tr>
                    <td>{{ typeLabel(request.type) }}</td>
                    <td><app-status-badge [label]="statusText(request.status)" /></td>
                    <td>{{ request.reason }}</td>
                    <td>{{ request.createdAt }}</td>
                    <td><a [routerLink]="['/admin/solicitudes', request.id]">Revisar</a></td>
                  </tr>
                }
              </tbody>
            </table>
          </app-data-table>
        }
      } @else {
        <app-empty-state title="Dashboard listo" description="El modulo operativo ya apunta a los endpoints reales del backend." />
      }
    </section>
  `,
  styles: [
    `.ops-hero{margin:1.75rem 0;border-radius:32px;background:#1e293b;color:#fff;padding:2rem;display:flex;align-items:center;justify-content:space-between;gap:1.5rem;box-shadow:0 24px 60px rgba(15,23,42,.18);overflow:hidden}
     .ops-hero span{display:inline-flex;margin-bottom:.75rem;border-radius:999px;background:rgba(59,130,246,.18);color:#60a5fa;padding:.35rem .7rem;font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:.12em}
     .ops-hero h2{margin:0;color:#fff;font-size:clamp(1.8rem,3vw,2.5rem);font-weight:900}.ops-hero p{margin:.75rem 0 0;color:#cbd5e1;font-weight:700;line-height:1.5}
     .ops-hero a{display:inline-flex;align-items:center;justify-content:center;border-radius:14px;background:#2563eb;color:#fff;font-weight:900;text-decoration:none;padding:.85rem 1rem;box-shadow:0 14px 32px rgba(37,99,235,.25)}
     .section-head a{color:#2563eb;font-weight:900}@media(max-width:760px){.ops-hero{align-items:flex-start;flex-direction:column}}`
  ]
})
export class AdminDashboardPage implements OnInit {
  private readonly operationApi = inject(OperationApiService);

  readonly dashboard = signal<OperationDashboard | null>(null);

  ngOnInit(): void {
    this.operationApi.getDashboard().subscribe({
      next: (dashboard) => this.dashboard.set(dashboard),
      error: () => this.dashboard.set(null)
    });
  }

  typeLabel = requestTypeLabel;
  statusText = statusLabel;
}
