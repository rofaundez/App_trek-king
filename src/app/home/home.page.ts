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
import { RutasGuardadasService } from '../services/rutas-guardadas.service';
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
    FooterComponent
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
  private rutaCreadaSubscription?: Subscription;
  private rutaEliminadaSubscription?: Subscription;

  constructor(
    private dbService: DatabaseService,
    private authService: AuthService,
    private router: Router,
    private rutasGuardadasService: RutasGuardadasService
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
    
    // Nos suscribimos al evento de creación de ruta
    this.rutaCreadaSubscription = this.rutasGuardadasService.rutaCreada$.subscribe(() => {
      console.log('Se detectó una nueva ruta creada, actualizando lista de rutas...');
      this.cargarRutasCreadas();
    });
  }

  async ngOnInit() {
    // Esperar a que la base de datos esté lista
    await this.dbService.dbReady;
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
    
    // Inicializamos las rutas recomendadas con todas las rutas predefinidas
    this.rutasRecomendadas = [...this.rutasConCategorias];
    this.allRoutes = [...this.rutasConCategorias];
    
    // Cargamos las rutas creadas por usuarios desde Firebase
    await this.cargarRutasCreadas();
    
    // Suscribirse al evento de eliminación de rutas
    this.rutaEliminadaSubscription = this.rutasGuardadasService.rutaEliminada$.subscribe((rutaId) => {
      console.log('Se detectó una ruta eliminada con ID:', rutaId);
      // Eliminar la ruta de las listas locales
      this.allRoutes = this.allRoutes.filter(ruta => ruta.id !== rutaId);
      this.rutasRecomendadas = this.rutasRecomendadas.filter(ruta => ruta.id !== rutaId);
    });
  }

  /**
   * Carga las rutas creadas por usuarios desde Firebase
   */
  async cargarRutasCreadas() {
    try {
      // Mostrar mensaje de carga en consola
      console.log('Cargando rutas creadas por usuarios desde Firebase...');
      
      // Obtener rutas creadas desde el servicio de Firebase
      const rutasCreadas = await this.rutasGuardadasService.obtenerRutasCreadas();
      console.log('Rutas creadas por usuarios obtenidas desde Firebase:', rutasCreadas);
      
      if (rutasCreadas && rutasCreadas.length > 0) {
        // Filtramos solo las rutas con estado "aprobada"
        const rutasAceptadas = rutasCreadas.filter(ruta => ruta.estado === 'aprobada');
        console.log('Rutas aceptadas:', rutasAceptadas);

        // Verificamos que cada ruta tenga las propiedades necesarias
        const rutasValidadas = rutasAceptadas.map(ruta => {
          // Creamos un nuevo objeto para evitar modificar el original
          const rutaValidada = { ...ruta };
          
          // Aseguramos que cada ruta tenga la propiedad categorias como array
          if (!rutaValidada.categorias || !Array.isArray(rutaValidada.categorias)) {
            rutaValidada.categorias = ['Rutas de Usuario'];
          }
          
          // Aseguramos que la ubicación esté correctamente asignada
          if (!rutaValidada.ubicacion && rutaValidada.localidad) {
            rutaValidada.ubicacion = rutaValidada.localidad;
          } else if (!rutaValidada.ubicacion) {
            rutaValidada.ubicacion = 'Sin ubicación especificada';
          }
          
          // Aseguramos que la imagen tenga un valor válido
          if (!rutaValidada.imagen && rutaValidada.foto) {
            rutaValidada.imagen = rutaValidada.foto;
          } else if (!rutaValidada.imagen) {
            rutaValidada.imagen = 'assets/img/default-route.jpg';
          }
          
          // Verificamos que la imagen sea una cadena válida
          if (typeof rutaValidada.imagen !== 'string' || rutaValidada.imagen.trim() === '') {
            rutaValidada.imagen = 'assets/img/default-route.jpg';
          }

          // Aseguramos que la dificultad tenga el formato correcto
          if (rutaValidada.dificultad && typeof rutaValidada.dificultad === 'string' && 
              (rutaValidada.dificultad.includes('|') || rutaValidada.dificultad.includes('Est.'))) {
            // La dificultad ya está formateada correctamente
          } else {
            // Formatear la dificultad
            let dificultadBase = rutaValidada.dificultad || 'Fácil';
            if (typeof dificultadBase !== 'string') {
              dificultadBase = 'Fácil';
            }
            
            if (dificultadBase === 'Fácil') {
              rutaValidada.dificultad = 'Facil | 1-5km | Est. 1-2h';
            } else if (dificultadBase === 'Moderada') {
              rutaValidada.dificultad = 'Media | 5-15km | Est. 2-5h';
            } else if (dificultadBase === 'Difícil') {
              rutaValidada.dificultad = 'Dificil | 15-25km | Est. 5-10h';
            } else {
              rutaValidada.dificultad = 'Media | 5-15km | Est. 2-5h';
            }
          }
          
          // Aseguramos que el nombre sea válido
          if (!rutaValidada.nombre || typeof rutaValidada.nombre !== 'string') {
            rutaValidada.nombre = 'Ruta sin nombre';
          }
          
          // Aseguramos que el ID sea válido
          if (!rutaValidada.id) {
            rutaValidada.id = 'ruta_' + Math.random().toString(36).substring(2, 9);
          }
          
          console.log('Ruta validada para mostrar:', rutaValidada);
          return rutaValidada;
        });
        
        // Añadimos las rutas creadas por usuarios a las rutas existentes
        this.allRoutes = [...this.allRoutes, ...rutasValidadas];
        this.rutasRecomendadas = [...this.rutasRecomendadas, ...rutasValidadas];
        
        console.log('Rutas totales después de cargar desde Firebase:', this.allRoutes.length);
      } else {
        console.log('No se encontraron rutas creadas por usuarios en Firebase');
      }
    } catch (error) {
      console.error('Error al cargar las rutas creadas por usuarios:', error);
    }
  }

  ngOnDestroy() {
    // Nos desuscribimos para evitar memory leaks
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
    
    // Nos desuscribimos del evento de creación de ruta
    if (this.rutaCreadaSubscription) {
      this.rutaCreadaSubscription.unsubscribe();
    }
    
    // Nos desuscribimos del evento de eliminación de ruta
    if (this.rutaEliminadaSubscription) {
      this.rutaEliminadaSubscription.unsubscribe();
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

  goToRouteDetails(id: string, nombre: string, ubicacion: string, dificultad: string, imagen: string, descripcion?: string, caracteristicas?: any, puntosInteres?: any) {
    const queryParams: any = {
      id,
      nombre,
      ubicacion,
      dificultad,
      imagen
    };
    
    if (descripcion) queryParams.descripcion = descripcion;
    
    // Procesamos las características
    if (caracteristicas) {
      // Si caracteristicas es un string, intentamos parsearlo
      if (typeof caracteristicas === 'string') {
        try {
          caracteristicas = JSON.parse(caracteristicas);
        } catch (e) {
          console.error('Error al parsear características:', e);
          // Si hay error, creamos un objeto de características por defecto
          caracteristicas = {
            tipoTerreno: 'Variado',
            mejorEpoca: 'Todo el año',
            recomendaciones: 'Llevar agua y calzado adecuado'
          };
        }
      }
      // Si no es un objeto, creamos uno por defecto
      if (!caracteristicas || typeof caracteristicas !== 'object') {
        caracteristicas = {
          tipoTerreno: 'Variado',
          mejorEpoca: 'Todo el año',
          recomendaciones: 'Llevar agua y calzado adecuado'
        };
      }
      queryParams.caracteristicas = JSON.stringify(caracteristicas);
    }
    
    // Procesamos los puntos de interés
    if (puntosInteres) {
      // Si puntosInteres es un string, intentamos parsearlo
      if (typeof puntosInteres === 'string') {
        try {
          puntosInteres = JSON.parse(puntosInteres);
        } catch (e) {
          console.error('Error al parsear puntos de interés:', e);
          puntosInteres = [];
        }
      }
      // Si no es un array, creamos uno vacío
      if (!Array.isArray(puntosInteres)) {
        puntosInteres = [];
      }
      queryParams.puntosInteres = JSON.stringify(puntosInteres);
    } else {
      queryParams.puntosInteres = JSON.stringify([]);
    }
    
    console.log('Navegando a detalles de ruta con parámetros:', queryParams);
    this.router.navigate(['/ruta-detalles'], { queryParams });
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