import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { Loading } from '../../../../shared/components/loading/loading';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { DataTable } from '../../../../shared/components/data-table/data-table';
import { EligibilityResult } from '../../../../models/eligibility-result.model';
import { Producto } from '../../../../models/producto.model';
import { TipoSolicitud } from '../../../../models/solicitud.model';
import { requestTypeLabel } from '../../../../shared/utils/request-labels';
import { OrdersApiService } from '../../services/orders-api.service';

@Component({
  selector: 'app-order-products-page',
  imports: [PageHeader, DataTable, EmptyState, Loading],
  template: `
    <app-page-header eyebrow="Cliente" title="Productos del pedido" />

    @if (loading()) {
      <app-loading label="Consultando productos" />
    } @else if (products().length === 0) {
      <app-empty-state title="Sin productos" description="Este pedido no tiene productos disponibles para solicitud." />
    } @else {
      <app-data-table>
        <table>
          <thead>
            <tr>
              <th>Producto</th>
              <th>SKU</th>
              <th>Cantidad</th>
              <th>Garantia hasta</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            @for (product of products(); track product.id) {
              <tr>
                <td>{{ product.name }}</td>
                <td>{{ product.sku }}</td>
                <td>{{ product.quantity }}</td>
                <td>{{ product.warrantyUntil }}</td>
                <td class="actions">
                  <button type="button" (click)="check(product, tipoSolicitud.Devolucion)">Validar devolucion</button>
                  <button type="button" (click)="check(product, tipoSolicitud.Garantia)">Validar garantia</button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </app-data-table>
    }

    @if (eligibility()) {
      <section class="eligibility" [class.eligibility--ok]="eligibility()?.isEligible === true">
        <strong>{{ typeLabel(selectedType()) }}</strong>
        <p>{{ eligibility()?.reason }}</p>
        @if (eligibility()?.isEligible === true && selectedProduct()) {
          <button type="button" (click)="startRequest()">Iniciar solicitud</button>
        }
      </section>
    }
  `,
  styles: [
    `.actions{display:flex;gap:.5rem;flex-wrap:wrap}
     button{border:0;border-radius:8px;background:#0f172a;color:#fff;font-weight:900;padding:.55rem .8rem;cursor:pointer}
     .actions button:first-child{background:#2563eb}
     .eligibility{margin-top:1rem;border:1px solid #fecaca;background:#fef2f2;color:#991b1b;border-radius:8px;padding:1rem}
     .eligibility--ok{border-color:#bbf7d0;background:#f0fdf4;color:#166534}.eligibility p{margin:.4rem 0 .8rem}`
  ]
})
export class OrderProductsPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly ordersApi = inject(OrdersApiService);

  readonly tipoSolicitud = TipoSolicitud;
  readonly loading = signal(true);
  readonly products = signal<Producto[]>([]);
  readonly eligibility = signal<EligibilityResult | null>(null);
  readonly selectedProduct = signal<Producto | null>(null);
  readonly selectedType = signal<TipoSolicitud>(TipoSolicitud.Devolucion);
  readonly orderId = this.route.snapshot.paramMap.get('orderId') ?? '';
  readonly typeLabel = requestTypeLabel;

  ngOnInit(): void {
    this.ordersApi.getOrderProducts(this.orderId).subscribe({
      next: (products) => this.products.set(products),
      error: () => this.loading.set(false),
      complete: () => this.loading.set(false)
    });
  }

  check(product: Producto, type: TipoSolicitud): void {
    this.selectedProduct.set(product);
    this.selectedType.set(type);
    this.eligibility.set(null);
    this.ordersApi.getProductEligibility(this.orderId, product.id, type).subscribe((result) => {
      this.eligibility.set(result);
    });
  }

  startRequest(): void {
    const product = this.selectedProduct();
    if (!product) {
      return;
    }

    this.router.navigate(['/cliente/solicitudes/nueva'], {
      queryParams: {
        orderId: this.orderId,
        productId: product.id,
        type: this.selectedType()
      }
    });
  }
}
