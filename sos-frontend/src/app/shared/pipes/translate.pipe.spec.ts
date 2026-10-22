import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ChangeDetectorRef } from '@angular/core';

import { TranslatePipe } from './translate.pipe';
import { IdiomaService } from '../services/idioma.service';

describe('TranslatePipe', () => {
  let pipe: TranslatePipe;
  let idiomaService: IdiomaService;
  let httpMock: HttpTestingController;

  const mockEs: Record<string, string> = {
    'navbar.lema': 'Juntos ante desastres naturales',
    'navbar.marca': 'SOS.exe',
    'inicio.hero.titulo': 'Ayuda que llega,',
  };

  const mockEn: Record<string, string> = {
    'navbar.lema': 'Together against natural disasters',
    'navbar.marca': 'SOS.exe',
    'inicio.hero.titulo': 'Help that arrives,',
  };

  beforeEach(() => {
    localStorage.removeItem('idioma_preferido');

    TestBed.configureTestingModule({
      providers: [
        IdiomaService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ChangeDetectorRef, useValue: { markForCheck: () => {} } },
      ],
    });

    idiomaService = TestBed.inject(IdiomaService);
    httpMock = TestBed.inject(HttpTestingController);
    httpMock.expectOne('/i18n/es.json').flush(mockEs);

    pipe = TestBed.runInInjectionContext(() => new TranslatePipe());
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.removeItem('idioma_preferido');
  });

  it('traduce una clave al idioma activo (español)', () => {
    expect(pipe.transform('navbar.lema')).toBe('Juntos ante desastres naturales');
  });

  it('devuelve la clave si no existe traduccion', () => {
    const clave = 'clave.inexistente';
    expect(pipe.transform(clave)).toBe(clave);
  });

  it('devuelve cadena vacia si la clave es vacia', () => {
    expect(pipe.transform('')).toBe('');
  });

  it('actualiza el texto cuando cambia el idioma a inglés', () => {
    idiomaService.setIdioma('en');
    httpMock.expectOne('/i18n/en.json').flush(mockEn);

    expect(pipe.transform('navbar.lema')).toBe('Together against natural disasters');
  });

  it('actualiza el texto cuando vuelve al español', () => {
    idiomaService.setIdioma('en');
    httpMock.expectOne('/i18n/en.json').flush(mockEn);

    idiomaService.setIdioma('es');
    httpMock.expectOne('/i18n/es.json').flush(mockEs);

    expect(pipe.transform('navbar.lema')).toBe('Juntos ante desastres naturales');
  });
});
