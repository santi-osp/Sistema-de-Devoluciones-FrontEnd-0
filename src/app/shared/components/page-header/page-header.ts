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
    `.page-header{margin:4px 0 28px}p{margin:0 0 .45rem;color:#2563eb;text-transform:uppercase;letter-spacing:.16em;font-size:10px;font-weight:900}
     h1{margin:0;color:#0f172a;font-size:clamp(1.9rem,3vw,2.35rem);font-weight:900;line-height:1.08;letter-spacing:0}`
  ]
})
export class PageHeader {
  readonly eyebrow = input('Gestion');
  readonly title = input('Panel');
}
