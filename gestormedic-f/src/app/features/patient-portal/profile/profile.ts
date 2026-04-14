import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

@Component({
  selector: 'app-patient-profile',
  imports: [],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PatientProfile {
  readonly profile = signal({
    fullName: 'Alejandra Quiroga Rojas',
    ci: '7845123 LP',
    email: 'alejandra.q@example.com',
    phone: '+591 71234567',
    emergencyContact: 'Carlos Rojas · +591 70112233',
    bloodType: 'O+',
  });
}
