import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { APP_TEXTOS } from '../../../../shared/constants/app-textos.constants';
import { AuthService } from '../../../auth/services/auth.service';
import { OportunidadVoluntariado } from '../../models/oportunidad-voluntariado';
import { PerfilVoluntario } from '../../models/perfil-voluntario';
import { FormularioPostulacion } from './formulario-postulacion';

const OPORTUNIDAD: OportunidadVoluntariado = {
  id: 7, titulo: 'Apoyo al centro', descripcion: 'Descripción completa',
  habilidadesRequeridas: 'Habilidades de la actividad', fechaInicio: '2026-10-15T09:00:00',
  fechaFin: '2026-10-15T16:00:00', estado: 'PUBLICADO', centroId: 2,
  centroNombre: 'Centro comunitario', centroCiudad: 'El Alto', centroDepartamento: 'La Paz',
  centroNecesidades: [], creadoPorId: null,
};
const PERFIL: PerfilVoluntario = {
  id: 4, telefono: '70123456', emailContacto: 'persona@example.com', departamentoId: 2,
  ciudad: 'El Alto', habilidades: ['Organización', 'Logística'], disponibilidad: ['Tarde', 'Fines de semana'],
};
const respuesta = <T>(data: T) => ({ success: true, message: 'OK', data, timestamp: '' });

