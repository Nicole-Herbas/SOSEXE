import { Routes } from '@angular/router';
import { ListaCentros } from './features/centros/pages/lista-centros/lista-centros';
import { Mapa } from './features/mapa/pages/mapa/mapa';
import { Inicio } from './features/inicio/pages/inicio/inicio';
import { Donar } from './features/donar/pages/donar/donar';
import { Voluntariado } from './features/voluntariado/pages/voluntariado/voluntariado';
import { Noticias } from './features/noticias/pages/noticias/noticias';
import { AcercaDe } from './features/acerca-de/pages/acerca-de/acerca-de';
import { RegistrarCentroComponent } from './features/acerca-de/pages/registrar-centro/registrar-centro';
import { LoginComponent } from './features/auth/pages/login/login';
import { RegistroComponent } from './features/auth/pages/registro/registro';
import { PreferenciasComponent } from './features/preferencias/pages/preferencias/preferencias';
import { adminGuard } from './admin-guard';
import { authGuard } from './auth-guard';
import { RegistrarPuntoComponent } from './features/puntos-ayuda/pages/registrar-punto/registrar-punto';
import { registroPuntoGuard } from './features/auth/guards/registro-punto.guard';

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
    path: 'voluntariado/:id',
    loadComponent: () => import('./features/voluntariado/pages/detalle-oportunidad/detalle-oportunidad')
      .then(m => m.DetalleOportunidad)
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
    path: 'acerca-de/registrar-centro',
    component: RegistrarCentroComponent
  },
  {
    path: 'registrar-punto',
    component: RegistrarPuntoComponent,
    canActivate: [registroPuntoGuard]
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
    path: 'registro',
    component: RegistroComponent
  },
  {
    path: 'preferencias',
    component: PreferenciasComponent,
    canActivate: [authGuard]
  },
  {
    path: 'admin/alertas/crear',
    loadComponent: () => import('./features/alertas/pages/crear-alerta/crear-alerta')
      .then(m => m.CrearAlertaComponent),
    canActivate: [adminGuard]
  },
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/pages/admin/admin').then(m => m.AdminComponent),
    canActivate: [adminGuard]
  }
];
