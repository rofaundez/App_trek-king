import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonSearchbar, IonButton, IonList, IonItem, 
         IonAvatar, IonIcon, IonFab, IonFabButton, IonLabel, IonBackButton, IonButtons, IonCard, 
         IonCardHeader, IonCardContent, IonCardTitle, IonCardSubtitle, IonChip, IonTextarea, 
         IonModal, ToastController, AlertController } from '@ionic/angular/standalone';
import { BuscarGrupoService, PublicacionGrupo, ComentarioGrupo } from '../services/buscar-grupo.service';
import { AuthService } from '../services/auth.service';
import { addIcons } from 'ionicons';
import { peopleOutline, personCircleOutline, timeOutline, sendOutline, chatbubbleOutline, closeOutline, returnDownForwardOutline, closeCircleOutline, eyeOutline, trashOutline } from 'ionicons/icons';
import { HeaderComponent } from '../components/header/header.component';

interface Grupo {
  id: string;
  titulo: string;
  descripcion: string;
  creador: string;
  fecha: string;
  rutaImagen: string;
  categorias: string[];
}

@Component({
  selector: 'app-grupos',
  templateUrl: './grupos.page.html',
  styleUrls: ['./grupos.page.scss'],
  standalone: true,
  imports: [IonButtons, IonBackButton, 
    HeaderComponent,
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar, 
    IonButton, 
    IonButtons, 
    IonList, 
    IonItem, 
    IonIcon, 
    IonFab, 
    IonLabel,
    IonSearchbar,
    IonAvatar,
    IonFabButton,
    IonCard,
    IonCardHeader,
    IonCardContent,
    IonCardTitle,
    IonCardSubtitle,
    IonChip,
    IonTextarea,
    IonModal,
    CommonModule, 
    FormsModule
  ]
})
export class GruposPage implements OnInit {
  userPhoto: string = 'assets/img/default-avatar.png';
  filtroActivo: string = 'Todos';
  gruposDisponibles: Grupo[] = [];
  gruposFiltrados: Grupo[] = [];
  isDragging: boolean = false;
  startX: number = 0;
  scrollLeft: number = 0;
  
  // Variables para las publicaciones de búsqueda de grupo
  publicaciones: PublicacionGrupo[] = [];
  publicacionSeleccionada: PublicacionGrupo | null = null;
  
  // Variables para los comentarios
  comentarios: ComentarioGrupo[] = [];
  nuevoComentario: string = '';
  isComentariosModalOpen: boolean = false;
  usuarioActual: any = null;
  comentarioSeleccionado: ComentarioGrupo | null = null;
  modoRespuesta: boolean = false;

  constructor(
    private router: Router,
    private buscarGrupoService: BuscarGrupoService,
    private authService: AuthService,
    private toastController: ToastController,
    private alertController: AlertController
  ) {
    // Añadir iconos necesarios
    addIcons({ peopleOutline, personCircleOutline, timeOutline, sendOutline, chatbubbleOutline, closeOutline, returnDownForwardOutline, closeCircleOutline, eyeOutline, trashOutline });
  }

  async ngOnInit() {
    // Obtenemos el usuario actual
    this.usuarioActual = this.authService.getCurrentUser();
    
    // Cargamos las publicaciones de búsqueda de grupo
    await this.cargarPublicaciones();
  }

  /**
   * Carga las publicaciones de búsqueda de grupo desde Firebase
   */
  async cargarPublicaciones() {
    try {
      this.publicaciones = await this.buscarGrupoService.obtenerPublicaciones();
    } catch (error) {
      console.error('Error al cargar publicaciones:', error);
      this.mostrarToast('Error al cargar las publicaciones. Por favor, intenta nuevamente.');
    }
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }

  onSearch(event: any) {
    const query = event.target.value.toLowerCase();
    if (query) {
      this.gruposFiltrados = this.gruposDisponibles.filter(grupo => 
        grupo.titulo.toLowerCase().includes(query) || 
        grupo.descripcion.toLowerCase().includes(query)
      );
    } else {
      this.gruposFiltrados = [...this.gruposDisponibles];
    }
  }

