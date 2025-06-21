# MODELO LÓGICO DE DATOS - APLICACIÓN TREK-KING

## ÍNDICE
1. [Arquitectura de Base de Datos](#1-arquitectura-de-base-de-datos)
2. [Entidades Principales](#2-entidades-principales)
3. [Entidades Secundarias](#3-entidades-secundarias)
4. [Relaciones entre Entidades](#4-relaciones-entre-entidades)
5. [Características Técnicas](#5-características-técnicas)
6. [Patrones de Diseño](#6-patrones-de-diseño)
7. [Diagrama Conceptual](#7-diagrama-conceptual)

---

## 1. ARQUITECTURA DE BASE DE DATOS

### 1.1 Modelo Híbrido

La aplicación Trek-King utiliza una **arquitectura híbrida** que combina dos tipos de modelos de datos:

#### **Base de Datos Principal (Nube)**
- **Tecnología**: Firebase Firestore
- **Modelo**: NoSQL orientado a documentos
- **Propósito**: Almacena datos maestros y compartidos entre usuarios
- **Características**: 
  - Escalabilidad automática
  - Sincronización en tiempo real
  - Acceso desde cualquier dispositivo

#### **Base de Datos Local (Dispositivo)**
- **Tecnología**: SQLite (Capacitor Community SQLite)
- **Modelo**: Relacional tradicional
- **Propósito**: Almacena datos de sesión e información offline
- **Características**:
  - Acceso rápido sin conexión
  - Datos de usuario autenticado
  - Rutas guardadas localmente

### 1.2 Ventajas del Modelo Híbrido

- **Rendimiento**: Datos críticos disponibles offline
- **Escalabilidad**: Nube maneja el crecimiento
- **Confiabilidad**: Redundancia de datos importantes
- **Flexibilidad**: Adaptación a diferentes tipos de contenido

---

## 2. ENTIDADES PRINCIPALES

### 2.1 USUARIOS (User)

**Descripción**: Representa a los usuarios registrados de la aplicación que pueden crear rutas, agendar actividades y participar en grupos.

```typescript
interface User {
  id?: string;           // Identificador único (opcional)
  email: string;         // Correo electrónico (requerido)
  password: string;      // Contraseña encriptada (requerido)
  nombre: string;        // Nombre del usuario (requerido)
  apellido: string;      // Apellido del usuario (requerido)
  photo?: string;        // URL de la foto de perfil (opcional)
  rut: string;          // RUT chileno (requerido)
}
```

**Restricciones**:
- Email debe ser único en el sistema
- RUT debe ser válido según formato chileno
- Password debe cumplir políticas de seguridad

### 2.2 AUTORIDADES (Autoridad)

**Descripción**: Representa a las autoridades de emergencia y seguridad que pueden gestionar alertas y supervisar actividades.

```typescript
interface Autoridad {
  id?: string;           // Identificador único (opcional)
  email: string;         // Correo electrónico (requerido)
  nombre: string;        // Nombre completo (requerido)
  password?: string;     // Contraseña encriptada (opcional)
  img?: string;          // URL de la imagen de perfil (opcional)
  role?: string;         // Rol en la institución (opcional)
  zona?: string;         // Zona geográfica de responsabilidad (opcional)
  cargo?: string;        // Cargo específico (opcional)
  institucion?: string;  // Institución a la que pertenece (opcional)
}
```

**Tipos de Zona**:
- Región de Arica y Parinacota
- Región de Tarapacá
- Región de Antofagasta
- Región de Atacama
- Región de Coquimbo
- Región de Valparaíso
- Región Metropolitana de Santiago
- Región del Libertador General Bernardo O'Higgins
- Región del Maule
- Región de Ñuble
- Región del Biobío
- Región de La Araucanía
- Región de Los Ríos
- Región de Los Lagos
- Región de Aysén
- Región de Magallanes

### 2.3 RUTAS (Rutas)

**Descripción**: Representa las rutas de senderismo y trekking que los usuarios pueden explorar, crear y agendar.

```typescript
interface Rutas {
  id: string;                    // Identificador único (requerido)
  nombre: string;                // Nombre de la ruta (requerido)
  foto?: string;                 // URL de foto adicional (opcional)
  imagen: string;                // URL de imagen principal (requerido)
  descripcion?: string;          // Descripción detallada (opcional)
  ubicacion: string;             // Ubicación general (requerido)
  dificultad: string;            // Nivel de dificultad (requerido)
  localidad?: string;            // Localidad específica (opcional)
  categorias: string[];          // Array de categorías (requerido)
  
  // Características técnicas
  caracteristicas?: {
    tipoTerreno: string;         // Tipo de terreno
    mejorEpoca: string;          // Mejor época para realizar
    recomendaciones: string;     // Recomendaciones generales
  };
  
  // Puntos de interés en la ruta
  puntosInteres?: {
    nombre: string;              // Nombre del punto
    descripcion: string;         // Descripción del punto
    imagenes: string[];          // Array de URLs de imágenes
  }[];
  
  // Información del creador
  creador?: {
    id: string;                  // ID del usuario creador
    nombre: string;              // Nombre del creador
    email: string;               // Email del creador
  };
  
  // Puntos de descanso
  puntosDescanso?: {
    nombre: string;              // Nombre del punto de descanso
    ubicacion: {
      lat: number;               // Latitud
      lng: number;               // Longitud
    };
    descripcion?: string;        // Descripción del punto
  }[];
  
  // Punto de inicio
  puntoInicio?: {
    lat: number;                 // Latitud
    lng: number;                 // Longitud
    direccion: string;           // Dirección textual
  };
  
  // Punto de término
  puntoTermino?: {
    lat: number;                 // Latitud
    lng: number;                 // Longitud
    direccion: string;           // Dirección textual
  };
  
  // Metadatos
  fechaCreacion?: Date;          // Fecha de creación
  ultimaModificacion?: Date;     // Fecha de última modificación
}
```

**Categorías de Rutas**:
- Montaña
- Bosque
- Playa
- Río
- Cascada
- Campo
- Nieve
- Urbano

**Niveles de Dificultad**:
- Fácil
- Moderado
- Difícil
- Experto

---

## 3. ENTIDADES SECUNDARIAS

### 3.1 RUTAS AGENDADAS (RutaAgendada)

**Descripción**: Representa las rutas que un usuario ha programado para realizar en una fecha específica.

```typescript
interface RutaAgendada {
  id?: string;                   // Identificador único (opcional)
  userId?: string;               // ID del usuario (opcional)
  rutaId: string;                // ID de la ruta (requerido)
  nombre: string;                // Nombre de la ruta (requerido)
  ubicacion: string;             // Ubicación (requerido)
  dificultad: string;            // Dificultad (requerido)
  imagen: string;                // URL de imagen (requerido)
  fechaProgramada: string;       // Fecha programada (requerido)
  horaProgramada: string;        // Hora programada (requerido)
  descripcion?: string;          // Descripción (opcional)
  
  // Características heredadas de la ruta
  caracteristicas?: {
    tipoTerreno: string;
    mejorEpoca: string;
    recomendaciones: string;
  };
  
  // Puntos de interés heredados
  puntosInteres?: {
    nombre: string;
    descripcion: string;
    imagenes: string[];
  }[];
  
  // Metadatos adicionales
  fechaAgendada?: Date;          // Fecha de agendamiento
  nombreUsuario?: string;        // Nombre del usuario
}
```

### 3.2 PUBLICACIONES DE GRUPO (PublicacionGrupo)

**Descripción**: Representa las publicaciones que los usuarios crean para buscar compañeros de ruta.

```typescript
interface PublicacionGrupo {
  id?: string;                   // Identificador único (opcional)
  rutaId: string;                // ID de la ruta (requerido)
  nombre: string;                // Nombre de la ruta (requerido)
  ubicacion: string;             // Ubicación (requerido)
  dificultad: string;            // Dificultad (requerido)
  imagen: string;                // URL de imagen (requerido)
  descripcion: string;           // Descripción (requerido)
  
  // Características de la ruta
  caracteristicas: {
    tipoTerreno: string;
    mejorEpoca: string;
    recomendaciones: string;
  };
  
  // Puntos de interés
  puntosInteres: {
    nombre: string;
    descripcion: string;
    imagenes: string[];
  }[];
  
  // Información del creador
  usuarioId: string;             // ID del usuario creador
  nombreUsuario: string;         // Nombre del usuario
  fecha: Date;                   // Fecha de publicación
}
```

### 3.3 COMENTARIOS (Comentario)

**Descripción**: Representa los comentarios y calificaciones que los usuarios hacen sobre las rutas.

```typescript
interface Comentario {
  id?: string;                   // Identificador único (opcional)
  rutaId: string;                // ID de la ruta (requerido)
  usuarioId: string;             // ID del usuario (requerido)
  nombreUsuario: string;         // Nombre del usuario (requerido)
  texto: string;                 // Texto del comentario (requerido)
  calificacion: number;          // Calificación (1-5) (requerido)
  fecha: Date;                   // Fecha del comentario (requerido)
}
```

### 3.4 COMENTARIOS DE GRUPO (ComentarioGrupo)

**Descripción**: Representa los comentarios en las publicaciones de grupo, con soporte para respuestas anidadas.

```typescript
interface ComentarioGrupo {
  id?: string;                   // Identificador único (opcional)
  publicacionId: string;         // ID de la publicación (requerido)
  usuarioId: string;             // ID del usuario (requerido)
  nombreUsuario: string;         // Nombre del usuario (requerido)
  texto: string;                 // Texto del comentario (requerido)
  fecha: Date;                   // Fecha del comentario (requerido)
  esRespuesta?: boolean;         // Indica si es respuesta (opcional)
  comentarioPadreId?: string;    // ID del comentario padre (opcional)
  respuestas?: ComentarioGrupo[]; // Array de respuestas (opcional)
}
```

### 3.5 ALERTAS (Alerta)

**Descripción**: Representa las alertas de emergencia que los usuarios pueden activar durante sus actividades.

```typescript
interface Alerta {
  id?: string;                   // Identificador único (opcional)
  userId: string;                // ID del usuario (requerido)
  nombreUsuario: string;         // Nombre del usuario (requerido)
  fotoUsuario?: string;          // URL de foto del usuario (opcional)
  titulo: string;                // Título de la alerta (requerido)
  descripcion: string;           // Descripción detallada (requerido)
  
  // Ubicación de la emergencia
  ubicacion: {
    lat: number;                 // Latitud
    lng: number;                 // Longitud
  };
  
  fecha: Date;                   // Fecha de la alerta (requerido)
  rutUsuario: string;            // RUT del usuario (requerido)
  
  // Estado de la alerta
  estado: 'pendiente' | 'en proceso' | 'solucionado';
  
  instrucciones?: string;        // Instrucciones adicionales (opcional)
}
```

### 3.6 LUGARES (Place)

**Descripción**: Interfaz básica para lugares (puede estar en desarrollo).

```typescript
interface Place {
  id: number;                    // Identificador único
  nombre: string;                // Nombre del lugar
  apellido: string;              // Apellido (posible error en el modelo)
  email: string;                 // Email
  password: string;              // Contraseña
}
```

---

## 4. RELACIONES ENTRE ENTIDADES

### 4.1 Diagrama de Relaciones

```
USUARIO (1) ──── (N) RUTAS
    │
    ├── (1:N) RUTA_AGENDADA
    ├── (1:N) COMENTARIO
    ├── (1:N) PUBLICACION_GRUPO
    ├── (1:N) COMENTARIO_GRUPO
    └── (1:N) ALERTA

RUTA (1) ──── (N) COMENTARIO
    │
    └── (1:N) RUTA_AGENDADA

PUBLICACION_GRUPO (1) ──── (N) COMENTARIO_GRUPO
```

### 4.2 Detalle de Relaciones

#### **Relación Usuario - Rutas (1:N)**
- Un usuario puede crear múltiples rutas
- Una ruta pertenece a un solo usuario creador
- **Cardinalidad**: 1 usuario → N rutas

#### **Relación Usuario - RutaAgendada (1:N)**
- Un usuario puede agendar múltiples rutas
- Una ruta agendada pertenece a un solo usuario
- **Cardinalidad**: 1 usuario → N rutas agendadas

#### **Relación Usuario - Comentario (1:N)**
- Un usuario puede hacer múltiples comentarios
- Un comentario pertenece a un solo usuario
- **Cardinalidad**: 1 usuario → N comentarios

#### **Relación Ruta - Comentario (1:N)**
- Una ruta puede tener múltiples comentarios
- Un comentario pertenece a una sola ruta
- **Cardinalidad**: 1 ruta → N comentarios

#### **Relación Usuario - PublicacionGrupo (1:N)**
- Un usuario puede crear múltiples publicaciones
- Una publicación pertenece a un solo usuario
- **Cardinalidad**: 1 usuario → N publicaciones

#### **Relación PublicacionGrupo - ComentarioGrupo (1:N)**
- Una publicación puede tener múltiples comentarios
- Un comentario pertenece a una sola publicación
- **Cardinalidad**: 1 publicación → N comentarios

#### **Relación Usuario - Alerta (1:N)**
- Un usuario puede crear múltiples alertas
- Una alerta pertenece a un solo usuario
- **Cardinalidad**: 1 usuario → N alertas

---

## 5. CARACTERÍSTICAS TÉCNICAS

### 5.1 Normalización de Datos

El modelo está diseñado siguiendo las **formas normales** para evitar:
- **Redundancia de datos**: No se duplica información innecesariamente
- **Anomalías de inserción**: Se pueden insertar datos sin problemas
- **Anomalías de actualización**: Los cambios se propagan correctamente
- **Anomalías de eliminación**: No se pierde información importante

### 5.2 Flexibilidad del Modelo

- **Campos opcionales**: Permiten adaptarse a diferentes tipos de contenido
- **Estructuras anidadas**: Soportan datos complejos (características, puntos de interés)
- **Arrays dinámicos**: Permiten múltiples valores (categorías, imágenes)
- **Tipos de datos variados**: String, number, Date, boolean, objetos

### 5.3 Escalabilidad

- **Separación de responsabilidades**: Cada entidad tiene un propósito específico
- **Independencia de datos**: Las entidades pueden crecer sin afectar otras
- **Soporte para crecimiento**: Estructura preparada para nuevas funcionalidades
- **Optimización de consultas**: Índices y relaciones optimizadas

### 5.4 Seguridad

- **Separación de datos sensibles**: Contraseñas separadas de datos públicos
- **Validación de entrada**: Restricciones en tipos de datos
- **Encriptación**: Contraseñas almacenadas de forma segura
- **Control de acceso**: Diferentes niveles de autorización

### 5.5 Geolocalización

- **Coordenadas GPS**: Latitud y longitud para ubicaciones precisas
- **Puntos de ruta**: Inicio, término y puntos intermedios
- **Alertas geolocalizadas**: Ubicación exacta de emergencias
- **Búsqueda por proximidad**: Funcionalidad de búsqueda geográfica

### 5.6 Multimedia

- **Imágenes múltiples**: Soporte para galerías de fotos
- **URLs de recursos**: Enlaces a imágenes almacenadas
- **Optimización**: Diferentes tamaños y formatos
- **Carga progresiva**: Mejora la experiencia de usuario

---

## 6. PATRONES DE DISEÑO

### 6.1 Repository Pattern

**Implementación**: Servicios que abstraen el acceso a datos
- `DatabaseService`: Maneja la base de datos local
- `AuthService`: Gestiona autenticación
- `RutasGuardadasService`: Maneja rutas agendadas
- `ComentariosService`: Gestiona comentarios

**Ventajas**:
- Separación de lógica de negocio y acceso a datos
- Facilita testing y mantenimiento
- Permite cambiar implementaciones sin afectar el código

### 6.2 Observer Pattern

**Implementación**: Uso de RxJS para reactividad
- Observables para cambios en tiempo real
- Subjects para comunicación entre componentes
- BehaviorSubjects para estado persistente

**Ventajas**:
- Actualizaciones automáticas de la interfaz
- Desacoplamiento entre componentes
- Manejo eficiente de eventos

### 6.3 Dependency Injection

**Implementación**: Inyección de servicios en componentes
- Angular DI Container
- Servicios singleton
- Inyección por constructor

**Ventajas**:
- Facilita testing con mocks
- Reduce acoplamiento
- Mejora la mantenibilidad

### 6.4 Factory Pattern

**Implementación**: Creación de objetos complejos
- Factories para rutas con características
- Builders para objetos con múltiples propiedades
- Constructores especializados

**Ventajas**:
- Encapsula lógica de creación
- Facilita creación de objetos complejos
- Mejora la legibilidad del código

---

## 7. DIAGRAMA CONCEPTUAL

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     USUARIO     │    │    AUTORIDAD    │    │      RUTA       │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ id              │    │ id              │    │ id              │
│ email           │    │ email           │    │ nombre          │
│ password        │    │ nombre          │    │ imagen          │
│ nombre          │    │ password        │    │ ubicacion       │
│ apellido        │    │ img             │    │ dificultad      │
│ photo           │    │ role            │    │ categorias[]    │
│ rut             │    │ zona            │    │ caracteristicas │
└─────────────────┘    │ cargo           │    │ puntosInteres[] │
         │              │ institucion     │    │ creador         │
         │              └─────────────────┘    │ puntoInicio     │
         │                       │              │ puntoTermino    │
         │                       │              └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ RUTA_AGENDADA   │    │     ALERTA      │    │   COMENTARIO    │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ id              │    │ id              │    │ id              │
│ userId          │    │ userId          │    │ rutaId          │
│ rutaId          │    │ nombreUsuario   │    │ usuarioId       │
│ nombre          │    │ titulo          │    │ nombreUsuario   │
│ fechaProgramada │    │ descripcion     │    │ texto           │
│ horaProgramada  │    │ ubicacion       │    │ calificacion    │
│ caracteristicas │    │ fecha           │    │ fecha           │
└─────────────────┘    │ rutUsuario      │    └─────────────────┘
         │              │ estado          │
         │              └─────────────────┘
         │
         ▼
┌─────────────────┐    ┌─────────────────┐
│PUBLICACION_GRUPO│    │COMENTARIO_GRUPO │
├─────────────────┤    ├─────────────────┤
│ id              │    │ id              │
│ rutaId          │    │ publicacionId   │
│ nombre          │    │ usuarioId       │
│ descripcion     │    │ nombreUsuario   │
│ usuarioId       │    │ texto           │
│ nombreUsuario   │    │ fecha           │
│ fecha           │    │ esRespuesta     │
└─────────────────┘    │ comentarioPadreId│
         │              └─────────────────┘
         │                       ▲
         └───────────────────────┘
```

---

## 8. CONSIDERACIONES DE IMPLEMENTACIÓN

### 8.1 Base de Datos Local (SQLite)

**Tablas principales**:
- `users`: Datos de usuarios autenticados
- `autoridades`: Datos de autoridades autenticadas
- `rutas`: Rutas guardadas localmente
- `rutas_agendadas`: Rutas programadas por el usuario

**Ventajas**:
- Acceso rápido sin conexión
- Sincronización controlada
- Datos críticos siempre disponibles

### 8.2 Base de Datos en la Nube (Firestore)

**Colecciones principales**:
- `Users`: Usuarios registrados
- `Autoridades`: Autoridades del sistema
- `Rutas`: Rutas creadas por usuarios
- `Comentarios`: Comentarios de rutas
- `PublicacionesGrupo`: Publicaciones para buscar compañeros
- `ComentariosGrupo`: Comentarios en publicaciones
- `Alertas`: Alertas de emergencia

**Ventajas**:
- Escalabilidad automática
- Sincronización en tiempo real
- Backup automático
- Acceso desde cualquier dispositivo

### 8.3 Sincronización de Datos

**Estrategia**:
- Datos críticos duplicados en local y nube
- Sincronización manual controlada
- Resolución de conflictos por timestamp
- Fallback a datos locales en caso de desconexión

---

## 9. CONCLUSIONES

El modelo lógico de la aplicación Trek-King está diseñado para:

1. **Escalabilidad**: Crecer con el número de usuarios y rutas
2. **Flexibilidad**: Adaptarse a diferentes tipos de contenido
3. **Rendimiento**: Optimizar el acceso a datos críticos
4. **Confiabilidad**: Garantizar la disponibilidad de datos importantes
5. **Mantenibilidad**: Facilitar el desarrollo y testing
6. **Seguridad**: Proteger datos sensibles de usuarios

La arquitectura híbrida permite aprovechar las ventajas de ambos modelos de datos:
- **SQLite** para rendimiento y disponibilidad offline
- **Firestore** para escalabilidad y sincronización en tiempo real

Este diseño proporciona una base sólida para el crecimiento futuro de la aplicación y la implementación de nuevas funcionalidades. 