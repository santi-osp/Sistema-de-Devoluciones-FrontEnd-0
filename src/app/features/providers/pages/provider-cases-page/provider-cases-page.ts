import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProviderCase } from '../../../../models/provider-case.model';
import { DataTable } from '../../../../shared/components/data-table/data-table';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { Loading } from '../../../../shared/components/loading/loading';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { StatusBadge } from '../../../../shared/components/status-badge/status-badge';
import { ProvidersApiService } from '../../services/providers-api.service';

@Component({
  selector: 'app-provider-cases-page',
  imports: [DatePipe, PageHeader, DataTable, EmptyState, Loading, RouterLink, StatusBadge],
  template: `
    <section class="feature-page provider-page">
      <app-page-header eyebrow="Proveedor" title="Casos asignados" />

      <section class="provider-summary">
        <div>
          <span>Portal proveedor</span>
          <h2>Evaluacion de garantias</h2>
          <p>Gestiona casos asignados, dictamenes y recepciones desde la API real.</p>
        </div>
        <strong>{{ cases().length }}</strong>
      </section>

      @if (loading()) {
        <app-loading label="Consultando casos asignados" />
      } @else if (error()) {
        <app-empty-state title="No fue posible cargar casos" [description]="error()!" />
      } @else if (cases().length === 0) {
        <app-empty-state
          title="Sin casos asignados"
          description="Los casos activos apareceran aqui cuando operaciones los asigne al proveedor autenticado."
        />
      } @else {
        <app-data-table>
          <table>
            <thead>
              <tr>
                <th>Caso</th>
                <th>Solicitud</th>
                <th>Estado</th>
                <th>Asignado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              @for (item of cases(); track item.id) {
                <tr>
                  <td>
                    <strong>{{ shortId(item.id) }}</strong>
                  </td>
                  <td>{{ shortId(item.requestId) }}</td>
                  <td>
                    <app-status-badge
                      [label]="statusText(item.status)"
                      [tone]="statusTone(item.status)"
                    />
                  </td>
                  <td>{{ item.assignedAt | date: 'short' }}</td>
                  <td>
                    <a class="table-action" [routerLink]="['/proveedor/casos', item.requestId]">
                      Ver caso
                    </a>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </app-data-table>
      }
    </section>
  `,
  styles: [
    `.provider-summary{margin-bottom:1.5rem;border-radius:32px;background:#059669;color:#fff;padding:2rem;display:flex;align-items:center;justify-content:space-between;gap:1.5rem;box-shadow:0 24px 60px rgba(4,120,87,.18)}
     .provider-summary span{display:block;color:rgba(255,255,255,.72);font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:.16em}.provider-summary h2{margin:.45rem 0;color:#fff;font-size:2rem;font-weight:900}.provider-summary p{margin:0;color:rgba(255,255,255,.78);font-weight:800}.provider-summary strong{font-size:3rem;color:#fff}
     .table-action{display:inline-flex;align-items:center;justify-content:center;border-radius:14px;background:#059669;color:#fff;font-weight:900;text-decoration:none;padding:.65rem .9rem;white-space:nowrap;box-shadow:0 12px 28px rgba(4,120,87,.16)}
     strong{color:#0f172a}@media(max-width:760px){.provider-summary{align-items:flex-start;flex-direction:column}}`
  ]
})
export class ProviderCasesPage implements OnInit {
  private readonly providersApi = inject(ProvidersApiService);
  readonly cases = signal<ProviderCase[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.providersApi.getCases().subscribe({
      next: (cases) => this.cases.set(cases),
      error: () => {
        this.error.set('Revisa la sesion o los permisos del rol Proveedor.');
        this.loading.set(false);
      },
      complete: () => this.loading.set(false)
    });
  }

  shortId(id?: string | null): string {
    return id ? id.slice(0, 8) : '-';
  }

  statusText(status: number): string {
    switch (Number(status)) {
      case 2:
        return 'En evaluacion';
      case 3:
        return 'Informacion solicitada';
      case 4:
        return 'Dictaminado';
      case 5:
        return 'Cerrado';
      default:
        return 'Asignado';
    }
  }

  statusTone(status: number): 'neutral' | 'ok' | 'warn' | 'danger' {
    if (Number(status) === 4) {
      return 'ok';
    }
    if (Number(status) === 3) {
      return 'warn';
    }
    if (Number(status) === 5) {
      return 'danger';
    }

    return 'neutral';
  }
}