  filtrarPorCategoria(categoria: string) {
    this.filtroActivo = categoria;
    
    if (categoria === 'Todos') {
      this.gruposFiltrados = [...this.gruposDisponibles];
    } else {
      this.gruposFiltrados = this.gruposDisponibles.filter(grupo => 
        grupo.categorias.includes(categoria)
      );
    }
  }

  /**
   * Abre el modal de comentarios para una publicación
   * @param publicacion Publicación seleccionada
   */
  async verComentarios(publicacion: PublicacionGrupo) {
    this.publicacionSeleccionada = publicacion;
    this.nuevoComentario = '';
    this.modoRespuesta = false;
    this.comentarioSeleccionado = null;
    
    try {
      // Cargar los comentarios de la publicación
      if (publicacion.id) {
        const comentariosPlanos = await this.buscarGrupoService.obtenerComentarios(publicacion.id);
        this.organizarComentariosConRespuestas(comentariosPlanos);
      }
      
      // Abrir el modal
      this.isComentariosModalOpen = true;
    } catch (error) {
      console.error('Error al cargar comentarios:', error);
      this.mostrarToast('Error al cargar los comentarios. Por favor, intenta nuevamente.');
    }
  }
  
  /**
   * Cierra el modal de comentarios
   */
  cerrarComentarios() {
    this.isComentariosModalOpen = false;
    this.publicacionSeleccionada = null;
    this.modoRespuesta = false;
    this.comentarioSeleccionado = null;
    this.nuevoComentario = '';
  }
  
  /**
   * Envía un nuevo comentario o respuesta para la publicación seleccionada
   */
  async enviarComentario() {
    // Verificar que haya un comentario
    if (!this.nuevoComentario.trim()) {
      this.mostrarToast('Por favor, escribe un comentario.');
      return;
    }
    
    // Verificar si hay un usuario logueado
    if (!this.usuarioActual) {
      this.mostrarToast('Debes iniciar sesión para dejar un comentario. Por favor, inicia sesión e intenta nuevamente.');
      this.isComentariosModalOpen = false;
      this.router.navigate(['/login']);
      return;
    }
    
    // Verificar que haya una publicación seleccionada
    if (!this.publicacionSeleccionada || !this.publicacionSeleccionada.id) {
      this.mostrarToast('Error al enviar el comentario. Por favor, intenta nuevamente.');
      return;
    }
    
    try {
      // Crear el objeto de comentario
      const comentario: ComentarioGrupo = {
        publicacionId: this.publicacionSeleccionada.id,
        usuarioId: this.usuarioActual.id,
        nombreUsuario: this.usuarioActual.nombre || this.usuarioActual.email,
        texto: this.nuevoComentario,
        fecha: new Date()
      };
      
      // Si es una respuesta, añadir los campos adicionales
      if (this.modoRespuesta && this.comentarioSeleccionado) {
        comentario.esRespuesta = true;
        comentario.comentarioPadreId = this.comentarioSeleccionado.id;
      }
      
      // Guardar el comentario en Firebase
      await this.buscarGrupoService.agregarComentario(comentario);
      
      // Limpiar el formulario y resetear el modo respuesta
      this.nuevoComentario = '';
      this.modoRespuesta = false;
      this.comentarioSeleccionado = null;
      
      // Recargar los comentarios
      const comentariosPlanos = await this.buscarGrupoService.obtenerComentarios(this.publicacionSeleccionada.id);
      this.organizarComentariosConRespuestas(comentariosPlanos);
      
      // Mostrar mensaje de éxito
      this.mostrarToast('¡Comentario publicado con éxito!');
    } catch (error) {
      console.error('Error al enviar el comentario:', error);
      if (error instanceof Error && error.message.includes('No hay un usuario logueado')) {
        this.mostrarToast('Debes iniciar sesión para dejar un comentario. Por favor, inicia sesión e intenta nuevamente.');
        this.isComentariosModalOpen = false;
        this.router.navigate(['/login']);
      } else {
        this.mostrarToast('Error al publicar el comentario. Por favor, intenta nuevamente.');
      }
    }
  }
  
