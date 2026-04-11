import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [RouterLink, NgOptimizedImage],
  templateUrl: './register.html',
  styleUrl: './register.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class Register {
  roles = signal([
    {
      id: 'patient',
      title: 'Soy Paciente',
      desc: 'Busque especialistas por ciudad, reserve citas en línea y acceda a sus resultados y recetas médicas.',
      icon: 'bx-user',
      route: '/auth/register/patient',
      tag: 'Acceso Ciudadano',
    },
    {
      id: 'doctor',
      title: 'Soy Médico Independiente',
      desc: 'Gestione su agenda de pacientes, emita recetas digitales y centralice el historial clínico en la nube.',
      icon: 'bx-plus-medical',
      route: '/auth/register/doctor',
      tag: 'Acceso Profesional',
    },
    {
      id: 'clinic',
      title: 'Representante de Clínica',
      desc: 'Registre su centro médico, administre los accesos de su staff y controle la facturación global.',
      icon: 'bx-buildings',
      route: '/auth/register/clinic',
      tag: 'Acceso Institucional',
    },
  ]);
}
