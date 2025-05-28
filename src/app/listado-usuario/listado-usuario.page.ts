import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { DatabaseService } from '../services/database.service';
import { User } from '../models/user.model';
import { HeaderComponent } from '../components/header/header.component';

@Component({
  selector: 'app-listado-usuario',
  templateUrl: './listado-usuario.page.html',
  styleUrls: ['./listado-usuario.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class ListadoUsuarioPage implements OnInit {
  users: any[] = [];

  constructor(
    private dbService: DatabaseService,
    private toastController: ToastController
  ) { }

  async ngOnInit() {
    await this.loadUsers();
  }

  async ionViewWillEnter() {
    await this.loadUsers();
  }

  async loadUsers() {
    try {
      const allUsers = await this.dbService.getAllUsers();
      console.log('Raw users data:', allUsers); // Debug log
      
      if (Array.isArray(allUsers)) {
        this.users = allUsers.map(user => ({
          id: user.id,
          nombre: user.nombre,
          email: user.email,
          password: user.password,
          isEditing: false
        }));
        console.log('Processed users:', this.users); // Debug log
      } else {
        console.error('getAllUsers did not return an array');
        this.users = [];
      }
    } catch (error) {
      console.error('Error loading users:', error);
      const toast = await this.toastController.create({
        message: 'Error al cargar usuarios',
        duration: 2000,
        color: 'danger'
      });
      await toast.present();
    }
  }

  async toggleEdit(user: any) {
    if (user.isEditing) {
      try {
        await this.dbService.updateUser(user.id, user);
        const toast = await this.toastController.create({
          message: 'Usuario actualizado exitosamente',
          duration: 2000,
          color: 'success'
        });
        toast.present();
      } catch (error) {
        const toast = await this.toastController.create({
          message: 'Error al actualizar usuario',
          duration: 2000,
          color: 'danger'
        });
        toast.present();
      }
    }
    user.isEditing = !user.isEditing;
  }

  async deleteUser(user: any) {
    try {
      await this.dbService.deleteUser(user.id);
      await this.loadUsers();
      const toast = await this.toastController.create({
        message: 'Usuario eliminado exitosamente',
        duration: 2000,
        color: 'success'
      });
      toast.present();
    } catch (error) {
      const toast = await this.toastController.create({
        message: 'Error al eliminar usuario',
        duration: 2000,
        color: 'danger'
      });
      toast.present();
    }
  }
}
