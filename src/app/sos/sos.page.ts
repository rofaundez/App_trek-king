import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonAvatar,
  IonButton,
  AlertController,
  IonList,
  IonItem,
  IonLabel,
} from '@ionic/angular/standalone';
import { FooterComponent } from '../components/footer/footer.component';
import { AuthService } from '../services/auth.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sos',
  standalone: true,
  templateUrl: './sos.page.html',
  styleUrls: ['./sos.page.scss'],
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonAvatar,
    IonButton,
    IonList,
    FooterComponent,
    IonItem,
    IonLabel
  ]
})
export class SosPage implements OnInit, OnDestroy {
  userPhoto: string = 'assets/img/userLogo.png';
  userName: string = 'Invitado';
  userLastName: string = '';
  private userSubscription?: Subscription;

  popupVisible: boolean = false;
  cuentaRegresiva: number = 60;
  intervalo: any;
  mensajeSeleccionado: string | null = null;

  mensajesEmergencia = [
    'Estoy incapacitado y necesito rescate inmediato',
    'Estoy perdido y no puedo regresar',
    'Hay un obstaculo en la ruta',
    'Hay un animal que necesita asistencia medica en la ruta',
    'Incendio en la zona',
  ];

  instruccionesPorMensaje: { [key: string]: string } = {
    'Estoy incapacitado y necesito rescate inmediato': 'Permanece en el lugar, intenta estabilizarte y haz señales visibles.',
    'Estoy perdido y no puedo regresar': 'Quédate donde estás, no camines más. Las autoridades rastrearán tu última ubicación conocida.',
    'Hay un incendio en la ruta': 'Aléjate del fuego y muévete hacia un área despejada, preferiblemente cuesta abajo o contra el viento.',
    'Alguien se desmayó': 'Verifica signos vitales, no muevas a la persona si no es necesario, e intenta cubrirla del frío.',
    'Otro motivo': 'Describe la situación lo mejor que puedas en el siguiente contacto con los rescatistas.'
  };

  constructor(
    private alertController: AlertController,
    private authService: AuthService,
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
  }

  goToProfile() {
    this.router.navigate(['/profile']);
    console.log('Ir al perfil desde SOS');
  }

  mostrarPopup() {
    this.popupVisible = true;
    this.cuentaRegresiva = 40;
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
    clearInterval(this.intervalo);
    this.popupVisible = false;
    this.mensajeSeleccionado = null;
  }

  async enviarAlerta() {
    this.popupVisible = false;
    this.mensajeSeleccionado = null;

    const alert = await this.alertController.create({
      header: '🚨 Alerta enviada',
      message: `Mensaje enviado a las autoridades: <br><strong>${this.mensajeSeleccionado ?? 'SOS sin mensaje específico'}</strong>`,
      buttons: ['OK'],
      cssClass: 'custom-alert'
    });
    await alert.present();
  }

  async avisarGrupo() {
    const alert = await this.alertController.create({
      header: 'Grupo Avisado',
      message: 'Tu grupo ha sido notificado de tu paradero. Quédate en tu ubicación actual.',
      buttons: ['OK'],
      cssClass: 'custom-alert'
    });
    await alert.present();
  }

  seleccionarMensaje(mensaje: string) {
    this.mensajeSeleccionado = mensaje;
  }

  obtenerInstruccion(mensaje: string): string {
    return this.instruccionesPorMensaje[mensaje] || 'Sigue las instrucciones de emergencia según tu situación.';
  }
}
