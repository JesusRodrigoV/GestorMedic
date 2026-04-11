import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NotificationService } from '@core/services/notification';
import { RoundedButton } from '@shared/ui/rounded-button';
import { MultiSelect } from 'primeng/multiselect';

@Component({
  selector: 'gm-hero',
  imports: [RoundedButton, MultiSelect, FormsModule],
  templateUrl: './hero.html',
  styleUrl: './hero.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'gm-hero-host',
  },
})
export class Hero {
  private notificationService = inject(NotificationService);
  router = inject(Router);

  specialties = signal([
    { name: 'Cardiología' },
    { name: 'Dermatología' },
    { name: 'Ginecología' },
    { name: 'Pediatría' },
    { name: 'Psiquiatría' },
    { name: 'Traumatología' },
  ]);

  selectedSpecialties = signal<any[]>([]);

  onSearch(): void {
    const selected = this.selectedSpecialties();
    const queryParams: Record<string, string> = {};

    if (selected && selected.length > 0) {
      queryParams['specialty'] = selected.map((s) => s.name.toLowerCase()).join(',');
    }

    this.router.navigate(['/search'], { queryParams });
  }

  onStartTrial(): void {
    this.notificationService
      .builder()
      .success()
      .summary('Proceso Iniciado')
      .detail('Preparando el entorno seguro para su nueva cuenta.')
      .show();
  }
}
