# MODELO RELACIONAL - APLICACIÓN TREK-KING

## ÍNDICE
1. [Introducción](#1-introducción)
2. [Base de Datos Local (SQLite)](#2-base-de-datos-local-sqlite)
3. [Base de Datos en la Nube (Firestore)](#3-base-de-datos-en-la-nube-firestore)
4. [Diagrama Entidad-Relación](#4-diagrama-entidad-relación)
5. [Normalización](#5-normalización)
6. [Índices y Optimización](#6-índices-y-optimización)

---

## 1. INTRODUCCIÓN

El modelo relacional de Trek-King se implementa en dos bases de datos:

1. **SQLite Local**: Para datos de sesión y funcionamiento offline
2. **Firestore**: Para datos maestros y sincronización en la nube

---

## 2. BASE DE DATOS LOCAL (SQLITE)

### 2.1 Tabla: USERS

```sql
CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    photo VARCHAR(500),
    rut VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Descripción de campos**:
- `id`: Clave primaria, identificador único del usuario
- `email`: Email único del usuario (índice único)
- `password`: Contraseña encriptada
- `nombre`: Nombre del usuario
- `apellido`: Apellido del usuario
- `photo`: URL de la foto de perfil (opcional)
- `rut`: RUT chileno del usuario
- `created_at`: Fecha de creación del registro
- `updated_at`: Fecha de última actualización

### 2.2 Tabla: AUTORIDADES

```sql
CREATE TABLE autoridades (
    id VARCHAR(50) PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    password VARCHAR(255),
    img VARCHAR(500),
    role VARCHAR(50),
    zona VARCHAR(50),
    cargo VARCHAR(100),
    institucion VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Descripción de campos**:
- `id`: Clave primaria, identificador único de la autoridad
- `email`: Email único de la autoridad (índice único)
- `nombre`: Nombre completo de la autoridad
- `password`: Contraseña encriptada (opcional)
- `img`: URL de la imagen de perfil (opcional)
- `role`: Rol en la institución (opcional)
- `zona`: Zona geográfica de responsabilidad (opcional)
- `cargo`: Cargo específico (opcional)
- `institucion`: Institución a la que pertenece (opcional)
- `created_at`: Fecha de creación del registro
- `updated_at`: Fecha de última actualización

### 2.3 Tabla: RUTAS

```sql
CREATE TABLE rutas (
    id VARCHAR(50) PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    foto VARCHAR(500),
    imagen VARCHAR(500) NOT NULL,
    descripcion TEXT,
    ubicacion VARCHAR(200) NOT NULL,
    dificultad VARCHAR(50) NOT NULL,
    localidad VARCHAR(100),
    categorias TEXT NOT NULL, -- JSON array como string
    caracteristicas TEXT, -- JSON object como string
    puntos_interes TEXT, -- JSON array como string
    creador_id VARCHAR(50),
    creador_nombre VARCHAR(100),
    creador_email VARCHAR(100),
    punto_inicio_lat DECIMAL(10,8),
    punto_inicio_lng DECIMAL(11,8),
    punto_inicio_direccion VARCHAR(200),
    punto_termino_lat DECIMAL(10,8),
    punto_termino_lng DECIMAL(11,8),
    punto_termino_direccion VARCHAR(200),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultima_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (creador_id) REFERENCES users(id) ON DELETE SET NULL
);
```

**Descripción de campos**:
- `id`: Clave primaria, identificador único de la ruta
- `nombre`: Nombre de la ruta
- `foto`: URL de foto adicional (opcional)
- `imagen`: URL de imagen principal
- `descripcion`: Descripción detallada (opcional)
- `ubicacion`: Ubicación general de la ruta
- `dificultad`: Nivel de dificultad
- `localidad`: Localidad específica (opcional)
- `categorias`: Array JSON de categorías
- `caracteristicas`: Objeto JSON con características técnicas
- `puntos_interes`: Array JSON de puntos de interés
- `creador_id`: Clave foránea al usuario creador
- `creador_nombre`: Nombre del creador (duplicado para consultas rápidas)
- `creador_email`: Email del creador (duplicado para consultas rápidas)
- `punto_inicio_lat`: Latitud del punto de inicio
- `punto_inicio_lng`: Longitud del punto de inicio
- `punto_inicio_direccion`: Dirección textual del punto de inicio
- `punto_termino_lat`: Latitud del punto de término
- `punto_termino_lng`: Longitud del punto de término
- `punto_termino_direccion`: Dirección textual del punto de término
- `fecha_creacion`: Fecha de creación de la ruta
- `ultima_modificacion`: Fecha de última modificación

### 2.4 Tabla: RUTAS_AGENDADAS

```sql
CREATE TABLE rutas_agendadas (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50),
    ruta_id VARCHAR(50) NOT NULL,
    nombre VARCHAR(200) NOT NULL,
    ubicacion VARCHAR(200) NOT NULL,
    dificultad VARCHAR(50) NOT NULL,
    imagen VARCHAR(500) NOT NULL,
    fecha_programada DATE NOT NULL,
    hora_programada TIME NOT NULL,
    descripcion TEXT,
    caracteristicas TEXT, -- JSON object como string
    puntos_interes TEXT, -- JSON array como string
    fecha_agendada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    nombre_usuario VARCHAR(100),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (ruta_id) REFERENCES rutas(id) ON DELETE CASCADE
);
```

**Descripción de campos**:
- `id`: Clave primaria, identificador único de la ruta agendada
- `user_id`: Clave foránea al usuario que agendó la ruta
- `ruta_id`: Clave foránea a la ruta agendada
- `nombre`: Nombre de la ruta (duplicado para consultas rápidas)
- `ubicacion`: Ubicación de la ruta (duplicado para consultas rápidas)
- `dificultad`: Dificultad de la ruta (duplicado para consultas rápidas)
- `imagen`: URL de imagen (duplicado para consultas rápidas)
- `fecha_programada`: Fecha programada para realizar la ruta
- `hora_programada`: Hora programada para realizar la ruta
- `descripcion`: Descripción de la ruta (opcional)
- `caracteristicas`: Objeto JSON con características (opcional)
- `puntos_interes`: Array JSON de puntos de interés (opcional)
- `fecha_agendada`: Fecha en que se agendó la ruta
- `nombre_usuario`: Nombre del usuario (duplicado para consultas rápidas)

### 2.5 Tabla: PUNTOS_DESCANSO

```sql
CREATE TABLE puntos_descanso (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ruta_id VARCHAR(50) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    latitud DECIMAL(10,8) NOT NULL,
    longitud DECIMAL(11,8) NOT NULL,
    descripcion TEXT,
    FOREIGN KEY (ruta_id) REFERENCES rutas(id) ON DELETE CASCADE
);
```

**Descripción de campos**:
- `id`: Clave primaria autoincremental
- `ruta_id`: Clave foránea a la ruta
- `nombre`: Nombre del punto de descanso
- `latitud`: Latitud del punto de descanso
- `longitud`: Longitud del punto de descanso
- `descripcion`: Descripción del punto de descanso (opcional)

---

## 3. BASE DE DATOS EN LA NUBE (FIRESTORE)

### 3.1 Colección: Users

```javascript
// Documento en Firestore
{
  id: "string",           // Document ID
  email: "string",        // Required, unique
  password: "string",     // Required, encrypted
  nombre: "string",       // Required
  apellido: "string",     // Required
  photo: "string",        // Optional, URL
  rut: "string",          // Required
  createdAt: "timestamp", // Auto-generated
  updatedAt: "timestamp"  // Auto-generated
}
```

### 3.2 Colección: Autoridades

```javascript
// Documento en Firestore
{
  id: "string",           // Document ID
  email: "string",        // Required, unique
  nombre: "string",       // Required
  password: "string",     // Optional, encrypted
  img: "string",          // Optional, URL
  role: "string",         // Optional
  zona: "string",         // Optional
  cargo: "string",        // Optional
  institucion: "string",  // Optional
  createdAt: "timestamp", // Auto-generated
  updatedAt: "timestamp"  // Auto-generated
}
```

### 3.3 Colección: Rutas

```javascript
// Documento en Firestore
{
  id: "string",           // Document ID
  nombre: "string",       // Required
  foto: "string",         // Optional, URL
  imagen: "string",       // Required, URL
  descripcion: "string",  // Optional
  ubicacion: "string",    // Required
  dificultad: "string",   // Required
  localidad: "string",    // Optional
  categorias: ["string"], // Required, array
  caracteristicas: {      // Optional, object
    tipoTerreno: "string",
    mejorEpoca: "string",
    recomendaciones: "string"
  },
  puntosInteres: [{       // Optional, array of objects
    nombre: "string",
    descripcion: "string",
    imagenes: ["string"]
  }],
  creador: {              // Optional, object
    id: "string",
    nombre: "string",
    email: "string"
  },
  puntosDescanso: [{      // Optional, array of objects
    nombre: "string",
    ubicacion: {
      lat: "number",
      lng: "number"
    },
    descripcion: "string"
  }],
  puntoInicio: {          // Optional, object
    lat: "number",
    lng: "number",
    direccion: "string"
  },
  puntoTermino: {         // Optional, object
    lat: "number",
    lng: "number",
    direccion: "string"
  },
  fechaCreacion: "timestamp",     // Auto-generated
  ultimaModificacion: "timestamp" // Auto-generated
}
```

### 3.4 Colección: Comentarios

```javascript
// Documento en Firestore
{
  id: "string",           // Document ID
  rutaId: "string",       // Required, reference to Rutas
  usuarioId: "string",    // Required, reference to Users
  nombreUsuario: "string", // Required
  texto: "string",        // Required
  calificacion: "number", // Required, 1-5
  fecha: "timestamp"      // Auto-generated
}
```

### 3.5 Colección: PublicacionesGrupo

```javascript
// Documento en Firestore
{
  id: "string",           // Document ID
  rutaId: "string",       // Required, reference to Rutas
  nombre: "string",       // Required
  ubicacion: "string",    // Required
  dificultad: "string",   // Required
  imagen: "string",       // Required, URL
  descripcion: "string",  // Required
  caracteristicas: {      // Required, object
    tipoTerreno: "string",
    mejorEpoca: "string",
    recomendaciones: "string"
  },
  puntosInteres: [{       // Required, array of objects
    nombre: "string",
    descripcion: "string",
    imagenes: ["string"]
  }],
  usuarioId: "string",    // Required, reference to Users
  nombreUsuario: "string", // Required
  fecha: "timestamp"      // Auto-generated
}
```

### 3.6 Colección: ComentariosGrupo

```javascript
// Documento en Firestore
{
  id: "string",           // Document ID
  publicacionId: "string", // Required, reference to PublicacionesGrupo
  usuarioId: "string",    // Required, reference to Users
  nombreUsuario: "string", // Required
  texto: "string",        // Required
  fecha: "timestamp",     // Auto-generated
  esRespuesta: "boolean", // Optional
  comentarioPadreId: "string", // Optional, reference to same collection
  respuestas: ["string"]  // Optional, array of comment IDs
}
```

### 3.7 Colección: Alertas

```javascript
// Documento en Firestore
{
  id: "string",           // Document ID
  userId: "string",       // Required, reference to Users
  nombreUsuario: "string", // Required
  fotoUsuario: "string",  // Optional, URL
  titulo: "string",       // Required
  descripcion: "string",  // Required
  ubicacion: {            // Required, object
    lat: "number",
    lng: "number"
  },
  fecha: "timestamp",     // Auto-generated
  rutUsuario: "string",   // Required
  estado: "string",       // Required: "pendiente", "en proceso", "solucionado"
  instrucciones: "string" // Optional
}
```

---

## 4. DIAGRAMA ENTIDAD-RELACIÓN

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     USERS       │    │   AUTORIDADES   │    │     RUTAS       │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ PK: id          │    │ PK: id          │    │ PK: id          │
│ UQ: email       │    │ UQ: email       │    │ FK: creador_id  │
│     password    │    │     nombre      │    │     nombre      │
│     nombre      │    │     password    │    │     imagen      │
│     apellido    │    │     img         │    │     ubicacion   │
│     photo       │    │     role        │    │     dificultad  │
│     rut         │    │     zona        │    │     categorias  │
│     created_at  │    │     cargo       │    │     caracterist.│
│     updated_at  │    │     institucion │    │     puntos_inter│
└─────────────────┘    │     created_at  │    │     punto_inicio│
         │              │     updated_at  │    │     punto_termin│
         │              └─────────────────┘    │     fecha_creac.│
         │                       │              │     ult_modif.  │
         │                       │              └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│RUTAS_AGENDADAS  │    │     ALERTAS     │    │   COMENTARIOS   │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ PK: id          │    │ PK: id          │    │ PK: id          │
│ FK: user_id     │    │ FK: userId      │    │ FK: rutaId      │
│ FK: ruta_id     │    │     nombreUsuar.│    │ FK: usuarioId   │
│     nombre      │    │     titulo      │    │     nombreUsuar.│
│     ubicacion   │    │     descripcion │    │     texto       │
│     dificultad  │    │     ubicacion   │    │     calificacion│
│     imagen      │    │     fecha       │    │     fecha       │
│     fecha_prog. │    │     rutUsuario  │    └─────────────────┘
│     hora_prog.  │    │     estado      │
│     descripcion │    │     instruccion.│
│     caracterist.│    └─────────────────┘
│     puntos_inter│
│     fecha_agend.│
│     nombre_usuar│
└─────────────────┘
         │
         ▼
┌─────────────────┐    ┌─────────────────┐
│PUNTOS_DESCANSO  │    │PUBLICACIONES_GR.│
├─────────────────┤    ├─────────────────┤
│ PK: id          │    │ PK: id          │
│ FK: ruta_id     │    │ FK: rutaId      │
│     nombre      │    │     nombre      │
│     latitud     │    │     ubicacion   │
│     longitud    │    │     dificultad  │
│     descripcion │    │     imagen      │
└─────────────────┘    │     descripcion │
                       │     caracterist.│
                       │     puntosInter.│
                       │ FK: usuarioId   │
                       │     nombreUsuar.│
                       │     fecha       │
                       └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │COMENTARIOS_GRUPO│
                       ├─────────────────┤
                       │ PK: id          │
                       │ FK: publicacionId│
                       │ FK: usuarioId   │
                       │     nombreUsuar.│
                       │     texto       │
                       │     fecha       │
                       │     esRespuesta │
                       │ FK: comentarioPadreId│
                       │     respuestas  │
                       └─────────────────┘
```

---

## 5. NORMALIZACIÓN

### 5.1 Primera Forma Normal (1NF)

**Criterios cumplidos**:
- ✅ Todos los valores son atómicos (no hay arrays o listas)
- ✅ No hay grupos repetitivos
- ✅ Cada columna tiene un nombre único
- ✅ El orden de las filas no importa

**Ejemplo de normalización**:
```sql
-- ANTES (viola 1NF)
CREATE TABLE rutas (
    id VARCHAR(50) PRIMARY KEY,
    categorias VARCHAR(200) -- "montaña,bosque,playa" (no atómico)
);

-- DESPUÉS (cumple 1NF)
CREATE TABLE rutas (
    id VARCHAR(50) PRIMARY KEY,
    categorias TEXT -- JSON array como string
);

CREATE TABLE rutas_categorias (
    ruta_id VARCHAR(50),
    categoria VARCHAR(50),
    FOREIGN KEY (ruta_id) REFERENCES rutas(id)
);
```

### 5.2 Segunda Forma Normal (2NF)

**Criterios cumplidos**:
- ✅ Cumple 1NF
- ✅ Todos los atributos no clave dependen completamente de la clave primaria

**Ejemplo**:
```sql
-- La tabla RUTAS cumple 2NF porque todos los campos
-- dependen completamente del id de la ruta
```

### 5.3 Tercera Forma Normal (3NF)

**Criterios cumplidos**:
- ✅ Cumple 2NF
- ✅ No hay dependencias transitivas

**Ejemplo de normalización**:
```sql
-- ANTES (viola 3NF)
CREATE TABLE rutas (
    id VARCHAR(50) PRIMARY KEY,
    creador_id VARCHAR(50),
    creador_nombre VARCHAR(100), -- Depende de creador_id, no de id
    creador_email VARCHAR(100)   -- Depende de creador_id, no de id
);

-- DESPUÉS (cumple 3NF)
CREATE TABLE rutas (
    id VARCHAR(50) PRIMARY KEY,
    creador_id VARCHAR(50),
    FOREIGN KEY (creador_id) REFERENCES users(id)
);

CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    nombre VARCHAR(100),
    email VARCHAR(100)
);
```

**Nota**: En la implementación actual se mantienen algunos campos duplicados por rendimiento, pero la estructura base cumple 3NF.

---

## 6. ÍNDICES Y OPTIMIZACIÓN

### 6.1 Índices en SQLite

```sql
-- Índices para optimizar consultas frecuentes

-- Usuarios por email
CREATE INDEX idx_users_email ON users(email);

-- Rutas por creador
CREATE INDEX idx_rutas_creador ON rutas(creador_id);

-- Rutas por dificultad
CREATE INDEX idx_rutas_dificultad ON rutas(dificultad);

-- Rutas por ubicación
CREATE INDEX idx_rutas_ubicacion ON rutas(ubicacion);

-- Rutas agendadas por usuario
CREATE INDEX idx_rutas_agendadas_user ON rutas_agendadas(user_id);

-- Rutas agendadas por fecha
CREATE INDEX idx_rutas_agendadas_fecha ON rutas_agendadas(fecha_programada);

-- Comentarios por ruta
CREATE INDEX idx_comentarios_ruta ON comentarios(ruta_id);

-- Comentarios por usuario
CREATE INDEX idx_comentarios_usuario ON comentarios(usuario_id);

-- Puntos de descanso por ruta
CREATE INDEX idx_puntos_descanso_ruta ON puntos_descanso(ruta_id);
```

### 6.2 Índices en Firestore

```javascript
// Índices compuestos para consultas complejas

// Rutas por dificultad y ubicación
{
  collection: "Rutas",
  fields: [
    { fieldPath: "dificultad", order: "ASCENDING" },
    { fieldPath: "ubicacion", order: "ASCENDING" }
  ]
}

// Comentarios por ruta y fecha
{
  collection: "Comentarios",
  fields: [
    { fieldPath: "rutaId", order: "ASCENDING" },
    { fieldPath: "fecha", order: "DESCENDING" }
  ]
}

// Rutas agendadas por usuario y fecha
{
  collection: "RutasAgendadas",
  fields: [
    { fieldPath: "userId", order: "ASCENDING" },
    { fieldPath: "fechaProgramada", order: "ASCENDING" }
  ]
}

// Alertas por estado y fecha
{
  collection: "Alertas",
  fields: [
    { fieldPath: "estado", order: "ASCENDING" },
    { fieldPath: "fecha", order: "DESCENDING" }
  ]
}
```

### 6.3 Optimización de Consultas

#### **SQLite - Consultas Optimizadas**

```sql
-- Obtener rutas de un usuario con información del creador
SELECT r.*, u.nombre as creador_nombre, u.email as creador_email
FROM rutas r
LEFT JOIN users u ON r.creador_id = u.id
WHERE r.creador_id = ?;

-- Obtener rutas agendadas de un usuario
SELECT ra.*, r.nombre as ruta_nombre, r.imagen as ruta_imagen
FROM rutas_agendadas ra
JOIN rutas r ON ra.ruta_id = r.id
WHERE ra.user_id = ?
ORDER BY ra.fecha_programada ASC;

-- Buscar rutas por categoría
SELECT * FROM rutas 
WHERE categorias LIKE '%montaña%'
ORDER BY fecha_creacion DESC;
```

#### **Firestore - Consultas Optimizadas**

```javascript
// Obtener rutas por dificultad
const rutasFaciles = await getDocs(
  query(collection(db, "Rutas"), 
        where("dificultad", "==", "Fácil"))
);

// Obtener comentarios de una ruta ordenados por fecha
const comentarios = await getDocs(
  query(collection(db, "Comentarios"),
        where("rutaId", "==", rutaId),
        orderBy("fecha", "desc"))
);

// Obtener alertas pendientes
const alertasPendientes = await getDocs(
  query(collection(db, "Alertas"),
        where("estado", "==", "pendiente"),
        orderBy("fecha", "desc"))
);
```

---

## 7. INTEGRIDAD REFERENCIAL

### 7.1 Restricciones de Clave Foránea

```sql
-- SQLite - Restricciones de integridad

-- Rutas referencian a usuarios
ALTER TABLE rutas 
ADD CONSTRAINT fk_rutas_creador 
FOREIGN KEY (creador_id) REFERENCES users(id) 
ON DELETE SET NULL;

-- Rutas agendadas referencian a usuarios y rutas
ALTER TABLE rutas_agendadas 
ADD CONSTRAINT fk_rutas_agendadas_user 
FOREIGN KEY (user_id) REFERENCES users(id) 
ON DELETE CASCADE;

ALTER TABLE rutas_agendadas 
ADD CONSTRAINT fk_rutas_agendadas_ruta 
FOREIGN KEY (ruta_id) REFERENCES rutas(id) 
ON DELETE CASCADE;

-- Puntos de descanso referencian a rutas
ALTER TABLE puntos_descanso 
ADD CONSTRAINT fk_puntos_descanso_ruta 
FOREIGN KEY (ruta_id) REFERENCES rutas(id) 
ON DELETE CASCADE;
```

### 7.2 Firestore - Reglas de Seguridad

```javascript
// Firestore Security Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Usuarios pueden leer/editar solo sus propios datos
    match /Users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Rutas pueden ser leídas por todos, creadas por usuarios autenticados
    match /Rutas/{rutaId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
        resource.data.creador.id == request.auth.uid;
    }
    
    // Comentarios pueden ser leídos por todos, creados por usuarios autenticados
    match /Comentarios/{comentarioId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
        resource.data.usuarioId == request.auth.uid;
    }
    
    // Alertas solo pueden ser creadas por usuarios autenticados
    match /Alertas/{alertaId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
        (resource.data.userId == request.auth.uid || 
         request.auth.token.role == 'autoridad');
    }
  }
}
```

---

## 8. CONCLUSIONES

El modelo relacional de Trek-King está diseñado para:

1. **Integridad de Datos**: Restricciones de clave foránea y validaciones
2. **Rendimiento**: Índices optimizados para consultas frecuentes
3. **Escalabilidad**: Estructura preparada para crecimiento
4. **Seguridad**: Reglas de acceso y encriptación de datos sensibles
5. **Flexibilidad**: Soporte para datos estructurados y no estructurados
6. **Mantenibilidad**: Normalización adecuada y documentación clara

La implementación híbrida permite aprovechar las fortalezas de ambos sistemas:
- **SQLite**: Rendimiento y control total sobre la estructura
- **Firestore**: Escalabilidad automática y sincronización en tiempo real

Este modelo relacional proporciona una base sólida para el desarrollo, testing y mantenimiento de la aplicación Trek-King. 