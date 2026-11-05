import { TestBed } from '@angular/core/testing';
import { CanActivateFn, provideRouter, Router, UrlTree } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { adminGuard } from './admin-guard';
import { AuthService } from './features/auth/services/auth.service';

describe('adminGuard', () => {
  let rol: string;
  let sinSesion: boolean;
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => adminGuard(...guardParameters));

  beforeEach(() => {
    rol = 'USER';
    sinSesion = false;
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { usuarioActual: () => sinSesion
          ? throwError(() => new Error('Sin sesión'))
          : of({ rol, nombre: 'Usuario', email: 'usuario@test.com' }) } }
      ]
    });
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });

  it('autoriza ADMIN y rechaza USER con redirección', () => {
    rol = 'ADMIN';
    (executeGuard({} as never, {} as never) as Observable<boolean | UrlTree>).subscribe(resultado => expect(resultado).toBe(true));
    rol = 'USER';
    (executeGuard({} as never, {} as never) as Observable<boolean | UrlTree>).subscribe(resultado => {
      expect(TestBed.inject(Router).serializeUrl(resultado as UrlTree)).toBe('/mapa');
    });
  });

  it('redirige a login sin sesión', () => {
    sinSesion = true;
    (executeGuard({} as never, {} as never) as Observable<boolean | UrlTree>).subscribe(resultado => {
      expect(TestBed.inject(Router).serializeUrl(resultado as UrlTree)).toBe('/login');
    });
  });
});
