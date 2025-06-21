# Modelo de Datos - Trek-King

## Descripción General

Trek-King utiliza un modelo de datos híbrido que combina:
- **Firebase Firestore**: Para datos en tiempo real y sincronización entre dispositivos
- **SQLite (Capacitor)**: Para almacenamiento local y funcionamiento offline

## Entidades Principales

### 1. Usuario (User)

**Descripción**: Representa a los senderistas registrados en la aplicación.

**Estructura**:
```typescript
interface User {
  id?: string;           // Identificador único (Firebase UID)
  email: string;         // Correo electrónico (único)
  password: string;      // Contraseña encriptada
  nombre: string;        // Nombre del usuario
  apellido: string;      // Apellido del usuario
  photo?: string;        // URL de la foto de perfil (opcional)
  rut: string;           // RUT chileno del usuario
}
```

**Campos Obligatorios**: `email`, `password`, `nombre`, `apellido`, `rut`
**Campos Opcionales**: `id`, `photo`

### 2. Autoridad (Autoridad)

**Descripción**: Representa a los equipos de rescate, guardaparques y autoridades que monitorean la actividad.

**Estructura**:
```typescript
interface Autoridad {
  id?: string;           // Identificador único
  email: string;         // Correo electrónico (único)
  nombre: string;        // Nombre completo de la autoridad
  password?: string;     // Contraseña encriptada
  img?: string;          // URL de la imagen de perfil
  role?: string;         // Rol dentro de la organización
  zona?: string;         // Zona geográfica de responsabilidad
  cargo?: string;        // Cargo o posición
  institucion?: string;  // Institución a la que pertenece
}
```

**Campos Obligatorios**: `email`, `nombre`
**Campos Opcionales**: `id`, `password`, `img`, `role`, `zona`, `cargo`, `institucion`

### 3. Ruta (Rutas)

**Descripción**: Representa las rutas de senderismo disponibles en la aplicación.

**Estructura**:
```typescript
interface Rutas {
  id: string;                    // Identificador único de la ruta
  nombre: string;                // Nombre de la ruta
  foto?: string;                 // Foto principal (URL)
  imagen: string;                // Imagen de la ruta (URL)
  descripcion?: string;          // Descripción detallada
  ubicacion: string;             // Ubicación general
  dificultad: string;            // Nivel de dificultad
  localidad?: string;            // Localidad específica
  categorias: string[];          // Categorías de la ruta
  caracteristicas?: {            // Características específicas
    tipoTerreno?: string;
    mejorEpoca?: string;
    recomendaciones?: string;
  };
  puntosInteres?: {              // Puntos de interés en la ruta
    nombre: string;
    descripcion: string;
    imagenes: string[];
  }[];
  creador?: {                    // Información del creador
    id: string;
    nombre: string;
    email: string;
  };
  puntosDescanso?: {             // Puntos de descanso
    nombre: string;
    ubicacion: {
      lat: number;
      lng: number;
    };
    descripcion?: string;
  }[];
  puntoInicio?: {                // Punto de inicio de la ruta
    lat: number;
    lng: number;
    direccion: string;
  };
  puntoTermino?: {               // Punto de término de la ruta
    lat: number;
    lng: number;
    direccion: string;
  };
  fechaCreacion?: Date;          // Fecha de creación
  ultimaModificacion?: Date;     // Última modificación
}
```

**Campos Obligatorios**: `id`, `nombre`, `imagen`, `ubicacion`, `dificultad`, `categorias`
**Campos Opcionales**: `foto`, `descripcion`, `localidad`, `caracteristicas`, `puntosInteres`, `creador`, `puntosDescanso`, `puntoInicio`, `puntoTermino`, `fechaCreacion`, `ultimaModificacion`

### 4. Lugar (Place)

**Descripción**: Interfaz para manejo de lugares específicos.

**Estructura**:
```typescript
interface Place {
  id: number;           // Identificador numérico
  nombre: string;       // Nombre del lugar
  apellido: string;     // Apellido (parece ser un error en la interfaz)
  email: string;        // Email del lugar
  password: string;     // Contraseña
}
```

## Relaciones entre Entidades

### Relaciones Principales

1. **Usuario ↔ Ruta**:
   - Un usuario puede crear múltiples rutas (1:N)
   - Un usuario puede agendar múltiples rutas (N:M)
   - Un usuario puede guardar múltiples rutas como favoritas (N:M)

2. **Autoridad ↔ Ruta**:
   - Una autoridad puede monitorear múltiples rutas (1:N)
   - Una autoridad puede aprobar/rechazar rutas propuestas (1:N)

3. **Usuario ↔ Autoridad**:
   - Los usuarios pueden enviar alertas SOS a las autoridades (N:1)
   - Las autoridades pueden responder a emergencias de usuarios (1:N)

## Estructura de Base de Datos

### Firebase Firestore Collections

```
firestore/
├── users/                    # Colección de usuarios
│   └── {userId}/
│       ├── email
│       ├── nombre
│       ├── apellido
│       ├── photo
│       └── rut
├── autoridades/              # Colección de autoridades
│   └── {autoridadId}/
│       ├── email
│       ├── nombre
│       ├── img
│       ├── role
│       ├── zona
│       ├── cargo
│       └── institucion
├── rutas/                    # Colección de rutas
│   └── {rutaId}/
│       ├── nombre
│       ├── imagen
│       ├── descripcion
│       ├── ubicacion
│       ├── dificultad
│       ├── categorias[]
│       ├── creador
│       ├── puntoInicio
│       ├── puntoTermino
│       └── fechaCreacion
└── agendas/                  # Colección de rutas agendadas
    └── {agendaId}/
        ├── userId
        ├── rutaId
        ├── fechaAgendada
        └── estado
```

### SQLite (Local)

```
sqlite/
├── users                     # Tabla de usuarios locales
├── rutas_guardadas          # Tabla de rutas favoritas
├── agendas_locales          # Tabla de agendas offline
└── configuracion            # Tabla de configuración local
```

## Reglas de Negocio

### Validaciones

1. **Usuario**:
   - Email debe ser único en el sistema
   - RUT debe tener formato válido chileno
   - Password debe tener mínimo 6 caracteres

2. **Autoridad**:
   - Email debe ser único en el sistema
   - Solo autoridades pueden acceder al panel de control

3. **Ruta**:
   - Nombre debe ser único
   - Coordenadas de inicio y término deben ser válidas
   - Categorías deben estar predefinidas

### Seguridad

- Contraseñas encriptadas con hash
- Autenticación mediante Firebase Auth
- Autorización basada en roles (Usuario/Autoridad)
- Validación de datos en frontend y backend

## Consideraciones Técnicas

### Sincronización de Datos

- Firestore como fuente de verdad principal
- SQLite para cache local y funcionamiento offline
- Sincronización automática cuando hay conexión

### Escalabilidad

- Firestore permite escalado automático
- Índices en campos de búsqueda frecuente
- Paginación para listas grandes de rutas

### Rendimiento

- Cache local en SQLite para consultas frecuentes
- Lazy loading de imágenes
- Compresión de datos en tránsito

## Diagrama de Entidad-Relación

```
[Usuario] 1 ──── N [Ruta] (crea)
[Usuario] N ──── M [Ruta] (agenda)
[Autoridad] 1 ──── N [Ruta] (monitorea)
[Usuario] N ──── 1 [Autoridad] (SOS)
```

Este modelo de datos está diseñado para ser escalable, seguro y eficiente, permitiendo el funcionamiento tanto online como offline de la aplicación Trek-King. 