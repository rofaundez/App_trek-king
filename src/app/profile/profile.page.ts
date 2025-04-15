import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { DatabaseService } from '../services/database.service';
import { AlertController } from '@ionic/angular';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class ProfilePage implements OnInit, OnDestroy {
  userProfile: any = {
    photo: 'assets/img/userLogo.png',
    nombre: '',
    email: ''
  };
  isEditing: boolean = false;
  originalProfile: any;
  private userSubscription?: Subscription;

  constructor(
    private authService: AuthService,
    private router: Router,
    private databaseService: DatabaseService,
    private alertController: AlertController
  ) { }

  ngOnInit() {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.userProfile = {
        ...this.userProfile,
        nombre: currentUser.nombre,
        apellido: currentUser.apellido,
        email: currentUser.email,
        photo: currentUser.photo || 'assets/img/userLogo.png'
      };
      this.originalProfile = { ...this.userProfile };
    }

    // Nos suscribimos a los cambios del usuario
    this.userSubscription = this.authService.user$.subscribe(user => {
      if (user) {
        this.userProfile.nombre = user.nombre;
        this.userProfile.apellido = user.apellido;
        this.userProfile.photo = user.photo || 'assets/img/userLogo.png';
      } else {
        this.userProfile.nombre = 'Invitado';
        this.userProfile.apellido = '';
        this.userProfile.photo = 'assets/img/userLogo.png';
      }
    });
  }

  ngOnDestroy() {
    // Nos desuscribimos para evitar memory leaks
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    if (this.isEditing) {
      this.originalProfile = { ...this.userProfile };
    }
  }

  cancelEdit() {
    this.userProfile = { ...this.originalProfile };
    this.isEditing = false;
  }

  async updateProfile() {
    try {
      // Primero verificamos si el email ha cambiado
      const currentUser = this.authService.getCurrentUser();
      if (!currentUser || !currentUser.id) {
        throw new Error('No hay usuario activo');
      }

      // Solo verificamos el email si ha cambiado
      if (currentUser.email !== this.userProfile.email) {
        // Buscamos si ya existe un usuario con ese email
        const existingUser = await this.databaseService.getUserByEmail(this.userProfile.email);
        
        if (existingUser && existingUser.id !== currentUser.id) {
          // Si existe un usuario con ese email y no es el usuario actual
          const alert = await this.alertController.create({
            header: 'Error',
            message: 'El correo electrónico ya está registrado por otro usuario',
            buttons: ['OK']
          });
          await alert.present();
          return;
        }
      }

      // Si llegamos aquí, podemos actualizar el perfil
      const updatedUser = {
        ...currentUser,
        nombre: this.userProfile.nombre,
        apellido: this.userProfile.apellido,
        email: this.userProfile.email,
        photo: this.userProfile.photo
      };

      // Actualizamos en la base de datos
      await this.databaseService.updateUser(currentUser.id.toString(), updatedUser);
      
      // Actualizamos el usuario en el AuthService
      this.authService.updateCurrentUser(updatedUser);

      // Mostramos mensaje de éxito
      const alert = await this.alertController.create({
        header: 'Éxito',
        message: 'Perfil actualizado correctamente',
        buttons: ['OK']
      });
      await alert.present();

      this.isEditing = false;
    } catch (error) {
      console.error('Error al actualizar el perfil:', error);
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'Ocurrió un error al actualizar el perfil',
        buttons: ['OK']
      });
      await alert.present();
    }
  }

  async onPhotoSelect(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e: any) => {
        const photoBase64 = e.target.result;
        this.userProfile.photo = photoBase64;
        
        try {
          const currentUser = this.authService.getCurrentUser();
          if (currentUser && currentUser.id) {
            const updatedUser = {
              ...currentUser,
              photo: photoBase64
            };
            // Actualizamos en la base de datos
            await this.databaseService.updateUser(currentUser.id.toString(), updatedUser);
            // Actualizamos el AuthService que ahora emitirá el cambio
            this.authService.updateCurrentUser(updatedUser);
          }
        } catch (error) {
          console.error('Error al actualizar la foto de perfil:', error);
        }
      };
      reader.readAsDataURL(file);
    }
  }

  misRutas() {
    this.router.navigate(['/my-routes']);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
  goToHome() {
    this.router.navigate(['/home']);
  }
}
