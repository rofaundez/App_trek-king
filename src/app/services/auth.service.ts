import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUser: User | null = null;
  private userSubject = new BehaviorSubject<User | null>(null);
  public user$ = this.userSubject.asObservable();
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
  }

  async login(user: User) {
    this.currentUser = user;
    this.userSubject.next(user);
    localStorage.setItem('userSession', JSON.stringify(user));
    this.isAuthenticated.next(true);
  }

  logout() {
    this.currentUser = null;
    this.userSubject.next(null);
    localStorage.removeItem('userSession');
    this.isAuthenticated.next(false);
  }

  isLoggedIn() {
    return this.isAuthenticated.asObservable();
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  updateCurrentUser(user: User) {
    this.currentUser = user;
    this.userSubject.next(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  }
}