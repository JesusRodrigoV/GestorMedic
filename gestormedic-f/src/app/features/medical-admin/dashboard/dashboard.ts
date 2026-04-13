import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { RoundedButton } from '@shared/ui/rounded-button/rounded-button';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ButtonModule, TagModule, CardModule, ChartModule, RoundedButton],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DashboardComponent {
  stats = [
    { label: 'Citas Hoy', value: '12', icon: 'pi-calendar', color: 'blue' },
    { label: 'Nuevos Pacientes', value: '4', icon: 'pi-user-plus', color: 'green' },
    { label: 'Ingresos Mensuales', value: '$4,250', icon: 'pi-money-bill', color: 'purple' },
    { label: 'Pendientes', value: '3', icon: 'pi-clock', color: 'orange' }
  ];

  chartData = {
    labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
    datasets: [
      {
        label: 'Citas atendidas',
        data: [10, 15, 8, 12, 20, 5],
        fill: true,
        borderColor: '#4a90e2',
        tension: 0.4,
        backgroundColor: 'rgba(74, 144, 226, 0.1)'
      }
    ]
  };

  chartOptions = {
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, grid: { color: '#f1f5f9' } }, x: { grid: { display: false } } }
  };

  upcomingAppointments = [
    {
      id: 1,
      patientName: 'Elena García',
      patientPhoto: '/profile/1.webp',
      type: 'Consulta General',
      time: '09:00 AM',
      status: 'Confirmado',
      statusSeverity: 'success' as const
    },
    {
      id: 2,
      patientName: 'Marco Antonio',
      patientPhoto: '/profile/2.webp',
      type: 'Seguimiento',
      time: '10:30 AM',
      status: 'Pendiente',
      statusSeverity: 'warn' as const
    },
    {
      id: 3,
      patientName: 'Sofía López',
      patientPhoto: '/profile/3.webp',
      type: 'Urgencia',
      time: '11:15 AM',
      status: 'En Espera',
      statusSeverity: 'danger' as const
    }
  ];

  recentActivity = [
    { text: 'Nueva historia clínica creada para Juan Perez', time: 'Hace 5 min', icon: 'pi-file-edit' },
    { text: 'Pago recibido: Factura #1024', time: 'Hace 25 min', icon: 'pi-check-circle' },
    { text: 'Cita cancelada: Roberto Gomez', time: 'Hace 1 hora', icon: 'pi-times-circle' }
  ];
}
