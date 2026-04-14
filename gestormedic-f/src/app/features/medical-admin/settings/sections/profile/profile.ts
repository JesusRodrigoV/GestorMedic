import { ChangeDetectionStrategy, Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

export interface DoctorProfile {
  id: string;
  firstName: string;
  lastName: string;
  medicalLicenseNumber: string;
  contactEmail: string;
}

@Component({
  selector: 'gm-profile',
  imports: [CommonModule, InputTextModule, ButtonModule, FormsModule, ToastModule],
  providers: [MessageService],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class Profile implements OnInit {
  doctorProfile = signal<DoctorProfile>({
    id: '', firstName: '', lastName: '', medicalLicenseNumber: '', contactEmail: ''
  });

  constructor(private messageService: MessageService) {}

  ngOnInit() {
    this.getProfile();
  }

  getProfile() {
    // Mock Data Fetch
    this.doctorProfile.set({
      id: 'doc-123',
      firstName: 'Natalia',
      lastName: 'Jallaza',
      medicalLicenseNumber: 'CM-90812',
      contactEmail: 'natalia@gestormedic.com'
    });
  }

  saveProfile() {
    console.log('Profile saved:', this.doctorProfile());
    this.messageService.add({severity:'success', summary: 'Éxito', detail: 'Perfil actualizado correctamente'});
  }
}
