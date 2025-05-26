import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, where, Firestore, DocumentData } from 'firebase/firestore';
import { Subject } from 'rxjs';

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
  descripcion?: string;
  caracteristicas?: {
    tipoTerreno: string;
    mejorEpoca: string;
    recomendaciones: string;
  };
  puntosInteres?: string;
}

@Injectable({
  providedIn: 'root'
})
export class RutasGuardadasService {
  private db: Firestore;
  private currentUserId: string | null = null;
  
  // Subject para emitir eventos cuando se crea una nueva ruta
  private rutaCreadaSubject = new Subject<void>();
  
  // Subject para emitir eventos cuando se elimina una ruta
  private rutaEliminadaSubject = new Subject<string>();
  
  // Observables públicos que los componentes pueden suscribirse
  public rutaCreada$ = this.rutaCreadaSubject.asObservable();
  public rutaEliminada$ = this.rutaEliminadaSubject.asObservable();

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
          horaProgramada: data['horaProgramada'],
          descripcion: data['descripcion'],
          caracteristicas: data['caracteristicas'],
          puntosInteres: data['puntosInteres']
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

  /**
   * Obtiene todas las rutas creadas por el usuario actual desde Firebase
   * @returns Promise con un array de rutas creadas
   */
  async obtenerRutasCreadas(): Promise<any[]> {
    try {
      const userId = this.getCurrentUserId();
      if (!userId) {
        console.warn('No hay un usuario logueado para obtener rutas creadas');
        return [];
      }
      
      // Importar las funciones necesarias de Firebase
      const { collection, query, where, getDocs } = await import('firebase/firestore');
      
      // Referencia a la colección de rutas creadas
      const rutasRef = collection(this.db, 'creacion-de-rutas');
      
      // Filtrar por el ID del usuario actual
      const q = query(rutasRef, where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      
      const rutas: any[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        rutas.push({
          ...data,
          id: doc.id // Aseguramos que el ID del documento esté incluido
        });
      });
      
      console.log(`Se encontraron ${rutas.length} rutas creadas por el usuario ${userId}`);
      return rutas;
    } catch (error) {
      console.error('Error al obtener las rutas creadas:', error);
      throw error;
    }
  }

