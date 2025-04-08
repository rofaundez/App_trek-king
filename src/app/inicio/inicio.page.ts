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
  username: string = '';
  password: string = '';
  confirmPassword: string = '';

  constructor() { }

  ngOnInit() {
    // Clear all form fields on page initialization
    this.email = '';
    this.username = '';
    this.password = '';
    this.confirmPassword = '';
  }

  compararContraseña(contraseña1 : string, contraseña2 : string) : boolean {
    return contraseña1 === contraseña2 && contraseña1.length >= 8;
  }

  register() {
    // Aquí iría la lógica para enviar los datos de registro a tu backend
    console.log('Registrando:', this.email, this.password, this.username);
  }
  forgotPassword() {
    // Aquí iría la lógica para redirigir a la página de "Olvidé mi contraseña"
    console.log('Olvidé mi contraseña');
  }

}
