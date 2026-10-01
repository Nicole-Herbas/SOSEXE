import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { Inicio } from './inicio';

const NOTICIA_EXTERNA = {
  id: 'externa-1',
  titulo: 'Incendio externo',
  descripcion: 'Resumen externo',
  url: 'https://example.com/incendio',
  imagenUrl: null,
  fuente: 'Medio',
  categoria: 'wildfires',
  pais: 'Bolivia',
  fechaPublicacion: '2026-09-21 09:00:00',
  esExterna: true as const,
};

function responderApiExterna(
  httpTesting: HttpTestingController,
  apiDisponible = true,
  desdeCache = false,
): void {
  httpTesting.expectOne('/api/noticias/externas').flush({
    success: true,
    message: 'OK',
    data: { noticias: [NOTICIA_EXTERNA], apiDisponible, desdeCache },
    timestamp: '',
  });
}

describe('Inicio', () => {

  let component: Inicio;
  let fixture: ComponentFixture<Inicio>;
  let httpTesting: HttpTestingController;

  beforeEach(async () => {

    await TestBed.configureTestingModule({
      imports: [Inicio],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Inicio);
    component = fixture.componentInstance;
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('debe cargar noticias del servicio compartido al iniciar', () => {
    fixture.detectChanges();
    httpTesting.expectOne('/api/noticias/publicas').flush({
      success: true,
      message: 'OK',
      data: [],
      timestamp: '',
    });
    responderApiExterna(httpTesting);
    fixture.detectChanges();

    expect(component.allNews().length).toBe(1);
    expect(fixture.nativeElement.textContent).toContain('Incendio externo');
  });

  it('debe ocultar la sección y no consultar APIs si el toggle maestro está apagado', () => {
    component.featureToggles.inicio.mostrarSeccionNoticias = false;
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.news-section')).toBeNull();
    httpTesting.expectNone('/api/noticias/publicas');
    httpTesting.expectNone('/api/noticias/externas');
  });

  it('debe aplicar el filtro compartido a las noticias reales', () => {
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
      'button.filter-btn',
    ) as NodeListOf<HTMLButtonElement>;
    Array.from(botones)
      .find((boton) => boton.textContent?.trim() === 'Incendios')
      ?.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('.news-card').length).toBe(1);
    expect(fixture.nativeElement.textContent).toContain('Incendio externo');
  });

  it('debe mantener el filtro Alertas alineado con la tarjeta de referencia', () => {
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
      'button.filter-btn',
    ) as NodeListOf<HTMLButtonElement>;
    Array.from(botones)
      .find((boton) => boton.textContent?.trim() === 'Alertas')
      ?.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Inundaciones en zonas cercanas');
  });

  it('debe ocultar filtros y omitir la fuente externa según sus toggles', () => {
    component.featureToggles.inicio.mostrarFiltrosNoticias = false;
    component.featureToggles.inicio.mostrarNoticiasExternas = false;
    fixture.detectChanges();

    httpTesting.expectOne('/api/noticias/publicas').flush({
      success: true,
      message: 'OK',
      data: [],
      timestamp: '',
    });
    httpTesting.expectNone('/api/noticias/externas');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.news-section__filters')).toBeNull();
  });

  it('debe mostrar el aviso si el backend informa que NewsData no está disponible', () => {
    fixture.detectChanges();
    httpTesting.expectOne('/api/noticias/publicas').flush({
      success: true,
      message: 'OK',
      data: [],
      timestamp: '',
    });
    responderApiExterna(httpTesting, false);
    fixture.detectChanges();

    expect(component.apiNoDisponible()).toBe(true);
    expect(fixture.nativeElement.textContent).toContain(
      component.textosNoticias.apiNoDisponible,
    );
  });

  it('debe mostrar error si falla la fuente propia en vez de afirmar que no hay noticias', () => {
    fixture.detectChanges();
    const propias = httpTesting.expectOne('/api/noticias/publicas');
    responderApiExterna(httpTesting);
    propias.flush('Error', { status: 500, statusText: 'Server Error' });
    fixture.detectChanges();

    expect(component.errorNoticias()).toBe(true);
    expect(fixture.nativeElement.textContent).toContain(
      component.textosNoticias.errorCarga,
    );
  });

});