  /**
   * Muestra un diálogo de confirmación para eliminar una publicación
   * @param publicacion Publicación a eliminar
   * @param event Evento del click
   */
  async confirmarEliminarPublicacion(publicacion: PublicacionGrupo, event: Event) {
    // Detener la propagación del evento
    event.stopPropagation();
    
    // Verificar si el usuario actual es el creador de la publicación
    if (!this.usuarioActual || this.usuarioActual.id !== publicacion.usuarioId) {
      this.mostrarToast('Solo el creador puede eliminar esta publicación.');
      return;
    }
    
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: '¿Estás seguro de que deseas eliminar esta publicación?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => this.eliminarPublicacion(publicacion.id!)
        }
      ]
    });

    await alert.present();
  }
  
  /**
   * Elimina una publicación
   * @param id ID de la publicación a eliminar
   */
  private async eliminarPublicacion(id: string) {
    try {
      await this.buscarGrupoService.eliminarPublicacion(id);
      await this.cargarPublicaciones();
      this.mostrarToast('Publicación eliminada correctamente.');
    } catch (error) {
      console.error('Error al eliminar publicación:', error);
      this.mostrarToast('Error al eliminar la publicación. Por favor, intenta nuevamente.');
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

  // Funciones para el scroll horizontal con arrastre
  isMouseDown(event: MouseEvent) {
    const slider = event.currentTarget as HTMLElement;
    this.isDragging = true;
    this.startX = event.pageX - slider.offsetLeft;
    this.scrollLeft = slider.scrollLeft;
  }

  onMouseMove(event: MouseEvent) {
    if (!this.isDragging) return;
    const slider = event.currentTarget as HTMLElement;
    const x = event.pageX - slider.offsetLeft;
    const walk = (x - this.startX) * 2; // Velocidad de scroll
    slider.scrollLeft = this.scrollLeft - walk;
  }

  isMouseUp(event: MouseEvent) {
    this.isDragging = false;
  }

  volver() {
    this.router.navigate(['/home']);
  }
  
  /**
   * Activa el modo de respuesta a un comentario
   * @param comentario Comentario al que se responderá
   */
  activarModoRespuesta(comentario: ComentarioGrupo) {
    this.modoRespuesta = true;
    this.comentarioSeleccionado = comentario;
    this.nuevoComentario = '';
  }
  
  /**
   * Cancela el modo de respuesta
   */
  cancelarRespuesta() {
    this.modoRespuesta = false;
    this.comentarioSeleccionado = null;
    this.nuevoComentario = '';
  }
  
  /**
   * Organiza los comentarios planos en una estructura jerárquica con respuestas anidadas
   * @param comentariosPlanos Lista plana de comentarios
   */
  organizarComentariosConRespuestas(comentariosPlanos: ComentarioGrupo[]) {
    // Primero, separamos los comentarios principales de las respuestas
    const comentariosPrincipales: ComentarioGrupo[] = [];
    const respuestas: ComentarioGrupo[] = [];
    
    comentariosPlanos.forEach(comentario => {
      if (comentario.esRespuesta) {
        respuestas.push(comentario);
      } else {
        // Inicializamos el array de respuestas para cada comentario principal
        comentario.respuestas = [];
        comentariosPrincipales.push(comentario);
      }
    });
    
    // Luego, asignamos cada respuesta a su comentario padre
    respuestas.forEach(respuesta => {
      if (respuesta.comentarioPadreId) {
        const comentarioPadre = comentariosPrincipales.find(c => c.id === respuesta.comentarioPadreId);
        if (comentarioPadre && comentarioPadre.respuestas) {
          comentarioPadre.respuestas.push(respuesta);
        }
      }
    });
    
    // Actualizamos la lista de comentarios
    this.comentarios = comentariosPrincipales;
  }
  
  /**
   * Navega a la página de detalles de la ruta
   * @param publicacion Publicación con los datos de la ruta
   */
  verDetallesRuta(publicacion: PublicacionGrupo) {
    this.router.navigate(['/ruta-detalles'], {
      queryParams: {
        id: publicacion.rutaId,
        nombre: publicacion.nombre,
        ubicacion: publicacion.ubicacion,
        dificultad: publicacion.dificultad,
        imagen: publicacion.imagen,
        descripcion: publicacion.descripcion,
        caracteristicas: JSON.stringify(publicacion.caracteristicas),
        puntosInteres: publicacion.puntosInteres
      }
    });
  }
}
