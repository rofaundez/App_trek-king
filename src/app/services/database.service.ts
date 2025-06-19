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
  public dbReady: Promise<void>;
  private dbReadyResolve!: () => void;

  constructor() {
    this.dbReady = new Promise(resolve => this.dbReadyResolve = resolve);
    this.initDB();
  }

  public async initDB(): Promise<void> {
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
      this.dbReadyResolve();
      
      // Check if default user exists
      try {
        const user = await this.getUserByEmail('jeremiasramos@gmail.com');
        if (!user) {
          // Add default user if it doesn't exist
          const defaultUser = {
            email: 'jeremiasramos@gmail.com',
            password: '12344321',
            nombre: 'Jeremias',
            apellido: 'Ramos',
            rut: "20886551-K"  // Changed from apellido to userLastName
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
    await this.initDB;
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
        // Si encontramos un usuario, aseguramos que su ID sea siempre string
        // para mantener consistencia con Firebase
        if (request.result) {
          const user = {...request.result}; // Creamos una copia para no modificar el original
          // Aseguramos que el ID sea siempre un string para Firebase
          if (user.id !== undefined) {
            user.id = String(user.id);
            console.log('Usuario encontrado con ID:', user.id, 'tipo:', typeof user.id);
          } else {
            console.warn('Usuario encontrado sin ID');
          }
          resolve(user);
        } else {
          resolve(null);
        }
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

  // Get user by ID
  async getUserById(id: string | number): Promise<User | null> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        console.error('getUserById: Database not initialized');
        reject('Database not initialized');
        return;
      }

      console.log(`getUserById: Buscando usuario con ID ${id}`);

      // Convertir el ID a número si es necesario para IndexedDB
      const numericId = parseInt(id as string);
      const idToUse = isNaN(numericId) ? id : numericId;
      
      console.log(`getUserById: ID a utilizar: ${idToUse}, tipo: ${typeof idToUse}`);
      
      const transaction = this.db.transaction('users', 'readonly');
      const store = transaction.objectStore('users');
      const request = store.get(idToUse);

      request.onsuccess = () => {
        if (request.result) {
          const user = {...request.result}; // Creamos una copia para no modificar el original
          // Aseguramos que el ID sea siempre un string para Firebase
          if (user.id !== undefined) {
            user.id = String(user.id);
          }
          console.log(`getUserById: Usuario encontrado:`, user);
          resolve(user);
        } else {
          console.warn(`getUserById: No se encontró usuario con ID ${idToUse}`);
          
          // Intentar buscar en Firebase si no se encuentra en IndexedDB
          this.getUserFromFirebase(id)
            .then(user => {
              if (user) {
                console.log(`getUserById: Usuario encontrado en Firebase:`, user);
                resolve(user);
              } else {
                console.warn(`getUserById: Usuario no encontrado en Firebase tampoco`);
                resolve(null);
              }
            })
            .catch(error => {
              console.error(`getUserById: Error al buscar en Firebase:`, error);
              resolve(null);
            });
        }
      };
      request.onerror = (event) => {
        console.error(`getUserById: Error al buscar usuario:`, event);
        reject(request.error);
      };
    });
  }
  
  // Método para obtener usuario desde Firebase
  private async getUserFromFirebase(id: string | number): Promise<User | null> {
    try {
      console.log(`getUserFromFirebase: Intentando obtener usuario con ID ${id} desde Firebase`);
      // Aquí implementaríamos la lógica para obtener el usuario desde Firebase
      // Por ahora, solo es un placeholder
      return null;
    } catch (error) {
      console.error('Error al obtener usuario desde Firebase:', error);
      return null;
    }
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
    return new Promise(async (resolve, reject) => {
      if (!this.db) {
        reject('Database not initialized');
        return;
      }
      
      try {
        // Siempre usamos el ID como string para Firebase
        // Firebase siempre usa IDs como strings
        console.log('Buscando usuario con ID:', id, 'tipo:', typeof id);
        
        // Convertir el ID a número si es necesario para IndexedDB
        // IndexedDB puede usar keyPath con autoIncrement como números
        const numericId = parseInt(id);
        const idToUse = isNaN(numericId) ? id : numericId;
        console.log('ID convertido para búsqueda:', idToUse, 'tipo:', typeof idToUse);
        
        // Primero intentamos buscar el usuario en la base de datos local
        const transaction1 = this.db.transaction('users', 'readonly');
        const store1 = transaction1.objectStore('users');
        const getCurrentRequest = store1.get(idToUse);
        
        getCurrentRequest.onsuccess = async () => {
          const currentUser = getCurrentRequest.result;
          if (!currentUser) {
            reject(new Error('Usuario no encontrado'));
            return;
          }
          
          // Si solo estamos actualizando la foto, mantenemos el email original
          // para evitar problemas con el índice único
          if (userData.photo && !userData.email) {
            userData.email = currentUser.email;
          }
          
          // Si el email ha cambiado, verificamos que no exista otro usuario con ese email
          if (currentUser.email !== userData.email) {
            try {
              const existingUser = await this.getUserByEmail(userData.email);
              // En Firebase, siempre comparamos IDs como strings
              if (existingUser && existingUser.id !== id) {
                reject(new Error('El email ya está en uso por otro usuario'));
                return;
              }
            } catch (error) {
              reject(error);
              return;
            }
          }
          
          // Aseguramos que el objeto userData tenga todos los campos necesarios
          const completeUserData = {
            ...currentUser,
            ...userData,
            id: id // Mantenemos el ID como string para Firebase
          };
          
          // Si llegamos aquí, podemos actualizar el usuario
          // Verificamos nuevamente que this.db no sea null
          if (!this.db) {
            reject('Database not initialized');
            return;
          }
          
          // Aseguramos que el ID sea del tipo correcto para IndexedDB
          // Pero mantenemos el ID como string en el objeto para Firebase
          console.log('Actualizando usuario con ID:', id, 'Datos:', completeUserData);
          
          // Usamos el mismo idToUse para la operación de guardado
          const transaction2 = this.db.transaction('users', 'readwrite');
          const store2 = transaction2.objectStore('users');
          
          // Aseguramos que el objeto tenga el ID en el formato correcto para IndexedDB
          const saveData = {...completeUserData};
          saveData.id = idToUse; // Usamos el ID convertido para IndexedDB
          
          const updateRequest = store2.put(saveData);
          
          updateRequest.onsuccess = () => {
            // Después de guardar, aseguramos que el ID se mantenga como string para
            resolve();
          };
          
          
          updateRequest.onerror = (event) => {
            console.error('Error al actualizar usuario:', event);
            // Verificar si el error está relacionado con la restricción de unicidad del email
            if (updateRequest.error && updateRequest.error.name === 'ConstraintError') {
              reject(new Error('No se pudo actualizar el perfil: El email ya está en uso por otro usuario'));
            } else {
              reject(updateRequest.error);
            }
          };
        };
        
        getCurrentRequest.onerror = () => reject(getCurrentRequest.error);
      } catch (error) {
        console.error('Error en updateUser:', error);
        reject(error);
      }
    });
  }

  async deleteUser(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject('Database not initialized');
        return;
      }

      // Siempre usamos el ID como string para Firebase
      console.log('Eliminando usuario con ID:', id, 'tipo:', typeof id);

      const transaction = this.db.transaction('users', 'readwrite');
      const store = transaction.objectStore('users');
      const request = store.delete(id);

      request.onsuccess = () => {
        console.log('Usuario eliminado correctamente con ID:', id);
        resolve();
      };
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
  // Get all routes
  async getRoutes(): Promise<Rutas[]> {
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

        request.onerror = () => {
          console.error(`Error clearing store ${storeName}:`, request.error);
          reject(request.error);
        };
      });
    });
  }

  async updateAutoridad(id: string, autoridadData: any): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject('Database not initialized');
        return;
      }

      const transaction = this.db.transaction('autoridades', 'readwrite');
      const store = transaction.objectStore('autoridades');
      const request = store.put({ ...autoridadData, id });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deleteAutoridad(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject('Database not initialized');
        return;
      }

      const transaction = this.db.transaction('autoridades', 'readwrite');
      const store = transaction.objectStore('autoridades');
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}