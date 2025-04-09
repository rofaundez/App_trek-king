import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { DatabaseService } from '../services/database.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class ProfilePage implements OnInit {
  userProfile = {
    id: '',
    nombre: '',
    email: '',
    photo: 'assets/default-avatar.jpg'
  };
  isEditing = false;
  tempProfile: any = {};

  constructor(
    private dbService: DatabaseService,
    private toastController: ToastController
  ) { }

  async ngOnInit() {
    await this.loadUserProfile();
  }

  async loadUserProfile() {
    try {
      const userEmail = localStorage.getItem('userEmail');
      if (userEmail) {
        const user = await this.dbService.getUserByEmail(userEmail);
        if (user) {
          this.userProfile = {
            id: user.id || '',
            nombre: user.nombre,
            email: user.email,
            photo: user.img || 'assets/default-avatar.jpg'
          };
          console.log('User profile loaded:', this.userProfile);
        }
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      const toast = await this.toastController.create({
        message: 'Error al cargar el perfil',
        duration: 2000,
        color: 'danger'
      });
      await toast.present();
    }
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    if (this.isEditing) {
      this.tempProfile = { ...this.userProfile };
    }
  }

  async updateProfile() {
    try {
      await this.dbService.updateUser(this.userProfile.id, this.userProfile);
      const toast = await this.toastController.create({
        message: 'Perfil actualizado exitosamente',
        duration: 2000,
        color: 'success'
      });
      toast.present();
      this.isEditing = false;
    } catch (error) {
      const toast = await this.toastController.create({
        message: 'Error al actualizar el perfil',
        duration: 2000,
        color: 'danger'
      });
      toast.present();
    }
  }

  cancelEdit() {
    this.userProfile = { ...this.tempProfile };
    this.isEditing = false;
  }

  async onPhotoSelect(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.userProfile.photo = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }
}
