import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

@Component({
  selector: 'gm-videocall-security',
  imports: [],
  templateUrl: './videocall-security.html',
  styleUrl: './videocall-security.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'gm-videocall-security-host' },
})
export class VideocallSecurity {
  items = signal([
    { id: 'encryption', title: 'Cifrado de extremo a extremo' },
    { id: 'consent', title: 'Consentimiento y registro' },
    { id: 'audit', title: 'Auditoría y logs de sesión' },
  ]);
}
