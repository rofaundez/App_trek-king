# Requerimientos Funcionales y No Funcionales - Trek-King

## Descripción General

Trek-King es una aplicación móvil multiplataforma para entusiastas del senderismo que permite descubrir, crear y agendar rutas, mientras ofrece un portal dedicado para autoridades y equipos de rescate para monitorear la actividad y gestionar emergencias.

---

## REQUERIMIENTOS FUNCIONALES (RF)

### **RF-01: Sistema de Autenticación Dual**
**Descripción**: La aplicación debe permitir el registro e inicio de sesión diferenciado para dos tipos de usuarios: senderistas y autoridades.
- **RF-01.1**: Registro de usuarios senderistas con email, contraseña, nombre, apellido, RUT y foto opcional
- **RF-01.2**: Registro de autoridades con email, contraseña, nombre, cargo, institución y zona de responsabilidad
- **RF-01.3**: Inicio de sesión diferenciado para cada tipo de usuario
- **RF-01.4**: Recuperación de contraseña para ambos tipos de usuarios
- **RF-01.5**: Protección de rutas mediante AuthGuard según el tipo de usuario

### **RF-02: Gestión de Rutas de Senderismo**
**Descripción**: Sistema completo para la creación, visualización y gestión de rutas de senderismo.
- **RF-02.1**: Visualización de rutas predefinidas con información detallada (nombre, ubicación, dificultad, imagen, descripción)
- **RF-02.2**: Creación de nuevas rutas por parte de usuarios con trazado en mapa, puntos de inicio y término
- **RF-02.3**: Categorización automática de rutas según características del terreno
- **RF-02.4**: Sistema de filtrado por categorías (Montañas, Ríos, Lagos, Cascadas, Nieve, Parques, Playas)
- **RF-02.5**: Visualización de características específicas (tipo de terreno, mejor época, recomendaciones)
- **RF-02.6**: Gestión de puntos de interés en las rutas con imágenes y descripciones
- **RF-02.7**: Sistema de puntos de descanso con coordenadas geográficas

### **RF-03: Sistema de Agenda Personal**
**Descripción**: Permite a los usuarios agendar rutas para fechas específicas.
- **RF-03.1**: Agendado de rutas con selección de fecha y hora
- **RF-03.2**: Visualización de rutas agendadas en calendario personal
- **RF-03.3**: Eliminación de rutas agendadas
- **RF-03.4**: Verificación de disponibilidad de fechas (no permitir fechas pasadas)
- **RF-03.5**: Almacenamiento persistente de agendas en Firebase

### **RF-04: Portal de Autoridades**
**Descripción**: Panel de control exclusivo para autoridades y equipos de rescate.
- **RF-04.1**: Visualización de todas las rutas agendadas por todos los usuarios
- **RF-04.2**: Filtros por fecha (Hoy, Esta Semana, Este Mes, Todas)
- **RF-04.3**: Búsqueda de rutas por nombre, ubicación o descripción
- **RF-04.4**: Visualización de información detallada de usuarios que agendaron rutas
- **RF-04.5**: Acceso a detalles completos de cada ruta agendada
- **RF-04.6**: Interfaz diferenciada y protegida para autoridades

### **RF-05: Sistema de Emergencia SOS**
**Descripción**: Sistema de alertas de emergencia para situaciones críticas durante el senderismo.
- **RF-05.1**: Botón SOS con cuenta regresiva de 90 segundos
- **RF-05.2**: Selección de tipo de emergencia (incapacitado, perdido, obstáculo, incendio, animal herido)
- **RF-05.3**: Obtención automática de ubicación GPS del usuario
- **RF-05.4**: Envío de alerta a autoridades con información completa del usuario
- **RF-05.5**: Instrucciones específicas según el tipo de emergencia
- **RF-05.6**: Gestión de alertas por parte de autoridades (ver, actualizar estado)
- **RF-05.7**: Generación de reportes PDF de alertas

