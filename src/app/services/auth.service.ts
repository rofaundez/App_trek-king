import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticated = new BehaviorSubject<boolean>(false);
  
  constructor() {
    this.checkAuthStatus();
  }

  checkAuthStatus() {
    const userSession = localStorage.getItem('userSession');
    if (userSession) {
      this.isAuthenticated.next(true);
    }
  }

  login(user: any) {
    localStorage.setItem('userSession', JSON.stringify(user));
    this.isAuthenticated.next(true);
  }

  logout() {
    localStorage.removeItem('userSession');
    this.isAuthenticated.next(false);
  }

  isLoggedIn() {
    return this.isAuthenticated.asObservable();
  }

  getCurrentUser() {
    const userSession = localStorage.getItem('userSession');
    return userSession ? JSON.parse(userSession) : null;
  }
}