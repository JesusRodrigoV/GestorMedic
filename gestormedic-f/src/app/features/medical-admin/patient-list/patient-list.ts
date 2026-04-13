import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { AvatarModule } from 'primeng/avatar';
import { TooltipModule } from 'primeng/tooltip';
import { RoundedButton } from '@shared/ui/rounded-button/rounded-button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { MenuModule } from 'primeng/menu';

@Component({
  selector: 'app-patient-list',
  standalone: true,
  imports: [
    CommonModule, 
    TableModule, 
    ButtonModule, 
    InputTextModule, 
    TagModule, 
    AvatarModule, 
    TooltipModule,
    RoundedButton,
    IconFieldModule,
    InputIconModule,
    MenuModule
  ],
  templateUrl: './patient-list.html',
  styleUrl: './patient-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PatientList {
  searchTerm = signal('');

  patients = [
    {
      id: 1,
      name: 'Elena García',
      email: 'elena@example.com',
      photo: '/profile/1.webp',
      dni: '12345678A',
      phone: '+52 555 123 4567',
      lastVisit: '2024-03-20',
      status: 'Activo',
      statusSeverity: 'success' as const
    },
    {
      id: 2,
      name: 'Marco Antonio',
      email: 'marco@example.com',
      photo: '/profile/2.webp',
      dni: '87654321B',
      phone: '+52 555 987 6543',
      lastVisit: '2024-03-15',
      status: 'En Tratamiento',
      statusSeverity: 'info' as const
    },
    {
      id: 3,
      name: 'Sofía López',
      email: 'sofia@example.com',
      photo: '/profile/3.webp',
      dni: '45678901C',
      phone: '+52 555 456 7890',
      lastVisit: '2024-03-10',
      status: 'Inactivo',
      statusSeverity: 'secondary' as const
    },
    {
      id: 4,
      name: 'Ricardo Pérez',
      email: 'ricardo@example.com',
      photo: '/profile/4.webp',
      dni: '11223344D',
      phone: '+52 555 222 3333',
      lastVisit: '2024-03-05',
      status: 'Urgente',
      statusSeverity: 'danger' as const
    }
  ];

  onSearch(event: any) {
    this.searchTerm.set(event.target.value);
  }

  get filteredPatients() {
    return this.patients.filter(p => 
      p.name.toLowerCase().includes(this.searchTerm().toLowerCase()) ||
      p.dni.toLowerCase().includes(this.searchTerm().toLowerCase())
    );
  }
}
