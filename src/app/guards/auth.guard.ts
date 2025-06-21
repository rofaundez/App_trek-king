import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    // Permitir acceso a la página home sin autenticación
    if (route.routeConfig?.path === 'home') {
      return true;
    }

    // Verificar si es una ruta de autoridad
    if (route.routeConfig?.path === 'autoridades/home') {
      const currentAutoridad = this.authService.getCurrentAutoridad();
      if (!currentAutoridad) {
        console.log('No hay autoridad autenticada, redirigiendo a login');
        this.router.navigate(['/autoridad-login']);
        return false;
      }
      console.log('Autoridad autenticada:', currentAutoridad.nombre);
      return true;
    }

    // Verificar si es una autoridad para acceder a autoridad-registro
    if (route.routeConfig?.path === 'autoridad-registro') {
      const currentAutoridad = this.authService.getCurrentAutoridad();
      if (!currentAutoridad) {
        this.router.navigate(['/autoridad-login']);
        return false;
      }

      // Verificar si la autoridad tiene el rango adecuado (jefe o encargado)
      if (currentAutoridad.cargo !== 'jefe' && currentAutoridad.cargo !== 'encargado') {
        this.router.navigate(['/autoridades/home']);
        return false;
      }

      return true;
    }

    // Para el resto de páginas, requerir autenticación de usuario normal
    if (!this.authService.getCurrentUser()) {
      this.router.navigate(['/login']);
      return false;
    }
    return true;
  }
}