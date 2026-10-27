import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { RevisarAlertasComponent } from './revisar-alertas';

describe('Revisión de alertas antes de publicar', () => {
  let fixture: ComponentFixture<RevisarAlertasComponent>;
  let http: HttpTestingController;
  const borrador = {
    id: 8,
    version: 0,
    estado: 'BORRADOR',
    titulo: 'Crecida del río',
    departamentoId: 3,
    departamentoNombre: 'Cochabamba',
    severidad: 'ALTA',
    mensaje: 'Evitar cruzar el río.\nUsar rutas alternativas.',
    fuente: 'SENAMHI',
    fechaPublicacion: '2027-10-15T09:00:00',
    fechaExpiracion: '2027-10-16T09:00:00',
    creadoPorId: 2,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RevisarAlertasComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(RevisarAlertasComponent);
    http = TestBed.inject(HttpTestingController);
    http.match(req => req.url.includes('/i18n/')).forEach(req => req.flush({}));
    fixture.detectChanges();
    http.expectOne('/api/alertas/borradores').flush({ success: true, data: [borrador] });
    fixture.detectChanges();
  });
  afterEach(() => http.verify());

  function abrirVistaPrevia(): void {
    fixture.nativeElement.querySelector('[data-testid="revisar-8"]').click();
    http.expectOne('/api/alertas/8/revision').flush({ success: true, data: borrador });
    fixture.detectChanges();
  }

  it('muestra los datos guardados sin publicar y exige confirmación explícita', () => {
    abrirVistaPrevia();
    const texto = fixture.nativeElement.textContent;
    for (const valor of [
      'Crecida del río',
      'Cochabamba',
      'ALTA',
      'Evitar cruzar el río.',
      'SENAMHI',
    ]) {
      expect(texto).toContain(valor);
    }
    expect(texto).toContain('15/10/2027');
    expect(texto).toContain('16/10/2027');
    const publicar = fixture.nativeElement.querySelector('[data-testid="publicar"]');
    expect(publicar.disabled).toBe(true);
    http.expectNone('/api/alertas/8/publicar');
    const casilla = fixture.nativeElement.querySelector('input[type="checkbox"]');
    casilla.click();
    fixture.detectChanges();
    expect(publicar.disabled).toBe(false);
    publicar.click();
    const solicitud = http.expectOne('/api/alertas/8/publicar');
    expect(solicitud.request.method).toBe('POST');
    expect(solicitud.request.body).toEqual({ confirmado: true, version: 0 });
    fixture.detectChanges();
    expect(publicar.disabled).toBe(true);
    expect(fixture.nativeElement.textContent).not.toContain('Alerta publicada correctamente.');
    solicitud.flush({ success: true, data: { ...borrador, estado: 'ACTIVA', version: 1 } });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Alerta publicada correctamente.');
    expect(fixture.nativeElement.querySelector('[data-testid="publicar"]')).toBeNull();
  });

  it('volver sin confirmar conserva el borrador y no publica', () => {
    abrirVistaPrevia();
    fixture.nativeElement.querySelector('input[type="checkbox"]').click();
    fixture.nativeElement.querySelector('.secundario').click();
    http.expectOne('/api/alertas/borradores').flush({ success: true, data: [borrador] });
    fixture.detectChanges();
    http.expectNone('/api/alertas/8/publicar');
    expect(fixture.nativeElement.querySelector('[data-testid="revisar-8"]')).toBeTruthy();
    abrirVistaPrevia();
    expect(fixture.nativeElement.querySelector('input[type="checkbox"]').checked).toBe(false);
    expect(fixture.nativeElement.querySelector('[data-testid="publicar"]').disabled).toBe(true);
  });

  it('no envía solicitudes sin confirmación ni duplica la publicación en curso', () => {
    abrirVistaPrevia();
    fixture.componentInstance.publicar();
    http.expectNone('/api/alertas/8/publicar');
    fixture.nativeElement.querySelector('input[type="checkbox"]').click();
    fixture.detectChanges();
    fixture.nativeElement.querySelector('[data-testid="publicar"]').click();
    const solicitud = http.expectOne('/api/alertas/8/publicar');
    fixture.componentInstance.publicar();
    fixture.componentInstance.volver();
    fixture.detectChanges();
    http.expectNone('/api/alertas/8/publicar');
    expect(fixture.nativeElement.querySelector('.secundario').disabled).toBe(true);
    solicitud.flush({ success: true, data: { ...borrador, estado: 'ACTIVA', version: 1 } });
    fixture.detectChanges();
    fixture.componentInstance.publicar();
    http.expectNone('/api/alertas/8/publicar');
  });

  it('un conflicto exige cargar y confirmar la versión actual', () => {
    abrirVistaPrevia();
    fixture.nativeElement.querySelector('input[type="checkbox"]').click();
    fixture.detectChanges();
    fixture.nativeElement.querySelector('[data-testid="publicar"]').click();
    http
      .expectOne('/api/alertas/8/publicar')
      .flush(
        { success: false, message: 'Versión anterior' },
        { status: 409, statusText: 'Conflict' },
      );
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('La alerta cambió o ya fue publicada.');
    expect(fixture.nativeElement.querySelector('input[type="checkbox"]').disabled).toBe(true);
    fixture.componentInstance.publicar();
    http.expectNone('/api/alertas/8/publicar');
    fixture.nativeElement.querySelector('[data-testid="recargar-revision"]').click();
    http.expectOne('/api/alertas/8/revision').flush({
      success: true,
      data: { ...borrador, titulo: 'Crecida corregida', version: 1 },
    });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Crecida corregida');
    expect(fixture.nativeElement.querySelector('[data-testid="publicar"]').disabled).toBe(true);
    fixture.nativeElement.querySelector('input[type="checkbox"]').click();
    fixture.detectChanges();
    fixture.nativeElement.querySelector('[data-testid="publicar"]').click();
    const solicitud = http.expectOne('/api/alertas/8/publicar');
    expect(solicitud.request.body).toEqual({ confirmado: true, version: 1 });
    solicitud.flush({ success: true, data: { ...borrador, estado: 'ACTIVA', version: 2 } });
  });

  it.each(['red', 'servidor', 'success=false'])(
    'un fallo %s no afirma éxito y requiere recarga',
    (tipo) => {
      abrirVistaPrevia();
      fixture.nativeElement.querySelector('input[type="checkbox"]').click();
      fixture.detectChanges();
      fixture.nativeElement.querySelector('[data-testid="publicar"]').click();
      const solicitud = http.expectOne('/api/alertas/8/publicar');
      if (tipo === 'red') solicitud.error(new ProgressEvent('error'));
      else if (tipo === 'servidor') solicitud.flush({}, { status: 500, statusText: 'Error' });
      else solicitud.flush({ success: false });
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeTruthy();
      expect(fixture.nativeElement.textContent).not.toContain('Alerta publicada correctamente.');
      expect(fixture.nativeElement.textContent).toContain('Crecida del río');
      expect(fixture.nativeElement.querySelector('[data-testid="publicar"]').disabled).toBe(true);
      expect(fixture.nativeElement.querySelector('input[type="checkbox"]').checked).toBe(false);
    },
  );

  it('una alerta publicada por otra persona no ofrece volver a publicar', () => {
    fixture.nativeElement.querySelector('[data-testid="revisar-8"]').click();
    http.expectOne('/api/alertas/8/revision').flush({
      success: true,
      data: { ...borrador, estado: 'ACTIVA', version: 1 },
    });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-testid="publicar"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('input[type="checkbox"]')).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Esta alerta ya no es un borrador');
    http.expectNone('/api/alertas/8/publicar');
  });

  it('informa errores de vista previa sin ofrecer publicación', () => {
    fixture.nativeElement.querySelector('[data-testid="revisar-8"]').click();
    http.expectOne('/api/alertas/8/revision').flush({}, { status: 404, statusText: 'Not Found' });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('No se pudo cargar la vista previa');
    expect(fixture.nativeElement.querySelector('[data-testid="publicar"]')).toBeNull();
  });

  it('distingue un listado vacío de un error y permite reintentar', () => {
    fixture.componentInstance.cargarBorradores();
    http.expectOne('/api/alertas/borradores').flush({}, { status: 503, statusText: 'Unavailable' });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('No se pudieron cargar los borradores');
    expect(fixture.nativeElement.textContent).not.toContain('No hay alertas pendientes');
    fixture.nativeElement.querySelector('button').click();
    http.expectOne('/api/alertas/borradores').flush({ success: true, data: [] });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain(
      'No hay alertas pendientes de publicación.',
    );
  });

  it('representa contenido de la alerta como texto sin ejecutar HTML', () => {
    fixture.nativeElement.querySelector('[data-testid="revisar-8"]').click();
    http.expectOne('/api/alertas/8/revision').flush({
      success: true,
      data: { ...borrador, mensaje: '<img src="x" onerror="alert(1)">' },
    });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('article img')).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('<img src="x" onerror="alert(1)">');
  });
});
