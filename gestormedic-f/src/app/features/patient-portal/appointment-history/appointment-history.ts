import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-appointment-history',
  imports: [RouterLink],
  templateUrl: './appointment-history.html',
  styleUrl: './appointment-history.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AppointmentHistory {
  readonly nextAppointments = signal([
    {
      date: '14 Abr 2026 - 10:30',
      doctor: 'Dra. Camila Flores',
      type: 'Cardiologia',
      mode: 'Videollamada',
      status: 'Confirmada',
    },
    {
      date: '20 Abr 2026 - 17:00',
      doctor: 'Dr. Daniel Perez',
      type: 'Medicina interna',
      mode: 'Presencial',
      status: 'Pendiente de pago',
    },
  ]);

  readonly history = signal([
    {
      date: '04 Abr 2026 - 09:00',
      doctor: 'Dr. Alberto Vargas',
      type: 'Traumatologia',
      result: 'Alta con fisioterapia',
    },
    {
      date: '18 Mar 2026 - 16:30',
      doctor: 'Dra. Carla Rojas',
      type: 'Neumologia',
      result: 'Control en 6 semanas',
    },
  ]);

  readonly records = signal([
    'Resumen clinico de ultima consulta',
    'Resultado de laboratorio - perfil lipidico',
    'Indicaciones de seguimiento en casa',
  ]);

  readonly actionCards = signal([
    {
      title: 'Reservar nueva cita',
      detail: 'Selecciona medico, especialidad y horario disponible.',
    },
    {
      title: 'Unirme por videollamada',
      detail: 'Accede a tu consulta virtual desde la web o movil.',
    },
    {
      title: 'Programar recordatorios',
      detail: 'Recibe alertas por WhatsApp, SMS o email.',
    },
  ]);
}
