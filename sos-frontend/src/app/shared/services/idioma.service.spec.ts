import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { IdiomaService, Idioma } from './idioma.service';

describe('IdiomaService', () => {

  let service: IdiomaService;
  let httpMock: HttpTestingController;

  // Traducciones de prueba
  const mockEs: Record<string, string> = {
    'navbar.lema': 'Juntos ante desastres naturales',
    'navbar.enlaces.inicio': 'Inicio',
    'preferencias.titulo': 'Preferencias de cuenta',
  };

  const mockEn: Record<string, string> = {
    'navbar.lema': 'Together against natural disasters',
    'navbar.enlaces.inicio': 'Home',
    'preferencias.titulo': 'Account preferences',
  };

  beforeEach(() => {
    // Limpiar idioma guardado antes de cada test
    localStorage.removeItem('idioma_preferido');

    TestBed.configureTestingModule({
      providers: [
        IdiomaService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service  = TestBed.inject(IdiomaService);
    httpMock = TestBed.inject(HttpTestingController);

    // Responder la carga inicial en español
    httpMock.expectOne('/i18n/es.json').flush(mockEs);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.removeItem('idioma_preferido');
  });


  it('carga traducciones en español por defecto', () => {
    expect(service.idioma$()).toBe('es');
    expect(service.traducciones$()['navbar.lema'])
      .toBe('Juntos ante desastres naturales');
  });


  it('cambia al inglés, persiste en localStorage y actualiza traducciones', fakeAsync(() => {
    service.setIdioma('en');

    // Debe persistir en localStorage
    expect(localStorage.getItem('idioma_preferido')).toBe('en');
    expect(service.idioma$()).toBe('en');

    // Responder la carga del inglés
    httpMock.expectOne('/i18n/en.json').flush(mockEn);
    tick();

    expect(service.traducciones$()['navbar.enlaces.inicio']).toBe('Home');
  }));


  it('retorna la clave como fallback si no existe traduccion', () => {
    const claveInexistente = 'seccion.que.no.existe';
    expect(service.t(claveInexistente)).toBe(claveInexistente);
  });


  it('vuelve al español y actualiza las traducciones', fakeAsync(() => {
    // Primero cambia a inglés
    service.setIdioma('en');
    httpMock.expectOne('/i18n/en.json').flush(mockEn);
    tick();

    // Luego vuelve a español
    service.setIdioma('es');
    expect(localStorage.getItem('idioma_preferido')).toBe('es');
    httpMock.expectOne('/i18n/es.json').flush(mockEs);
    tick();

    expect(service.traducciones$()['navbar.enlaces.inicio']).toBe('Inicio');
  }));


  it('usa el idioma guardado en localStorage al inicializarse', () => {
    // Simular que se guardó inglés en una sesión anterior
    localStorage.setItem('idioma_preferido', 'en');

    // Recrear el servicio con el localStorage ya seteado
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        IdiomaService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    const newService  = TestBed.inject(IdiomaService);
    const newHttpMock = TestBed.inject(HttpTestingController);

    // Debe cargar en inglés
    expect(newService.idioma$()).toBe('en');
    newHttpMock.expectOne('/i18n/en.json').flush(mockEn);
    newHttpMock.verify();
  });


  it('ignora un valor invalido en localStorage y usa espanol por defecto', () => {
    localStorage.setItem('idioma_preferido', 'fr'); // no soportado

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        IdiomaService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    const newService  = TestBed.inject(IdiomaService);
    const newHttpMock = TestBed.inject(HttpTestingController);

    expect(newService.idioma$()).toBe('es');
    newHttpMock.expectOne('/i18n/es.json').flush(mockEs);
    newHttpMock.verify();
  });

});
