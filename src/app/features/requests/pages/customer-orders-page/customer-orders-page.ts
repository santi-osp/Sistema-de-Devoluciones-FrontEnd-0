import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { DataTable } from '../../../../shared/components/data-table/data-table';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { Loading } from '../../../../shared/components/loading/loading';
import { Pedido } from '../../../../models/pedido.model';
import { OrdersApiService } from '../../services/orders-api.service';

@Component({
  selector: 'app-customer-orders-page',
  imports: [PageHeader, DataTable, EmptyState, Loading, RouterLink],
  template: `
    <app-page-header eyebrow="Cliente" title="Mis pedidos" />

    @if (loading()) {
      <app-loading label="Consultando pedidos" />
    } @else if (orders().length === 0) {
      <app-empty-state title="Sin pedidos disponibles" description="Los pedidos vendran desde la API cuando existan datos para el cliente." />
    } @else {
      <app-data-table>
        <table>
          <thead>
            <tr>
              <th>Pedido</th>
              <th>Total</th>
              <th>Fecha</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            @for (order of orders(); track order.id) {
              <tr>
                <td>{{ order.number }}</td>
                <td>{{ order.totalAmount }} {{ order.currency }}</td>
                <td>{{ order.purchaseDate }}</td>
                <td><a [routerLink]="['/cliente/pedidos', order.id, 'productos']">Ver productos</a></td>
              </tr>
            }
          </tbody>
        </table>
      </app-data-table>
    }
  `
})
export class CustomerOrdersPage implements OnInit {
  private readonly ordersApi = inject(OrdersApiService);

  readonly loading = signal(true);
  readonly orders = signal<Pedido[]>([]);

  ngOnInit(): void {
    this.ordersApi.getOrders().subscribe({
      next: (orders) => this.orders.set(orders),
      error: () => this.loading.set(false),
      complete: () => this.loading.set(false)
    });
  }
}
