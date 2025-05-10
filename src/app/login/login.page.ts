import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { DatabaseService } from '../services/database.service';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Firestore, collection, query, where, getDocs } from '@angular/fire/firestore';

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
    private authService: AuthService,
    private toastController: ToastController,
    private router: Router,
    private firestore: Firestore
  ) { }

  ngOnInit() {
    this.email = 'Rodrigo16faundez@gmail.com';
    this.password = '123123123';
  }

  async login() {
    try {
      console.log('Intentando iniciar sesión con:', this.email, this.password);
      
      // Consultar directamente en Firebase
      const usersRef = collection(this.firestore, 'users');
      const q = query(usersRef, where('email', '==', this.email));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        const toast = await this.toastController.create({
          message: 'Usuario no encontrado',
          duration: 2000,
          position: 'middle',
          color: 'danger'
        });
        toast.present();
        return;
      }

      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();
      
      if (userData && userData['password'] === this.password) {
        console.log('Inicio de sesión exitoso');
        // Asegurarnos de que estamos usando el ID del documento
        const userId = userDoc.id; // Este es el ID del documento de Firebase
        this.authService.login({
          id: userId,
          email: userData['email'],
          nombre: userData['nombre'],
          apellido: userData['apellido'],
          password: userData['password'],
          photo: userData['photo'] || 'assets/img/userLogo.png'
        });
        
        const toast = await this.toastController.create({
          message: '¡Inicio de sesión exitoso!',
          duration: 2000,
          position: 'middle',
          color: 'success'
        });
        await toast.present();
        this.router.navigate(['/home']);
      } else {
        console.log('Inicio de sesión fallido - credenciales inválidas');
        const toast = await this.toastController.create({
          message: 'Credenciales incorrectas',
          duration: 2000,
          position: 'middle',
          color: 'danger'
        });
        toast.present();
      }
    } catch (error) {
      console.error('Error de inicio de sesión:', error);
      const toast = await this.toastController.create({
        message: 'Error al intentar iniciar sesión',
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

  goToRegister() {
    this.router.navigate(['/registro']);
  }
  goToHome() {
    this.router.navigate(['/home']);
  }
  goToAutoridadLogin() {
    this.router.navigate(['/autoridad-login']);
  }
}
