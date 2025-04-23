import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'registro',
    loadComponent: () => import('./registro/registro.page').then((m) => m.RegistroPage),
  },
  
  {
    path: 'menu',
    loadComponent: () => import('./menu/menu.page').then( m => m.MenuPage)
  },
  {
    path: 'my-routes',
    loadComponent: () => import('./my-routes/my-routes.page').then( m => m.MyRoutesPage)
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.page').then( m => m.LoginPage)
  },
  {
    path: 'profile',
    loadComponent: () => import('./profile/profile.page').then(m => m.ProfilePage),
    canActivate: [AuthGuard]
  },
  {
    path: 'create-route',
    loadComponent: () => import('./create-route/create-route.page').then( m => m.CreateRoutePage)
  },
  {
    path: 'rbd',
    loadComponent: () => import('./reset-bbdd/reset-bbdd.page').then( m => m.ResetBbddPage)
  },
  {
    path: 'recover',
    loadComponent: () => import('./recover/recover.page').then(m => m.RecoverPage)
  },
  {
    path: 'listado-usuario',
    loadComponent: () => import('./listado-usuario/listado-usuario.page').then( m => m.ListadoUsuarioPage)
  },
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then(m => m.HomePage)
  },
  {
    path: 'autoridad-home',
    loadComponent: () => import('./autoridades/home/home.page').then( m => m.HomePage)
  },
  {
    path: 'autoridad-detalle-ruta',
    loadComponent: () => import('./autoridades/detalle-ruta/detalle-ruta.page').then( m => m.DetalleRutaPage)
  },
  {
    path: 'autoridad-login',
    loadComponent: () => import('./autoridades/login/login.page').then( m => m.AutoridadLoginPage)
  },
  {
    path: 'autoridad-registro',
    loadComponent: () => import('./autoridades/registro/registro.page').then( m => m.RegistroPage)
  },
  {
    path: 'autoridad-perfil',
    loadComponent: () => import('./autoridades/perfil/perfil.page').then( m => m.PerfilPage)
  },

  {path: '',
  redirectTo: 'home',
  pathMatch: 'full',},

  {path: '**',
    redirectTo: 'home',
    pathMatch: 'full',},










];
