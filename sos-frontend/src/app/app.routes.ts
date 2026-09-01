import { Routes } from '@angular/router';
import { ListaCentros } from './features/centros/pages/lista-centros/lista-centros';

export const routes: Routes = [

  {
    path: '',
    redirectTo: 'centros',
    pathMatch: 'full'
  },

  {
    path: 'centros',
    component: ListaCentros
  }

];