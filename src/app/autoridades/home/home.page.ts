import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonItem, IonLabel, IonButton, IonIcon, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonBadge, IonButtons, IonMenuButton, IonAvatar, IonInput, IonSearchbar } from '@ionic/angular/standalone';
import { AuthService } from '../../services/auth.service';
import { DatabaseService } from '../../services/database.service';
import { RutasGuardadasService, RutaAgendada } from '../../services/rutas-guardadas.service';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { trashOutline, createOutline, eyeOutline, personAddOutline, personCircleOutline, logOutOutline, closeOutline, calendarOutline, todayOutline, calendarNumberOutline, infiniteOutline, mapOutline, timeOutline, informationCircleOutline } from 'ionicons/icons';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonList, 
    IonItem,
    IonLabel,
    IonButton, 
    IonIcon,
    IonBadge,
    IonAvatar,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonButtons,
    IonMenuButton,
    IonInput,
    IonSearchbar,
    CommonModule, 
    FormsModule,
    DatePipe
  ]
})
export class HomePage implements OnInit {
  rutas: RutaAgendada[] = [];
  rutasFiltradas: RutaAgendada[] = [];
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
    private rutasGuardadasService: RutasGuardadasService,
    private router: Router
  ) {
    addIcons({ 
      trashOutline,       createOutline, 
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
      // Cargar todas las rutas agendadas de todos los usuarios
      this.rutas = await this.rutasGuardadasService.obtenerTodasLasRutasAgendadas();
      
      // Convertir fechaProgramada a Date para filtros y obtener información de usuarios
      for (const ruta of this.rutas) {
        // Convertir la fecha programada a objeto Date
        if (ruta.fechaProgramada && !ruta.fechaAgendada) {
          try {
            // Intentar diferentes formatos de fecha
            if (ruta.fechaProgramada.includes(' de ')) {
              // Formato: "día de mes de año"
              const fechaPartes = ruta.fechaProgramada.split(' de ');
              if (fechaPartes.length >= 3) {
                const dia = parseInt(fechaPartes[0]);
                const mes = this.obtenerNumeroMes(fechaPartes[1]);
                const año = parseInt(fechaPartes[2]);
                if (!isNaN(dia) && !isNaN(año)) {
                  ruta.fechaAgendada = new Date(año, mes, dia);
                } else {
                  ruta.fechaAgendada = new Date();
                }
              } else {
                ruta.fechaAgendada = new Date();
              }
            } else if (ruta.fechaProgramada.includes('/')) {
              // Formato: "dd/mm/yyyy"
              const [dia, mes, año] = ruta.fechaProgramada.split('/').map(Number);
              ruta.fechaAgendada = new Date(año, mes - 1, dia);
            } else if (ruta.fechaProgramada.includes('-')) {
              // Formato: "yyyy-mm-dd"
              ruta.fechaAgendada = new Date(ruta.fechaProgramada);
            } else {
              // Si no se reconoce el formato, usar fecha actual
              console.warn(`Formato de fecha no reconocido: ${ruta.fechaProgramada}`)
              ruta.fechaAgendada = new Date();
            }
            
            // Verificar si la fecha es válida
            if (isNaN(ruta.fechaAgendada.getTime())) {
              console.warn(`Fecha inválida generada para: ${ruta.fechaProgramada}`);
              ruta.fechaAgendada = new Date();
            }
          } catch (error) {
            console.error(`Error al parsear la fecha: ${ruta.fechaProgramada}`, error);
            ruta.fechaAgendada = new Date();
          }
        }
        
        // Obtener información del usuario que agendó la ruta
        if (ruta.userId) {
          try {
            const usuario = await this.rutasGuardadasService.obtenerInfoUsuario(ruta.userId);
            if (usuario) {
              // Agregar el nombre del usuario a la ruta
              ruta['nombreUsuario'] = `${usuario.nombre || ''} ${usuario.apellido || ''}`.trim();
              if (!ruta['nombreUsuario']) {
                ruta['nombreUsuario'] = usuario.email || 'Usuario';
              }
            }
          } catch (error) {
            console.error(`Error al obtener información del usuario ${ruta.userId}:`, error);
          }
        }
      }

      // Inicializar rutas filtradas con todas las rutas
      this.rutasFiltradas = [...this.rutas];
      
      // Aplicar filtro activo si hay uno seleccionado
      if (this.filtroActivo !== 'Todas') {
        this.aplicarFiltroActivo();
      }
    } catch (error) {
      console.error('Error al cargar rutas agendadas:', error);
    }
  }

  private obtenerNumeroMes(nombreMes: string): number {
    const meses = {
      'enero': 0, 'febrero': 1, 'marzo': 2, 'abril': 3,
      'mayo': 4, 'junio': 5, 'julio': 6, 'agosto': 7,
      'septiembre': 8, 'octubre': 9, 'noviembre': 10, 'diciembre': 11
    };
    
    // Normalizar el nombre del mes (quitar acentos, convertir a minúsculas)
    const nombreNormalizado = nombreMes.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    
    // Buscar coincidencia exacta o parcial
    for (const [mes, numero] of Object.entries(meses)) {
      if (nombreNormalizado === mes || nombreNormalizado.includes(mes) || mes.includes(nombreNormalizado)) {
        return numero;
      }
    }
    
    console.warn(`Mes no reconocido: ${nombreMes}, usando enero como valor predeterminado`);
    return 0; // Enero como valor predeterminado
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

  verRuta(ruta: RutaAgendada) {
    // Navegar a los detalles de la ruta agendada
    this.router.navigate(['/ruta-detalles'], {
      queryParams: {
        id: ruta.rutaId,
        nombre: ruta.nombre,
        ubicacion: ruta.ubicacion,
        dificultad: ruta.dificultad,
        imagen: ruta.imagen,
        descripcion: ruta.descripcion,
        caracteristicas: JSON.stringify(ruta.caracteristicas),
        puntosInteres: ruta.puntosInteres
      }
    });
  }

  editarRuta(ruta: RutaAgendada) {
    // Las autoridades no pueden editar rutas agendadas por usuarios
    console.log('Las autoridades no pueden editar rutas agendadas por usuarios');
  }

  async eliminarRuta(ruta: RutaAgendada) {
    // Las autoridades no pueden eliminar rutas agendadas por usuarios
    console.log('Las autoridades no pueden eliminar rutas agendadas por usuarios');
  }

  async verDetallesRuta(ruta: RutaAgendada) {
    // Mostrar un alert con los detalles de la ruta
    const { AlertController } = await import('@ionic/angular/standalone');
    const alertController = new AlertController();
    
    let usuarioInfo = 'No disponible';
    if (ruta['nombreUsuario']) {
      usuarioInfo = ruta['nombreUsuario'];
    } else if (ruta.userId) {
      usuarioInfo = ruta.userId;
    }
    
    const alert = await alertController.create({
      header: 'Detalles de la Ruta Agendada',
      subHeader: ruta.nombre,
      message: `
        <p><strong>Ubicación:</strong> ${ruta.ubicacion}</p>
        <p><strong>Dificultad:</strong> ${ruta.dificultad}</p>
        <p><strong>Fecha:</strong> ${ruta.fechaProgramada}</p>
        <p><strong>Hora:</strong> ${ruta.horaProgramada}</p>
        <p><strong>Usuario:</strong> ${usuarioInfo}</p>
        ${ruta.descripcion ? `<p><strong>Descripción:</strong> ${ruta.descripcion}</p>` : ''}
      `,
      buttons: ['Cerrar']
    });
    
    await alert.present();
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
    finSemana.setHours(23, 59, 59, 999); // Final del día
    
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const finMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
    finMes.setHours(23, 59, 59, 999); // Final del día

    // Si hay un término de búsqueda, aplicamos el filtro sobre las rutas ya filtradas por búsqueda
    let rutasBase = this.searchTerm ? this.rutasFiltradas : this.rutas;

    switch (this.filtroActivo) {
      case 'Hoy':
        this.rutasFiltradas = rutasBase.filter(ruta => {
          if (!ruta.fechaAgendada) return false;
          
          // Asegurarse de que fechaAgendada es un objeto Date
          const fechaRuta = new Date(ruta.fechaAgendada);
          if (isNaN(fechaRuta.getTime())) return false;
          
          fechaRuta.setHours(0, 0, 0, 0);
          return fechaRuta.getTime() === hoy.getTime();
        });
        break;
      case 'Esta Semana':
      case 'Semana':
        this.rutasFiltradas = rutasBase.filter(ruta => {
          if (!ruta.fechaAgendada) return false;
          
          // Asegurarse de que fechaAgendada es un objeto Date
          const fechaRuta = new Date(ruta.fechaAgendada);
          if (isNaN(fechaRuta.getTime())) return false;
          
          return fechaRuta >= inicioSemana && fechaRuta <= finSemana;
        });
        break;
      case 'Este Mes':
      case 'Mes':
        this.rutasFiltradas = rutasBase.filter(ruta => {
          if (!ruta.fechaAgendada) return false;
          
          // Asegurarse de que fechaAgendada es un objeto Date
          const fechaRuta = new Date(ruta.fechaAgendada);
          if (isNaN(fechaRuta.getTime())) return false;
          
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
    
    // Ordenar rutas por fecha (las más próximas primero)
    this.rutasFiltradas.sort((a, b) => {
      // Si no hay fechaAgendada, mover al final
      if (!a.fechaAgendada) return 1;
      if (!b.fechaAgendada) return -1;
      
      // Convertir a objetos Date si no lo son
      const fechaA = a.fechaAgendada instanceof Date ? a.fechaAgendada : new Date(a.fechaAgendada);
      const fechaB = b.fechaAgendada instanceof Date ? b.fechaAgendada : new Date(b.fechaAgendada);
      
      // Verificar si las fechas son válidas
      if (isNaN(fechaA.getTime())) return 1;
      if (isNaN(fechaB.getTime())) return -1;
      
      // Ordenar por fecha (las más próximas primero)
      return fechaA.getTime() - fechaB.getTime();
    });
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
