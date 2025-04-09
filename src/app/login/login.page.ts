import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { DatabaseService } from '../services/database.service';
import { Router } from '@angular/router';

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

  constructor(
    private dbService: DatabaseService,
    private toastController: ToastController,
    private router: Router
  ) { }

  ngOnInit() {
    // Set default values for testing
    this.email = 'jeremiasramos@gmail.com';
    this.password = '12344321';
  }

  async login() {
    try {
      const user = await this.dbService.getUserByEmail(this.email);
      
      if (user && user.password === this.password) {
        const toast = await this.toastController.create({
          message: '¡Inicio de sesión exitoso!',
          duration: 2000,
          position: 'middle',
          color: 'success'
        });
        toast.present();
      } else {
        const toast = await this.toastController.create({
          message: 'Credenciales incorrectas',
          duration: 2000,
          position: 'middle',
          color: 'danger'
        });
        toast.present();
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
    }
  }

  forgotPassword() {
    console.log('Olvidé mi contraseña');
  }

  goToRegister() {
    this.router.navigate(['/registro']);
  }
}
