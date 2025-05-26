import { Component, OnInit, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController } from '@ionic/angular';
import { DatabaseService } from '../services/database.service';
import { AuthService } from '../services/auth.service';
import { Rutas } from '../models/rutas.model';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../components/header/header.component';
import { FooterComponent } from '../components/footer/footer.component';
import { RutasGuardadasService } from '../services/rutas-guardadas.service';

@Component({
  selector: 'app-my-routes',
  templateUrl: './my-routes.page.html',
  styleUrls: ['./my-routes.page.scss'],
  standalone: true,
  imports: [
    IonicModule, 
    CommonModule, 
    FormsModule, 
    RouterModule,
    FooterComponent,
    HeaderComponent
  ]
})
export class MyRoutesPage implements OnInit {
  myRoutes: Rutas[] = [];
  userProfile: any = {
    photo: 'assets/img/userLogo.png',
    nombre: '',
    email: ''
  };
  originalProfile: any;

  constructor(
    private dbService: DatabaseService,
    private authService: AuthService,
    private alertController: AlertController,
    private injector: Injector
  ) { }

  async ngOnInit() {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.userProfile = {
        ...this.userProfile,
        nombre: currentUser.nombre,
        email: currentUser.email
      };
      this.originalProfile = { ...this.userProfile };
    }
    await this.loadRoutes();
  }

  async loadRoutes() {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      try {
        // Obtener el servicio de rutas guardadas
        const rutasService = this.injector.get(RutasGuardadasService);
        
        // Obtener las rutas creadas desde Firebase
        this.myRoutes = await rutasService.obtenerRutasCreadas();
        
        console.log('Rutas cargadas desde Firebase:', this.myRoutes.length);
      } catch (error) {
        console.error('Error al cargar rutas desde Firebase:', error);
        // Mostrar mensaje de error al usuario
        const alert = await this.alertController.create({
          header: 'Error',
          message: 'No se pudieron cargar tus rutas. Por favor, intenta nuevamente.',
          buttons: ['OK']
        });
        await alert.present();
      }
    }
  }

  getDifficultyColor(difficulty: string): string {
    switch (difficulty) {
      case 'Fácil':
        return 'success';
      case 'Moderada':
        return 'warning';
      case 'Difícil':
        return 'danger';
      case 'Muy Difícil':
        return 'dark';
      default:
        return 'medium';
    }
  }

  async confirmDelete(route: Rutas) {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: `¿Estás seguro de que deseas eliminar la ruta "${route.nombre}"?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => this.deleteRoute(route.id!)
        }
      ]
    });

    await alert.present();
  }

  private async deleteRoute(routeId: string) {
    try {
      // Mostrar indicador de carga
      const loading = await this.alertController.create({
        message: 'Eliminando ruta...',
        backdropDismiss: false
      });
      await loading.present();

      // Obtener el servicio de rutas guardadas
      const rutasService = this.injector.get(RutasGuardadasService);
      
      try {
        // Eliminamos la ruta de Firebase completamente (incluyendo referencias)
        console.log('Iniciando eliminación de ruta en Firebase con ID:', routeId);
        await rutasService.eliminarRutaCreada(routeId);
        console.log('Ruta eliminada exitosamente de Firebase con ID:', routeId);
        
        // Verificar que la ruta se haya eliminado correctamente de Firebase
        const { getFirestore, doc, getDoc } = await import('firebase/firestore');
        const db = getFirestore();
        const docRef = doc(db, 'creacion-de-rutas', routeId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          console.error('La ruta todavía existe en Firebase después de intentar eliminarla');
          throw new Error('No se pudo eliminar la ruta de Firebase');
        } else {
          console.log('Verificación exitosa: La ruta ya no existe en Firebase');
        }
        
        // Ya no eliminamos de la base de datos local, solo trabajamos con Firebase
      } catch (firebaseError) {
        console.error('Error específico al eliminar de Firebase:', firebaseError);
        throw firebaseError; // Relanzamos el error para manejarlo en el catch exterior
      }
      
      // Recargar las rutas del usuario desde Firebase
      await this.loadRoutes();
      
      // Cerrar el indicador de carga
      await loading.dismiss();
      
      // Mostrar mensaje de éxito
      const successAlert = await this.alertController.create({
        header: 'Éxito',
        message: 'La ruta ha sido eliminada correctamente.',
        buttons: ['OK']
      });
      await successAlert.present();
      
      console.log('Ruta eliminada completamente con ID:', routeId);
    } catch (error) {
      console.error('Error al eliminar la ruta:', error);
      
      // Cerrar el indicador de carga si sigue abierto
      try {
        const loadingElement = await this.alertController.getTop();
        if (loadingElement) {
          await loadingElement.dismiss();
        }
      } catch (dismissError) {
        console.error('Error al cerrar el indicador de carga:', dismissError);
      }
      
      // Mostrar alerta de error al usuario con más detalles
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      const alert = await this.alertController.create({
        header: 'Error',
        message: `No se pudo eliminar la ruta: ${errorMessage}. Por favor, intenta nuevamente.`,
        buttons: ['OK']
      });
      await alert.present();
    }
  }
}
