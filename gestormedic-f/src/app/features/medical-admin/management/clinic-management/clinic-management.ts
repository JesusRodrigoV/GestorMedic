import { ChangeDetectionStrategy, Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG Modules
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { AvatarModule } from 'primeng/avatar';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { InputNumberModule } from 'primeng/inputnumber';
import { TooltipModule } from 'primeng/tooltip';

// Models (Existing in project)
import { Clinic } from '@core/models/clinic.model';
import { DoctorProfile } from '@core/models/doctor-profile.model';
import { User } from '@core/models/auth.model';
import { Specialty } from '@core/models/specialty.model';
import { UserRole } from '@core/models/role.model';

interface Room {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
}

@Component({
  selector: 'gm-clinic-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    TagModule,
    AvatarModule,
    ToggleSwitchModule,
    InputNumberModule,
    TooltipModule
  ],
  templateUrl: './clinic-management.html',
  styleUrl: './clinic-management.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ClinicManagement implements OnInit {
  // Signals for Data
  clinic = signal<Clinic | null>(null);
  rooms = signal<Room[]>([]);
  specialties = signal<Specialty[]>([]);
  doctors = signal<(DoctorProfile & { user: User })[]>([]);
  users = signal<User[]>([]);

  ngOnInit() {
    this.loadMockData();
  }

  private loadMockData() {
    // Clinic Identity
    this.clinic.set({
      id: 1,
      name: 'Centro Médico San José',
      nit_ruc: '1029384756',
      address: 'Av. Las Américas #450, Santa Cruz',
      phone: '+591 33445566',
      logo_url: 'https://placehold.co/200x200?text=Logo',
      plan: 'PREMIUM',
      is_active: true,
      created_at: '2024-01-15T08:00:00Z'
    });

    // Infrastructure (Rooms)
    this.rooms.set([
      { id: 1, name: 'Consultorio A1', description: 'Pediatría y Neonatología', is_active: true },
      { id: 2, name: 'Consultorio A2', description: 'Medicina General', is_active: true },
      { id: 3, name: 'Sala de Rayos X', description: 'Equipamiento nivel 2', is_active: false }
    ]);

    // Specialties
    this.specialties.set([
      { id: 1, name: 'Cardiología', description: 'Especialistas en salud cardiovascular' },
      { id: 2, name: 'Pediatría', description: 'Atención integral infantil' },
      { id: 3, name: 'Neurología', description: 'Tratamientos sistema nervioso' }
    ]);

    // Doctors (Profile + User Name)
    this.doctors.set([
      {
        id: 1,
        user_id: 10,
        license_number: 'COL-MED-9988',
        bio: 'Especialista en medicina interna con más de 15 años de trayectoria en el sector público y privado.',
        experience_years: 15,
        base_consultation_price: 150.00,
        is_telemedicine_enabled: true,
        signature_url: '',
        clinics: [1],
        specialties: [],
        user: {
          id: 10,
          first_name: 'Ricardo',
          last_name: 'Samaniego',
          email: 'ricardo.s@clinic.com',
          username: 'rsamaniego',
          is_active: true,
          is_admin: false,
          role_id: UserRole.MEDICO,
          created_at: '',
          is_totp_enabled: false
        }
      }
    ]);

    // Admin Users
    this.users.set([
      {
        id: 1,
        first_name: 'Natalia',
        last_name: 'Jallaza',
        email: 'admin@gestormedic.com',
        username: 'njallaza',
        is_active: true,
        is_admin: true,
        role_id: UserRole.ADMIN_CLINICA,
        status: 'COMPLETED',
        created_at: '2024-01-01'
      } as User
    ]);
  }

  getRoleSeverity(role: UserRole | string | undefined): "success" | "secondary" | "info" | "warn" | "danger" | "contrast" | undefined {
    switch (role) {
      case UserRole.ADMIN_CLINICA:
      case 'ADMIN': return 'danger';
      case UserRole.MEDICO:
      case 'DOCTOR': return 'info';
      case UserRole.RECEPCIONISTA:
      case 'STAFF': return 'success';
      default: return 'secondary';
    }
  }

  getRoleLabel(role: UserRole | string | undefined): string {
    switch (role) {
      case UserRole.ADMIN_CLINICA: return 'Administrador';
      case UserRole.MEDICO: return 'Médico';
      case UserRole.RECEPCIONISTA: return 'Personal';
      default: return String(role || 'Usuario');
    }
  }

  getStatusSeverity(status: string): "success" | "secondary" | "info" | "warn" | "danger" | "contrast" | undefined {
    switch (status) {
      case 'COMPLETED': return 'success';
      case 'PENDING': return 'warn';
      default: return 'secondary';
    }
  }
}
