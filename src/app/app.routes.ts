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
    path: 'login',
    loadComponent: () => import('./login/login.page').then( m => m.LoginPage)
  },
  {
    path: 'profile',
    loadComponent: () => import('./profile/profile.page').then(m => m.ProfilePage),
    canActivate: [AuthGuard]
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
    path: '',
    redirectTo: 'home',
    pathMatch: 'full', 
  },
  {
    path: '**',
    redirectTo: 'home',
  },





];
