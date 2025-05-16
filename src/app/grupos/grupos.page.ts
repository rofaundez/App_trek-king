import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonSearchbar, IonButton, IonList, IonItem, 
         IonAvatar, IonIcon, IonFab, IonFabButton, IonLabel, IonBackButton, IonButtons } from '@ionic/angular/standalone';

interface Grupo {
  id: string;
  titulo: string;
  descripcion: string;
  creador: string;
  fecha: string;
  rutaImagen: string;
  categorias: string[];
}

@Component({
  selector: 'app-grupos',
  templateUrl: './grupos.page.html',
  styleUrls: ['./grupos.page.scss'],
  standalone: true,
  imports: [IonButtons, IonBackButton, 
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar, 
    IonButton, 
    IonButtons, 
    IonList, 
    IonItem, 
    IonIcon, 
    IonFab, 
    IonFabButton,
    CommonModule, 
    FormsModule
  ]
})
export class GruposPage implements OnInit {
  userPhoto: string = 'assets/img/default-avatar.png';
  filtroActivo: string = 'Todos';
  gruposDisponibles: Grupo[] = [];
  gruposFiltrados: Grupo[] = [];
  isDragging: boolean = false;
  startX: number = 0;
  scrollLeft: number = 0;

  constructor(private router: Router) { }

  ngOnInit() {
    // Aquí se cargarían los datos de grupos desde un servicio
    this.cargarGruposDePrueba();
  }

  cargarGruposDePrueba() {
    // Datos de ejemplo para mostrar en la interfaz
    this.gruposDisponibles = [
      {
        id: '1',
        titulo: 'Excursión al Volcán Osorno',
        descripcion: 'Buscamos 3 personas para hacer trekking al Volcán Osorno este fin de semana',
        creador: 'Carlos Mendoza',
        fecha: '15/06/2023',
        rutaImagen: 'assets/img/default.jpg',
        categorias: ['Montañas', 'Nieve']
      },
      {
        id: '2',
        titulo: 'Ruta por la costa de Valparaíso',
        descripcion: 'Grupo para recorrer los senderos costeros de Valparaíso',
        creador: 'Ana Martínez',
        fecha: '22/06/2023',
        rutaImagen: 'assets/img/default.jpg',
        categorias: ['Playas', 'Lagos']
      }
    ];
    
    this.gruposFiltrados = [...this.gruposDisponibles];
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }

  onSearch(event: any) {
    const query = event.target.value.toLowerCase();
    if (query) {
      this.gruposFiltrados = this.gruposDisponibles.filter(grupo => 
        grupo.titulo.toLowerCase().includes(query) || 
        grupo.descripcion.toLowerCase().includes(query)
      );
    } else {
      this.gruposFiltrados = [...this.gruposDisponibles];
    }
  }

  filtrarPorCategoria(categoria: string) {
    this.filtroActivo = categoria;
    
    if (categoria === 'Todos') {
      this.gruposFiltrados = [...this.gruposDisponibles];
    } else {
      this.gruposFiltrados = this.gruposDisponibles.filter(grupo => 
        grupo.categorias.includes(categoria)
      );
    }
  }

  verDetallesGrupo(id: string) {
    // Navegar a la página de detalles del grupo
    console.log('Ver detalles del grupo:', id);
    // this.router.navigate(['/grupo-detalles', id]);
  }

  // Funciones para el scroll horizontal con arrastre
  isMouseDown(event: MouseEvent) {
    const slider = event.currentTarget as HTMLElement;
    this.isDragging = true;
    this.startX = event.pageX - slider.offsetLeft;
    this.scrollLeft = slider.scrollLeft;
  }

  onMouseMove(event: MouseEvent) {
    if (!this.isDragging) return;
    const slider = event.currentTarget as HTMLElement;
    const x = event.pageX - slider.offsetLeft;
    const walk = (x - this.startX) * 2; // Velocidad de scroll
    slider.scrollLeft = this.scrollLeft - walk;
  }

  isMouseUp(event: MouseEvent) {
    this.isDragging = false;
  }

  volver() {
    this.router.navigate(['/home']);
  }
}
