# GestorMedic Freemium Service

Microservicio para control de planes freemium, suscripciones, simulacion de pagos y metrica financiera.

## Funcionalidades

- Catalogo de planes por rol (`paciente`, `medico`, `admin_clinica`) y ciclo (`monthly`, `annual`).
- Suscripcion por usuario con renovacion mensual o anual.
- Simulador de pago para activar/cambiar plan (sin pasarela real).
- Control de limites por funcionalidad (`usage counters`) para modelo freemium.
- Endpoints para superadmin: usuarios y planes, resumen financiero, pagos, estadisticas.
- Bootstrap automatico de indices de rendimiento en arranque local.

## Variables de entorno

- `DATABASE_URL`: URL async PostgreSQL.
- `SECRET_KEY`: clave JWT compartida con backend principal.
- `ALGORITHM`: algoritmo JWT (default `HS256`).
- `API_V1_STR`: prefijo API (default `/api/v1`).
- `CORS_ORIGINS`: lista separada por comas.

## Endpoints principales

- Usuario:
  - `GET /api/v1/subscriptions/me`
  - `GET /api/v1/subscriptions/me/entitlements`
  - `POST /api/v1/subscriptions/checkout/simulate`
  - `POST /api/v1/subscriptions/usage/consume`
- Admin sistema:
  - `GET /api/v1/admin/users/subscriptions`
  - `GET /api/v1/admin/financial/summary`
  - `GET /api/v1/admin/payments`
  - `GET /api/v1/admin/subscriptions/stats`

## Nota de Appwrite MCP

El MCP de Appwrite esta accesible, pero no hay databases en el proyecto Appwrite actual (`tables_db_list -> total: 0`).
Por eso este servicio usa PostgreSQL como almacenamiento operativo.

## Indices de rendimiento (auto-aplicados)

El archivo [app/db/sql/freemium_performance_indexes.sql](app/db/sql/freemium_performance_indexes.sql) se ejecuta automaticamente durante el startup del servicio.

- Es idempotente (`CREATE INDEX IF NOT EXISTS`).
- Garantiza que en local, al crear/iniciar la BBDD, los indices queden actualizados sin pasos manuales.
