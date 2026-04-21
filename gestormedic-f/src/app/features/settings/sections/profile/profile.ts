import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AuthStore } from '@features/auth/stores/auth.store';
import { UserRole } from '@core/models/role.model';
import { AdminProfile } from './components/admin-profile';
import { DoctorProfile } from './components/doctor-profile';
import { PatientProfile } from './components/patient-profile';
import { SuperadminProfile } from './components/superadmin-profile';

@Component({
  selector: 'gm-profile',
  imports: [PatientProfile, DoctorProfile, AdminProfile, SuperadminProfile],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class Profile  {
  protected authStore = inject(AuthStore);

  protected user = this.authStore.currentUser;
protected readonly UserRole = UserRole;
}
