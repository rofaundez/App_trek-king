import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../components/header/header.component';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonAvatar,
  IonButton,
  AlertController
} from '@ionic/angular/standalone';
import { FooterComponent } from '../components/footer/footer.component';
import { AuthService } from '../services/auth.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sos',
  templateUrl: './sos.page.html',
  styleUrls: ['./sos.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HeaderComponent,
    IonContent,
    IonHeader,
    IonAvatar,
    FooterComponent,
  ],
})
export class SosPage implements OnInit, OnDestroy {
  userPhoto = 'assets/img/userLogo.png';
  userName = 'Invitado';
  userLastName = '';
  private userSubscription?: Subscription;

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
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  async sendSOSAlert() {
    const alert = await this.alertController.create({
      header: 'SOS Enviado',
      message: 'Enviando una alerta SOS con tus datos a las autoridades. Mantén la calma y permanece visible.',
      buttons: ['OK'],
      cssClass: 'custom-alert'
    });
    await alert.present();
  }

  async notifyGroup() {
    const alert = await this.alertController.create({
      header: 'Grupo Avisado',
      message: 'Tu grupo ha sido notificado de tu paradero. Quédate en tu ubicación actual.',
      buttons: ['OK'],
      cssClass: 'custom-alert'
    });
    await alert.present();
  }

  goToProfile() {
    this.router.navigate(['/profile']);
    console.log('Ir al perfil desde SOS');
  }
}