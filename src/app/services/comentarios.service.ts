import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, query, where, getDocs, orderBy } from '@angular/fire/firestore';
import { AuthService } from './auth.service';

export interface Comentario {
  id?: string;
  rutaId: string;
  usuarioId: string;
  nombreUsuario: string;
  texto: string;
  calificacion: number;
  fecha: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ComentariosService {

  constructor(
    private firestore: Firestore,
    private authService: AuthService
  ) { }

  /**
   * Guarda un nuevo comentario en Firebase
   * @param comentario El comentario a guardar
   * @returns Promise con el resultado de la operación
   */
  async guardarComentario(comentario: Comentario): Promise<string> {
    // Verificar si hay un usuario logueado
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('No hay un usuario logueado');
    }

    try {
      // Añadir el comentario a la colección
      const comentariosRef = collection(this.firestore, 'comentarios-rutas');
      const docRef = await addDoc(comentariosRef, {
        ...comentario,
        fecha: new Date()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error al guardar el comentario:', error);
      throw error;
    }
  }

  /**
   * Obtiene todos los comentarios de una ruta específica
   * @param rutaId ID de la ruta
   * @returns Promise con los comentarios de la ruta
   */
  async obtenerComentariosPorRuta(rutaId: string): Promise<Comentario[]> {
    try {
      const comentariosRef = collection(this.firestore, 'comentarios-rutas');
      const q = query(
        comentariosRef, 
        where('rutaId', '==', rutaId),
        orderBy('fecha', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const comentarios: Comentario[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        comentarios.push({
          id: doc.id,
          rutaId: data['rutaId'],
          usuarioId: data['usuarioId'],
          nombreUsuario: data['nombreUsuario'],
          texto: data['texto'],
          calificacion: data['calificacion'],
          fecha: data['fecha'].toDate()
        });
      });
      
      return comentarios;
    } catch (error) {
      console.error('Error al obtener los comentarios:', error);
      throw error;
    }
  }

  /**
   * Calcula la calificación promedio de una ruta
   * @param rutaId ID de la ruta
   * @returns Promise con la calificación promedio
   */
  async obtenerCalificacionPromedio(rutaId: string): Promise<number> {
    try {
      const comentarios = await this.obtenerComentariosPorRuta(rutaId);
      
      if (comentarios.length === 0) {
        return 0;
      }
      
      const sumaCalificaciones = comentarios.reduce((suma, comentario) => suma + comentario.calificacion, 0);
      return sumaCalificaciones / comentarios.length;
    } catch (error) {
      console.error('Error al calcular la calificación promedio:', error);
      throw error;
    }
  }
}