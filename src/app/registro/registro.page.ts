import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { eyeOutline, eyeOffOutline } from 'ionicons/icons';
import { Router } from '@angular/router';
import { Firestore, collection, addDoc, getDocs, query, where } from '@angular/fire/firestore';

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
  apellido: string = '';
  confirmPassword: string = '';
  currentField: string = '';
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

  
  constructor(
    private firestore: Firestore,
    private toastController: ToastController,
    private router: Router
  ) {
    addIcons({ eyeOutline, eyeOffOutline });
  }


  ngOnInit() {
    // Set default values for form fields
    this.email = 'jeremiasramos@gmail.com';
    this.nombre = 'Jeremias';
    this.password = '12344321';
    this.confirmPassword = '12344321';
    this.apellido = 'Ramos'; // Eliminamos el valor por defecto
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
      // Verificar si el email ya existe
      const usersRef = collection(this.firestore, 'users');
      const q = query(usersRef, where('email', '==', this.email));
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
      const allUsersQuery = await getDocs(collection(this.firestore, 'users'));
      const nextId = allUsersQuery.size + 1;

      // Crear nuevo usuario en Firebase con ID
      const newUser = {
        id: nextId,
        email: this.email,
        nombre: this.nombre,
        password: this.password,
        apellido: this.apellido,
        createdAt: new Date()
      };

      await addDoc(usersRef, newUser);

      const toast = await this.toastController.create({
        message: 'Usuario registrado exitosamente',
        duration: 2000,
        position: 'middle',
        color: 'success'
      });
      await toast.present();

      this.router.navigate(['/login']);
      
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
