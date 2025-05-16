import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonBackButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCardSubtitle, IonItem, IonLabel, IonChip, IonIcon, IonButton, IonModal, IonDatetime, IonText, IonDatetimeButton, ToastController } from '@ionic/angular/standalone';
import { ActivatedRoute, Router } from '@angular/router';
import { FooterComponent } from '../components/footer/footer.component';
import { addIcons } from 'ionicons';
import { calendarOutline, closeOutline, checkmarkOutline } from 'ionicons/icons';
import { RutasGuardadasService, RutaAgendada } from '../services/rutas-guardadas.service';
import { AuthService } from '../services/auth.service';

interface RutaInfo {
  descripcion: string;
  caracteristicas: {
    tipoTerreno: string;
    mejorEpoca: string;
    recomendaciones: string;
  };
  puntosInteres: string;
}

@Component({
  selector: 'app-ruta-detalles',
  templateUrl: './ruta-detalles.page.html',
  styleUrls: ['./ruta-detalles.page.scss'],
  standalone: true,
  imports: [IonDatetimeButton, 
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar, 
    IonBackButton, 
    IonButtons, 
    IonCard, 
    IonCardContent, 
    IonCardHeader, 
    IonCardTitle, 
    IonCardSubtitle, 
    IonItem, 
    IonLabel, 
    IonChip,
    IonButton,
    IonModal,
    IonDatetime,
    IonIcon,
    IonText,
    CommonModule, 
    FormsModule,
    FooterComponent
  ]
})
export class RutaDetallesPage implements OnInit {
  rutaId: string = '';
  rutaNombre: string = '';
  rutaUbicacion: string = '';
  rutaDificultad: string = '';
  rutaImagen: string = '';
  
  // Variables para el calendario
  isCalendarModalOpen: boolean = false;
  fechaSeleccionada: string = '';
  horaSeleccionada: string = '';
  fechaMinima: string = '';
  
  // Variable para controlar si la ruta ya está guardada
  rutaYaGuardada: boolean = false;
  
  // Información específica de la ruta
  rutaDescripcion: string = '';
  rutaCaracteristicas = {
    tipoTerreno: '',
    mejorEpoca: '',
    recomendaciones: ''
  };
  rutaPuntosInteres: string = '';
  
