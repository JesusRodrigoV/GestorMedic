import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ButtonModule, ButtonSeverity } from 'primeng/button';

@Component({
  selector: 'gm-rounded-button',
  imports: [ButtonModule],
  templateUrl: './rounded-button.html',
  styleUrl: './rounded-button.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoundedButton {
  label = input<string>('');
  icon = input<string>('');
  severity = input<ButtonSeverity | null>(null);
  loading = input<boolean>(false);
  disabled = input<boolean>(false);
  rounded = input<boolean>(true);
  outlined = input<boolean>(false);
  text = input<boolean>(false);
  size = input<'small' | 'large' | undefined>(undefined);
  variant = input<'outlined' | 'text' | undefined>(undefined);
  styleClass = input<string>('');
  type = input<'button' | 'submit' | 'reset'>('button');

  onClick = output<MouseEvent>();
}
