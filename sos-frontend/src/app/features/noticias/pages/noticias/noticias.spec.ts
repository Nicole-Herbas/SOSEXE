import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { NoticiaExterna } from '../../models/noticia.model';
import { Noticias } from './noticias';

const NOTICIA_EXTERNA: NoticiaExterna = {
  id: 'externa-1',
  titulo: 'Noticia de prueba',
  descripcion: 'Resumen de prueba',
  url: 'https://example.com/noticia',
  imagenUrl: null,
  fuente: 'Medio',
  categoria: 'community',
  pais: 'Bolivia',
  fechaPublicacion: '2026-09-21 09:00:00',
  esExterna: true,
};

function responderApiExterna(
  httpTesting: HttpTestingController,
  noticias: NoticiaExterna[] = [],
  apiDisponible = true,
  desdeCache = false,
): void {
  httpTesting.expectOne('/api/noticias/externas').flush({
    success: true,
    message: 'OK',
    data: { noticias, apiDisponible, desdeCache },
    timestamp: '',
  });
}

describe('Noticias', () => {
  let component: Noticias;
  let fixture: ComponentFixture<Noticias>;
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Noticias],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    })
      .compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(Noticias);
    component = fixture.componentInstance;
  });

  afterEach(() => httpTesting.verify());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('debe cargar noticias propias y externas al iniciar', () => {
    fixture.detectChanges();

    const propias = httpTesting.expectOne('/api/noticias/publicas');
    const externas = httpTesting.expectOne('/api/noticias/externas');

    propias.flush({
      success: true,
      message: 'OK',
      data: [],
      timestamp: '',
    });
    externas.flush({
      success: true,
      message: 'OK',
      data: { noticias: [NOTICIA_EXTERNA], apiDisponible: true, desdeCache: false },
      timestamp: '',
    });

    expect(component.cargando()).toBe(false);
    expect(component.error()).toBe(false);
    expect(component.noticias().length).toBe(1);
    expect(component.noticiasDestacadas()[0].titulo).toBe('Noticia de prueba');
  });

  it('debe filtrar noticias con categorías externas normalizadas', () => {
    fixture.detectChanges();
    httpTesting.expectOne('/api/noticias/publicas').flush({
      success: true,
      message: 'OK',
      data: [],
      timestamp: '',
    });
    responderApiExterna(httpTesting, [
      { ...NOTICIA_EXTERNA, titulo: 'Incendio externo', categoria: 'wildfires' },
      { ...NOTICIA_EXTERNA, id: 'inundacion-1', titulo: 'Inundación', categoria: 'flooding' },
    ]);
    fixture.detectChanges();

    const botones = fixture.nativeElement.querySelectorAll(
      'button.noticias-categoria',
    ) as NodeListOf<HTMLButtonElement>;
    const filtroIncendios = Array.from(botones).find(
      (boton) => boton.textContent?.trim() === 'Incendios',
    );
    filtroIncendios?.click();
    fixture.detectChanges();

    expect(filtroIncendios?.getAttribute('aria-pressed')).toBe('true');
    expect(fixture.nativeElement.querySelectorAll('.noticia-tarjeta').length).toBe(1);
    expect(fixture.nativeElement.textContent).toContain('Incendio externo');
    expect(fixture.nativeElement.textContent).not.toContain('Inundación');

    Array.from(botones)
      .find((boton) => boton.textContent?.trim() === 'Todas')
      ?.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.noticia-tarjeta').length).toBe(2);
  });

  it('debe mostrar la tarjeta de referencia al elegir Alertas', () => {
    fixture.detectChanges();
    httpTesting.expectOne('/api/noticias/publicas').flush({
      success: true,
      message: 'OK',
      data: [],
      timestamp: '',
    });
    responderApiExterna(httpTesting);
    fixture.detectChanges();

    const botones = fixture.nativeElement.querySelectorAll(
      'button.noticias-categoria',
    ) as NodeListOf<HTMLButtonElement>;
    Array.from(botones)
      .find((boton) => boton.textContent?.trim() === 'Alertas')
      ?.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.noticias-destacadas').textContent)
      .toContain(component.textos.alertaTituloReferencia);
  });

  it('debe ocultar filtros cuando el toggle de página está desactivado', () => {
    component.featureToggles.noticias.mostrarFiltros = false;
    fixture.detectChanges();
    httpTesting.expectOne('/api/noticias/publicas').flush({
      success: true,
      message: 'OK',
      data: [],
      timestamp: '',
    });
    responderApiExterna(httpTesting);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.noticias-categorias')).toBeNull();
  });

  it('debe distinguir fallo externo con caché en el banner', () => {
    fixture.detectChanges();
    httpTesting.expectOne('/api/noticias/publicas').flush({
      success: true,
      message: 'OK',
      data: [],
      timestamp: '',
    });
    responderApiExterna(httpTesting, [NOTICIA_EXTERNA], false, true);
    fixture.detectChanges();

    expect(component.apiNoDisponible()).toBe(true);
    expect(fixture.nativeElement.textContent)
      .toContain(component.textos.apiNoDisponibleCache);
    expect(fixture.nativeElement.textContent).toContain('Noticia de prueba');
  });

  it('debe omitir la solicitud de noticias propias al desactivar su toggle', () => {
    component.featureToggles.noticias.mostrarPropias = false;
    fixture.detectChanges();
    httpTesting.expectNone('/api/noticias/publicas');
    responderApiExterna(httpTesting, [NOTICIA_EXTERNA]);
    fixture.detectChanges();

    expect(component.noticias().length).toBe(1);
  });

  it('debe omitir la solicitud externa al desactivar su toggle', () => {
    component.featureToggles.noticias.mostrarExternas = false;
    fixture.detectChanges();
    httpTesting.expectOne('/api/noticias/publicas').flush({
      success: true,
      message: 'OK',
      data: [],
      timestamp: '',
    });
    httpTesting.expectNone('/api/noticias/externas');
    fixture.detectChanges();

    expect(component.apiNoDisponible()).toBe(false);
  });

  it('debe mostrar la alerta de referencia cuando el toggle está activo', () => {
    fixture.detectChanges();
    httpTesting.expectOne('/api/noticias/publicas').flush({
      success: true,
      message: 'OK',
      data: [],
      timestamp: '',
    });
    responderApiExterna(httpTesting);
    fixture.detectChanges();

    const alerta = fixture.nativeElement.querySelector('[data-alertas-referencia]');
    expect(alerta.textContent).toContain(component.textos.alertaTituloReferencia);
  });

  it('debe ocultar la alerta de referencia cuando el toggle está desactivado', () => {
    component.featureToggles.noticias.mostrarAlertas = false;
    fixture.detectChanges();
    httpTesting.expectOne('/api/noticias/publicas').flush({
      success: true,
      message: 'OK',
      data: [],
      timestamp: '',
    });
    responderApiExterna(httpTesting);
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelector('[data-alertas-referencia]'),
    ).toBeNull();
  });

  it('debe mostrar el estado vacío cuando las APIs no tienen noticias', () => {
    fixture.detectChanges();
    httpTesting.expectOne('/api/noticias/publicas').flush({
      success: true,
      message: 'OK',
      data: [],
      timestamp: '',
    });
    responderApiExterna(httpTesting);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain(component.textos.sinNoticias);
  });

  it('debe permitir reintentar cuando falla una API', () => {
    fixture.detectChanges();
    responderApiExterna(httpTesting);
    httpTesting.expectOne('/api/noticias/publicas').flush('Error', {
      status: 500,
      statusText: 'Error del servidor',
    });
    fixture.detectChanges();

    expect(component.error()).toBe(true);
    expect(fixture.nativeElement.textContent).toContain(component.textos.errorCarga);

    component.cargarNoticias();
    httpTesting.expectOne('/api/noticias/publicas').flush({
      success: true,
      message: 'OK',
      data: [],
      timestamp: '',
    });
    responderApiExterna(httpTesting);

    expect(component.error()).toBe(false);
    expect(component.cargando()).toBe(false);
  });

  it('debe abrir el enlace externo de la noticia en una pestaña segura', () => {
    fixture.detectChanges();
    httpTesting.expectOne('/api/noticias/publicas').flush({
      success: true,
      message: 'OK',
      data: [],
      timestamp: '',
    });
    responderApiExterna(httpTesting, [NOTICIA_EXTERNA]);
    fixture.detectChanges();

    const enlace: HTMLAnchorElement = fixture.nativeElement.querySelector(
      '.noticia-tarjeta__enlace',
    );
    expect(enlace.href).toBe('https://example.com/noticia');
    expect(enlace.target).toBe('_blank');
    expect(enlace.rel).toContain('noopener');
  });
});
