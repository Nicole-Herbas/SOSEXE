import { Routes } from '@angular/router';
import { ListaCentros } from './features/centros/pages/lista-centros/lista-centros';
import { Mapa } from './features/mapa/pages/mapa/mapa';
import { Inicio } from './features/inicio/pages/inicio/inicio';
import { Donar } from './features/donar/pages/donar/donar';
import { Voluntariado } from './features/voluntariado/pages/voluntariado/voluntariado';
import { Noticias } from './features/noticias/pages/noticias/noticias';
import { AcercaDe } from './features/acerca-de/pages/acerca-de/acerca-de';
import { LoginComponent } from './features/auth/pages/login/login';
import { adminGuard } from './admin-guard';

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