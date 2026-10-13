import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { CrearPostulacion, Postulacion } from '../models/postulacion';
import { PostulacionService } from './postulacion.service';

describe('PostulacionService', () => {
  let service: PostulacionService;
  let http: HttpTestingController;
  const postulacion: Postulacion = {
    id: 1, voluntariadoId: 7, usuarioId: 10, estado: 'PENDIENTE', disponibilidad: 'Tarde',
    comentario: null, fechaPostulacion: null, voluntariadoTitulo: 'Apoyo', usuarioNombre: 'Lucía',
  };
  const respuesta = { success: true, message: 'Creada', data: postulacion, timestamp: '' };

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(PostulacionService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('envía solo oportunidad, disponibilidad y comentario, descartando identidad y estado', () => {
    const recibida = vi.fn();
    service.crear({ voluntariadoId: 7, disponibilidad: 'Tarde', comentario: 'Puedo ayudar',
      usuarioId: 999, estado: 'APROBADO' } as CrearPostulacion).subscribe(recibida);
    const request = http.expectOne('/api/postulaciones');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ voluntariadoId: 7, disponibilidad: 'Tarde', comentario: 'Puedo ayudar' });
    request.flush(respuesta, { status: 201, statusText: 'Created' });
    expect(recibida).toHaveBeenCalledWith(respuesta);
  });

  it('permite omitir el comentario', () => {
    service.crear({ voluntariadoId: 7, disponibilidad: 'Tarde' }).subscribe();
    const request = http.expectOne('/api/postulaciones');
    expect(request.request.body).toEqual({ voluntariadoId: 7, disponibilidad: 'Tarde' });
    request.flush(respuesta, { status: 201, statusText: 'Created' });
  });

  it('consulta únicamente las postulaciones propias', () => {
    const recibida = vi.fn();
    service.listarMias().subscribe(recibida);
    const request = http.expectOne('/api/postulaciones/mias');
    expect(request.request.method).toBe('GET');
    request.flush({ ...respuesta, data: [postulacion] });
    expect(recibida).toHaveBeenCalledWith({ ...respuesta, data: [postulacion] });
  });

  it('no confirma una respuesta 200 aunque el cuerpo indique éxito', () => {
    const error = vi.fn();
    const exito = vi.fn();
    service.crear({ voluntariadoId: 7, disponibilidad: 'Tarde' }).subscribe({ next: exito, error });
    http.expectOne('/api/postulaciones').flush(respuesta);
    expect(exito).not.toHaveBeenCalled();
    expect(error.mock.calls[0][0].status).toBe(200);
  });

  it.each([400, 401, 403, 404, 409, 422, 503])('propaga HTTP %s sin reintentar la postulación', status => {
    let recibido: HttpErrorResponse | undefined;
    service.crear({ voluntariadoId: 7, disponibilidad: 'Tarde' }).subscribe({ error: error => recibido = error });
    http.expectOne('/api/postulaciones').flush({}, { status, statusText: 'Error' });
    expect(recibido?.status).toBe(status);
    http.expectNone('/api/postulaciones');
  });
});
