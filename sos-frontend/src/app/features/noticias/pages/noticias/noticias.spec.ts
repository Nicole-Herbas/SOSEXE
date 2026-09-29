import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { Noticias } from './noticias';

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
      data: [
        {
          id: 'externa-1',
          titulo: 'Noticia de prueba',
          descripcion: 'Resumen de prueba',
          url: 'https://example.com/noticia',
          imagenUrl: null,
          fuente: 'Medio',
          categoria: 'general',
          pais: 'Bolivia',
          fechaPublicacion: '2026-09-21 09:00:00',
          esExterna: true,
        },
      ],
      timestamp: '',
    });

    expect(component.cargando()).toBe(false);
    expect(component.error()).toBe(false);
    expect(component.noticias().length).toBe(1);
    expect(component.noticiasDestacadas()[0].titulo).toBe('Noticia de prueba');
  });
});
