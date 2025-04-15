import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { DatabaseService } from '../services/database.service';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class LoginPage implements OnInit {
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
    this.email = 'jeremiasramos@gmail.com';
    this.password = '12344321';
  }

  async login() {
    try {
      console.log('Attempting login with:', this.email, this.password);
      
      const user = await this.dbService.getUserByEmail(this.email);
      console.log('User found:', user);
      
      if (user && user.password === this.password) {
        console.log('Login successful');
        this.authService.login(user);
        
        const toast = await this.toastController.create({
          message: '¡Inicio de sesión exitoso!',
          duration: 2000,
          position: 'middle',
          color: 'success'
        });
        await toast.present();
        this.router.navigate(['/home']);
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

  forgotPassword() {
    this.router.navigate(['/recover']);
  }

  goToRegister() {
    this.router.navigate(['/registro']);
  }
}
