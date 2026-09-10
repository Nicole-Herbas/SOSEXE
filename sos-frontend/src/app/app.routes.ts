import { Routes } from '@angular/router';
import { ListaCentros } from './features/centros/pages/lista-centros/lista-centros';
import { LoginComponent } from './features/auth/pages/login/login';
import { adminGuard } from './admin-guard';
import { Inicio } from './pages/inicio/inicio';
import { Mapa } from './pages/mapa/mapa';
import { Donar } from './pages/donar/donar';
import { Voluntariado } from './pages/voluntariado/voluntariado';
import { Noticias } from './pages/noticias/noticias';
import { AcercaDe } from './pages/acerca-de/acerca-de';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'inicio',
    pathMatch: 'full'
  },
  {
    path: 'inicio',
    component: Inicio
  },
  {
    path: 'mapa',
    component: Mapa
  },
  {
    path: 'donar',
    component: Donar
  },
  {
    path: 'voluntariado',
    component: Voluntariado
  },
  {
    path: 'noticias',
    component: Noticias
  },
  {
    path: 'acerca-de',
    component: AcercaDe
  },
  {
    path: 'centros',
    component: ListaCentros
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'admin',
    component: ListaCentros,
    canActivate: [adminGuard]
  }
];