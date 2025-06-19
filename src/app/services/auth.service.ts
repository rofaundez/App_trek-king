import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { User } from '../models/user.model';
import { Autoridad } from '../models/autoridad.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUser: User | null = null;
  private currentAutoridad: Autoridad | null = null;
  private userSubject = new BehaviorSubject<User | null>(null);
  private autoridadSubject = new BehaviorSubject<Autoridad | null>(null);
  public user$ = this.userSubject.asObservable();
  public autoridad$ = this.autoridadSubject.asObservable();
  private isAuthenticated = new BehaviorSubject<boolean>(false);
  authState$ = this.isAuthenticated.asObservable();

  constructor() {
    // Check for existing session
    const savedUser = localStorage.getItem('userSession');
    if (savedUser) {
      this.currentUser = JSON.parse(savedUser);
      this.userSubject.next(this.currentUser);
      this.isAuthenticated.next(true);
    }
    // Check for existing autoridad session
    const savedAutoridad = localStorage.getItem('autoridadSession');
    if (savedAutoridad) {
      this.currentAutoridad = JSON.parse(savedAutoridad);
      this.autoridadSubject.next(this.currentAutoridad);
      this.isAuthenticated.next(true);
    }
  }

  async login(user: User) {
    // Asegurarnos de que el ID sea un string
    if (user.id) {
      user.id = String(user.id);
    }
    
    // Aseguramos que el usuario tenga un ID válido
    if (!user.id) {
      console.error('Error: Intentando iniciar sesión con un usuario sin ID');
      return;
    }
    
    this.currentUser = user;
    this.userSubject.next(user);
    localStorage.setItem('userSession', JSON.stringify(user));
    localStorage.setItem('currentUser', JSON.stringify(user)); // También guardar en currentUser para consistencia
    this.isAuthenticated.next(true);
    
    console.log('Usuario logueado con ID:', user.id, 'tipo:', typeof user.id);
  }

  async loginAutoridad(autoridad: Autoridad) {
    // Asegurarnos de que el ID sea un string
    if (autoridad.id && typeof autoridad.id === 'string') {
      autoridad.id = autoridad.id;
    }
    if (!autoridad.id) {
      console.error('Error: Intentando iniciar sesión con una autoridad sin ID');
      return;
    }
    this.currentAutoridad = autoridad;
    this.autoridadSubject.next(autoridad);
    localStorage.setItem('autoridadSession', JSON.stringify(autoridad));
    localStorage.setItem('currentAutoridad', JSON.stringify(autoridad));
    this.isAuthenticated.next(true);
  }

  getCurrentAutoridad(): Autoridad | null {
    // Intentar obtener de memoria, si no, de localStorage
    if (this.currentAutoridad) {
      return this.currentAutoridad;
    }
    const savedAutoridad = localStorage.getItem('autoridadSession');
    if (savedAutoridad) {
      this.currentAutoridad = JSON.parse(savedAutoridad);
      return this.currentAutoridad;
    }
    return null;
  }

  updateCurrentAutoridad(autoridad: Autoridad) {
    // Asegurarnos de que el ID sea un string
    if (autoridad.id && typeof autoridad.id === 'string') {
      autoridad.id = autoridad.id;
    } else {
      console.error('Error: Intentando actualizar una autoridad sin ID');
      return;
    }
    this.currentAutoridad = autoridad;
    this.autoridadSubject.next(autoridad);
    localStorage.setItem('currentAutoridad', JSON.stringify(autoridad));
    localStorage.setItem('autoridadSession', JSON.stringify(autoridad));
  }

  logout() {
    this.currentUser = null;
    this.userSubject.next(null);
    localStorage.removeItem('userSession');
    this.isAuthenticated.next(false);
  }

  logoutAutoridad() {
    this.currentAutoridad = null;
    this.autoridadSubject.next(null);
    localStorage.removeItem('autoridadSession');
    localStorage.removeItem('currentAutoridad');
    this.isAuthenticated.next(false);
  }

  isLoggedIn() {
    return this.isAuthenticated.asObservable();
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  updateCurrentUser(user: User) {
    // Asegurarnos de que el ID sea un string
    if (user.id && typeof user.id === 'string') {
      user.id = user.id;
    } else {
      console.error('Error: Intentando actualizar un usuario sin ID');
      return;
    }
    
    console.log('Actualizando usuario con ID:', user.id, 'tipo:', typeof user.id);
    
    this.currentUser = user;
    this.userSubject.next(user);
    
    // Actualizar tanto currentUser como userSession para mantener consistencia
    localStorage.setItem('currentUser', JSON.stringify(user));
    localStorage.setItem('userSession', JSON.stringify(user));
  }
}