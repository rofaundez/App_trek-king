import { Component, OnInit } from '@angular/core';
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
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonTitle
} from '@ionic/angular/standalone';
import { FooterComponent } from '../components/footer/footer.component';
import { AuthService } from '../services/auth.service';
import { AlertasService, Ubicacion } from '../services/alertas.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-informaciones',
  standalone: true,
  templateUrl: './informaciones.page.html',
  styleUrls: ['./informaciones.page.scss'],
  imports: [
    IonTitle,
    IonBackButton,
    IonButtons,
    IonToolbar,
    CommonModule,
    FormsModule,
    IonContent,
    IonButton,
    FooterComponent
  ]
})
export class InformacionesPage implements OnInit {
  userPhoto: string = 'assets/img/userLogo.png';
  userName: string = 'Invitado';
  userLastName: string = '';
  private userSubscription?: Subscription;

  // Control del botón activo
  selectedInfo: number | null = null;

  constructor(
    private alertController: AlertController,
    private authService: AuthService,
    private alertasService: AlertasService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Puedes cargar datos aquí si lo necesitas
  }

  volver() {
    this.router.navigate(['/home']);
  }

  toggleInfo(index: number) {
    this.selectedInfo = this.selectedInfo === index ? null : index;
  }
}
