import { ChangeDetectionStrategy, Component, ElementRef, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { gsap } from 'gsap';

@Component({
  selector: 'gm-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'gm-home-host',
  },
})
export default class Home implements OnInit {
  private readonly host = inject(ElementRef<HTMLElement>);

  readonly trustLogos = signal([
    'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Logo_del_Ministerio_de_Salud_de_Bolivia.svg/640px-Logo_del_Ministerio_de_Salud_de_Bolivia.svg.png',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/CNS_Bolivia_logo.png/640px-CNS_Bolivia_logo.png',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Cruz_Roja_Boliviana_logo.svg/512px-Cruz_Roja_Boliviana_logo.svg.png',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/Logo_Banco_Interamericano_de_Desarrollo.svg/640px-Logo_Banco_Interamericano_de_Desarrollo.svg.png',
  ]);

  readonly painPoints = signal([
    {
      problem: 'Dificultad para encontrar especialistas confiables por ciudad y cobertura.',
      solution: 'Directorio curado con filtros de especialidad, seguros y disponibilidad real.',
    },
    {
      problem: 'Demasiado tiempo entre la consulta inicial y el seguimiento clínico.',
      solution: 'Videollamadas seguras y recordatorios automatizados para continuidad asistencial.',
    },
    {
      problem: 'Recetas, estudios y documentos dispersos en múltiples canales.',
      solution: 'Historial clínico digital centralizado con acceso para paciente y profesional.',
    },
  ]);

  readonly features = signal([
    'Directorio médico por ciudad, especialidad y seguro',
    'Agenda en línea con disponibilidad en tiempo real',
    'Videoconsulta con sala segura y comprobante de atención',
    'Recetas digitales y seguimiento de tratamiento',
    'Panel de paciente con historial y próximos pasos',
    'Notificaciones para estudios, controles y renovaciones',
  ]);

  readonly testimonials = signal([
    {
      name: 'Ana P., madre de paciente pediátrico',
      quote:
        'Antes tardaba días en coordinar una cita. Ahora en minutos encuentro pediatra y tengo todo el historial ordenado.',
    },
    {
      name: 'Dr. Mauricio R., cardiología',
      quote:
        'La plataforma reduce ausencias y mejora el seguimiento. Tengo contexto del paciente antes de cada consulta.',
    },
    {
      name: 'Clínica aliada en Cochabamba',
      quote:
        'Integrar agenda, videollamada y documentación en un solo flujo nos ahorra tiempo administrativo cada semana.',
    },
  ]);

  readonly pricing = signal([
    {
      title: 'Esencial',
      price: 'Bs 0',
      description: 'Para primeras consultas y exploración del directorio.',
      bullets: ['Búsqueda de especialistas', 'Reserva de citas', 'Recordatorios básicos'],
    },
    {
      title: 'Paciente Plus',
      price: 'Bs 79/mes',
      description: 'Seguimiento clínico frecuente y mejor coordinación familiar.',
      bullets: ['Historial clínico extendido', 'Soporte prioritario', 'Recetas y documentos ilimitados'],
    },
    {
      title: 'Profesional',
      price: 'Bs 249/mes',
      description: 'Para médicos que desean crecer su práctica digital.',
      bullets: ['Perfil destacado', 'Videollamada integrada', 'Agenda avanzada y analítica'],
    },
  ]);

  readonly faqs = signal([
    {
      q: '¿GestorMedic reemplaza la consulta presencial?',
      a: 'No. Complementa la atención para triage, seguimiento y orientación cuando la consulta virtual es adecuada.',
    },
    {
      q: '¿Quién puede acceder al historial clínico?',
      a: 'Solo el paciente y profesionales autorizados mediante flujos de acceso con trazabilidad.',
    },
    {
      q: '¿Cómo funciona para médicos nuevos en la plataforma?',
      a: 'El onboarding solicita verificación profesional, configuración de perfil y activación de agenda en tres pasos.',
    },
    {
      q: '¿Puedo usarlo desde móvil?',
      a: 'Sí. La interfaz está optimizada para desktop y móvil para consultas, reserva y seguimiento.',
    },
  ]);

  ngOnInit(): void {
    setTimeout(() => this.runHeroAnimation(), 0);
  }

  private runHeroAnimation(): void {
    const root = this.host.nativeElement;
    const letters = root.querySelectorAll('.hero-word span');
    const content = root.querySelector('.hero-content');

    if (!letters.length || !content) {
      return;
    }

    gsap.set(letters, { y: 60, opacity: 0, scale: 0.9, filter: 'blur(6px)' });

    const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } });

    timeline.to(content, { opacity: 1, y: 0, duration: 0.7 });
    timeline.to(
      letters,
      {
        y: 0,
        opacity: 1,
        scale: 1,
        filter: 'blur(0px)',
        duration: 0.6,
        stagger: 0.05,
      },
      '-=0.25',
    );
  }
}
