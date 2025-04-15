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

  private async showSuccessAlert() {
    const alert = await this.alertController.create({
      header: 'Éxito',
      message: 'La base de datos ha sido reiniciada correctamente.',
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
