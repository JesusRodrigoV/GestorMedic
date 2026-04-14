# 📋 Guía de Implementación Progresiva - /auth Module

**Plan de acción paso a paso para implementar las mejoras UI/UX de forma incremental y sin romper funcionalidad.**

---

## 🚀 Fases de Implementación

### **Fase 0: Preparación (30 minutos)**

#### ✅ Paso 1: Backup y Versionado
```bash
# Crear rama de características
git checkout -b features/auth-ui-ux-improvements

# Hacer commit del estado actual
git add .
git commit -m "backup: estado actual antes de mejoras auth UI/UX"

# Listar archivos a modificar
echo "Archivos a modificar:"
echo "- gestormedic-f/src/app/features/auth/login/login.ts"
echo "- gestormedic-f/src/app/features/auth/login/login.html"
echo "- gestormedic-f/src/app/features/auth/login/login.scss"
echo "- gestormedic-f/src/app/features/auth/register/register.scss"
echo "- gestormedic-f/src/app/features/auth/register-clinic/register-clinic.ts"
echo "- gestormedic-f/src/app/features/auth/register-clinic/register-clinic.html"
echo "- gestormedic-f/src/app/features/auth/register-clinic/register-clinic.scss"
echo "- [NUEVO] gestormedic-f/src/styles/_variables.css"
echo "- [NUEVO] gestormedic-f/src/app/shared/components/form-field-wrapper/"
echo "- [NUEVO] gestormedic-f/src/app/shared/validators/"
```

#### ✅ Paso 2: Instalar Dependencias Opcionales (No obligatorio)
```bash
# Si quieres usar animaciones Angular más avanzadas:
npm install @angular/animations  # Ya debería estar instalado

# Verificar que PrimeNG está completo:
npm list primeng
```

---

### **Fase 1: Fundación de Estilos (1-1.5 horas)**

#### ✅ Paso 1: Crear Estructura de Estilos

**Crear**: `src/styles/_variables.css`
- Copiar todo el contenido de "Variables CSS Globales" del documento de componentes

**Crear**: `src/styles/typography.scss`
- Copiar todo el contenido de "Mixins y Utilidades SCSS → Tipografía"

**Crear**: `src/styles/inputs.scss`
- Copiar todo el contenido de "Mixins y Utilidades SCSS → Inputs"

**Crear**: `src/styles/buttons.scss`
- Copiar todo el contenido de "Mixins y Utilidades SCSS → Botones"

**Crear**: `src/styles/animations.scss`
- Copiar todo el contenido de "Mixins y Utilidades SCSS → Animaciones"

#### ✅ Paso 2: Actualizar `styles.scss` Global

En `src/styles.scss`, agregar al inicio:

```scss
// ============================================
// IMPORTS DE ESTILOS BASE
// ============================================

// Variables y utilidades
@import 'styles/variables';
@import 'styles/typography';
@import 'styles/inputs';
@import 'styles/buttons';
@import 'styles/animations';

// ============================================
// RESET GLOBAL
// ============================================

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  font-family: var(--font-family);
  font-size: var(--font-size-base);
  line-height: var(--line-height-normal);
  color: var(--p-slate-900);
  background: var(--p-slate-50);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

// ============================================
// UTILITY CLASSES
// ============================================

.w-full { width: 100%; }
.h-full { height: 100%; }

.flex {
  display: flex;

  &-center {
    @extend .flex;
    align-items: center;
    justify-content: center;
  }

  &-col {
    @extend .flex;
    flex-direction: column;
  }
}

.grid { display: grid; }

// Margin utilities
@for $i from 0 through 12 {
  .m-#{$i} { margin: calc(var(--space-sm) * #{$i}); }
  .mb-#{$i} { margin-bottom: calc(var(--space-sm) * #{$i}); }
  .mt-#{$i} { margin-top: calc(var(--space-sm) * #{$i}); }
  .mx-#{$i} { margin-left: calc(var(--space-sm) * #{$i}); margin-right: calc(var(--space-sm) * #{$i}); }
}

// Padding utilities
@for $i from 0 through 12 {
  .p-#{$i} { padding: calc(var(--space-sm) * #{$i}); }
  .px-#{$i} { padding-left: calc(var(--space-sm) * #{$i}); padding-right: calc(var(--space-sm) * #{$i}); }
  .py-#{$i} { padding-top: calc(var(--space-sm) * #{$i}); padding-bottom: calc(var(--space-sm) * #{$i}); }
}

// Gap utilities
@for $i from 0 through 12 {
  .gap-#{$i} { gap: calc(var(--space-sm) * #{$i}); }
}

// ============================================
// OVERRIDES PRIMENG
// ============================================

// Mejorar inputs por defecto
.p-inputtext,
.p-password,
input[type="text"],
input[type="email"],
input[type="password"] {
  @include field-input();
}

// Mejorar botones por defecto
.p-button {
  @include btn-base();

  &.p-button-primary {
    @include btn-primary();
  }

  &.p-button-secondary {
    @include btn-secondary();
  }
}
```

