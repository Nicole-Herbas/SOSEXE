import { TestBed } from '@angular/core/testing';

import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';

import {
  provideHttpClient
} from '@angular/common/http';

import { AuthService } from './auth.service';
import { LoginRequest } from '../models/login-request';
import { AuthResponse } from '../models/auth-response';


describe('AuthService', () => {

  let service: AuthService;
  let httpTesting: HttpTestingController;


  beforeEach(() => {

    TestBed.configureTestingModule({

      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]

    });

    service = TestBed.inject(AuthService);

    httpTesting =
      TestBed.inject(HttpTestingController);

  });


  afterEach(() => {

    httpTesting.verify();

  });


  it('should be created', () => {

    expect(service).toBeTruthy();

  });


  it('should send login request and receive auth response', () => {

    const credenciales: LoginRequest = {
      email: 'admin@sos.com',
      password: '123456'
    };


    const respuestaMock: AuthResponse = {

      token: 'jwt-generado-exitosamente-para-1',

      tipoToken: 'Bearer',

      nombre: 'Administrador',

      email: 'admin@sos.com',

      rol: 'ADMIN'

    };


    service.login(credenciales)
      .subscribe(respuesta => {

        expect(respuesta)
          .toEqual(respuestaMock);

        expect(respuesta.rol)
          .toBe('ADMIN');

      });


    const request =
      httpTesting.expectOne(
        '/api/auth/login'
      );


    expect(request.request.method)
      .toBe('POST');


    expect(request.request.body)
      .toEqual(credenciales);


    request.flush(respuestaMock);

  });

});