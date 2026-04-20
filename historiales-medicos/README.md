# Historiales Medicos (Microservicio)

Microservicio para gestionar historiales clinicos y archivos medicos.

## Stack
- FastAPI
- MongoDB Atlas (documentos de historiales, entradas y metadatos de archivos)
- Appwrite Storage (archivos binarios)
- PostgreSQL (lectura de usuarios/roles/doctores/citas para autorizacion y contexto)

## Variables de entorno
- `DATABASE_URL`: URL PostgreSQL async (lectura de tablas existentes)
- `MONGODB_URI`: URI de MongoDB Atlas
- `MONGODB_DB_NAME`: nombre de base Mongo (ej. `Gestormedic-Historiales`)
- `SECRET_KEY`: clave JWT compartida
- `ALGORITHM`: algoritmo JWT (default `HS256`)
- `API_V1_STR`: prefijo API (default `/api/v1`)
- `CORS_ORIGINS`: origenes separados por coma
- `DOCTOR_EDIT_WINDOW_DAYS`: ventana de edicion de entrada medica (default `3`)
- `INTERNAL_API_KEY`: clave para endpoints internos
- `APPWRITE_ENDPOINT`: endpoint Appwrite
- `APPWRITE_PROJECT_ID`: project id Appwrite
- `APPWRITE_API_KEY`: API key Appwrite
- `APPWRITE_BUCKET_PATIENT_FILES`: bucket para archivos de pacientes

## Endpoints
- Paciente: historiales, detalle, actualizacion de campos base, archivos subir/listar/ver/eliminar
- Medico: ver historiales por paciente, crear entrada por cita, editar entrada propia dentro de ventana
- Interno: bootstrap de historial general y bootstrap por cita

## Nota
Este servicio no modifica historiales previos: cada consulta medica crea una nueva entrada append-only.
