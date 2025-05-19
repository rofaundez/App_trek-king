import { getStorage } from '@angular/fire/storage';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { DatabaseService } from '../services/database.service';
import { AlertController } from '@ionic/angular';
import { HeaderComponent } from '../components/header/header.component';
import { Subscription } from 'rxjs';
import { ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';
import { Firestore, doc, getDoc, updateDoc, collection, query, where, getDocs } from '@angular/fire/firestore';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [HeaderComponent,IonicModule, CommonModule, FormsModule]
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
    private alertController: AlertController,
    private firestore: Firestore
  ) {
    // Verificar el estado de la autenticación al iniciar
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      console.log('No hay usuario al iniciar el componente');
      this.router.navigate(['/login']);
    }
  }

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

      // Asegurarnos de que el ID sea un string
      const userId = String(currentUser.id);
      console.log('ID del usuario en updateProfile (convertido a string):', userId);

      // Verificar que el usuario existe en Firestore
      const userDocRef = doc(this.firestore, 'users', userId);
      const userDocSnap = await getDoc(userDocRef);
      
      if (!userDocSnap.exists()) {
        throw new Error('Usuario no encontrado en Firestore');
      }

      // Creamos el objeto de usuario actualizado
      const updatedUser = {
        ...currentUser,
        id: userId, // Aseguramos que el ID sea string
        nombre: this.userProfile.nombre,
        apellido: this.userProfile.apellido,
        photo: this.userProfile.photo
      };

      // Solo actualizamos el email si ha cambiado
      if (currentUser.email !== this.userProfile.email) {
        try {
          // Verificar si ya existe un usuario con ese email en Firestore
          const usersCollection = collection(this.firestore, 'users');
          const q = query(usersCollection, where('email', '==', this.userProfile.email));
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty && querySnapshot.docs[0].id !== userId) {
            // Si existe un usuario con ese email y no es el usuario actual
            const alert = await this.alertController.create({
              header: 'Error',
              message: 'El correo electrónico ya está registrado por otro usuario',
              buttons: ['OK']
            });
            await alert.present();
            return;
          }
          
          // Si no hay conflicto, actualizamos el email
          updatedUser.email = this.userProfile.email;
        } catch (error) {
          console.error('Error al verificar el email:', error);
          const alert = await this.alertController.create({
            header: 'Error',
            message: 'No se pudo verificar la disponibilidad del email',
            buttons: ['OK']
          });
          await alert.present();
          return;
        }
      } else {
        // Si el email no ha cambiado, aseguramos que se mantenga el original
        updatedUser.email = currentUser.email;
      }

      // Actualizamos directamente en Firestore
      const updateData = {
        nombre: updatedUser.nombre,
        apellido: updatedUser.apellido,
        email: updatedUser.email,
        photo: updatedUser.photo
      };
      
      await updateDoc(userDocRef, updateData);
      
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
    if (!file) {
      console.log('No se seleccionó ningún archivo');
      return;
    }
  
    try {
      const currentUser = this.authService.getCurrentUser();
      console.log('Usuario actual:', currentUser); // Para depuración
  
      if (!currentUser) {
        throw new Error('No hay usuario activo en la sesión');
      }
  
      // Asegurarnos de que el usuario tenga un ID válido
      if (!currentUser.id) {
        throw new Error('El usuario no tiene un ID válido');
      }
      
      // Asegurarnos de que el ID sea un string (formato de Firebase)
      const userId = String(currentUser.id);
      console.log('ID del usuario (convertido a string):', userId, 'tipo:', typeof userId);
  
      // Verificar que el usuario existe en Firestore antes de continuar
      const userDocRef = doc(this.firestore, 'users', userId);
      const userDocSnap = await getDoc(userDocRef);
      
      if (!userDocSnap.exists()) {
        throw new Error('Usuario no encontrado en Firestore');
      }
      
      const storage = getStorage();
      // Usar el ID como string para la ruta de almacenamiento
      const storageRef = ref(storage, `profile-photos/${userId}`);
      
      // Subir el archivo
      const uploadTask = await uploadBytes(storageRef, file);
      
      // Obtener la URL de descarga
      const downloadURL = await getDownloadURL(uploadTask.ref);
      
      // Actualizar directamente en Firestore
      try {
        // Actualizar el documento en Firestore
        await updateDoc(userDocRef, {
          photo: downloadURL
        });
        
        // Actualizar el usuario en memoria con la nueva foto
        const updatedUser = {
          ...currentUser,
          id: userId, // Aseguramos que el ID sea string
          photo: downloadURL
        };
        
        // Actualizar en el AuthService
        this.authService.updateCurrentUser(updatedUser);
      } catch (error: any) {
        console.error('Error al actualizar usuario en Firestore:', error);
        throw new Error(`Error al actualizar la foto: ${error.message}`);
      }
      
      // Actualizar la vista
      this.userProfile.photo = downloadURL;
      
      const alert = await this.alertController.create({
        header: 'Éxito',
        message: 'Foto de perfil actualizada correctamente',
        buttons: ['OK']
      });
      await alert.present();
      
    } catch (error: any) { // Tipamos el error como any para acceder a message
      console.error('Error al actualizar la foto de perfil:', error);
      const alert = await this.alertController.create({
        header: 'Error',
        message: `No se pudo actualizar la foto de perfil. Error: ${error.message}`,
        buttons: ['OK']
      });
      await alert.present();
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
  Gotorutas() {
    this.router.navigate(['/agenda']);
  }
}
