import { ChangeDetectionStrategy, Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SplitterModule } from 'primeng/splitter';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { AvatarModule } from 'primeng/avatar';
import { TagModule } from 'primeng/tag';

export interface PatientSummary {
  id: string;
  documentNumber: string;
  firstName: string;
  lastName: string;
  contactPhone: string;
  lastVisitDate: string | null;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface PaginatedResult<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

@Component({
  selector: 'app-patient-list',
  imports: [CommonModule, SplitterModule, TableModule, ButtonModule, IconFieldModule, InputIconModule, InputTextModule, AvatarModule, TagModule],
  templateUrl: './patient-list.html',
  styleUrl: './patient-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PatientList implements OnInit {
  patientsData = signal<PaginatedResult<PatientSummary> | null>(null);
  selectedPatient = signal<PatientSummary | null>(null);

  ngOnInit() {
    this.getPatients();
  }

  getPatients() {
    // Mock Service Response
    const mockData: PatientSummary[] = [
      { id: '1', documentNumber: '12345678', firstName: 'Juan', lastName: 'Pérez', contactPhone: '+591 71234567', lastVisitDate: '2023-10-01', status: 'ACTIVE' },
      { id: '2', documentNumber: '87654321', firstName: 'María', lastName: 'Gómez', contactPhone: '+591 79876543', lastVisitDate: '2023-09-15', status: 'ACTIVE' },
      { id: '3', documentNumber: '45678912', firstName: 'Carlos', lastName: 'López', contactPhone: '+591 71112222', lastVisitDate: '2023-08-20', status: 'INACTIVE' },
      { id: '4', documentNumber: '32165498', firstName: 'Ana', lastName: 'Torres', contactPhone: '+591 73334444', lastVisitDate: null, status: 'ACTIVE' },
      { id: '5', documentNumber: '98712365', firstName: 'Luis', lastName: 'Sánchez', contactPhone: '+591 75556666', lastVisitDate: '2023-10-10', status: 'ACTIVE' }
    ];

    this.patientsData.set({
      content: mockData,
      totalElements: 5,
      totalPages: 1,
      size: 10,
      number: 0
    });
    
    // Select the first one by default if exists
    if (mockData.length > 0) {
      this.selectedPatient.set(mockData[0]);
    }
  }

  onPatientSelect(event: any) {
    this.selectedPatient.set(event.data);
  }

  getSeverity(status: string): "success" | "danger" {
    return status === 'ACTIVE' ? 'success' : 'danger';
  }

  getStatusLabel(status: string): string {
    return status === 'ACTIVE' ? 'Activo' : 'Inactivo';
  }
}
