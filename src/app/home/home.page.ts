import { DatabaseService } from './../services/database.service';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Rutas } from '../models/rutas.model';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

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
  allRoutes: Rutas[] = [];

  constructor(
    private dbService: DatabaseService,
    private authService: AuthService,
    private router: Router
  ) { }

  async ngOnInit() {
    // Get user data from auth service
    const currentUser = this.authService.getCurrentUser();
    this.userName = currentUser ? currentUser.nombre : 'Invitado';

    // Load routes from database
    try {
      this.allRoutes = await this.dbService.getAllRoutes();
      this.rutasRecomendadas = [...this.allRoutes];
    } catch (error) {
      console.error('Error loading routes:', error);
    }
  }

  goToProfile() {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.router.navigate(['/login']);
    } else {
      this.router.navigate(['/profile']);
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
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

  isMouseDown = false;
    startX: number = 0;
    scrollLeft: number = 0;
  
    onMouseDown(e: MouseEvent) {
      const filterContainer = e.currentTarget as HTMLElement;
      this.isMouseDown = true;
      this.startX = e.pageX - filterContainer.offsetLeft;
      this.scrollLeft = filterContainer.scrollLeft;
    }
  
    onMouseLeave() {
      this.isMouseDown = false;
    }
  
    onMouseUp() {
      this.isMouseDown = false;
    }
  
    onMouseMove(e: MouseEvent) {
      if (!this.isMouseDown) return;
      e.preventDefault();
      const filterContainer = e.currentTarget as HTMLElement;
      const x = e.pageX - filterContainer.offsetLeft;
      const walk = (x - this.startX) * 2;
      filterContainer.scrollLeft = this.scrollLeft - walk;
    }
}