#### ✅ Verificación
```bash
bun start
# Abrir http://localhost:4200
# Verificar que no hay errores en consola del navegador
# Verificar que los estilos globales se aplican (prueba abriendo cualquier página)
```

---

### **Fase 2: Componentes Reutilizables (1-1.5 horas)**

#### ✅ Paso 1: Crear Componentes Compartidos

**Crear**: `src/app/shared/components/form-field-wrapper/`

```bash
mkdir -p src/app/shared/components/form-field-wrapper
```

Archivo: `form-field-wrapper.ts`
- Copiar contenido de "Componentes Reutilizables → Form Field Wrapper"

**Crear**: `src/app/shared/components/password-strength-indicator/`

```bash
mkdir -p src/app/shared/components/password-strength-indicator
```

Archivo: `password-strength-indicator.ts`
- Copiar contenido de "Componentes Reutilizables → Password Strength Indicator"

#### ✅ Paso 2: Crear Validadores Personalizados

**Crear**: `src/app/shared/validators/password.validator.ts`
- Copiar contenido completo

**Crear**: `src/app/shared/validators/match.validator.ts`
- Copiar contenido completo

**Crear**: `src/app/shared/validators/index.ts` (Archivo de barril)

```typescript
export { strongPasswordValidator } from './password.validator';
export { matchFieldsValidator } from './match.validator';
```

#### ✅ Paso 3: Crear Animaciones Compartidas

**Crear**: `src/app/shared/animations/common.animations.ts`
- Copiar contenido completo de "Animaciones Angular"

#### ✅ Verificación
```bash
# Verificar que los archivos compilen sin errores
bun start
# Revisar la consola del navegador por errores TypeScript/Angular
```

---

### **Fase 3: Refactor Login (1.5-2 horas)**

#### ✅ Paso 1: Actualizar `login.ts`

**Archivo**: `src/app/features/auth/login/login.ts`

Cambios principales:
1. Importar nuevas validaciones y animaciones
2. Agregar computed signals para errores
3. Agregar localStorage para "recordarme"
4. Mejorar manejo de errores

**Checklist de cambios**:
- [ ] Importar `strongPasswordValidator`
- [ ] Importar animaciones `fadeInUp`, `slideInRight`
- [ ] Agregar `rememberMe` al formulario
- [ ] Agregar computed `emailError` y `passwordError`
- [ ] Agregar signal `serverError`
- [ ] Implementar localStorage save/load
- [ ] Auto-focus en primer campo
- [ ] Agregar método `openForgotPassword()`

#### ✅ Paso 2: Actualizar `login.html`

**Archivo**: `src/app/features/auth/login/login.html`

Cambios principales:
1. Agregar sección hero (izquierda)
2. Mejorar estructura de formulario
3. Agregar validación inline
4. Agregar security badge

**Checklist de cambios**:
- [ ] Agregar sección `.login-hero` (izquierda)
- [ ] Agregar sección `.login-form-section` (derecha)
- [ ] Cambiar inputs a `.input-wrapper` con iconos
- [ ] Agregar `.field-error-badge` para errores
- [ ] Agregar checkbox para "recordarme"
- [ ] Agregar link a olvidar contraseña funcional
- [ ] Agregar `.security-badge` al footer
- [ ] Verificar `@if`, `@else` de Angular 17+

#### ✅ Paso 3: Refactorizar `login.scss`

**Archivo**: `src/app/features/auth/login/login.scss`

Cambios principales:
1. Grid layout split-screen
2. Animaciones de entrada
3. Estados mejorados en inputs
4. Responsive design

