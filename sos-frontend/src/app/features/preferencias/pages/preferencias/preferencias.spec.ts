import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';

import { PreferenciasComponent } from './preferencias';
import { IdiomaService } from '../../../../shared/services/idioma.service';

describe('PreferenciasComponent', () => {
  let component: PreferenciasComponent;
  let fixture: ComponentFixture<PreferenciasComponent>;
  let httpMock: HttpTestingController;

  const departamentos = [
    { id: 27, nombre: 'Departamento de prueba' }
  ];

  /** Responde las peticiones HTTP de inicio del componente. */
  function flushInit(): void {
    // IdiomaService carga traducciones al inicializar
    const i18nReq = httpMock.match(req => req.url.includes('/i18n/'));
    i18nReq.forEach(r => r.flush({}));

    httpMock.expectOne('/api/departamentos').flush({
      success: true,
      message: 'ok',
      data: departamentos,
      timestamp: ''
    });
    httpMock.expectOne('/api/suscripcion-sms/me').flush(
      { message: 'No hay suscripción' },
      { status: 404, statusText: 'Not Found' }
    );
  }

  beforeEach(async () => {
    localStorage.removeItem('idioma_preferido');

    await TestBed.configureTestingModule({
      imports: [PreferenciasComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PreferenciasComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);

    fixture.detectChanges();
    flushInit();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.removeItem('idioma_preferido');
  });

  // ── Tests existentes ────────────────────────────────────────────────────

  it('loads departments from the backend and enables the selector', () => {
    expect(component.departamentos).toEqual(departamentos);
    expect(component.formulario.get('departamentoId')?.enabled).toBe(true);
  });

  it('reports catalog loading errors and leaves the selector disabled', () => {
    const secondFixture = TestBed.createComponent(PreferenciasComponent);
    const secondComponent = secondFixture.componentInstance;
    secondFixture.detectChanges();

    const i18nReq = httpMock.match(req => req.url.includes('/i18n/'));
    i18nReq.forEach(r => r.flush({}));

    httpMock.expectOne('/api/departamentos').flush(
      { message: 'Unavailable' },
      { status: 503, statusText: 'Service Unavailable' }
    );
    httpMock.expectOne('/api/suscripcion-sms/me').flush(
      { message: 'No hay suscripción' },
      { status: 404, statusText: 'Not Found' }
    );

    expect(secondComponent.errorDepartamentos()).toBeTruthy();
    expect(secondComponent.formulario.get('departamentoId')?.disabled).toBe(true);
    secondFixture.destroy();
  });

  it('cancels an active subscription and retains its record as inactive', () => {
    component.suscripcionActual.set({
      departamentoId: 27,
      telefono: '71234567',
      activa: true
    });

    component.solicitarCancelacion();
    component.confirmarCancelacion();

    const request = httpMock.expectOne('/api/suscripcion-sms/me');
    expect(request.request.method).toBe('DELETE');
    request.flush({
      success: true,
      message: 'Suscripción SMS cancelada exitosamente',
      data: null,
      timestamp: ''
    });

    expect(component.suscripcionActual()?.activa).toBe(false);
    expect(component.mensajeExito()).toBeTruthy();
  });

  // ── SOS-114: Tests del selector de idioma ──────────────────────────────

  it('SOS-114: el idioma activo por defecto es espanol', () => {
    const idiomaService = TestBed.inject(IdiomaService);
    expect(idiomaService.idioma$()).toBe('es');
    expect(component.idiomaActual()).toBe('es');
  });

  it('SOS-114: cambiarIdioma actualiza el idioma a ingles', fakeAsync(() => {
    component.cambiarIdioma('en');

    const enReq = httpMock.match(req => req.url.includes('/i18n/en.json'));
    enReq.forEach(r => r.flush({ 'navbar.lema': 'Together against natural disasters' }));
    tick();

    expect(component.idiomaActual()).toBe('en');
  }));

  it('SOS-114: cambiarIdioma muestra confirmacion y la oculta tras 3 segundos', fakeAsync(() => {
    component.cambiarIdioma('en');

    const enReq = httpMock.match(req => req.url.includes('/i18n/en.json'));
    enReq.forEach(r => r.flush({}));
    tick();

    expect(component.mensajeIdiomaGuardado()).toBe(true);

    tick(3000);
    expect(component.mensajeIdiomaGuardado()).toBe(false);
  }));

  it('SOS-114: volver a espanol restaura el idioma y el localStorage', fakeAsync(() => {
    component.cambiarIdioma('en');
    httpMock.match(r => r.url.includes('/i18n/en.json')).forEach(r => r.flush({}));
    tick();

    component.cambiarIdioma('es');
    httpMock.match(r => r.url.includes('/i18n/es.json')).forEach(r => r.flush({}));
    tick();

    expect(component.idiomaActual()).toBe('es');
    expect(localStorage.getItem('idioma_preferido')).toBe('es');
  }));

  it('SOS-114: los botones de idioma estan presentes en el template', () => {
    fixture.detectChanges();
    const compiled: HTMLElement = fixture.nativeElement;
    expect(compiled.querySelector('#btn-idioma-es')).toBeTruthy();
    expect(compiled.querySelector('#btn-idioma-en')).toBeTruthy();
  });
});
