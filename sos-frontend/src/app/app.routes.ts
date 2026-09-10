import { Routes } from '@angular/router';
import { ListaCentros } from './features/centros/pages/lista-centros/lista-centros';
import { Mapa } from './features/mapa/pages/mapa/mapa';
import { Inicio } from './pages/inicio/inicio';
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
  }
];