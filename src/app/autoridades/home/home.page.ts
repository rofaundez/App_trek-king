import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonItem, IonLabel, IonButton, IonIcon, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonBadge, IonButtons, IonMenuButton, IonAvatar, IonInput, IonSearchbar } from '@ionic/angular/standalone';
import { AuthService } from '../../services/auth.service';
import { RutasGuardadasService, RutaAgendada } from '../../services/rutas-guardadas.service';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { trashOutline, createOutline, eyeOutline, personAddOutline, personCircleOutline, logOutOutline, closeOutline, calendarOutline, todayOutline, calendarNumberOutline, infiniteOutline, mapOutline, timeOutline, informationCircleOutline, warningOutline, mailOutline, personOutline, locationOutline, checkmarkCircleOutline, hourglassOutline, alertCircleOutline, closeCircleOutline, downloadOutline } from 'ionicons/icons';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { DatePipe } from '@angular/common';
import { AlertController } from '@ionic/angular/standalone';
import { collection, query, orderBy, getDocs, getDoc, doc } from '@angular/fire/firestore';
import { Firestore } from '@angular/fire/firestore';
import { updateDoc } from '@angular/fire/firestore';
import { TimeAgoPipe } from '../pipes/time-ago.pipe';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ModalController } from '@ionic/angular';
import { DetalleRutaModalComponent } from '../../components/detalle-ruta-modal/detalle-ruta-modal.component';
import { DatabaseService } from 'src/app/services/database.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonList, 
    IonItem,
    IonLabel,
    IonButton, 
    IonIcon,
    IonBadge,
    IonAvatar,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonButtons,
    IonMenuButton,
    IonInput,
    IonSearchbar,
    CommonModule, 
    FormsModule,
    DatePipe,
    TimeAgoPipe,
    DetalleRutaModalComponent
  ]
})
export class HomePage implements OnInit {
  rutas: RutaAgendada[] = [];
  rutasFiltradas: RutaAgendada[] = [];
  autoridadActual: any;
  searchTerm: string = '';
  sugerencias: string[] = [];
  filtroActivo: string = 'Todas';
  isDragging: boolean = false;
  startX: number = 0;
  scrollLeft: number = 0;
  vistaActiva: 'rutas' | 'alertas' | 'peticiones' = 'rutas';
  alertas: any[] = [];
  rutasSolicitadas: any[] = [];
  loading = false;
  mostrarCampoDescarga: boolean = false;
  cantidadAlertasDescarga: number = 5;

  constructor(
    private authService: AuthService,
    private dbService: DatabaseService,
    private rutasGuardadasService: RutasGuardadasService,
    private router: Router,
    private alertController: AlertController,
    private firestore: Firestore,
    private modalController: ModalController
  ) {
    addIcons({personAddOutline,logOutOutline,mapOutline,warningOutline,mailOutline,closeOutline,todayOutline,calendarOutline,calendarNumberOutline,infiniteOutline,informationCircleOutline,timeOutline,personOutline,downloadOutline,locationOutline,checkmarkCircleOutline,hourglassOutline,alertCircleOutline,closeCircleOutline,trashOutline,createOutline,eyeOutline,personCircleOutline});
  }

  async ngOnInit() {
    await this.dbService.dbReady;
    // Verificar si hay una autoridad autenticada
    this.autoridadActual = this.authService.getCurrentAutoridad();
    if (!this.autoridadActual) {
      console.log('No hay autoridad autenticada, redirigiendo a login');
      this.router.navigate(['/autoridad-login']);
      return;
    }

    console.log('Autoridad autenticada encontrada:', this.autoridadActual.nombre);

    // Cargar las rutas
    this.cargarRutas();
    this.cargarDatosVista();
  }

