import { TestBed } from '@angular/core/testing';

import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';

import { provideHttpClient } from '@angular/common/http';

import { RegistrarPuntoService } from './registrar-punto.service';
import { RegistroPuntoSolicitud } from '../models/registrar-punto.model';


describe('RegistrarPuntoService', () => {

  let service: RegistrarPuntoService;
  let httpTesting: HttpTestingController;


  beforeEach(() => {

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(RegistrarPuntoService);
    httpTesting = TestBed.inject(HttpTestingController);
  });


  afterEach(() => {
    httpTesting.verify();
  });


  it('debe cargar departamentos y necesidades desde sus endpoints', () => {

    service.cargarCatalogos().subscribe(catalogos => {
      expect(catalogos.departamentos).toEqual([
        { id: 3, nombre: 'Cochabamba' }
      ]);
      expect(catalogos.necesidades).toEqual([
        { id: 1, nombre: 'Agua' }
      ]);
    });

    const departamentos = httpTesting.expectOne('/api/departamentos');
    expect(departamentos.request.method).toBe('GET');

    const necesidades = httpTesting.expectOne('/api/necesidades');
    expect(necesidades.request.method).toBe('GET');

    departamentos.flush({
      success: true,
      message: 'Operación exitosa',
      data: [{ id: 3, nombre: 'Cochabamba' }],
      timestamp: '2026-10-11T00:00:00'
    });

    necesidades.flush({
      success: true,
      message: 'Operación exitosa',
      data: [{ id: 1, nombre: 'Agua' }],
      timestamp: '2026-10-11T00:00:00'
    });
  });


  it('debe enviar registro por POST sin creadorId ni estadoVerificacion', () => {

    const solicitud: RegistroPuntoSolicitud = {
      nombre: 'Punto solidario',
      tipo: 'PUNTO_DONACION',
      descripcion: 'Recibe alimentos',
      direccion: 'Av. América',
      ciudad: 'Cochabamba',
      departamentoId: 3,
      latitud: -17.3895,
      longitud: -66.1568,
      necesidadIds: [1],
      nombreContacto: 'Responsable',
      telefonoContacto: '70700001',
      correoContacto: null
    };

    service.registrar(solicitud).subscribe(punto => {
      expect(punto.id).toBe(5);
      expect(punto.estadoVerificacion).toBe('PENDIENTE');
    });

    const request = httpTesting.expectOne('/api/puntos-ayuda');

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(solicitud);
    expect(request.request.body.creadorId).toBeUndefined();
    expect(request.request.body.estadoVerificacion).toBeUndefined();

    request.flush({
      success: true,
      message: 'Recurso creado exitosamente',
      data: {
        id: 5,
        ...solicitud,
        estadoVerificacion: 'PENDIENTE'
      },
      timestamp: '2026-10-11T00:00:00'
    });
  });


  it('debe consultar solo la ruta autenticada /mios', () => {

    service.listarMisPuntos().subscribe(puntos => {
      expect(puntos.length).toBe(1);
      expect(puntos[0].estadoVerificacion).toBe('PENDIENTE');
    });

    const request = httpTesting.expectOne('/api/puntos-ayuda/mios');
    expect(request.request.method).toBe('GET');

    request.flush({
      success: true,
      message: 'Operación exitosa',
      data: [{ id: 5, nombre: 'Mi punto', estadoVerificacion: 'PENDIENTE' }],
      timestamp: '2026-10-11T00:00:00'
    });
  });
});
