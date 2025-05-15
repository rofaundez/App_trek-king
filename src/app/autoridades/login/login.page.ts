import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { Firestore,collection,query,where,getDocs } from '@angular/fire/firestore';
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
    private firestore : Firestore,
    private toastController: ToastController,
    private router: Router
  ) { }

  ngOnInit() {
    this.email = 'je.ramos@duocuc.cl';
    this.password = '12344321';
  }


  async login() {
    try {
      console.log('Intentando iniciar sesión con:', this.email, this.password);
      
      // Consultar directamente en Firebase
      const AutoridadesRef = collection(this.firestore, 'Autoridades');
      const q = query(AutoridadesRef, where('email', '==', this.email));
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

      const autoridadesDoc = querySnapshot.docs[0];
      const autoridadesData = autoridadesDoc.data();
      
      if (autoridadesData && autoridadesData['password'] === this.password) {
        console.log('Inicio de sesión exitoso');
        this.authService.loginAutoridad({
          id: parseInt(autoridadesDoc.id) || 0,
          email: autoridadesData['email'],
          nombre: autoridadesData['nombre'],
          img: autoridadesData['img'],
          cargo: autoridadesData['cargo'],
          password: autoridadesData['password']
        });
        this.goToHome();
        const toast = await this.toastController.create({
          message: '¡Inicio de sesión exitoso!',
          duration: 2000,
          position: 'middle',
          color: 'success'
        });
        await toast.present();
        
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


  goToHome(){
    this.router.navigate(['/autoridad-home'])
  };
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
