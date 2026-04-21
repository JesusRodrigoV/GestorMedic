import { ChangeDetectionStrategy, Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { TimelineModule } from 'primeng/timeline';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { AppointmentsService } from '@core/services/appointments';

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
  status: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink, CardModule, TimelineModule, BadgeModule, ButtonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class Dashboard implements OnInit {
  private appointmentsService = inject(AppointmentsService);

  metrics = signal<DashboardMetrics | null>(null);
  upcomingAppointments = signal<UpcomingAppointment[]>([]);

  ngOnInit() {
    this.getDashboardMetrics();
    this.loadTodayAppointments();
  }

  loadTodayAppointments() {
    const today = new Date().toISOString().slice(0, 10);
    this.appointmentsService.getDoctorAppointmentsByDay(today).subscribe({
      next: (appointments) => {
        const mapped = appointments.map(a => ({
          appointmentId: a.id.toString(),
          patientId: a.patient_user_id.toString(),
          patientFullName: a.patient_name,
          scheduledTime: new Date(a.starts_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: a.status
        }));
        this.upcomingAppointments.set(mapped);
        
        // Update metrics based on real data if possible
        const currentMetrics = this.metrics();
        if (currentMetrics) {
          this.metrics.set({
            ...currentMetrics,
            appointmentsToday: mapped.length
          });
        }
      }
    });
  }

  getDashboardMetrics() {
    // Mock Service Response for other metrics
    const mockMetrics: DashboardMetrics = {
      totalActivePatients: 1250,
      appointmentsToday: 0,
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
  }

  getSeverity(status: string): "success" | "info" | "warn" | "danger" | "secondary" | "contrast" {
    switch (status) {
      case 'COMPLETED': return 'success';
      case 'CONFIRMED': return 'info';
      case 'PENDING': return 'warn';
      case 'CANCELLED': return 'danger';
      default: return 'info';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'COMPLETED': return 'Completada';
      case 'CONFIRMED': return 'Confirmada';
      case 'PENDING': return 'Pendiente';
      case 'CANCELLED': return 'Cancelada';
      default: return status;
    }
  }
}
