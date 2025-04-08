import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

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

  constructor() { }

  ngOnInit() {
    // Clear all form fields on page initialization
    this.email = '';
    this.nombre = '';
    this.password = '';
    this.confirmPassword = '';
  }

  // Rename the function to avoid conflict
  validateConfirmPassword(password: string, confirmPass: string): boolean {
    return password === confirmPass;
  }



  register() {
    // Aquí iría la lógica para enviar los datos de registro a tu backend
    console.log('Registrando:', this.email, this.password, this.nombre);
  }
  forgotPassword() {
    // Aquí iría la lógica para redirigir a la página de "Olvidé mi contraseña"
    console.log('Olvidé mi contraseña');
  }

  

}
