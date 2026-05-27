import { Component, input } from '@angular/core';

@Component({
  selector: 'app-loading',
  template: `<div class="loading"><span></span>{{ label() }}</div>`,
  styles: [
    `.loading{display:inline-flex;align-items:center;gap:.7rem;border:1px solid #dbeafe;border-radius:18px;background:#eff6ff;color:#1d4ed8;font-weight:900;padding:.85rem 1rem}
     span{width:1.05rem;height:1.05rem;border:2px solid #bfdbfe;border-top-color:#2563eb;border-radius:999px;animation:spin .8s linear infinite}
     @keyframes spin{to{transform:rotate(360deg)}}`
  ]
})
export class Loading {
  readonly label = input('Cargando');
}
