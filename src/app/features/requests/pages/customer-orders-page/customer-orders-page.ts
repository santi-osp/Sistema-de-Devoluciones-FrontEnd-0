import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { Loading } from '../../../../shared/components/loading/loading';
import { Pedido } from '../../../../models/pedido.model';
import { OrdersApiService } from '../../services/orders-api.service';

@Component({
  selector: 'app-customer-orders-page',
  imports: [PageHeader, EmptyState, Loading, RouterLink],
  template: `
    <section class="feature-page">
      <div class="page-row">
        <app-page-header eyebrow="Cliente" title="Mis pedidos" />
        <div class="count-pill">
          <span></span>
          {{ orders().length }} pedido(s)
        </div>
      </div>

      @if (loading()) {
        <app-loading label="Consultando pedidos" />
      } @else if (orders().length === 0) {
        <app-empty-state title="Sin pedidos disponibles" description="Los pedidos vendran desde la API cuando existan datos para el cliente." />
      } @else {
        <div class="order-list">
          @for (order of orders(); track order.id) {
            <a class="app-card order-card" [routerLink]="['/cliente/pedidos', order.id, 'productos']">
              <div class="app-card__body order-card__body">
                <div class="order-card__main">
                  <div class="app-card__icon">O</div>
                  <div>
                    <h2>{{ order.number }}</h2>
                    <p>{{ order.purchaseDate }}</p>
                  </div>
                </div>
                <div class="order-card__meta">
                  <strong>{{ order.totalAmount }} {{ order.currency }}</strong>
                  <span>Ver productos</span>
                </div>
              </div>
            </a>
          }
        </div>
      }
    </section>
  `,
  styles: [
    `.page-row{display:flex;align-items:flex-start;justify-content:space-between;gap:1rem}
     .count-pill{display:inline-flex;align-items:center;gap:.65rem;border:1px solid #bfdbfe;border-radius:18px;background:#eff6ff;color:#1d4ed8;padding:.75rem 1rem;font-size:12px;font-weight:900;text-transform:uppercase;letter-spacing:.08em;box-shadow:0 10px 24px rgba(37,99,235,.08)}
     .count-pill span{width:9px;height:9px;border-radius:999px;background:#3b82f6}
     .order-list{display:grid;gap:1.25rem}.order-card{display:block;color:inherit;text-decoration:none}
     .order-card__body{display:flex;align-items:center;justify-content:space-between;gap:1.5rem}.order-card__main{display:flex;align-items:center;gap:1.25rem}
     h2{margin:0;color:#0f172a;font-size:1.45rem;font-weight:900}p{margin:.35rem 0 0;color:#64748b;font-weight:800}
     .order-card__meta{text-align:right}.order-card__meta strong{display:block;color:#0f172a;font-size:1.05rem;font-weight:900}.order-card__meta span{display:inline-flex;margin-top:.5rem;color:#2563eb;font-size:12px;font-weight:900;text-transform:uppercase}
     @media(max-width:760px){.page-row,.order-card__body{align-items:flex-start;flex-direction:column}.order-card__meta{text-align:left}}`
  ]
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
