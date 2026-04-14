import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'gm-specialty-domains',
  imports: [CommonModule],
  templateUrl: './specialty-domains.html',
  styleUrl: './specialty-domains.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'gm-specialty-host',
  },
})
export class SpecialtyDomains {
  domains = signal([
    {
      id: 'pediatria',
      title: 'Pediatría',
      subtitle: 'Gestión de Tutores',
      microcopy: 'Trazabilidad administrativa integral',
      description:
        'Vinculación automática de fichas clínicas con tutores legales, asegurando la integridad documental del menor.',
      icon: 'bx-id-card',
    },
    {
      id: 'ginecologia',
      title: 'Ginecología',
      subtitle: 'Reserva de Salas',
      microcopy: 'Optimización de recursos diagnósticos',
      description:
        'Gestión inteligente de salas de imagen y equipos especializados vinculados directamente a la cita de la paciente.',
      icon: 'bx-scan',
    },
    {
      id: 'cirugia',
      title: 'Cirugía General',
      subtitle: 'Integración Financiera',
      microcopy: 'Automatización de alta complejidad',
      description:
        'Coordinación de tarifarios con aseguradoras y liquidación automatizada de procedimientos quirúrgicos complejos.',
      icon: 'bx-wallet-alt',
    },
    {
      id: 'consulta',
      title: 'Consulta Externa',
      subtitle: 'Buscador y Agenda',
      microcopy: 'Ecosistema de agendamiento masivo',
      description:
        'Motor de búsqueda público para pacientes con sincronización en tiempo real de la disponibilidad del galeno.',
      icon: 'bx-search-alt',
    },
  ]);

  activeFilter = signal('destacadas');

  areas = signal([
    { id: 'materno', title: 'Materno-Infantil', count: 6, icon: 'bx-heart' },
    { id: 'quirurgicas', title: 'Quirúrgicas', count: 8, icon: 'bx-bandage' },
    { id: 'diagnostico', title: 'Diagnóstico e Imagen', count: 4, icon: 'bx-scan' },
    { id: 'atencion', title: 'Atención Primaria', count: 10, icon: 'bx-user' },
  ]);

  services = signal([
    { id: 'telemedicina', title: 'Telemedicina', description: 'Conexión remota segura entre paciente y especialista', icon: 'bx-wifi' },
    { id: 'integracion', title: 'Integración con aseguradoras', description: 'Flujos automáticos de facturación y autorización', icon: 'bx-wallet' },
    { id: 'agenda', title: 'Agenda inteligente', description: 'Sincronización y búsquedas avanzadas por disponibilidad', icon: 'bx-calendar' },
  ]);
}