**Checklist de cambios**:
- [ ] Crear `.login-wrapper` con grid (2 columnas en desktop, 1 en móvil)
- [ ] Crear `.login-hero` con contenido e iconos
- [ ] Mejorar `.login-card` con glass morphism
- [ ] Actualizar `.gm-input` y `.p-password` con estados
- [ ] Agregar animaciones keyframes
- [ ] Agregar media queries para responsive

#### ✅ Verificación Intermedia

```bash
bun start
# Abrir http://localhost:4200/auth/login

# Pruebas manuales:
# ✅ Formulario carga con animación
# ✅ Email se valida en tiempo real
# ✅ Checkbox "recordarme" guarda en localStorage
# ✅ Botón olvide contraseña navega correctamente
# ✅ En móvil se ve bien (single column)
# ✅ En desktop se ve el split screen
# ✅ Errores inline aparecen correctamente
```

---

### **Fase 4: Refactor Register Gate (45 minutos)**

#### ✅ Paso 1: Actualizar `register.scss`

**Archivo**: `src/app/features/auth/register/register.scss`

Cambios principales:
1. Cards interactivas con hover mejorado
2. Glow effects
3. Animaciones staggered
4. Iconos en contenedores

**Hacer desde archivo**: `AUTH_UI_UX_IMPROVEMENT_GUIDE.md` → Sección "REGISTER.SCSS - Versión Mejorada"

Reemplazar todo el contenido del archivo actual.

#### ✅ Paso 2: Mejoras Mínimas en HTML (Opcional)

**Archivo**: `src/app/features/auth/register/register.html`

Agregar atributos de accesibilidad:
- `tabindex="0"` en cards
- `(keydown.enter)` para navegación

Ver: `AUTH_UI_UX_IMPROVEMENT_GUIDE.md` → Sección "REGISTER.HTML - Versión Mejorada"

#### ✅ Verificación

```bash
# Abrir http://localhost:4200/auth/register
# ✅ Cards tienen efecto hover mejorado
# ✅ Pueden ser seleccionadas con TAB
# ✅ Animaciones staggered funcionan
# ✅ En móvil se ve bien
```

---

### **Fase 5: Refactor Register Clínica a Multi-Step (2-2.5 horas)**

#### ⚠️ NOTA IMPORTANTE
Esta es la más compleja. Recomendamos hacer primero el backup completo.

#### ✅ Paso 1: Actualizar `register-clinic.ts` a Multi-Step

**Archivo**: `src/app/features/auth/register-clinic/register-clinic.ts`

Cambios principales:
1. Dividir en múltiples formularios (step1, step2, step3)
2. Agregar navegación entre pasos
3. Agregar signal para progreso
4. Mejorar validación por paso

**Ubicación de código**: `AUTH_UI_UX_IMPROVEMENT_GUIDE.md` → Sección "REGISTER-CLINIC.TS - Versión Mejorada (Multi-Step)"

Reemplazar la lógica principal, pero mantener:
- Las URLs de API
- El flujo de registro con backend
- Manejo de notificaciones

#### ✅ Paso 2: Actualizar `register-clinic.html` con Pasos

**Archivo**: `src/app/features/auth/register-clinic/register-clinic.html`

Cambios principales:
1. Agregar barra de progreso
2. Agregar condicionales `@if` para cada paso
3. Agregar botones anterior/siguiente
4. Mostrar resumen en paso 3

**Ubicación de código**: `AUTH_UI_UX_IMPROVEMENT_GUIDE.md` → Sección "REGISTER-CLINIC.HTML - Versión Mejorada (Multi-Step)"

#### ✅ Paso 3: Crear `register-clinic.scss` Multi-Step

**Archivo**: `src/app/features/auth/register-clinic/register-clinic.scss`

Crear estilos para:
1. Barra de progreso
2. Secciones de formulario
3. Navegación
4. Resumen de datos

**Ubicación de código**: `AUTH_UI_UX_IMPROVEMENT_GUIDE.md` → Sección "REGISTER-CLINIC.SCSS - Versión Mejorada"

#### ✅ Verificación Completa

```bash
# Abrir http://localhost:4200/auth/register
# Seleccionar "Representante de Clínica"

# Paso 1 - Datos Personales
# ✅ Se muestra solo los 3 primeros campos
# ✅ Validación en tiempo real
# ✅ Botón "Siguiente" deshabilitado si hay errores

# Paso 2 - Datos de Clínica
# ✅ Aparecen 4 campos nuevos
# ✅ Botón "Anterior" funciona
# ✅ Progreso sube a 66%

# Paso 3 - Confirmación
# ✅ Se muestra resumen de datos
# ✅ Checkboxes de aceptación
# ✅ Botón "Crear Cuenta"

# Envío
# ✅ API recibe todos los datos correctamente
# ✅ Usuario es redirigido al dashboard
# ✅ Toast de éxito aparece
```

