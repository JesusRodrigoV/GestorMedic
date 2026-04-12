import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

@Component({
  selector: 'app-medical-history',
  imports: [],
  templateUrl: './medical-history.html',
  styleUrl: './medical-history.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MedicalHistory {
  readonly episodes = signal([
    {
      date: '03 Abr 2026',
      specialty: 'Cardiologia',
      doctor: 'Dra. Camila Flores',
      diagnosis: 'Control de hipertension y ajuste de tratamiento',
    },
    {
      date: '18 Mar 2026',
      specialty: 'Medicina interna',
      doctor: 'Dr. Daniel Perez',
      diagnosis: 'Evaluacion de fatiga cronica y plan de analitica',
    },
    {
      date: '05 Feb 2026',
      specialty: 'Neumologia',
      doctor: 'Dra. Carla Rojas',
      diagnosis: 'Seguimiento post infeccion respiratoria',
    },
  ]);

  readonly allergies = signal(['Penicilina', 'Polen', 'Mariscos']);
}
