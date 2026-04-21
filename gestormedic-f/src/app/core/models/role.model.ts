export enum UserRole {
  SUPERADMIN = 1,
  ADMIN_CLINICA = 2,
  MEDICO = 3,
  RECEPCIONISTA = 4,
  PACIENTE = 5,
  ASEGURADORA = 6,
  VISITANTE = 7,
}

export const ROLE_DICTIONARY: Record<number, string> = {
  [UserRole.SUPERADMIN]: 'Super Administrador',
  [UserRole.ADMIN_CLINICA]: 'Director de Clínica',
  [UserRole.MEDICO]: 'Médico Especialista',
  [UserRole.RECEPCIONISTA]: 'Recepción',
  [UserRole.PACIENTE]: 'Paciente',
  [UserRole.ASEGURADORA]: 'Aseguradora',
  [UserRole.VISITANTE]: 'Visitante',
};
