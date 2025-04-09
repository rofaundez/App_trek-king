import { Injectable } from '@angular/core';
import { User } from '../models/user.model';
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
}