import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, query, orderBy, getDocs, doc, updateDoc } from '@angular/fire/firestore';
import { AuthService } from './auth.service';

export interface Ubicacion {
  lat: number;
  lng: number;
}

export interface Alerta {
  id?: string;
  userId: string;
  nombreUsuario: string;
  fotoUsuario?: string;
  titulo: string;
  descripcion: string;
  ubicacion: Ubicacion;
  fecha: Date;
  estado: 'pendiente' | 'en proceso' | 'solucionado';
  instrucciones?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AlertasService {
  constructor(
    private firestore: Firestore,
    private authService: AuthService
  ) {}

  async crearAlerta(alerta: Omit<Alerta, 'id'>): Promise<string> {
    try {
      const alertasRef = collection(this.firestore, 'alertas');
      const docRef = await addDoc(alertasRef, alerta);
      return docRef.id;
    } catch (error) {
      console.error('Error al crear la alerta:', error);
      throw error;
    }
  }

  async obtenerAlertas() {
    const alertasRef = collection(this.firestore, 'alertas');
    const q = query(alertasRef, orderBy('fecha', 'desc'));
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }

  async actualizarEstadoAlerta(alertaId: string, nuevoEstado: Alerta['estado']) {
    try {
      const alertaRef = doc(this.firestore, 'alertas', alertaId);
      await updateDoc(alertaRef, {
        estado: nuevoEstado,
        fechaActualizacion: new Date()
      });
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      throw error;
    }
  }
} 