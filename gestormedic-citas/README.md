# GestorMedic Citas (Microservicio)

Microservicio de citas para GestorMedic.

## Funcionalidades

- Agenda semanal de medicos por bloques con validacion de solapamientos.
- Calendario de slots por medico con overrides por slot.
- Reserva de citas para pacientes.
- Gestion de permisos de consultorios por administrador de clinica.
- Consulta de citas por dia para medicos.

## Variables de entorno

- `DATABASE_URL`: URL async de PostgreSQL (ej: `postgresql+asyncpg://postgres:admin@gm-backend-db:5432/gestormedic_db`)
- `SECRET_KEY`: clave JWT compartida con backend principal
- `ALGORITHM`: algoritmo JWT (default `HS256`)
- `API_V1_STR`: prefijo API (default `/api/v1`)
- `CORS_ORIGINS`: origenes separados por coma (ej: `http://localhost:4200`)

## Endpoints principales

- Publico: `/api/v1/public/doctors`, `/api/v1/public/doctors/{doctor_id}/availability`
- Paciente: `/api/v1/patient/appointments/my`, `/api/v1/patient/appointments/reserve`
- Medico: `/api/v1/doctor/agenda/weekly`, `/api/v1/doctor/agenda/calendar`, `/api/v1/doctor/agenda/slots/{slot_start_iso}`
- Admin clinica: `/api/v1/admin/rooms`, `/api/v1/admin/rooms/{room_id}/permissions/*`

## Nota

Este servicio asume la misma base de datos del sistema actual y reutiliza tablas existentes (`users`, `roles`, `doctor_profiles`, `rooms`, `specialties`, etc.), creando solo las tablas propias de citas.
