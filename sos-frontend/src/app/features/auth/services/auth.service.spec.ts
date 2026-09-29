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
import { RegistroRequest } from '../models/registro-request';


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


  it('registrar() should use POST method to /api/auth/registro', () => {

    const datos: RegistroRequest = {
      nombre: 'Nicole Test',
      email: 'nicole@sos.com',
      password: 'segura123',
    };

    service.registrar(datos).subscribe();

    const req =
      httpTesting.expectOne('/api/auth/registro');

    expect(req.request.method)
      .toBe('POST');

    req.flush('Usuario registrado con exito!');

  });


  it('registrar() should send the correct payload to the backend', () => {

    const datos: RegistroRequest = {
      nombre: 'Maria Lopez',
      email: 'maria@sos.com',
      password: 'clave456',
      telefono: '+591 71234567',
      departamentoId: 3,
    };

    service.registrar(datos).subscribe();

    const req =
      httpTesting.expectOne('/api/auth/registro');

    expect(req.request.body)
      .toEqual(datos);

    req.flush('Usuario registrado con exito!');

  });


  it('registrar() should return the success message from the server', () => {

    const datos: RegistroRequest = {
      nombre: 'Carlos Paz',
      email: 'carlos@sos.com',
      password: 'pass789',
    };

    const mensajeEsperado = 'Usuario registrado con exito!';
    let mensajeRecibido = '';

    service.registrar(datos)
      .subscribe(msg => {
        mensajeRecibido = msg;
      });

    const req =
      httpTesting.expectOne('/api/auth/registro');

    req.flush(mensajeEsperado);

    expect(mensajeRecibido)
      .toBe(mensajeEsperado);

  });

});
