import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonBackButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCardSubtitle, IonItem, IonLabel, IonChip, IonIcon, IonButton } from '@ionic/angular/standalone';
import { ActivatedRoute, Router } from '@angular/router';
import { FooterComponent } from '../components/footer/footer.component';

interface RutaInfo {
  descripcion: string;
  caracteristicas: {
    tipoTerreno: string;
    mejorEpoca: string;
    recomendaciones: string;
  };
  puntosInteres: string;
}

@Component({
  selector: 'app-ruta-detalles',
  templateUrl: './ruta-detalles.page.html',
  styleUrls: ['./ruta-detalles.page.scss'],
  standalone: true,
  imports: [
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar, 
    IonBackButton, 
    IonButtons, 
    IonCard, 
    IonCardContent, 
    IonCardHeader, 
    IonCardTitle, 
    IonCardSubtitle, 
    IonItem, 
    IonLabel, 
    IonChip,
    IonButton,
    CommonModule, 
    FormsModule,
    FooterComponent
  ]
})
export class RutaDetallesPage implements OnInit {
  rutaId: string = '';
  rutaNombre: string = '';
  rutaUbicacion: string = '';
  rutaDificultad: string = '';
  rutaImagen: string = '';
  
  // Información específica de la ruta
  rutaDescripcion: string = '';
  rutaCaracteristicas = {
    tipoTerreno: '',
    mejorEpoca: '',
    recomendaciones: ''
  };
  rutaPuntosInteres: string = '';
  
  // Base de datos de información de rutas
  private rutasInfo: {[key: string]: RutaInfo} = {
    'cerro_santa_lucia': {
      descripcion: 'El Cerro Santa Lucía es un pequeño cerro ubicado en el centro de Santiago. Con una altura de 69 metros sobre el nivel de la ciudad, ofrece una caminata corta pero gratificante con vistas panorámicas de la ciudad. El sendero está bien mantenido con escaleras y caminos pavimentados, ideal para principiantes y familias.',
      caracteristicas: {
        tipoTerreno: 'Urbano, con senderos pavimentados y escaleras',
        mejorEpoca: 'Todo el año, preferiblemente primavera',
        recomendaciones: 'Llevar agua, protector solar y calzado cómodo.'
      },
      puntosInteres: 'Terraza Neptuno, Castillo Hidalgo, Fuente Neptuno, Jardines y miradores con vistas panorámicas de Santiago.'
    },
    'cascada_san_juan': {
      descripcion: 'El sendero a la Cascada San Juan es una ruta de dificultad media que atraviesa el Parque Natural San Carlos de Apoquindo. El recorrido ofrece hermosos paisajes de la precordillera andina y culmina en una impresionante cascada. El sendero es variado, con tramos de bosque nativo y zonas rocosas.',
      caracteristicas: {
        tipoTerreno: 'Montañoso con senderos de tierra, algunas secciones rocosas y cruces de arroyos',
        mejorEpoca: 'Primavera y otoño. En invierno puede estar con nieve y en verano muy caluroso',
        recomendaciones: 'Llevar al menos 2 litros de agua, protector solar, sombrero, bastones de trekking y calzado adecuado para montaña.'
      },
      puntosInteres: 'Mirador del Valle, Bosque de Quillayes, Cascada San Juan, Flora y fauna nativa de la zona central de Chile.'
    },
    'salto_apoquindo': {
      descripcion: 'La ruta al Salto de Apoquindo es un desafiante sendero que recorre la quebrada de Apoquindo hasta llegar a una espectacular caída de agua. El recorrido es exigente, con un desnivel considerable y terreno técnico en algunos tramos. Recomendado para excursionistas con experiencia y buena condición física.',
      caracteristicas: {
        tipoTerreno: 'Montañoso con pendientes pronunciadas, terreno rocoso y varios cruces de río',
        mejorEpoca: 'Primavera tardía y otoño temprano. Evitar en invierno por crecidas del río',
        recomendaciones: 'Llevar mínimo 3 litros de agua, alimentos energéticos, ropa de abrigo, impermeable, botiquín básico y calzado de trekking con buen agarre.'
      },
      puntosInteres: 'Mirador de la Quebrada, Bosque Esclerófilo, Salto de Apoquindo, Formaciones geológicas de la cordillera.'
    },
    'lago_aculeo': {
      descripcion: 'La ruta alrededor de la Laguna de Aculeo ofrece un recorrido de dificultad media por los alrededores de este emblemático cuerpo de agua. Aunque actualmente la laguna está seca debido a la sequía, el paisaje sigue siendo impresionante, con vistas a los cerros circundantes y la cuenca del antiguo lago.',
      caracteristicas: {
        tipoTerreno: 'Mixto, con caminos de tierra, senderos rurales y algunas pendientes suaves',
        mejorEpoca: 'Otoño e invierno, cuando las temperaturas son más frescas',
        recomendaciones: 'Llevar suficiente agua, protección solar, sombrero, ropa ligera y calzado cómodo para caminatas largas.'
      },
      puntosInteres: 'Mirador de la Laguna, Cerro Cantillana, Haciendas históricas, Avistamiento de aves en temporada.'
    },
    'cerro_minillas': {
      descripcion: 'La travesía entre el Cerro Minillas y el Cerro Tarapacá es una de las rutas más desafiantes de la Región Metropolitana. Con casi 19 km de recorrido y un desnivel acumulado significativo, esta ruta ofrece vistas espectaculares de la cordillera y el valle de Santiago. Solo recomendada para excursionistas experimentados con excelente condición física.',
      caracteristicas: {
        tipoTerreno: 'Alta montaña con pendientes muy pronunciadas, tramos de roca suelta y exposición a precipicios',
        mejorEpoca: 'Verano y principios de otoño, cuando hay menos nieve en altura',
        recomendaciones: 'Llevar mínimo 4 litros de agua, alimentos energéticos, ropa técnica de montaña, protección para el sol y el viento, bastones, y equipo de primeros auxilios.'
      },
      puntosInteres: 'Cumbre del Cerro Minillas, Filo del Diablo, Cumbre del Cerro Tarapacá, Vistas panorámicas de Santiago y la Cordillera de los Andes.'
    }
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    // Obtenemos los parámetros de la ruta desde la URL
    this.route.queryParams.subscribe(params => {
      if (params) {
        this.rutaId = params['id'] || '';
        this.rutaNombre = params['nombre'] || '';
        this.rutaUbicacion = params['ubicacion'] || '';
        this.rutaDificultad = params['dificultad'] || '';
        this.rutaImagen = params['imagen'] || '';
        
        // Cargamos la información específica de la ruta seleccionada
        this.cargarInformacionRuta();
      }
    });
  }
  
  /**
   * Carga la información específica de la ruta seleccionada
   */
  cargarInformacionRuta() {
    if (this.rutaId && this.rutasInfo[this.rutaId]) {
      const infoRuta = this.rutasInfo[this.rutaId];
      this.rutaDescripcion = infoRuta.descripcion;
      this.rutaCaracteristicas = infoRuta.caracteristicas;
      this.rutaPuntosInteres = infoRuta.puntosInteres;
    } else {
      // Información por defecto si no se encuentra la ruta
      this.rutaDescripcion = 'No hay información disponible para esta ruta.';
      this.rutaCaracteristicas = {
        tipoTerreno: 'No especificado',
        mejorEpoca: 'No especificado',
        recomendaciones: 'No especificado'
      };
      this.rutaPuntosInteres = 'No hay puntos de interés registrados para esta ruta.';
    }
  }

  volver() {
    this.router.navigate(['/home']);
  }
}
