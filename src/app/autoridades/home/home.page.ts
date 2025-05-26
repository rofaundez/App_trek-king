import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonItem, IonLabel, IonButton, IonIcon, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonBadge, IonButtons, IonMenuButton } from '@ionic/angular/standalone';
import { AuthService } from '../../services/auth.service';
import { DatabaseService } from '../../services/database.service';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { trashOutline, createOutline, eyeOutline, personAddOutline, personCircleOutline } from 'ionicons/icons';
import { HeaderComponent } from 'src/app/components/header/header.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    HeaderComponent,
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar, 
    IonList, 
    IonButton, 
    IonIcon,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonBadge,
    IonButtons,
    IonMenuButton,
    CommonModule, 
    FormsModule
  ]
})
export class HomePage implements OnInit {
  rutas: any[] = [];
  autoridadActual: any;

  constructor(
    private authService: AuthService,
    private dbService: DatabaseService,
    private router: Router
  ) {
    addIcons({ trashOutline, createOutline, eyeOutline, personAddOutline, personCircleOutline });
  }

  ngOnInit() {
    // Verificar si hay una autoridad autenticada
    this.autoridadActual = this.authService.getCurrentAutoridad();
    if (!this.autoridadActual) {
      this.router.navigate(['/autoridades/login']);
      return;
    }

    // Cargar las rutas
    this.cargarRutas();
  }

  async cargarRutas() {
    try {
      this.rutas = await this.dbService.getAllRoutes();
    } catch (error) {
      console.error('Error al cargar rutas:', error);
    }
  }

  getDificultadColor(dificultad: string): string {
    switch (dificultad.toLowerCase()) {
      case 'fácil':
        return 'success';
      case 'media':
        return 'warning';
      case 'difícil':
        return 'danger';
      default:
        return 'medium';
    }
  }

  puedeCrearAutoridades(): boolean {
    const rangosPermitidos = ['jefe'];
    return rangosPermitidos.includes(this.autoridadActual?.cargo?.toLowerCase());
  }

  verPerfil() {
    this.router.navigate(['/autoridad-perfil']);
  }

  verRuta(ruta: any) {
    this.router.navigate(['/autoridades/ruta-detalle', ruta.id]);
  }

  editarRuta(ruta: any) {
    this.router.navigate(['/autoridades/editar-ruta', ruta.id]);
  }

  async eliminarRuta(ruta: any) {
    try {
      await this.dbService.deleteRoute(ruta.id);
      await this.cargarRutas(); // Recargar la lista después de eliminar
    } catch (error) {
      console.error('Error al eliminar ruta:', error);
    }
  }

  crearAutoridad() {
    this.router.navigate(['/autoridad-registro']);
  }

  logout() {
    this.authService.logoutAutoridad();
    this.router.navigate(['/autoridad-login']);
  }
}
