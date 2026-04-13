import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'gm-access-cards',
  standalone: true,
  imports: [],
  templateUrl: './access-cards.html',
  styleUrl: './access-cards.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'gm-access-cards-host' },
})
export class AccessCards {}
