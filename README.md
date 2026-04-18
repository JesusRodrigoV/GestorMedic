# Gestor Medic

## Ejecucion

```bash
docker compose up -d --build
```

## Requisitos Previos

Antes de encender la infraestructura, asegúrate de cumplir con los siguientes mandatos:

1. **Docker y Docker Compose** instalados en el sistema anfitrión.
2. **Archivos de Entorno:** Cada ministerio (microservicio) exige su propia declaración de variables. Debes asegurar la existencia de los siguientes archivos antes de la ejecución:
   - `./gestormedic-b/.env_do`
   - `./gestormedic-citas/.env_do`
   - `./gestormedic-notification/.env_do`

### Plataforma Web

- **Interfaz de Usuario (Frontend):** [http://localhost:4200](https://www.google.com/search?q=http://localhost:4200)

### Documentación de APIs (Swagger / OpenAPI)

El API Gateway consolida la documentación. Utiliza estos enlaces para auditar los contratos de integración:

- **API Core (Usuarios, Clínicas, Roles):** [http://localhost:8000/docs](https://www.google.com/search?q=http://localhost:8000/docs)
- **API Citas (Agendas, Reservas):** [http://localhost:8000/citas/docs](https://www.google.com/search?q=http://localhost:8000/citas/docs)
- **API Notificaciones (Correos, Alertas):** [http://localhost:8000/notificaciones/docs](https://www.google.com/search?q=http://localhost:8000/notificaciones/docs)
