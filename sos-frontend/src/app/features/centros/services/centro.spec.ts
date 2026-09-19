import { TestBed } from '@angular/core/testing';

import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';

import {
  provideHttpClient
} from '@angular/common/http';

import { CentroService } from './centro';
import { Centro } from '../models/centro';


describe('CentroService', () => {

  let service: CentroService;
  let httpTesting: HttpTestingController;


  beforeEach(() => {

    TestBed.configureTestingModule({

      providers: [

        provideHttpClient(),

        provideHttpClientTesting()

      ]

    });


    service = TestBed.inject(CentroService);

    httpTesting =
      TestBed.inject(HttpTestingController);

  });


  afterEach(() => {

    httpTesting.verify();

  });


  it('should be created', () => {

    expect(service).toBeTruthy();

  });


  it('should extract centros from ApiResponse', () => {

    const centrosMock: Centro[] = [

      {
        id: 1,
        nombre: 'Centro Cochabamba',
        tipo: 'CENTRO_APOYO',
        direccion: 'Av. Blanco Galindo',
        ciudad: 'Cochabamba',
        departamentoId: 3,
        latitud: -17.3895,
        longitud: -66.1568
      },

      {
        id: 2,
        nombre: 'Centro La Paz',
        tipo: 'CENTRO_APOYO',
        direccion: 'Zona Central',
        ciudad: 'La Paz',
        departamentoId: 2,
        latitud: -16.4897,
        longitud: -68.1193
      }

    ];


    service.listarTodos().subscribe(centros => {

      expect(centros).toEqual(centrosMock);

      expect(centros.length).toBe(2);

      expect(centros[0].nombre)
        .toBe('Centro Cochabamba');

    });


    const request =
      httpTesting.expectOne('/api/centros');


    expect(request.request.method)
      .toBe('GET');


    request.flush({

      success: true,

      message: 'Operación exitosa',

      data: centrosMock,

      timestamp: '2026-09-19T16:00:00'

    });

  });

});