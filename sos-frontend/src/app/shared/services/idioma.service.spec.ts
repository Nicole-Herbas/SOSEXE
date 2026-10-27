import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { IdiomaService } from './idioma.service';

describe('IdiomaService', () => {

  let service: IdiomaService;
  let httpMock: HttpTestingController;

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

  it('cambia al inglés, persiste en localStorage y actualiza traducciones', () => {
    service.setIdioma('en');

    expect(localStorage.getItem('idioma_preferido')).toBe('en');
    expect(service.idioma$()).toBe('en');

    httpMock.expectOne('/i18n/en.json').flush(mockEn);

    expect(service.traducciones$()['navbar.enlaces.inicio']).toBe('Home');
  });

  it('retorna la clave como fallback si no existe traduccion ni en constantes', () => {
    const claveInexistente = 'seccion.que.no.existe';
    expect(service.t(claveInexistente)).toBe(claveInexistente);
  });

  it('retorna el valor de constantes como fallback si existe en APP_TEXTOS', () => {
    expect(service.t('navbar.marca')).toBe('SOS.exe');
  });

  it('vuelve al español y actualiza las traducciones', () => {
    service.setIdioma('en');
    httpMock.expectOne('/i18n/en.json').flush(mockEn);

    service.setIdioma('es');
    expect(localStorage.getItem('idioma_preferido')).toBe('es');
    httpMock.expectOne('/i18n/es.json').flush(mockEs);

    expect(service.traducciones$()['navbar.enlaces.inicio']).toBe('Inicio');
  });

  it('soporta JSON anidado y lo aplana correctamente', () => {
    service.setIdioma('en');
    httpMock.expectOne('/i18n/en.json').flush({
      navbar: {
        enlaces: {
          inicio: 'Home Nest'
        }
      }
    });

    expect(service.traducciones$()['navbar.enlaces.inicio']).toBe('Home Nest');
    expect(service.t('navbar.enlaces.inicio')).toBe('Home Nest');
  });

  it('usa el idioma guardado en localStorage al inicializarse', () => {
    localStorage.setItem('idioma_preferido', 'en');

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

    expect(newService.idioma$()).toBe('en');
    newHttpMock.expectOne('/i18n/en.json').flush(mockEn);
    newHttpMock.verify();
  });

  it('ignora un valor invalido en localStorage y usa espanol por defecto', () => {
    localStorage.setItem('idioma_preferido', 'fr');

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
