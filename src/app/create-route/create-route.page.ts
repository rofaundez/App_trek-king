import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { IonicModule, AlertController } from '@ionic/angular';
import { DatabaseService } from '../services/database.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-route',
  templateUrl: './create-route.page.html',
  styleUrls: ['./create-route.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule]
})
export class CreateRoutePage implements OnInit {
  routeForm!: FormGroup;
  selectedFile: File | null = null;
  imagePreview: string | null = null;

  constructor(
    private fb: FormBuilder,
    private dbService: DatabaseService,
    private authService: AuthService,
    private router: Router,
    private alertController: AlertController
  ) {
    this.initForm();
    this.imagePreview = 'assets/img/cerro_santa_lucia.jpg';
  }

  ngOnInit() {}

  private initForm() {
    this.routeForm = this.fb.group({
      nombre: ['Cerro Santa Lucía', [Validators.required, Validators.minLength(3)]],
      descripcion: ['Ruta turística por el histórico Cerro Santa Lucía, un parque urbano con vistas panorámicas de Santiago.', [Validators.required, Validators.minLength(10)]],
      localidad: ['Santiago de Chile, Santiago', Validators.required],
      dificultad: ['Fácil', Validators.required],
      puntoInicioDireccion: ['Av. Libertador Bernardo O\'Higgins 400, Santiago', Validators.required],
      puntoInicioLat: [-33.4400, [Validators.required, Validators.min(-90), Validators.max(90)]],
      puntoInicioLng: [-70.6444, [Validators.required, Validators.min(-180), Validators.max(180)]],
      puntoTerminoDireccion: ['Av. Libertador Bernardo O\'Higgins 400, Santiago', Validators.required],
      puntoTerminoLat: [-33.4400, [Validators.required, Validators.min(-90), Validators.max(90)]],
      puntoTerminoLng: [-70.6444, [Validators.required, Validators.min(-180), Validators.max(180)]]
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (file.type.match(/image\/*/) && file.size <= 5000000) {
        this.selectedFile = file;
        const reader = new FileReader();
        reader.onload = () => {
          this.imagePreview = reader.result as string;
        };
        reader.readAsDataURL(file);
      } else {
        this.showAlert('Error', 'Por favor selecciona una imagen válida (máximo 5MB)');
      }
    }
  }

  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }

  async onSubmit() {
    if (this.routeForm.valid) {
      const currentUser = this.authService.getCurrentUser();
      if (!currentUser) {
        await this.showAlert('Error', 'Debes iniciar sesión para crear una ruta');
        return;
      }

      try {
        const photoUrl = this.selectedFile ? 
          await this.convertFileToBase64(this.selectedFile) : 
          this.imagePreview;

        const newRoute = {
          ...this.routeForm.value,
          foto: photoUrl,
          creador: {
            id: currentUser.id,
            nombre: currentUser.nombre,
            email: currentUser.email
          },
          puntoInicio: {
            direccion: this.routeForm.value.puntoInicioDireccion,
            lat: this.routeForm.value.puntoInicioLat,
            lng: this.routeForm.value.puntoInicioLng
          },
          puntoTermino: {
            direccion: this.routeForm.value.puntoTerminoDireccion,
            lat: this.routeForm.value.puntoTerminoLat,
            lng: this.routeForm.value.puntoTerminoLng
          },
          fechaCreacion: new Date(),
          puntosDescanso: []
        };

        await this.dbService.addRoute(newRoute);
        await this.showAlert('Éxito', 'Ruta creada correctamente');
        this.router.navigate(['/my-routes']);
      } catch (error) {
        await this.showAlert('Error', 'No se pudo crear la ruta');
        console.error('Error creating route:', error);
      }
    } else {
      await this.showAlert('Error', 'Por favor completa todos los campos requeridos');
    }
  }

  private convertFileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }
}
