import { Routes } from '@angular/router';
import { ListaCentros } from './features/centros/pages/lista-centros/lista-centros';
import { LoginComponent } from './login/login';
import { adminGuard } from './admin-guard'; // <-- 1. Importamos a tu guardia

export const routes: Routes = [
  { 
    path: '', 
    redirectTo: 'login', 
    pathMatch: 'full' 
  },
  
  { 
    path: 'login', 
    component: LoginComponent 
  },

  { 
    path: 'centros', 
    component: ListaCentros 
  },

  { 
    path: 'admin', 
    component: ListaCentros, 
    canActivate: [adminGuard] 
  }
];