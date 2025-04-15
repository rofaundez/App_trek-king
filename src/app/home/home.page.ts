import { DatabaseService } from './../services/database.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Rutas } from '../models/rutas.model';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class HomePage implements OnInit, OnDestroy {
  userName: string = '';
  userLastName: string = '';
  userPhoto: string = 'assets/img/userLogo.png';
  rutasRecomendadas: Rutas[] = [];
  allRoutes: Rutas[] = [];
  
  private isDragging = false;
  private startX = 0;
  private scrollLeft = 0;
  private userSubscription?: Subscription;

  constructor(
    private dbService: DatabaseService,
    private authService: AuthService,
    private router: Router
  ) {
    // Nos suscribimos a los cambios del usuario
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

  ngOnInit() {
    // Obtenemos el estado inicial del usuario
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.userName = currentUser.nombre;
      this.userLastName = currentUser.apellido;
      this.userPhoto = currentUser.photo || 'assets/img/userLogo.png';
    } else {
      this.userName = 'Invitado';
      this.userLastName = '';
      this.userPhoto = 'assets/img/userLogo.png';
    }
  }

  ngOnDestroy() {
    // Nos desuscribimos para evitar memory leaks
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
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

  isMouseDown(e: MouseEvent) {
    this.isDragging = true;
    const slider = e.currentTarget as HTMLElement;
    this.startX = e.pageX - slider.offsetLeft;
    this.scrollLeft = slider.scrollLeft;
    slider.style.cursor = 'grabbing';
  }

  isMouseUp(e: MouseEvent) {
    this.isDragging = false;
    const slider = e.currentTarget as HTMLElement;
    slider.style.cursor = 'grab';
  }

  onMouseMove(e: MouseEvent) {
    if (!this.isDragging) return;
    e.preventDefault();
    const slider = e.currentTarget as HTMLElement;
    const x = e.pageX - slider.offsetLeft;
    const walk = (x - this.startX) * 2; // Multiplicador de velocidad
    slider.scrollLeft = this.scrollLeft - walk;
  }
}