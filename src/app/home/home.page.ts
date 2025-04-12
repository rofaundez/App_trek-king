import { DatabaseService } from './../services/database.service';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Rutas } from '../models/rutas.model';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { FooterComponent } from '../components/footer/footer.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, FooterComponent]
})
export class HomePage implements OnInit {
  userName: string = '';
  userLastName: string = '';
  userPhoto: string = 'assets/user-photo.jpg';
  rutasRecomendadas: Rutas[] = [];
  allRoutes: Rutas[] = [];
  
  constructor(
    private dbService: DatabaseService,
    private authService: AuthService,
    private router: Router
  ) {
    // Subscribe to auth state changes
    this.authService.authState$.subscribe(user => {
      console.log('Auth state changed, user:', user); // Add this log
      if (user) {
        this.userName = user.nombre;
        this.userLastName = user.apellido;
        console.log('Setting name:', this.userName, 'lastname:', this.userLastName); // Add this log
      } else {
        this.userName = 'Invitado';
        this.userLastName = 'Invitado';
      }
    });
  }

  ngOnInit() {
    // Get initial user state
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.userName = currentUser.nombre;
      this.userLastName = currentUser.apellido;
    } else {
      this.userName = 'Invitado';
      this.userLastName = 'Invitado';
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