  async cargarRutas() {
    try {
      // Cargar todas las rutas agendadas de todos los usuarios
      this.rutas = await this.rutasGuardadasService.obtenerTodasLasRutasAgendadas();
      
      // Convertir fechaProgramada a Date para filtros y obtener información de usuarios
      for (const ruta of this.rutas) {
        // Convertir la fecha programada a objeto Date
        if (ruta.fechaProgramada && !ruta.fechaAgendada) {
          try {
            // Intentar diferentes formatos de fecha
            if (ruta.fechaProgramada.includes(' de ')) {
              // Formato: "día de mes de año"
              const fechaPartes = ruta.fechaProgramada.split(' de ');
              if (fechaPartes.length >= 3) {
                const dia = parseInt(fechaPartes[0]);
                const mes = this.obtenerNumeroMes(fechaPartes[1]);
                const año = parseInt(fechaPartes[2]);
                if (!isNaN(dia) && !isNaN(año)) {
                  ruta.fechaAgendada = new Date(año, mes, dia);
                } else {
                  ruta.fechaAgendada = new Date();
                }
              } else {
                ruta.fechaAgendada = new Date();
              }
            } else if (ruta.fechaProgramada.includes('/')) {
              // Formato: "dd/mm/yyyy"
              const [dia, mes, año] = ruta.fechaProgramada.split('/').map(Number);
              ruta.fechaAgendada = new Date(año, mes - 1, dia);
            } else if (ruta.fechaProgramada.includes('-')) {
              // Formato: "yyyy-mm-dd"
              ruta.fechaAgendada = new Date(ruta.fechaProgramada);
            } else {
              // Si no se reconoce el formato, usar fecha actual
              console.warn(`Formato de fecha no reconocido: ${ruta.fechaProgramada}`)
              ruta.fechaAgendada = new Date();
            }
            
            // Verificar si la fecha es válida
            if (isNaN(ruta.fechaAgendada.getTime())) {
              console.warn(`Fecha inválida generada para: ${ruta.fechaProgramada}`);
              ruta.fechaAgendada = new Date();
            }
          } catch (error) {
            console.error(`Error al parsear la fecha: ${ruta.fechaProgramada}`, error);
            ruta.fechaAgendada = new Date();
          }
        }
        
        // Obtener información del usuario que agendó la ruta
        if (ruta.userId) {
          try {
            // Consultar directamente en Firebase usando el userId
            const usersRef = collection(this.firestore, 'users');
            const userDoc = doc(usersRef, ruta.userId);
            const userSnap = await getDoc(userDoc);
            
            if (userSnap.exists()) {
              const userData = userSnap.data();
              const nombre = userData['nombre'] || '';
              const apellido = userData['apellido'] || '';
              
              // Asignar el nombre completo o usar alternativas si no está disponible
              if (nombre || apellido) {
                ruta.nombreUsuario = `${nombre} ${apellido}`.trim();
                console.log(`Nombre de usuario obtenido para ${ruta.userId}: ${ruta.nombreUsuario}`);
              } else if (userData['email']) {
                ruta.nombreUsuario = userData['email'];
                console.log(`Email de usuario obtenido para ${ruta.userId}: ${ruta.nombreUsuario}`);
              }
            } else {
              console.warn(`Usuario con ID ${ruta.userId} no encontrado en Firebase`);
              ruta.nombreUsuario = 'Usuario no encontrado';
            }
          } catch (error) {
            console.error(`Error al obtener información del usuario ${ruta.userId}:`, error);
            ruta.nombreUsuario = 'Error al obtener datos';
          }
        }
      }

      // Inicializar rutas filtradas con todas las rutas
      this.rutasFiltradas = [...this.rutas];
      
      // Aplicar filtro activo si hay uno seleccionado
      if (this.filtroActivo !== 'Todas') {
        this.aplicarFiltroActivo();
      }
    } catch (error) {
      console.error('Error al cargar rutas agendadas:', error);
    }
  }

  private obtenerNumeroMes(nombreMes: string): number {
    const meses = {
      'enero': 0, 'febrero': 1, 'marzo': 2, 'abril': 3,
      'mayo': 4, 'junio': 5, 'julio': 6, 'agosto': 7,
      'septiembre': 8, 'octubre': 9, 'noviembre': 10, 'diciembre': 11
    };
    
    // Normalizar el nombre del mes (quitar acentos, convertir a minúsculas)
    const nombreNormalizado = nombreMes.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    
    // Buscar coincidencia exacta o parcial
    for (const [mes, numero] of Object.entries(meses)) {
      if (nombreNormalizado === mes || nombreNormalizado.includes(mes) || mes.includes(nombreNormalizado)) {
        return numero;
      }
    }
    
    console.warn(`Mes no reconocido: ${nombreMes}, usando enero como valor predeterminado`);
    return 0; // Enero como valor predeterminado
  }