describe('FormularioPostulacion', () => {
  const textos = APP_TEXTOS.voluntariado.oportunidades.postulacion;
  let fixture: ComponentFixture<FormularioPostulacion>;
  let component: FormularioPostulacion;
  let http: HttpTestingController;
  let auth: { estaAutenticado: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    auth = { estaAutenticado: vi.fn(() => true) };
    await TestBed.configureTestingModule({
      imports: [FormularioPostulacion],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting(),
        { provide: AuthService, useValue: auth }],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(FormularioPostulacion);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('oportunidad', OPORTUNIDAD);
  });
  afterEach(() => http.verify());

  function cargar(perfil = PERFIL, postulaciones: { voluntariadoId: number; estado: string }[] = []): void {
    fixture.detectChanges();
    http.expectOne('/api/perfil-voluntario/me').flush(respuesta(perfil));
    http.expectOne('/api/postulaciones/mias').flush(respuesta(postulaciones));
    fixture.detectChanges();
  }

  function completar(disponibilidad = 'Puedo ayudar por la tarde', comentario = ''): void {
    component.formulario.setValue({ disponibilidad, comentario });
    fixture.detectChanges();
  }

  function confirmar(): void {
    http.expectOne('/api/postulaciones').flush(respuesta({
      id: 50, voluntariadoId: 7, usuarioId: 10, estado: 'PENDIENTE',
    }), { status: 201, statusText: 'Created' });
    fixture.detectChanges();
  }

  it('sin sesión muestra login con retorno al detalle y no consulta datos privados', () => {
    auth.estaAutenticado.mockReturnValue(false);
    fixture.detectChanges();
    expect(component.estado()).toBe('SIN_SESION');
    const enlace = fixture.nativeElement.querySelector('a') as HTMLAnchorElement;
    const url = TestBed.inject(Router).parseUrl(enlace.getAttribute('href')!);
    expect(url.queryParams['returnUrl']).toBe('/voluntariado/7');
    expect(enlace.textContent).toContain(textos.iniciarSesion);
    http.expectNone(() => true);
  });

  it('consulta solo el perfil propio, presenta sus habilidades de solo lectura y mantiene la disponibilidad vacía', () => {
    cargar();
    expect(fixture.nativeElement.querySelector('.postulacion__actividad').textContent).toBe(OPORTUNIDAD.titulo);
    expect(fixture.nativeElement.querySelector('.postulacion__habilidades').textContent).toContain('Organización');
    expect(fixture.nativeElement.querySelector('.postulacion__habilidades').textContent).toContain('Logística');
    expect(fixture.nativeElement.querySelector('.postulacion__habilidades input')).toBeNull();
    expect(fixture.nativeElement.querySelector('.postulacion__habilidades').textContent).not.toContain(OPORTUNIDAD.habilidadesRequeridas);
    expect(component.formulario.controls.disponibilidad.value).toBe('');
    expect(fixture.nativeElement.textContent).toContain('Tarde, Fines de semana');
    http.expectNone(request => request.url.includes('/usuario/'));
  });

  it('anuncia carga y espera la consulta de duplicados antes de habilitar el formulario', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="status"]').textContent).toContain(textos.cargando);
    http.expectOne('/api/perfil-voluntario/me').flush(respuesta(PERFIL));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('form')).toBeNull();
    http.expectOne('/api/postulaciones/mias').flush(respuesta([]));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('form')).not.toBeNull();
  });

  it('permite usar una sugerencia válida solo por una acción explícita y no reemplaza texto escrito', () => {
    cargar();
    component.usarSugerencia();
    expect(component.formulario.controls.disponibilidad.value).toBe('Tarde, Fines de semana');
    completar('Mi disponibilidad específica');
    component.usarSugerencia();
    expect(component.formulario.controls.disponibilidad.value).toBe('Mi disponibilidad específica');
  });

  it('no copia ni ofrece aplicar una sugerencia de más de 255 caracteres', () => {
    cargar({ ...PERFIL, disponibilidad: ['a'.repeat(256)] });
    component.usarSugerencia();
    expect(component.formulario.controls.disponibilidad.value).toBe('');
    expect(fixture.nativeElement.querySelector('.postulacion__sugerir')).toBeNull();
  });

  it('no inventa habilidades ni disponibilidad si el perfil contiene listas vacías', () => {
    cargar({ ...PERFIL, habilidades: [], disponibilidad: [] });
    expect(fixture.nativeElement.querySelector('.postulacion__habilidades').textContent).toContain(textos.noInformado);
    expect(fixture.nativeElement.querySelector('.postulacion__sugerencia')).toBeNull();
  });

  it.each(['', '   ', '\t\n', 'a'.repeat(256)])('rechaza disponibilidad inválida antes de enviar: %s', disponibilidad => {
    cargar();
    completar(disponibilidad);
    component.enviar();
    fixture.detectChanges();
    expect(component.formulario.controls.disponibilidad.invalid).toBe(true);
    expect(fixture.nativeElement.querySelector('#postulacion-disponibilidad').getAttribute('aria-invalid')).toBe('true');
    expect(fixture.nativeElement.querySelector('#postulacion-disponibilidad-error').textContent.trim()).not.toBe('');
    http.expectNone('/api/postulaciones');
  });

  it('valida el máximo de 500 caracteres de comentario antes de enviar', () => {
    cargar();
    completar('Tarde', 'a'.repeat(501));
    component.enviar();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('#postulacion-comentario-error').textContent).toContain(textos.comentarioLargo);
    http.expectNone('/api/postulaciones');
  });

  it('acepta los límites de 255 y 500 y envía solo los campos permitidos', () => {
    cargar();
    completar('a'.repeat(255), 'b'.repeat(500));
    component.enviar();
    const request = http.expectOne('/api/postulaciones');
    expect(request.request.body).toEqual({ voluntariadoId: 7, disponibilidad: 'a'.repeat(255), comentario: 'b'.repeat(500) });
    request.flush(respuesta({ estado: 'PENDIENTE' }), { status: 201, statusText: 'Created' });
  });

  it('bloquea dobles envíos y muestra confirmación PENDIENTE solo después del 201', () => {
    cargar();
    completar();
    (fixture.nativeElement.querySelector('form') as HTMLFormElement).dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    component.enviar();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('button[type="submit"]').disabled).toBe(true);
    expect(component.formulario.disabled).toBe(true);
    expect(fixture.nativeElement.textContent).not.toContain(textos.exito);
    confirmar();
    expect(fixture.nativeElement.textContent).toContain(textos.exito);
    expect(fixture.nativeElement.textContent).toContain('PENDIENTE');
    component.enviar();
    http.expectNone('/api/postulaciones');
  });

  it.each(['PENDIENTE', 'APROBADO', 'RECHAZADO'])('impide postular si ya existe una postulación %s', estado => {
    cargar(PERFIL, [{ voluntariadoId: 7, estado }]);
    expect(component.estado()).toBe('DUPLICADA');
    expect(fixture.nativeElement.textContent).toContain(textos.duplicada);
    expect(fixture.nativeElement.querySelector('form')).toBeNull();
    component.enviar();
    http.expectNone('/api/postulaciones');
  });

  it('permite postular si solo existen postulaciones para otras oportunidades', () => {
    cargar(PERFIL, [{ voluntariadoId: 8, estado: 'PENDIENTE' }]);
    expect(component.estado()).toBe('LISTO');
  });

  it('un perfil inexistente muestra enlace al flujo existente de creación', () => {
    fixture.detectChanges();
    http.expectOne('/api/perfil-voluntario/me').flush({}, { status: 404, statusText: 'Not Found' });
    fixture.detectChanges();
    expect(component.estado()).toBe('SIN_PERFIL');
    expect(fixture.nativeElement.querySelector('a').getAttribute('href')).toBe('/voluntariado');
    expect(fixture.nativeElement.textContent).toContain(textos.sinPerfil);
    http.expectNone('/api/postulaciones/mias');
  });

  it('permite reintentar la consulta de postulaciones propias sin habilitar un envío incierto', () => {
    fixture.detectChanges();
    http.expectOne('/api/perfil-voluntario/me').flush(respuesta(PERFIL));
    http.expectOne('/api/postulaciones/mias').flush({}, { status: 503, statusText: 'Error' });
    fixture.detectChanges();
    expect(component.estado()).toBe('ERROR_CARGA');
    component.enviar();
    http.expectNone('/api/postulaciones');
    fixture.nativeElement.querySelector('button').click();
    cargar();
    expect(component.estado()).toBe('LISTO');
  });

  it.each([
    [401, 'SIN_SESION', textos.sesionVencida], [403, 'SIN_PERFIL', textos.sinPerfil],
    [404, 'NO_DISPONIBLE', textos.noEncontrada], [400, 'NO_DISPONIBLE', textos.noDisponible],
    [422, 'LISTO', textos.validacionServidor], [409, 'DUPLICADA', textos.duplicada],
    [503, 'LISTO', textos.errorConexion],
  ] as const)('maneja HTTP %s sin mostrar confirmación', (status, estado, mensaje) => {
    cargar();
    completar();
    component.enviar();
    http.expectOne('/api/postulaciones').flush({}, { status, statusText: 'Error' });
    fixture.detectChanges();
    expect(component.estado()).toBe(estado);
    expect(fixture.nativeElement.textContent).toContain(mensaje);
    expect(fixture.nativeElement.textContent).not.toContain(textos.exito);
    expect(component.enviando()).toBe(false);
  });

  it('conserva lo escrito ante un error de conexión y permite volver a enviar', () => {
    cargar();
    completar('Mi disponibilidad', 'Mi comentario');
    component.enviar();
    http.expectOne('/api/postulaciones').error(new ProgressEvent('error'));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain(textos.errorConexion);
    expect(component.formulario.getRawValue()).toEqual({ disponibilidad: 'Mi disponibilidad', comentario: 'Mi comentario' });
    component.enviar();
    confirmar();
    expect(component.estado()).toBe('EXITO');
  });

  it('una respuesta 200 no muestra éxito y exige consultar antes de otro envío', () => {
    cargar();
    completar();
    component.enviar();
    http.expectOne('/api/postulaciones').flush(respuesta({ estado: 'PENDIENTE' }));
    fixture.detectChanges();
    expect(component.estado()).toBe('ERROR_CARGA');
    expect(fixture.nativeElement.textContent).toContain(textos.respuestaInesperada);
    expect(fixture.nativeElement.textContent).not.toContain(textos.exito);
    component.enviar();
    http.expectNone('/api/postulaciones');
  });
});
