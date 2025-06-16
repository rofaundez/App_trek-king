import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';

@Component({
  selector: 'app-detalle-ruta-modal',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Detalles de la Ruta</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="cerrar()">
            <ion-icon name="close-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <div class="detalle-ruta-modal-content">
        <img *ngIf="ruta?.foto" [src]="ruta.foto" alt="Imagen de la ruta" class="detalle-ruta-img" />
        <h2>{{ruta?.nombre}}</h2>
        <p><strong>Descripción:</strong> {{ruta?.descripcion}}</p>
        <p><strong>Dificultad:</strong> {{ruta?.dificultad}}</p>
        <p><strong>Localidad:</strong> {{ruta?.localidad}}</p>
        <p *ngIf="ruta?.fechaCreacion"><strong>Fecha de creación:</strong> {{ruta.fechaCreacion | date:'medium'}}</p>
        <div *ngIf="ruta?.puntoInicio">
          <h4>Punto de Inicio</h4>
          <p><strong>Dirección:</strong> {{ruta.puntoInicio.direccion}}</p>
          <p><strong>Latitud:</strong> {{ruta.puntoInicio.lat}}</p>
          <p><strong>Longitud:</strong> {{ruta.puntoInicio.lng}}</p>
        </div>
        <div *ngIf="ruta?.puntoTermino">
          <h4>Punto de Término</h4>
          <p><strong>Dirección:</strong> {{ruta.puntoTermino.direccion}}</p>
          <p><strong>Latitud:</strong> {{ruta.puntoTermino.lat}}</p>
          <p><strong>Longitud:</strong> {{ruta.puntoTermino.lng}}</p>
        </div>
        <div *ngIf="ruta?.creador">
          <h4>Propuesta por</h4>
          <p><strong>Nombre:</strong> {{ruta.creador.nombre}}</p>
          <p><strong>Email:</strong> {{ruta.creador.email}}</p>
        </div>
        <div *ngIf="ruta?.caracteristicas">
          <h4>Características</h4>
          <p><strong>Tipo de terreno:</strong> {{ruta.caracteristicas.tipoTerreno}}</p>
          <p><strong>Mejor época:</strong> {{ruta.caracteristicas.mejorEpoca}}</p>
          <p><strong>Recomendaciones:</strong> {{ruta.caracteristicas.recomendaciones}}</p>
        </div>
        <div *ngIf="ruta?.puntosInteres && ruta.puntosInteres.length > 0">
          <h4>Puntos de Interés</h4>
          <div *ngFor="let punto of ruta.puntosInteres" class="punto-interes">
            <h5>{{punto.nombre || 'Punto de interés sin nombre'}}</h5>
            <p><strong>Descripción:</strong> {{punto.descripcion || 'Sin descripción'}}</p>
            <div *ngIf="punto.imagenes && punto.imagenes.length > 0" class="punto-imagenes">
              <img *ngFor="let img of punto.imagenes" [src]="img" alt="Imagen punto de interés" class="punto-img">
            </div>
          </div>
        </div>
      </div>
    </ion-content>
  `,
  styles: [`
    .detalle-ruta-modal-content {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }
    .detalle-ruta-img {
      width: 100%;
      max-width: 400px;
      border-radius: 12px;
      margin-bottom: 12px;
      object-fit: cover;
      box-shadow: 0 2px 8px rgba(0,0,0,0.12);
    }
    h2 {
      margin: 0 0 8px 0;
      font-size: 1.4rem;
      font-weight: 600;
    }
    h4 {
      margin: 12px 0 4px 0;
      font-size: 1.1rem;
      font-weight: 500;
    }
    h5 {
      margin: 8px 0 4px 0;
      font-size: 1rem;
      font-weight: 500;
      color: #3880ff;
    }
    p {
      margin: 0 0 4px 0;
      font-size: 1rem;
    }
    .punto-interes {
      background: #f5f5f5;
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 8px;
      width: 100%;
    }
    .punto-imagenes {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      padding: 8px 0;
    }
    .punto-img {
      width: 120px;
      height: 120px;
      object-fit: cover;
      border-radius: 8px;
    }
  `]
})
export class DetalleRutaModalComponent {
  @Input() ruta: any;
  constructor(private modalCtrl: ModalController) {}
  cerrar() {
    this.modalCtrl.dismiss();
  }
} 