  // Base de datos de información de rutas
  private rutasInfo: {[key: string]: RutaInfo} = {
    'cerro_santa_lucia': {
      descripcion: 'El Cerro Santa Lucía es un pequeño cerro ubicado en el centro de Santiago. Con una altura de 69 metros sobre el nivel de la ciudad, ofrece una caminata corta pero gratificante con vistas panorámicas de la ciudad. El sendero está bien mantenido con escaleras y caminos pavimentados, ideal para principiantes y familias.',
      caracteristicas: {
        tipoTerreno: 'Urbano, con senderos pavimentados y escaleras',
        mejorEpoca: 'Todo el año, preferiblemente primavera',
        recomendaciones: 'Llevar agua, protector solar y calzado cómodo.'
      },
      puntosInteres: 'Terraza Neptuno, Castillo Hidalgo, Fuente Neptuno, Jardines y miradores con vistas panorámicas de Santiago.'
    },
    'cascada_san_juan': {
      descripcion: 'El sendero a la Cascada San Juan es una ruta de dificultad media que atraviesa el Parque Natural San Carlos de Apoquindo. El recorrido ofrece hermosos paisajes de la precordillera andina y culmina en una impresionante cascada. El sendero es variado, con tramos de bosque nativo y zonas rocosas.',
      caracteristicas: {
        tipoTerreno: 'Montañoso con senderos de tierra, algunas secciones rocosas y cruces de arroyos',
        mejorEpoca: 'Primavera y otoño. En invierno puede estar con nieve y en verano muy caluroso',
        recomendaciones: 'Llevar al menos 2 litros de agua, protector solar, sombrero, bastones de trekking y calzado adecuado para montaña.'
      },
      puntosInteres: 'Mirador del Valle, Bosque de Quillayes, Cascada San Juan, Flora y fauna nativa de la zona central de Chile.'
    },
    'salto_apoquindo': {
      descripcion: 'La ruta al Salto de Apoquindo es un desafiante sendero que recorre la quebrada de Apoquindo hasta llegar a una espectacular caída de agua. El recorrido es exigente, con un desnivel considerable y terreno técnico en algunos tramos. Recomendado para excursionistas con experiencia y buena condición física.',
      caracteristicas: {
        tipoTerreno: 'Montañoso con pendientes pronunciadas, terreno rocoso y varios cruces de río',
        mejorEpoca: 'Primavera tardía y otoño temprano. Evitar en invierno por crecidas del río',
        recomendaciones: 'Llevar mínimo 3 litros de agua, alimentos energéticos, ropa de abrigo, impermeable, botiquín básico y calzado de trekking con buen agarre.'
      },
      puntosInteres: 'Mirador de la Quebrada, Bosque Esclerófilo, Salto de Apoquindo, Formaciones geológicas de la cordillera.'
    },
    'lago_aculeo': {
      descripcion: 'La ruta alrededor de la Laguna de Aculeo ofrece un recorrido de dificultad media por los alrededores de este emblemático cuerpo de agua. Aunque actualmente la laguna está seca debido a la sequía, el paisaje sigue siendo impresionante, con vistas a los cerros circundantes y la cuenca del antiguo lago.',
      caracteristicas: {
        tipoTerreno: 'Mixto, con caminos de tierra, senderos rurales y algunas pendientes suaves',
        mejorEpoca: 'Otoño e invierno, cuando las temperaturas son más frescas',
        recomendaciones: 'Llevar suficiente agua, protección solar, sombrero, ropa ligera y calzado cómodo para caminatas largas.'
      },
      puntosInteres: 'Mirador de la Laguna, Cerro Cantillana, Haciendas históricas, Avistamiento de aves en temporada.'
    },
    'cerro_minillas': {
      descripcion: 'La travesía entre el Cerro Minillas y el Cerro Tarapacá es una de las rutas más desafiantes de la Región Metropolitana. Con casi 19 km de recorrido y un desnivel acumulado significativo, esta ruta ofrece vistas espectaculares de la cordillera y el valle de Santiago. Solo recomendada para excursionistas experimentados con excelente condición física.',
      caracteristicas: {
        tipoTerreno: 'Alta montaña con pendientes muy pronunciadas, tramos de roca suelta y exposición a precipicios',
        mejorEpoca: 'Verano y principios de otoño, cuando hay menos nieve en altura',
        recomendaciones: 'Llevar mínimo 4 litros de agua, alimentos energéticos, ropa técnica de montaña, protección para el sol y el viento, bastones, y equipo de primeros auxilios.'
      },
      puntosInteres: 'Cumbre del Cerro Minillas, Filo del Diablo, Cumbre del Cerro Tarapacá, Vistas panorámicas de Santiago y la Cordillera de los Andes.'
    }
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private rutasGuardadasService: RutasGuardadasService,
    private toastController: ToastController,
    private authService: AuthService
  ) { 
    // Añadir iconos necesarios
    addIcons({ calendarOutline, closeOutline, checkmarkOutline });
  }

  async ngOnInit() {
    // Inicializamos la fecha mínima para el calendario (fecha actual)
    this.fechaMinima = new Date().toISOString();
    
    // Obtenemos los parámetros de la ruta desde la URL
    this.route.queryParams.subscribe(async params => {
      if (params) {
        this.rutaId = params['id'] || '';
        this.rutaNombre = params['nombre'] || '';
        this.rutaUbicacion = params['ubicacion'] || '';
        this.rutaDificultad = params['dificultad'] || '';
        this.rutaImagen = params['imagen'] || '';
        
        // Cargamos la información específica de la ruta seleccionada
        this.cargarInformacionRuta();
        
        // Verificamos si la ruta ya está guardada
        await this.verificarRutaGuardada();
      }
    });
  }
  
  /**
   * Verifica si la ruta actual ya está guardada por el usuario
   */
  async verificarRutaGuardada() {
    // Verificar si hay un usuario logueado
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      return;
    }
    
