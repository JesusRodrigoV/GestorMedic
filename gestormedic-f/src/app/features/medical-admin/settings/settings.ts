import { ChangeDetectionStrategy, Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AccordionModule } from 'primeng/accordion';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

export interface SettingsOption {
  label: string;
  icon: string;
  route: string;
}

export interface DoctorProfile {
  id: string;
  firstName: string;
  lastName: string;
  specialtyId: string;
  medicalLicenseNumber: string;
  contactEmail: string;
}

export interface ClinicSettings {
  tenantId: string;
  clinicName: string;
  supportEmail: string;
  bookingRemindersEnabled: boolean;
  timeZone: string;
}

@Component({
  selector: 'gm-settings',
  imports: [CommonModule, RouterModule, AccordionModule, InputTextModule, ButtonModule, FormsModule, ToastModule],
  providers: [MessageService],
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class Settings implements OnInit {
  menuOptions = signal<SettingsOption[]>([
    {
      label: 'Perfil Profesional',
      icon: 'bx bx-user-circle',
      route: 'profile',
    },
    {
      label: 'Notificaciones',
      icon: 'bx bx-bell',
      route: 'notifications',
    },
    {
      label: 'Apariencia',
      icon: 'bx bx-palette',
      route: 'appearance',
    },
  ]);

  doctorProfile = signal<DoctorProfile>({
    id: '', firstName: '', lastName: '', specialtyId: '', medicalLicenseNumber: '', contactEmail: ''
  });

  clinicSettings = signal<ClinicSettings>({
    tenantId: '', clinicName: '', supportEmail: '', bookingRemindersEnabled: false, timeZone: ''
  });

  timeZoneOptions = [
    { label: 'America/La_Paz', value: 'America/La_Paz' },
    { label: 'America/Argentina/Buenos_Aires', value: 'America/Argentina/Buenos_Aires' },
    { label: 'America/Bogota', value: 'America/Bogota' },
  ];

  specialtyOptions = [
    { label: 'Medicina General', value: 'med_gen' },
    { label: 'Pediatría', value: 'pediatria' },
    { label: 'Cardiología', value: 'cardiologia' },
  ];

  constructor(private messageService: MessageService) {}

  ngOnInit() {
    this.getSettings();
  }

  getSettings() {
    // Mock Data Fetch
    this.doctorProfile.set({
      id: 'doc-123',
      firstName: 'Natalia',
      lastName: 'Jallaza',
      specialtyId: 'med_gen',
      medicalLicenseNumber: 'CM-90812',
      contactEmail: 'natalia@gestormedic.com'
    });

    this.clinicSettings.set({
      tenantId: 'clinic-456',
      clinicName: 'Clínica Salud Integral',
      supportEmail: 'soporte@saludintegral.com',
      bookingRemindersEnabled: true,
      timeZone: 'America/La_Paz'
    });
  }

  saveProfile() {
    console.log('Profile saved:', this.doctorProfile());
    this.messageService.add({severity:'success', summary: 'Éxito', detail: 'Perfil actualizado correctamente'});
  }

  saveClinicSettings() {
    console.log('Clinic settings saved:', this.clinicSettings());
    this.messageService.add({severity:'success', summary: 'Éxito', detail: 'Ajustes de clínica guardados'});
  }

  savePreferences() {
    this.messageService.add({severity:'success', summary: 'Éxito', detail: 'Preferencias guardadas'});
  }
}