---

### **Fase 6: Características Adicionales Opcionales (1-2 horas)**

#### ✅ Opción A: Implementar Olvidar Contraseña

**Crear**: `src/app/features/auth/forgot-password/`

Estructura:
```
forgot-password/
├── forgot-password.ts
├── forgot-password.html
└── forgot-password.scss
```

**Flujo**:
1. Email
2. Enviar código de verificación
3. Ingresar código
4. Nueva contraseña
5. Confirmación

#### ✅ Opción B: Agregar Componente LoadingButton

**Crear**: `src/app/shared/components/loading-button/`

Ver: `AUTH_COMPONENTS_AND_UTILITIES.md` → Sección "Componente: Loading Button"

Beneficio: Botones con animación de carga más profesional

#### ✅ Opción C: Agregar Indicador de Fortaleza de Contraseña

**Usar**: Componente `PasswordStrengthIndicator` ya creado en Fase 2

Agregar a `register-clinic.ts` paso 1

---

### **Fase 7: Testing y Optimización (1.5-2 horas)**

#### ✅ Paso 1: Testing Manual

**Navegador Desktop (Chrome/Firefox)**:
- [ ] Login con email/password válidos
- [ ] Login con datos inválidos → mostrar error
- [ ] Recordarme → verificar localStorage
- [ ] Navegación entre páginas auth
- [ ] Registro multi-step completo
- [ ] Error de servidor capturado correctamente

**Navegador Móvil (Chrome Dev Tools)**:
- [ ] Layout responsivo (375px, 768px, 1024px)
- [ ] Inputs accesibles (TAB funciona)
- [ ] Botones son clickeables
- [ ] Texto legible
- [ ] Sin scroll horizontal

#### ✅ Paso 2: Testing de Accesibilidad

```bash
# Usar Chrome DevTools → Lighthouse
# Ejecutar auditoría de Accessibility

# Puntos clave:
# ✅ Todos los inputs tienen labels
# ✅ Contraste de colores suficiente (WCAG AA)
# ✅ Navegación por TAB funciona
# ✅ Errores claramente identificados
# ✅ Sin imágenes sin alt text
```

#### ✅ Paso 3: Testing de Performance

```bash
# Chrome DevTools → Performance
# Grabar navegación en login

# Objetivos:
# ✅ LCP (Largest Contentful Paint) < 2.5s
# ✅ FID (First Input Delay) < 100ms
# ✅ CLS (Cumulative Layout Shift) < 0.1
```

#### ✅ Paso 4: Optimizaciones

```typescript
// Si es necesario, lazy load componentes:
// En app.routes.ts
{
  path: 'auth/forgot-password',
  loadComponent: () => import('./forgot-password.component').then(m => m.ForgotPasswordComponent)
}

// Usar OnPush change detection (ya está hecho)
// Usar Signals/Computed (ya está hecho)
// Usar trackBy en *ngFor (si aplica)
```

---

### **Fase 8: Merge y Deploy (30 minutos)**

#### ✅ Paso 1: Commit de Cambios

```bash
# Commit por fase (recomendado)
git add src/styles/
git commit -m "feat(auth): estilos base y utilidades globales"

git add src/app/shared/components/ src/app/shared/validators/ src/app/shared/animations/
git commit -m "feat(auth): componentes reutilizables y validadores"

git add src/app/features/auth/login/
git commit -m "feat(auth/login): UI/UX mejorada con validación inline"

git add src/app/features/auth/register/
git commit -m "feat(auth/register): cards interactivos mejorados"

git add src/app/features/auth/register-clinic/
git commit -m "feat(auth/register-clinic): formulario multi-paso"

# Ver log
git log --oneline | head -10
```

#### ✅ Paso 2: Push y Pull Request

```bash
# Push a rama de feature
git push origin features/auth-ui-ux-improvements

# Crear Pull Request en GitHub/GitLab
# Título: "Mejora UI/UX del módulo de autenticación"
# Descripción: Incluir checklist de cambios
```

#### ✅ Paso 3: Verificación en Producción

