import { DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EstadoAsignacionProveedor, ProviderCase } from '../../../../models/provider-case.model';
import { DataTable } from '../../../../shared/components/data-table/data-table';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { Loading } from '../../../../shared/components/loading/loading';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { StatusBadge } from '../../../../shared/components/status-badge/status-badge';
import { providerAssignmentStatusValue } from '../../../../shared/utils/request-labels';
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
        <section class="filters">
          <div class="filter-group">
            <button type="button" (click)="setStatus(null)" [class.active]="selectedStatus() === null">Todos</button>
            <button type="button" (click)="setStatus(estados.Asignado)" [class.active]="selectedStatus() === estados.Asignado">Asignados</button>
            <button type="button" (click)="setStatus(estados.EnEvaluacion)" [class.active]="selectedStatus() === estados.EnEvaluacion">En evaluacion</button>
            <button type="button" (click)="setStatus(estados.Dictaminado)" [class.active]="selectedStatus() === estados.Dictaminado">Dictaminados</button>
          </div>
          <label class="search">
            Buscar
            <input #searchInput type="search" placeholder="Caso o solicitud" (input)="setSearch($event)" />
          </label>
          <button type="button" class="ghost" (click)="clearFilters(searchInput)">Limpiar</button>
        </section>

        @if (filteredCases().length === 0) {
          <app-empty-state title="Sin coincidencias" description="No hay casos que coincidan con los filtros seleccionados." />
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
            @for (item of filteredCases(); track item.id) {
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
      }
    </section>
  `,
  styles: [
    `.provider-summary{margin-bottom:1.5rem;border-radius:32px;background:#059669;color:#fff;padding:2rem;display:flex;align-items:center;justify-content:space-between;gap:1.5rem;box-shadow:0 24px 60px rgba(4,120,87,.18)}
     .provider-summary span{display:block;color:rgba(255,255,255,.72);font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:.16em}.provider-summary h2{margin:.45rem 0;color:#fff;font-size:2rem;font-weight:900}.provider-summary p{margin:0;color:rgba(255,255,255,.78);font-weight:800}.provider-summary strong{font-size:3rem;color:#fff}
     .filters{display:flex;gap:.8rem;flex-wrap:wrap;align-items:end;margin-bottom:1.25rem;border:1px solid #e2e8f0;border-radius:24px;background:#fff;padding:1rem;box-shadow:0 10px 28px rgba(15,23,42,.06)}
     .filter-group{display:flex;gap:.65rem;flex-wrap:wrap}.search{min-width:min(18rem,100%);flex:1}
     label{display:grid;gap:.35rem;color:#334155;font-size:.78rem;font-weight:900;text-transform:uppercase;letter-spacing:.08em}
     input{min-height:2.55rem;border:1px solid #cbd5e1;border-radius:14px;background:#f8fafc;color:#0f172a;padding:.65rem .8rem;font-weight:800}
     .filters button{min-height:2.55rem;border:1px solid #cbd5e1;border-radius:14px;background:#fff;color:#334155;font-weight:900;padding:.65rem 1rem;cursor:pointer}
     .filters button.active,.filters button:hover{background:#059669;border-color:#059669;color:#fff}.ghost{background:#f8fafc}
     .table-action{display:inline-flex;align-items:center;justify-content:center;border-radius:14px;background:#059669;color:#fff;font-weight:900;text-decoration:none;padding:.65rem .9rem;white-space:nowrap;box-shadow:0 12px 28px rgba(4,120,87,.16)}
     strong{color:#0f172a}@media(max-width:760px){.provider-summary{align-items:flex-start;flex-direction:column}}`
  ]
})
export class ProviderCasesPage implements OnInit {
  private readonly providersApi = inject(ProvidersApiService);
  readonly estados = EstadoAsignacionProveedor;
  readonly cases = signal<ProviderCase[]>([]);
  readonly selectedStatus = signal<EstadoAsignacionProveedor | null>(null);
  readonly searchTerm = signal('');
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly filteredCases = computed(() => {
    const status = this.selectedStatus();
    const search = this.searchTerm().trim().toLowerCase();

    return this.cases().filter((item) => {
      const matchesStatus =
        status === null || providerAssignmentStatusValue(item.status) === providerAssignmentStatusValue(status);
      const text = `${item.id} ${item.requestId}`.toLowerCase();
      return matchesStatus && (!search || text.includes(search));
    });
  });

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
    switch (providerAssignmentStatusValue(status)) {
      case EstadoAsignacionProveedor.EnEvaluacion:
        return 'En evaluacion';
      case EstadoAsignacionProveedor.InformacionSolicitada:
        return 'Informacion solicitada';
      case EstadoAsignacionProveedor.Dictaminado:
        return 'Dictaminado';
      case EstadoAsignacionProveedor.Cerrado:
        return 'Cerrado';
      default:
        return 'Asignado';
    }
  }

  statusTone(status: number): 'neutral' | 'ok' | 'warn' | 'danger' {
    const value = providerAssignmentStatusValue(status);
    if (value === EstadoAsignacionProveedor.Dictaminado) {
      return 'ok';
    }
    if (value === EstadoAsignacionProveedor.InformacionSolicitada) {
      return 'warn';
    }
    if (value === EstadoAsignacionProveedor.Cerrado) {
      return 'danger';
    }

    return 'neutral';
  }

  setStatus(status: EstadoAsignacionProveedor | null): void {
    this.selectedStatus.set(status);
  }

  setSearch(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  clearFilters(searchInput: HTMLInputElement): void {
    this.selectedStatus.set(null);
    this.searchTerm.set('');
    searchInput.value = '';
  }
}
