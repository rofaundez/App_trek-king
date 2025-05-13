import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController } from '@ionic/angular';
import { DatabaseService } from '../services/database.service';
import { AuthService } from '../services/auth.service';
import { Rutas } from '../models/rutas.model';
import { RouterModule, Router } from '@angular/router';
import { FooterComponent } from '../components/footer/footer.component';
import { Subscription } from 'rxjs';

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
    FooterComponent
  ]
})
export class MyRoutesPage implements OnInit, OnDestroy {
  myRoutes: Rutas[] = [];
  userProfile: any = {
    photo: 'assets/img/userLogo.png',
    nombre: '',
    email: ''
  };
  originalProfile: any;

  // 🔽 Agregado para header embebido
  userPhoto = 'assets/img/userLogo.png';
  userName = 'Invitado';
  userLastName = '';
  private userSubscription?: Subscription;

  constructor(
    private dbService: DatabaseService,
    private authService: AuthService,
    private alertController: AlertController,
    private router: Router // 🔽 necesario para goToProfile
  ) { }

  async ngOnInit() {
    // 🔽 Lógica para el header embebido
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

    // 🔽 Lógica original
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

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  // 🔽 Método para el click en avatar
  goToProfile() {
    this.router.navigate(['/profile']);
    console.log('Ir al perfil desde MY ROUTES');
  }

  async loadRoutes() {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      const creatorId = currentUser.id ? currentUser.id.toString() : '';
      this.myRoutes = await this.dbService.getRoutesByCreator(creatorId);
    }
  }

  getDifficultyColor(difficulty: string): string {
    switch (difficulty) {
      case 'Fácil': return 'success';
      case 'Moderada': return 'warning';
      case 'Difícil': return 'danger';
      case 'Muy Difícil': return 'dark';
      default: return 'medium';
    }
  }

  async confirmDelete(route: Rutas) {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: `¿Estás seguro de que deseas eliminar la ruta "${route.nombre}"?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Eliminar', role: 'destructive', handler: () => this.deleteRoute(route.id!) }
      ]
    });
    await alert.present();
  }

  private async deleteRoute(routeId: string) {
    try {
      await this.dbService.deleteRoute(routeId);
      await this.loadRoutes();
    } catch (error) {
      console.error('Error deleting route:', error);
    }
  }
}
