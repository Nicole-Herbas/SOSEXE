import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { RevisarPuntosComponent } from './revisar-puntos';
import { PuntoAyuda } from '../../models/registrar-punto.model';
import { IdiomaService } from '../../../../shared/services/idioma.service';
import textosEs from '../../../../../../public/i18n/es.json';
import textosEn from '../../../../../../public/i18n/en.json';

const PUNTO_PENDIENTE: PuntoAyuda = {
  id: 5, nombre: 'Punto solidario', tipo: 'PUNTO_DONACION', estadoVerificacion: 'PENDIENTE',
  descripcion: 'Recepción de alimentos\nIngreso por la puerta norte.', direccion: 'Av. América',
  ciudad: 'Cochabamba', departamentoNombre: 'Cochabamba', latitud: -17.3895, longitud: -66.1568,
  necesidadNombres: ['Agua', 'Alimentos'], nombreContacto: 'Persona responsable',
  telefonoContacto: '70700001', correoContacto: 'contacto@example.com',
};

describe('Revisión administrativa de puntos registrados', () => {
  let fixture: ComponentFixture<RevisarPuntosComponent>;
  let http: HttpTestingController;

  beforeEach(async () => {
    localStorage.removeItem('idioma_preferido');
    await TestBed.configureTestingModule({
      imports: [RevisarPuntosComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    fixture = TestBed.createComponent(RevisarPuntosComponent);
    http = TestBed.inject(HttpTestingController);
    http.match(req => req.url.startsWith('/i18n/')).forEach(req => req.flush(textosEs));
    fixture.detectChanges();
    http.expectOne('/api/departamentos').flush({ success: true, data: [{ id: 3, nombre: 'Cochabamba' }] });
  });

  afterEach(() => {
    http.verify();
    localStorage.removeItem('idioma_preferido');
  });

  it('carga la lista de pendientes al entrar a la sección', () => {
    const solicitud = http.expectOne('/api/puntos-ayuda/admin?estado=PENDIENTE');
    expect(solicitud.request.method).toBe('GET');
    solicitud.flush({ success: true, data: [PUNTO_PENDIENTE] });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Revisar puntos registrados');
    expect(fixture.nativeElement.textContent).toContain('Punto solidario');
    expect(fixture.nativeElement.querySelector('[data-testid="revisar-punto-5"]')).toBeTruthy();
  });

  it('combina estado, tipo, departamento y búsqueda, y permite restablecer pendientes', async () => {
    http.expectOne('/api/puntos-ayuda/admin?estado=PENDIENTE').flush({ success: true, data: [] });
    fixture.detectChanges();
    await seleccionar('#revision-estado', 'En revisión');
    await seleccionar('#revision-tipo', 'Emergencia');
    await seleccionar('#revision-departamento', 'Cochabamba');
    const busqueda = elemento<HTMLInputElement>('#revision-buscar');
    busqueda.value = '  Villa  ';
    busqueda.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    elemento<HTMLFormElement>('form').dispatchEvent(new Event('submit', { cancelable: true }));

    const solicitud = http.expectOne(req => req.url === '/api/puntos-ayuda/admin');
    expect(solicitud.request.params.get('estado')).toBe('EN_REVISION');
    expect(solicitud.request.params.get('tipo')).toBe('EMERGENCIA');
    expect(solicitud.request.params.get('departamentoId')).toBe('3');
    expect(solicitud.request.params.get('buscar')).toBe('Villa');
    solicitud.flush({ success: true, data: [] });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('No hay puntos que coincidan');

    elemento<HTMLButtonElement>('[data-testid="limpiar-filtros"]').click();
    const restablecida = http.expectOne('/api/puntos-ayuda/admin?estado=PENDIENTE');
    restablecida.flush({ success: true, data: [] });
    fixture.detectChanges();
    await fixture.whenStable();
    expect(elemento<HTMLInputElement>('#revision-buscar').value).toBe('');
  });

  it('abre el detalle administrativo y conserva la lista y los filtros al volver', async () => {
    http.expectOne('/api/puntos-ayuda/admin?estado=PENDIENTE').flush({ success: true, data: [] });
    fixture.detectChanges();
    await seleccionar('#revision-departamento', 'Cochabamba');
    elemento<HTMLFormElement>('form').dispatchEvent(new Event('submit', { cancelable: true }));
    http.expectOne('/api/puntos-ayuda/admin?estado=PENDIENTE&departamentoId=3')
      .flush({ success: true, data: [PUNTO_PENDIENTE] });
    fixture.detectChanges();
    elemento<HTMLButtonElement>('[data-testid="revisar-punto-5"]').click();
    const detalle = http.expectOne('/api/puntos-ayuda/admin/5');
    expect(detalle.request.method).toBe('GET');
    detalle.flush({ success: true, data: PUNTO_PENDIENTE });
    fixture.detectChanges();
    const texto = elemento<HTMLElement>('[data-testid="detalle-punto"]').textContent;
    for (const valor of ['Av. América', 'Agua', 'Persona responsable', '70700001', 'contacto@example.com', 'Pendiente de verificación']) {
      expect(texto).toContain(valor);
    }
    elemento<HTMLButtonElement>('[data-testid="volver-listado"]').click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-testid="detalle-punto"]')).toBeNull();
    expect(elemento<HTMLSelectElement>('#revision-departamento').selectedOptions[0].textContent).toBe('Cochabamba');
    expect(fixture.nativeElement.textContent).toContain('Punto solidario');
    http.expectNone(req => req.method !== 'GET');
  });

  it('actualiza textos y estados al cambiar al inglés usando los catálogos reales', () => {
    http.expectOne('/api/puntos-ayuda/admin?estado=PENDIENTE')
      .flush({ success: true, data: [PUNTO_PENDIENTE] });
    TestBed.inject(IdiomaService).setIdioma('en');
    http.expectOne('/i18n/en.json').flush(textosEn);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Review registered aid points');
    expect(fixture.nativeElement.textContent).toContain('Pending verification');
    expect(fixture.nativeElement.textContent).toContain('Apply filters');
  });

  it('distingue un fallo del listado de una lista sin pendientes y permite reintentar', () => {
    http.expectOne('/api/puntos-ayuda/admin?estado=PENDIENTE')
      .flush({}, { status: 503, statusText: 'Unavailable' });
    fixture.detectChanges();
    expect(elemento<HTMLElement>('[role="alert"]').textContent).toContain('No se pudieron cargar los puntos');
    expect(fixture.nativeElement.textContent).not.toContain('No hay puntos pendientes');
    const reintentar = Array.from(fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>)
      .find(boton => boton.textContent?.trim() === 'Reintentar');
    if (!reintentar) throw new Error('Falta la acción para reintentar');
    reintentar.click();
    http.expectOne('/api/puntos-ayuda/admin?estado=PENDIENTE').flush({ success: true, data: [] });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('No hay puntos pendientes de verificación.');
  });

  it.each([404, 503])('muestra el error %s del detalle sin mostrar información anterior', estado => {
    http.expectOne('/api/puntos-ayuda/admin?estado=PENDIENTE')
      .flush({ success: true, data: [PUNTO_PENDIENTE] });
    fixture.detectChanges();
    elemento<HTMLButtonElement>('[data-testid="revisar-punto-5"]').click();
    http.expectOne('/api/puntos-ayuda/admin/5').flush({}, { status: estado, statusText: 'Error' });
    fixture.detectChanges();
    const texto = elemento<HTMLElement>('[data-testid="detalle-punto"]').textContent;
    expect(texto).toContain(estado === 404 ? 'El punto ya no está disponible' : 'No se pudo cargar el detalle');
    expect(texto).not.toContain('contacto@example.com');
  });

  it('cancela el detalle anterior cuando se selecciona otro punto', () => {
    http.expectOne('/api/puntos-ayuda/admin?estado=PENDIENTE')
      .flush({ success: true, data: [PUNTO_PENDIENTE, { ...PUNTO_PENDIENTE, id: 6, nombre: 'Otro punto' }] });
    fixture.detectChanges();
    elemento<HTMLButtonElement>('[data-testid="revisar-punto-5"]').click();
    const anterior = http.expectOne('/api/puntos-ayuda/admin/5');
    elemento<HTMLButtonElement>('[data-testid="revisar-punto-6"]').click();
    expect(anterior.cancelled).toBe(true);
    http.expectOne('/api/puntos-ayuda/admin/6')
      .flush({ success: true, data: { ...PUNTO_PENDIENTE, id: 6, nombre: 'Otro punto' } });
    fixture.detectChanges();
    expect(elemento<HTMLElement>('[data-testid="detalle-punto"]').textContent).toContain('Otro punto');
  });

  it('representa el contenido registrado como texto, sin interpretar HTML', () => {
    http.expectOne('/api/puntos-ayuda/admin?estado=PENDIENTE')
      .flush({ success: true, data: [PUNTO_PENDIENTE] });
    fixture.detectChanges();
    elemento<HTMLButtonElement>('[data-testid="revisar-punto-5"]').click();
    http.expectOne('/api/puntos-ayuda/admin/5')
      .flush({ success: true, data: { ...PUNTO_PENDIENTE, descripcion: '<img src=x onerror=alert(1)>' } });
    fixture.detectChanges();
    const detalle = elemento<HTMLElement>('[data-testid="detalle-punto"]');
    expect(detalle.querySelector('img')).toBeNull();
    expect(detalle.textContent).toContain('<img src=x onerror=alert(1)>');
  });

  it('mantiene las mismas claves de revisión en español e inglés', () => {
    http.expectOne('/api/puntos-ayuda/admin?estado=PENDIENTE').flush({ success: true, data: [] });
    function claves(objeto: Record<string, unknown>, prefijo = ''): string[] {
      return Object.entries(objeto).flatMap(([clave, valor]) => {
        const ruta = `${prefijo}${clave}`;
        return valor && typeof valor === 'object'
          ? claves(valor as Record<string, unknown>, `${ruta}.`) : [ruta];
      }).sort();
    }
    expect(claves(textosEn.adminPuntos)).toEqual(claves(textosEs.adminPuntos));
  });

  function elemento<T extends HTMLElement>(selector: string): T {
    const encontrado = fixture.nativeElement.querySelector(selector) as T | null;
    if (!encontrado) throw new Error(`No se encontró ${selector}`);
    return encontrado;
  }

  async function seleccionar(selector: string, texto: string): Promise<void> {
    const select = elemento<HTMLSelectElement>(selector);
    const opcion = Array.from(select.options).find(item => item.textContent?.trim() === texto);
    if (!opcion) throw new Error(`No se encontró la opción ${texto}`);
    select.value = opcion.value;
    select.dispatchEvent(new Event('change'));
    await fixture.whenStable();
    fixture.detectChanges();
  }
});
