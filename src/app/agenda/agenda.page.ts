import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonItem, IonLabel, IonIcon, IonBackButton, IonButtons } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { FooterComponent } from '../components/footer/footer.component';
import { addIcons } from 'ionicons';
import { calendarOutline, timeOutline } from 'ionicons/icons';

// Interfaz para las rutas agendadas
interface RutaAgendada {
  id: string;
  nombre: string;
  ubicacion: string;
  dificultad: string;
  imagen: string;
  fechaProgramada: string;
  horaProgramada: string;
}

@Component({
  selector: 'app-agenda',
  templateUrl: './agenda.page.html',
  styleUrls: ['./agenda.page.scss'],
  standalone: true,
  imports: [IonButtons, IonBackButton, 
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar, 
    IonList, 
    IonItem, 
    IonLabel, 
    IonIcon,
    CommonModule, 
    FormsModule,
    FooterComponent
    
  ]
})
export class AgendaPage implements OnInit {
  // Array para almacenar las rutas agendadas
  rutasAgendadas: RutaAgendada[] = [];

  constructor(private router: Router) {
    // Añadir iconos necesarios
    addIcons({ calendarOutline, timeOutline });
  }

  ngOnInit() {
    // Aquí se cargarían las rutas agendadas desde un servicio o almacenamiento local
    // Por ahora, dejamos el array vacío para mostrar el mensaje de "No tienes rutas programadas"
    // En el futuro, se implementará la lógica para cargar las rutas guardadas
  }

  // Método para ver detalles de una ruta
  verDetallesRuta(ruta: RutaAgendada) {
    this.router.navigate(['/ruta-detalles'], {
      queryParams: {
        id: ruta.id,
        nombre: ruta.nombre,
        ubicacion: ruta.ubicacion,
        dificultad: ruta.dificultad,
        imagen: ruta.imagen
      }
    });
  }

  volver(){
    this.router.navigate(['/home']);
  }
}
