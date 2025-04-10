import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { DatabaseService } from '../services/database.service';
import { User } from '../models/user.model';
import { addIcons } from 'ionicons';
import { eyeOutline, eyeOffOutline } from 'ionicons/icons';
import { Router } from '@angular/router';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule
  ]
})
export class RegistroPage implements OnInit {
  email: string = '';
  nombre: string = '';
  password: string = '';
  confirmPassword: string = '';
  currentField: string = '';
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

  
  constructor(
    private dbService: DatabaseService,
    private toastController: ToastController,
    private router: Router  // Add this line
  ) {
    addIcons({ eyeOutline, eyeOffOutline });
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
    // Validate passwords match
    if (this.password !== this.confirmPassword) {
      const toast = await this.toastController.create({
        message: 'Las contraseñas no coinciden',
        duration: 2000,
        position: 'middle',
        color: 'danger'
      });
      toast.present();
      return;
    }

    // Validate password length
    if (this.password.length < 8) {
      const toast = await this.toastController.create({
        message: 'La contraseña debe tener al menos 8 caracteres',
        duration: 2000,
        position: 'middle',
        color: 'danger'
      });
      toast.present();
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

      // Create and save new user
      const newUser = {
        email: this.email,
        nombre: this.nombre,
        password: this.password
      };

      await this.dbService.addUser(newUser);

      const toast = await this.toastController.create({
        message: 'Usuario registrado exitosamente',
        duration: 2000,
        position: 'middle',
        color: 'success'
      });
      await toast.present();

      // Navigate to login
      //this.router.navigate(['/login']);
      
    } catch (error) {
      console.error('Error en el registro:', error);
      const toast = await this.toastController.create({
        message: 'Error al registrar usuario',
        duration: 2000,
        position: 'middle',
        color: 'danger'
      });
      toast.present();
    }
  }
  forgotPassword() {
    this.router.navigate(['/recover']);
  }

  login() {
    this.router.navigate(['/login']);
  }

  togglePasswordVisibility(field: 'password' | 'confirmPassword') {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }
}
