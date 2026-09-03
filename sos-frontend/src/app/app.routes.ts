import { Routes } from '@angular/router';
import { ListaCentros } from './features/centros/pages/lista-centros/lista-centros';
import { Mapa } from './features/mapa/pages/mapa/mapa';

export const routes: Routes = [

  {
    path: '',
    redirectTo: 'centros',
    pathMatch: 'full'
  },

  {
    path: 'centros',
    component: ListaCentros
  },
  
  {
    path: 'mapa',
    component: Mapa
  }

];