  getDificultadColor(dificultad: string): string {
    switch (dificultad?.toLowerCase()) {
      case 'fácil':
      case 'facil':
        return 'success';
      case 'media':
      case 'moderado':
        return 'warning';
      case 'difícil':
      case 'dificil':
        return 'danger';
      default:
        return 'medium';
    }
  }

  puedeCrearAutoridades(): boolean {
    const rangosPermitidos = ['jefe'];
    return rangosPermitidos.includes(this.autoridadActual?.cargo?.toLowerCase());
  }

  verPerfil() {
    this.router.navigate(['/autoridad-perfil']);
  }

  verRuta(ruta: RutaAgendada) {
    // Navegar a los detalles de la ruta agendada
    this.router.navigate(['/ruta-detalles'], {
      queryParams: {
        id: ruta.rutaId,
        nombre: ruta.nombre,
        ubicacion: ruta.ubicacion,
        dificultad: ruta.dificultad,
        imagen: ruta.imagen,
        descripcion: ruta.descripcion,
        caracteristicas: JSON.stringify(ruta.caracteristicas),
        puntosInteres: ruta.puntosInteres
      }
    });
  }

  editarRuta(ruta: RutaAgendada) {
    // Las autoridades no pueden editar rutas agendadas por usuarios
    console.log('Las autoridades no pueden editar rutas agendadas por usuarios');
  }

  async eliminarRuta(ruta: RutaAgendada) {
    // Las autoridades no pueden eliminar rutas agendadas por usuarios
    console.log('Las autoridades no pueden eliminar rutas agendadas por usuarios');
  }

  async verDetallesRuta(ruta: RutaAgendada) {
    // Mostrar un alert con los detalles de la ruta
    const { AlertController } = await import('@ionic/angular/standalone');
    const alertController = new AlertController();
    
    let usuarioInfo = 'Nombre no disponible';
    if (ruta['nombreUsuario'] && !ruta['nombreUsuario'].startsWith('Usuario ')) {
      // Solo usar nombreUsuario si no es un ID formateado (que comienza con 'Usuario ')
      usuarioInfo = ruta['nombreUsuario'];
    }
    
    const alert = await alertController.create({
      header: 'Detalles de la Ruta Agendada',
      subHeader: ruta.nombre,
      message: `
        <p><strong>Ubicación:</strong> ${ruta.ubicacion}</p>
        <p><strong>Dificultad:</strong> ${ruta.dificultad}</p>
        <p><strong>Fecha:</strong> ${ruta.fechaProgramada}</p>
        <p><strong>Hora:</strong> ${ruta.horaProgramada}</p>
        <p><strong>Usuario:</strong> ${usuarioInfo}</p>
        ${ruta.descripcion ? `<p><strong>Descripción:</strong> ${ruta.descripcion}</p>` : ''}
      `,
      buttons: ['Cerrar'],
      cssClass: 'alert-detalles-ruta',
      htmlAttributes: {
        'data-allow-html': 'true'
      }
    });

    
    await alert.present();
  }

  crearAutoridad() {
    this.router.navigate(['/autoridad-registro']);
  }

  logout() {
    this.authService.logoutAutoridad();
    this.router.navigate(['/autoridad-login']);
  }

  // Funciones para la barra de búsqueda
  onSearch(event: any) {
    const valor = this.searchTerm.toLowerCase();
    if (valor.length > 0) {
      // Generar sugerencias basadas en nombres de rutas
      this.sugerencias = this.rutas
        .map(ruta => ruta.nombre)
        .filter(nombre => nombre.toLowerCase().includes(valor));
      
      // Filtrar rutas por término de búsqueda
      this.rutasFiltradas = this.rutas.filter(ruta => 
        ruta.nombre.toLowerCase().includes(valor) ||
        (ruta.ubicacion && ruta.ubicacion.toLowerCase().includes(valor)) ||
        (ruta.descripcion && ruta.descripcion.toLowerCase().includes(valor))
      );
    } else {
      this.sugerencias = [];
      this.rutasFiltradas = [...this.rutas];
      this.aplicarFiltroActivo();
    }
  }

