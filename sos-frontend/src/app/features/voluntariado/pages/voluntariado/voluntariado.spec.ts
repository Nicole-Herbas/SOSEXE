import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { By } from '@angular/platform-browser';
import { of, throwError } from 'rxjs';

import { APP_TEXTOS } from '../../../../shared/constants/app-textos.constants';
import { ApiResponse } from '../../../../shared/models/api-response';
import { Voluntariado } from './voluntariado';
import { AuthService } from '../../../auth/services/auth.service';
import { PerfilVoluntarioService } from '../../services/perfil-voluntario.service';
import { OportunidadVoluntariado } from '../../models/oportunidad-voluntariado';
import { PerfilVoluntario } from '../../models/perfil-voluntario';
import { CrearPerfilComponent } from '../../components/crear-perfil/crear-perfil';

const OPORTUNIDAD: OportunidadVoluntariado = {
  id: 7,
  titulo: 'Clasificar donaciones',
  descripcion: 'Organizar ropa y alimentos para las familias',
  fechaInicio: '2026-10-15T09:00:00',
  fechaFin: '2026-10-15T16:00:00',
  habilidadesRequeridas: 'Organización',
  estado: 'PUBLICADO',
  centroId: 2,
  creadoPorId: 4,
  centroNombre: 'Centro comunitario',
  centroCiudad: 'El Alto',
  centroDepartamento: 'La Paz',
};

const PERFIL: PerfilVoluntario = {
  id: 1,
  telefono: '70123456',
  emailContacto: 'voluntaria@example.com',
  departamentoId: 2,
  departamentoNombre: 'La Paz',
  ciudad: 'El Alto',
  habilidades: ['Logística'],
  disponibilidad: ['Fines de semana'],
};

function respuesta<T>(data: T): ApiResponse<T> {
  return { success: true, data, message: 'OK', timestamp: '' };
}

