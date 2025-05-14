import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { IonicModule, ToastController, Platform, IonInput } from '@ionic/angular';
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
  emailIsValid: boolean = false;
  passwordIsValid: boolean = false;
  formIsValid: boolean = false;
  emailTouched: boolean = false;
  passwordTouched: boolean = false;

  @ViewChild('loginForm') loginForm!: NgForm;
  @ViewChild('emailInput') emailInput!: IonInput;
  @ViewChild('passwordInput') passwordInput!: IonInput;

  constructor(
    private authService: AuthService,
    private toastController: ToastController,
    private router: Router,
    private firestore: Firestore,
    private platform: Platform
  ) {}

  ngOnInit() {
    this.email = 'Rodrigo16faundez@gmail.com';
    this.password = '123123123';
    
    // Validar los campos iniciales
    this.validateEmail();
    this.validatePassword();
    this.validateForm();
    
    // Ajustar comportamiento para dispositivos móviles
    if (this.platform.is('mobile') || this.platform.is('mobileweb')) {
      this.setupMobileKeyboardBehavior();
    }
  }
  
  // Método para mejorar la experiencia con el teclado en dispositivos móviles
  setupMobileKeyboardBehavior() {
    // Escuchar eventos de teclado virtual
    window.addEventListener('keyboardDidShow', () => {
      // Ajustar el scroll cuando aparece el teclado
      setTimeout(() => {
        const activeElement = document.activeElement as HTMLElement;
        if (activeElement) {
          activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
    });
  }

  // Validar email con expresión regular
  validateEmail() {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    this.emailIsValid = emailRegex.test(this.email);
    this.validateForm();
  }
  
  // Marcar email como tocado
  onEmailFocus() {
    this.currentField = 'email';
  }
  
  // Marcar email como tocado al perder el foco
  onEmailBlur() {
    this.currentField = '';
    this.emailTouched = true;
    this.validateEmail();
  }
  
  // Validar contraseña
  validatePassword() {
    this.passwordIsValid = this.password.length >= 6;
    this.validateForm();
  }
  
  // Marcar contraseña como tocada
  onPasswordFocus() {
    this.currentField = 'password';
  }
  
  // Marcar contraseña como tocada al perder el foco
  onPasswordBlur() {
    this.currentField = '';
    this.passwordTouched = true;
    this.validatePassword();
  }
  
  // Validar formulario completo
  validateForm() {
    this.formIsValid = this.emailIsValid && this.passwordIsValid;
  }
  
  async login() {
    // Validar antes de enviar
    this.validateEmail();
    this.validatePassword();
    
    if (!this.formIsValid) {
      const toast = await this.toastController.create({
        message: 'Por favor, complete todos los campos correctamente',
        duration: 2000,
        position: 'middle',
        color: 'warning'
      });
      toast.present();
      return;
    }
    
    try {
      console.log('Intentando iniciar sesión con:', this.email, this.password);
      
      // Cerrar el teclado si está abierto (mejora experiencia móvil)
      this.dismissKeyboard();
      
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
  
  // Método para cerrar el teclado virtual en dispositivos móviles
  dismissKeyboard() {
    if (this.platform.is('mobile') || this.platform.is('mobileweb')) {
      // Intentar cerrar el teclado quitando el foco del elemento activo
      const activeElement = document.activeElement as HTMLElement;
      if (activeElement && activeElement.blur) {
        activeElement.blur();
      }
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
