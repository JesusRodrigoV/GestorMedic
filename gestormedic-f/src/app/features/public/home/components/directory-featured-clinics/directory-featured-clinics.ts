import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

@Component({
  selector: 'gm-directory-featured-clinics',
  imports: [],
  templateUrl: './directory-featured-clinics.html',
  styleUrl: './directory-featured-clinics.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'gm-featured-clinics-host' },
})
export class DirectoryFeaturedClinics {
  clinics = signal([
    { id: 'clinica-uno', name: 'Clínica Central', city: 'La Paz', services: 12 },
    { id: 'clinica-dos', name: 'Centro Salud Norte', city: 'Santa Cruz', services: 8 },
    { id: 'clinica-tres', name: 'Instituto Cardiológico', city: 'Cochabamba', services: 6 },
  ]);
}
