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

  private async initDB(): Promise<void> {
    const request = indexedDB.open(this.dbName, 1);

    request.onerror = (event) => {
      console.error('Error opening database:', event);
    };

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;
      console.log('Creating stores...');

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

    request.onsuccess = async (event) => {
      this.db = (event.target as IDBOpenDBRequest).result;
      console.log('Database opened successfully');
      
      // Check if default user exists
      try {
        const user = await this.getUserByEmail('jeremiasramos@gmail.com');
        if (!user) {
          // Add default user if it doesn't exist
          const defaultUser = {
            email: 'jeremiasramos@gmail.com',
            password: '12344321',
            nombre: 'Jeremias',
            apellido: 'Ramos'  // Changed from apellido to userLastName
          };
          await this.addUser(defaultUser);
          console.log('Default user added');
        }
      } catch (error) {
        console.error('Error checking/adding default user:', error);
      }
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

  // Add default autoridad if not exists
  async addDefaultAutoridad(): Promise<void> {
    try {
      const existingAutoridad = await this.getAutoridadByEmail('autoridad@example.com');
      if (!existingAutoridad) {
        const defaultAutoridad: Autoridad = {
          email: 'autoridad@example.com',
          password: '12345678',
          nombre: 'Autoridad',
          role: 'autoridad',
          zona: 'Santiago'
        };
        await this.addAutoridad(defaultAutoridad);
        console.log('Default autoridad added successfully');
      }
    } catch (error) {
      console.error('Error adding default autoridad:', error);
    }
  }

  // Get user by email
  async getUserByEmail(email: string): Promise<User | null> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        console.error('Database not initialized');
        reject('Database not initialized');
        return;
      }

      const transaction = this.db.transaction('users', 'readonly');
      const store = transaction.objectStore('users');
      const emailIndex = store.index('email');
      const request = emailIndex.get(email);

      request.onsuccess = () => {
        console.log('User search result:', request.result);
        resolve(request.result || null);
      };
      request.onerror = () => {
        console.error('Error getting user:', request.error);
        reject(request.error);
      };
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

  // Get route by ID
  async getRouteById(id: string): Promise<Rutas | null> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject('Database not initialized');
        return;
      }

      const transaction = this.db.transaction('rutas', 'readonly');
      const store = transaction.objectStore('rutas');
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  // Get routes by creator
  async getRoutesByCreator(creatorId: string): Promise<Rutas[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject('Database not initialized');
        return;
      }

      const transaction = this.db.transaction('rutas', 'readonly');
      const store = transaction.objectStore('rutas');
      const request = store.getAll();

      request.onsuccess = () => {
        const routes = request.result.filter(route => route.creador.id === creatorId);
        resolve(routes);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Update route
  async updateRoute(id: string, routeData: Rutas): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject('Database not initialized');
        return;
      }

      const transaction = this.db.transaction('rutas', 'readwrite');
      const store = transaction.objectStore('rutas');
      const request = store.put({ ...routeData, id });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Delete route
  async deleteRoute(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject('Database not initialized');
        return;
      }

      const transaction = this.db.transaction('rutas', 'readwrite');
      const store = transaction.objectStore('rutas');
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Clear entire database
  async clearDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject('Database not initialized');
        return;
      }

      const stores = ['users', 'autoridades', 'rutas'];
      let completedStores = 0;

      stores.forEach(storeName => {
        const transaction = this.db!.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.clear();

        request.onsuccess = () => {
          completedStores++;
          if (completedStores === stores.length) {
            resolve();
          }
        };

        request.onerror = () => reject(request.error);
      });
    });
  }
}