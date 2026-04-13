import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

@Component({
  selector: 'gm-about-team',
  standalone: true,
  imports: [],
  templateUrl: './about-team.html',
  styleUrl: './about-team.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'gm-about-team-host' },
})
export class AboutTeam {
  team = signal([
    { id: 't1', name: 'Dra. Ana Fernández', role: 'Directora Médica' },
    { id: 't2', name: 'Dr. Luis Romero', role: 'CTO' },
    { id: 't3', name: 'María Quispe', role: 'COO' },
    { id: 't4', name: 'Dr. Carlos Mendoza', role: 'Líder de Desarrollo' },
    { id: 't5', name: 'Sofía Mamani', role: 'Product Manager' },
  ]);
}
