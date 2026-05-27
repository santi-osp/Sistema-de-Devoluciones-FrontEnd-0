import { Component, input } from '@angular/core';

@Component({
  selector: 'app-status-badge',
  template: `<span class="badge" [class.badge--ok]="tone() === 'ok'" [class.badge--warn]="tone() === 'warn'" [class.badge--danger]="tone() === 'danger'">{{ label() }}</span>`,
  styles: [
    `.badge{display:inline-flex;align-items:center;gap:6px;border:1px solid #e2e8f0;border-radius:999px;padding:5px 11px;background:#f1f5f9;color:#334155;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:.08em}
     .badge::before{content:"";width:7px;height:7px;border-radius:999px;background:currentColor}
     .badge--ok{border-color:#bbf7d0;background:#dcfce7;color:#166534}.badge--warn{border-color:#fde68a;background:#fef3c7;color:#92400e}.badge--danger{border-color:#fecaca;background:#fee2e2;color:#991b1b}`
  ]
})
export class StatusBadge {
  readonly label = input('Estado');
  readonly tone = input<'neutral' | 'ok' | 'warn' | 'danger'>('neutral');
}
