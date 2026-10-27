import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { CrearAlertaComponent } from './crear-alerta';

describe('CrearAlertaComponent', () => {
  let fixture: ComponentFixture<CrearAlertaComponent>;
  let component: CrearAlertaComponent;
  let http: HttpTestingController;
  const datos = {
    titulo: '  Crecida del río  ',
    departamentoId: 3,
    severidad: 'ALTA' as const,
    mensaje: '  Evitar cruzar el río.  ',
    fuente: '  SENAMHI  ',
    fechaPublicacion: '2026-10-15T09:00',
    fechaExpiracion: '2026-10-16T09:00',
  };
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearAlertaComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(CrearAlertaComponent);
    component = fixture.componentInstance;
    http = TestBed.inject(HttpTestingController);
    http.match(req => req.url.includes('/i18n/')).forEach(req => req.flush({}));
    fixture.detectChanges();
  });
  afterEach(() => http.verify());

  function cargarCatalogo(): void {
    http
      .expectOne('/api/departamentos')
      .flush({ success: true, data: [{ id: 3, nombre: 'Cochabamba' }] });
    component.formulario.setValue(datos);
  }

  it('envía los seis campos y confirma únicamente después de guardar', () => {
    cargarCatalogo();
    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));
    const request = http.expectOne('/api/alertas');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      titulo: 'Crecida del río',
      departamentoId: 3,
      severidad: 'ALTA',
      mensaje: 'Evitar cruzar el río.',
      fuente: 'SENAMHI',
      fechaPublicacion: '2026-10-15T09:00',
      fechaExpiracion: '2026-10-16T09:00',
    });
    expect(component.mensajeExito()).toBeNull();
    component.guardar();
    http.expectNone('/api/alertas');
    request.flush({ success: true, data: { id: 8, estado: 'BORRADOR' } });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Alerta creada');
  });

  it.each([
    { titulo: '   ' },
    { titulo: 't'.repeat(221) },
    { mensaje: '   ' },
    { mensaje: 'm'.repeat(1001) },
    { fuente: '   ' },
    { fuente: 'f'.repeat(251) },
    { departamentoId: null },
    { departamentoId: 999 },
    { severidad: null },
    { fechaPublicacion: '' },
    { fechaExpiracion: '' },
    { fechaExpiracion: '2026-10-15T09:00' },
    { fechaExpiracion: '2026-10-14T09:00' },
  ])('impide guardar campos inválidos: %o', (cambio) => {
    cargarCatalogo();
    component.formulario.patchValue(cambio);
    component.guardar();
    http.expectNone('/api/alertas');
    expect(component.mensajeExito()).toBeNull();
  });

  it('permite los límites de longitud aprobados', () => {
    cargarCatalogo();
    component.formulario.patchValue({
      titulo: 't'.repeat(220),
      mensaje: 'm'.repeat(1000),
      fuente: 'f'.repeat(250),
    });
    component.guardar();
    http.expectOne('/api/alertas').flush({ success: true, data: { id: 8 } });
    expect(component.mensajeExito()).toBeTruthy();
  });

  it('muestra errores del servidor y conserva el formulario para corregirlo', () => {
    cargarCatalogo();
    component.guardar();
    http.expectOne('/api/alertas').flush(
      {
        message: 'Error de validación',
        data: { fuente: 'La fuente es obligatoria' },
      },
      { status: 422, statusText: 'Unprocessable Content' },
    );
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('La fuente es obligatoria');
    expect(component.formulario.getRawValue()).toEqual(datos);
    expect(component.guardando()).toBe(false);
    expect(component.mensajeExito()).toBeNull();
    component.guardar();
    http.expectOne('/api/alertas').flush({ success: true, data: { id: 9 } });
    expect(component.mensajeExito()).toBeTruthy();
  });

  it('informa un fallo de red y permite reintentar sin perder datos', () => {
    cargarCatalogo();
    component.guardar();
    http.expectOne('/api/alertas').error(new ProgressEvent('error'));
    expect(component.mensajeError()).toBeTruthy();
    expect(component.guardando()).toBe(false);
    expect(component.formulario.getRawValue()).toEqual(datos);
  });

  it.each(['fallido', 'vacío'])('bloquea guardar cuando el catálogo está %s', (estado) => {
    const catalogo = http.expectOne('/api/departamentos');
    if (estado === 'fallido') catalogo.flush({}, { status: 503, statusText: 'Unavailable' });
    else catalogo.flush({ success: true, data: [] });
    component.formulario.setValue(datos);
    component.guardar();
    fixture.detectChanges();
    expect(component.errorDepartamentos()).toBeTruthy();
    expect(fixture.nativeElement.querySelector('fieldset').disabled).toBe(true);
    http.expectNone('/api/alertas');
  });

  it('no afirma éxito cuando el servidor devuelve success=false', () => {
    cargarCatalogo();
    component.guardar();
    http.expectOne('/api/alertas').flush({ success: false });
    expect(component.mensajeError()).toBeTruthy();
    expect(component.mensajeExito()).toBeNull();
    expect(component.formulario.getRawValue()).toEqual(datos);
  });
});
