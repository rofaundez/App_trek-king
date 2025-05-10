import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getStorage, provideStorage } from '@angular/fire/storage';

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideFirebaseApp(() => initializeApp({
      projectId: "pruebas-66a82",
      appId: "1:892518237032:web:630c2e3f70201b5d030cdd",
      storageBucket: "pruebas-66a82.firebasestorage.app",
      apiKey: "AIzaSyCVKRDCIYMpjLmNrc9QCK1lT_GiZYwSYKg",
      authDomain: "pruebas-66a82.firebaseapp.com",
      messagingSenderId: "892518237032",
      measurementId: "G-MVDKD4D558"
    })),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage())
  ],
});
