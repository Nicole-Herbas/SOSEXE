import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';

import { Navbar } from './navbar';
import { AuthService } from '../../features/auth/services/auth.service';
import { IdiomaService } from '../services/idioma.service';
import { routes } from '../../app.routes';
import { adminGuard } from '../../admin-guard';

describe('Navbar', () => {

  let component: Navbar;
  let fixture: ComponentFixture<Navbar>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {

    localStorage.removeItem('token');
    localStorage.removeItem('usuario_nombre');

    await TestBed.configureTestingModule({
      imports: [Navbar],
      providers: [
        provideRouter([{ path: 'inicio', component: Navbar }]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ]
    })
    .compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(Navbar);
    component = fixture.componentInstance;

    httpMock.match(req => req.url.includes('/i18n/')).forEach(req => req.flush({}));

    await fixture.whenStable();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  function enlaceAdmin(): HTMLAnchorElement | null {
    fixture.detectChanges();
    return fixture.nativeElement.querySelector('a[href="/admin"]');
  }

  function login(rol: string): void {
    TestBed.inject(AuthService).login({ email: 'usuario@test.com', password: 'prueba' }).subscribe();
    httpMock.expectOne('/api/auth/login').flush({ token: 'token-de-prueba', nombre: 'Usuario', email: 'usuario@test.com' });
    httpMock.expectOne('/api/auth/me').flush({ rol, nombre: 'Usuario', email: 'usuario@test.com' });
    fixture.detectChanges();
    expect(component.esAdmin()).toBe(rol === 'ADMIN');
  }

  it('no muestra Administración sin sesión ni para USER', () => {
    expect(enlaceAdmin()).toBeNull();
    login('USER');
    expect(enlaceAdmin()).toBeNull();
  });

  it('ADMIN ve Administración y su enlace RouterLink navega a /admin', () => {
    login('ADMIN');
    expect(enlaceAdmin()?.textContent).toContain('Administración');
    expect(enlaceAdmin()?.getAttribute('href')).toBe('/admin');
    (fixture.nativeElement.querySelector('.navbar-toggle') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.navbar-links.abierto a[href="/admin"]')).toBeTruthy();
    expect(routes.find(ruta => ruta.path === 'admin')?.canActivate).toContain(adminGuard);
  });

  it('elimina el acceso visible inmediatamente al cerrar sesión, aun si falla la API', () => {
    login('ADMIN');
    component.cerrarSesion();
    expect(enlaceAdmin()).toBeNull();
    httpMock.expectOne('/api/auth/logout').flush(null, { status: 503, statusText: 'Unavailable' });
    expect(localStorage.getItem('token')).toBeNull();
    expect(enlaceAdmin()).toBeNull();
  });

  it('cambia el texto del enlace al cambiar el idioma', () => {
    login('ADMIN');
    const idioma = TestBed.inject(IdiomaService);
    idioma.setIdioma('en');
    httpMock.expectOne('/i18n/en.json').flush({ navbar: { enlaces: { administracion: 'Administration' } } });
    expect(enlaceAdmin()?.textContent).toContain('Administration');
  });

});
