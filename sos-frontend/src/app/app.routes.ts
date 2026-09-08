import { Routes } from '@angular/router';
import { ListaCentros } from './features/centros/pages/lista-centros/lista-centros';
import { LoginComponent } from './login/login';

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
  { path: 'login', component: LoginComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' }

];