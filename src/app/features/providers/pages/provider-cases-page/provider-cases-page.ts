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
    <app-page-header eyebrow="Proveedor" title="Casos asignados" />

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
  `,
  styles: [
    `.table-action{display:inline-flex;align-items:center;justify-content:center;border-radius:8px;background:#0f172a;color:#fff;font-weight:900;text-decoration:none;padding:.55rem .8rem;white-space:nowrap}
     strong{color:#0f172a}`
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
