import { Component, input } from '@angular/core';

@Component({
  selector: 'app-loading',
  template: `<div class="loading"><span></span>{{ label() }}</div>`,
  styles: [
    `.loading{display:inline-flex;align-items:center;gap:.6rem;color:#475569;font-weight:700}
     span{width:1rem;height:1rem;border:2px solid #bfdbfe;border-top-color:#2563eb;border-radius:999px;animation:spin .8s linear infinite}
     @keyframes spin{to{transform:rotate(360deg)}}`
  ]
})
export class Loading {
  readonly label = input('Cargando');
}
