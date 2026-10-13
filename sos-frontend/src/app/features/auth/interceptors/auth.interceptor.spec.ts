import { HttpClient, HttpContext, HttpErrorResponse, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { authInterceptor, GESTIONAR_SESION_EN_COMPONENTE } from './auth.interceptor';

describe('authInterceptor (postulaciones y compatibilidad)', () => {
  let http: HttpTestingController;
  let client: HttpClient;
  let auth: { refrescarToken: ReturnType<typeof vi.fn> };
  let navegar: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    localStorage.setItem('token', 'anterior');
    auth = { refrescarToken: vi.fn() };
    TestBed.configureTestingModule({ providers: [
      provideRouter([]), provideHttpClient(withInterceptors([authInterceptor])), provideHttpClientTesting(),
      { provide: AuthService, useValue: auth },
    ] });
    http = TestBed.inject(HttpTestingController);
    client = TestBed.inject(HttpClient);
    navegar = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
  });
  afterEach(() => { http.verify(); localStorage.removeItem('token'); });

  it('renueva el token y conserva el cuerpo de postulación en el reintento autorizado', () => {
    auth.refrescarToken.mockReturnValue(of({ token: 'renovado' }));
    const recibida = vi.fn();
    const body = { voluntariadoId: 7, disponibilidad: 'Tarde' };
    client.post('/api/postulaciones', body, {
      context: new HttpContext().set(GESTIONAR_SESION_EN_COMPONENTE, true),
    }).subscribe(recibida);
    const original = http.expectOne('/api/postulaciones');
    expect(original.request.headers.get('Authorization')).toBe('Bearer anterior');
    original.flush({}, { status: 401, statusText: 'Unauthorized' });
    const reintento = http.expectOne('/api/postulaciones');
    expect(reintento.request.headers.get('Authorization')).toBe('Bearer renovado');
    expect(reintento.request.body).toEqual(body);
    reintento.flush({ success: true }, { status: 201, statusText: 'Created' });
    expect(recibida).toHaveBeenCalledWith({ success: true });
    expect(navegar).not.toHaveBeenCalled();
  });

  it('entrega 401 al formulario sin redirigir si falla la renovación de su sesión', () => {
    auth.refrescarToken.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 401 })));
    let recibido: HttpErrorResponse | undefined;
    client.get('/api/postulaciones/mias', {
      context: new HttpContext().set(GESTIONAR_SESION_EN_COMPONENTE, true),
    }).subscribe({ error: error => recibido = error });
    http.expectOne('/api/postulaciones/mias').flush({}, { status: 401, statusText: 'Unauthorized' });
    expect(recibido?.status).toBe(401);
    expect(localStorage.getItem('token')).toBeNull();
    expect(navegar).not.toHaveBeenCalled();
  });

  it('conserva la redirección habitual a login de las peticiones sin la opción nueva', () => {
    auth.refrescarToken.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 401 })));
    client.get('/api/perfil-voluntario/me').subscribe({ error: () => {} });
    http.expectOne('/api/perfil-voluntario/me').flush({}, { status: 401, statusText: 'Unauthorized' });
    expect(navegar).toHaveBeenCalledWith(['/login']);
  });

  it.each([400, 403, 404, 409, 422, 503])('conserva HTTP %s tras renovar, sin cerrar la sesión', status => {
    auth.refrescarToken.mockReturnValue(of({ token: 'renovado' }));
    let recibido: HttpErrorResponse | undefined;
    client.post('/api/postulaciones', { voluntariadoId: 7, disponibilidad: 'Tarde' }, {
      context: new HttpContext().set(GESTIONAR_SESION_EN_COMPONENTE, true),
    }).subscribe({ error: error => recibido = error });
    http.expectOne('/api/postulaciones').flush({}, { status: 401, statusText: 'Unauthorized' });
    http.expectOne('/api/postulaciones').flush({}, { status, statusText: 'Error' });
    expect(recibido?.status).toBe(status);
    expect(localStorage.getItem('token')).toBe('renovado');
    expect(navegar).not.toHaveBeenCalled();
  });

  it('no renueva ni redirige ante un conflicto 409', () => {
    client.post('/api/postulaciones', {}).subscribe({ error: () => {} });
    http.expectOne('/api/postulaciones').flush({}, { status: 409, statusText: 'Conflict' });
    expect(auth.refrescarToken).not.toHaveBeenCalled();
    expect(navegar).not.toHaveBeenCalled();
  });
});
