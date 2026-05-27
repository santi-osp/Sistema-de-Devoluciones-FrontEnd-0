import { Component, input } from '@angular/core';

@Component({
  selector: 'app-status-badge',
  template: `<span class="badge" [class.badge--ok]="tone() === 'ok'" [class.badge--warn]="tone() === 'warn'" [class.badge--danger]="tone() === 'danger'">{{ label() }}</span>`,
  styles: [
    `.badge{display:inline-flex;align-items:center;border-radius:999px;padding:.25rem .65rem;background:#e2e8f0;color:#334155;font-size:.78rem;font-weight:800}
     .badge--ok{background:#dcfce7;color:#166534}.badge--warn{background:#fef3c7;color:#92400e}.badge--danger{background:#fee2e2;color:#991b1b}`
  ]
})
export class StatusBadge {
  readonly label = input('Estado');
  readonly tone = input<'neutral' | 'ok' | 'warn' | 'danger'>('neutral');
}
