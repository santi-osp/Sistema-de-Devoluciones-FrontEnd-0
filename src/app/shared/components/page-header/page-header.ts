import { Component, input } from '@angular/core';

@Component({
  selector: 'app-page-header',
  template: `
    <header class="page-header">
      <p>{{ eyebrow() }}</p>
      <h1>{{ title() }}</h1>
    </header>
  `,
  styles: [
    `.page-header{margin-bottom:1.5rem}p{margin:0 0 .35rem;color:#2563eb;text-transform:uppercase;letter-spacing:.08em;font-size:.72rem;font-weight:900}
     h1{margin:0;color:#0f172a;font-size:clamp(1.45rem,2.2vw,2rem);line-height:1.15}`
  ]
})
export class PageHeader {
  readonly eyebrow = input('Gestion');
  readonly title = input('Panel');
}
