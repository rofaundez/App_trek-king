# Ambiente de Desarrollo - Trek-King

## Descripción General

El ambiente de desarrollo de Trek-King es un ecosistema completo de herramientas, tecnologías y configuraciones que permiten a los desarrolladores crear, probar y mantener la aplicación de manera eficiente y colaborativa.

---

## ARQUITECTURA DEL AMBIENTE DE DESARROLLO

### **1. Stack Tecnológico Principal**

#### **Frontend Framework**
- **Angular 17+**: Framework principal para la estructura de la aplicación
- **Ionic 7+**: UI Toolkit para aplicaciones móviles híbridas
- **TypeScript 5+**: Lenguaje de programación con tipado estático
- **Capacitor 5+**: Entorno de ejecución nativo para aplicaciones web

#### **Backend y Servicios en la Nube**
- **Firebase**: Plataforma de desarrollo de Google
  - **Firestore**: Base de datos NoSQL en tiempo real
  - **Authentication**: Sistema de autenticación de usuarios
  - **Storage**: Almacenamiento de archivos e imágenes
  - **Hosting**: Alojamiento de la aplicación web

#### **Base de Datos Local**
- **SQLite**: Base de datos local para funcionamiento offline
- **@capacitor-community/sqlite**: Plugin para integración nativa

#### **Herramientas de Desarrollo**
- **Node.js 18+**: Entorno de ejecución JavaScript
- **npm/yarn**: Gestores de paquetes
- **Git**: Control de versiones
- **GitHub**: Repositorio remoto y colaboración

---

## CONFIGURACIÓN DEL AMBIENTE LOCAL

### **2. Prerrequisitos del Sistema**

#### **Sistema Operativo**
- **Windows 10/11** (64-bit)
- **macOS 10.15+** (para desarrollo iOS)
- **Ubuntu 20.04+** / **Debian 11+**

#### **Requisitos de Hardware**
- **RAM**: Mínimo 8GB, recomendado 16GB
- **Almacenamiento**: Mínimo 10GB de espacio libre
- **Procesador**: Intel i5/AMD Ryzen 5 o superior
- **Conexión a Internet**: Estable para descargas y sincronización