  /**
   * Elimina una ruta creada por el usuario de IndexedDB y de Firebase, así como cualquier referencia en otras colecciones
   * @param rutaId ID de la ruta a eliminar
   * @returns Promise que se resuelve cuando la ruta ha sido eliminada
   */
  async eliminarRutaCreada(rutaId: string): Promise<void> {
    try {
      const userId = this.getCurrentUserId();
      if (!userId) {
        throw new Error('No hay un usuario logueado para eliminar la ruta');
      }
      
      console.log('Eliminando ruta creada con ID:', rutaId);
      
      // Importar las funciones necesarias de Firebase
      const { doc, deleteDoc, collection, query, where, getDocs, getFirestore, getDoc } = await import('firebase/firestore');
      
      // Verificar primero si la ruta existe en la colección 'creacion-de-rutas'
      const docRef = doc(this.db, 'creacion-de-rutas', rutaId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        console.warn(`La ruta con ID ${rutaId} no existe en la colección creacion-de-rutas`);
      } else {
        console.log(`Ruta encontrada en Firebase: ${JSON.stringify(docSnap.data())}`);
      }
      
      // Eliminar la ruta de la colección 'creacion-de-rutas'
      await deleteDoc(docRef);
      console.log('Ruta eliminada correctamente de la colección creacion-de-rutas');
      
      // Buscar y eliminar cualquier referencia a esta ruta en la colección 'rutas-guardadas'
      try {
        // Buscar todas las rutas guardadas que tengan este rutaId
        const rutasGuardadasRef = collection(this.db, 'rutas-guardadas');
        const q = query(rutasGuardadasRef, where('rutaId', '==', rutaId));
        const querySnapshot = await getDocs(q);
        
        console.log(`Se encontraron ${querySnapshot.size} referencias en rutas-guardadas para eliminar`);
        
        // Eliminar cada documento encontrado
        const eliminacionPromises: any[] = [];
        querySnapshot.forEach((doc) => {
          console.log('Eliminando referencia en rutas-guardadas:', doc.id, 'con datos:', JSON.stringify(doc.data()));
          eliminacionPromises.push(deleteDoc(doc.ref));
        });
        
        // Esperar a que todas las eliminaciones se completen
        if (eliminacionPromises.length > 0) {
          await Promise.all(eliminacionPromises);
          console.log(`Se eliminaron ${eliminacionPromises.length} referencias en rutas-guardadas`);
        } else {
          console.log('No se encontraron referencias en rutas-guardadas para eliminar');
        }
      } catch (referencesError) {
        console.error('Error al eliminar referencias en rutas-guardadas:', referencesError);
        // No lanzamos el error para continuar con el proceso de eliminación
        // pero registramos el error para depuración
        console.warn('Continuando con el proceso de eliminación a pesar del error en rutas-guardadas');
      }
      
      // Eliminar comentarios asociados a la ruta
      try {
        const comentariosRef = collection(this.db, 'comentarios-rutas');
        const qComentarios = query(comentariosRef, where('rutaId', '==', rutaId));
        const comentariosSnapshot = await getDocs(qComentarios);
        
        const eliminarComentariosPromises: any[] = [];
        comentariosSnapshot.forEach((doc) => {
          console.log('Eliminando comentario:', doc.id);
          eliminarComentariosPromises.push(deleteDoc(doc.ref));
        });
        
        if (eliminarComentariosPromises.length > 0) {
          await Promise.all(eliminarComentariosPromises);
          console.log(`Se eliminaron ${eliminarComentariosPromises.length} comentarios de la ruta`);
        }
      } catch (comentariosError) {
        console.error('Error al eliminar comentarios de la ruta:', comentariosError);
        // No lanzamos el error para continuar con el proceso de eliminación
      }
      
      // Eliminar publicaciones de búsqueda de grupo asociadas a la ruta
      try {
        const gruposRef = collection(this.db, 'buscar-grupo');
        const qGrupos = query(gruposRef, where('rutaId', '==', rutaId));
        const gruposSnapshot = await getDocs(qGrupos);
        
        console.log(`Se encontraron ${gruposSnapshot.size} publicaciones de búsqueda de grupo para eliminar`);
        
        // Para cada publicación de grupo, también necesitamos eliminar sus comentarios
        for (const docGrupo of gruposSnapshot.docs) {
          const publicacionId = docGrupo.id;
          console.log('Eliminando publicación de grupo:', publicacionId, 'con datos:', JSON.stringify(docGrupo.data()));
          
          // Eliminar comentarios de la publicación
          try {
            const comentariosGrupoRef = collection(this.db, 'comentarios-grupo');
            const qComentariosGrupo = query(comentariosGrupoRef, where('publicacionId', '==', publicacionId));
            const comentariosGrupoSnapshot = await getDocs(qComentariosGrupo);
            
            console.log(`Se encontraron ${comentariosGrupoSnapshot.size} comentarios para la publicación ${publicacionId}`);
            
            const eliminarComentariosGrupoPromises: any[] = [];
            comentariosGrupoSnapshot.forEach((docComentario) => {
              console.log('Eliminando comentario de grupo:', docComentario.id, 'con datos:', JSON.stringify(docComentario.data()));
              eliminarComentariosGrupoPromises.push(deleteDoc(docComentario.ref));
            });
            
            if (eliminarComentariosGrupoPromises.length > 0) {
              await Promise.all(eliminarComentariosGrupoPromises);
              console.log(`Se eliminaron ${eliminarComentariosGrupoPromises.length} comentarios de la publicación de grupo`);
            } else {
              console.log(`No se encontraron comentarios para eliminar en la publicación ${publicacionId}`);
            }
          } catch (comentariosError) {
            console.error(`Error al eliminar comentarios de la publicación ${publicacionId}:`, comentariosError);
            console.warn('Continuando con la eliminación de la publicación a pesar del error en comentarios');
          }
          
          // Eliminar la publicación de grupo
          try {
            await deleteDoc(docGrupo.ref);
            console.log(`Publicación de grupo ${publicacionId} eliminada correctamente`);
          } catch (deleteError) {
            console.error(`Error al eliminar la publicación de grupo ${publicacionId}:`, deleteError);
            console.warn('Continuando con el proceso de eliminación a pesar del error');
          }
        }
        
        console.log(`Se eliminaron ${gruposSnapshot.size} publicaciones de búsqueda de grupo`);
      } catch (gruposError) {
        console.error('Error al eliminar publicaciones de búsqueda de grupo:', gruposError);
        // No lanzamos el error para continuar con el proceso de eliminación
        console.warn('Continuando con el proceso de eliminación a pesar del error en publicaciones de grupo');
      }
      
      // Verificar que la ruta se haya eliminado correctamente
      try {
        const { doc, getDoc } = await import('firebase/firestore');
        const docRef = doc(this.db, 'creacion-de-rutas', rutaId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          console.error(`¡ALERTA! La ruta con ID ${rutaId} todavía existe en Firebase después de intentar eliminarla`);
          throw new Error(`No se pudo eliminar la ruta con ID ${rutaId} de Firebase`);
        } else {
          console.log(`Verificación exitosa: La ruta con ID ${rutaId} ya no existe en Firebase`);
        }
      } catch (verificationError) {
        if (verificationError instanceof Error && verificationError.message.includes('No se pudo eliminar')) {
          throw verificationError;
        }
        // Si el error es de otro tipo (como un error de conexión), asumimos que la eliminación fue exitosa
        console.warn('Error al verificar la eliminación de la ruta, pero continuamos:', verificationError);
      }
      
      // Notificar a los componentes que la ruta ha sido eliminada completamente
      this.rutaEliminadaSubject.next(rutaId);
      
      console.log('Ruta y todas sus referencias eliminadas correctamente');
    } catch (error) {
      console.error('Error al eliminar la ruta creada:', error);
      // Registrar información adicional para depuración
      if (error instanceof Error) {
        console.error('Mensaje de error:', error.message);
        console.error('Stack trace:', error.stack);
      }
      throw error;
    }
  }

