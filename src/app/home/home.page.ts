import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Rutas } from '../models/rutas.model';
import { Router } from '@angular/router';
import { DatabaseService } from '../services/database.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class HomePage implements OnInit {
  userName: string = '';
  userPhoto: string = 'assets/user-photo.jpg';
  rutasRecomendadas: Rutas[] = [];
  allRoutes: Rutas[] = []; // To store all routes

  constructor(
    private dbService: DatabaseService,
    private router: Router
  ) { }

  goToProfile() {
    this.router.navigate(['/profile']);
  }

  async ngOnInit() {
    // Get logged in user name
    const userEmail = localStorage.getItem('userEmail');
    if (userEmail) {
      const user = await this.dbService.getUserByEmail(userEmail);
      if (user) {
        this.userName = user.nombre;
      }
    }

    // Load routes from database
    try {
      this.allRoutes = await this.dbService.getAllRoutes();
      this.rutasRecomendadas = [...this.allRoutes];
    } catch (error) {
      console.error('Error loading routes:', error);
    }
  }

  onSearch(event: any) {
    const searchTerm = event.target.value.toLowerCase();
    if (searchTerm === '') {
      this.rutasRecomendadas = [...this.allRoutes];
    } else {
      this.rutasRecomendadas = this.allRoutes.filter(ruta => 
        ruta.nombre.toLowerCase().includes(searchTerm) ||
        ruta.localidad.toLowerCase().includes(searchTerm) ||
        ruta.descripcion.toLowerCase().includes(searchTerm)
      );
    }
  }
}