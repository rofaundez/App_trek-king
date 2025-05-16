import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonItem, IonLabel, IonIcon, IonBackButton, IonButtons, IonButton, ToastController, AlertController } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { FooterComponent } from '../components/footer/footer.component';
import { addIcons } from 'ionicons';
import { calendarOutline, timeOutline, trashOutline } from 'ionicons/icons';
import { RutasGuardadasService, RutaAgendada } from '../services/rutas-guardadas.service';
import { AuthService } from '../services/auth.service';

// Nota: Ahora usamos la interfaz RutaAgendada importada desde el servicio

@Component({
  selector: 'app-agenda',
  templateUrl: './agenda.page.html',
  styleUrls: ['./agenda.page.scss'],
  standalone: true,
  imports: [IonButtons, IonBackButton, 
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar, 
    IonList, 
    IonItem, 
    IonLabel, 
    IonButton,
    IonIcon,
    IonButtons,
    CommonModule, 
    FormsModule,
    FooterComponent
    
  ]
})
export class AgendaPage implements OnInit {
  // Array para almacenar las rutas agendadas
  rutasAgendadas: RutaAgendada[] = [];

  constructor(
    private router: Router,
    private rutasGuardadasService: RutasGuardadasService,
    private toastController: ToastController,
    private authService: AuthService,
    private alertController: AlertController
  ) {
    // Añadir iconos necesarios
    addIcons({ calendarOutline, timeOutline, trashOutline });
  }

  async ngOnInit() {
    // Verificar si hay un usuario logueado
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.mostrarToast('Debes iniciar sesión para ver tus rutas guardadas.');
      this.router.navigate(['/login']);
      return;
    }
    
    // Cargar las rutas guardadas desde Firebase
    await this.cargarRutasGuardadas();
  }
  
  /**
   * Carga las rutas guardadas desde Firebase
   */
  async cargarRutasGuardadas() {
    try {
      // Verificar si hay un usuario logueado
      const currentUser = this.authService.getCurrentUser();
      if (!currentUser) {
        this.mostrarToast('Debes iniciar sesión para ver tus rutas guardadas.');
        this.router.navigate(['/login']);
        return;
      }
      
      this.rutasAgendadas = await this.rutasGuardadasService.obtenerRutasGuardadas();
    } catch (error) {
      console.error('Error al cargar las rutas guardadas:', error);
      if (error instanceof Error && error.message.includes('No hay un usuario logueado')) {
        this.mostrarToast('Debes iniciar sesión para ver tus rutas guardadas.');
        this.router.navigate(['/login']);
      } else {
        this.mostrarToast('Error al cargar las rutas guardadas. Por favor, intenta nuevamente.');
      }
    }
  }

  // Método para ver detalles de una ruta
  verDetallesRuta(ruta: RutaAgendada) {
    this.router.navigate(['/ruta-detalles'], {
      queryParams: {
        id: ruta.rutaId,
        nombre: ruta.nombre,
        ubicacion: ruta.ubicacion,
        dificultad: ruta.dificultad,
        imagen: ruta.imagen,
        descripcion: ruta.descripcion,
        caracteristicas: JSON.stringify(ruta.caracteristicas),
        puntosInteres: ruta.puntosInteres
      }
    });
  }

  volver(){
    this.router.navigate(['/home']);
  }

  /**
   * Muestra un diálogo de confirmación para eliminar una ruta
   * @param ruta La ruta que se desea eliminar
   */
  async confirmarEliminarRuta(ruta: RutaAgendada, event: Event) {
    // Detener la propagación del evento para evitar que se active el verDetallesRuta
    event.stopPropagation();
    
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: `¿Estás seguro de que deseas eliminar la ruta "${ruta.nombre}"?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => this.eliminarRuta(ruta.id!)
        }
      ]
    });

    await alert.present();
  }

  /**
   * Elimina una ruta de la agenda y de Firebase
   * @param rutaId ID de la ruta a eliminar
   */
  private async eliminarRuta(rutaId: string) {
    try {
      // Eliminar la ruta de Firebase
      await this.rutasGuardadasService.eliminarRutaGuardada(rutaId);
      
      // Actualizar la lista de rutas agendadas
      await this.cargarRutasGuardadas();
      
      // Mostrar mensaje de éxito
      this.mostrarToast('Ruta eliminada correctamente');
    } catch (error) {
      console.error('Error al eliminar la ruta:', error);
      this.mostrarToast('Error al eliminar la ruta. Por favor, intenta nuevamente.');
    }
  }
  
  /**
   * Muestra un mensaje toast
   * @param mensaje Mensaje a mostrar
   */
  async mostrarToast(mensaje: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 3000,
      position: 'bottom'
    });
    await toast.present();
  }
}
