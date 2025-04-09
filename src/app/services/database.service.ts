import { Injectable } from '@angular/core';
import { User } from '../models/user.model';
import { Rutas } from '../models/rutas.model';
import { Autoridad } from '../models/autoridad.model';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private dbName = 'TrekKingDB';
  private db: IDBDatabase | null = null;

  constructor() {
    this.initDB();
  }

  private initDB(): void {
    const request = indexedDB.open(this.dbName, 1);

    request.onerror = (event) => {
      console.error('Error opening database:', event);
    };

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create Users store
      if (!db.objectStoreNames.contains('users')) {
        const userStore = db.createObjectStore('users', { keyPath: 'id', autoIncrement: true });
        userStore.createIndex('email', 'email', { unique: true });
      }

      // Create Autoridades store
      if (!db.objectStoreNames.contains('autoridades')) {
        const autoridadStore = db.createObjectStore('autoridades', { keyPath: 'id', autoIncrement: true });
        autoridadStore.createIndex('email', 'email', { unique: true });
      }
      
      // Create Rutas store
      if (!db.objectStoreNames.contains('rutas')) {
        const rutasStore = db.createObjectStore('rutas', { keyPath: 'id', autoIncrement: true });
        rutasStore.createIndex('nombre', 'nombre', { unique: true });
      }
    };

    request.onsuccess = (event) => {
      this.db = (event.target as IDBOpenDBRequest).result;
    };
  }

  // Add new user
  async addUser(user: User): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject('Database not initialized');
        return;
      }

      const transaction = this.db.transaction('users', 'readwrite');
      const store = transaction.objectStore('users');
      const request = store.add(user);

      request.onsuccess = () => resolve(request.result as string);
      request.onerror = () => reject(request.error);
    });
  }

  // Add new autoridad
  async addAutoridad(autoridad: Autoridad): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject('Database not initialized');
        return;
      }

      const transaction = this.db.transaction('autoridades', 'readwrite');
      const store = transaction.objectStore('autoridades');
      const request = store.add(autoridad);

      request.onsuccess = () => resolve(request.result as string);
      request.onerror = () => reject(request.error);
    });
  }

  // Get user by email
  async getUserByEmail(email: string): Promise<User | null> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject('Database not initialized');
        return;
      }

      const transaction = this.db.transaction('users', 'readonly');
      const store = transaction.objectStore('users');
      const emailIndex = store.index('email');
      const request = emailIndex.get(email);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  // Get autoridad by email
  async getAutoridadByEmail(email: string): Promise<Autoridad | null> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject('Database not initialized');
        return;
      }

      const transaction = this.db.transaction('autoridades', 'readonly');
      const store = transaction.objectStore('autoridades');
      const emailIndex = store.index('email');
      const request = emailIndex.get(email);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  // Get all users
  async getAllUsers(): Promise<User[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject('Database not initialized');
        return;
      }

      const transaction = this.db.transaction('users', 'readonly');
      const store = transaction.objectStore('users');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Get all autoridades
  async getAllAutoridades(): Promise<Autoridad[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject('Database not initialized');
        return;
      }

      const transaction = this.db.transaction('autoridades', 'readonly');
      const store = transaction.objectStore('autoridades');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Add new route
  async addRoute(ruta: Rutas): Promise<string> {
      return new Promise((resolve, reject) => {
        if (!this.db) {
          reject('Database not initialized');
          return;
        }
  
        const transaction = this.db.transaction('rutas', 'readwrite');
        const store = transaction.objectStore('rutas');
        const request = store.add(ruta);
  
        request.onsuccess = () => resolve(request.result as string);
        request.onerror = () => reject(request.error);
      });
  }

  // Get all routes
  async getAllRoutes(): Promise<Rutas[]> {
      return new Promise((resolve, reject) => {
        if (!this.db) {
          reject('Database not initialized');
          return;
        }
  
        const transaction = this.db.transaction('rutas', 'readonly');
        const store = transaction.objectStore('rutas');
        const request = store.getAll();
  
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
  }

  async addInitialRoute() {
      const rutaSantaLucia: Rutas = {
        nombre: "Cerro Santa Lucia",
        foto: "assets/cerro-santa-lucia.jpg",
        descripcion: "cerro santa lucia :v",
        dificultad: "Moderada",
        puntosDescanso: [
          {
            nombre: "Terraza Neptuno",
            ubicacion: {
              lat: -33.4401,
              lng: -70.6445
            },
            descripcion: "Mirador con fuente y área de descanso"
          },
          {
            nombre: "Plaza Benjamín Vicuña Mackenna",
            ubicacion: {
              lat: -33.4399,
              lng: -70.6447
            },
            descripcion: "Plaza con bancas y sombra"
          }
        ],
        puntoInicio: {
          lat: -33.4403,
          lng: -70.6449,
          direccion: "Entrada principal por calle Santa Lucía"
        },
        puntoTermino: {
          lat: -33.4397,
          lng: -70.6443,
          direccion: "Castillo Hidalgo, cumbre del cerro"
        },
        localidad: "Santiago",
        fechaCreacion: new Date(),
        ultimaModificacion: new Date()
      };
    
      try {
        await this.addRoute(rutaSantaLucia);
        console.log('Ruta del Cerro Santa Lucia agregada exitosamente');
      } catch (error) {
        console.error('Error al agregar la ruta:', error);
      }
  }

  async updateUser(id: string, userData: any): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject('Database not initialized');
        return;
      }
  
      const transaction = this.db.transaction('users', 'readwrite');
      const store = transaction.objectStore('users');
      const request = store.put(userData);
  
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deleteUser(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject('Database not initialized');
        return;
      }

      const transaction = this.db.transaction('users', 'readwrite');
      const store = transaction.objectStore('users');
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}