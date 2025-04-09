import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { DatabaseService } from '../services/database.service';
import { User } from '../models/user.model';
import { addIcons } from 'ionicons';
import { eyeOutline, eyeOffOutline } from 'ionicons/icons';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule
  ]
})
export class InicioPage implements OnInit {
  email: string = '';
  nombre: string = '';
  password: string = '';
  confirmPassword: string = '';
  currentField: string = '';
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  captchaText: string = '';
  userCaptcha: string = '';
  
  constructor(
    private dbService: DatabaseService,
    private toastController: ToastController
  ) {
    addIcons({ eyeOutline, eyeOffOutline });
    this.generateCaptcha();
  }

  // Add these new methods
  generateCaptcha() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    this.captchaText = '';
    for (let i = 0; i < 6; i++) {
      this.captchaText += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  }

  refreshCaptcha() {
    this.generateCaptcha();
    this.userCaptcha = '';
  }

  ngOnInit() {
    // Set default values for form fields
    this.email = 'jeremiasramos@gmail.com';
    this.nombre = 'jere ramos';
    this.password = '12344321';
    this.confirmPassword = '12344321';
  }

  // Rename the function to avoid conflict
  validateConfirmPassword(password: string, confirmPass: string): boolean {
    return password === confirmPass;
  }



  async register() {
    if (this.userCaptcha !== this.captchaText) {
      const toast = await this.toastController.create({
        message: 'El código captcha no coincide',
        duration: 2000,
        position: 'middle',
        color: 'danger'
      });
      toast.present();
      this.refreshCaptcha();
      return;
    }

    try {
      const existingUserByEmail = await this.dbService.getUserByEmail(this.email);
      if (existingUserByEmail) {
        const toast = await this.toastController.create({
          message: 'Este correo electrónico ya está registrado',
          duration: 2000,
          position: 'middle',
          color: 'danger'
        });
        toast.present();
        return;
      }

      // Verificar si el nombre de usuario ya existe
      const allUsers = await this.dbService.getAllUsers();
      const existingUserByName = allUsers.find(user => user.nombre.toLowerCase() === this.nombre.toLowerCase());
      if (existingUserByName) {
        const toast = await this.toastController.create({
          message: 'Este nombre de usuario ya está en uso',
          duration: 2000,
          position: 'middle',
          color: 'danger'
        });
        toast.present();
        return;
      }
      

      // Show success message without saving user
      const toast = await this.toastController.create({
        message: 'Buena perro funciona',
        duration: 2000,
        position: 'middle',
        color: 'success'
      });
      toast.present();

      // Clear form after showing message
      this.email = '';
      this.nombre = '';
      this.password = '';
      this.confirmPassword = '';
      
    } catch (error) {
      console.error('Error:', error);
      const toast = await this.toastController.create({
        message: 'Error al procesar el formulario',
        duration: 2000,
        position: 'middle',
        color: 'danger'
      });
      toast.present();
    }
  }
  forgotPassword() {
    // Aquí iría la lógica para redirigir a la página de "Olvidé mi contraseña"
    console.log('Olvidé mi contraseña');
  }

  togglePasswordVisibility(field: 'password' | 'confirmPassword') {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }
}
