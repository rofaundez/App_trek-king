import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController, AlertController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';
import { DatabaseService } from '../../services/database.service';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { logOutOutline, trashOutline, saveOutline } from 'ionicons/icons';

@Component({
  selector: 'app-perfil-autoridad',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule
  ]
})
export class PerfilPage implements OnInit {
  autoridadActual: any;
  nombre: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  fotoPerfil: string = '';
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

  constructor(
    private authService: AuthService,
    private dbService: DatabaseService,
    private router: Router,
    private toastController: ToastController,
    private alertController: AlertController
  ) {
    addIcons({ logOutOutline, trashOutline, saveOutline });
  }

  ngOnInit() {
    this.autoridadActual = this.authService.getCurrentAutoridad();
    if (!this.autoridadActual) {
      this.router.navigate(['/autoridad-login']);
      return;
    }

    this.nombre = this.autoridadActual.nombre;
    this.email = this.autoridadActual.email;
    this.fotoPerfil = this.autoridadActual.fotoPerfil || '';
  }

  async actualizarPerfil() {
    try {
      // Validar contraseñas si se están cambiando
      if (this.password && this.password !== this.confirmPassword) {
        const toast = await this.toastController.create({
          message: 'Las contraseñas no coinciden',
          duration: 2000,
          position: 'middle',
          color: 'danger'
        });
        toast.present();
        return;
      }

      // Preparar datos actualizados
      const datosActualizados: { nombre: string; email: string; fotoPerfil: string; password?: string } = {
        nombre: this.nombre,
        email: this.email,
        fotoPerfil: this.fotoPerfil
      };

      // Si hay nueva contraseña, incluirla
      if (this.password) {
        datosActualizados.password = this.password;
      }

      // Actualizar en la base de datos
      await this.dbService.updateAutoridad(this.autoridadActual.id, datosActualizados);

      // Actualizar en el servicio de autenticación
      this.autoridadActual = { ...this.autoridadActual, ...datosActualizados };
      this.authService.updateCurrentAutoridad(this.autoridadActual);

      const toast = await this.toastController.create({
        message: 'Perfil actualizado exitosamente',
        duration: 2000,
        position: 'middle',
        color: 'success'
      });
      toast.present();

    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      const toast = await this.toastController.create({
        message: 'Error al actualizar perfil',
        duration: 2000,
        position: 'middle',
        color: 'danger'
      });
      toast.present();
    }
  }

  async confirmarEliminarCuenta() {
    const alert = await this.alertController.create({
      header: 'Eliminar cuenta',
      message: '¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          handler: () => this.eliminarCuenta()
        }
      ]
    });

    await alert.present();
  }

  async eliminarCuenta() {
    try {
      await this.dbService.deleteAutoridad(this.autoridadActual.id);
      await this.authService.logoutAutoridad();
      this.router.navigate(['/autoridad-login']);
    } catch (error) {
      console.error('Error al eliminar cuenta:', error);
      const toast = await this.toastController.create({
        message: 'Error al eliminar cuenta',
        duration: 2000,
        position: 'middle',
        color: 'danger'
      });
      toast.present();
    }
  }

  logout() {
    this.authService.logoutAutoridad();
    this.router.navigate(['/autoridad-login']);
  }

  togglePasswordVisibility(field: 'password' | 'confirmPassword') {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }
}