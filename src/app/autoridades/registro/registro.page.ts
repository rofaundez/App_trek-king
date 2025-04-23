import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { DatabaseService } from '../../services/database.service';
import { AuthService } from '../../services/auth.service';
import { addIcons } from 'ionicons';
import { eyeOutline, eyeOffOutline } from 'ionicons/icons';
import { Router } from '@angular/router';

@Component({
  selector: 'app-registro-autoridad',
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
  institucion: string = '';
  cargo: string = '';
  password: string = '';
  confirmPassword: string = '';
  currentField: string = '';
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

  constructor(
    private authService: AuthService,
    private dbService: DatabaseService,
    private toastController: ToastController,
    private router: Router
  ) {
    addIcons({ eyeOutline, eyeOffOutline });
  }

  ngOnInit() {
    // Verificar si hay una autoridad autenticada
    const currentAutoridad = this.authService.getCurrentAutoridad();
    if (!currentAutoridad) {
      this.router.navigate(['/autoridad-login']);
      return;
    }

    // Verificar si la autoridad tiene el rango adecuado
    if (currentAutoridad.cargo !== 'jefe' && currentAutoridad.cargo !== 'encargado') {
      this.router.navigate(['/autoridad-home']);
      return;
    }

    // Valores por defecto para pruebas
    this.email = 'je.ramos@duocuc.cl  ';
    this.nombre = 'jeremias ramos';
    this.institucion = 'policia de chile';
    this.cargo = 'jefe';
    this.password = '';
    this.confirmPassword = '';
  }

  validateConfirmPassword(password: string, confirmPass: string): boolean {
    return password === confirmPass;
  }

  async register() {
    // Validar que las contraseñas coincidan
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

    // Validar longitud de la contraseña
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
      const existinAutoridadByEmail = await this.dbService.getAutoridadByEmail(this.email);
      if (existinAutoridadByEmail) {
        const toast = await this.toastController.create({
          message: 'Este correo electrónico ya está registrado',
          duration: 2000,
          position: 'middle',
          color: 'danger'
        });
        toast.present();
        return;
      }

      // Crear y guardar nueva autoridad
      const newAuthority = {
        email: this.email,
        nombre: this.nombre,
        institucion: this.institucion,
        cargo: this.cargo,
        password: this.password,
        role: 'authority' // Rol específico para autoridades
      };

      await this.dbService.addAutoridad(newAuthority);

      const toast = await this.toastController.create({
        message: 'Autoridad registrada exitosamente',
        duration: 2000,
        position: 'middle',
        color: 'success'
      });
      await toast.present();

      // Navegar al login de autoridades
      this.router.navigate(['/autoridad-login']);
      
    } catch (error) {
      console.error('Error en el registro:', error);
      const toast = await this.toastController.create({
        message: 'Error al registrar autoridad',
        duration: 2000,
        position: 'middle',
        color: 'danger'
      });
      toast.present();
    }
  }

  home() {
    this.router.navigate(['/autoridad-home']);
  }

  togglePasswordVisibility(field: 'password' | 'confirmPassword') {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }
} 