```bash
# Si usas Netlify, Vercel, etc., verificar que build pasa:
bun run build

# Servir build localmente para probar:
npx http-server dist/ -p 3000
# http://localhost:3000/auth/login
```

---

## 📊 Comparativa Antes/Después

### Login

#### ANTES
```
┌─────────────────────────────────┐
│  📝 Bienvenido a GestorMedic    │
│                                 │
│  [Email]                        │
│  [Password]                     │
│                                 │
│  [Acceder]                      │
│                                 │
│  ¿Olvidó? | Registrase         │
└─────────────────────────────────┘

Problemas:
❌ Sin validación inline
❌ Sin diferenciación de estados
❌ Olvidar contraseña no funciona
❌ Sin recordarme
❌ Formulario demasiado simple
```

#### DESPUÉS
```
┌────────────────────────────────────────────────┐
│  ┌─────────────────┐  ┌──────────────────────┐ │
│  │   [HERO]        │  │  [FORM]              │ │
│  │   Ilustración   │  │                      │ │
│  │   + Ícono       │  │  Logo                │ │
│  │   + Checklist   │  │  Bienvenido          │ │
│  │                 │  │                      │ │
│  │                 │  │  ✉️ Email [✗ Error] │ │
│  │                 │  │  ↳ Ingrese un email │ │
│  │                 │  │                      │ │
│  │                 │  │  🔐 Password [✓OK]  │ │
│  │                 │  │  [x] Recordarme     │ │
│  │                 │  │                      │ │
│  │                 │  │  [→ Acceder]        │ │
│  │                 │  │  ¿Olvidó? (+) Ayuda │ │
│  │                 │  │  ─────────────────   │ │
│  │                 │  │  ¿No tiene? Registrar│ │
│  │                 │  │  🔒 HTTPS Seguro    │ │
│  └─────────────────┘  └──────────────────────┘ │
└────────────────────────────────────────────────┘

Mejoras:
✅ Validación inline con iconos
✅ Split-screen profesional
✅ Recordarme funcional
✅ Olvidó contraseña implementado
✅ Security badge
✅ Animaciones de entrada
✅ Responsive en móvil
```

### Registro (Gate)

#### ANTES
```
[Role 1]  [Role 2]  [Role 3]
Simple cards con border

Problemas:
❌ Sin interactividad visual
❌ Sin animaciones
❌ Hover effect mínimo
```

#### DESPUÉS
```
┌──────────────────┐  ┌──────────────────┐
│ Paciente         │  │ Médico           │
│ ┌──────────────┐ │  │ ┌──────────────┐ │
│ │ 👤          │ │  │ │ ⚕️          │ │
│ └──────────────┘ │  │ └──────────────┘ │
│ Busca especialistas   │ Gestiona pacientes│
│ → Iniciar registro    │ → Iniciar registro│
└──────────────────┘  └──────────────────┘
        ↓ hover
┌──────────────────────────────────────┐
│ Border gradient + Glow effect        │
│ Scale transform + Elevated shadow    │
│ Arrow animation                       │
└──────────────────────────────────────┘

Mejoras:
✅ Cards con glow effect
✅ Border gradient en hover
✅ Animaciones staggered
✅ Transform mejorado
✅ Accesibilidad (tabindex)
```

### Registro Clínica

#### ANTES
```
Formulario de 11 campos en 1 pantalla

Problemas:
❌ Abrumador
❌ Campos muy largos
❌ Sin validación inline
❌ Sin indicador de progreso
❌ Sin agrupación temática
```

#### DESPUÉS
```
┌─────────────────────────────────┐
│ Progreso: ███░░░░░░  33%        │
│ Paso 1 de 3                     │
├─────────────────────────────────┤
│ Datos Personales                │
│                                 │
│ [Nombre Completo]     [✓]       │
│ [Email Institucional] [✓]       │
│ [Contraseña]          [ ]       │
│ ↳ Débil / Regular / Buena...    │
│                                 │
│ [Anterior]  [Siguiente →]       │
└─────────────────────────────────┘
      ↓ Click Siguiente
┌─────────────────────────────────┐
│ Progreso: ██████░░░░  66%       │
│ Paso 2 de 3                     │
├─────────────────────────────────┤
│ Datos de Clínica                │
│ [Razón Social]                  │
│ [NIT]                           │
│ [Teléfono]                      │
│ [Dirección]                     │
│ [Anterior]  [Siguiente →]       │
└─────────────────────────────────┘

Mejoras:
✅ Progreso visual claro
✅ Campos agrupados
✅ Validación por paso
✅ Indicador de fortaleza  
✅ Menos abrumador
✅ Mejor UX progresiva
```

