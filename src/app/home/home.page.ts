import { DatabaseService } from './../services/database.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Rutas } from '../models/rutas.model';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Subscription } from 'rxjs';
import { FooterComponent } from '../components/footer/footer.component';
import { HeaderComponent } from "../components/header/header.component";

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    FooterComponent,
    HeaderComponent
]
})
export class HomePage implements OnInit, OnDestroy {
  userName: string = '';
  userLastName: string = '';
  userPhoto: string = 'assets/img/userLogo.png';
  rutasRecomendadas: Rutas[] = [];
  allRoutes: Rutas[] = [];
  filtroActivo: string | null = null;
  searchTerm: string = '';
  sugerencias: string[] = [];
  
  // Rutas con sus categorías asignadas
  rutasConCategorias = [
    {
      id: 'cerro_santa_lucia',
      nombre: 'Cerro Santa Lucía',
      ubicacion: 'Santiago de Chile, Santiago',
      dificultad: 'Facil | 1,3km | Est. 23min',
      imagen: 'assets/img/cerro_santa_lucia.jpg',
      categorias: ['Montañas', 'Parques']
    },
    {
      id: 'cascada_san_juan',
      nombre: 'Cascada San Juan Sendero Estereo',
      ubicacion: 'Peñalolén, Santiago',
      dificultad: 'Media | 8,7km | Est. 3h 12min',
      imagen: 'assets/img/Cascada_san_juan.jpg',
      categorias: ['Cascadas', 'Montañas']
    },
    {
      id: 'salto_apoquindo',
      nombre: 'Salto de Apoquindo Los Dominicos',
      ubicacion: 'Las Condes, Santiago',
      dificultad: 'Dificil | 14,3km | Est. 5h 28min',
      imagen: 'assets/img/salto_apoquindo.jpg',
      categorias: ['Cascadas', 'Rios', 'Montañas']
    },
    {
      id: 'lago_aculeo',
      nombre: 'Laguna de Aculeo',
      ubicacion: 'Paine, Santiago',
      dificultad: 'Media | 24,6km | Est. 5h 32min',
      imagen: 'assets/img/lago_aculeo.jpg',
      categorias: ['Lagos']
    },
    {
      id: 'cerro_minillas',
      nombre: 'Cerro Minillas - Cerro Tarapacá',
      ubicacion: 'La Florida, Santiago',
      dificultad: 'Dificil | 18,7km | Est. 9h 35min',
      imagen: 'assets/img/cerro_minillas.webp',
      categorias: ['Montañas', 'Nieve']
    }
  ];
  
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
    
    // Inicializamos las rutas recomendadas con todas las rutas
    this.rutasRecomendadas = [...this.rutasConCategorias];
    this.allRoutes = [...this.rutasConCategorias];
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
    const searchTerm = (event.target.value?.toLowerCase() ?? '');
    this.searchTerm = event.target.value;
    let rutasFiltradas = [...this.allRoutes];
    
    // Si hay un filtro activo, aplicamos primero ese filtro
    if (this.filtroActivo) {
      rutasFiltradas = this.allRoutes.filter(ruta => 
        ruta.categorias?.includes(this.filtroActivo!)
      );
    }
    
    // Luego aplicamos el filtro de búsqueda
    if (searchTerm !== '') {
      rutasFiltradas = rutasFiltradas.filter(ruta => 
        ruta.nombre?.toLowerCase()?.includes(searchTerm) ||
        ruta.ubicacion?.toLowerCase()?.includes(searchTerm)
      );
      
      // Generamos sugerencias de autocompletado
      this.generarSugerencias(searchTerm);
    } else {
      // Si no hay texto de búsqueda, mostramos todas las rutas
      rutasFiltradas = [...this.allRoutes];
      // Limpiamos las sugerencias
      this.sugerencias = [];
    }
    
    this.rutasRecomendadas = rutasFiltradas;
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

  goToRouteDetails(id: string, nombre: string, ubicacion: string, dificultad: string, imagen: string) {
    // Navegamos a la página de detalles con los parámetros de la ruta
    this.router.navigate(['/ruta-detalles'], {
      queryParams: {
        id: id,
        nombre: nombre,
        ubicacion: ubicacion,
        dificultad: dificultad,
        imagen: imagen
      }
    });
  }
  
  // Método para generar sugerencias basadas en el texto de búsqueda
  generarSugerencias(searchTerm: string) {
    if (!searchTerm) {
      this.sugerencias = [];
      return;
    }
    
    // Obtenemos todos los nombres de rutas que coincidan parcialmente con el término de búsqueda
    const nombresSugeridos = this.allRoutes
      .filter(ruta => ruta.nombre.toLowerCase().includes(searchTerm))
      .map(ruta => ruta.nombre);
    
    // Limitamos a máximo 5 sugerencias para no sobrecargar la interfaz
    this.sugerencias = [...new Set(nombresSugeridos)].slice(0, 5);
  }
  
  // Método para seleccionar una sugerencia del autocompletado
  seleccionarSugerencia(sugerencia: string) {
    this.searchTerm = sugerencia;
    
    // Filtramos las rutas con la sugerencia seleccionada
    let rutasFiltradas = this.allRoutes.filter(ruta => 
      ruta.nombre === sugerencia
    );
    
    // Si hay un filtro activo, también lo aplicamos
    if (this.filtroActivo) {
      rutasFiltradas = rutasFiltradas.filter(ruta => 
        ruta.categorias?.includes(this.filtroActivo!)
      );
    }
    
    this.rutasRecomendadas = rutasFiltradas;
    this.sugerencias = []; // Ocultamos las sugerencias después de seleccionar
  }
  
  filtrarPorCategoria(categoria: string) {
    // Si ya está activo este filtro, lo desactivamos
    if (this.filtroActivo === categoria) {
      this.filtroActivo = null;
      this.rutasRecomendadas = [...this.allRoutes];
    } else {
      // Activamos el nuevo filtro
      this.filtroActivo = categoria;
      this.rutasRecomendadas = this.allRoutes.filter(ruta => 
        ruta.categorias?.includes(categoria)
      );
    }
  }
}