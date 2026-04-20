# Conexion SQLTools a HOUSE6-local

Configuracion sugerida para la extension SQLTools (PostgreSQL):

- Driver: PostgreSQL
- Name: HOUSE6-local
- Server/Host: localhost
- Port: 8080
- Database: HOUSE-local
- Username: admin
- Password: admin
- Connection Timeout: 30
- Use SSL: false

Alternativa de usuario:

- Username: pgadmin
- Password: admin

## Cadena de conexion para backend freemium

Para `gestormedic-freemiun` (SQLAlchemy asyncpg):

```text
postgresql+asyncpg://admin:admin@localhost:8080/HOUSE-local
```

Si usas `pgadmin` como usuario:

```text
postgresql+asyncpg://pgadmin:admin@localhost:8080/HOUSE-local
```

## Verificacion rapida

1. Abrir SQLTools y conectar a `HOUSE6-local`.
2. Ejecutar una consulta simple:

```sql
SELECT now();
```

3. Confirmar tablas freemium:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_name LIKE 'freemium_%'
ORDER BY table_name;
```

## Nota operativa

Si `localhost:8080` no responde como PostgreSQL, valida si ese puerto corresponde a un proxy/web y prueba con puerto PostgreSQL directo (normalmente 5432) en tu entorno local.
