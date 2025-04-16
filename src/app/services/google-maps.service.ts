import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

@Injectable({
  providedIn: 'root'
})
export class GoogleMapsService {
  private geocoder: any;
  private autocompleteService: any;
  private placesService: any;
  private map: any;
  private marker: any;
  private apiLoaded = false;
  private loadPromise: Promise<void>;

  constructor() {
    this.loadPromise = this.loadGoogleMaps();
  }

  private loadGoogleMaps(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.google) {
        this.apiLoaded = true;
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${environment.googleMapsApiKey}&libraries=places&callback=initMap`;
      script.async = true;
      script.defer = true;
      
      window.initMap = () => {
        this.apiLoaded = true;
        resolve();
      };

      script.onerror = () => {
        reject(new Error('Error al cargar Google Maps API'));
      };

      document.head.appendChild(script);
    });
  }

  async initMap(elementId: string, lat: number, lng: number): Promise<any> {
    try {
      await this.loadPromise;
      
      if (!this.apiLoaded) {
        throw new Error('Google Maps API no está cargada');
      }

      const mapOptions = {
        center: { lat, lng },
        zoom: 15,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true
      };

      const mapElement = document.getElementById(elementId);
      if (!mapElement) {
        throw new Error(`Elemento con ID ${elementId} no encontrado`);
      }

      this.map = new window.google.maps.Map(mapElement, mapOptions);
      
      this.marker = new window.google.maps.Marker({
        position: { lat, lng },
        map: this.map,
        draggable: true
      });

      this.map.addListener('click', (event: any) => {
        this.updateMarkerPosition(event.latLng);
      });

      this.marker.addListener('dragend', (event: any) => {
        this.updateMarkerPosition(event.latLng);
      });

      return this.map;
    } catch (error) {
      console.error('Error al inicializar el mapa:', error);
      throw error;
    }
  }

  private updateMarkerPosition(latLng: any) {
    this.marker.setPosition(latLng);
    this.map.panTo(latLng);
  }

  getCurrentMarkerPosition(): { lat: number; lng: number } {
    if (!this.marker) {
      return { lat: 0, lng: 0 };
    }
    const position = this.marker.getPosition();
    return {
      lat: position.lat(),
      lng: position.lng()
    };
  }

  async getAddressFromCoordinates(lat: number, lng: number): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!window.google) {
        reject('Google Maps not loaded');
        return;
      }

      if (!this.geocoder) {
        this.geocoder = new window.google.maps.Geocoder();
      }

      this.geocoder.geocode({ location: { lat, lng } }, (results: any[], status: string) => {
        if (status === 'OK' && results[0]) {
          resolve(results[0].formatted_address);
        } else {
          reject('No results found');
        }
      });
    });
  }

  async getCoordinatesFromAddress(address: string): Promise<{ lat: number; lng: number }> {
    return new Promise((resolve, reject) => {
      if (!window.google) {
        reject('Google Maps not loaded');
        return;
      }

      if (!this.geocoder) {
        this.geocoder = new window.google.maps.Geocoder();
      }

      this.geocoder.geocode({ address }, (results: any[], status: string) => {
        if (status === 'OK' && results[0]) {
          const location = results[0].geometry.location;
          resolve({
            lat: location.lat(),
            lng: location.lng()
          });
        } else {
          reject('No results found');
        }
      });
    });
  }

  async searchPlaces(query: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      if (!window.google) {
        reject('Google Maps not loaded');
        return;
      }

      if (!this.autocompleteService) {
        this.autocompleteService = new window.google.maps.places.AutocompleteService();
      }

      this.autocompleteService.getPlacePredictions(
        { input: query },
        (predictions: any[], status: string) => {
          if (status === 'OK') {
            resolve(predictions);
          } else {
            reject('No results found');
          }
        }
      );
    });
  }
} 