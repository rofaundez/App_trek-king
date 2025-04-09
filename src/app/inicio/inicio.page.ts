import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { DatabaseService } from '../services/database.service';
import { User } from '../models/user.model';

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

  constructor(
    private dbService: DatabaseService,
    private toastController: ToastController
  ) { }

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
    try {
      const newUser: User = {
        email: this.email,
        nombre: this.nombre,
        password: this.password,
        role: 'user'
      };

      const userId = await this.dbService.addUser(newUser);
      console.log('Usuario registrado exitosamente:', userId);
      
      // Show success toast
      const toast = await this.toastController.create({
        message: 'Buena perro funciona',
        duration: 2000,
        position: 'middle',
        color: 'success'
      });
      toast.present();

      // Clear form after successful registration
      this.email = '';
      this.nombre = '';
      this.password = '';
      this.confirmPassword = '';
      
    } catch (error) {
      console.error('Error al registrar usuario:', error);
    }
  }
  forgotPassword() {
    // Aquí iría la lógica para redirigir a la página de "Olvidé mi contraseña"
    console.log('Olvidé mi contraseña');
  }

  

}
