import { ChangeDetectionStrategy, Component, ElementRef, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

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
    'https://img.freepik.com/vector-gratis/diseno-logotipo-hospital-vector-cruz-medica_53876-136743.jpg?semt=ais_hybrid&w=740&q=80',
    'https://marketplace.canva.com/EAGiYwibFuE/1/0/1600w/canva-logotipo-salud-medicina-moderno-azul-8WzudOO4y7w.jpg',
    'https://static.vecteezy.com/system/resources/previews/007/955/420/non_2x/digital-health-medical-technology-logo-design-free-vector.jpg',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTjix9TDJ0f4lLjqg3LsNIlXb5T-eO1Z6TZIg&s',
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
    {
      text: 'Directorio médico por ciudad, especialidad y seguro',
      img: 'https://images.unsplash.com/photo-1588776814546-1d4f9f7f4c6b?w=800&q=60&auto=format&fit=crop'
    },
    {
      text: 'Agenda en línea con disponibilidad en tiempo real',
      img: 'https://images.unsplash.com/photo-1586281380396-4bb0d7f661b6?w=800&q=60&auto=format&fit=crop'
    },
    {
      text: 'Videoconsulta con sala segura y comprobante de atención',
      img: 'https://images.unsplash.com/photo-1587502536263-3f8e3b9a0b5a?w=800&q=60&auto=format&fit=crop'
    },
    {
      text: 'Recetas digitales y seguimiento de tratamiento',
      img: 'https://images.unsplash.com/photo-1580281657528-6b0a0b9b0f6a?w=800&q=60&auto=format&fit=crop'
    },
    {
      text: 'Panel de paciente con historial y próximos pasos',
      img: 'https://images.unsplash.com/photo-1550831107-1553da8c8464?w=800&q=60&auto=format&fit=crop'
    },
    {
      text: 'Notificaciones para estudios, controles y renovaciones',
      img: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=60&auto=format&fit=crop'
    },
  ]);

  readonly testimonials = signal([
    {
      name: 'Ana P., madre de paciente pediátrico',
      quote:
        'Antes tardaba días en coordinar una cita. Ahora en minutos encuentro pediatra y tengo todo el historial ordenado.',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
    },
    {
      name: 'Dr. Mauricio R., cardiología',
      quote:
        'La plataforma reduce ausencias y mejora el seguimiento. Tengo contexto del paciente antes de cada consulta.',
      avatar: 'https://randomuser.me/api/portraits/men/56.jpg'
    },
    {
      name: 'Clínica aliada en Cochabamba',
      quote:
        'Integrar agenda, videollamada y documentación en un solo flujo nos ahorra tiempo administrativo cada semana.',
      avatar: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400&q=60&auto=format&fit=crop'
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
    setTimeout(() => {
      this.runHeroAnimation();
      this.runScrollAnimations();
    }, 0);
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

  private runScrollAnimations(): void {
    try {
      gsap.registerPlugin(ScrollTrigger);

      // Features cards
      gsap.from('.feature-card', {
        y: 40,
        opacity: 0,
        stagger: 0.12,
        duration: 0.7,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.feature-grid',
          start: 'top 85%',
        },
      });

      // Onboarding steps
      gsap.from('.onboarding .steps-grid article', {
        x: -30,
        opacity: 0,
        stagger: 0.14,
        duration: 0.7,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.onboarding',
          start: 'top 85%',
        },
      });

      // Testimonials
      gsap.from('.testimonials-grid blockquote', {
        y: 30,
        opacity: 0,
        stagger: 0.18,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.testimonials-grid',
          start: 'top 88%',
        },
      });
    } catch (e) {
      // if ScrollTrigger not available, silently ignore
    }
  }
}
