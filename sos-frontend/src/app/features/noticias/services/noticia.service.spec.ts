import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { Noticia } from '../models/noticia.model';
import { NoticiaService } from './noticia.service';

describe('NoticiaService', () => {
  let service: NoticiaService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(NoticiaService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('combina noticias propias y externas en orden cronológico', () => {
    let resultado: Noticia[] = [];
    service.listarNoticias().subscribe((noticias) => (resultado = noticias));

    const propias = httpTesting.expectOne('/api/noticias/publicas');
    const externas = httpTesting.expectOne('/api/noticias/externas');
    expect(propias.request.method).toBe('GET');
    expect(externas.request.method).toBe('GET');

    propias.flush({
      success: true,
      message: 'OK',
      data: [
        {
          id: 3,
          titulo: 'Noticia local',
          contenido: 'Resumen local',
          categoria: 'Comunidad',
          imagenUrl: null,
          fuente: 'SOS.exe',
          fechaPublicacion: '2026-09-20T09:00:00',
          estado: 'PUBLICADO',
          esExterna: false,
        },
      ],
      timestamp: '',
    });
    externas.flush({
      success: true,
      message: 'OK',
      data: [
        {
          id: 'api-1',
          titulo: 'Noticia externa',
          descripcion: 'Resumen externo',
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

    expect(resultado.map((noticia) => noticia.id)).toEqual(['api-1', 3]);
    expect(resultado[0].resumen).toBe('Resumen externo');
    expect(resultado[1].esExterna).toBe(false);
  });
});