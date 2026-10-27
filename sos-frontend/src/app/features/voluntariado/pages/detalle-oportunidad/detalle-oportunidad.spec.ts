import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { NavigationEnd, provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { filter, firstValueFrom } from 'rxjs';

import { routes } from '../../../../app.routes';
import { APP_TEXTOS } from '../../../../shared/constants/app-textos.constants';
import { ApiResponse } from '../../../../shared/models/api-response';
import { authInterceptor } from '../../../auth/interceptors/auth.interceptor';
import { AuthService } from '../../../auth/services/auth.service';
import { OportunidadVoluntariado } from '../../models/oportunidad-voluntariado';
import { PerfilVoluntarioService } from '../../services/perfil-voluntario.service';
import { Voluntariado } from '../voluntariado/voluntariado';
import { DetalleOportunidad } from './detalle-oportunidad';

const OPORTUNIDAD: OportunidadVoluntariado = {
  id: 7,
  titulo: 'Organizar donaciones para las familias',
  descripcion: 'Descripción completa de la actividad. '.repeat(20) + '\nÚltimo párrafo sin truncar.',
  habilidadesRequeridas: 'Organización\nTrabajo en equipo',
  fechaInicio: '2026-10-15T09:00:00',
  fechaFin: '2026-10-15T16:00:00',
  estado: 'PUBLICADO',
  centroId: 2,
  centroNombre: 'Centro comunitario',
  centroCiudad: 'El Alto',
  centroDepartamento: 'La Paz',
  centroNecesidades: [{ id: 9, nombre: 'Logística' }],
  creadoPorId: null,
};

function respuesta<T>(data: T): ApiResponse<T> {
  return { success: true, message: 'OK', data, timestamp: '' };
}

describe('DetalleOportunidad (ruta pública)', () => {
  const textos = APP_TEXTOS.voluntariado.oportunidades.detalle;
  let harness: RouterTestingHarness;
  let httpTesting: HttpTestingController;
  let router: Router;
  let perfilService: { existeMiPerfil: ReturnType<typeof vi.fn> };
  let authService: {
    estaAutenticado: ReturnType<typeof vi.fn>;
    obtenerNombreUsuario: ReturnType<typeof vi.fn>;
    refrescarToken: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    localStorage.removeItem('token');
    authService = {
      estaAutenticado: vi.fn(() => false),
      obtenerNombreUsuario: vi.fn(() => ''),
      refrescarToken: vi.fn(),
    };
    perfilService = { existeMiPerfil: vi.fn() };
    TestBed.configureTestingModule({
      providers: [
        provideRouter(routes),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authService },
        { provide: PerfilVoluntarioService, useValue: perfilService },
      ],
    });
    httpTesting = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    harness = await RouterTestingHarness.create();
  });

  afterEach(() => httpTesting.verify());

  function elemento(): HTMLElement {
    return harness.routeNativeElement!;
  }

  async function abrir(id = '7'): Promise<DetalleOportunidad> {
    const component = await harness.navigateByUrl(`/voluntariado/${id}`, DetalleOportunidad);
    harness.detectChanges();
    return component;
  }

  function responder(oportunidad = OPORTUNIDAD): void {
    const request = httpTesting.expectOne(`/api/voluntariados/publicos/${oportunidad.id}`);
    expect(request.request.method).toBe('GET');
    request.flush(respuesta(oportunidad));
    harness.detectChanges();
  }

  async function seguirEnlace(enlace: HTMLAnchorElement): Promise<void> {
    const navegacion = firstValueFrom(router.events.pipe(filter(event => event instanceof NavigationEnd)));
    enlace.click();
    await navegacion;
    harness.detectChanges();
  }

  it('permite entrar por URL directa sin sesión y consulta exclusivamente el endpoint público', async () => {
    await abrir();
    const request = httpTesting.expectOne('/api/voluntariados/publicos/7');
    expect(request.request.headers.has('Authorization')).toBe(false);
    request.flush(respuesta(OPORTUNIDAD));
    harness.detectChanges();
    expect(router.url).toBe('/voluntariado/7');
    expect(elemento().querySelector('h1')?.textContent).toBe(OPORTUNIDAD.titulo);
    expect(authService.refrescarToken).not.toHaveBeenCalled();
    expect(perfilService.existeMiPerfil).not.toHaveBeenCalled();
    httpTesting.expectNone('/api/voluntariados/7');
  });

  it('anuncia la carga sin mostrar datos ni errores hasta recibir la respuesta', async () => {
    const component = await abrir();
    expect(component.cargando()).toBe(true);
    expect(elemento().querySelector('main')?.getAttribute('aria-busy')).toBe('true');
    expect(elemento().querySelector('[role="status"]')?.textContent).toContain(textos.cargando);
    expect(elemento().querySelector('article')).toBeNull();
    expect(elemento().querySelector('[role="alert"]')).toBeNull();
    responder();
    expect(elemento().querySelector('main')?.getAttribute('aria-busy')).toBe('false');
  });

  it('muestra la descripción completa, habilidades registradas y centro con ubicación', async () => {
    await abrir();
    responder();
    const textosCompletos = elemento().querySelectorAll('.detalle-oportunidad__texto');
    expect(textosCompletos[0].textContent).toBe(OPORTUNIDAD.descripcion);
    expect(textosCompletos[1].textContent).toBe(OPORTUNIDAD.habilidadesRequeridas);
    expect(elemento().textContent).toContain('Centro comunitario');
    expect(elemento().textContent).toContain('El Alto');
    expect(elemento().textContent).toContain('La Paz');
  });

  it('conserva inicio 09:00 y finalización 16:00 locales y muestra la fecha en español', async () => {
    await abrir();
    responder();
    const fechas = elemento().querySelectorAll('time');
    expect(fechas[0].getAttribute('datetime')).toBe(OPORTUNIDAD.fechaInicio);
    expect(fechas[0].textContent).toContain('15 de octubre de 2026');
    expect(fechas[0].textContent).toContain('09:00');
    expect(fechas[1].getAttribute('datetime')).toBe(OPORTUNIDAD.fechaFin);
    expect(fechas[1].textContent).toContain('16:00');
  });

  it('presenta las 00:30 del día indicado sin desplazarlas ni convertirlas en 24:30', async () => {
    await abrir();
    responder({ ...OPORTUNIDAD, fechaInicio: '2026-10-15T00:30:00' });
    const inicio = elemento().querySelector('time')!;
    expect(inicio.textContent).toContain('15 de octubre de 2026');
    expect(inicio.textContent).toContain('00:30');
  });

  it.each([null, '', '   '])('muestra No informado cuando las habilidades son %s', async habilidades => {
    await abrir();
    responder({ ...OPORTUNIDAD, habilidadesRequeridas: habilidades });
    expect(elemento().querySelectorAll('.detalle-oportunidad__texto')[1].textContent).toBe(textos.noInformado);
    expect(elemento().textContent).not.toContain('Logística');
  });

  it('muestra No informado para centro y ubicación ausentes, descripción vacía y fechas no disponibles', async () => {
    await abrir();
    responder({
      ...OPORTUNIDAD, centroNombre: null, centroCiudad: null, centroDepartamento: null,
      descripcion: ' ', fechaInicio: '', fechaFin: 'fecha inválida',
    });
    expect(Array.from(elemento().querySelectorAll('dd')).map(dd => dd.textContent?.trim()))
      .toEqual(Array(5).fill(textos.noInformado));
    expect(elemento().querySelector('.detalle-oportunidad__texto')?.textContent).toBe(textos.noInformado);
    expect(elemento().querySelector('time')).toBeNull();
    expect(elemento().textContent).not.toContain('null');
  });

  it.each(['abc', '0', '-7', '1.5', '9007199254740992'])('rechaza el ID inválido %s sin peticiones HTTP', async id => {
    const component = await abrir(id);
    expect(component.cargando()).toBe(false);
    expect(elemento().querySelector('[role="alert"]')?.textContent).toContain(textos.idInvalido);
    httpTesting.expectNone(() => true);
  });

  it('muestra el mismo 404 para oportunidad inexistente o no publicada', async () => {
    await abrir();
    httpTesting.expectOne('/api/voluntariados/publicos/7').flush({}, { status: 404, statusText: 'Not Found' });
    harness.detectChanges();
    expect(elemento().querySelector('[role="alert"]')?.textContent).toContain(textos.noEncontrada);
    expect(elemento().querySelector('article')).toBeNull();
    expect(router.url).toBe('/voluntariado/7');
    expect(authService.refrescarToken).not.toHaveBeenCalled();
  });

  it.each(['conexión', 'servidor'])('permite reintentar tras un error de %s', async tipo => {
    await abrir();
    const request = httpTesting.expectOne('/api/voluntariados/publicos/7');
    if (tipo === 'conexión') request.error(new ProgressEvent('error'));
    else request.flush({}, { status: 503, statusText: 'Service Unavailable' });
    harness.detectChanges();
    expect(elemento().querySelector('[role="alert"]')?.textContent).toContain(textos.errorCarga);
    (elemento().querySelector('button') as HTMLButtonElement).click();
    harness.detectChanges();
    expect(elemento().querySelector('[role="status"]')?.textContent).toContain(textos.cargando);
    responder();
    expect(elemento().querySelector('h1')?.textContent).toBe(OPORTUNIDAD.titulo);
    expect(elemento().querySelector('[role="alert"]')).toBeNull();
  });

  it('consulta el nuevo ID cuando se navega entre detalles sin mostrar datos anteriores', async () => {
    await abrir();
    responder();
    await abrir('8');
    expect(elemento().querySelector('article')).toBeNull();
    responder({ ...OPORTUNIDAD, id: 8, titulo: 'Otra actividad' });
    expect(elemento().querySelector('h1')?.textContent).toBe('Otra actividad');
  });

  it('puede navegar de un ID inválido a uno válido', async () => {
    await abrir('abc');
    await abrir();
    responder();
    expect(elemento().querySelector('article')).not.toBeNull();
  });

  it('navega desde una tarjeta a su detalle real y vuelve al listado público', async () => {
    await harness.navigateByUrl('/voluntariado', Voluntariado);
    httpTesting.match(req => req.url.includes('/i18n/')).forEach(req => req.flush({}));
    harness.detectChanges();
    httpTesting.expectOne('/api/voluntariados').flush(respuesta([OPORTUNIDAD]));
    harness.detectChanges();
    const enlace = elemento().querySelector('.vol-card__detalle') as HTMLAnchorElement;
    expect(enlace.getAttribute('href')).toBe('/voluntariado/7');
    expect(enlace.getAttribute('aria-label')).toContain(OPORTUNIDAD.titulo);
    await seguirEnlace(enlace);
    responder();
    expect(router.url).toBe('/voluntariado/7');
    await seguirEnlace(elemento().querySelector('.detalle-oportunidad__volver') as HTMLAnchorElement);
    expect(router.url).toBe('/voluntariado');
    httpTesting.expectOne('/api/voluntariados').flush(respuesta([OPORTUNIDAD]));
    harness.detectChanges();
    expect(elemento().querySelector('.vol-card__title')?.textContent).toBe(OPORTUNIDAD.titulo);
    expect(perfilService.existeMiPerfil).not.toHaveBeenCalled();
  });
});
