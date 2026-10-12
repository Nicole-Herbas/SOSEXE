import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { ApiResponse } from '../../../shared/models/api-response';
import { OportunidadVoluntariado } from '../models/oportunidad-voluntariado';
import { VoluntariadoService } from './voluntariado.service';

describe('VoluntariadoService', () => {
  let service: VoluntariadoService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(VoluntariadoService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('consulta GET /api/voluntariados y conserva el contenedor y los datos del DTO', () => {
    const respuesta: ApiResponse<OportunidadVoluntariado[]> = {
      success: true,
      message: 'OK',
      timestamp: '2026-10-11T10:00:00',
      data: [{
        id: 7,
        titulo: 'Organizar donaciones',
        descripcion: 'Clasificar ropa y alimentos',
        fechaInicio: '2026-10-12T09:00:00',
        fechaFin: '2026-10-13T17:00:00',
        habilidadesRequeridas: null,
        estado: 'PUBLICADO',
        centroId: 2,
        creadoPorId: 4,
        centroNombre: 'Centro comunitario',
        centroCiudad: 'El Alto',
        centroDepartamento: 'La Paz',
        centroNecesidades: [{ id: 7, nombre: 'Apoyo educativo' }, { id: 9, nombre: 'Logística' }],
      }],
    };
    let recibida: ApiResponse<OportunidadVoluntariado[]> | undefined;
    service.listarTodos().subscribe((resultado) => (recibida = resultado));

    const request = httpTesting.expectOne('/api/voluntariados');
    expect(request.request.method).toBe('GET');
    request.flush(respuesta);

    expect(recibida).toEqual(respuesta);
  });

  it('devuelve una lista vacía sin agregar datos simulados', () => {
    let recibida: OportunidadVoluntariado[] | undefined;
    service.listarTodos().subscribe((respuesta) => (recibida = respuesta.data));

    httpTesting.expectOne('/api/voluntariados').flush({
      success: true, message: 'OK', data: [], timestamp: '',
    });

    expect(recibida).toEqual([]);
  });

  it('propaga errores HTTP sin sustituirlos por oportunidades estáticas', () => {
    let recibido: HttpErrorResponse | undefined;
    service.listarTodos().subscribe({ error: (error) => (recibido = error) });

    httpTesting.expectOne('/api/voluntariados').flush('Error', {
      status: 503, statusText: 'Service Unavailable',
    });

    expect(recibido?.status).toBe(503);
  });
});