describe('Voluntariado', () => {
  let component: Voluntariado;
  let fixture: ComponentFixture<Voluntariado>;
  let httpTesting: HttpTestingController;
  let authServiceMock: {
    estaAutenticado: ReturnType<typeof vi.fn>;
    obtenerNombreUsuario: ReturnType<typeof vi.fn>;
  };
  let perfilServiceMock: {
    existeMiPerfil: ReturnType<typeof vi.fn>;
    obtenerMiPerfil: ReturnType<typeof vi.fn>;
    crear: ReturnType<typeof vi.fn>;
    actualizar: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    authServiceMock = {
      estaAutenticado: vi.fn(() => false),
      obtenerNombreUsuario: vi.fn(() => 'María'),
    };
    perfilServiceMock = {
      existeMiPerfil: vi.fn(() => of(respuesta(false))),
      obtenerMiPerfil: vi.fn(() => of(respuesta(PERFIL))),
      crear: vi.fn(() => of(respuesta(PERFIL))),
      actualizar: vi.fn(() => of(respuesta(PERFIL))),
    };

    await TestBed.configureTestingModule({
      imports: [Voluntariado],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authServiceMock },
        { provide: PerfilVoluntarioService, useValue: perfilServiceMock },
      ],
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(Voluntariado);
    component = fixture.componentInstance;
  });

  afterEach(() => httpTesting.verify());

  function cargarOportunidades(oportunidades: OportunidadVoluntariado[] = [OPORTUNIDAD]): void {
    fixture.detectChanges();
    httpTesting.expectOne('/api/voluntariados').flush(respuesta(oportunidades));
    fixture.detectChanges();
  }

  function obtenerWizard(): CrearPerfilComponent {
    return fixture.debugElement.query(By.directive(CrearPerfilComponent)).componentInstance;
  }

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debe mostrar el título principal del hero desde APP_TEXTOS', () => {
    cargarOportunidades();
    const h1: HTMLElement = fixture.nativeElement.querySelector('.vol-hero__title');
    expect(h1.textContent?.trim()).toContain(APP_TEXTOS.voluntariado.hero.titulo);
  });

  it('debe mostrar el badge del hero con el texto correcto', () => {
    cargarOportunidades();
    const badge: HTMLElement = fixture.nativeElement.querySelector('.vol-hero__badge');
    expect(badge.textContent).toContain(APP_TEXTOS.voluntariado.hero.badge);
  });

  it('debe consultar oportunidades sin sesión y sin solicitar el perfil', () => {
    cargarOportunidades();
    expect(component.estado()).toBe('SIN_SESION');
    expect(component.oportunidades()).toEqual([OPORTUNIDAD]);
    expect(perfilServiceMock.existeMiPerfil).not.toHaveBeenCalled();
    expect(perfilServiceMock.obtenerMiPerfil).not.toHaveBeenCalled();
  });

  it('debe mostrar el enlace a /login cuando no hay sesión', () => {
    cargarOportunidades();
    const link: HTMLAnchorElement = fixture.nativeElement.querySelector('.vol-hero__actions .btn--primary');
    expect(link.textContent?.trim()).toContain(APP_TEXTOS.voluntariado.hero.serVoluntario);
    expect(link.getAttribute('href')).toBe('/login');
  });

  it('debe renderizar las tarjetas recibidas con actividad, centro, ubicación, descripción y fechas en español', () => {
    cargarOportunidades([
      OPORTUNIDAD,
      { ...OPORTUNIDAD, id: 8, titulo: 'Preparar alimentos', centroNombre: 'Comedor comunitario' },
    ]);

    const tarjetas = fixture.nativeElement.querySelectorAll('.vol-card') as NodeListOf<HTMLElement>;
    expect(tarjetas.length).toBe(2);
    expect(tarjetas[0].querySelector('h3')?.textContent).toBe(OPORTUNIDAD.titulo);
    expect(tarjetas[0].querySelector('.vol-card__centro')?.textContent).toContain(OPORTUNIDAD.centroNombre);
    expect(tarjetas[0].querySelector('.vol-card__location')?.textContent).toContain('El Alto, La Paz');
    expect(tarjetas[0].querySelector('.vol-card__desc')?.textContent).toBe(OPORTUNIDAD.descripcion);
    const fechas = tarjetas[0].querySelectorAll('time');
    expect(fechas[0].getAttribute('datetime')).toBe(OPORTUNIDAD.fechaInicio);
    expect(fechas[0].textContent).toContain('15 de octubre de 2026');
    expect(fechas[0].textContent).toContain('09:00');
    expect(fechas[1].getAttribute('datetime')).toBe(OPORTUNIDAD.fechaFin);
    expect(fechas[1].textContent).toContain('15 de octubre de 2026');
    expect(fechas[1].textContent).toContain('16:00');
    expect(fechas[0].previousElementSibling?.textContent).toContain('Inicio:');
    expect(fechas[1].previousElementSibling?.textContent).toContain('Finalización:');
    expect(tarjetas[1].textContent).toContain('Preparar alimentos');
    expect(tarjetas[1].textContent).toContain('Comedor comunitario');
  });

  it('debe mostrar carga mientras espera la respuesta sin mostrar una lista vacía', () => {
    fixture.detectChanges();
    expect(component.cargandoOportunidades()).toBe(true);
    const seccion: HTMLElement = fixture.nativeElement.querySelector('.vol-oportunidades');
    expect(seccion.getAttribute('aria-busy')).toBe('true');
    expect(seccion.querySelector('[role="status"]')?.textContent).toContain(APP_TEXTOS.voluntariado.oportunidades.cargando);
    expect(seccion.textContent).not.toContain(APP_TEXTOS.voluntariado.oportunidades.sinOportunidades);
    expect(seccion.querySelector('.vol-card')).toBeNull();

    httpTesting.expectOne('/api/voluntariados').flush(respuesta([OPORTUNIDAD]));
    fixture.detectChanges();
    expect(component.cargandoOportunidades()).toBe(false);
    expect(seccion.getAttribute('aria-busy')).toBe('false');
    expect(seccion.querySelector('[role="status"]')).toBeNull();
    expect(seccion.querySelector('.vol-card')).not.toBeNull();
  });

  it('debe mostrar el error HTTP sin tarjetas estáticas ni mensaje de lista vacía', () => {
    fixture.detectChanges();
    httpTesting.expectOne('/api/voluntariados').flush('Error', { status: 500, statusText: 'Server Error' });
    fixture.detectChanges();

    expect(component.cargandoOportunidades()).toBe(false);
    expect(component.errorOportunidades()).toBe(true);
    expect(fixture.nativeElement.querySelector('[role="alert"]')?.textContent).toContain(APP_TEXTOS.voluntariado.oportunidades.errorCarga);
    expect(fixture.nativeElement.querySelector('.vol-card')).toBeNull();
    expect(fixture.nativeElement.textContent).not.toContain(APP_TEXTOS.voluntariado.oportunidades.sinOportunidades);
  });

  it('debe mostrar un mensaje cuando no hay oportunidades publicadas', () => {
    cargarOportunidades([]);
    expect(component.errorOportunidades()).toBe(false);
    expect(component.cargandoOportunidades()).toBe(false);
    expect(fixture.nativeElement.querySelector('.vol-oportunidades [role="status"]')?.textContent).toContain(APP_TEXTOS.voluntariado.oportunidades.sinOportunidades);
    expect(fixture.nativeElement.querySelector('.vol-card')).toBeNull();
  });

  it('debe manejar ubicación parcial o nula sin mostrar null ni separadores sobrantes', () => {
    cargarOportunidades([
      { ...OPORTUNIDAD, centroDepartamento: null },
      { ...OPORTUNIDAD, id: 8, centroCiudad: null },
      { ...OPORTUNIDAD, id: 9, centroNombre: null, centroCiudad: null, centroDepartamento: null },
    ]);
    const ubicaciones = fixture.nativeElement.querySelectorAll('.vol-card__location') as NodeListOf<HTMLElement>;
    expect(ubicaciones[0].textContent?.trim()).toBe('⌖ El Alto');
    expect(ubicaciones[1].textContent?.trim()).toBe('⌖ La Paz');
    expect(ubicaciones[2].textContent).toContain(APP_TEXTOS.voluntariado.oportunidades.ubicacionNoDisponible);
    expect(fixture.nativeElement.querySelectorAll('.vol-card__centro')[2].textContent).toContain(APP_TEXTOS.voluntariado.oportunidades.centroNoDisponible);
    expect(fixture.nativeElement.querySelector('.vol-cards').textContent).not.toContain('null');
  });

  it('debe mostrar la sección ¿Cómo funciona? con los tres pasos', () => {
    cargarOportunidades();
    const titulo: HTMLElement = fixture.nativeElement.querySelector('.vol-como__title');
    expect(titulo.textContent?.trim()).toContain(APP_TEXTOS.voluntariado.comoFunciona.titulo);
    expect(fixture.nativeElement.querySelectorAll('.vol-como__step').length).toBe(3);
  });

  it('debe ocultar oportunidades y no consultar la API cuando el toggle está desactivado', () => {
    component.featureToggles.voluntariado.mostrarSeccionOportunidades = false;
    fixture.detectChanges();
    httpTesting.expectNone('/api/voluntariados');
    expect(component.cargandoOportunidades()).toBe(false);
    expect(fixture.nativeElement.querySelector('.vol-oportunidades')).toBeNull();
    expect(fixture.nativeElement.querySelector('.vol-como')).not.toBeNull();
  });

  it('debe ocultar ¿Cómo funciona? sin ocultar oportunidades', () => {
    component.featureToggles.voluntariado.mostrarSeccionComoFunciona = false;
    cargarOportunidades();
    expect(fixture.nativeElement.querySelector('.vol-como')).toBeNull();
    expect(fixture.nativeElement.querySelectorAll('.vol-card').length).toBe(1);
  });

  it.each([true, false])('no debe mostrar cupos ficticios ni botones de participación con mostrarCupos=%s', (mostrarCupos) => {
    component.featureToggles.voluntariado.mostrarCupos = mostrarCupos;
    cargarOportunidades();
    expect(fixture.nativeElement.querySelector('.vol-card__cupos')).toBeNull();
    expect(fixture.nativeElement.querySelector('.vol-card button')).toBeNull();
    expect(fixture.nativeElement.querySelectorAll('.vol-card').length).toBe(1);
  });

  it('debe cargar el perfil autenticado y las oportunidades de forma independiente', () => {
    authServiceMock.estaAutenticado.mockReturnValue(true);
    perfilServiceMock.existeMiPerfil.mockReturnValue(of(respuesta(true)));
    cargarOportunidades();
    expect(perfilServiceMock.existeMiPerfil).toHaveBeenCalledOnce();
    expect(perfilServiceMock.obtenerMiPerfil).toHaveBeenCalledOnce();
    expect(component.estado()).toBe('CON_PERFIL');
    expect(fixture.nativeElement.querySelector('app-tarjeta-perfil')?.textContent).toContain(PERFIL.telefono);
    expect(fixture.nativeElement.querySelector('.vol-card')).not.toBeNull();
  });

  it('debe permitir crear el perfil desde el wizard y mantener las oportunidades', () => {
    authServiceMock.estaAutenticado.mockReturnValue(true);
    cargarOportunidades();
    expect(component.estado()).toBe('SIN_PERFIL');
    fixture.nativeElement.querySelector('.vol-hero__actions button').click();
    fixture.detectChanges();

    const wizard = obtenerWizard();
    expect(wizard.esEdicion).toBe(false);
    wizard.datosForm.setValue({
      telefono: PERFIL.telefono, emailContacto: PERFIL.emailContacto,
      departamentoId: PERFIL.departamentoId, ciudad: PERFIL.ciudad,
    });
    wizard.habilidadesSeleccionadas = [...PERFIL.habilidades];
    wizard.disponibilidadSeleccionada = [...PERFIL.disponibilidad];
    wizard.onSubmit();
    fixture.detectChanges();

    expect(perfilServiceMock.crear).toHaveBeenCalledWith({
      telefono: PERFIL.telefono, emailContacto: PERFIL.emailContacto,
      departamentoId: PERFIL.departamentoId, ciudad: PERFIL.ciudad,
      habilidades: PERFIL.habilidades, disponibilidad: PERFIL.disponibilidad,
    });
    expect(component.estado()).toBe('CON_PERFIL');
    expect(fixture.nativeElement.querySelector('app-tarjeta-perfil')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.vol-exito')?.textContent).toContain('María');
    expect(fixture.nativeElement.querySelector('.vol-card')).not.toBeNull();
  });

  it('debe permitir editar el perfil existente y recargar los datos guardados', () => {
    authServiceMock.estaAutenticado.mockReturnValue(true);
    perfilServiceMock.existeMiPerfil.mockReturnValue(of(respuesta(true)));
    cargarOportunidades();
    fixture.nativeElement.querySelector('.tarjeta__editar').click();
    fixture.detectChanges();

    const wizard = obtenerWizard();
    expect(wizard.esEdicion).toBe(true);
    expect(wizard.datosForm.value.telefono).toBe(PERFIL.telefono);
    wizard.datosForm.patchValue({ telefono: '70987654' });
    perfilServiceMock.obtenerMiPerfil.mockReturnValue(of(respuesta({ ...PERFIL, telefono: '70987654' })));
    wizard.onSubmit();
    fixture.detectChanges();

    expect(perfilServiceMock.actualizar).toHaveBeenCalledWith(expect.objectContaining({ telefono: '70987654' }));
    expect(perfilServiceMock.crear).not.toHaveBeenCalled();
    expect(component.estado()).toBe('CON_PERFIL');
    expect(fixture.nativeElement.querySelector('app-tarjeta-perfil')?.textContent).toContain('70987654');
    expect(fixture.nativeElement.querySelector('.vol-card')).not.toBeNull();
  });

  it.each([false, true])('debe cancelar el wizard y volver al estado correspondiente con perfil=%s', (conPerfil) => {
    authServiceMock.estaAutenticado.mockReturnValue(true);
    perfilServiceMock.existeMiPerfil.mockReturnValue(of(respuesta(conPerfil)));
    cargarOportunidades();
    fixture.nativeElement.querySelector(conPerfil ? '.tarjeta__editar' : '.vol-hero__actions button').click();
    fixture.detectChanges();
    obtenerWizard().cancelar.emit();
    fixture.detectChanges();

    expect(component.estado()).toBe(conPerfil ? 'CON_PERFIL' : 'SIN_PERFIL');
    expect(fixture.nativeElement.querySelector('app-crear-perfil')).toBeNull();
    expect(fixture.nativeElement.querySelector('.vol-card')).not.toBeNull();
    expect(perfilServiceMock.crear).not.toHaveBeenCalled();
    expect(perfilServiceMock.actualizar).not.toHaveBeenCalled();
  });

  it('debe mantener visible el perfil si falla la consulta de oportunidades', () => {
    authServiceMock.estaAutenticado.mockReturnValue(true);
    perfilServiceMock.existeMiPerfil.mockReturnValue(of(respuesta(true)));
    fixture.detectChanges();
    httpTesting.expectOne('/api/voluntariados').flush('Error', { status: 503, statusText: 'Service Unavailable' });
    fixture.detectChanges();

    expect(component.estado()).toBe('CON_PERFIL');
    expect(fixture.nativeElement.querySelector('app-tarjeta-perfil')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.vol-oportunidades [role="alert"]')).not.toBeNull();
  });

  it('debe mostrar oportunidades aunque falle la consulta de perfil', () => {
    authServiceMock.estaAutenticado.mockReturnValue(true);
    perfilServiceMock.existeMiPerfil.mockReturnValue(throwError(() => new Error('Perfil no disponible')));
    cargarOportunidades();

    expect(component.estado()).toBe('SIN_PERFIL');
    expect(component.errorOportunidades()).toBe(false);
    expect(fixture.nativeElement.querySelector('.vol-card')).not.toBeNull();
  });

  it('debe respetar el toggle de perfil sin ocultar oportunidades', () => {
    authServiceMock.estaAutenticado.mockReturnValue(true);
    perfilServiceMock.existeMiPerfil.mockReturnValue(of(respuesta(true)));
    component.featureToggles.voluntariado.mostrarPerfilVoluntario = false;
    cargarOportunidades();

    expect(fixture.nativeElement.querySelector('app-tarjeta-perfil')).toBeNull();
    expect(fixture.nativeElement.querySelector('.vol-card')).not.toBeNull();
  });
});
