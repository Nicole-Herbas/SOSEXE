import { TestBed } from '@angular/core/testing';

import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';

import {
  provideHttpClient
} from '@angular/common/http';

import { MapaService } from './mapa.service';
import { PuntoMapa } from '../models/punto-mapa.model';


describe('MapaService', () => {

  let service: MapaService;
  let httpTesting: HttpTestingController;


  beforeEach(() => {

    TestBed.configureTestingModule({

      providers: [

        provideHttpClient(),

        provideHttpClientTesting()

      ]

    });


    service = TestBed.inject(MapaService);

    httpTesting =
      TestBed.inject(HttpTestingController);

  });


  afterEach(() => {

    httpTesting.verify();

  });


  it('should be created', () => {

    expect(service).toBeTruthy();

  });


  it('debe llamar a GET /api/mapa/puntos y extraer data del ApiResponse', () => {

    const puntosMock: PuntoMapa[] = [

      {
        id: 1,
        origen: 'CENTRO',
        nombre: 'Centro San José',
        tipo: 'CENTRO_APOYO',
        ciudad: 'Cochabamba',
        departamentoNombre: 'Cochabamba',
        latitud: -17.3895,
        longitud: -66.1568,
        estadoVerificacion: 'VERIFICADO',
        necesidades: ['Agua', 'Alimentos']
      },

      {
        id: 5,
        origen: 'PUNTO_AYUDA',
        nombre: 'Punto Donación El Alto',
        tipo: 'PUNTO_DONACION',
        ciudad: 'El Alto',
        departamentoNombre: 'La Paz',
        latitud: -16.51,
        longitud: -68.16,
        estadoVerificacion: 'PENDIENTE',
        necesidades: ['Agua']
      }

    ];


    service.listarPuntos().subscribe(puntos => {

      expect(puntos).toEqual(puntosMock);

      expect(puntos.length).toBe(2);

      expect(puntos[0].origen).toBe('CENTRO');

      expect(puntos[1].origen).toBe('PUNTO_AYUDA');

    });


    const request =
      httpTesting.expectOne('/api/mapa/puntos');


    expect(request.request.method)
      .toBe('GET');


    request.flush({

      success: true,

      message: 'Operación exitosa',

      data: puntosMock,

      timestamp: '2026-09-22T16:00:00'

    });

  });

});
