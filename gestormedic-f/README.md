# GestorMedic - Frontend Application

## 1. Propósito del Sistema

GestorMedic es una plataforma diseñada para centralizar la gestión médica y administrativa en clínicas y consultorios. El sistema reemplaza los registros físicos y procesos manuales por un entorno digital seguro, eficiente y escalable bajo un modelo de arquitectura multi-tenant.

## 2. Estructura de Carpetas

El proyecto sigue una organización modular basada en dominios y responsabilidades:

```text
public/                     # Imágenes, presets y recursos globales
src/
├── app/
│   ├── core/               # Componentes transversales (Layouts, Guards, Interceptors)
│   │   ├── layouts/        # AdminLayout, AuthLayout, PublicLayout
│   │   └── services/       # Servicios globales y lógica de autenticación
│   ├── features/           # Módulos de negocio (Funcionalidades)
│   │   ├── public/         # Home, Search, Landing pages
│   │   ├── auth/           # Login, Registro de clínicas
│   │   ├── medical-admin/  # Dashboard, Gestión de pacientes (Rol Médico)
│   │   └── super-admin/    # Gestión de inquilinos y planes (Rol Control)
│   ├── shared/             # Componentes, pipes y directivas reutilizables
│   │   ├── components/     # Wrappers de PrimeNG (Data-Table, Form-Field)
│   │   └── models/         # Interfaces y tipos de datos (Contratos)
```

## 3. Arquitectura de Rutas

La navegación está dividida en cuatro grandes dominios lógicos para garantizar el aislamiento de funciones:

- **`/`**: Área pública y captación de clientes.
- **`/auth`**: Puerta de enlace para autenticación y registro.
- **`/app`**: Consola operativa para médicos y clínicas (SaaS Principal).
- **`/control`**: Panel de mando para el SuperAdmin del sistema.
- **`/portal`**: Acceso exclusivo para pacientes y consulta de resultados.

## 4. Configuración del Entorno de Desarrollo

### Requisitos previos

- Motor de ejecución y gestor de paquetes: Bun.
- Interfaz de línea de comandos: Angular CLI.

### Instalación de Infraestructura (Bun)

Si no dispone de Bun en su estación de trabajo, ejecute el comando correspondiente a su sistema operativo para instalar el motor.

Para entornos macOS, Linux o Windows Subsystem for Linux (WSL):

```bash
curl -fsSL [https://bun.sh/install](https://bun.sh/install) | bash
```

Para entornos Windows nativos mediante PowerShell:

```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

En caso de contar previamente con Node.js y preferir la instalación global mediante npm:

```bash
npm install -g bun
```

### Inicialización del Proyecto

1. Clonar el repositorio en el directorio local.
2. Descargar y enlazar las dependencias estructurales mediante el gestor:

```bash
bun install
```

3. Levantar el servidor de desarrollo:

```bash
bun start
```

El sistema estará disponible y en escucha en `http://localhost:4200`.