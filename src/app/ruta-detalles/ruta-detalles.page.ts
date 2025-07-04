import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonBackButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCardSubtitle, IonItem, IonLabel, IonChip, IonIcon, IonButton, IonModal, IonDatetime, IonText, IonDatetimeButton, ToastController, IonTextarea, IonInput, IonRange } from '@ionic/angular/standalone';
import { ActivatedRoute, Router } from '@angular/router';
import { FooterComponent } from '../components/footer/footer.component';
import { addIcons } from 'ionicons';
import { calendarOutline, closeOutline, checkmarkOutline, starOutline, star, sendOutline, timeOutline, personCircleOutline, peopleOutline } from 'ionicons/icons';
import { RutasGuardadasService, RutaAgendada } from '../services/rutas-guardadas.service';
import { AuthService } from '../services/auth.service';
import { ComentariosService, Comentario } from '../services/comentarios.service';
import { HeaderComponent } from '../components/header/header.component';
import { BuscarGrupoService, PublicacionGrupo } from '../services/buscar-grupo.service';
import { AlertController } from '@ionic/angular';

interface RutaInfo {
  descripcion: string;
  caracteristicas: {
    tipoTerreno: string;
    mejorEpoca: string;
    recomendaciones: string;
  };
  puntosInteres: {
    nombre: string;
    descripcion: string;
    imagenes: string[];
  }[];
}

@Component({
  selector: 'app-ruta-detalles',
  templateUrl: './ruta-detalles.page.html',
  styleUrls: ['./ruta-detalles.page.scss'],
  standalone: true,
  imports: [
    IonContent, 
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
    IonTextarea,
    CommonModule, 
    FormsModule,
    FooterComponent
  ],
})
export class RutaDetallesPage implements OnInit {
  rutaId: string = '';
  rutaNombre: string = '';
  rutaUbicacion: string = '';
  rutaDificultad: string = '';
  rutaImagen: string = '';
  
  // Variables para comentarios y calificaciones
  comentarios: Comentario[] = [];
  nuevoComentario: string = '';
  calificacion: number = 0;
  calificacionPromedio: number = 0;
  usuarioActual: any = null;
  
  // Variables para el calendario
  isCalendarModalOpen: boolean = false;
  fechaSeleccionada: string = '';
  horaSeleccionada: string = '';
  fechaMinima: string = '';
  
  // Variable para controlar si la ruta ya está guardada
  rutaYaGuardada: boolean = false;
  
  // Información específica de la ruta
  rutaDescripcion: string = '';
  rutaCaracteristicas: any = {};
  rutaPuntosInteres: any[] = [];
  
