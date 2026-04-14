import { ChangeDetectionStrategy, Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { TimelineModule } from 'primeng/timeline';
import { BadgeModule } from 'primeng/badge';

export interface DashboardMetrics {
  totalActivePatients: number;
  appointmentsToday: number;
  pendingResults: number;
  appointmentsTrend: { date: string; count: number }[];
}

export interface UpcomingAppointment {
  appointmentId: string;
  patientId: string;
  patientFullName: string;
  scheduledTime: string;
  status: 'SCHEDULED' | 'ARRIVED' | 'IN_PROGRESS' | 'COMPLETED';
}

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, CardModule, TimelineModule, BadgeModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class Dashboard implements OnInit {
  metrics = signal<DashboardMetrics | null>(null);
  upcomingAppointments = signal<UpcomingAppointment[]>([]);

  ngOnInit() {
    this.getDashboardMetrics();
  }

  getDashboardMetrics() {
    // Mock Service Response
    const mockMetrics: DashboardMetrics = {
      totalActivePatients: 1250,
      appointmentsToday: 14,
      pendingResults: 8,
      appointmentsTrend: [
        { date: 'Lun', count: 12 },
        { date: 'Mar', count: 19 },
        { date: 'Mie', count: 15 },
        { date: 'Jue', count: 22 },
        { date: 'Vie', count: 14 },
        { date: 'Sab', count: 8 },
        { date: 'Dom', count: 0 },
      ]
    };
    
    this.metrics.set(mockMetrics);

    const mockAppointments: UpcomingAppointment[] = [
      { appointmentId: '1', patientId: 'p1', patientFullName: 'Juan Pérez', scheduledTime: '09:00', status: 'COMPLETED' },
      { appointmentId: '2', patientId: 'p2', patientFullName: 'María Gómez', scheduledTime: '10:30', status: 'IN_PROGRESS' },
      { appointmentId: '3', patientId: 'p3', patientFullName: 'Carlos López', scheduledTime: '11:15', status: 'ARRIVED' },
      { appointmentId: '4', patientId: 'p4', patientFullName: 'Ana Torres', scheduledTime: '14:00', status: 'SCHEDULED' },
      { appointmentId: '5', patientId: 'p5', patientFullName: 'Luis Sánchez', scheduledTime: '15:30', status: 'SCHEDULED' }
    ];
    this.upcomingAppointments.set(mockAppointments);
  }

  getSeverity(status: string): "success" | "info" | "warn" | "danger" | "secondary" | "contrast" {
    switch (status) {
      case 'COMPLETED': return 'success';
      case 'IN_PROGRESS': return 'info';
      case 'ARRIVED': return 'warn';
      case 'SCHEDULED': return 'secondary';
      default: return 'info';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'COMPLETED': return 'Completada';
      case 'IN_PROGRESS': return 'En Progreso';
      case 'ARRIVED': return 'Llegó';
      case 'SCHEDULED': return 'Programada';
      default: return 'Desconocido';
    }
  }
}