    try {
      // Obtener las rutas guardadas del usuario
      const rutasGuardadas = await this.rutasGuardadasService.obtenerRutasGuardadas();
      
      // Verificar si la ruta actual está en las rutas guardadas
      this.rutaYaGuardada = rutasGuardadas.some(ruta => ruta.rutaId === this.rutaId);
    } catch (error) {
      console.error('Error al verificar si la ruta está guardada:', error);
    }
  }

  /**
   * Carga la información específica de la ruta seleccionada
   */
  cargarInformacionRuta() {
    // Primero verificamos si tenemos la información en los parámetros de la URL (cuando viene de la agenda)
    this.route.queryParams.subscribe(params => {
      if (params['descripcion'] && params['puntosInteres']) {
        // Si tenemos la información en los parámetros, la usamos
        this.rutaDescripcion = params['descripcion'];
        try {
          this.rutaCaracteristicas = params['caracteristicas'] ? JSON.parse(params['caracteristicas']) : {
            tipoTerreno: 'No especificado',
            mejorEpoca: 'No especificado',
            recomendaciones: 'No especificado'
          };
        } catch (error) {
          console.error('Error al parsear características:', error);
          this.rutaCaracteristicas = {
            tipoTerreno: 'No especificado',
            mejorEpoca: 'No especificado',
            recomendaciones: 'No especificado'
          };
        }
        this.rutaPuntosInteres = params['puntosInteres'];
      } else if (this.rutaId && this.rutasInfo[this.rutaId]) {
        // Si no tenemos la información en los parámetros, la buscamos en la base de datos local
        const infoRuta = this.rutasInfo[this.rutaId];
        this.rutaDescripcion = infoRuta.descripcion;
        this.rutaCaracteristicas = infoRuta.caracteristicas;
        this.rutaPuntosInteres = infoRuta.puntosInteres;
      } else {
        // Información por defecto si no se encuentra la ruta
        this.rutaDescripcion = 'No hay información disponible para esta ruta.';
        this.rutaCaracteristicas = {
          tipoTerreno: 'No especificado',
          mejorEpoca: 'No especificado',
          recomendaciones: 'No especificado'
        };
        this.rutaPuntosInteres = 'No hay puntos de interés registrados para esta ruta.';
      }
    });

  }

  volver() {
    this.router.navigate(['/home']);
  }

  // Métodos para el manejo del calendario
  abrirCalendario() {
    this.isCalendarModalOpen = true;
  }

  cerrarCalendario() {
    this.isCalendarModalOpen = false;
  }

  async confirmarFecha() {
    // Verificamos que se haya seleccionado una fecha y hora
    if (!this.fechaSeleccionada || !this.horaSeleccionada) {
      this.mostrarToast('Por favor, selecciona una fecha y hora para continuar.');
      return;
    }
    
    // Verificar si hay un usuario logueado
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.mostrarToast('Debes iniciar sesión para guardar rutas. Por favor, inicia sesión e intenta nuevamente.');
      this.isCalendarModalOpen = false;
      this.router.navigate(['/login']);
      return;
    }
    
    try {
      // Formateamos la fecha para mostrarla de manera más amigable
      const fechaFormateada = new Date(this.fechaSeleccionada).toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      // Extraemos solo la hora y minutos del string de hora
      const horaFormateada = this.horaSeleccionada.substring(11, 16);
      
      // Crear objeto de ruta agendada
      const rutaAgendada: RutaAgendada = {
        rutaId: this.rutaId,
        nombre: this.rutaNombre,
        ubicacion: this.rutaUbicacion,
        dificultad: this.rutaDificultad,
        imagen: this.rutaImagen,
        fechaProgramada: fechaFormateada,
        horaProgramada: horaFormateada,
        descripcion: this.rutaDescripcion,
        caracteristicas: this.rutaCaracteristicas,
        puntosInteres: this.rutaPuntosInteres
      };
      
      // Guardar en Firebase
      await this.rutasGuardadasService.guardarRuta(rutaAgendada);
      
      // Cerrar el modal y mostrar mensaje de éxito
      this.isCalendarModalOpen = false;
      this.mostrarToast(`¡Ruta guardada con éxito! Has programado la ruta "${this.rutaNombre}" para el ${fechaFormateada} a las ${horaFormateada}.`);
    } catch (error) {
      console.error('Error al guardar la ruta:', error);
      if (error instanceof Error && error.message.includes('No hay un usuario logueado')) {
        this.mostrarToast('Debes iniciar sesión para guardar rutas. Por favor, inicia sesión e intenta nuevamente.');
        this.router.navigate(['/login']);
      } else {
        this.mostrarToast('Ocurrió un error al guardar la ruta. Por favor, intenta nuevamente.');
      }
    }
  }

  cambioFecha(event: any) {
    this.fechaSeleccionada = event.detail.value;
  }

  cambioHora(event: any) {
    this.horaSeleccionada = event.detail.value;
  }
  
  /**
   * Muestra un mensaje toast
   * @param mensaje Mensaje a mostrar
   */
  async mostrarToast(mensaje: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 3000,
      position: 'bottom'
    });
    await toast.present();
  }
}