  // Base de datos de información de rutas
  private rutasInfo: {[key: string]: RutaInfo} = {
    'cerro_santa_lucia': {
      descripcion: 'El Cerro Santa Lucía es un pequeño cerro ubicado en el centro de Santiago. Con una altura de 69 metros sobre el nivel de la ciudad, ofrece una caminata corta pero gratificante con vistas panorámicas de la ciudad. El sendero está bien mantenido con escaleras y caminos pavimentados, ideal para principiantes y familias.',
      caracteristicas: {
        tipoTerreno: 'Urbano, con senderos pavimentados y escaleras',
        mejorEpoca: 'Todo el año, preferiblemente primavera',
        recomendaciones: 'Llevar agua, protector solar y calzado cómodo.'
      },
      puntosInteres: [
        { nombre: 'Terraza Neptuno', descripcion: 'Vista panorámica de Santiago desde la terraza Neptuno', imagenes: ['terraza_neptuno.jpg'] },
        { nombre: 'Castillo Hidalgo', descripcion: 'Vista del Castillo Hidalgo desde la terraza Neptuno', imagenes: ['castillo_hidalgo.jpg'] },
        { nombre: 'Fuente Neptuno', descripcion: 'Vista de la fuente Neptuno', imagenes: ['fuente_neptuno.jpg'] },
        { nombre: 'Jardines y miradores', descripcion: 'Vistas panorámicas de Santiago desde los jardines y miradores', imagenes: ['jardines_y_miradores.jpg'] }
      ]
    },
    'cascada_san_juan': {
      descripcion: 'El sendero a la Cascada San Juan es una ruta de dificultad media que atraviesa el Parque Natural San Carlos de Apoquindo. El recorrido ofrece hermosos paisajes de la precordillera andina y culmina en una impresionante cascada. El sendero es variado, con tramos de bosque nativo y zonas rocosas.',
      caracteristicas: {
        tipoTerreno: 'Montañoso con senderos de tierra, algunas secciones rocosas y cruces de arroyos',
        mejorEpoca: 'Primavera y otoño. En invierno puede estar con nieve y en verano muy caluroso',
        recomendaciones: 'Llevar al menos 2 litros de agua, protector solar, sombrero, bastones de trekking y calzado adecuado para montaña.'
      },
      puntosInteres: [
        { nombre: 'Mirador del Valle', descripcion: 'Vista panorámica del valle desde el mirador del Valle', imagenes: ['mirador_del_valle.jpg'] },
        { nombre: 'Bosque de Quillayes', descripcion: 'Bosque nativo de Quillayes', imagenes: ['bosque_de_quillayes.jpg'] },
        { nombre: 'Cascada San Juan', descripcion: 'Vista de la cascada San Juan', imagenes: ['cascada_san_juan.jpg'] },
        { nombre: 'Flora y fauna', descripcion: 'Flora y fauna nativa de la zona central de Chile', imagenes: ['flora_y_fauna.jpg'] }
      ]
    },
    'salto_apoquindo': {
      descripcion: 'La ruta al Salto de Apoquindo es un desafiante sendero que recorre la quebrada de Apoquindo hasta llegar a una espectacular caída de agua. El recorrido es exigente, con un desnivel considerable y terreno técnico en algunos tramos. Recomendado para excursionistas con experiencia y buena condición física.',
      caracteristicas: {
        tipoTerreno: 'Montañoso con pendientes pronunciadas, terreno rocoso y varios cruces de río',
        mejorEpoca: 'Primavera tardía y otoño temprano. Evitar en invierno por crecidas del río',
        recomendaciones: 'Llevar mínimo 3 litros de agua, alimentos energéticos, ropa de abrigo, impermeable, botiquín básico y calzado de trekking con buen agarre.'
      },
      puntosInteres: [
        { nombre: 'Mirador de la Quebrada', descripcion: 'Vista del mirador de la Quebrada', imagenes: ['mirador_de_la_quebrada.jpg'] },
        { nombre: 'Bosque Esclerófilo', descripcion: 'Bosque de Esclerófilo', imagenes: ['bosque_esclerofil.jpg'] },
        { nombre: 'Salto de Apoquindo', descripcion: 'Vista del salto de Apoquindo', imagenes: ['salto_de_apoquindo.jpg'] },
        { nombre: 'Formaciones geológicas', descripcion: 'Formaciones geológicas de la cordillera', imagenes: ['formaciones_geologicas.jpg'] }
      ]
    },
    'lago_aculeo': {
      descripcion: 'La ruta alrededor de la Laguna de Aculeo ofrece un recorrido de dificultad media por los alrededores de este emblemático cuerpo de agua. Aunque actualmente la laguna está seca debido a la sequía, el paisaje sigue siendo impresionante, con vistas a los cerros circundantes y la cuenca del antiguo lago.',
      caracteristicas: {
        tipoTerreno: 'Mixto, con caminos de tierra, senderos rurales y algunas pendientes suaves',
        mejorEpoca: 'Otoño e invierno, cuando las temperaturas son más frescas',
        recomendaciones: 'Llevar suficiente agua, protección solar, sombrero, ropa ligera y calzado cómodo para caminatas largas.'
      },
      puntosInteres: [
        { nombre: 'Mirador de la Laguna', descripcion: 'Vista del mirador de la Laguna', imagenes: ['mirador_de_la_laguna.jpg'] },
        { nombre: 'Cerro Cantillana', descripcion: 'Vista del Cerro Cantillana', imagenes: ['cerro_cantillana.jpg'] },
        { nombre: 'Haciendas históricas', descripcion: 'Haciendas históricas en la zona', imagenes: ['haciendas_historicas.jpg'] },
        { nombre: 'Avistamiento de aves', descripcion: 'Avistamiento de aves en temporada', imagenes: ['avistamiento_de_aves.jpg'] }
      ]
    },
    'cerro_minillas': {
      descripcion: 'La travesía entre el Cerro Minillas y el Cerro Tarapacá es una de las rutas más desafiantes de la Región Metropolitana. Con casi 19 km de recorrido y un desnivel acumulado significativo, esta ruta ofrece vistas espectaculares de la cordillera y el valle de Santiago. Solo recomendada para excursionistas experimentados con excelente condición física.',
      caracteristicas: {
        tipoTerreno: 'Alta montaña con pendientes muy pronunciadas, tramos de roca suelta y exposición a precipicios',
        mejorEpoca: 'Verano y principios de otoño, cuando hay menos nieve en altura',
        recomendaciones: 'Llevar mínimo 4 litros de agua, alimentos energéticos, ropa técnica de montaña, protección para el sol y el viento, bastones, y equipo de primeros auxilios.'
      },
      puntosInteres: [
        { nombre: 'Cumbre del Cerro Minillas', descripcion: 'Vista de la cumbre del Cerro Minillas', imagenes: ['cumbre_del_cerro_minillas.jpg'] },
        { nombre: 'Filo del Diablo', descripcion: 'Vista del filo del Diablo', imagenes: ['filo_del_diablo.jpg'] },
        { nombre: 'Cumbre del Cerro Tarapacá', descripcion: 'Vista de la cumbre del Cerro Tarapacá', imagenes: ['cumbre_del_cerro_tarapacá.jpg'] },
        { nombre: 'Vistas panorámicas', descripcion: 'Vistas panorámicas de Santiago y la Cordillera de los Andes', imagenes: ['vistas_panoramicas.jpg'] }
      ]
    }
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private rutasGuardadasService: RutasGuardadasService,
    private toastController: ToastController,
    private authService: AuthService,
    private comentariosService: ComentariosService,
    private buscarGrupoService: BuscarGrupoService,
    private alertController: AlertController
  ) { 
    // Añadir iconos necesarios
    addIcons({ calendarOutline, closeOutline, checkmarkOutline, starOutline, star, sendOutline, timeOutline, personCircleOutline, peopleOutline });
  }

