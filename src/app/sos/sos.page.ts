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

  mensajesEmergencia = [
    'Estoy incapacitado y necesito rescate inmediato',
    'Estoy perdido y no puedo regresar',
    'Hay un obstaculo en la ruta',
    'Incendio en la zona',
  ];

  instruccionesPorMensaje: { [key: string]: string } = {
    'Estoy incapacitado y necesito rescate inmediato': 'Permanece en el lugar, intenta estabilizarte y haz señales visibles.',
    'Estoy perdido y no puedo regresar': 'Quédate donde estás, no camines más. Las autoridades rastrearán tu última ubicación conocida.',
    'Hay un obstaculo en la ruta': 'Detalla el obstáculo a los rescatistas y espera en una zona segura.',
    'Incendio en la zona': 'Aléjate del fuego y muévete hacia un área despejada, preferiblemente cuesta abajo o contra el viento.',
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

  enviarAlerta() {
    const mensaje = this.mensajeSeleccionado || 'Necesito ayuda médica urgente';
    this.popupVisible = false;
    this.presentAlert('Alerta enviada', `Mensaje enviado: ${mensaje}`);
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

  volver()
  {
    this.router.navigate(['/home']);
  }
}
