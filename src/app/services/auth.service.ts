import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUser: User | null = null;
  private authStateSubject = new BehaviorSubject<User | null>(null);
  private isAuthenticated = new BehaviorSubject<boolean>(false);
  authState$ = this.authStateSubject.asObservable();

  constructor() {
    // Check for existing session
    const savedUser = localStorage.getItem('userSession');
    if (savedUser) {
      this.currentUser = JSON.parse(savedUser);
      this.authStateSubject.next(this.currentUser);
      this.isAuthenticated.next(true);
    }
  }

  async login(user: User) {
    this.currentUser = user;
    this.authStateSubject.next(user);
    localStorage.setItem('userSession', JSON.stringify(user));
    this.isAuthenticated.next(true);
  }

  logout() {
    this.currentUser = null;
    this.authStateSubject.next(null);
    localStorage.removeItem('userSession');
    this.isAuthenticated.next(false);
  }

  isLoggedIn() {
    return this.isAuthenticated.asObservable();
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }
}