---

## 🎯 Checklist de Implementación Completo

### Fase 0: Preparación
- [ ] Crear rama de características
- [ ] Commit de backup

### Fase 1: Fundación de Estilos
- [ ] Crear `_variables.css`
- [ ] Crear `typography.scss`
- [ ] Crear `inputs.scss`
- [ ] Crear `buttons.scss`
- [ ] Crear `animations.scss`
- [ ] Actualizar `styles.scss` con imports
- [ ] Verificar que compila sin errores

### Fase 2: Componentes
- [ ] Crear `form-field-wrapper.ts`
- [ ] Crear `password-strength-indicator.ts`
- [ ] Crear `password.validator.ts`
- [ ] Crear `match.validator.ts`
- [ ] Crear `common.animations.ts`

### Fase 3: Login
- [ ] Actualizar `login.ts` con validación avanzada
- [ ] Actualizar `login.html` con split-screen
- [ ] Refactorizar `login.scss` con animaciones
- [ ] Testing manual en desktop
- [ ] Testing manual en móvil

### Fase 4: Register (Gate)
- [ ] Refactorizar `register.scss`
- [ ] Mejoras en `register.html` (accesibilidad)
- [ ] Testing de hover/focus states

### Fase 5: Register Clínica
- [ ] Actualizar `register-clinic.ts` a multi-step
- [ ] Actualizar `register-clinic.html`
- [ ] Crear `register-clinic.scss`
- [ ] Testing de navegación entre pasos
- [ ] Testing del envío del formulario

### Fase 6: Opcionales
- [ ] Crear página "Olvidar Contraseña" (opcional)
- [ ] Agregar `LoadingButton` (opcional)
- [ ] Agregar `PasswordStrengthIndicator` (opcional)

### Fase 7: Testing
- [ ] Accessibility audit (Lighthouse)
- [ ] Performance audit (Lighthouse)
- [ ] Responsive testing (múltiples breakpoints)
- [ ] Cross-browser testing

### Fase 8: Deploy
- [ ] Commits por fase
- [ ] Push a rama de feature
- [ ] Pull Request
- [ ] Verificar build de producción

---

## ⏱️ Estimación de Tiempo Total

| Fase | Estimado |
|------|----------|
| **0. Preparación** | 30 min |
| **1. Estilos Base** | 1-1.5 h |
| **2. Componentes** | 1-1.5 h |
| **3. Refactor Login** | 2 h |
| **4. Refactor Register** | 45 min |
| **5. Register Multi-Step** | 2.5-3 h |
| **6. Opcionales** | 1-2 h |
| **7. Testing** | 1.5-2 h |
| **8. Deploy** | 30 min |
| **TOTAL** | **10-15 horas** |

---

## 🚨 Troubleshooting Común

### Error: "Cannot find module '@shared/components/form-field-wrapper'"

**Solución**: Verificar que el archivo existe en:
```
src/app/shared/components/form-field-wrapper/form-field-wrapper.ts
```

Y que está exportado en `shared.ts` si existe archivo de barril.

### Los estilos de PrimeNG no se aplican

**Solución**: Verificar en `angular.json`:

```json
{
  "styles": [
    "node_modules/primeng/resources/primeng.min.css",
    "node_modules/primeicons/primeicons.css",
    "src/styles.scss"
  ]
}
```

### Animaciones no funcionan

**Solución**: Verificar que `BrowserAnimationsModule` está importado en `app.config.ts`:

```typescript
import { provideAnimations } from '@angular/platform-browser/animations';

export const appConfig: ApplicationConfig = {
  providers: [
    // ...
    provideAnimations(),
  ],
};
```

---

## 📚 Documentación Relacionada

Dentro del repositorio de GestorMedic:

1. **AUTH_UI_UX_IMPROVEMENT_GUIDE.md** - Guía visual y componentes
2. **AUTH_COMPONENTS_AND_UTILITIES.md** - Utilidades y patrones
3. **AUTH_IMPLEMENTATION_GUIDE.md** (este documento)

---

**Fecha**: 12 de abril, 2026  
**Autor**: GestorMedic Dev Team  
**Versión**: 1.0  
**Aplica a**: Angular 18+, PrimeNG 18+, GestorMedic v1.0+
