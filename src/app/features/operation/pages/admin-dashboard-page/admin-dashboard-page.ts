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
    <app-page-header eyebrow="Operacion" title="Dashboard operativo" />

    @if (dashboard()) {
      <section class="metrics">
        <article><span>Abiertas</span><strong>{{ dashboard()?.totalOpen ?? 0 }}</strong></article>
        <article><span>En revision</span><strong>{{ dashboard()?.inReview ?? 0 }}</strong></article>
        <article><span>Pendiente info</span><strong>{{ dashboard()?.pendingInformation ?? 0 }}</strong></article>
        <article><span>Aprobadas</span><strong>{{ dashboard()?.approved ?? 0 }}</strong></article>
        <article><span>Rechazadas</span><strong>{{ dashboard()?.rejected ?? 0 }}</strong></article>
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
  `,
  styles: [
    `.metrics{display:grid;grid-template-columns:repeat(auto-fit,minmax(12rem,1fr));gap:1rem}
     article{border:1px solid #e2e8f0;border-radius:8px;background:#fff;padding:1.25rem;box-shadow:0 12px 34px rgba(15,23,42,.06)}
     span{display:block;color:#64748b;font-weight:800}strong{display:block;margin-top:.5rem;color:#0f172a;font-size:2rem}
     .section-head{display:flex;align-items:center;justify-content:space-between;margin:1.5rem 0 1rem}h2{margin:0;color:#0f172a}a{color:#2563eb;font-weight:900}`
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
