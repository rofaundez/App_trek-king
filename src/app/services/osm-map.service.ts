import { Injectable } from '@angular/core';
import * as L from 'leaflet';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OsmMapService {
  private map!: L.Map;
  private marker!: L.Marker;
  private currentPosition = new BehaviorSubject<[number, number]>([-33.4489, -70.6693]); // Santiago by default

  constructor() {}

  async initMap(elementId: string, lat: number, lng: number): Promise<void> {
    this.map = L.map(elementId).setView([lat, lng], 13);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    // Add marker
    this.marker = L.marker([lat, lng], {
      draggable: true
    }).addTo(this.map);

    // Update marker position when dragged
    this.marker.on('dragend', () => {
      const position = this.marker.getLatLng();
      this.currentPosition.next([position.lat, position.lng]);
    });

    // Add click event to map
    this.map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      this.marker.setLatLng([lat, lng]);
      this.currentPosition.next([lat, lng]);
    });
  }

  getCurrentMarkerPosition(): { lat: number, lng: number } {
    const position = this.marker.getLatLng();
    return { lat: position.lat, lng: position.lng };
  }

  async getAddressFromCoordinates(lat: number, lng: number): Promise<string> {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await response.json();
      return data.display_name;
    } catch (error) {
      console.error('Error getting address:', error);
      return `${lat}, ${lng}`;
    }
  }
} 