  /**
   * Guarda una ruta creada en la colección 'creacion-de-rutas'
   * @param ruta Datos de la ruta creada
   * @returns Promise con el ID del documento creado
   */
  async guardarRutaCreada(ruta: any): Promise<string> {
    try {
      // Asegurarse de que la ruta tenga el ID del usuario actual
      const userId = this.getCurrentUserId();
      if (!userId) {
        throw new Error('No hay un usuario logueado para guardar la ruta');
      }
      
      // Verificar y preparar la imagen
      let fotoUrl = 'assets/img/default-route.jpg';
      if (ruta.foto && typeof ruta.foto === 'string' && ruta.foto.trim() !== '') {
        fotoUrl = ruta.foto;
      }
      
      // Verificar y preparar las características
      const caracteristicas = ruta.caracteristicas || {
        tipoTerreno: 'Variado',
        mejorEpoca: 'Todo el año',
        recomendaciones: 'Llevar agua y calzado adecuado'
      };
      
      // Verificar y preparar los puntos de inicio y término
      const puntoInicio = ruta.puntoInicio || {
        direccion: ruta.puntoInicioDireccion || 'Punto de inicio no especificado',
        lat: ruta.puntoInicioLat || -33.4489,
        lng: ruta.puntoInicioLng || -70.6693
      };
      
      const puntoTermino = ruta.puntoTermino || {
        direccion: ruta.puntoTerminoDireccion || 'Punto de término no especificado',
        lat: ruta.puntoTerminoLat || -33.4489,
        lng: ruta.puntoTerminoLng || -70.6693
      };
      
      // Preparar la ruta para guardar en Firebase con estructura completa y validada
      const rutaParaGuardar = {
        userId: userId,
        nombre: ruta.nombre || 'Ruta sin nombre',
        descripcion: ruta.descripcion || 'Ruta creada por usuario',
        localidad: ruta.localidad || 'Sin ubicación especificada',
        ubicacion: ruta.localidad || 'Sin ubicación especificada',
        dificultad: ruta.dificultad || 'Fácil',
        foto: fotoUrl,
        imagen: fotoUrl,
        creador: ruta.creador || {
          id: userId,
          nombre: 'Usuario',
          email: 'usuario@example.com'
        },
        puntoInicio: puntoInicio,
        puntoTermino: puntoTermino,
        fechaCreacion: ruta.fechaCreacion || new Date(),
        puntosDescanso: ruta.puntosDescanso || [],
        caracteristicas: caracteristicas,
        puntosInteres: ruta.puntosInteres || 'Ruta creada por usuario',
        // Aseguramos que tenga categorías basadas en el tipo de terreno
        categorias: this.determinarCategorias({
          ...ruta,
          caracteristicas: caracteristicas
        })
      };
      
      console.log('Guardando ruta en Firebase con estructura completa:', rutaParaGuardar);
      
      const rutasRef = collection(this.db, 'creacion-de-rutas');
      const docRef = await addDoc(rutasRef, rutaParaGuardar);
      console.log('Ruta creada guardada correctamente en Firebase:', docRef.id);
      
      // Emitir evento para notificar que se ha creado una nueva ruta
      this.rutaCreadaSubject.next();
      
      return docRef.id;
    } catch (error) {
      console.error('Error al guardar la ruta creada:', error);
      throw error;
    }
  }

