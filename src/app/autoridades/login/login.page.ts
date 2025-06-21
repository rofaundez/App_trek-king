import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { Firestore,collection,query,where,getDocs } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { DatabaseService } from 'src/app/services/database.service';

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
    private dbService: DatabaseService,
    private authService: AuthService,
    private firestore : Firestore,
    private toastController: ToastController,
    private router: Router
  ) { }

  ngOnInit() {
    this.dbService.initDB();
    this.email = 'je.ramos@duocuc.cl';
    this.password = '12344321';
  }

  // Método para verificar el estado de autenticación
  verificarEstadoAutenticacion() {
    console.log('=== VERIFICANDO ESTADO DE AUTENTICACIÓN ===');
    const autoridad = this.authService.getCurrentAutoridad();
    console.log('Autoridad actual:', autoridad);
    
    if (autoridad) {
      console.log('✅ Autoridad autenticada correctamente');
      console.log('Nombre:', autoridad.nombre);
      console.log('Email:', autoridad.email);
      console.log('Cargo:', autoridad.cargo);
      console.log('ID:', autoridad.id);
    } else {
      console.log('❌ No hay autoridad autenticada');
    }
  }

  async login() {
    try {
      console.log('=== INICIO DE PROCESO DE LOGIN ===');
      console.log('Intentando iniciar sesión con:', this.email, this.password);
      
      // Consultar directamente en Firebase
      const AutoridadesRef = collection(this.firestore, 'Autoridades');
      const q = query(AutoridadesRef, where('email', '==', this.email));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        console.log('Usuario no encontrado en Firebase');
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
      
      console.log('Datos de autoridad encontrados:', autoridadesData);
      
      if (autoridadesData && autoridadesData['password'] === this.password) {
        console.log('Credenciales válidas, procediendo con login...');
        
        // Realizar el login de la autoridad
        const loginResult = await this.authService.loginAutoridad({
          id: autoridadesData['id'],
          email: autoridadesData['email'],
          nombre: autoridadesData['nombre'],
          img: autoridadesData['img'],
          cargo: autoridadesData['cargo'],
          password: autoridadesData['password']
        });
        
        if (loginResult) {
          console.log('Login exitoso, mostrando toast...');
          
          // Verificar el estado de autenticación
          this.verificarEstadoAutenticacion();
          
          // Mostrar mensaje de éxito
          const toast = await this.toastController.create({
            message: '¡Inicio de sesión exitoso!',
            duration: 2000,
            position: 'middle',
            color: 'success'
          });
          await toast.present();
          
          // Esperar un momento para que se complete el proceso y luego navegar
          console.log('Esperando 500ms antes de navegar...');
          setTimeout(async () => {
            console.log('Navegando al home de autoridad...');
            await this.navegarAHome();
          }, 500);
        } else {
          console.error('Error en el proceso de login');
          const toast = await this.toastController.create({
            message: 'Error en el proceso de login',
            duration: 2000,
            position: 'middle',
            color: 'danger'
          });
          toast.present();
        }
        
      } else {
        console.log('Credenciales incorrectas');
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

  casita(){
    this.router.navigate(['/home']);
  };
  goToHome(){
    this.router.navigate(['/autoridades/home']);
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

  // Método alternativo de navegación más robusto
  async navegarAHome() {
    try {
      console.log('Intentando navegación alternativa...');
      
      // Verificar nuevamente que la autoridad esté autenticada
      const autoridad = this.authService.getCurrentAutoridad();
      if (!autoridad) {
        console.error('No hay autoridad autenticada para navegar');
        return;
      }
      
      // Intentar navegación con diferentes métodos
      console.log('Método 1: Navegación directa');
      await this.router.navigate(['/autoridades/home']);
      
    } catch (error) {
      console.error('Error en navegación alternativa:', error);
      
      // Método de respaldo: usar window.location
      console.log('Método 2: Usando window.location');
      window.location.href = '/autoridades/home';
    }
  }
}

