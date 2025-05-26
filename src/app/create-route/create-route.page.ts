import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { IonicModule, AlertController, ModalController } from '@ionic/angular';
import { DatabaseService } from '../services/database.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { OsmMapService } from '../services/osm-map.service';
import { FooterComponent } from '../components/footer/footer.component';
import { RutasGuardadasService } from '../services/rutas-guardadas.service';
import { HeaderComponent } from '../components/header/header.component';

@Component({
  selector: 'app-create-route',
  templateUrl: './create-route.page.html',
  styleUrls: ['./create-route.page.scss'],
  standalone: true,
  imports: [HeaderComponent,IonicModule, CommonModule, ReactiveFormsModule, FooterComponent]
})
export class CreateRoutePage implements OnInit {
  routeForm!: FormGroup;
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  startPlacePredictions: any[] = [];
  endPlacePredictions: any[] = [];
  isMapModalOpen = false;
  currentLocationType: 'start' | 'end' | null = null;
  isMapLoading = false;
  mapError = false;

  constructor(
    private fb: FormBuilder,
    private dbService: DatabaseService,
    private authService: AuthService,
    private router: Router,
    private alertController: AlertController,
    private osmMapService: OsmMapService,
    private modalController: ModalController,
    private rutasGuardadasService: RutasGuardadasService
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
      puntoInicioDireccion: ['', Validators.required],
      puntoInicioLat: [null, [Validators.required, Validators.min(-90), Validators.max(90)]],
      puntoInicioLng: [null, [Validators.required, Validators.min(-180), Validators.max(180)]],
      puntoTerminoDireccion: ['', Validators.required],
      puntoTerminoLat: [null, [Validators.required, Validators.min(-90), Validators.max(90)]],
      puntoTerminoLng: [null, [Validators.required, Validators.min(-180), Validators.max(180)]]
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
        // Mostrar un indicador de carga
        const loading = await this.alertController.create({
          message: 'Guardando ruta...',
          backdropDismiss: false
        });
        await loading.present();

        // Procesar la imagen
        const photoUrl = this.selectedFile ? 
          await this.convertFileToBase64(this.selectedFile) : 
          this.imagePreview;

        // Crear un objeto con categorías inferidas basadas en la descripción y nombre
        const descripcion = this.routeForm.value.descripcion.toLowerCase();
        const nombre = this.routeForm.value.nombre.toLowerCase();
        
        // Inferir tipo de terreno basado en la descripción y nombre
        let tipoTerreno = 'Variado';
        if (descripcion.includes('montaña') || descripcion.includes('cerro') || 
            nombre.includes('montaña') || nombre.includes('cerro')) {
          tipoTerreno = 'Montañoso';
        } else if (descripcion.includes('río') || descripcion.includes('agua') || 
                  nombre.includes('río') || nombre.includes('agua')) {
          tipoTerreno = 'Ribereño';
        } else if (descripcion.includes('lago') || descripcion.includes('laguna') || 
                  nombre.includes('lago') || nombre.includes('laguna')) {
          tipoTerreno = 'Lacustre';
        } else if (descripcion.includes('playa') || descripcion.includes('costa') || 
                  nombre.includes('playa') || nombre.includes('costa')) {
          tipoTerreno = 'Costero';
        } else if (descripcion.includes('bosque') || descripcion.includes('forestal') || 
                  nombre.includes('bosque')) {
          tipoTerreno = 'Boscoso';
        }

        // Crear el objeto de ruta con toda la información necesaria
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
          puntosDescanso: [],
          caracteristicas: {
            tipoTerreno: tipoTerreno,
            mejorEpoca: 'Todo el año',
            recomendaciones: 'Llevar agua y calzado adecuado'
          },
          puntosInteres: 'Ruta creada por usuario'
        };

        // Guardar la ruta en IndexedDB (mantener la funcionalidad existente)
        await this.dbService.addRoute(newRoute);
        
        // Guardar la ruta en Firebase en la colección 'creacion-de-rutas'
        await this.rutasGuardadasService.guardarRutaCreada(newRoute);
        console.log('Ruta guardada en ambas bases de datos correctamente');
        
        // Cerrar el indicador de carga
        await loading.dismiss();
        
        await this.showAlert('Éxito', 'Ruta creada correctamente');
        this.router.navigate(['/my-routes']);
      } catch (error) {
        console.error('Error creating route:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        await this.showAlert('Error', 'No se pudo crear la ruta: ' + errorMessage);
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

  async openMapModal(locationType: 'start' | 'end') {
    this.currentLocationType = locationType;
    this.isMapModalOpen = true;
    this.isMapLoading = true;
    this.mapError = false;
    
    // Get current coordinates or default to Santiago
    const lat = this.routeForm.get(`${locationType === 'start' ? 'puntoInicio' : 'puntoTermino'}Lat`)?.value || -33.4489;
    const lng = this.routeForm.get(`${locationType === 'start' ? 'puntoInicio' : 'puntoTermino'}Lng`)?.value || -70.6693;

    try {
      // Use setTimeout to ensure the modal is rendered before initializing the map
      setTimeout(async () => {
        await this.osmMapService.initMap('map', lat, lng);
        this.isMapLoading = false;
      }, 100);
    } catch (error) {
      console.error('Error al cargar el mapa:', error);
      this.mapError = true;
      this.isMapLoading = false;
      await this.showAlert(
        'Error al cargar el mapa',
        'No se pudo cargar el mapa. Por favor, verifica tu conexión a internet.'
      );
    }
  }

  async closeMapModal() {
    if (this.currentLocationType && !this.mapError) {
      try {
        const position = this.osmMapService.getCurrentMarkerPosition();
        const address = await this.osmMapService.getAddressFromCoordinates(position.lat, position.lng);
        
        const prefix = this.currentLocationType === 'start' ? 'puntoInicio' : 'puntoTermino';
        this.routeForm.patchValue({
          [`${prefix}Direccion`]: address,
          [`${prefix}Lat`]: position.lat,
          [`${prefix}Lng`]: position.lng
        });
      } catch (error) {
        console.error('Error al obtener la dirección:', error);
        await this.showAlert('Error', 'No se pudo obtener la dirección del punto seleccionado');
      }
    }
    
    this.isMapModalOpen = false;
    this.currentLocationType = null;
    this.mapError = false;
  }
}