#### **Software Base**
- **Node.js 18.17.0+**: [Descargar desde nodejs.org](https://nodejs.org/)
- **Git 2.30+**: [Descargar desde git-scm.com](https://git-scm.com/)
- **Visual Studio Code**: [Descargar desde code.visualstudio.com](https://code.visualstudio.com/)

### **3. Configuración Inicial**

#### **Instalación de Herramientas Globales**
```bash
# Instalar Ionic CLI globalmente
npm install -g @ionic/cli

# Instalar Angular CLI globalmente
npm install -g @angular/cli

# Instalar Capacitor CLI globalmente
npm install -g @capacitor/cli

# Verificar instalaciones
ionic --version
ng version
npx cap --version
```

#### **Configuración de Git**
```bash
# Configurar identidad de desarrollador
git config --global user.name "Tu Nombre"
git config --global user.email "tu.email@ejemplo.com"

# Configurar editor por defecto
git config --global core.editor "code --wait"

# Configurar rama principal
git config --global init.defaultBranch main
```

---

## ESTRUCTURA DEL PROYECTO

### **4. Organización de Carpetas**

```
App_trek-king/
├── src/                          # Código fuente principal
│   ├── app/                      # Componentes Angular
│   │   ├── autoridades/          # Portal de autoridades
│   │   ├── components/           # Componentes reutilizables
│   │   ├── services/             # Servicios y lógica de negocio
│   │   ├── models/               # Interfaces y modelos
│   │   ├── guards/               # Protección de rutas
│   │   └── ...                   # Otras páginas y módulos
│   ├── assets/                   # Recursos estáticos
│   │   ├── img/                  # Imágenes
│   │   └── i18n/                 # Archivos de internacionalización
│   └── environments/             # Configuraciones por entorno
├── android/                      # Proyecto nativo Android
├── ios/                          # Proyecto nativo iOS (si aplica)
├── docs/                         # Documentación del proyecto
├── tests/                        # Tests automatizados
└── config/                       # Archivos de configuración
```

### **5. Archivos de Configuración Clave**

#### **package.json**
```json
{
  "name": "trek-king",
  "version": "1.0.0",
  "scripts": {
    "start": "ionic serve",
    "build": "ionic build",
    "test": "ng test",
    "lint": "ng lint",
    "e2e": "ng e2e",
    "cap:sync": "npx cap sync",
    "cap:open:android": "npx cap open android",
    "cap:run:android": "npx cap run android"
  },
  "dependencies": {
    "@angular/core": "^17.0.0",
    "@ionic/angular": "^7.0.0",
    "@capacitor/core": "^5.0.0",
    "@capacitor-community/sqlite": "^5.0.0",
    "firebase": "^10.0.0"
  }
}
```

#### **capacitor.config.ts**
```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.trekking.app',
  appName: 'Trek-King',
  webDir: 'www',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000
    }
  }
};

export default config;
```

#### **angular.json**
```json
{
  "projects": {
    "trek-king": {
      "architect": {
        "build": {
          "options": {
            "outputPath": "www",
            "index": "src/index.html",
            "main": "src/main.ts",
            "polyfills": "src/polyfills.ts",
            "tsConfig": "tsconfig.app.json"
          }
        }
      }
    }
  }
}
```

---

## FLUJO DE DESARROLLO

### **6. Proceso de Desarrollo**

#### **Configuración del Repositorio**
```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/trek-king.git
cd trek-king

# Instalar dependencias
npm install

# Configurar variables de entorno
cp src/environments/environment.example.ts src/environments/environment.ts
# Editar environment.ts con las credenciales de Firebase
```

#### **Comandos de Desarrollo**
```bash
# Iniciar servidor de desarrollo
ionic serve

# Construir para producción
ionic build

# Sincronizar con plataformas nativas
npx cap sync

# Abrir proyecto Android en Android Studio
npx cap open android

# Ejecutar en dispositivo Android
npx cap run android
```

### **7. Gestión de Dependencias**

#### **Instalación de Nuevas Dependencias**
```bash
# Dependencias de producción
npm install nombre-paquete

# Dependencias de desarrollo
npm install --save-dev nombre-paquete

# Sincronizar después de instalar plugins de Capacitor
npx cap sync
```

#### **Actualización de Dependencias**
```bash
# Verificar dependencias desactualizadas
npm outdated

# Actualizar dependencias
npm update

# Actualizar a versiones más recientes
npm install nombre-paquete@latest
```

---

## CONFIGURACIÓN DE FIREBASE

### **8. Configuración del Proyecto Firebase**

#### **Creación del Proyecto**
1. Ir a [Firebase Console](https://console.firebase.google.com/)
2. Crear nuevo proyecto: "Trek-King"
3. Habilitar servicios:
   - **Authentication**: Email/Password
   - **Firestore Database**: Modo de producción
   - **Storage**: Reglas de seguridad

#### **Configuración en el Código**
```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  firebase: {
    apiKey: "tu-api-key",
    authDomain: "trek-king.firebaseapp.com",
    projectId: "trek-king",
    storageBucket: "trek-king.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef123456"
  }
};
```

#### **Reglas de Seguridad Firestore**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Usuarios pueden leer/escribir sus propios datos
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Rutas públicas para lectura, escritura solo para creadores
    match /rutas/{rutaId} {
      allow read: if true;
      allow write: if request.auth != null && 
        request.auth.uid == resource.data.creador.id;
    }
    
    // Autoridades pueden acceder a todo
    match /{document=**} {
      allow read, write: if request.auth != null && 
        exists(/databases/$(database)/documents/autoridades/$(request.auth.uid));
    }
  }
}
```

---

## HERRAMIENTAS DE DESARROLLO

### **9. IDE y Extensiones Recomendadas**

#### **Visual Studio Code**
- **Extensiones Esenciales**:
  - Angular Language Service
  - Ionic Snippets
  - TypeScript Importer
  - GitLens
  - Prettier - Code formatter
  - ESLint
  - Auto Rename Tag
  - Bracket Pair Colorizer

#### **Configuración de VS Code**
```json
// .vscode/settings.json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "files.associations": {
    "*.scss": "scss"
  }
}
```

### **10. Herramientas de Testing**

#### **Configuración de Tests**
```bash
# Instalar herramientas de testing
npm install --save-dev @angular/cli
npm install --save-dev @ionic/angular-testing
npm install --save-dev jasmine-core
npm install --save-dev karma
```

#### **Ejecución de Tests**
```bash
# Tests unitarios
ng test

# Tests e2e
ng e2e

# Tests con coverage
ng test --code-coverage
```

---

## DESPLIEGUE Y PRODUCCIÓN

### **11. Ambiente de Producción**

#### **Configuración de Build**
```bash
# Build para producción
ionic build --prod

# Build con optimizaciones
ionic build --prod --release
```

#### **Despliegue en Firebase Hosting**
```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Login a Firebase
firebase login

# Inicializar proyecto
firebase init hosting

# Desplegar
firebase deploy
```

#### **Configuración de Android**
```bash
# Generar APK de release
cd android
./gradlew assembleRelease

