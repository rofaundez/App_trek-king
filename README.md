# Trek-King: Aplicación de Senderismo y Seguridad

Trek-King es una aplicación móvil multiplataforma, desarrollada con Ionic y Angular, diseñada para entusiastas del senderismo. Permite a los usuarios descubrir, crear, y agendar rutas, mientras ofrece un portal dedicado para autoridades y equipos de rescate para monitorear la actividad y gestionar emergencias.

## Tabla de Contenidos

- [Trek-King: Aplicación de Senderismo y Seguridad](#trek-king-aplicación-de-senderismo-y-seguridad)
  - [Tabla de Contenidos](#tabla-de-contenidos)
  - [Sobre el Proyecto](#sobre-el-proyecto)
  - [Características Principales](#características-principales)
  - [Tecnologías Utilizadas](#tecnologías-utilizadas)
  - [Empezando](#empezando)
    - [Prerrequisitos](#prerrequisitos)
    - [Instalación](#instalación)
    - [Configuración de Firebase](#configuración-de-firebase)
  - [Comandos Útiles](#comandos-útiles)
  - [Estructura del Proyecto](#estructura-del-proyecto)

## Sobre el Proyecto

El objetivo de Trek-King es doble:

1.  **Para los Senderistas:** Ofrecer una herramienta completa para planificar sus aventuras. Los usuarios pueden explorar rutas existentes, ver detalles como dificultad y duración, y agendarlas en su calendario personal. También pueden proponer nuevas rutas para que la comunidad las descubra.
2.  **Para las Autoridades:** Proporcionar un panel de control centralizado (`Panel de Operador`) donde pueden visualizar todas las rutas agendadas por los usuarios. Esto les permite tener un conocimiento proactivo de la ubicación de los senderistas, gestionar alertas de SOS y coordinar respuestas a emergencias de manera más eficiente.

La aplicación utiliza Firebase para la gestión de datos en tiempo real y una base de datos SQLite nativa en el dispositivo para garantizar un funcionamiento robusto y offline.

## Características Principales

-   **Doble Rol de Usuario:** Sistema de autenticación diferenciado para `Usuarios` y `Autoridades`.
-   **Gestión de Rutas:**
    -   Exploración de rutas predefinidas y creadas por la comunidad.
    -   Creación y propuesta de nuevas rutas por parte de los usuarios.
    -   Validación y aprobación de rutas por parte de las autoridades.
-   **Agenda Personal:** Los usuarios pueden agendar rutas, especificando fecha y hora.
-   **Panel de Autoridades:**
    -   Visualización de todas las rutas agendadas por todos los usuarios.
    -   Filtros por fecha (Hoy, Esta Semana, Este Mes).
    -   Gestión de alertas de emergencia (SOS).
    -   Generación de reportes en PDF.
-   **Base de Datos Híbrida:** Uso de Firestore para datos en tiempo real y SQLite para persistencia en el dispositivo móvil, garantizando funcionamiento incluso sin conexión.
-   **Multiplataforma:** Construido con Ionic y Capacitor para funcionar en Android, iOS y la Web desde una única base de código.

## Tecnologías Utilizadas

-   [Angular](https://angular.io/): Framework principal para la estructura de la aplicación.
-   [Ionic](https://ionicframework.com/): UI Toolkit para construir aplicaciones de alta calidad.
-   [Capacitor](https://capacitorjs.com/): Entorno de ejecución nativo para aplicaciones web.
-   [TypeScript](https://www.typescriptlang.org/): Lenguaje de programación principal.
-   [Firebase](https://firebase.google.com/):
    -   **Firestore:** Base de datos NoSQL para datos en tiempo real.
    -   **Storage:** Almacenamiento de imágenes y archivos.
    -   **Authentication:** Gestión de usuarios.
-   [Capacitor Community SQLite](https://github.com/capacitor-community/sqlite): Plugin para la base de datos SQLite nativa en el dispositivo.

## Empezando

Sigue estos pasos para obtener una copia local del proyecto y ponerla en marcha.

### Prerrequisitos

Asegúrate de tener instalado Node.js y el CLI de Ionic.

-   **Node.js:** [Descargar](https://nodejs.org/)
-   **Ionic CLI:**
    ```sh
    npm install -g @ionic/cli
    ```

### Instalación

1.  **Clona el repositorio:**
    ```sh
    git clone https://URL_DE_TU_REPOSITORIO.git
    cd nombre-del-directorio
    ```
2.  **Instala las dependencias de NPM:**
    ```sh
    npm install
    ```

### Configuración de Firebase

La aplicación requiere credenciales de un proyecto de Firebase para funcionar.

1.  Ve a la [Consola de Firebase](https://console.firebase.google.com/) y crea un nuevo proyecto.
2.  Activa **Firestore Database** y **Storage**.
3.  En la configuración de tu proyecto de Firebase, crea una nueva "Aplicación web".
4.  Copia el objeto de configuración de Firebase que se te proporciona.
5.  Pega tus credenciales en el archivo `src/environments/environment.ts`:

    ```typescript
    // src/environments/environment.ts
    
    export const environment = {
      production: false,
      firebase: {
        // Pega tu configuración aquí
        projectId: "TU_PROJECT_ID",
        appId: "TU_APP_ID",
        storageBucket: "TU_STORAGE_BUCKET",
        apiKey: "TU_API_KEY",
        authDomain: "TU_AUTH_DOMAIN",
        messagingSenderId: "TU_MESSAGING_SENDER_ID"
      }
    };
    ```

## Comandos Útiles

-   **Ejecutar en el navegador para desarrollo:**
    ```sh
    ionic serve
    ```

-   **Construir la aplicación web:**
    ```sh
    ionic build
    ```

-   **Sincronizar con la plataforma nativa (Android/iOS):**
    ```sh
    npx cap sync
    ```

-   **Ejecutar en un dispositivo Android (con Android Studio configurado):**
    ```sh
    npx cap run android
    ```

## Estructura del Proyecto

A continuación se muestra una descripción detallada de la estructura de carpetas del proyecto:

```
src/
├── app/
│   ├── autoridades/           # Portal exclusivo para autoridades
│   │   ├── home/             # Panel de control principal
│   │   ├── login/            # Autenticación de autoridades
│   │   └── perfil/           # Gestión de perfil de autoridad
│   ├── components/           # Componentes reutilizables
│   │   ├── header/           # Encabezado de la aplicación
│   │   └── footer/           # Pie de página
│   ├── create-route/         # Creación de nuevas rutas
│   ├── grupos/               # Gestión de grupos de senderismo
│   ├── guards/               # Protección de rutas (AuthGuard)
│   ├── home/                 # Página principal para usuarios
│   ├── informaciones/        # Información general de la app
│   ├── interface/            # Interfaces TypeScript
│   ├── listado-usuario/      # Lista de usuarios registrados
│   ├── login/                # Autenticación de usuarios
│   ├── menu/                 # Menú principal de navegación
│   ├── models/               # Modelos de datos
│   ├── my-routes/            # Rutas del usuario actual
│   ├── profile/              # Perfil de usuario
│   ├── recover/              # Recuperación de contraseña
│   ├── registro/             # Registro de nuevos usuarios
│   ├── reset-bbdd/           # Herramientas de administración
│   ├── ruta-detalles/        # Detalles de rutas específicas
│   ├── services/             # Servicios de la aplicación
│   │   ├── auth.service.ts           # Autenticación
│   │   ├── database.service.ts       # Base de datos SQLite
│   │   ├── rutas-guardadas.service.ts # Gestión de rutas
│   │   └── ...                        # Otros servicios
│   └── sos/                  # Sistema de emergencia SOS
├── assets/                   # Recursos estáticos
│   ├── img/                  # Imágenes de la aplicación
│   └── i18n/                 # Archivos de internacionalización
└── environments/             # Configuraciones por entorno
    ├── environment.ts        # Configuración de desarrollo
    └── environment.prod.ts   # Configuración de producción

android/                      # Proyecto nativo de Android
capacitor.config.ts           # Configuración principal de Capacitor
```

