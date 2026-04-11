import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

type PageConfig = {
  badge: string;
  title: string;
  subtitle: string;
  sections: Array<{ heading: string; points: string[] }>;
};

const PAGE_CONTENT: Record<string, PageConfig> = {
  especialidades: {
    badge: 'Especialidades',
    title: 'Encuentra el especialista adecuado para tu caso',
    subtitle:
      'Navega por categorias medicas y selecciona profesionales segun experiencia, ciudad y modalidad de atencion.',
    sections: [
      {
        heading: 'Categorias mas consultadas',
        points: ['Cardiologia', 'Pediatria', 'Ginecologia', 'Dermatologia'],
      },
      {
        heading: 'Filtros disponibles',
        points: ['Por ciudad', 'Por seguro', 'Por modalidad presencial o virtual'],
      },
      {
        heading: 'Apoyo a decision',
        points: ['Perfil profesional', 'Experiencia documentada', 'Disponibilidad de agenda'],
      },
    ],
  },
  directorio: {
    badge: 'Directorio',
    title: 'Directorio medico nacional con disponibilidad real',
    subtitle:
      'Conecta con medicos verificados y agenda atencion con trazabilidad desde el primer contacto.',
    sections: [
      {
        heading: 'Busqueda inteligente',
        points: ['Especialidad', 'Ubicacion', 'Cobertura y arancel'],
      },
      {
        heading: 'Datos clave del perfil',
        points: ['Institucion asociada', 'Anios de experiencia', 'Idiomas y modalidad'],
      },
      {
        heading: 'Acciones rapidas',
        points: ['Reservar cita', 'Guardar profesional', 'Comparar opciones'],
      },
    ],
  },
  videollamada: {
    badge: 'Videollamada',
    title: 'Consulta virtual segura y orientada a continuidad clinica',
    subtitle:
      'Accede a sala medica, comparte antecedentes y deja trazabilidad de indicaciones al finalizar.',
    sections: [
      {
        heading: 'Antes de iniciar',
        points: ['Confirmacion de identidad', 'Prueba de audio y video', 'Carga de estudios previos'],
      },
      {
        heading: 'Durante la consulta',
        points: ['Canal cifrado', 'Notas clinicas en tiempo real', 'Resumen de decisiones'],
      },
      {
        heading: 'Despues de la consulta',
        points: ['Receta digital', 'Ordenes de estudio', 'Recordatorios de seguimiento'],
      },
    ],
  },
  recetas: {
    badge: 'Recetas',
    title: 'Recetas digitales y control de tratamiento',
    subtitle:
      'Gestiona renovaciones, dosis y duracion del tratamiento en una vista clara para paciente y medico.',
    sections: [
      {
        heading: 'Receta digital',
        points: ['Indicaciones legibles', 'Firma profesional', 'Fecha de vigencia'],
      },
      {
        heading: 'Seguimiento',
        points: ['Alertas de toma', 'Registro de adherencia', 'Historial por episodio'],
      },
      {
        heading: 'Renovacion simplificada',
        points: ['Solicitud en un clic', 'Revision medica', 'Notificacion de aprobacion'],
      },
    ],
  },
  nosotros: {
    badge: 'Nosotros',
    title: 'Tecnologia clinica creada para el contexto boliviano',
    subtitle:
      'GestorMedic integra pacientes, profesionales e instituciones con foco en claridad operativa y continuidad asistencial.',
    sections: [
      {
        heading: 'Mision',
        points: ['Reducir friccion en acceso a salud', 'Acelerar decision clinica', 'Mejorar seguimiento'],
      },
      {
        heading: 'Principios',
        points: ['Seguridad por defecto', 'Experiencia simple', 'Evidencia y trazabilidad'],
      },
      {
        heading: 'Impacto',
        points: ['Mas consultas efectivas', 'Menos perdida documental', 'Mejor coordinacion asistencial'],
      },
    ],
  },
  acceso: {
    badge: 'Acceso',
    title: 'Ingresa o crea tu cuenta segun tu rol',
    subtitle:
      'Selecciona flujo para paciente, profesional o institucion y activa tus herramientas digitales en minutos.',
    sections: [
      {
        heading: 'Paciente',
        points: ['Agenda consulta', 'Conserva historial', 'Recibe recetas y recordatorios'],
      },
      {
        heading: 'Profesional',
        points: ['Publica perfil', 'Gestiona agenda', 'Atiende por videollamada'],
      },
      {
        heading: 'Institucion',
        points: ['Coordina equipos', 'Estandariza flujos', 'Mide continuidad de atencion'],
      },
    ],
  },
};

@Component({
  selector: 'gm-sections-page',
  imports: [RouterLink],
  templateUrl: './sections-page.html',
  styleUrl: './sections-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SectionsPage {
  private readonly route = inject(ActivatedRoute);

  readonly config = computed(() => {
    const key = this.route.snapshot.data['page'] as string;
    return PAGE_CONTENT[key] ?? PAGE_CONTENT['especialidades'];
  });
}
