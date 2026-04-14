# 🎨 Guía de Mejora UI/UX - Módulo /auth GestorMedic

**Documento de referencia para elevar la calidad visual y experiencia de usuario del portal de autenticación.**

---

## 📋 Tabla de Contenidos

1. [Análisis Actual](#análisis-actual)
2. [Principios de Diseño SaaS Moderno](#principios-de-diseño-saas-moderno)
3. [Propuestas de Mejora](#propuestas-de-mejora)
4. [Paleta de Colores y Tipografía](#paleta-de-colores-y-tipografía)
5. [Componentes PrimeNG Recomendados](#componentes-primeng-recomendados)
6. [Ejemplos de Código Mejorado](#ejemplos-de-código-mejorado)
7. [Implementación Paso a Paso](#implementación-paso-a-paso)

---

## 🔍 Análisis Actual

### ✅ Fortalezas del Diseño Existente
- **Glass morphism**: Efecto moderno y profesional bien aplicado
- **Paleta de colores**: Yale, Energy y Slate bien definida y coherente
- **Arquitectura modular**: Componentes reutilizables como `RoundedButton`
- **Estructura reactiva**: FormBuilder y validaciones funcionales
- **PrimeNG**: Integración limpia sin exceso de dependencias

### ⚠️ Áreas de Mejora

#### 📱 Pantalla de Login
- [ ] Falta recuperación de contraseña (link sin funcionalidad)
- [ ] Validación en tiempo real sin feedback visual progresivo
- [ ] Sin estados de error inline (al lado del campo)
- [ ] Falta animación de carga mejorada
- [ ] Podría tener un hero visual o ilustración

#### 📝 Pantalla de Registro (Gate)
- [ ] Cards de rol sin interactividad visual progresiva (hover effect)
- [ ] Falta indicador de selección activa
- [ ] Sin animación de entrada
- [ ] Podría tener más contraste o branding

#### 🏥 Registro de Clínica
- [ ] Muy largo (11 campos visibles)
- [ ] Sin agrupación visual clara
- [ ] Falta indicador de progreso (multi-step form)
- [ ] Sin validación inline
- [ ] Campos con iconos pero sin consistencia visual
- [ ] Podría implementarse como formulario por pasos

#### 🔐 General
- [ ] Falta "Olvidó contraseña" completamente implementado
- [ ] Sin estados de validación inline en campos
- [ ] Falta feedback de error de servidor en campo específico
- [ ] Sin indicador de requisitos de contraseña

---

## 🎯 Principios de Diseño SaaS Moderno

### 1. **Minimalismo Inteligente**
```scss
// ✅ DO: Menos elementos, máximo impacto
- 1 input texto
- 1 input contraseña
- 1 checkbox "recordarme"
- 1 botón principal

// ❌ DON'T: Demasiadas distracciones
- Múltiples botones secundarios
- Iconos decorativos sin propósito
- Exceso de sombras y bordes
```

### 2. **Jerarquía Visual Clara**
```
Tamaño:      Logo << Título << Input << CTA
Peso:        Semiluz << Semibold << 600
Color:       Gris << Azul Oscuro << Azul Energía
Espaciado:   Consistente en múltiplos de 8px (8, 16, 24, 32, 40...)
```

### 3. **Feedback Progresivo**
- **Hover**: Ligero cambio de color/sombra
- **Focus**: Anillo de color, sin bordes gruesos
- **Active**: Color primary
- **Disabled**: Opacidad reducida
- **Error**: Borde rojo + icon + mensaje

### 4. **Fricción Mínima**
- Auto-focus en primer campo
- TAB entre campos
- Enter para enviar
- Recordar email en localStorage
- Links de ayuda contextuales

### 5. **Confianza y Seguridad**
- Ícono de candado en campos sensibles
- Indicador de fortaleza de contraseña
- Mensaje de privacidad clara
- HTTPS badge (implícito)
- Certificaciones si aplica

---

## 🚀 Propuestas de Mejora

### 📌 1. LOGIN - Mejoras Específicas

#### Propuesta Visual: Split-Screen Moderno (Opcional)

```
┌─────────────────────────────────────────────┐
│     [ILUSTRACIÓN]     │     [FORMULARIO]    │
│   - Gradiente        │   - Card limpia     │
│   - Iconos médicos   │   - Focus claro     │
│   - Animaciones      │   - Validación      │
└─────────────────────────────────────────────┘
```

#### Cambios Recomendados:

| Elemento | Actual | Mejorado | Impacto |
|----------|--------|----------|---------|
| **Formulario** | Card centrada | Split-screen opcional | Profesionalismo ↑ |
| **Inputs** | Básicos | Con icono + validación inline | UX ↑ |
| **Botón** | Flat | Con loading animation | Feedback ↑ |
| **Error** | Toast notificación | Error inline + Toast | Claridad ↑ |
| **Olvidar contraseña** | No funciona | Modal/página implementada | Funcionalidad ↑ |
| **Recordarme** | No existe | Checkbox + localStorage | Comodidad ↑ |

---

### 📌 2. REGISTRO (GATE) - Mejoras Específicas

#### Propuesta Visual: Card Interactivo Mejorado

```
Antes:
┌──────────────────────┐
│  Ícono              │  
│  Título             │  → Hover: cambio sutil
│  Descripción        │
│  Button             │
└──────────────────────┘

Después:
┌──────────────────────┐  ← Borde gradient en hover
│  ✨ Tag Superior     │  ← Label diferenciado
│  ╔═══════════════╗   │
│  ║    Ícono      ║   │  ← Icono en contenedor
│  ╚═══════════════╝   │
│  Título (weight 600) │  ← Jerarquía clara
│  Descripción dimmed  │  
│  → Arrow Animation   │  ← CTA interactivo
└──────────────────────┘  ← Shadow en hover
```

#### Cambios Recomendados:

| Aspecto | Mejora |
|--------|--------|
| **Card hover** | Border gradient + shadow elevado + scale suave |
| **Icono** | Contenedor circular con fondo de color primario |
| **Tag** | Etiqueta de acceso en esquina superior |
| **Arrow** | Animación slide → al hacer hover |
| **Transición** | Suave (200-300ms) |
| **Animación entrada** | Fade-in + slide-up secuencial |

---

### 📌 3. REGISTRO CLÍNICA - Mejoras Específicas

#### Problema Principal
Formulario demasiado largo (11 campos) en UNA pantalla.

#### Solución: Multi-Step Form con Barra de Progreso

```
Estado 1: DATOS REPRESENTANTE
┌────────────────────────────────┐
│ Progreso: ████░░░░░░░░  (33%)  │
│ Paso 1 de 3                    │
├────────────────────────────────┤
│ □ Nombre Completo          [✓] │
│ □ Correo                   [✓] │
│ □ Contraseña               [ ] │
│ [Siguiente] [Cancelar]         │
└────────────────────────────────┘

Estado 2: DATOS CLÍNICA
┌────────────────────────────────┐
│ Progreso: ████████░░░░░░  (66%)│
│ Paso 2 de 3                    │
├────────────────────────────────┤
│ □ Razón Social             [ ] │
│ □ NIT                      [ ] │
│ □ Teléfono                 [ ] │
│ □ Dirección                [ ] │
│ [Anterior] [Siguiente]         │
└────────────────────────────────┘

Estado 3: CONFIRMACIÓN
┌────────────────────────────────┐
│ Progreso: ███████████████ (100%)│
│ Paso 3 de 3                    │
├────────────────────────────────┤
│ ✓ Revisión de datos            │
│ ✓ Políticas de privacidad      │
│ [Anterior] [Crear Cuenta]      │
└────────────────────────────────┘
```

#### Cambios Recomendados:

| Elemento | Cambio | Beneficio |
|----------|--------|-----------|
| **Layout** | 3 pasos + barra progreso | Reduce sobrecarga cognitiva |
| **Validación** | Por paso + inline | Feedback claro |
| **Campos** | Agrupados temáticamente | Coherencia visual |
| **Iconos** | Consistentes en diseño | Profesionalismo |
| **Navegación** | Anterior/Siguiente | Control del usuario |

---

## 🎨 Paleta de Colores y Tipografía

### Sistema de Colores (Ya Definido)

```scss
// Colores Primarios
$yale:   #1a3c5a;      // Azul oscuro - Título, texto principal
$energy: #4a90e2;      // Azul cielo - Botones, links, highlights
$slate:  #607d8b;      // Gris - Texto secundario, borders

// Escala Funcional
$success: #10b981;     // Verde - Validación exitosa
$warning: #f59e0b;     // Naranja - Advertencia
$error:   #ef4444;     // Rojo - Errores
$info:    #3b82f6;     // Azul - Información

// Escala de Grises
$white:      #ffffff;
$light-bg:   #f4f7f9;  // Fondo muy claro
$light-200:  #e5ecf1;  // Inputs background
$light-300:  #d1dcE3;  // Borders
$dark-700:   #435861;  // Texto secundario
$dark-900:   #1d262a;  // Texto principal
```

### Tipografía Recomendada

```scss
// Fuentes (Usar Inter o Poppins)
$font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI';

// Escalas
$display:  2.25rem (36px) - 800  // Títulos heroicos
$h1:       1.875rem (30px) - 700 // Títulos principales  
$h2:       1.5rem (24px) - 700   // Subtítulos
$h3:       1.25rem (20px) - 600  // Secciones
$body-lg:  1.0625rem (17px) - 500 // Cuerpo principal
$body:     1rem (16px) - 500      // Cuerpo
$body-sm:  0.875rem (14px) - 500  // Texto secundario
$caption:  0.75rem (12px) - 400   // Labels, hints

// Espaciado de líneas
line-height: 1.5 (body), 1.4 (headers), 1.6 (small text)
```

### Aplicación en Login

```scss
// Login.scss mejorado
.yale-title {
  @include typography($h2, $weight: 700, $color: $yale); // 1.5rem, 700, #1a3c5a
}

.slate-subtitle {
  @include typography($body, $weight: 400, $color: $slate-600); // 1rem, 400, #607d8b
}

label {
  @include typography($body-sm, $weight: 600, $color: $yale); // 0.875rem, 600, #1a3c5a
}

.form-hint {
  @include typography($caption, $weight: 400, $color: $slate-500); // 0.75rem, 400
}
```

---

## 🧩 Componentes PrimeNG Recomendados

### Para Login / Register

| Caso de Uso | Componente | Props Recomendados |
|-------------|-----------|-------------------|
| **Input Email** | `pInputText` | `type="email"` `placeholder="..."` `severity="error"` |
| **Input Password** | `p-password` | `[toggleMask]="true"` `[weakLabel]="'Débil'"` `[mediumLabel]="'Medio'"` |
| **Botón CTA** | `p-button` | `severity="primary"` `[loading]="isLoading"` `raised` |
| **Botón Secundario** | `p-button` | `severity="secondary"` `outlined` |
| **Mensaje Error** | `p-message` | `severity="error"` `[text]="'..'"` |
| **Mensaje Confirmación** | `p-toast` | Auto-dismiss en 3s |
| **Checkbox** | `p-checkbox` | `[binary]="true"` |
| **Link/Divider** | `p-divider` | `orientation="horizontal"` |
| **Progress** | `p-progressBar` | `[value]="progress"` (para multi-step) |
| **Steps** | `p-steps` | `[items]="steps"` `[activeIndex]="activeStep"` |

### Ejemplos de Uso

```typescript
// Input con validación
<div class="field-group">
  <label for="email">Correo Institucional</label>
  <p-input-text 
    id="email"
    [(ngModel)]="email"
    [ngClass]="{'ng-invalid ng-touched': isEmailInvalid}"
    @if (isEmailInvalid) {
      <small class="field-error">{{ errorMessage }}</small>
    }
  />
</div>

// Password con indicador de fortaleza
<div class="field-group">
  <label for="password">Contraseña</label>
  <p-password
    id="password"
    [(ngModel)]="password"
    [toggleMask]="true"
    weakLabel="Débil"
    mediumLabel="Normal"
    strongLabel="Fuerte"
    (onFocus)="showPasswordHint = true"
  />
  @if (showPasswordHint) {
    <small class="password-hint">Mín. 8 caracteres, incluya mayúsculas y números</small>
  }
</div>

// Botón con carga
<p-button
  label="Acceder al Sistema"
  [loading]="isLoading()"
  [disabled]="loginForm.invalid"
  severity="primary"
  (onClick)="onLogin()"
  styleClass="w-full"
/>

// Mensaje de error
@if (loginError()) {
  <p-message
    severity="error"
    [text]="loginError()"
    styleClass="w-full mb-4"
  />
}

// Card con progreso (multi-step)
<div class="form-progress">
  <p-progress-bar 
    [value]="(currentStep / totalSteps) * 100" 
    styleClass="mb-4"
  />
  <p>Paso {{ currentStep }} de {{ totalSteps }}</p>
</div>

// Steps indicator
<p-steps 
  [items]="formSteps" 
  [activeIndex]="activeStep"
  styleClass="mb-6"
/>
```

---

## 💻 Ejemplos de Código Mejorado

### 1. LOGIN.TS - Versión Mejorada

```typescript
import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NotificationService } from '@core/services/notification';
import { RoundedButton } from '@shared/ui/rounded-button/rounded-button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { MessageModule } from 'primeng/message';
import { NgOptimizedImage, NgIf } from '@angular/common';
import { AuthStore } from '../stores/auth.store';

@Component({
  selector: 'gm-login',
  imports: [
    ReactiveFormsModule,
    RoundedButton,
    InputTextModule,
    PasswordModule,
    MessageModule,
    NgOptimizedImage,
    NgIf,
    RouterLink,
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class Login {
  private readonly _fb = inject(FormBuilder);
  private readonly _router = inject(Router);
  private readonly _notification = inject(NotificationService);
  protected readonly authStore = inject(AuthStore);

  protected readonly loginForm = this._fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    rememberMe: [false],
  });

  // Computed signals para validación en tiempo real
  protected emailError = computed(() => {
    const emailControl = this.loginForm.get('email');
    return emailControl?.invalid && emailControl?.touched
      ? 'Ingrese un correo válido'
      : null;
  });

  protected passwordError = computed(() => {
    const passwordControl = this.loginForm.get('password');
    if (!passwordControl?.invalid || !passwordControl?.touched) return null;
    if (passwordControl.errors?.['required']) return 'La contraseña es requerida';
    if (passwordControl.errors?.['minlength']) return 'Mínimo 6 caracteres';
    return null;
  });

  protected serverError = signal<string | null>(null);

  constructor() {
    // Auto-cargar email guardado si existe
    const savedEmail = localStorage.getItem('gm_remembered_email');
    if (savedEmail) {
      this.loginForm.patchValue({
        email: savedEmail,
        rememberMe: true,
      });
    }

    // Auto-focus en primer campo
    setTimeout(() => {
      const emailInput = document.getElementById('email') as HTMLInputElement;
      emailInput?.focus();
    }, 100);
  }

  protected onLogin(): void {
    // Marcar todos los campos como touched para mostrar errores
    if (this.loginForm.invalid) {
      Object.keys(this.loginForm.controls).forEach((key) => {
        this.loginForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.serverError.set(null);
    const credentials = this.loginForm.getRawValue();

    // Guardar email si "rememberMe" está activo
    if (credentials.rememberMe) {
      localStorage.setItem('gm_remembered_email', credentials.email);
    } else {
      localStorage.removeItem('gm_remembered_email');
    }

    this.authStore.login({ email: credentials.email, password: credentials.password }).subscribe({
      error: (err) => {
        const errorMsg = err?.error?.detail || 'Las credenciales proporcionadas son incorrectas.';
        this.serverError.set(errorMsg);
      },
    });
  }

  protected openForgotPassword(): void {
    this._router.navigate(['/auth/forgot-password']);
  }

  protected getEmailControl(): AbstractControl | null {
    return this.loginForm.get('email');
  }

  protected getPasswordControl(): AbstractControl | null {
    return this.loginForm.get('password');
  }
}
```

---

### 2. LOGIN.HTML - Versión Mejorada

```html
<main class="login-container">
  <div class="login-wrapper">
    <!-- SECCIÓN IZQUIERDA: Ilustración/Branding (Opcional pero recomendado) -->
    <div class="login-hero">
      <div class="hero-content">
        <div class="hero-icon">
          <i class="bx bx-plus-medical"></i>
        </div>
        <h2 class="hero-title">Gestión Médica Simplificada</h2>
        <p class="hero-subtitle">
          Accede a la plataforma #1 en Latinoamérica para gestión clínica integral.
        </p>

        <!-- Características destacadas -->
        <ul class="hero-features">
          <li><i class="bx bx-check"></i> Gestión segura de pacientes</li>
          <li><i class="bx bx-check"></i> Citas en línea integradas</li>
          <li><i class="bx bx-check"></i> Historial clínico centralizado</li>
        </ul>
      </div>
    </div>

    <!-- SECCIÓN DERECHA: Formulario -->
    <div class="login-form-section">
      <div class="login-card glass-morphism">
        <!-- Header -->
        <header class="login-header">
          <img ngSrc="logos/logo.png" alt="GestorMedic Logo" width="50" height="50" priority />
          <h1 class="yale-title">Bienvenido</h1>
          <p class="slate-subtitle">
            Ingrese sus credenciales para acceder a la plataforma.
          </p>
        </header>

        <!-- Error General -->
        @if (authStore.serverError() || serverError()) {
          <p-message
            severity="error"
            [text]="serverError() || authStore.serverError()"
            styleClass="login-server-error mb-4"
          />
        }

        <!-- Formulario -->
        <form [formGroup]="loginForm" (ngSubmit)="onLogin()" class="login-form">
          <!-- Email Field -->
          <div class="field-group">
            <label for="email" class="field-label">
              <span>Correo Institucional</span>
              @if (emailError()) {
                <span class="field-error-badge">{{ emailError() }}</span>
              }
            </label>
            <div class="input-wrapper">
              <i class="bx bx-envelope input-icon"></i>
              <input
                id="email"
                type="email"
                pInputText
                formControlName="email"
                placeholder="ejemplo@gestormedic.com"
                class="gm-input"
                [ngClass]="{ 'input-error': emailError() }"
                (blur)="getEmailControl()?.markAsTouched()"
                fluid
              />
            </div>
            @if (emailError()) {
              <small class="field-hint error">
                <i class="bx bx-info-circle"></i> {{ emailError() }}
              </small>
            }
          </div>

          <!-- Password Field -->
          <div class="field-group">
            <div class="field-label-row">
              <label for="password" class="field-label">
                <span>Contraseña</span>
                @if (passwordError()) {
                  <span class="field-error-badge">{{ passwordError() }}</span>
                }
              </label>
              <a href="#" class="forgot-password-link" (click)="openForgotPassword(); $event.preventDefault()">
                ¿Olvidó?
              </a>
            </div>
            <div class="input-wrapper">
              <i class="bx bx-lock-alt input-icon"></i>
              <p-password
                id="password"
                formControlName="password"
                [toggleMask]="true"
                [feedback]="false"
                placeholder="••••••••"
                inputStyleClass="gm-input"
                [ngClass]="{ 'input-error': passwordError() }"
                (blur)="getPasswordControl()?.markAsTouched()"
                fluid
              />
            </div>
            @if (passwordError()) {
              <small class="field-hint error">
                <i class="bx bx-info-circle"></i> {{ passwordError() }}
              </small>
            }
          </div>

          <!-- Remember Me -->
          <div class="field-group checkbox-group">
            <p-checkbox
              formControlName="rememberMe"
              [binary]="true"
              inputId="rememberMe"
              label="Recuérdame en este dispositivo"
            />
          </div>

          <!-- Submit Button -->
          <div class="form-actions">
            <gm-rounded-button
              label="Acceder al Sistema"
              [loading]="authStore.isLoading()"
              [disabled]="loginForm.invalid || authStore.isLoading()"
              severity="primary"
              (onClick)="onLogin()"
              styleClass="w-full"
            />
          </div>
        </form>

        <!-- Footer -->
        <footer class="login-footer">
          <div class="divider"></div>
          <p class="footer-text">
            ¿No tiene una cuenta?
            <a routerLink="/auth/register" class="text-energy"> Registrarse aquí</a>
          </p>

          <!-- Seguridad -->
          <div class="security-badge">
            <i class="bx bx-lock"></i>
            <span>Conexión segura con encriptación HTTPS</span>
          </div>
        </footer>
      </div>
    </div>
  </div>
</main>
```

---

### 3. LOGIN.SCSS - Versión Mejorada

```scss
// ============================================
// LOGIN CONTAINER & LAYOUT
// ============================================

.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: var(--p-slate-50);
  background-image:
    radial-gradient(circle at 20% 30%, rgba(var(--p-energy-500-rgb), 0.08) 0%, transparent 40%),
    radial-gradient(circle at 80% 70%, rgba(var(--p-yale-500-rgb), 0.08) 0%, transparent 40%);
  padding: 1rem;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.login-wrapper {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  width: 100%;
  max-width: 1000px;
  align-items: center;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}

// ============================================
// HERO SECTION (Izquierda)
// ============================================

.login-hero {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  
  @media (max-width: 768px) {
    display: none;
  }
}

.hero-content {
  text-align: center;
  animation: fadeInUp 0.6s ease-out;
}

.hero-icon {
  font-size: 4rem;
  color: var(--p-energy-500);
  margin-bottom: 1.5rem;
  animation: float 3s ease-in-out infinite;
}

.hero-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--p-yale-700);
  margin-bottom: 0.5rem;
}

.hero-subtitle {
  font-size: 0.95rem;
  color: var(--p-slate-600);
  margin-bottom: 2rem;
  line-height: 1.6;
}

.hero-features {
  list-style: none;
  padding: 0;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  li {
    font-size: 0.9rem;
    color: var(--p-slate-700);
    display: flex;
    align-items: center;
    gap: 0.5rem;

    i {
      color: var(--p-energy-500);
      font-size: 1.2rem;
    }
  }
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// ============================================
// FORM SECTION (Derecha)
// ============================================

.login-form-section {
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-card {
  width: 100%;
  max-width: 450px;
  padding: 2.5rem;
  border-radius: 16px;
  animation: slideInRight 0.5s ease-out;

  &.glass-morphism {
    background: rgba(255, 255, 255, 0.75);
    backdrop-filter: blur(20px) saturate(180%);
    border: 1px solid rgba(255, 255, 255, 0.5);
    box-shadow: 
      0 8px 32px rgba(var(--p-yale-900-rgb), 0.08),
      0 0 0 1px rgba(var(--p-energy-500-rgb), 0.1);
  }

  @media (max-width: 480px) {
    padding: 1.5rem;
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

// ============================================
// HEADER
// ============================================

.login-header {
  margin-bottom: 2rem;
  text-align: center;

  img {
    width: 50px;
    height: 50px;
    margin-bottom: 1rem;
  }

  .yale-title {
    color: var(--p-yale-700);
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0 0 0.5rem;
    letter-spacing: -0.02em;
  }

  .slate-subtitle {
    color: var(--p-slate-600);
    font-size: 0.95rem;
    line-height: 1.5;
    margin: 0;
  }
}

// ============================================
// FORM FIELDS
// ============================================

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;

  &.checkbox-group {
    flex-direction: row;
    align-items: center;
    gap: 0.5rem;
    margin: 0.5rem 0 1rem;
  }
}

.field-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: var(--p-yale-700);
  font-size: 0.875rem;
  font-weight: 600;
  letter-spacing: 0.3px;

  span { flex: 1; }
}

.field-label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;

  .field-label {
    margin: 0;
  }

  .forgot-password-link {
    font-size: 0.8rem;
    color: var(--p-energy-500);
    text-decoration: none;
    font-weight: 500;
    transition: all 0.2s ease;
    white-space: nowrap;

    &:hover {
      color: var(--p-energy-600);
      text-decoration: underline;
    }
  }
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;

  .input-icon {
    position: absolute;
    left: 1rem;
    color: var(--p-slate-400);
    font-size: 1.2rem;
    pointer-events: none;
    transition: color 0.2s ease;
  }
}

.gm-input,
.p-password {
  width: 100%;
  background: rgba(var(--p-slate-50-rgb), 0.7);
  border: 1.5px solid var(--p-slate-200);
  border-radius: 10px;
  padding: 0.75rem 1rem 0.75rem 2.75rem !important;
  font-size: 0.95rem;
  color: var(--p-slate-900);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  &::placeholder {
    color: var(--p-slate-400);
  }

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.9);
    border-color: var(--p-slate-300);
  }

  &:focus {
    background: white;
    border-color: var(--p-energy-500);
    box-shadow: 0 0 0 3px rgba(var(--p-energy-500-rgb), 0.1);
    outline: none;

    ~ .input-icon {
      color: var(--p-energy-500);
    }
  }

  &.input-error {
    border-color: var(--p-error-500);

    &:focus {
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
    }
  }

  &:disabled {
    background: var(--p-slate-100);
    color: var(--p-slate-400);
    cursor: not-allowed;
  }
}

// Override PrimeNG password spacing
:deep(.p-password) {
  width: 100%;
}

:deep(.p-password .p-password-input) {
  width: 100%;
  border: none;
  background: transparent;
  padding: 0;

  &:focus {
    box-shadow: none;
  }
}

.field-error-badge {
  background: rgba(239, 68, 68, 0.1);
  color: var(--p-error-600);
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-weight: 600;
}

.field-hint {
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  color: var(--p-slate-500);
  margin-top: 0.125rem;

  &.error {
    color: var(--p-error-600);
    font-weight: 500;
  }

  i {
    font-size: 0.95rem;
  }
}

.login-server-error {
  border-radius: 10px;
  padding: 1rem;
  background: rgba(239, 68, 68, 0.05) !important;
  border: 1px solid var(--p-error-200) !important;
  color: var(--p-error-800) !important;
}

// ============================================
// FORM ACTIONS
// ============================================

.form-actions {
  margin-top: 1.5rem;
  display: flex;
  gap: 0.75rem;

  gm-rounded-button {
    width: 100%;
  }
}

// ============================================
// FOOTER
// ============================================

.login-footer {
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.divider {
  height: 1px;
  background: linear-gradient(
    to right,
    transparent,
    var(--p-slate-200),
    transparent
  );
}

.footer-text {
  text-align: center;
  font-size: 0.85rem;
  color: var(--p-slate-600);
  margin: 0;

  a {
    color: var(--p-energy-500);
    text-decoration: none;
    font-weight: 600;
    transition: all 0.2s ease;

    &:hover {
      color: var(--p-energy-600);
      text-decoration: underline;
    }
  }
}

.security-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: var(--p-slate-500);
  padding: 0.75rem;
  background: rgba(var(--p-energy-500-rgb), 0.03);
  border-radius: 8px;

  i {
    font-size: 0.9rem;
    color: var(--p-energy-500);
  }
}

// ============================================
// RESPONSIVE
// ============================================

@media (max-width: 480px) {
  .login-wrapper {
    gap: 0;
  }

  .login-card {
    padding: 1.5rem 1.25rem;
    border-radius: 12px;
  }

  .login-header {
    margin-bottom: 1.5rem;

    .yale-title {
      font-size: 1.25rem;
    }

    .slate-subtitle {
      font-size: 0.85rem;
    }
  }

  .login-form {
    gap: 1.25rem;
  }

  .field-label-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.375rem;

    .forgot-password-link {
      align-self: flex-start;
    }
  }

  .form-actions {
    margin-top: 1rem;
  }
}
```

---

### 4. REGISTER.HTML - Versión Mejorada (Componente de Gate)

```html
<main class="gm-register-gate">
  <!-- Header con animación -->
  <header class="gate-header" [@fadeInUp]>
    <div class="logo-wrapper">
      <img ngSrc="logos/logo.png" alt="GestorMedic" width="50" height="50" priority />
    </div>
    <h1 class="gate-title">Elige tu perfil</h1>
    <p class="gate-subtitle">
      Selecciona la opción que mejor se adapta a tu rol en GestorMedic.
    </p>
  </header>

  <!-- Grid de roles con animaciones -->
  <div class="role-grid">
    @for (role of roles(); track role.id; let i = $index) {
      <article 
        class="role-card" 
        [routerLink]="role.route"
        [@slideInUp]="{ value: i }"
        tabindex="0"
        (keydown.enter)="$event.preventDefault(); navigate(role.route)"
      >
        <!-- Glow effect -->
        <div class="role-card__glow"></div>

        <!-- Header con tag -->
        <header class="role-card__header">
          <span class="role-tag">{{ role.tag }}</span>
          <div class="role-icon">
            <i class="bx" [class]="role.icon"></i>
          </div>
        </header>

        <!-- Body -->
        <div class="role-card__body">
          <h3 class="role-title">{{ role.title }}</h3>
          <p class="role-desc">{{ role.desc }}</p>
        </div>

        <!-- Footer con CTA animado -->
        <footer class="role-card__footer">
          <span class="role-action">
            Iniciar registro
            <i class="bx bx-right-arrow-alt"></i>
          </span>
        </footer>
      </article>
    }
  </div>

  <!-- Footer global -->
  <footer class="gate-footer">
    <p>¿Ya existe tu cuenta? 
      <a routerLink="/auth/login" class="login-link">Inicia sesión aquí</a>
    </p>
  </footer>
</main>
```

---

### 5. REGISTER.SCSS - Versión Mejorada

```scss
// ============================================
// REGISTER GATE MAIN LAYOUT
// ============================================

.gm-register-gate {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  padding: 3rem 1rem;
  background-color: var(--p-slate-50);
  background-image:
    radial-gradient(circle at 20% 30%, rgba(var(--p-energy-500-rgb), 0.08) 0%, transparent 40%),
    radial-gradient(circle at 80% 70%, rgba(var(--p-yale-500-rgb), 0.08) 0%, transparent 40%);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

// ============================================
// HEADER
// ============================================

.gate-header {
  text-align: center;
  margin-bottom: 3.5rem;
  max-width: 600px;
}

.logo-wrapper {
  margin-bottom: 1.5rem;
  
  img {
    width: 50px;
    height: 50px;
    animation: slideDown 0.6s ease-out;
  }
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.gate-title {
  font-size: 2rem;
  font-weight: 800;
  color: var(--p-yale-700);
  margin: 0 0 0.75rem;
  letter-spacing: -0.02em;
}

.gate-subtitle {
  font-size: 1rem;
  color: var(--p-slate-600);
  line-height: 1.6;
  margin: 0;
  font-weight: 400;
}

// ============================================
// ROLE GRID
// ============================================

.role-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  width: 100%;
  max-width: 1100px;
  margin-bottom: 3rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}

// ============================================
// ROLE CARD
// ============================================

.role-card {
  position: relative;
  padding: 2rem;
  border-radius: 16px;
  background: white;
  border: 1.5px solid var(--p-slate-150);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.23, 1, 0.320, 1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  min-height: 350px;
  box-shadow: 0 2px 8px rgba(var(--p-yale-900-rgb), 0.04);

  // Glow effect en hover
  &:hover {
    transform: translateY(-8px);
    border-color: var(--p-energy-400);
    box-shadow: 
      0 12px 32px rgba(var(--p-energy-500-rgb), 0.15),
      0 0 20px rgba(var(--p-energy-500-rgb), 0.08);

    .role-card__glow {
      opacity: 1;
    }

    .role-icon {
      transform: scale(1.1) rotate(-5deg);
    }

    .role-action {
      gap: 0.75rem;

      i {
        transform: translateX(4px);
      }
    }
  }

  // Focus state para accesibilidad
  &:focus {
    outline: none;
    box-shadow: 
      0 0 0 3px rgba(var(--p-energy-500-rgb), 0.1),
      0 12px 32px rgba(var(--p-energy-500-rgb), 0.15);
  }

  // Active state
  &:active {
    transform: translateY(-4px);
  }
}

// Glow effect (SVG alternativa)
.role-card__glow {
  position: absolute;
  top: -50%;
  right: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(
    circle,
    rgba(var(--p-energy-500-rgb), 0.3) 0%,
    transparent 70%
  );
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

// Header: Tag + Icon
.role-card__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  position: relative;
  z-index: 1;
}

.role-tag {
  display: inline-block;
  background: linear-gradient(135deg, rgba(var(--p-energy-500-rgb), 0.1), rgba(var(--p-yale-500-rgb), 0.1));
  color: var(--p-energy-600);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 1px;
  padding: 0.375rem 0.75rem;
  border-radius: 6px;
  text-transform: uppercase;
  text-align: center;
  min-width: fit-content;
  border: 1px solid rgba(var(--p-energy-500-rgb), 0.2);
}

.role-icon {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(var(--p-energy-500-rgb), 0.1), rgba(var(--p-energy-500-rgb), 0.05));
  border-radius: 12px;
  font-size: 2rem;
  color: var(--p-energy-500);
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  flex-shrink: 0;

  i {
    display: block;
  }
}

// Body: Title + Description
.role-card__body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.role-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--p-yale-700);
  margin: 0;
  line-height: 1.3;
}

.role-desc {
  font-size: 0.9rem;
  color: var(--p-slate-600);
  line-height: 1.6;
  margin: 0;
  font-weight: 400;
}

// Footer: Call-to-Action
.role-card__footer {
  margin-top: auto;
  position: relative;
  z-index: 1;
}

.role-action {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--p-energy-500);
  font-weight: 600;
  font-size: 0.95rem;
  transition: gap 0.3s ease;

  i {
    font-size: 1.1rem;
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
}

// ============================================
// GLOBAL FOOTER
// ============================================

.gate-footer {
  text-align: center;
  font-size: 0.9rem;
  color: var(--p-slate-600);

  .login-link {
    color: var(--p-energy-500);
    text-decoration: none;
    font-weight: 600;
    transition: all 0.2s ease;

    &:hover {
      color: var(--p-energy-600);
      text-decoration: underline;
    }
  }
}

// ============================================
// ANIMACIONES REUTILIZABLES
// ============================================

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// Staggered animations
@for $i from 0 through 2 {
  .role-card:nth-child(#{$i + 1}) {
    animation: slideInUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) #{$i * 0.1}s both;
  }
}

// ============================================
// RESPONSIVE
// ============================================

@media (max-width: 768px) {
  .gm-register-gate {
    padding: 2rem 1rem;
  }

  .gate-header {
    margin-bottom: 2.5rem;
  }

  .gate-title {
    font-size: 1.5rem;
  }

  .gate-subtitle {
    font-size: 0.9rem;
  }

  .role-grid {
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .role-card {
    min-height: 280px;
    padding: 1.5rem;
    gap: 1rem;
  }

  .role-icon {
    width: 56px;
    height: 56px;
    font-size: 1.75rem;
  }

  .role-title {
    font-size: 1.1rem;
  }
}

@media (max-width: 480px) {
  .gate-title {
    font-size: 1.25rem;
  }

  .role-card {
    min-height: auto;
    padding: 1.25rem;
  }

  .role-card__header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .role-tag {
    width: 100%;
  }
}
```

---

### 6. REGISTER-CLINIC.TS - Versión Mejorada (Multi-Step)

```typescript
import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { StepsModule } from 'primeng/steps';
import { ProgressBarModule } from 'primeng/progressbar';
import { AuthStore } from '@features/auth/stores/auth.store';
import { Auth } from '@core/services/auth';
import { NotificationService } from '@core/services/notification';
import { environment } from '@env/environment';
import { RoundedButton } from '@shared/ui/rounded-button/rounded-button';
import { NgOptimizedImage, NgIf } from '@angular/common';

@Component({
  selector: 'gm-register-clinic',
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    PasswordModule,
    StepsModule,
    ProgressBarModule,
    RoundedButton,
    RouterLink,
    NgOptimizedImage,
    NgIf,
  ],
  templateUrl: './register-clinic.html',
  styleUrl: './register-clinic.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class RegisterClinic {
  private fb = inject(FormBuilder);
  private authService = inject(Auth);
  private authStore = inject(AuthStore);
  private http = inject(HttpClient);
  private router = inject(Router);
  private notification = inject(NotificationService);

  // Estado del formulario multi-paso
  activeStep = signal(0);
  isProcessing = signal(false);

  // Fórmulario dividido en secciones
  step1Form = this.fb.nonNullable.group({
    admin_name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  step2Form = this.fb.nonNullable.group({
    clinic_name: ['', [Validators.required, Validators.minLength(3)]],
    nit_ruc: ['', [Validators.required, Validators.pattern(/^\d{5,13}$/)]],
    phone: ['', [Validators.required, Validators.pattern(/^[+\d\s\-()]+$/)]],
    address: ['', [Validators.required, Validators.minLength(5)]],
  });

  step3Form = this.fb.nonNullable.group({
    acceptTerms: [false, Validators.requiredTrue],
    acceptPrivacy: [false, Validators.requiredTrue],
  });

  // Computed signals para progreso visual
  progressPercentage = computed(() => ((this.activeStep() + 1) / 3) * 100);

  formSteps = [
    { label: 'Datos Personales', icon: 'pi pi-user' },
    { label: 'Datos de Clínica', icon: 'pi pi-building' },
    { label: 'Confirmación', icon: 'pi pi-check' },
  ];

  // Validación por paso
  get isStep1Valid(): boolean {
    return this.step1Form.valid;
  }

  get isStep2Valid(): boolean {
    return this.step2Form.valid;
  }

  get isStep3Valid(): boolean {
    return this.step3Form.valid;
  }

  protected getPasswordStrength(password: string): { strength: string; percentage: number } {
    let strength = 0;
    if (password.match(/[a-z]/)) strength += 25;
    if (password.match(/[A-Z]/)) strength += 25;
    if (password.match(/[0-9]/)) strength += 25;
    if (password.match(/[@$!%*?&]/)) strength += 25;

    return {
      strength:
        strength <= 25
          ? 'Débil'
          : strength <= 50
            ? 'Regular'
            : strength <= 75
              ? 'Buena'
              : 'Excelente',
      percentage: strength,
    };
  }

  nextStep(): void {
    if (this.activeStep() === 0 && this.isStep1Valid) {
      this.activeStep.set(1);
    } else if (this.activeStep() === 1 && this.isStep2Valid) {
      this.activeStep.set(2);
    }
  }

  previousStep(): void {
    if (this.activeStep() > 0) {
      this.activeStep.update((s) => s - 1);
    }
  }

  async submitRegistration(): Promise<void> {
    if (!this.isStep3Valid) {
      this.notification
        .builder()
        .warn()
        .summary('Debes aceptar los términos y privacidad')
        .show();
      return;
    }

    this.isProcessing.set(true);

    try {
      const formData = {
        ...this.step1Form.getRawValue(),
        ...this.step2Form.getRawValue(),
      };

      // PASO 1: Crear usuario
      const userPayload = {
        email: formData.email,
        username: formData.email.split('@')[0],
        password: formData.password,
        first_name: formData.admin_name,
        role_id: 2,
      };

      await firstValueFrom(this.authService.register(userPayload));

      // PASO 2: Login
      const loginRes = await firstValueFrom(
        this.authService.login({
          username: userPayload.email,
          password: userPayload.password,
        }),
      );

      localStorage.setItem('gm_token', loginRes.access_token);

      // PASO 3: Crear clínica
      const clinicPayload = {
        name: formData.clinic_name,
        nit_ruc: formData.nit_ruc,
        address: formData.address,
        phone: formData.phone,
        logo_url: null,
        plan: 'free',
      };

      await firstValueFrom(this.http.post(`${environment.apiUrl}/clinics/`, clinicPayload));

      this.notification
        .builder()
        .success()
        .summary('¡Bienvenido!')
        .detail('Tu clínica ha sido registrada correctamente.')
        .show();

      this.authStore.fetchUser();
    } catch (error: any) {
      this.notification
        .builder()
        .error()
        .summary('Error en el registro')
        .detail(error?.error?.detail || 'Por favor, intenta nuevamente.')
        .show();
    } finally {
      this.isProcessing.set(false);
    }
  }
}
```

---

### 7. REGISTER-CLINIC.HTML - Versión Mejorada (Multi-Step)

```html
<main class="gm-onboarding-layout">
  <div class="onboarding-container">
    <!-- Barra de progreso -->
    <div class="progress-section">
      <p-progress-bar 
        [value]="progressPercentage()" 
        styleClass="progress-custom"
      />
      <p class="progress-text">
        Paso {{ activeStep() + 1 }} de 3
      </p>
    </div>

    <!-- Header -->
    <header class="onboarding-header">
      <div class="brand-logo">
        <img ngSrc="logos/logo.png" alt="GestorMedic Logo" width="40" height="40" priority />
      </div>
      <h1 class="title">{{ formSteps[activeStep()].label }}</h1>
      <p class="subtitle">
        @switch (activeStep()) {
          @case (0) {
            Información de tu usuario administrador.
          }
          @case (1) {
            Datos institucionales de tu clínica.
          }
          @case (2) {
            Revisa y confirma tu registro.
          }
        }
      </p>
    </header>

    <!-- Contenedor de formulario responsivo -->
    <div class="form-wrapper">
      <!-- PASO 1: Datos Personales -->
      @if (activeStep() === 0) {
        <form [formGroup]="step1Form" class="onboarding-form" [@fadeInUp]>
          <fieldset class="form-section">
            <legend><i class="bx bx-user-pin"></i> Representante Legal</legend>

            <!-- Nombre Completo -->
            <div class="field-group">
              <label for="admin_name">Nombre Completo</label>
              <div class="input-container">
                <i class="bx bx-user"></i>
                <input
                  pInputText
                  id="admin_name"
                  formControlName="admin_name"
                  placeholder="Ej. Dr. Carlos Méndez"
                  (blur)="step1Form.get('admin_name')?.markAsTouched()"
                />
              </div>
              <!-- Error inline -->
              @let control = step1Form.get('admin_name');
              @if (control?.invalid && control?.touched) {
                <small class="field-error">
                  <i class="bx bx-info-circle"></i>
                  @if (control.errors?.['required']) {
                    El nombre es requerido
                  }
                  @if (control.errors?.['minlength']) {
                    Mínimo 3 caracteres
                  }
                </small>
              }
            </div>

            <!-- Email -->
            <div class="field-group">
              <label for="email">Correo Institucional</label>
              <div class="input-container">
                <i class="bx bx-envelope"></i>
                <input
                  pInputText
                  id="email"
                  type="email"
                  formControlName="email"
                  placeholder="director@clinica.com"
                  (blur)="step1Form.get('email')?.markAsTouched()"
                />
              </div>
              @let emailControl = step1Form.get('email');
              @if (emailControl?.invalid && emailControl?.touched) {
                <small class="field-error">
                  <i class="bx bx-info-circle"></i>
                  Ingrese un correo válido
                </small>
              }
            </div>

            <!-- Password con indicador de fortaleza -->
            <div class="field-group">
              <lab for="password">Clave de Seguridad</label>
              <div class="input-container">
                <i class="bx bx-lock-alt"></i>
                <p-password
                  id="password"
                  formControlName="password"
                  [toggleMask]="true"
                  [feedback]="true"
                  weakLabel="Débil"
                  mediumLabel="Normal"
                  strongLabel="Fuerte"
                  placeholder="Mínimo 8 caracteres"
                  styleClass="gm-password-full"
                />
              </div>
              @let pwControl = step1Form.get('password');
              @if (pwControl?.invalid && pwControl?.touched) {
                <small class="field-error">
                  <i class="bx bx-info-circle"></i>
                  Mínimo 8 caracteres con mayúsculas y números
                </small>
              }
            </div>
          </fieldset>
        </form>
      }

      <!-- PASO 2: Datos de Clínica -->
      @if (activeStep() === 1) {
        <form [formGroup]="step2Form" class="onboarding-form" [@fadeInUp]>
          <fieldset class="form-section">
            <legend><i class="bx bx-buildings"></i> Infraestructura Institucional</legend>

            <!-- Razón Social -->
            <div class="field-group">
              <label for="clinic_name">Razón Social o Nombre Comercial</label>
              <div class="input-container">
                <i class="bx bx-clinic"></i>
                <input
                  pInputText
                  id="clinic_name"
                  formControlName="clinic_name"
                  placeholder="Centro Médico San Lucas"
                  (blur)="step2Form.get('clinic_name')?.markAsTouched()"
                />
              </div>
              @let clinicControl = step2Form.get('clinic_name');
              @if (clinicControl?.invalid && clinicControl?.touched) {
                <small class="field-error">
                  <i class="bx bx-info-circle"></i>
                  Mínimo 3 caracteres
                </small>
              }
            </div>

            <!-- NIT -->
            <div class="field-group">
              <label for="nit_ruc">NIT (Identificación Tributaria)</label>
              <div class="input-container">
                <i class="bx bx-id-card"></i>
                <input
                  pInputText
                  id="nit_ruc"
                  formControlName="nit_ruc"
                  placeholder="1234567890"
                  (blur)="step2Form.get('nit_ruc')?.markAsTouched()"
                />
              </div>
              @let nitControl = step2Form.get('nit_ruc');
              @if (nitControl?.invalid && nitControl?.touched) {
                <small class="field-error">
                  <i class="bx bx-info-circle"></i>
                  NIT debe ser válido
                </small>
              }
            </div>

            <!-- Teléfono -->
            <div class="field-group">
              <label for="phone">Teléfono Central</label>
              <div class="input-container">
                <i class="bx bx-phone"></i>
                <input
                  pInputText
                  id="phone"
                  formControlName="phone"
                  placeholder="Ej. +591 22445566"
                  (blur)="step2Form.get('phone')?.markAsTouched()"
                />
              </div>
              @let phoneControl = step2Form.get('phone');
              @if (phoneControl?.invalid && phoneControl?.touched) {
                <small class="field-error">
                  <i class="bx bx-info-circle"></i>
                  Teléfono inválido
                </small>
              }
            </div>

            <!-- Dirección -->
            <div class="field-group">
              <label for="address">Dirección Física</label>
              <div class="input-container">
                <i class="bx bx-map"></i>
                <input
                  pInputText
                  id="address"
                  formControlName="address"
                  placeholder="Calle Principal 123, Apt 4B"
                  (blur)="step2Form.get('address')?.markAsTouched()"
                />
              </div>
              @let addressControl = step2Form.get('address');
              @if (addressControl?.invalid && addressControl?.touched) {
                <small class="field-error">
                  <i class="bx bx-info-circle"></i>
                  Mínimo 5 caracteres
                </small>
              }
            </div>
          </fieldset>
        </form>
      }

      <!-- PASO 3: Confirmación -->
      @if (activeStep() === 2) {
        <form [formGroup]="step3Form" class="onboarding-form" [@fadeInUp]>
          <div class="review-section">
            <h3 class="review-title">Revisa tu información</h3>

            <!-- Resumen de datos -->
            <div class="review-groups">
              <div class="review-group">
                <h4 class="group-title">Datos del Representante</h4>
                <dl>
                  <dt>Nombre:</dt>
                  <dd>{{ step1Form.get('admin_name')?.value }}</dd>
                  <dt>Correo:</dt>
                  <dd>{{ step1Form.get('email')?.value }}</dd>
                </dl>
              </div>

              <div class="review-group">
                <h4 class="group-title">Datos de la Clínica</h4>
                <dl>
                  <dt>Razón Social:</dt>
                  <dd>{{ step2Form.get('clinic_name')?.value }}</dd>
                  <dt>NIT:</dt>
                  <dd>{{ step2Form.get('nit_ruc')?.value }}</dd>
                  <dt>Teléfono:</dt>
                  <dd>{{ step2Form.get('phone')?.value }}</dd>
                  <dt>Dirección:</dt>
                  <dd>{{ step2Form.get('address')?.value }}</dd>
                </dl>
              </div>
            </div>

            <!-- Checkboxes aceptación -->
            <div class="acceptance-section">
              <div class="field-group checkbox">
                <p-checkbox
                  [binary]="true"
                  formControlName="acceptTerms"
                  inputId="acceptTerms"
                  label="Acepto los términos y condiciones de servicio"
                />
              </div>

              <div class="field-group checkbox">
                <p-checkbox
                  [binary]="true"
                  formControlName="acceptPrivacy"
                  inputId="acceptPrivacy"
                  label="Acepto la política de privacidad y protección de datos"
                />
              </div>
            </div>
          </div>
        </form>
      }
    </div>

    <!-- Botones de navegación -->
    <div class="form-navigation">
      @if (activeStep() > 0) {
        <gm-rounded-button
          label="← Anterior"
          severity="secondary"
          outlined
          (onClick)="previousStep()"
        />
      }

      @if (activeStep() < 2) {
        <gm-rounded-button
          label="Siguiente →"
          [disabled]="!isStep1Valid && activeStep() === 0 || !isStep2Valid && activeStep() === 1"
          severity="primary"
          (onClick)="nextStep()"
        />
      }

      @if (activeStep() === 2) {
        <gm-rounded-button
          label="Crear Cuenta"
          [loading]="isProcessing()"
          [disabled]="!isStep3Valid || isProcessing()"
          severity="primary"
          (onClick)="submitRegistration()"
        />
      }
    </div>
  </div>
</main>
```

---

## 📋 Implementación Paso a Paso

### Fase 1: Preparación (1-2 horas)

```bash
# 1. Actualizar dependencias PrimeNG si es necesario
npm update primeng

# 2. Verificar componentes disponibles
# Revisar que tengas acceso a: p-password, p-checkbox, p-message, p-button, p-progress-bar, p-steps

# 3. Backup de archivos actuales
# Hacer git commit de estado actual
git add .
git commit -m "Backup: antes de mejoras UI/UX auth module"
```

### Fase 2: Refactor Login (2-3 horas)

1. **Actualizar `login.ts`** con:
   - Computed signals para validación
   - Auto-focus en primer campo
   - Remember email functionality
   - Mejor manejo de errores

2. **Actualizar `login.html`** con:
   - Sección hero (izquierda)
   - Validación inline
   - Error badges
   - Security badge

3. **Refactorizar `login.scss`** con:
   - Grid layout split-screen
   - Animaciones de entrada
   - Estados mejorados (hover, focus)
   - Responsive design

### Fase 3: Refactor Register Gate (1-2 horas)

1. **Actualizar `register.scss`** con:
   - Cards interactivos mejorados
   - Glow effects en hover
   - Animaciones staggered
   - Iconos en contenedores

2. **Mantener `register.ts` y `register.html`** casi igual (solo CSS)

### Fase 4: Refactor Register Clínica a Multi-Step (3-4 horas)

1. **Crear `register-clinic.ts`** multi-step con:
   - Formularioseparados por paso
   - Validación progresiva
   - Computed signals para progreso

2. **Refactorizar `register-clinic.html`** con:
   - Barra de progreso
   - Steps dinámicos
   - Navegación anterior/siguiente

3. **Crear `register-clinic.scss`** con:
   - Animaciones de transición entre pasos
   - Estilos mejorados

### Fase 5: Testing (1 hora)

```bash
# Ejecutar servidor de desarrollo
bun start

# Probar:
# - Login con validación
# - Olvidar contraseña (navegación)
# - Registro de roles (Gate)
# - Registro clínica multi-step
# - Responsive en móvil
# - Accesibilidad (tabindex, etc.)
```

---

## 🎯 Checklist de Implementación

- [ ] Actualizar `login.ts` con validación avanzada
- [ ] Refactorizar `login.html` con split-screen
- [ ] Mejorar `login.scss` con animaciones
- [ ] Pulir `register.scss` con cards interactivos
- [ ] Crear multi-step en `register-clinic.ts`
- [ ] Actualizar `register-clinic.html` con pasos
- [ ] Mejorar `register-clinic.scss`
- [ ] Implementar página "Olvidar Contraseña"
- [ ] Testear en desktop y móvil
- [ ] Validar accesibilidad (WCAG 2.1 AA)

---

## 📚 Referencias y Recursos

- **PrimeNG Components**: https://primeng.org/
- **Aura Theme (PrimeNG)**: https://primeng.org/aura
- **Angular Signals**: https://angular.io/guide/signals
- **Accesibilidad Web**: https://www.w3.org/WAI/WCAG21/quickref/
- **SaaS Design Patterns**: https://www.refactoring-ui.com/
- **Modern CSS**: https://web.dev/

---

**Documento generado**: 12 de abril, 2026  
**Última actualización**: Aplicable a GestorMedic v1.0+
