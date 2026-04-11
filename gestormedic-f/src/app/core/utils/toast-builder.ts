import { NotificationSeverity, NotificationState } from '@core/models/notification.model';
import { MessageService } from 'primeng/api';

export class ToastBuilder {
  private state: NotificationState = {
    severity: 'info',
    summary: 'Notificación',
    detail: '',
    life: 3000,
    sticky: false,
  };

  constructor(private messageService: MessageService) {}

  severity(severity: NotificationSeverity): ToastBuilder {
    this.state.severity = severity;
    return this;
  }

  success(): ToastBuilder {
    this.state.severity = 'success';
    this.state.summary = 'Operación Exitosa';
    return this;
  }

  error(): ToastBuilder {
    this.state.severity = 'error';
    this.state.summary = 'Error de Sistema';
    this.state.life = 5000;
    return this;
  }

  warn(): ToastBuilder {
    this.state.severity = 'warn';
    this.state.summary = 'Advertencia';
    this.state.life = 4000;
    return this;
  }

  info(detail?: string): ToastBuilder {
    this.state.severity = 'info';
    this.state.summary = 'Información';
    if (detail) this.state.detail = detail;
    return this;
  }

  summary(text: string): ToastBuilder {
    this.state.summary = text;
    return this;
  }

  detail(text: string): ToastBuilder {
    this.state.detail = text;
    return this;
  }

  life(ms: number): ToastBuilder {
    this.state.life = ms;
    return this;
  }

  sticky(isSticky: boolean = true): ToastBuilder {
    this.state.sticky = isSticky;
    return this;
  }

  key(key: string): ToastBuilder {
    this.state.key = key;
    return this;
  }

  show(): void {
    this.messageService.add({
      severity: this.state.severity,
      summary: this.state.summary,
      detail: this.state.detail,
      life: this.state.life,
      sticky: this.state.sticky,
      key: this.state.key,
    });
  }
}