  seleccionarSugerencia(sugerencia: string) {
    this.searchTerm = sugerencia;
    this.sugerencias = [];
    this.onSearch(null);
  }

  // Funciones para filtros de fecha
  filtrarPorFecha(filtro: string) {
    this.filtroActivo = filtro;
    this.aplicarFiltroActivo();
  }

  aplicarFiltroActivo() {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    const inicioSemana = new Date(hoy);
    inicioSemana.setDate(hoy.getDate() - hoy.getDay()); // Domingo como inicio de semana
    
    const finSemana = new Date(inicioSemana);
    finSemana.setDate(inicioSemana.getDate() + 6); // Sábado como fin de semana
    finSemana.setHours(23, 59, 59, 999); // Final del día
    
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const finMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
    finMes.setHours(23, 59, 59, 999); // Final del día

    // Si hay un término de búsqueda, aplicamos el filtro sobre las rutas ya filtradas por búsqueda
    let rutasBase = this.searchTerm ? this.rutasFiltradas : this.rutas;

    switch (this.filtroActivo) {
      case 'Hoy':
        this.rutasFiltradas = rutasBase.filter(ruta => {
          if (!ruta.fechaAgendada) return false;
          
          // Asegurarse de que fechaAgendada es un objeto Date
          const fechaRuta = new Date(ruta.fechaAgendada);
          if (isNaN(fechaRuta.getTime())) return false;
          
          fechaRuta.setHours(0, 0, 0, 0);
          return fechaRuta.getTime() === hoy.getTime();
        });
        break;
      case 'Esta Semana':
      case 'Semana':
        this.rutasFiltradas = rutasBase.filter(ruta => {
          if (!ruta.fechaAgendada) return false;
          
          // Asegurarse de que fechaAgendada es un objeto Date
          const fechaRuta = new Date(ruta.fechaAgendada);
          if (isNaN(fechaRuta.getTime())) return false;
          
          return fechaRuta >= inicioSemana && fechaRuta <= finSemana;
        });
        break;
      case 'Este Mes':
      case 'Mes':
        this.rutasFiltradas = rutasBase.filter(ruta => {
          if (!ruta.fechaAgendada) return false;
          
          // Asegurarse de que fechaAgendada es un objeto Date
          const fechaRuta = new Date(ruta.fechaAgendada);
          if (isNaN(fechaRuta.getTime())) return false;
          
          return fechaRuta >= inicioMes && fechaRuta <= finMes;
        });
        break;
      case 'Todas':
      default:
        if (!this.searchTerm) {
          this.rutasFiltradas = [...this.rutas];
        }
        break;
    }
    
    // Ordenar rutas por fecha (las más próximas primero)
    this.rutasFiltradas.sort((a, b) => {
      // Si no hay fechaAgendada, mover al final
      if (!a.fechaAgendada) return 1;
      if (!b.fechaAgendada) return -1;
      
      // Convertir a objetos Date si no lo son
      const fechaA = a.fechaAgendada instanceof Date ? a.fechaAgendada : new Date(a.fechaAgendada);
      const fechaB = b.fechaAgendada instanceof Date ? b.fechaAgendada : new Date(b.fechaAgendada);
      
      // Verificar si las fechas son válidas
      if (isNaN(fechaA.getTime())) return 1;
      if (isNaN(fechaB.getTime())) return -1;
      
      // Ordenar por fecha (las más próximas primero)
      return fechaA.getTime() - fechaB.getTime();
    });
  }

  // Funciones para el scroll horizontal de filtros
  isMouseDown(event: MouseEvent) {
    this.isDragging = true;
    const slider = event.currentTarget as HTMLElement;
    this.startX = event.pageX - slider.offsetLeft;
    this.scrollLeft = slider.scrollLeft;
  }

  onMouseMove(event: MouseEvent) {
    if (!this.isDragging) return;
    event.preventDefault();
    const slider = event.currentTarget as HTMLElement;
    const x = event.pageX - slider.offsetLeft;
    const walk = (x - this.startX) * 2; // Velocidad de scroll
    slider.scrollLeft = this.scrollLeft - walk;
  }

  isMouseUp(event: MouseEvent) {
    this.isDragging = false;
  }

