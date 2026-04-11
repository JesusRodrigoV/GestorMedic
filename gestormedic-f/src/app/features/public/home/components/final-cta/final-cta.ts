import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RoundedButton } from '@shared/ui/rounded-button';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'gm-final-cta',
  imports: [RoundedButton, RouterLink],
  templateUrl: './final-cta.html',
  styleUrl: './final-cta.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FinalCta {

}
