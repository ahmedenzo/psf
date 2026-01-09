import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class AlertComponent {
  @Input() type: 'success' | 'warning' | 'error' = 'success';
  @Input() message = '';

  get alertClass() {
    return {
      'alert-success': this.type === 'success',
      'alert-warning': this.type === 'warning',
      'alert-error': this.type === 'error'
    };
  }
}