  cambiarVista(vista: 'rutas' | 'alertas' | 'peticiones') {
    this.vistaActiva = vista;
    this.cargarDatosVista();
  }

  async cargarDatosVista() {
    this.loading = true;
    try {
      switch (this.vistaActiva) {
        case 'alertas':
          await this.cargarAlertas();
          break;
        case 'peticiones':
          await this.cargarRutasSolicitadas();
          break;
        case 'rutas':
        default:
          // No se necesita cargar datos adicionales para la vista de rutas
          break;
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
      this.mostrarError('Error al cargar los datos');
    } finally {
      this.loading = false;
    }
  }

  async cargarAlertas() {
    const alertasRef = collection(this.firestore, 'alertas');
    const q = query(alertasRef, orderBy('fecha', 'desc'));
    
    const snapshot = await getDocs(q);
    this.alertas = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }

  async cargarRutasSolicitadas() {
    const rutasRef = collection(this.firestore, 'creacion-de-rutas');
    const q = query(rutasRef, orderBy('fechaCreacion', 'desc'));
    
    const snapshot = await getDocs(q);
    this.rutasSolicitadas = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }

  getEstadoAlertaClass(estado: string): string {
    switch (estado.toLowerCase()) {
      case 'solucionado':
        return 'estado-solucionado';
      case 'en proceso':
        return 'estado-proceso';
      case 'pendiente':
        return 'estado-pendiente';
      default:
        return '';
    }
  }

  async actualizarEstadoAlerta(alertaId: string, nuevoEstado: string) {
    try {
      const alertaRef = doc(this.firestore, 'alertas', alertaId);
      await updateDoc(alertaRef, {
        estado: nuevoEstado,
        fechaActualizacion: new Date()
      });
      await this.cargarAlertas();
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      this.mostrarError('Error al actualizar el estado de la alerta');
    }
  }

  async aprobarRuta(rutaId: string) {
    try {
      const rutaRef = doc(this.firestore, 'creacion-de-rutas', rutaId);
      await updateDoc(rutaRef, {
        estado: 'aprobada',
        fechaAprobacion: new Date()
      });
      await this.cargarRutasSolicitadas();
    } catch (error) {
      console.error('Error al aprobar ruta:', error);
      this.mostrarError('Error al aprobar la ruta');
    }
  }

  async rechazarRuta(rutaId: string) {
    try {
      const rutaRef = doc(this.firestore, 'creacion-de-rutas', rutaId);
      await updateDoc(rutaRef, {
        estado: 'rechazada',
        fechaRechazo: new Date()
      });
      await this.cargarRutasSolicitadas();
    } catch (error) {
      console.error('Error al rechazar ruta:', error);
      this.mostrarError('Error al rechazar la ruta');
    }
  }

  private async mostrarError(mensaje: string) {
    const alert = await this.alertController.create({
      header: 'Error',
      message: mensaje,
      buttons: ['OK']
    });
    await alert.present();
  }

  descargarUltimasAlertas() {
    // Determinar la cantidad de alertas a descargar
    let cantidad = Number(this.cantidadAlertasDescarga) || 5;
    if (cantidad > this.alertas.length) {
      cantidad = this.alertas.length;
    }
    if (cantidad < 1) {
      cantidad = 5;
    }
    const ultimas = this.alertas.slice(0, cantidad);
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Reporte de las últimas ${cantidad} alertas SOS`, 14, 18);
    const rows = ultimas.map(alerta => [
      alerta.nombreUsuario || 'Desconocido',
      alerta.rutUsuario || '',
      alerta.descripcion || '',
      alerta.ubicacion?.lat ?? '',
      alerta.ubicacion?.lng ?? ''
    ]);
    autoTable(doc, {
      head: [['Nombre','Rut del Usuario', 'Tipo de emergencia', 'Latitud', 'Longitud']],
      body: rows,
      startY: 24,
    });
    doc.save('ultimas_alertas.pdf');
    this.mostrarCampoDescarga = false;
  }

  async abrirModalDetallesRuta(ruta: any) {
    const modal = await this.modalController.create({
      component: DetalleRutaModalComponent,
      componentProps: { ruta }
    });
    await modal.present();
  }
}