# Firmar APK
./gradlew bundleRelease
```

---

## MONITOREO Y DEBUGGING

### **12. Herramientas de Debugging**

#### **Chrome DevTools**
- **Elements**: Inspección de DOM
- **Console**: Logs y debugging
- **Network**: Monitoreo de requests
- **Application**: Storage y cache
- **Performance**: Análisis de rendimiento

#### **Ionic DevApp**
```bash
# Instalar Ionic DevApp
ionic capacitor run android --livereload --external

# Conectar dispositivo físico
ionic capacitor run android --device
```

#### **Firebase Console**
- **Analytics**: Métricas de uso
- **Crashlytics**: Reportes de errores
- **Performance**: Monitoreo de rendimiento
- **Remote Config**: Configuración remota

---

## COLABORACIÓN Y CONTROL DE VERSIONES

### **13. Flujo de Git**

#### **Branches**
- **main**: Código de producción
- **develop**: Código en desarrollo
- **feature/**: Nuevas funcionalidades
- **hotfix/**: Correcciones urgentes
- **release/**: Preparación de releases

#### **Commits**
```bash
# Estructura de commits
feat: añadir sistema de comentarios
fix: corregir error de autenticación
docs: actualizar README
style: formatear código
refactor: refactorizar servicio de rutas
test: añadir tests para auth service
chore: actualizar dependencias
```

#### **Pull Requests**
- **Título descriptivo**
- **Descripción detallada**
- **Screenshots si aplica**
- **Tests incluidos**
- **Review obligatorio**

---

## SEGURIDAD Y BUENAS PRÁCTICAS

### **14. Seguridad del Código**

#### **Variables de Entorno**
```bash
# .env (NO subir al repositorio)
FIREBASE_API_KEY=tu-api-key-secreta
FIREBASE_PROJECT_ID=trek-king
```

#### **Validación de Datos**
```typescript
// Validación en formularios
import { Validators } from '@angular/forms';

this.form = this.fb.group({
  email: ['', [Validators.required, Validators.email]],
  password: ['', [Validators.required, Validators.minLength(6)]]
});
```

#### **Sanitización de Datos**
```typescript
// Sanitizar entrada de usuario
import { DomSanitizer } from '@angular/platform-browser';

constructor(private sanitizer: DomSanitizer) {}

sanitizeInput(input: string): string {
  return this.sanitizer.sanitize(SecurityContext.HTML, input);
}
```

### **15. Optimización de Rendimiento**

#### **Lazy Loading**
```typescript
// Carga diferida de módulos
const routes: Routes = [
  {
    path: 'autoridades',
    loadChildren: () => import('./autoridades/autoridades.module')
      .then(m => m.AutoridadesModule)
  }
];
```

#### **OnPush Change Detection**
```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MiComponente {
  // Optimización de detección de cambios
}
```

---

## DOCUMENTACIÓN Y MANTENIMIENTO

### **16. Documentación del Código**

#### **JSDoc Comments**
```typescript
/**
 * Servicio para gestionar la autenticación de usuarios
 * @class AuthService
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  /**
   * Inicia sesión de un usuario
   * @param email - Email del usuario
   * @param password - Contraseña del usuario
   * @returns Promise con el resultado del login
   */
  async login(email: string, password: string): Promise<boolean> {
    // Implementación
  }
}
```

#### **README del Proyecto**
- Descripción del proyecto
- Instrucciones de instalación
- Comandos de desarrollo
- Estructura del proyecto
- Contribución

---

## RESUMEN DEL AMBIENTE DE DESARROLLO

### **Herramientas Principales**
- **Framework**: Angular 17 + Ionic 7
- **Lenguaje**: TypeScript 5
- **Base de Datos**: Firebase Firestore + SQLite
- **Control de Versiones**: Git + GitHub
- **IDE**: Visual Studio Code
- **Testing**: Jasmine + Karma
- **Despliegue**: Firebase Hosting

### **Flujo de Trabajo**
1. **Setup**: Instalación de herramientas y configuración
2. **Desarrollo**: Codificación con hot reload
3. **Testing**: Tests unitarios y e2e
4. **Review**: Code review y pull requests
5. **Deploy**: Despliegue a producción
6. **Monitor**: Monitoreo y debugging

### **Buenas Prácticas**
- **Código limpio** y documentado
- **Tests automatizados** para funcionalidades críticas
- **Code review** obligatorio
- **Seguridad** en todas las capas
- **Optimización** de rendimiento
- **Documentación** actualizada

Este ambiente de desarrollo proporciona una base sólida para el desarrollo colaborativo, mantenimiento y escalabilidad de la aplicación Trek-King. 