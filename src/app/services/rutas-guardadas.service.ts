import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, where, Firestore, DocumentData } from 'firebase/firestore';

// Interfaz para las rutas agendadas
export interface RutaAgendada {
  id?: string;
  userId?: string; // ID del usuario que guardó la ruta
  rutaId: string;
  nombre: string;
  ubicacion: string;
  dificultad: string;
  imagen: string;
  fechaProgramada: string;
  horaProgramada: string;
}

@Injectable({
  providedIn: 'root'
})
export class RutasGuardadasService {
  private db: Firestore;
  private currentUserId: string | null = null;

  constructor() {
    // Configuración de Firebase obtenida del archivo main.ts
    const firebaseConfig = {
      projectId: "pruebas-66a82",
      appId: "1:892518237032:web:630c2e3f70201b5d030cdd",
      storageBucket: "pruebas-66a82.firebasestorage.app",
      apiKey: "AIzaSyCVKRDCIYMpjLmNrc9QCK1lT_GiZYwSYKg",
      authDomain: "pruebas-66a82.firebaseapp.com",
      messagingSenderId: "892518237032",
      measurementId: "G-MVDKD4D558"
    };

    // Inicializar Firebase
    const app = initializeApp(firebaseConfig);
    this.db = getFirestore(app);
    
    // Obtener el ID del usuario actual del localStorage
    this.cargarUsuarioActual();
  }

  /**
   * Carga el ID del usuario actual desde localStorage
   */
  private cargarUsuarioActual() {
    const userSession = localStorage.getItem('userSession');
    if (userSession) {
      const user = JSON.parse(userSession);
      this.currentUserId = user.id;
    }
  }

  /**
   * Obtiene el ID del usuario actual
   * @returns ID del usuario o null si no hay usuario logueado
   */
  getCurrentUserId(): string | null {
    // Recargar por si ha cambiado
    this.cargarUsuarioActual();
    return this.currentUserId;
  }

  /**
   * Guarda una ruta en la colección 'rutas-guardadas'
   * @param ruta Datos de la ruta a guardar
   * @returns Promise con el ID del documento creado
   */
  async guardarRuta(ruta: RutaAgendada): Promise<string> {
    try {
      // Asegurarse de que la ruta tenga el ID del usuario actual
      const userId = this.getCurrentUserId();
      if (!userId) {
        throw new Error('No hay un usuario logueado para guardar la ruta');
      }
      
      // Añadir el ID del usuario a la ruta
      const rutaConUsuario: RutaAgendada = {
        ...ruta,
        userId: userId
      };
      
      const rutasRef = collection(this.db, 'rutas-guardadas');
      const docRef = await addDoc(rutasRef, rutaConUsuario);
      return docRef.id;
    } catch (error) {
      console.error('Error al guardar la ruta:', error);
      throw error;
    }
  }

  /**
   * Obtiene todas las rutas guardadas del usuario actual
   * @returns Promise con un array de rutas guardadas
   */
  async obtenerRutasGuardadas(): Promise<RutaAgendada[]> {
    try {
      const userId = this.getCurrentUserId();
      if (!userId) {
        console.warn('No hay un usuario logueado para obtener rutas');
        return [];
      }
      
      const rutasRef = collection(this.db, 'rutas-guardadas');
      // Filtrar por el ID del usuario actual
      const q = query(rutasRef, where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      
      const rutas: RutaAgendada[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data() as DocumentData;
        rutas.push({
          id: doc.id,
          userId: data['userId'],
          rutaId: data['rutaId'],
          nombre: data['nombre'],
          ubicacion: data['ubicacion'],
          dificultad: data['dificultad'],
          imagen: data['imagen'],
          fechaProgramada: data['fechaProgramada'],
          horaProgramada: data['horaProgramada']
        });
      });
      
      return rutas;
    } catch (error) {
      console.error('Error al obtener las rutas guardadas:', error);
      throw error;
    }
  }

  /**
   * Elimina una ruta guardada de la base de datos
   * @param rutaId ID de la ruta a eliminar
   * @returns Promise que se resuelve cuando la ruta ha sido eliminada
   */
  async eliminarRutaGuardada(rutaId: string): Promise<void> {
    try {
      const userId = this.getCurrentUserId();
      if (!userId) {
        throw new Error('No hay un usuario logueado para eliminar la ruta');
      }
      
      // Importar las funciones necesarias de Firebase
      const { doc, deleteDoc } = await import('firebase/firestore');
      
      // Referencia al documento a eliminar
      const docRef = doc(this.db, 'rutas-guardadas', rutaId);
      
      // Eliminar el documento
      await deleteDoc(docRef);
      
      console.log('Ruta eliminada correctamente');
    } catch (error) {
      console.error('Error al eliminar la ruta guardada:', error);
      throw error;
    }
  }
}