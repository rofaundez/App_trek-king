import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-detalle-ruta',
  templateUrl: './detalle-ruta.page.html',
  styleUrls: ['./detalle-ruta.page.scss'],
  standalone: true,
  imports: [IonContent, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class DetalleRutaPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
