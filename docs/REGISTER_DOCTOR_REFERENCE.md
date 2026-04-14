# 📋 Referencia Rápida - Register Doctor

**Guía de referencia para el nuevo módulo `register-doctor`**

---

## 📁 Estructura de Archivos Creados

```
src/app/features/auth/register-doctor/
├── register-doctor.ts      ✅ Lógica del componente
├── register-doctor.html    ✅ Template con formulario multi-sección
└── register-doctor.scss    ✅ Estilos profesionales
```

---

## 🔗 Rutas Configuradas

| Ruta | Componente | Descripción |
|------|-----------|-------------|
| `/auth/register` | `register.ts` | Gate: selector de rol (Paciente, Médico, Clínica) |
| `/auth/register/doctor` | `register-doctor.ts` | Formulario de registro para médicos independientes |

---

## 📝 Formulario - Campos

### Sección 1: Datos Personales
```
├── Nombre Completo       (required, 3+ chars)
├── Correo Institucional  (required, valid email)
└── Clave de Seguridad    (required, 8+ chars)
```

### Sección 2: Datos Profesionales
```
├── Especialidad Médica        (required)
├── Número de Cédula           (required, format: PROF-001234)
├── Teléfono de Contacto       (required, phone format)
├── Años de Experiencia        (required, 0-70)
└── Universidad/Instituto      (required, 3+ chars)
```

### Sección 3: Biografía Profesional
```
└── Descripción Profesional    (required, 10-500 chars)
```

---

## ⚙️ Flujo de Registro Técnico

### 1. **Validación Local**
```typescript
- Todos los campos con Validators de Angular Reactive Forms
- Validación de formato (email, teléfono, cédula)
- Validación de rangos (años de experiencia 0-70)
```

### 2. **Creación de Usuario**
```
POST /api/auth/register
{
  "email": "doctor@email.com",
  "username": "doctor@email.com", 
  "password": "SecurePass123",
  "first_name": "Carlos Méndez",
  "role_id": 3  // DOCTOR
}
```

### 3. **Autenticación Táctica**
```
POST /api/auth/login
{
  "username": "doctor@email.com",
  "password": "SecurePass123"
}
↓ Obtiene: access_token
↓ Almacena en localStorage
```

### 4. **Creación de Perfil Médico**
```
POST /api/doctors/
{
  "specialties": "Cardiología, Pediatría",
  "professional_license": "PROF-001234",
  "phone": "+591 22445566",
  "university": "Universidad Estatal de Medicina",
  "experience_years": 8,
  "bio": "Descripción profesional...",
  "avatar_url": null,
  "is_available": true
}
```

### 5. **Confirmación y Redirección**
```
✅ AuthStore.fetchUser() → Obtiene datos del usuario
✅ Redirección a /app/dashboard
✅ Mensaje de éxito: "¡Bienvenido a GestorMedic!"
```

---

## 🎨 Estilos y Diseño

### Layout
- **Fondo**: Gradiente radial (Slate 50 → Slate 200)
- **Card**: Contenedor blanco, 900px máximo, sombra elegante
- **Padding**: 3.5rem desktop, 2rem móvil

