# GestormedicF

Tu decisión de ejecutar un **repliegue táctico** es una muestra de pragmatismo y liderazgo. En la historia militar, el general ruso Mijaíl Kutúzov decidió incendiar y abandonar Moscú en 1812 ante la llegada de Napoleón. Fue una decisión dolorosa y criticada, pero salvó al ejército ruso de la aniquilación; Kutúzov entendió que era preferible perder la capital que perder la capacidad de seguir luchando.

Si tu equipo carece de la madurez técnica para manejar la complejidad de Nx y los monorepos, forzarlos a aprenderlo en tres semanas es una receta para el sabotaje interno. Al volver a un proyecto de Angular estándar, eliminas la fricción de la herramienta y te centras en la **lógica del negocio**, que es lo que realmente te dará los puntos en la evaluación.

Para mantener el orden y cumplir con la arquitectura **Feature-Based** (Basada en Funcionalidades) en un solo proyecto, aquí tienes el plano de construcción exacto para tus carpetas.

### 1. La Estructura de Raíz (Arquitectura Limpia)

Dentro de `src/app`, dividiremos el territorio en tres grandes áreas de influencia para evitar que el código se convierta en una masa informe.

* **`core/`**: El centro de mando. Aquí va lo que se carga una sola vez (Singletons).
    * `guards/`: Protección de rutas (¿Es médico? ¿Es paciente?).
    * `interceptors/`: Tu interceptor de tokens JWT que ya discutimos.
    * `services/`: Servicios globales de autenticación y manejo de errores.
* **`shared/`**: La infraestructura común. Componentes que se usan en todas partes.
    * `components/`: Botones, tablas, tarjetas de médicos, barras de carga.
    * `pipes/`: Formateo de fechas médicas o moneda boliviana.
    * `models/`: Interfaces de TypeScript (Paciente, Cita, Clínica).
* **`features/`**: Los distritos operativos. Aquí es donde aplicarás la división que mencionaste.

---

### 2. El Orden de las Funcionalidades (Features)

Para cumplir con el requerimiento de separar la parte del médico, del cliente y la pública, estructuraremos la carpeta `features/` de la siguiente manera. Cada una debe ser un **módulo con carga diferida (Lazy Loading)** para no sobrecargar el navegador.

#### A. `features/public` (El Portal de Descubrimiento)
Este es el acceso libre para los "millones de pacientes" que aún no se han registrado o están buscando atención.
* **`doctor-search/`**: Buscador por especialidad y centro médico.
* **`doctor-profile/`**: Vista del perfil del médico con precios, comparativas y la retroalimentación de otros pacientes.
* **`landing/`**: Página de inicio que explica el modelo Freemium para las clínicas.

#### B. `features/medical-admin` (El Dominio del Médico)
Acceso restringido para los profesionales y administradores de clínicas.
* **`dashboard/`**: Resumen de la caja y citas del día.
* **`agenda/`**: Calendario de citas y reserva de salas especializadas.
* **`patient-records/`**: Gestión de historias clínicas y organización de carpetas de documentos (análisis, fotos, informes).
* **`billing/`**: Exportación de facturas, recibos y liquidaciones a aseguradoras.

#### C. `features/patient-portal` (El Dominio del Cliente)
Acceso restringido para el paciente que ya recibe atención.
* **`my-appointments/`**: Ver citas agendadas y recordatorios.
* **`medical-results/`**: Zona web para descargar análisis y resultados automatizados.
* **`profile/`**: Actualización de datos personales y descarga de facturas propias.

#### D. `features/auth` (La Puerta de Entrada)
* **`login/`**: Inicio de sesión único.
* **`register-clinic/`**: El flujo de registro para que nuevas clínicas se unan al sistema SaaS.

---

### 3. Lógica de Enrutamiento y Seguridad

Aunque ahora todo esté en un solo proyecto, debes imponer una **estratificación de acceso** estricta mediante rutas. No puedes permitir que un paciente, por un error de URL, termine en la carpeta de documentos de la clínica.

* Las rutas de `features/public` y `features/auth` deben ser accesibles para todos.
* Las rutas de `features/medical-admin` deben estar protegidas por un `AuthGuard` que verifique en el token JWT si el rol es de médico o administrador.
* Las rutas de `features/patient-portal` deben verificar que el usuario sea un paciente autenticado.

### 4. Recomendación de Líder: El "Shared" es tu salvación

Para que el equipo avance rápido, tú como líder debes construir primero la carpeta `shared/`. Si les entregas una tabla y un botón ya diseñados y funcionales, ellos solo tendrán que "pegar" esos componentes en las carpetas de `features/`. Esto garantiza que la aplicación del médico y la del paciente se vean igual de profesionales sin que cada miembro del equipo intente inventar su propio diseño.

Has abandonado la complejidad de Nx para ganar velocidad de ejecución. Es una retirada estratégica válida. Ahora, con el Sprint 2 en marcha desde esta mañana, ¿cuál de estos distritos (`public`, `medical` o `patient`) vas a asignar como prioridad máxima para que tu equipo entregue el primer prototipo funcional el próximo martes 7 de abril?