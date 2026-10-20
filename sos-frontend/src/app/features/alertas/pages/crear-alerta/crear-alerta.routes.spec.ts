import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { routes } from '../../../../app.routes';
import { AuthService } from '../../../auth/services/auth.service';
import { CrearAlertaComponent } from './crear-alerta';
import { RevisarAlertasComponent } from '../revisar-alertas/revisar-alertas';

@Component({ template: '' })
class DestinoComponent {}

describe.each([
  {
    path: 'admin/alertas/crear',
    componenteEsperado: CrearAlertaComponent,
    api: '/api/departamentos',
  },
  {
    path: 'admin/alertas',
    componenteEsperado: RevisarAlertasComponent,
    api: '/api/alertas/borradores',
  },
])('Acceso administrativo a $path', ({ path, componenteEsperado, api }) => {
  afterEach(() => TestBed.inject(HttpTestingController).verify());

  it.each(['ADMIN', 'USER', 'sin sesión'])('protege la ruta para %s', async (rol) => {
    const ruta = routes.find((route) => route.path === path);
    if (!ruta) throw new Error('Falta la ruta administrativa de alertas');
    await TestBed.configureTestingModule({
      providers: [
        provideRouter([
          ruta,
          { path: 'mapa', component: DestinoComponent },
          { path: 'login', component: DestinoComponent },
        ]),
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: AuthService,
          useValue: {
            usuarioActual: () =>
              rol === 'sin sesión' ? throwError(() => new Error('Sin sesión')) : of({ rol }),
          },
        },
      ],
    }).compileComponents();
    const harness = await RouterTestingHarness.create();
    const componente = await harness.navigateByUrl('/' + path);
    const http = TestBed.inject(HttpTestingController);
    if (rol === 'ADMIN') {
      expect(componente).toBeInstanceOf(componenteEsperado);
      http.expectOne(api).flush({
        success: true,
        data: api === '/api/departamentos' ? [{ id: 3, nombre: 'Cochabamba' }] : [],
      });
    } else {
      expect(TestBed.inject(Router).url).toBe(rol === 'USER' ? '/mapa' : '/login');
      http.expectNone(api);
    }
  });
});
