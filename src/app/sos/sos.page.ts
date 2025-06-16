import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../components/header/header.component';
import {
  IonContent,
  IonHeader,
  IonAvatar,
  IonButton,
  AlertController,
  IonList,
  IonItem,
  IonLabel, IonToolbar, IonButtons, IonBackButton, IonTitle } from '@ionic/angular/standalone';
import { FooterComponent } from '../components/footer/footer.component';
import { AuthService } from '../services/auth.service';
import { AlertasService, Ubicacion } from '../services/alertas.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sos',
  standalone: true,
  templateUrl: './sos.page.html',
  styleUrls: ['./sos.page.scss'],
  imports: [IonTitle, IonBackButton, IonButtons, IonToolbar, 
    CommonModule,
    FormsModule,
    IonContent,
    IonButton,
    FooterComponent,
  ]
})
export class SosPage implements OnInit, OnDestroy {
  userPhoto: string = 'assets/img/userLogo.png';
  userName: string = 'Invitado';
  userLastName: string = '';
  private userSubscription?: Subscription;

  popupVisible: boolean = false;
  cuentaRegresiva: number = 90;
  intervalo: any;
  mensajeSeleccionado: string | null = null;
  obteniendoUbicacion: boolean = false;

  mensajesEmergencia = [
    'Estoy incapacitado y necesito rescate inmediato',
    'Estoy perdido y no puedo regresar',
    'Hay un obstaculo en la ruta',
    'Incendio en la zona',
    'animal herido en ruta'
  ];

  instruccionesPorMensaje: { [key: string]: string } = {
    'Estoy incapacitado y necesito rescate inmediato': 'Permanece en el lugar, intenta estabilizarte y haz señales visibles.',
    'Estoy perdido y no puedo regresar': 'Quédate donde estás, no camines más. Las autoridades rastrearán tu última ubicación conocida.',
    'Hay un obstaculo en la ruta': 'Detalla el obstáculo a los rescatistas y espera en una zona segura.',
    'Incendio en la zona': 'Aléjate del fuego y muévete hacia un área despejada, preferiblemente cuesta abajo o contra el viento.',
    'animal herido en ruta': 'Espera a que los especialistas se reúnan intenta no moverte desde tu posición de origen para que les des indicaciones y mantente a una distancia segura del animal'
  };

  constructor(
    private alertController: AlertController,
    private authService: AuthService,
    private alertasService: AlertasService,
    private router: Router
  ) {}

  ngOnInit() {
    this.userSubscription = this.authService.user$.subscribe(user => {
      if (user) {
        this.userName = user.nombre;
        this.userLastName = user.apellido;
        this.userPhoto = user.photo || 'assets/img/userLogo.png';
      } else {
        this.userName = 'Invitado';
        this.userLastName = '';
        this.userPhoto = 'assets/img/userLogo.png';
      }
    });
  }

  ngOnDestroy() {
    this.userSubscription?.unsubscribe();
    if (this.intervalo) {
      clearInterval(this.intervalo);
    }
  }

  goToProfile() {
    this.router.navigate(['/profile']);
    console.log('Ir al perfil desde SOS');
  }

  mostrarPopup() {
    this.popupVisible = true;
    this.cuentaRegresiva = 90;
    this.mensajeSeleccionado = null;

    this.intervalo = setInterval(() => {
      this.cuentaRegresiva--;
      if (this.cuentaRegresiva === 0) {
        clearInterval(this.intervalo);
        this.enviarAlerta();
      }
    }, 1000);
  }

  cancelarSOS() {
    this.popupVisible = false;
    if (this.intervalo) {
      clearInterval(this.intervalo);
    }
  }

  seleccionarMensaje(mensaje: string) {
    this.mensajeSeleccionado = mensaje;
  }

  obtenerInstruccion(mensaje: string): string {
    return this.instruccionesPorMensaje[mensaje] || 'Sigue las indicaciones generales y espera ayuda.';
  }

  private obtenerUbicacionActual(): Promise<Ubicacion> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocalización no soportada en este navegador'));
        return;
      }

      this.obteniendoUbicacion = true;

      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.obteniendoUbicacion = false;
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          this.obteniendoUbicacion = false;
          let mensajeError = 'Error al obtener la ubicación';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              mensajeError = 'Se requiere permiso para acceder a la ubicación';
              break;
            case error.POSITION_UNAVAILABLE:
              mensajeError = 'La información de ubicación no está disponible';
              break;
            case error.TIMEOUT:
              mensajeError = 'Se agotó el tiempo de espera para obtener la ubicación';
              break;
          }
          
          reject(new Error(mensajeError));
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    });
  }

  async enviarAlerta() {
    try {
      const currentUser = this.authService.getCurrentUser();
      if (!currentUser) {
        this.presentAlert('Error', 'Debes iniciar sesión para enviar una alerta');
        return;
      }

      if (!this.mensajeSeleccionado) {
        this.presentAlert('Error', 'Por favor, selecciona una situación de emergencia');
        return;
      }

      // Mostrar indicador de carga mientras se obtiene la ubicación
      const loading = await this.alertController.create({
        message: 'Obteniendo ubicación...',
        backdropDismiss: false
      });
      await loading.present();

      try {
        const ubicacion = await this.obtenerUbicacionActual();
        const mensaje = this.mensajeSeleccionado;
        const instrucciones = this.obtenerInstruccion(mensaje);

        // Crear la alerta en Firebase
        await this.alertasService.crearAlerta({
          userId: currentUser.id || 'anonimo',
          nombreUsuario: currentUser.nombre && currentUser.apellido 
            ? `${currentUser.nombre} ${currentUser.apellido}`
            : currentUser.nombre || currentUser.email || 'Usuario',
          fotoUsuario: currentUser.photo || '',
          titulo: 'Alerta SOS',
          descripcion: mensaje,
          ubicacion: ubicacion,
          fecha: new Date(),
          estado: 'pendiente',
          instrucciones: instrucciones
        });

        // Limpiar el intervalo si existe
        if (this.intervalo) {
          clearInterval(this.intervalo);
        }

        this.popupVisible = false;
        await loading.dismiss();
        this.presentAlert('Alerta enviada', `Se ha enviado una alerta a las autoridades. ${instrucciones}`);
      } catch (error) {
        await loading.dismiss();
        if (error instanceof Error) {
          this.presentAlert('Error de ubicación', error.message);
        } else {
          this.presentAlert('Error', 'No se pudo enviar la alerta. Por favor, intenta nuevamente.');
        }
      }
    } catch (error) {
      console.error('Error al enviar la alerta:', error);
      this.presentAlert('Error', 'No se pudo enviar la alerta. Por favor, intenta nuevamente.');
    }
  }

  async presentAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
      cssClass: 'custom-alert'
    });

    await alert.present();
  }

  avisarGrupo() {
    this.presentAlert('Grupo notificado', 'Se ha enviado un aviso a tu grupo.');
  }

  volver() {
    this.router.navigate(['/home']);
  }
}
