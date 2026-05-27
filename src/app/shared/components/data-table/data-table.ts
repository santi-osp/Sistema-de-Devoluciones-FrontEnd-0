import { Component, input } from '@angular/core';

@Component({
  selector: 'app-data-table',
  template: `<div class="app-table-shell"><ng-content /></div>`,
  styles: [
    `:host{display:block}
     :host ::ng-deep a{color:#2563eb;font-weight:900;text-decoration:none}
     :host ::ng-deep a:hover{text-decoration:underline}`
  ]
})
export class DataTable {
  readonly dense = input(false);
}