### **RF-06: Sistema de Comentarios y Calificaciones**
**Descripción**: Permite a los usuarios evaluar y comentar sobre las rutas.
- **RF-06.1**: Sistema de calificación con estrellas (1-5)
- **RF-06.2**: Comentarios de texto sobre las rutas
- **RF-06.3**: Cálculo automático de calificación promedio por ruta
- **RF-06.4**: Visualización de comentarios y calificaciones en tiempo real
- **RF-06.5**: Validación de usuario autenticado para comentar

### **RF-07: Sistema de Búsqueda de Grupos**
**Descripción**: Permite a los usuarios buscar compañeros para realizar rutas específicas.
- **RF-07.1**: Publicación de búsqueda de grupo para rutas específicas
- **RF-07.2**: Visualización de todas las búsquedas de grupo activas
- **RF-07.3**: Sistema de comentarios en publicaciones de grupo
- **RF-07.4**: Respuestas anidadas a comentarios
- **RF-07.5**: Eliminación de publicaciones propias
- **RF-07.6**: Filtrado y búsqueda de publicaciones de grupo

### **RF-08: Gestión de Perfiles de Usuario**
**Descripción**: Permite a los usuarios gestionar su información personal.
- **RF-08.1**: Visualización de perfil personal con información básica
- **RF-08.2**: Edición de datos personales (nombre, apellido, foto)
- **RF-08.3**: Visualización de rutas creadas por el usuario
- **RF-08.4**: Gestión de rutas propias (editar, eliminar)
- **RF-08.5**: Cerrar sesión y cambio de usuario

### **RF-09: Sistema de Navegación y Mapas**
**Descripción**: Integración con mapas para visualización y creación de rutas.
- **RF-09.1**: Visualización de rutas en mapas interactivos
- **RF-09.2**: Trazado de rutas personalizadas con puntos de inicio y término
- **RF-09.3**: Integración con OpenStreetMap para datos cartográficos
- **RF-09.4**: Coordenadas geográficas para ubicaciones precisas

### **RF-10: Sistema de Notificaciones**
**Descripción**: Alertas y notificaciones para mantener informados a los usuarios.
- **RF-10.1**: Notificaciones de éxito/error en operaciones
- **RF-10.2**: Alertas de confirmación para acciones críticas
- **RF-10.3**: Mensajes informativos sobre el estado de la aplicación

---

## REQUERIMIENTOS NO FUNCIONALES (RNF)

### **RNF-01: Rendimiento**
**Descripción**: La aplicación debe responder de manera eficiente a las interacciones del usuario.
- **RNF-01.1**: Tiempo de respuesta máximo de 3 segundos para operaciones de lectura
- **RNF-01.2**: Tiempo de respuesta máximo de 5 segundos para operaciones de escritura
- **RNF-01.3**: Soporte para al menos 1000 usuarios concurrentes
- **RNF-01.4**: Optimización de carga de imágenes con lazy loading
- **RNF-01.5**: Cache local para datos frecuentemente consultados

### **RNF-02: Escalabilidad**
**Descripción**: La aplicación debe poder crecer sin degradar el rendimiento.
- **RNF-02.1**: Arquitectura híbrida que soporte escalado automático
- **RNF-02.2**: Base de datos distribuida (Firebase + SQLite local)
- **RNF-02.3**: Capacidad de manejar 10,000+ rutas sin degradación
- **RNF-02.4**: Soporte para múltiples regiones geográficas

### **RNF-03: Disponibilidad**
**Descripción**: La aplicación debe estar disponible la mayor parte del tiempo.
- **RNF-03.1**: Disponibilidad del 99.5% del tiempo (máximo 3.6 horas de inactividad por mes)
- **RNF-03.2**: Funcionamiento offline para funcionalidades críticas
- **RNF-03.3**: Sincronización automática cuando se recupera la conexión
- **RNF-03.4**: Recuperación automática de errores de red

