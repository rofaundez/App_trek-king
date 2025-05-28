import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { eyeOutline, eyeOffOutline } from 'ionicons/icons';
import { Router } from '@angular/router';
import { DatabaseService } from '../services/database.service';
import { HeaderComponent } from '../components/header/header.component';

@Component({
  selector: 'app-recover',
  templateUrl: './recover.page.html',
  styleUrls: ['./recover.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class RecoverPage {
  email: string = '';
  showPasswordReset: boolean = false;
  foundUser: any = null;
  userPassword: string = '';
  showPassword: boolean = false;

  constructor(
    private dbService: DatabaseService,
    private toastController: ToastController,
    private router: Router
  ) { 
    addIcons({ eyeOutline, eyeOffOutline });
  }

  // Add this new method
  ionViewWillEnter() {
    this.email = '';
    this.showPasswordReset = false;
    this.foundUser = null;
    this.userPassword = '';
    this.showPassword = false;
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  goToLogin() {
    this.router.navigate(['/login']); 
  }

  async verifyEmail() {
    try {
      const user = await this.dbService.getUserByEmail(this.email);
      
      if (user) {
        this.foundUser = user;
        this.userPassword = user.password;
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
}
