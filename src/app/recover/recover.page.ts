import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { DatabaseService } from '../services/database.service';

@Component({
  selector: 'app-recover',
  templateUrl: './recover.page.html',
  styleUrls: ['./recover.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class RecoverPage {
  email: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  showPasswordReset: boolean = false;
  foundUser: any = null;

  constructor(
    private dbService: DatabaseService,
    private toastController: ToastController,
    private router: Router
  ) { }

  async verifyEmail() {
    try {
      const user = await this.dbService.getUserByEmail(this.email);
      
      if (user) {
        this.foundUser = user;
        this.showPasswordReset = true;
      } else {
        const toast = await this.toastController.create({
          message: 'No se encontró una cuenta con este correo',
          duration: 3000,
          position: 'middle',
          color: 'danger'
        });
        await toast.present();
      }
    } catch (error) {
      console.error('Error:', error);
      const toast = await this.toastController.create({
        message: 'Error al procesar la solicitud',
        duration: 3000,
        position: 'middle',
        color: 'danger'
      });
      await toast.present();
    }
  }

  async updatePassword() {
    if (this.newPassword !== this.confirmPassword) {
      const toast = await this.toastController.create({
        message: 'Las contraseñas no coinciden',
        duration: 3000,
        position: 'middle',
        color: 'danger'
      });
      await toast.present();
      return;
    }

    try {
      if (!this.foundUser || !this.foundUser.id) {
        throw new Error('Usuario no encontrado');
      }

      // Update user with new password
      await this.dbService.updateUser(this.foundUser.id, {
        ...this.foundUser,
        password: this.newPassword
      });

      const toast = await this.toastController.create({
        message: 'Contraseña actualizada exitosamente',
        duration: 3000,
        position: 'middle',
        color: 'success'
      });
      await toast.present();

      // Clear sensitive data
      this.email = '';
      this.newPassword = '';
      this.confirmPassword = '';
      this.foundUser = null;
      
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error al actualizar:', error);
      const toast = await this.toastController.create({
        message: 'Error al actualizar la contraseña',
        duration: 3000,
        position: 'middle',
        color: 'danger'
      });
      await toast.present();
    }
  }
}