### **RNF-04: Seguridad**
**Descripción**: Protección de datos y acceso no autorizado.
- **RNF-04.1**: Autenticación segura mediante Firebase Auth
- **RNF-04.2**: Encriptación de contraseñas con hash
- **RNF-04.3**: Validación de datos en frontend y backend
- **RNF-04.4**: Autorización basada en roles (Usuario/Autoridad)
- **RNF-04.5**: Protección contra inyección de código malicioso
- **RNF-04.6**: Validación de entrada de datos en todos los formularios

### **RNF-05: Usabilidad**
**Descripción**: La interfaz debe ser intuitiva y fácil de usar.
- **RNF-05.1**: Interfaz responsive que se adapte a diferentes tamaños de pantalla
- **RNF-05.2**: Navegación intuitiva con máximo 3 niveles de profundidad
- **RNF-05.3**: Feedback visual inmediato para todas las acciones del usuario
- **RNF-05.4**: Mensajes de error claros y orientativos
- **RNF-05.5**: Accesibilidad para usuarios con discapacidades visuales
- **RNF-05.6**: Soporte para múltiples idiomas (español e inglés)

### **RNF-06: Compatibilidad**
**Descripción**: La aplicación debe funcionar en múltiples plataformas.
- **RNF-06.1**: Compatibilidad con Android 8.0 (API 26) y versiones superiores
- **RNF-06.2**: Compatibilidad con iOS 12.0 y versiones superiores
- **RNF-06.3**: Funcionamiento en navegadores web modernos (Chrome, Firefox, Safari, Edge)
- **RNF-06.4**: Adaptación automática a diferentes resoluciones de pantalla
- **RNF-06.5**: Soporte para orientación vertical y horizontal

### **RNF-07: Mantenibilidad**
**Descripción**: El código debe ser fácil de mantener y actualizar.
- **RNF-07.1**: Arquitectura modular con separación clara de responsabilidades
- **RNF-07.2**: Documentación completa del código y APIs
- **RNF-07.3**: Uso de TypeScript para tipado estático
- **RNF-07.4**: Patrones de diseño consistentes en toda la aplicación
- **RNF-07.5**: Tests unitarios para componentes críticos

### **RNF-08: Confiabilidad**
**Descripción**: La aplicación debe funcionar de manera consistente y confiable.
- **RNF-08.1**: Manejo robusto de errores de red y servidor
- **RNF-08.2**: Validación de integridad de datos
- **RNF-08.3**: Backup automático de datos críticos
- **RNF-08.4**: Recuperación automática de sesiones interrumpidas
- **RNF-08.5**: Logs detallados para debugging y monitoreo

### **RNF-09: Eficiencia**
**Descripción**: Optimización del uso de recursos del dispositivo.
- **RNF-09.1**: Consumo de batería optimizado
- **RNF-09.2**: Uso eficiente de datos móviles
- **RNF-09.3**: Almacenamiento local optimizado
- **RNF-09.4**: Compresión de imágenes y datos
- **RNF-09.5**: Lazy loading de componentes y datos

### **RNF-10: Interoperabilidad**
**Descripción**: Capacidad de integrarse con otros sistemas y servicios.
- **RNF-10.1**: Integración con servicios de mapas (OpenStreetMap)
- **RNF-10.2**: Compatibilidad con estándares de geolocalización
- **RNF-10.3**: APIs RESTful para integración futura
- **RNF-10.4**: Exportación de datos en formatos estándar (PDF, JSON)
- **RNF-10.5**: Capacidad de integración con sistemas de emergencia externos

---

## RESUMEN DE REQUERIMIENTOS

### **Requerimientos Funcionales**: 10 categorías principales con 47 sub-requerimientos
### **Requerimientos No Funcionales**: 10 categorías principales con 50 sub-requerimientos

**Total de Requerimientos**: 97 requerimientos documentados

Este documento proporciona una base sólida para el desarrollo, mantenimiento y evolución de la aplicación Trek-King, asegurando que todos los aspectos funcionales y de calidad estén claramente definidos y documentados. 