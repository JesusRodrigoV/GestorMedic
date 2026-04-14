# 🛠️ Guía de Componentes y Utilidades - UI Auth Module

**Ejemplos prácticos de componentes reutilizables, mixins SCSS y patrones para optimizar el módulo /auth.**

---

## 📑 Tabla de Contenidos

1. [Mixins y Utilidades SCSS](#mixins-y-utilidades-scss)
2. [Componentes Reutilizables Recomendados](#componentes-reutilizables-recomendados)
3. [Patrones de Validación](#patrones-de-validación)
4. [Animaciones Angular](#animaciones-angular)
5. [Variables CSS Globales](#variables-css-globales)

---

## 🎨 Mixins y Utilidades SCSS

### 1. Mixin para Tipografía

**Archivo recomendado**: `src/styles/typography.scss`

```scss
// ============================================
// TIPOGRAFÍA MIXIN
// ============================================

// Escalas de tipografía predefinidas
$font-scales: (
  'display': (
    'size': 2.25rem,
    'weight': 800,
    'line-height': 1.2,
  ),
  'h1': (
    'size': 1.875rem,
    'weight': 700,
    'line-height': 1.3,
  ),
  'h2': (
    'size': 1.5rem,
    'weight': 700,
    'line-height': 1.3,
  ),
  'h3': (
    'size': 1.25rem,
    'weight': 600,
    'line-height': 1.4,
  ),
  'body-lg': (
    'size': 1.0625rem,
    'weight': 500,
    'line-height': 1.5,
  ),
  'body': (
    'size': 1rem,
    'weight': 500,
    'line-height': 1.5,
  ),
  'body-sm': (
    'size': 0.875rem,
    'weight': 500,
    'line-height': 1.6,
  ),
  'caption': (
    'size': 0.75rem,
    'weight': 400,
    'line-height': 1.6,
  ),
);

@mixin typography($scale-name, $color: inherit) {
  $scale: map-get($font-scales, $scale-name);

  @if $scale == null {
    @error "Escala de tipografía '#{$scale-name}' no existe.";
  }

  font-size: map-get($scale, 'size');
  font-weight: map-get($scale, 'weight');
  line-height: map-get($scale, 'line-height');
  color: $color;
}

// Uso:
// .title {
//   @include typography('h1', var(--p-yale-700));
// }
```

### 2. Mixin para Inputs Estilizados

**Archivo recomendado**: `src/styles/inputs.scss`

```scss
// ============================================
// INPUTS UNIVERSALES MIXIN
// ============================================

@mixin field-input($bg: rgba(var(--p-slate-50-rgb), 0.7)) {
  width: 100%;
  background: $bg;
  border: 1.5px solid var(--p-slate-200);
  border-radius: 10px;
  padding: 0.75rem 1rem;
  font-size: 0.95rem;
  color: var(--p-slate-900);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: inherit;

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
  }

  &:disabled {
    background: var(--p-slate-100);
    color: var(--p-slate-400);
    cursor: not-allowed;
    opacity: 0.6;
  }

  &.error {
    border-color: var(--p-error-500);

    &:focus {
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
      border-color: var(--p-error-500);
    }
  }
}

// Uso:
// input {
//   @include field-input();
// }
```

### 3. Mixin para Botones Base

**Archivo recomendado**: `src/styles/buttons.scss`

```scss
// ============================================
// BOTONES BASE MIXIN
// ============================================

@mixin btn-base($size: 'md') {
  $sizes: (
    'sm': (
      'padding': 0.5rem 1rem,
      'font-size': 0.875rem,
      'border-radius': 8px,
    ),
    'md': (
      'padding': 0.75rem 1.5rem,
      'font-size': 0.95rem,
      'border-radius': 10px,
    ),
    'lg': (
      'padding': 1rem 2rem,
      'font-size': 1rem,
      'border-radius': 12px,
    ),
  );

  $size-config: map-get($sizes, $size);

  padding: map-get($size-config, 'padding');
  font-size: map-get($size-config, 'font-size');
  border-radius: map-get($size-config, 'border-radius');
  border: 1.5px solid transparent;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:span, &:i {
    line-height: 1;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

@mixin btn-primary() {
  @include btn-base();
  background: var(--p-energy-500);
  color: white;
  border-color: var(--p-energy-500);

  &:hover:not(:disabled) {
    background: var(--p-energy-600);
    border-color: var(--p-energy-600);
    box-shadow: 0 4px 12px rgba(var(--p-energy-500-rgb), 0.3);
  }

  &:active:not(:disabled) {
    transform: scale(0.98);
  }
}

@mixin btn-secondary() {
  @include btn-base();
  background: transparent;
  color: var(--p-slate-700);
  border-color: var(--p-slate-200);

  &:hover:not(:disabled) {
    background: var(--p-slate-50);
    border-color: var(--p-slate-300);
  }
}

// Uso:
// button {
//   @include btn-primary();
// }
```

### 4. Mixin para Animaciones Comunes

**Archivo recomendado**: `src/styles/animations.scss`

```scss
// ============================================
// ANIMACIONES REUTILIZABLES
// ============================================

@mixin animation($name, $duration: 0.3s, $timing: ease-out) {
  animation: $name $duration $timing;
}

// Fade in
@mixin fadeIn($duration: 0.3s) {
  animation: fadeIn $duration ease-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
}

// Fade + Slide Up
@mixin fadeInUp($duration: 0.5s) {
  animation: fadeInUp $duration cubic-bezier(0.34, 1.56, 0.64, 1);

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
}

// Slide from right
@mixin slideInRight($duration: 0.4s) {
  animation: slideInRight $duration ease-out;

  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(50px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
}

// Pulse effect
@mixin pulse($duration: 2s) {
  animation: pulse $duration cubic-bezier(0.4, 0, 0.6, 1) infinite;

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
}

// Float effect
@mixin float($distance: 10px, $duration: 3s) {
  animation: float $duration ease-in-out infinite;

  @keyframes float {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-$distance);
    }
  }
}

// Shine effect (para loaders)
@mixin shimmer($duration: 2s) {
  background: linear-gradient(
    90deg,
    var(--p-slate-200) 0%,
    var(--p-slate-100) 50%,
    var(--p-slate-200) 100%
  );
  background-size: 200% 100%;
  animation: shimmer $duration infinite;

  @keyframes shimmer {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
}

// Uso:
// .my-element {
//   @include fadeInUp(0.6s);
// }
```

---

## 🧩 Componentes Reutilizables Recomendados

### 1. Componente: Form Field Wrapper

**Archivo**: `src/app/shared/components/form-field-wrapper/form-field-wrapper.ts`

```typescript
import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

interface FieldError {
  type: string;
  message: string;
}

@Component({
  selector: 'gm-form-field',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="form-field-wrapper">
      <div class="field-header">
        <label [for]="id()" class="field-label">
          <span>{{ label() }}</span>
          @if (required()) {
            <span class="required-badge">*</span>
          }
          @if (hint()) {
            <span class="field-hint-text">{{ hint() }}</span>
          }
        </label>
      </div>

      <div class="field-input-wrapper">
        <ng-content />
      </div>

      @if (errors()?.length) {
        <div class="field-errors">
          @for (error of errors(); track error.type) {
            <small class="field-error">
              <i class="bx bx-info-circle"></i>
              {{ error.message }}
            </small>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .form-field-wrapper {
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
    }

    .field-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .field-label {
      display: flex;
      gap: 0.5rem;
      color: var(--p-yale-700);
      font-size: 0.875rem;
      font-weight: 600;
      margin: 0;
    }

    .required-badge {
      color: var(--p-error-500);
    }

    .field-hint-text {
      font-size: 0.75rem;
      color: var(--p-slate-500);
      font-weight: 400;
    }

    .field-input-wrapper {
      width: 100%;
    }

    .field-errors {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .field-error {
      font-size: 0.8rem;
      color: var(--p-error-600);
      display: flex;
      align-items: center;
      gap: 0.375rem;
      margin-top: 0.125rem;

      i {
        font-size: 0.95rem;
      }
    }
  `],
})
export class FormFieldWrapper {
  id = input<string>('');
  label = input<string>('');
  hint = input<string>('');
  required = input<boolean>(false);
  errors = input<FieldError[] | null>(null);
}
```

**Uso**:

```html
<gm-form-field 
  id="email" 
  label="Correo Electrónico"
  hint="Usaremos esto para recuperación de contraseña"
  required
  [errors]="emailErrors()"
>
  <input pInputText type="email" id="email" />
</gm-form-field>
```

---

### 2. Componente: Password Strength Indicator

**Archivo**: `src/app/shared/components/password-strength-indicator/password-strength-indicator.ts`

```typescript
import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export type PasswordStrength = 'weak' | 'fair' | 'good' | 'strong';

@Component({
  selector: 'gm-password-strength',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="strength-wrapper">
      <div class="strength-bar">
        <div 
          class="strength-fill" 
          [ngClass]="'strength-' + strength()"
          [style.width.%]="strengthPercentage()"
        />
      </div>
      <span class="strength-label" [ngClass]="'label-' + strength()">
        {{ strengthLabel() }}
      </span>
    </div>

    @if (showRequirements()) {
      <ul class="requirements-list">
        <li [class.met]="hasLowercase()">
          <i class="bx" [class.bx-check]="hasLowercase()" [class.bx-x]="!hasLowercase()"></i>
          Minúsculas (a-z)
        </li>
        <li [class.met]="hasUppercase()">
          <i class="bx" [class.bx-check]="hasUppercase()" [class.bx-x]="!hasUppercase()"></i>
          Mayúsculas (A-Z)
        </li>
        <li [class.met]="hasNumbers()">
          <i class="bx" [class.bx-check]="hasNumbers()" [class.bx-x]="!hasNumbers()"></i>
          Números (0-9)
        </li>
        <li [class.met]="hasSpecialChars()">
          <i class="bx" [class.bx-check]="hasSpecialChars()" [class.bx-x]="!hasSpecialChars()"></i>
          Caracteres especiales (@$!%*?&)
        </li>
      </ul>
    }
  `,
  styles: [`
    .strength-wrapper {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .strength-bar {
      flex: 1;
      height: 6px;
      background: var(--p-slate-200);
      border-radius: 3px;
      overflow: hidden;
    }

    .strength-fill {
      height: 100%;
      transition: all 0.3s ease;

      &.strength-weak {
        background: var(--p-error-500);
        width: 25%;
      }

      &.strength-fair {
        background: var(--p-warning-500);
        width: 50%;
      }

      &.strength-good {
        background: var(--p-info-500);
        width: 75%;
      }

      &.strength-strong {
        background: var(--p-success-500);
        width: 100%;
      }
    }

    .strength-label {
      font-size: 0.875rem;
      font-weight: 600;
      min-width: 80px;

      &.label-weak { color: var(--p-error-600); }
      &.label-fair { color: var(--p-warning-600); }
      &.label-good { color: var(--p-info-600); }
      &.label-strong { color: var(--p-success-600); }
    }

    .requirements-list {
      list-style: none;
      padding: 0;
      margin: 1rem 0 0;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;

      li {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.85rem;
        color: var(--p-slate-600);

        i {
          font-size: 1rem;
          width: 1rem;
          display: flex;
          align-items: center;

          &.bx-check { color: var(--p-success-500); }
          &.bx-x { color: var(--p-slate-300); }
        }

        &.met {
          color: var(--p-success-600);

          i { color: var(--p-success-500); }
        }
      }
    }
  `],
})
export class PasswordStrengthIndicator {
  password = input<string>('');
  showRequirements = input<boolean>(false);

  hasLowercase = computed(() => /[a-z]/.test(this.password()));
  hasUppercase = computed(() => /[A-Z]/.test(this.password()));
  hasNumbers = computed(() => /[0-9]/.test(this.password()));
  hasSpecialChars = computed(() => /[@$!%*?&]/.test(this.password()));

  strength = computed(() => {
    const count = [
      this.hasLowercase(),
      this.hasUppercase(),
      this.hasNumbers(),
      this.hasSpecialChars(),
    ].filter(Boolean).length;

    if (this.password().length < 8) return 'weak' as PasswordStrength;
    if (count >= 4) return 'strong' as PasswordStrength;
    if (count >= 3) return 'good' as PasswordStrength;
    if (count >= 2) return 'fair' as PasswordStrength;
    return 'weak' as PasswordStrength;
  });

  strengthPercentage = computed(() => {
    const strengthMap = { weak: 25, fair: 50, good: 75, strong: 100 };
    return strengthMap[this.strength()];
  });

  strengthLabel = computed(() => {
    const labelMap = {
      weak: 'Débil',
      fair: 'Regular',
      good: 'Buena',
      strong: 'Excelente',
    };
    return labelMap[this.strength()];
  });
}
```

**Uso**:

```html
<gm-password-strength 
  [password]="passwordControl.value"
  [showRequirements]="true"
/>
```

---

### 3. Componente: Loading Button (Wrapper de RoundedButton)

**Archivo**: `src/app/shared/components/loading-button/loading-button.ts`

```typescript
import { Component, input, output } from '@angular/core';
import { RoundedButton } from '@shared/ui/rounded-button/rounded-button';

@Component({
  selector: 'gm-loading-button',
  standalone: true,
  imports: [RoundedButton],
  template: `
    <gm-rounded-button
      [label]="isLoading() ? ' ' : label()"
      [loading]="isLoading()"
      [disabled]="disabled() || isLoading()"
      [severity]="severity()"
      [icon]="icon()"
      (onClick)="handleClick($event)"
    />

    @if (isLoading()) {
      <div class="button-loader-overlay" [@fadeIn]>
        <span class="loader-spinner"></span>
      </div>
    }
  `,
  styles: [`
    :host {
      position: relative;
      display: inline-block;
    }

    .button-loader-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      z-index: 10;
    }

    .loader-spinner {
      display: inline-block;
      width: 1rem;
      height: 1rem;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `],
})
export class LoadingButton {
  label = input<string>('');
  icon = input<string>('');
  disabled = input<boolean>(false);
  isLoading = input<boolean>(false);
  severity = input<string>('primary');

  onClick = output<MouseEvent>();

  handleClick(event: MouseEvent): void {
    if (!this.isLoading() && !this.disabled()) {
      this.onClick.emit(event);
    }
  }
}
```

---

## 📊 Patrones de Validación

### 1. Validator Custom para Contraseña Fuerte

**Archivo**: `src/app/shared/validators/password.validator.ts`

```typescript
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function strongPasswordValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (!value) {
      return null; // No validar si está vacío (usar Validators.required aparte)
    }

    const errors: ValidationErrors = {};

    // Mínimo 8 caracteres
    if (value.length < 8) {
      errors['minLength'] = { requiredLength: 8, actualLength: value.length };
    }

    // Debe tener al menos una mayúscula
    if (!/[A-Z]/.test(value)) {
      errors['uppercase'] = true;
    }

    // Debe tener al menos una minúscula
    if (!/[a-z]/.test(value)) {
      errors['lowercase'] = true;
    }

    // Debe tener al menos un número
    if (!/[0-9]/.test(value)) {
      errors['numbers'] = true;
    }

    return Object.keys(errors).length > 0 ? errors : null;
  };
}

// Uso:
// password: ['', [Validators.required, strongPasswordValidator()]]
```

### 2. Validator Custom para Matches (Confirmar Contraseña)

**Archivo**: `src/app/shared/validators/match.validator.ts`

```typescript
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function matchFieldsValidator(fieldName: string, matchingFieldName: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const field = control.get(fieldName);
    const matchingField = control.get(matchingFieldName);

    if (!field || !matchingField) {
      return null;
    }

    if (field.value !== matchingField.value) {
      matchingField.setErrors({ notMatching: true });
      return { notMatching: true };
    } else {
      // Limpiar error si coinciden
      const errors = matchingField.errors;
      if (errors) {
        delete errors['notMatching'];
        matchingField.setErrors(Object.keys(errors).length > 0 ? errors : null);
      }
    }

    return null;
  };
}

// Uso:
// const form = this.fb.group({
//   password: ['', [Validators.required, strongPasswordValidator()]],
//   confirmPassword: ['', Validators.required],
// }, {
//   validators: matchFieldsValidator('password', 'confirmPassword')
// });
```

---

## 🎬 Animaciones Angular

### Crear archivo de animaciones reutilizables

**Archivo**: `src/app/shared/animations/common.animations.ts`

```typescript
import {
  trigger,
  state,
  style,
  transition,
  animate,
  keyframes,
} from '@angular/animations';

export const fadeInUp = trigger('fadeInUp', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(30px)' }),
    animate('500ms cubic-bezier(0.34, 1.56, 0.64, 1)', style({ opacity: 1, transform: 'translateY(0)' })),
  ]),
]);

export const slideInRight = trigger('slideInRight', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateX(50px)' }),
    animate('400ms ease-out', style({ opacity: 1, transform: 'translateX(0)' })),
  ]),
]);

export const fadeIn = trigger('fadeIn', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate('300ms ease-out', style({ opacity: 1 })),
  ]),
  transition(':leave', [
    animate('300ms ease-out', style({ opacity: 0 })),
  ]),
]);

export const scaleIn = trigger('scaleIn', [
  transition(':enter', [
    style({ opacity: 0, transform: 'scale(0.95)' }),
    animate('300ms cubic-bezier(0.34, 1.56, 0.64, 1)', style({ opacity: 1, transform: 'scale(1)' })),
  ]),
]);

export const staggerAnimation = trigger('stagger', [
  transition('* <=> *', [
    style({ opacity: 0, transform: 'translateY(20px)' }),
    animate('300ms {{delay}} ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
  ], { params: { delay: '0ms' } }),
]);

export const rotateIn = trigger('rotateIn', [
  transition(':enter', [
    style({ opacity: 0, transform: 'rotate(-10deg) scale(0.9)' }),
    animate('400ms cubic-bezier(0.34, 1.56, 0.64, 1)', style({ opacity: 1, transform: 'rotate(0) scale(1)' })),
  ]),
]);

// Uso en componente:
// import { fadeInUp, slideInRight } from '@shared/animations/common.animations';
//
// @Component({
//   animations: [fadeInUp, slideInRight],
// })
// export class MyComponent {}
//
// En template:
// <div [@fadeInUp]></div>
// <div [@slideInRight]></div>
```

---

## 🎨 Variables CSS Globales

### Crear archivo global de variables

**Archivo**: `src/styles/_variables.css`

```css
/* ============================================
   COLORES SEMÁNTICOS (PrimeNG)
   ============================================ */

:root {
  /* Primary Color Palette */
  --p-primary-50: var(--p-energy-50);
  --p-primary-100: var(--p-energy-100);
  --p-primary-500: var(--p-energy-500);
  --p-primary-600: var(--p-energy-600);
  --p-primary-700: var(--p-energy-700);

  /* Secondary Colors */
  --p-accent: var(--p-yale-500);
  --p-accent-light: var(--p-yale-100);

  /* Status Colors */
  --p-success-50: #ecfdf5;
  --p-success-100: #d1fae5;
  --p-success-500: #10b981;
  --p-success-600: #059669;

  --p-warning-50: #fffbeb;
  --p-warning-100: #fef3c7;
  --p-warning-500: #f59e0b;
  --p-warning-600: #d97706;

  --p-error-50: #fef2f2;
  --p-error-100: #fee2e2;
  --p-error-500: #ef4444;
  --p-error-600: #dc2626;

  --p-info-50: #eff6ff;
  --p-info-100: #dbeafe;
  --p-info-500: #3b82f6;
  --p-info-600: #2563eb;

  /* Neutral Colors */
  --p-slate-50: #f4f7f9;
  --p-slate-100: #e5ecf1;
  --p-slate-200: #d1dce3;
  --p-slate-300: #b8c7d3;
  --p-slate-400: #9fb0c0;
  --p-slate-500: #607d8b;
  --p-slate-600: #56717d;
  --p-slate-700: #435861;

  /* ============================================
     TIPOGRAFÍA
     ============================================ */

  --font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-mono: 'Fira Code', monospace;

  --font-size-xs: 0.75rem;      /* 12px */
  --font-size-sm: 0.875rem;     /* 14px */
  --font-size-base: 1rem;       /* 16px */
  --font-size-lg: 1.0625rem;    /* 17px */
  --font-size-xl: 1.25rem;      /* 20px */
  --font-size-2xl: 1.5rem;      /* 24px */
  --font-size-3xl: 1.875rem;    /* 30px */
  --font-size-4xl: 2.25rem;     /* 36px */

  --font-weight-400: 400;
  --font-weight-500: 500;
  --font-weight-600: 600;
  --font-weight-700: 700;
  --font-weight-800: 800;

  --line-height-tight: 1.2;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.6;

  /* ============================================
     ESPACIADO
     ============================================ */

  --space-xs: 0.25rem;    /* 4px */
  --space-sm: 0.5rem;     /* 8px */
  --space-md: 1rem;       /* 16px */
  --space-lg: 1.5rem;     /* 24px */
  --space-xl: 2rem;       /* 32px */
  --space-2xl: 2.5rem;    /* 40px */
  --space-3xl: 3rem;      /* 48px */

  /* ============================================
     BORDES Y RADIOS
     ============================================ */

  --border-radius-sm: 6px;
  --border-radius-md: 10px;
  --border-radius-lg: 12px;
  --border-radius-xl: 16px;

  --border-width-sm: 1px;
  --border-width-md: 1.5px;
  --border-width-lg: 2px;

  /* ============================================
     SOMBRAS
     ============================================ */

  --shadow-xs: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-sm: 0 2px 4px 0 rgba(0, 0, 0, 0.08);
  --shadow-md: 0 4px 12px 0 rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 12px 32px 0 rgba(0, 0, 0, 0.15);
  --shadow-xl: 0 20px 48px 0 rgba(0, 0, 0, 0.2);

  /* Glass Morphism */
  --glass-bg: rgba(255, 255, 255, 0.75);
  --glass-blur: blur(20px);

  /* ============================================
     TRANSICIONES
     ============================================ */

  --transition-fast: 150ms ease;
  --transition-base: 200ms ease;
  --transition-slow: 300ms ease;
  --transition-slower: 500ms ease;

  /* ============================================
     Z-INDEX SCALE
     ============================================ */

  --z-dropdown: 1000;
  --z-modal: 1050;
  --z-popover: 1060;
  --z-tooltip: 1070;
  --z-notification: 1080;
}

/* Modo oscuro (si aplica) */
@media (prefers-color-scheme: dark) {
  :root {
    --p-slate-50: #1a2332;
    --p-slate-100: #2d3b50;
    /* ... ajustes para dark mode */
  }
}
```

### Importar en `styles.scss`

```scss
// En el archivo principal de estilos
@import 'styles/variables';
@import 'styles/typography';
@import 'styles/inputs';
@import 'styles/buttons';
@import 'styles/animations';

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
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

// Utilerías globales
.w-full { width: 100%; }
.h-full { height: 100%; }
.flex { display: flex; }
.flex-center { @extend .flex; align-items: center; justify-content: center; }
.grid { display: grid; }

.mb-1 { margin-bottom: var(--space-sm); }
.mb-2 { margin-bottom: var(--space-md); }
.mb-4 { margin-bottom: var(--space-xl); }

.p-1 { padding: var(--space-sm); }
.p-2 { padding: var(--space-md); }
.p-4 { padding: var(--space-xl); }

.gap-1 { gap: var(--space-sm); }
.gap-2 { gap: var(--space-md); }
.gap-4 { gap: var(--space-xl); }
```

---

## 📝 Ejemplo de Uso Integrado

### Login Component Completo con Todo lo Anterior

```typescript
// login.ts
import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormFieldWrapper } from '@shared/components/form-field-wrapper/form-field-wrapper';
import { PasswordStrengthIndicator } from '@shared/components/password-strength-indicator/password-strength-indicator';
import { LoadingButton } from '@shared/components/loading-button/loading-button';
import { fadeInUp, slideInRight } from '@shared/animations/common.animations';
import { strongPasswordValidator, matchFieldsValidator } from '@shared/validators';

@Component({
  selector: 'gm-login-v2',
  imports: [
    ReactiveFormsModule,
    FormFieldWrapper,
    PasswordStrengthIndicator,
    LoadingButton,
  ],
  animations: [fadeInUp, slideInRight],
  template: `
    <main class="login-container" [@slideInRight]>
      <form [formGroup]="loginForm" (ngSubmit)="onLogin()">
        <gm-form-field 
          id="email"
          label="Correo"
          required
          hint="Sin espacios"
          [errors]="getEmailErrors()"
        >
          <input 
            pInputText 
            id="email"
            formControlName="email"
            type="email"
          />
        </gm-form-field>

        <gm-form-field
          id="password"
          label="Contraseña"
          required
          [errors]="getPasswordErrors()"
        >
          <p-password 
            id="password"
            formControlName="password"
            [toggleMask]="true"
          />
        </gm-form-field>

        <gm-loading-button
          label="Acceder"
          [isLoading]="isLoading()"
          [disabled]="loginForm.invalid"
          (onClick)="onLogin()"
        />
      </form>
    </main>
  `,
  styleUrl: './login-v2.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginV2 {
  private fb = inject(FormBuilder);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, strongPasswordValidator()]],
  });

  isLoading = signal(false);

  getEmailErrors() {
    const control = this.loginForm.get('email');
    return control?.touched && control?.invalid
      ? [{ type: 'email', message: 'Email válido requerido' }]
      : null;
  }

  getPasswordErrors() {
    const control = this.loginForm.get('password');
    if (!control?.touched || !control?.invalid) return null;

    const errors = [];
    if (control.errors?.['required']) errors.push({ type: 'required', message: 'Contraseña requerida' });
    if (control.errors?.['minLength']) errors.push({ type: 'min', message: 'Mínimo 8 caracteres' });
    if (control.errors?.['uppercase']) errors.push({ type: 'uppercase', message: 'Incluya mayúsculas' });
    if (control.errors?.['lowercase']) errors.push({ type: 'lowercase', message: 'Incluya minúsculas' });
    if (control.errors?.['numbers']) errors.push({ type: 'numbers', message: 'Incluya números' });

    return errors;
  }

  onLogin(): void {
    if (this.loginForm.invalid) return;
    this.isLoading.set(true);
    // ... llamada a API
  }
}
```

---

## 🎯 Checklist Final

- [ ] Crear `src/styles/_variables.css`
- [ ] Crear `src/styles/typography.scss`
- [ ] Crear `src/styles/inputs.scss`
- [ ] Crear `src/styles/buttons.scss`
- [ ] Crear `src/styles/animations.scss`
- [ ] Crear `src/app/shared/components/form-field-wrapper/`
- [ ] Crear `src/app/shared/components/password-strength-indicator/`
- [ ] Crear `src/app/shared/components/loading-button/`
- [ ] Crear `src/app/shared/validators/password.validator.ts`
- [ ] Crear `src/app/shared/validators/match.validator.ts`
- [ ] Crear `src/app/shared/animations/common.animations.ts`
- [ ] Importar todas las variables en `styles.scss`
- [ ] Actualizar componentes de auth para usar nuevos patterns
- [ ] Testar en navegadores modernos

---

**Documento generado**: 12 de abril, 2026  
**Aplicable a**: GestorMedic v1.0+ con Angular 18+
