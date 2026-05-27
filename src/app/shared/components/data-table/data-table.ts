import { Component, input } from '@angular/core';

@Component({
  selector: 'app-data-table',
  template: `<div class="table-shell"><ng-content /></div>`,
  styles: [
    `.table-shell{overflow:auto;border:1px solid #e2e8f0;border-radius:8px;background:#fff;box-shadow:0 16px 40px rgba(15,23,42,.06)}
     :host ::ng-deep table{width:100%;border-collapse:collapse}
     :host ::ng-deep th{background:#f8fafc;color:#475569;text-transform:uppercase;font-size:.72rem;letter-spacing:.05em;text-align:left}
     :host ::ng-deep th,:host ::ng-deep td{padding:.9rem 1rem;border-bottom:1px solid #eef2f7}
     :host ::ng-deep td{color:#334155}`
  ]
})
export class DataTable {
  readonly dense = input(false);
}
