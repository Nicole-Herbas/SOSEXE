import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from '../auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('debería crearse', () => {
    expect(service).toBeTruthy();
  });

  it('login() debería hacer POST a /api/auth/login', () => {
    const credenciales = { email: 'a@b.com', password: '123456' };
    service.login(credenciales).subscribe();
    const req = httpMock.expectOne('/api/auth/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(credenciales);
    req.flush({ token: 'tok', nombre: 'User', email: 'a@b.com', rol: 'CIUDADANO' });
  });

  it('registro() debería hacer POST a /api/auth/registro', () => {
    const datos = { nombre: 'Test', email: 'a@b.com', password: '123456', rolId: 2 };
    service.registro(datos).subscribe();
    const req = httpMock.expectOne('/api/auth/registro');
    expect(req.request.method).toBe('POST');
    req.flush('¡Usuario registrado con éxito!');
  });

  it('isLoggedIn() debería retornar false si no hay token', () => {
    expect(service.isLoggedIn()).toBe(false);
  });

  it('isLoggedIn() debería retornar true si hay token en localStorage', () => {
    localStorage.setItem('token', 'mi-token');
    expect(service.isLoggedIn()).toBe(true);
  });

  it('isAdmin() debería retornar true solo si rol es ADMIN', () => {
    localStorage.setItem('rol', 'ADMIN');
    expect(service.isAdmin()).toBe(true);
  });

  it('isAdmin() debería retornar false si rol es CIUDADANO', () => {
    localStorage.setItem('rol', 'CIUDADANO');
    expect(service.isAdmin()).toBe(false);
  });

  it('logout() debería limpiar token, rol y nombre del localStorage', () => {
    localStorage.setItem('token', 'tok');
    localStorage.setItem('rol', 'ADMIN');
    localStorage.setItem('nombre', 'Admin');
    service.logout();
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('rol')).toBeNull();
    expect(localStorage.getItem('nombre')).toBeNull();
  });

  it('getRol() debería retornar el rol almacenado', () => {
    localStorage.setItem('rol', 'ADMIN');
    expect(service.getRol()).toBe('ADMIN');
  });
});