  async ngOnInit() {
    // Inicializamos la fecha mínima para el calendario (fecha actual)
    this.fechaMinima = new Date().toISOString();
    
    // Obtenemos el usuario actual
    this.usuarioActual = this.authService.getCurrentUser();
    
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
        
        // Cargamos los comentarios de la ruta
        await this.cargarComentarios();
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
    // Primero verificamos si tenemos la información en los parámetros de la URL (cuando viene de la agenda o rutas creadas)
    this.route.queryParams.subscribe(params => {
      if (params['descripcion']) {
        // Si tenemos la descripción en los parámetros, la usamos
        this.rutaDescripcion = params['descripcion'];
        
        // Intentamos parsear las características si existen
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
        
        // Parseamos los puntos de interés si existen
        try {
          if (params['puntosInteres']) {
            const puntosInteres = JSON.parse(params['puntosInteres']);
            this.rutaPuntosInteres = Array.isArray(puntosInteres) ? puntosInteres : [];
          } else {
            this.rutaPuntosInteres = [];
          }
        } catch (error) {
          console.error('Error al parsear puntos de interés:', error);
          this.rutaPuntosInteres = [];
        }
      } else {
        // Si no tenemos la información en los parámetros, la buscamos en el objeto rutasInfo
        const rutaInfo = this.rutasInfo[this.rutaId];
        if (rutaInfo) {
          this.rutaDescripcion = rutaInfo.descripcion;
          this.rutaCaracteristicas = rutaInfo.caracteristicas;
          this.rutaPuntosInteres = rutaInfo.puntosInteres || [];
        }
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
  
  /**
   * Carga los comentarios de la ruta actual
   */
  async cargarComentarios() {
    if (!this.rutaId) return;
    
    try {
      // Obtener los comentarios de la ruta
      this.comentarios = await this.comentariosService.obtenerComentariosPorRuta(this.rutaId);
      
      // Calcular la calificación promedio
      this.calificacionPromedio = await this.comentariosService.obtenerCalificacionPromedio(this.rutaId);
    } catch (error) {
      console.error('Error al cargar los comentarios:', error);
      this.mostrarToast('Error al cargar los comentarios. Por favor, intenta nuevamente.');
    }
  }
  
  /**
   * Envía un nuevo comentario para la ruta actual
   */
  async enviarComentario() {
    // Verificar que haya un comentario y una calificación
    if (!this.nuevoComentario.trim()) {
      this.mostrarToast('Por favor, escribe un comentario.');
      return;
    }
    
    if (this.calificacion === 0) {
      this.mostrarToast('Por favor, selecciona una calificación.');
      return;
    }
    
    // Verificar si hay un usuario logueado
    if (!this.usuarioActual) {
      this.mostrarToast('Debes iniciar sesión para dejar un comentario. Por favor, inicia sesión e intenta nuevamente.');
      this.router.navigate(['/login']);
      return;
    }
    
    try {
      // Crear el objeto de comentario
      const comentario: Comentario = {
        rutaId: this.rutaId,
        usuarioId: this.usuarioActual.id,
        nombreUsuario: this.usuarioActual.nombre || this.usuarioActual.email,
        texto: this.nuevoComentario,
        calificacion: this.calificacion,
        fecha: new Date()
      };
      
      // Guardar el comentario en Firebase
      await this.comentariosService.guardarComentario(comentario);
      
      // Limpiar el formulario
      this.nuevoComentario = '';
      this.calificacion = 0;
      
      // Recargar los comentarios
      await this.cargarComentarios();
      
      // Mostrar mensaje de éxito
      this.mostrarToast('¡Comentario publicado con éxito!');
    } catch (error) {
      console.error('Error al enviar el comentario:', error);
      if (error instanceof Error && error.message.includes('No hay un usuario logueado')) {
        this.mostrarToast('Debes iniciar sesión para dejar un comentario. Por favor, inicia sesión e intenta nuevamente.');
        this.router.navigate(['/login']);
      } else {
        this.mostrarToast('Error al publicar el comentario. Por favor, intenta nuevamente.');
      }
    }
  }
  
  /**
   * Formatea la fecha para mostrarla de manera amigable
   * @param fecha Fecha a formatear
   * @returns Fecha formateada
   */
  formatearFecha(fecha: Date): string {
    return fecha.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  /**
   * Genera un array de estrellas para mostrar la calificación
   * @param calificacion Calificación (1-5)
   * @returns Array con valores true/false para cada estrella
   */
  generarEstrellas(calificacion: number): boolean[] {
    return Array(5).fill(0).map((_, i) => i < Math.round(calificacion));
  }

  /**
   * Crea una publicación de búsqueda de grupo para la ruta actual
   */
  async buscarGrupo() {
    try {
      const currentUser = await this.authService.getCurrentUser();
      if (!currentUser || !currentUser.id) {
        throw new Error('No hay usuario logueado o el ID del usuario no está disponible');
      }

      const publicacion: PublicacionGrupo = {
        rutaId: this.rutaId,
        nombre: this.rutaNombre,
        ubicacion: this.rutaUbicacion,
        dificultad: this.rutaDificultad,
        imagen: this.rutaImagen,
        descripcion: this.rutaDescripcion,
        caracteristicas: this.rutaCaracteristicas,
        puntosInteres: Array.isArray(this.rutaPuntosInteres) ? this.rutaPuntosInteres : [], 
        usuarioId: currentUser.id,
        nombreUsuario: currentUser.nombre || currentUser.email || 'Usuario',
        fecha: new Date()
      };

      await this.buscarGrupoService.crearPublicacion(publicacion);
      await this.showAlert('Éxito', 'Publicación creada correctamente');
      this.router.navigate(['/buscar-grupo']);
    } catch (error) {
      console.error('Error al crear la publicación:', error);
      await this.showAlert('Error', 'No se pudo crear la publicación');
    }
  }

  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }
}
