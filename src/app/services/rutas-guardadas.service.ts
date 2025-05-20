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

  /**
   * Obtiene todas las rutas creadas por los usuarios
   * @returns Promise con un array de rutas creadas
   */
  async obtenerRutasCreadas(): Promise<any[]> {
    try {
      const rutasRef = collection(this.db, 'creacion-de-rutas');
      const querySnapshot = await getDocs(rutasRef);
      
      const rutas: any[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data() as DocumentData;
        
        // Determinar categorías basadas en la dificultad o tipo de terreno
        let categorias = ['Rutas de Usuario'];
        
        // Si hay datos de características, usarlos para determinar categorías adicionales
        if (data['caracteristicas'] && data['caracteristicas'].tipoTerreno) {
          const tipoTerreno = data['caracteristicas'].tipoTerreno.toLowerCase();
          
          if (tipoTerreno.includes('montaña') || tipoTerreno.includes('montana') || tipoTerreno.includes('cerro') || tipoTerreno.includes('montañoso')) {
            categorias.push('Montañas');
          }
          
          if (tipoTerreno.includes('río') || tipoTerreno.includes('rio') || tipoTerreno.includes('agua') || tipoTerreno.includes('ribereño')) {
            categorias.push('Rios');
          }
          
          if (tipoTerreno.includes('lago') || tipoTerreno.includes('laguna') || tipoTerreno.includes('lacustre')) {
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
          
          if (tipoTerreno.includes('playa') || tipoTerreno.includes('costa') || tipoTerreno.includes('costero')) {
            categorias.push('Playas');
          }

          if (tipoTerreno.includes('bosque') || tipoTerreno.includes('forestal') || tipoTerreno.includes('boscoso')) {
            categorias.push('Parques');
          }
        }
        
        // Si hay descripción, también la usamos para inferir categorías
        if (data['descripcion']) {
          const descripcion = data['descripcion'].toLowerCase();
          
          if (!categorias.includes('Montañas') && 
              (descripcion.includes('montaña') || descripcion.includes('montana') || descripcion.includes('cerro'))) {
            categorias.push('Montañas');
          }
          
          if (!categorias.includes('Rios') && 
              (descripcion.includes('río') || descripcion.includes('rio'))) {
            categorias.push('Rios');
          }
          
          if (!categorias.includes('Lagos') && 
              (descripcion.includes('lago') || descripcion.includes('laguna'))) {
            categorias.push('Lagos');
          }
          
          if (!categorias.includes('Cascadas') && 
              (descripcion.includes('cascada') || descripcion.includes('salto'))) {
            categorias.push('Cascadas');
          }
          
          if (!categorias.includes('Nieve') && 
              (descripcion.includes('nieve') || descripcion.includes('glaciar'))) {
            categorias.push('Nieve');
          }
          
          if (!categorias.includes('Parques') && 
              (descripcion.includes('parque') || descripcion.includes('urbano') || descripcion.includes('bosque'))) {
            categorias.push('Parques');
          }
          
          if (!categorias.includes('Playas') && 
              (descripcion.includes('playa') || descripcion.includes('costa'))) {
            categorias.push('Playas');
          }
        }

        // Si hay nombre, también lo usamos para inferir categorías
        if (data['nombre']) {
          const nombre = data['nombre'].toLowerCase();
          
          if (!categorias.includes('Montañas') && 
              (nombre.includes('montaña') || nombre.includes('montana') || nombre.includes('cerro'))) {
            categorias.push('Montañas');
          }
          
          if (!categorias.includes('Rios') && 
              (nombre.includes('río') || nombre.includes('rio'))) {
            categorias.push('Rios');
          }
          
          if (!categorias.includes('Lagos') && 
              (nombre.includes('lago') || nombre.includes('laguna'))) {
            categorias.push('Lagos');
          }
          
          if (!categorias.includes('Cascadas') && 
              (nombre.includes('cascada') || nombre.includes('salto'))) {
            categorias.push('Cascadas');
          }
          
          if (!categorias.includes('Nieve') && 
              (nombre.includes('nieve') || nombre.includes('glaciar'))) {
            categorias.push('Nieve');
          }
          
          if (!categorias.includes('Parques') && 
              (nombre.includes('parque') || nombre.includes('urbano') || nombre.includes('bosque'))) {
            categorias.push('Parques');
          }
          
          if (!categorias.includes('Playas') && 
              (nombre.includes('playa') || nombre.includes('costa'))) {
            categorias.push('Playas');
          }
        }
        
        // Formatear la dificultad para que coincida con el formato de las rutas predefinidas
        let dificultadFormateada = data['dificultad'] || 'Fácil';
        if (dificultadFormateada === 'Fácil') {
          dificultadFormateada = 'Facil | 1-5km | Est. 1-2h';
        } else if (dificultadFormateada === 'Moderada') {
          dificultadFormateada = 'Media | 5-15km | Est. 2-5h';
        } else if (dificultadFormateada === 'Difícil') {
          dificultadFormateada = 'Dificil | 15-25km | Est. 5-10h';
        } else if (dificultadFormateada === 'Muy Difícil') {
          dificultadFormateada = 'Muy Dificil | +25km | Est. +10h';
        }
        
        // Asegurarnos de que la imagen tenga un valor válido
        let imagenRuta = 'assets/img/default-route.jpg';
        if (data['foto'] && typeof data['foto'] === 'string' && data['foto'].trim() !== '') {
          imagenRuta = data['foto'];
        }
        
        // Crear objeto de ruta con la estructura correcta para mostrar en home
        const rutaFormateada = {
          id: doc.id,
          nombre: data['nombre'] || 'Ruta sin nombre',
          ubicacion: data['localidad'] || 'Sin ubicación especificada',
          dificultad: dificultadFormateada,
          imagen: imagenRuta,
          foto: imagenRuta, // Aseguramos que tanto imagen como foto tengan el mismo valor
          categorias: categorias,
          creador: data['creador'] || {
            id: 'usuario',
            nombre: 'Usuario',
            email: 'usuario@example.com'
          },
          descripcion: data['descripcion'] || 'Ruta creada por usuario',
          caracteristicas: data['caracteristicas'] || {
            tipoTerreno: 'Variado',
            mejorEpoca: 'Todo el año',
            recomendaciones: 'Llevar agua y calzado adecuado'
          },
          puntosInteres: data['puntosInteres'] || 'Ruta creada por usuario',
          puntoInicio: data['puntoInicio'] || {
            direccion: 'Punto de inicio no especificado',
            lat: -33.4489,
            lng: -70.6693
          },
          puntoTermino: data['puntoTermino'] || {
            direccion: 'Punto de término no especificado',
            lat: -33.4489,
            lng: -70.6693
          },
          fechaCreacion: data['fechaCreacion'] || new Date()
        };
        
        console.log('Ruta formateada para mostrar:', rutaFormateada);
        rutas.push(rutaFormateada);
      });
      
      console.log('Rutas creadas recuperadas de Firebase:', rutas);
      return rutas;
    } catch (error) {
      console.error('Error al obtener las rutas creadas:', error);
      return [];
    }
  }
}