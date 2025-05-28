import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonItem, IonLabel, IonButton, IonIcon, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonBadge, IonButtons, IonMenuButton, IonAvatar } from '@ionic/angular/standalone';
import { AuthService } from '../../services/auth.service';
import { DatabaseService } from '../../services/database.service';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { trashOutline, createOutline, eyeOutline, personAddOutline, personCircleOutline, logOutOutline, closeOutline, calendarOutline, todayOutline, calendarNumberOutline, infiniteOutline } from 'ionicons/icons';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonList, 
    IonItem,
    IonButton, 
    IonIcon,
    IonBadge,
    IonAvatar,
    CommonModule, 
    FormsModule,
    DatePipe
  ]
})
export class HomePage implements OnInit {
  rutas: any[] = [];
  rutasFiltradas: any[] = [];
  autoridadActual: any;
  searchTerm: string = '';
  sugerencias: string[] = [];
  filtroActivo: string = 'Todas';
  isDragging: boolean = false;
  startX: number = 0;
  scrollLeft: number = 0;

  constructor(
    private authService: AuthService,
    private dbService: DatabaseService,
    private router: Router
  ) {
    addIcons({ 
      trashOutline, 
      createOutline, 
      eyeOutline, 
      personAddOutline, 
      personCircleOutline, 
      logOutOutline,
      closeOutline,
      calendarOutline,
      todayOutline,
      calendarNumberOutline,
      infiniteOutline
    });
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
      // Aquí se cargarían las rutas agendadas en lugar de todas las rutas
      // Por ahora usamos getAllRoutes como placeholder
      this.rutas = await this.dbService.getAllRoutes();
      
      // Simulamos fechas de agendamiento para demostración
      this.rutas.forEach(ruta => {
        if (!ruta.fechaAgendada) {
          // Asignar fechas aleatorias en los próximos 30 días para demostración
          const randomDays = Math.floor(Math.random() * 30);
          const fecha = new Date();
          fecha.setDate(fecha.getDate() + randomDays);
          ruta.fechaAgendada = fecha;
        }
      });

      // Inicializar rutas filtradas con todas las rutas
      this.rutasFiltradas = [...this.rutas];
      
      // Aplicar filtro activo si hay uno seleccionado
      if (this.filtroActivo !== 'Todas') {
        this.aplicarFiltroActivo();
      }
    } catch (error) {
      console.error('Error al cargar rutas:', error);
    }
  }

  getDificultadColor(dificultad: string): string {
    switch (dificultad?.toLowerCase()) {
      case 'fácil':
      case 'facil':
        return 'success';
      case 'media':
      case 'moderado':
        return 'warning';
      case 'difícil':
      case 'dificil':
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

  // Funciones para la barra de búsqueda
  onSearch(event: any) {
    const valor = this.searchTerm.toLowerCase();
    if (valor.length > 0) {
      // Generar sugerencias basadas en nombres de rutas
      this.sugerencias = this.rutas
        .map(ruta => ruta.nombre)
        .filter(nombre => nombre.toLowerCase().includes(valor));
      
      // Filtrar rutas por término de búsqueda
      this.rutasFiltradas = this.rutas.filter(ruta => 
        ruta.nombre.toLowerCase().includes(valor) ||
        (ruta.ubicacion && ruta.ubicacion.toLowerCase().includes(valor)) ||
        (ruta.descripcion && ruta.descripcion.toLowerCase().includes(valor))
      );
    } else {
      this.sugerencias = [];
      this.rutasFiltradas = [...this.rutas];
      this.aplicarFiltroActivo();
    }
  }

  seleccionarSugerencia(sugerencia: string) {
    this.searchTerm = sugerencia;
    this.sugerencias = [];
    this.onSearch(null);
  }

  // Funciones para filtros de fecha
  filtrarPorFecha(filtro: string) {
    this.filtroActivo = filtro;
    this.aplicarFiltroActivo();
  }

  aplicarFiltroActivo() {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    const inicioSemana = new Date(hoy);
    inicioSemana.setDate(hoy.getDate() - hoy.getDay()); // Domingo como inicio de semana
    
    const finSemana = new Date(inicioSemana);
    finSemana.setDate(inicioSemana.getDate() + 6); // Sábado como fin de semana
    
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const finMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);

    // Si hay un término de búsqueda, aplicamos el filtro sobre las rutas ya filtradas por búsqueda
    let rutasBase = this.searchTerm ? this.rutasFiltradas : this.rutas;

    switch (this.filtroActivo) {
      case 'Hoy':
        this.rutasFiltradas = rutasBase.filter(ruta => {
          const fechaRuta = new Date(ruta.fechaAgendada);
          fechaRuta.setHours(0, 0, 0, 0);
          return fechaRuta.getTime() === hoy.getTime();
        });
        break;
      case 'Semana':
        this.rutasFiltradas = rutasBase.filter(ruta => {
          const fechaRuta = new Date(ruta.fechaAgendada);
          return fechaRuta >= inicioSemana && fechaRuta <= finSemana;
        });
        break;
      case 'Mes':
        this.rutasFiltradas = rutasBase.filter(ruta => {
          const fechaRuta = new Date(ruta.fechaAgendada);
          return fechaRuta >= inicioMes && fechaRuta <= finMes;
        });
        break;
      case 'Todas':
      default:
        if (!this.searchTerm) {
          this.rutasFiltradas = [...this.rutas];
        }
        break;
    }
  }

  // Funciones para el scroll horizontal de filtros
  isMouseDown(event: MouseEvent) {
    this.isDragging = true;
    const slider = event.currentTarget as HTMLElement;
    this.startX = event.pageX - slider.offsetLeft;
    this.scrollLeft = slider.scrollLeft;
  }

  onMouseMove(event: MouseEvent) {
    if (!this.isDragging) return;
    event.preventDefault();
    const slider = event.currentTarget as HTMLElement;
    const x = event.pageX - slider.offsetLeft;
    const walk = (x - this.startX) * 2; // Velocidad de scroll
    slider.scrollLeft = this.scrollLeft - walk;
  }

  isMouseUp(event: MouseEvent) {
    this.isDragging = false;
  }
}
