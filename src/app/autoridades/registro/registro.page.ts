import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';
import { addIcons } from 'ionicons';
import { eyeOutline, eyeOffOutline } from 'ionicons/icons';
import { Router } from '@angular/router';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { Firestore, getDocs, addDoc, collection,query,where } from '@angular/fire/firestore';

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
  zona: string = '';
  password: string = '';
  confirmPassword: string = '';
  currentField: string = '';
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

  constructor(
    private authService: AuthService,
    private firestore: Firestore,
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
      // Verificar si el email ya existe
      const AutoridadesRef = collection(this.firestore, 'Autoridades');
      const q = query(AutoridadesRef, where('email', '==', this.email));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const toast = await this.toastController.create({
          message: 'Este correo electrónico ya está registrado',
          duration: 2000,
          position: 'middle',
          color: 'danger'
        });
        toast.present();
        return;
      }

      // Obtener el último ID
      const allAutoridadesQuery = await getDocs(collection(this.firestore, 'Autoridades'));
      const nextId = allAutoridadesQuery.size + 1;

      // Crear nuevo usuario en Firebase con ID
      const newAutoridad = {
        id: nextId,
        email: this.email,
        nombre: this.nombre,
        password: this.password,
        createdAt: new Date(),
        cargo: this.cargo,
        institucion: this.institucion,
        zona: this.zona,
        fotoPerfil: '',
        estado: 'activo'
      };

      await addDoc(AutoridadesRef, newAutoridad);
      this.home();

      const toast = await this.toastController.create({
        message: 'Usuario registrado exitosamente',
        duration: 2000,
        position: 'middle',
        color: 'success'
      });
      await toast.present();

      
      
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
  home (){
    this.router.navigate(['/autoridad-home']);
  }
  validateConfirmPassword(password: string, confirmPass: string): boolean {
    return password === confirmPass;
  }
  togglePasswordVisibility(field: 'password' | 'confirmPassword') {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }
}