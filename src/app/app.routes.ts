import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'registro',
    loadComponent: () => import('./registro/registro.page').then((m) => m.RegistroPage),
  },
  {
    path: 'footer',
    loadComponent: () => import('./footer/footer.component').then((m) => m.FooterComponent),
  },
  {
    path: 'header',
    loadComponent: () => import('./header/header.component').then((m) => m.HeaderComponent),
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

  {path: '',
  redirectTo: 'login',
  pathMatch: 'full',},

  {path: '**',
    redirectTo: 'login',
    pathMatch: 'full',}









];
