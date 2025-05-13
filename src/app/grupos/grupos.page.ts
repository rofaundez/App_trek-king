import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonAvatar
} from '@ionic/angular/standalone';
import { FooterComponent } from '../components/footer/footer.component';
import { AuthService } from '../services/auth.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-grupos',
  templateUrl: './grupos.page.html',
  styleUrls: ['./grupos.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonAvatar,
    FooterComponent
  ]
})
export class GruposPage implements OnInit, OnDestroy {
  userPhoto = 'assets/img/userLogo.png';
  userName = 'Invitado';
  userLastName = '';
  private userSubscription?: Subscription;

  constructor(
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

  goToProfile() {
    this.router.navigate(['/profile']);
    console.log('Ir al perfil desde GRUPOS');
  }
}
