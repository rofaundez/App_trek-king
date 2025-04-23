import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { DatabaseService } from '../../services/database.service';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-autoridad-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class AutoridadLoginPage implements OnInit {
  email: string = '';
  password: string = '';
  currentField: string = '';

  // Add to constructor
  constructor(
    private authService: AuthService,
    private dbService: DatabaseService,
    private toastController: ToastController,
    private router: Router
  ) { }

  ngOnInit() {
    this.email = 'je.ramos@duocuc.cl';
    this.password = '12344321';
    this.addTestAutoridad();
  }

  async addTestAutoridad() {
    try {
      await this.dbService.addDefaultAutoridad();
      console.log('Test autoridad added or already exists');
    } catch (error) {
      console.error('Error adding test autoridad:', error);
    }
  }

  async login() {
    try {
      console.log('Attempting login with:', this.email, this.password);
      
      const autoridad = await this.dbService.getAutoridadByEmail(this.email);
      console.log('User found:', autoridad);
      
      if (autoridad && autoridad.password === this.password) {
        console.log('Login successful');
        this.authService.loginAutoridad(autoridad);
        
        const toast = await this.toastController.create({
          message: '¡Inicio de sesión exitoso!',
          duration: 2000,
          position: 'middle',
          color: 'success'
        });
        await toast.present();
        this.router.navigate(['/autoridad-home']);
      } else {
        console.log('Login failed - invalid credentials');
        const toast = await this.toastController.create({
          message: 'Credenciales incorrectas',
          duration: 2000,
          position: 'middle',
          color: 'danger'
        });
        toast.present();
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  }

  forgotAutoridadPassword() {
    this.router.navigate(['/recover-autoridad']);
  }
  goToLogin() {
    this.router.navigate(['/login']);
  }
  registerAutoridad() {
    this.router.navigate(['/autoridad-registro']);
  }
}
