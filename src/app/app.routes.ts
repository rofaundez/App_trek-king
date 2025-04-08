import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'inicio',
    loadComponent: () => import('./inicio/inicio.page').then((m) => m.InicioPage),
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
     path: '',
    redirectTo: 'inicio',
    pathMatch: 'full', 
  },
  {
    path: '**',
    redirectTo: 'inicio',
  },  {
    path: 'menu',
    loadComponent: () => import('./menu/menu.page').then( m => m.MenuPage)
  }



];
