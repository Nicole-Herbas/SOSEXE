import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { NoticiaPublicada, ResultadoNoticias } from '../models/noticia.model';
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

  it('consulta el detalle publicado y conserva el contrato ApiResponse sin truncar', () => {
    const noticia: NoticiaPublicada = {
      id: 7, titulo: 'Noticia completa', contenido: 'Contenido completo. '.repeat(40),
      categoria: 'Comunidad', imagenUrl: null, fuente: 'Defensa Civil',
      fechaPublicacion: '2026-10-12T09:30:00', estado: 'PUBLICADO', esExterna: false,
    };
    const respuesta = { success: true, message: 'OK', data: noticia, timestamp: '' };
    let recibida;
    service.obtenerPublicadaPorId(7).subscribe((valor) => (recibida = valor));
    const peticion = httpTesting.expectOne('/api/noticias/publicas/7');
    expect(peticion.request.method).toBe('GET');
    peticion.flush(respuesta);
    expect(recibida).toEqual(respuesta);
  });

  it('propaga el 404 del detalle para distinguirlo de errores de conexión', () => {
    let estado;
    service.obtenerPublicadaPorId(99).subscribe({ error: (error) => (estado = error.status) });
    httpTesting.expectOne('/api/noticias/publicas/99').flush(
      { success: false }, { status: 404, statusText: 'Not Found' },
    );
    expect(estado).toBe(404);
  });

  it('combina noticias propias y externas en orden cronológico', () => {
    let resultado: ResultadoNoticias | undefined;
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
      data: {
        noticias: [
          {
            id: 'api-1',
            titulo: 'Noticia externa',
            descripcion: 'Resumen externo',
            url: 'https://example.com/noticia',
            imagenUrl: null,
            fuente: 'Medio',
            categoria: 'environment',
            pais: 'Bolivia',
            fechaPublicacion: '2026-09-21 09:00:00',
            esExterna: true,
          },
        ],
        apiDisponible: true,
        desdeCache: false,
      },
      timestamp: '',
    });

    expect(resultado?.noticias.map((noticia) => noticia.id)).toEqual(['api-1', 3]);
    expect(resultado?.noticias[0].resumen).toBe('Resumen externo');
    expect(resultado?.noticias[0].categoria).toBe('Otras');
    expect(resultado?.noticias[1].esExterna).toBe(false);
    expect(resultado?.apiExternaDisponible).toBe(true);
  });

  it('conserva noticias propias e informa si falla la API externa', () => {
    let resultado: ResultadoNoticias | undefined;
    service.listarNoticias().subscribe((respuesta) => (resultado = respuesta));

    const propias = httpTesting.expectOne('/api/noticias/publicas');
    const externas = httpTesting.expectOne('/api/noticias/externas');
    externas.flush('No disponible', {
      status: 503,
      statusText: 'Service Unavailable',
    });
    propias.flush({
      success: true,
      message: 'OK',
      data: [
        {
          id: 4,
          titulo: 'Noticia local',
          contenido: 'Resumen local',
          categoria: 'Comunidad',
          imagenUrl: null,
          fuente: 'SOS.exe',
          fechaPublicacion: null,
          estado: 'PUBLICADO',
          esExterna: false,
        },
      ],
      timestamp: '',
    });

    expect(resultado?.noticias.map((noticia) => noticia.id)).toEqual([4]);
    expect(resultado?.apiExternaDisponible).toBe(false);
    expect(resultado?.noticiasExternasDesdeCache).toBe(false);
  });

  it('no solicita las fuentes deshabilitadas', () => {
    let soloPropias: ResultadoNoticias | undefined;
    service.listarNoticias({ externas: false }).subscribe((r) => (soloPropias = r));
    httpTesting.expectOne('/api/noticias/publicas').flush({
      success: true,
      message: 'OK',
      data: [],
      timestamp: '',
    });
    httpTesting.expectNone('/api/noticias/externas');
    expect(soloPropias?.apiExternaDisponible).toBeNull();

    let soloExternas: ResultadoNoticias | undefined;
    service.listarNoticias({ propias: false }).subscribe((r) => (soloExternas = r));
    httpTesting.expectNone('/api/noticias/publicas');
    httpTesting.expectOne('/api/noticias/externas').flush({
      success: true,
      message: 'OK',
      data: { noticias: [], apiDisponible: true, desdeCache: false },
      timestamp: '',
    });
    expect(soloExternas?.noticias).toEqual([]);
    expect(soloExternas?.apiExternaDisponible).toBe(true);
  });

  it('propaga el error de noticias propias en vez de convertirlo en lista vacía', () => {
    let errorRecibido = false;
    service.listarNoticias().subscribe({
      error: () => (errorRecibido = true),
    });

    const propias = httpTesting.expectOne('/api/noticias/publicas');
    const externas = httpTesting.expectOne('/api/noticias/externas');
    externas.flush({
      success: true,
      message: 'OK',
      data: { noticias: [], apiDisponible: true, desdeCache: false },
      timestamp: '',
    });
    propias.flush('Error', { status: 500, statusText: 'Server Error' });

    expect(errorRecibido).toBe(true);
  });
});
