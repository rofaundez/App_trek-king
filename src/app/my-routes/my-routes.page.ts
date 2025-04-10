import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController } from '@ionic/angular';
import { DatabaseService } from '../services/database.service';
import { AuthService } from '../services/auth.service';
import { Rutas } from '../models/rutas.model';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-my-routes',
  templateUrl: './my-routes.page.html',
  styleUrls: ['./my-routes.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule]
})
export class MyRoutesPage implements OnInit {
  myRoutes: Rutas[] = [];

  constructor(
    private dbService: DatabaseService,
    private authService: AuthService,
    private alertController: AlertController
  ) { }

  async ngOnInit() {
    await this.loadRoutes();
  }

  async loadRoutes() {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.myRoutes = await this.dbService.getRoutesByCreator(currentUser.id);
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
      await this.dbService.deleteRoute(routeId);
      await this.loadRoutes();
    } catch (error) {
      console.error('Error deleting route:', error);
    }
  }
}
