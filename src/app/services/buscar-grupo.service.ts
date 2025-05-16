import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, getDocs, query, where, doc, deleteDoc, updateDoc, getDoc, orderBy } from '@angular/fire/firestore';
import { AuthService } from './auth.service';

export interface PublicacionGrupo {
  id?: string;
  rutaId: string;
  nombre: string;
  ubicacion: string;
  dificultad: string;
  imagen: string;
  descripcion: string;
  caracteristicas: {
    tipoTerreno: string;
    mejorEpoca: string;
    recomendaciones: string;
  };
  puntosInteres: string;
  usuarioId: string;
  nombreUsuario: string;
  fecha: Date;
}

export interface ComentarioGrupo {
  id?: string;
  publicacionId: string;
  usuarioId: string;
  nombreUsuario: string;
  texto: string;
  fecha: Date;
  esRespuesta?: boolean;
  comentarioPadreId?: string;
  respuestas?: ComentarioGrupo[];
}

@Injectable({
  providedIn: 'root'
})
export class BuscarGrupoService {
  private coleccionPublicaciones = 'buscar-grupo';
  private coleccionComentarios = 'comentarios-grupo';

  constructor(
    private firestore: Firestore,
    private authService: AuthService
  ) { }

  /**
   * Crea una nueva publicación de búsqueda de grupo
   * @param publicacion Datos de la publicación
   * @returns ID de la publicación creada
   */
  async crearPublicacion(publicacion: PublicacionGrupo): Promise<string> {
    const usuario = this.authService.getCurrentUser();
    if (!usuario) {
      throw new Error('No hay un usuario logueado');
    }

    try {
      const docRef = await addDoc(collection(this.firestore, this.coleccionPublicaciones), {
        ...publicacion,
        usuarioId: usuario.id,
        nombreUsuario: usuario.nombre || usuario.email,
        fecha: new Date()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error al crear publicación:', error);
      throw error;
    }
  }

  /**
   * Obtiene todas las publicaciones de búsqueda de grupo
   * @returns Lista de publicaciones
   */
  async obtenerPublicaciones(): Promise<PublicacionGrupo[]> {
    try {
      const q = query(
        collection(this.firestore, this.coleccionPublicaciones),
        orderBy('fecha', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      const publicaciones: PublicacionGrupo[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data() as Omit<PublicacionGrupo, 'id'>;
        const fecha = data.fecha as any;
        
        publicaciones.push({
          ...data,
          id: doc.id,
          fecha: fecha.toDate ? fecha.toDate() : new Date(fecha)
        });
      });
      
      return publicaciones;
    } catch (error) {
      console.error('Error al obtener publicaciones:', error);
      throw error;
    }
  }

  /**
   * Obtiene una publicación específica por su ID
   * @param id ID de la publicación
   * @returns Datos de la publicación
   */
  async obtenerPublicacionPorId(id: string): Promise<PublicacionGrupo | null> {
    try {
      const docRef = doc(this.firestore, this.coleccionPublicaciones, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data() as Omit<PublicacionGrupo, 'id'>;
        const fecha = data.fecha as any;
        
        return {
          ...data,
          id: docSnap.id,
          fecha: fecha.toDate ? fecha.toDate() : new Date(fecha)
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error al obtener publicación:', error);
      throw error;
    }
  }

  /**
   * Elimina una publicación de búsqueda de grupo
   * @param id ID de la publicación a eliminar
   */
  async eliminarPublicacion(id: string): Promise<void> {
    const usuario = this.authService.getCurrentUser();
    if (!usuario) {
      throw new Error('No hay un usuario logueado');
    }

    try {
      // Primero verificamos que la publicación pertenezca al usuario actual
      const publicacion = await this.obtenerPublicacionPorId(id);
      if (!publicacion || publicacion.usuarioId !== usuario.id) {
        throw new Error('No tienes permiso para eliminar esta publicación');
      }

      // Eliminamos la publicación
      await deleteDoc(doc(this.firestore, this.coleccionPublicaciones, id));
      
      // También eliminamos todos los comentarios asociados a esta publicación
      const q = query(
        collection(this.firestore, this.coleccionComentarios),
        where('publicacionId', '==', id)
      );
      const querySnapshot = await getDocs(q);
      
      const batch: any[] = [];
      querySnapshot.forEach((doc) => {
        batch.push(deleteDoc(doc.ref));
      });
      
      await Promise.all(batch);
    } catch (error) {
      console.error('Error al eliminar publicación:', error);
      throw error;
    }
  }

  /**
   * Añade un comentario a una publicación de búsqueda de grupo
   * @param comentario Datos del comentario
   * @returns ID del comentario creado
   */
  async agregarComentario(comentario: ComentarioGrupo): Promise<string> {
    const usuario = this.authService.getCurrentUser();
    if (!usuario) {
      throw new Error('No hay un usuario logueado');
    }

    try {
      const docRef = await addDoc(collection(this.firestore, this.coleccionComentarios), {
        ...comentario,
        usuarioId: usuario.id,
        nombreUsuario: usuario.nombre || usuario.email,
        fecha: new Date()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error al agregar comentario:', error);
      throw error;
    }
  }

  /**
   * Obtiene todos los comentarios de una publicación
   * @param publicacionId ID de la publicación
   * @returns Lista de comentarios
   */
  async obtenerComentarios(publicacionId: string): Promise<ComentarioGrupo[]> {
    try {
      const q = query(
        collection(this.firestore, this.coleccionComentarios),
        where('publicacionId', '==', publicacionId),
        orderBy('fecha', 'asc')
      );
      const querySnapshot = await getDocs(q);
      
      const comentarios: ComentarioGrupo[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data() as Omit<ComentarioGrupo, 'id'>;
        const fecha = data.fecha as any;
        
        comentarios.push({
          ...data,
          id: doc.id,
          fecha: fecha.toDate ? fecha.toDate() : new Date(fecha)
        });
      });
      
      return comentarios;
    } catch (error) {
      console.error('Error al obtener comentarios:', error);
      throw error;
    }
  }

  /**
   * Elimina un comentario
   * @param id ID del comentario a eliminar
   */
  async eliminarComentario(id: string): Promise<void> {
    const usuario = this.authService.getCurrentUser();
    if (!usuario) {
      throw new Error('No hay un usuario logueado');
    }

    try {
      // Obtenemos el comentario para verificar que pertenezca al usuario actual
      const docRef = doc(this.firestore, this.coleccionComentarios, id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error('El comentario no existe');
      }
      
      const comentario = docSnap.data() as ComentarioGrupo;
      if (comentario.usuarioId !== usuario.id) {
        throw new Error('No tienes permiso para eliminar este comentario');
      }
      
      // Eliminamos el comentario
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error al eliminar comentario:', error);
      throw error;
    }
  }
}