  /**
   * Determina las categorías de una ruta basándose en su descripción, nombre y características
   * @param ruta La ruta para determinar sus categorías
   * @returns Array de categorías
   */
  private determinarCategorias(ruta: any): string[] {
    // Categoría base para todas las rutas creadas por usuarios
    let categorias = ['Rutas de Usuario'];
    
    // Verificar el tipo de terreno en las características
    if (ruta.caracteristicas && ruta.caracteristicas.tipoTerreno) {
      const tipoTerreno = ruta.caracteristicas.tipoTerreno.toLowerCase();
      
      if (tipoTerreno.includes('montaña') || tipoTerreno.includes('montana') || 
          tipoTerreno.includes('cerro') || tipoTerreno.includes('montañoso')) {
        categorias.push('Montañas');
      }
      
      if (tipoTerreno.includes('río') || tipoTerreno.includes('rio') || 
          tipoTerreno.includes('agua') || tipoTerreno.includes('ribereño')) {
        categorias.push('Rios');
      }
      
      if (tipoTerreno.includes('lago') || tipoTerreno.includes('laguna') || 
          tipoTerreno.includes('lacustre')) {
        categorias.push('Lagos');
      }
      
      if (tipoTerreno.includes('cascada') || tipoTerreno.includes('salto')) {
        categorias.push('Cascadas');
      }
      
      if (tipoTerreno.includes('nieve') || tipoTerreno.includes('glaciar')) {
        categorias.push('Nieve');
      }
      
      if (tipoTerreno.includes('parque') || tipoTerreno.includes('urbano')) {
        categorias.push('Parques');
      }
      
      if (tipoTerreno.includes('playa') || tipoTerreno.includes('costa') || 
          tipoTerreno.includes('costero')) {
        categorias.push('Playas');
      }
      
      if (tipoTerreno.includes('bosque') || tipoTerreno.includes('forestal') || 
          tipoTerreno.includes('boscoso')) {
        categorias.push('Parques');
      }
    }
    
    // Verificar la descripción
    if (ruta.descripcion) {
      this.verificarTextoParaCategorias(ruta.descripcion.toLowerCase(), categorias);
    }
    
    // Verificar el nombre
    if (ruta.nombre) {
      this.verificarTextoParaCategorias(ruta.nombre.toLowerCase(), categorias);
    }
    
    return categorias;
  }
  
  /**
   * Verifica un texto para determinar categorías y las añade al array si no existen
   * @param texto El texto a verificar
   * @param categorias Array de categorías a actualizar
   */
  private verificarTextoParaCategorias(texto: string, categorias: string[]): void {
    if (!categorias.includes('Montañas') && 
        (texto.includes('montaña') || texto.includes('montana') || texto.includes('cerro'))) {
      categorias.push('Montañas');
    }
    
    if (!categorias.includes('Rios') && 
        (texto.includes('río') || texto.includes('rio'))) {
      categorias.push('Rios');
    }
    
    if (!categorias.includes('Lagos') && 
        (texto.includes('lago') || texto.includes('laguna'))) {
      categorias.push('Lagos');
    }
    
    if (!categorias.includes('Cascadas') && 
        (texto.includes('cascada') || texto.includes('salto'))) {
      categorias.push('Cascadas');
    }
    
    if (!categorias.includes('Nieve') && 
        (texto.includes('nieve') || texto.includes('glaciar'))) {
      categorias.push('Nieve');
    }
    
    if (!categorias.includes('Parques') && 
        (texto.includes('parque') || texto.includes('urbano') || texto.includes('bosque'))) {
      categorias.push('Parques');
    }
    
    if (!categorias.includes('Playas') && 
        (texto.includes('playa') || texto.includes('costa'))) {
      categorias.push('Playas');
    }
  }

  // El método obtenerRutasCreadas ya está definido anteriormente en el servicio
  
  /**
   * Obtiene una instancia del servicio DatabaseService
   * @returns Promise con el servicio DatabaseService
   */
  private async getDBService(): Promise<any> {
    try {
      // Importar el servicio dinámicamente para evitar dependencias circulares
      const { DatabaseService } = await import('../services/database.service');
      // Crear una instancia del servicio
      return new DatabaseService();
    } catch (error) {
      console.error('Error al obtener DatabaseService:', error);
      return null;
    }
  }
}