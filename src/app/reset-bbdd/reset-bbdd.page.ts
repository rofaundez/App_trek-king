import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController } from '@ionic/angular';
import { DatabaseService } from '../services/database.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reset-bbdd',
  templateUrl: './reset-bbdd.page.html',
  styleUrls: ['./reset-bbdd.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class ResetBbddPage implements OnInit {

  constructor(
    private databaseService: DatabaseService,
    private alertController: AlertController,
    private router: Router
  ) { }

  ngOnInit() {}

  async resetDatabase() {
    const alert = await this.alertController.create({
      header: 'Confirmar Reinicio',
      message: '¿Estás seguro de que deseas reiniciar la base de datos? Esta acción no se puede deshacer.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Reiniciar',
          role: 'destructive',
          handler: async () => {
            try {
              await this.databaseService.clearDatabase();
              
              // Crear usuario por defecto
              const defaultUser = {
                email: 'default@default.com',
                nombre: 'Default',
                apellido: 'User',
                password: '12344321',
                role: 'user',
                rut: "20886551-K"
              };
              await this.databaseService.addUser(defaultUser);

              // Crear autoridad por defecto
              const defaultAuthority = {
                email: 'default@autoridad.com',
                nombre: 'Default',
                institucion: 'Institución por Defecto',
                cargo: 'Jefe',
                password: '12344321',
                role: 'authority'
              };
              await this.databaseService.addAutoridad(defaultAuthority);

              await this.showSuccessAlert();
              this.router.navigate(['/home']);
            } catch (error) {
              this.showErrorAlert();
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async clearDatabase() {
    const alert = await this.alertController.create({
      header: 'Confirmar Borrado',
      message: '¿Estás seguro de que deseas borrar toda la base de datos? Esta acción no se puede deshacer.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Borrar',
          role: 'destructive',
          handler: async () => {
            try {
              await this.databaseService.clearDatabase();
              const successAlert = await this.alertController.create({
                header: 'Éxito',
                message: 'La base de datos ha sido borrada correctamente.',
                buttons: ['OK']
              });
              await successAlert.present();
            } catch (error) {
              const errorAlert = await this.alertController.create({
                header: 'Error',
                message: 'No se pudo borrar la base de datos.',
                buttons: ['OK']
              });
              await errorAlert.present();
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async addDefaultAccounts() {
    try {
      // Crear usuario por defecto
      const defaultUser = {
        email: 'default@default.com',
        nombre: 'Default',
        apellido: 'User',
        password: '1234',
        role: 'user',
        rut: "20886551-K"
      };
      await this.databaseService.addUser(defaultUser);

      // Crear autoridad por defecto
      const defaultAuthority = {
        email: 'default@autoridad.com',
        nombre: 'Default',
        institucion: 'Institución por Defecto',
        cargo: 'Jefe',
        password: '1234',
        role: 'authority'
      };
      await this.databaseService.addAutoridad(defaultAuthority);

      await this.showSuccessAlert();
      this.router.navigate(['/home']);
    } catch (error) {
      this.showErrorAlert();
    }
  }

  private async showSuccessAlert() {
    const alert = await this.alertController.create({
      header: 'Éxito',
      message: 'La base de datos ha sido reiniciada correctamente. Se han creado las cuentas por defecto.',
      buttons: ['OK']
    });
    await alert.present();
  }

  private async showErrorAlert() {
    const alert = await this.alertController.create({
      header: 'Error',
      message: 'No se pudo reiniciar la base de datos.',
      buttons: ['OK']
    });
    await alert.present();
  }
}