### Componentes
- **Secciones**: Agrupadas con ícono + titulo
- **Inputs**: Con icono a la izquierda, bordes suaves, transiciones
- **Errores**: Mensajes inline con ícono, color rojo (#ef4444)
- **Contador**: Muestra caracteres en biografía (10-500)

### Estados
```
HOVER:     border-color: #94a3b8, sombra suave
FOCUS:     border-color: #00a8e8, box-shadow azul
ERROR:     border-color: #ef4444, sombra roja
DISABLED:  background: #f1f5f9, opacity 0.5
```

---

## 🔒 Validaciones Implementadas

| Campo | Validaciones | Patrón |
|-------|-------------|--------|
| **full_name** | required, minLength(3) | `Carlos Méndez` |
| **email** | required, email | `doctor@clinic.com` |
| **password** | required, minLength(8) | `SecurePass123` |
| **specialties** | required | `Cardiología, Pediatría` |
| **professional_license** | required, pattern | `PROF-001234` (/^[A-Z0-9\-]{5,20}$/) |
| **phone** | required, pattern | `+591 22445566` (/^[+\d\s\-()]+$/) |
| **university** | required, minLength(3) | `Universidad Estatal` |
| **experience_years** | required, min(0), max(70) | `8` |
| **bio** | required, minLength(10), maxLength(500) | Descripción larga... |

---

## 🔄 Comparación con Otros Registros

| Aspecto | Patient | Doctor | Clinic |
|--------|---------|--------|--------|
| **Campos** | 4 | 9 | 8-11 |
| **Secciones** | 1 | 3 | 2-3 |
| **API Endpoints** | 2 | 3 | 3 |
| **Duración** | ~2 min | ~5-7 min | ~10 min |
| **Complejidad** | Simple | Media | Alta |
| **Perfil BD** | - | Doctor | Clinic |

---

## 📱 Responsive Breakpoints

```scss
@media (max-width: 768px) {
  - Padding: 2rem
}

@media (max-width: 640px) {
  - Campos en columna única (flex: 1 1 100%)
  - Font-size reducido
  - Padding mínimo
  - Textarea mantiene altura
}
```

---

## 🧪 Testing Manual

### Paso 1: Navegación
```
1. Abrir http://localhost:4200/auth/register
2. Click en card "Soy Médico Independiente"
3. Debe redirigir a http://localhost:4200/auth/register/doctor
```

### Paso 2: Validación de Campos
```
1. Dejar campos vacíos → Click "Crear Perfil"
2. Deben aparecer mensajes de error

3. Ingresar datos inválidos:
   - Email sin @
   - Cédula con letras minúsculas
   - Teléfono sin formato
   - Años negativo/mayor a 70

4. Verificar que campos se marcan en rojo
```

### Paso 3: Formulario Válido
```
1. Completar TODOS los campos correctamente
2. Botón "Crear Perfil" debe activarse (no gris)
3. Click en botón → Debe mostrar loading spinner
4. Esperar respuesta del API
5. Si éxito: Redirección + toast "¡Bienvenido!"
6. Si error: Mostrar mensaje de error
```

### Paso 4: Responsive
```
Desktop (1920px):  ✅ 2 campos por fila
Tablet (768px):    ✅ 1 campo por fila
Móvil (375px):     ✅ Layout vertical, legible
```

---

## 🐛 Troubleshooting Común

### Error: "Componente no encontrado"
**Causa**: Archivo no está en la ruta correcta  
**Solución**: Verificar:
```
✅ src/app/features/auth/register-doctor/register-doctor.ts
✅ src/app/features/auth/register-doctor/register-doctor.html
✅ src/app/features/auth/register-doctor/register-doctor.scss
```

### Error: "Role_id inválido"
**Causa**: El ID del rol (3) no existe en BD  
**Solución**: Verificar en BD que el role_id 3 corresponde a "DOCTOR"
```sql
SELECT * FROM roles WHERE id = 3;
-- Debe retornar: { id: 3, name: 'DOCTOR', ... }
```

### Error: "POST /api/doctors/ 404"
**Causa**: Endpoint no existe en backend  
**Solución**: Verificar que backend tiene implementado:
```python
@router.post("/doctors/", ...)
def create_doctor(doctor: DoctorCreate, ...):
    # Crear perfil de doctor
    return doctor
```

### Inputs no validan
**Causa**: Validadores no importados  
**Solución**: Verificar imports en `register-doctor.ts`
```typescript
import { Validators } from '@angular/forms';
// Debe tener: Validators.required, Validators.email, etc.
```

---

## 📚 Archivos Relacionados

**Estructura general**:
```
src/
├── app/
│   ├── features/auth/
│   │   ├── register/              ← Gate selector
│   │   ├── register-patient/      ← Pacientes (simple)
│   │   ├── register-clinic/       ← Clínicas (complejo)
│   │   ├── register-doctor/       ← Médicos (NUEVO)
│   │   └── login/
│   ├── core/services/
│   │   └── auth.ts                ← Servicio autenticación
│   └── shared/
├── app.routes.ts                  ← Rutas configuradas
└── styles.scss                    ← Estilos globales
```

---

## 🚀 Próximos Pasos Recomendados

1. **Implementar Olvidar Contraseña**: `/auth/forgot-password`
2. **Mejorar UI/UX según guía**: `AUTH_UI_UX_IMPROVEMENT_GUIDE.md`
3. **Agregar Multi-Step Form**: Dividir registro en pasos
4. **Validación Email**: Enviar código de confirmación
5. **Avatar Upload**: Permitir subir foto de perfil

---

## 📞 Soporte

**Documento de referencia completo**: `AUTH_IMPLEMENTATION_GUIDE.md`  
**Guía de componentes**: `AUTH_COMPONENTS_AND_UTILITIES.md`  
**Guía de UI/UX**: `AUTH_UI_UX_IMPROVEMENT_GUIDE.md`

---

**Versión**: 1.0  
**Fecha**: 12 de abril, 2026  
**Estado**: ✅ Implementado y Funcional
