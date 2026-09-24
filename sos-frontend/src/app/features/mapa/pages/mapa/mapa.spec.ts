import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { MapaLeaflet } from '../../components/mapa-leaflet/mapa-leaflet';
import { Mapa } from './mapa';
import { PuntoMapa } from '../../models/punto-mapa.model';

@Component({
  selector: 'app-mapa-leaflet',
  template: '',
})
class MapaLeafletStub {
  @Input() puntos: PuntoMapa[] = [];
  @Input() puntoSeleccionado: PuntoMapa | null = null;
  @Output() puntoClick = new EventEmitter<PuntoMapa>();
}

const PUNTO_MOCK: PuntoMapa = {
  id: 1,
  origen: 'CENTRO',
  nombre: 'Centro San José',
  tipo: 'CENTRO_APOYO',
  ciudad: 'Cochabamba',
  departamentoNombre: 'Cochabamba',
  latitud: -17.3895,
  longitud: -66.1568,
  estadoVerificacion: 'VERIFICADO',
  necesidades: ['Agua', 'Alimentos'],
};

const PUNTO_REFUGIO_MOCK: PuntoMapa = {
  id: 2,
  origen: 'PUNTO_AYUDA',
  nombre: 'Refugio Santa Cruz',
  tipo: 'REFUGIO',
  ciudad: 'Santa Cruz',
  departamentoNombre: 'Santa Cruz',
  latitud: -17.7833,
  longitud: -63.1821,
  estadoVerificacion: 'PENDIENTE',
  necesidades: ['Ropa'],
};

describe('Mapa', () => {
  let component: Mapa;
  let fixture: ComponentFixture<Mapa>;
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Mapa],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    })
      .overrideComponent(Mapa, {
        remove: { imports: [MapaLeaflet] },
        add: { imports: [MapaLeafletStub] },
      })
      .compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(Mapa);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('debe mostrar el título y los cinco filtros de tipo cuando mapaFiltros es true', () => {
    component.featureToggles.mapa.filtros = true;
    fixture.detectChanges();

    const req = httpTesting.expectOne('/api/mapa/puntos');
    req.flush({ success: true, message: 'OK', data: [], timestamp: '' });
    fixture.detectChanges();

    const titulo = fixture.nativeElement.querySelector('h1');
    const filtros = fixture.nativeElement.querySelectorAll('[data-filtro-tipo]');

    expect(titulo.textContent).toContain('Mapa de ayuda y emergencias');
    expect(filtros.length).toBe(5);
  });

  it('debe ocultar los filtros de tipo y necesidad cuando mapaFiltros es false', () => {
    component.featureToggles.mapa.filtros = false;
    fixture.detectChanges();

    const req = httpTesting.expectOne('/api/mapa/puntos');
    req.flush({ success: true, message: 'OK', data: [], timestamp: '' });
    fixture.detectChanges();

    const filtrosTipo = fixture.nativeElement.querySelectorAll('[data-filtro-tipo]');
    const filtrosNecesidad = fixture.nativeElement.querySelectorAll('[data-filtro-necesidad]');

    expect(filtrosTipo.length).toBe(0);
    expect(filtrosNecesidad.length).toBe(0);
  });

  it('debe seleccionar un punto y mostrar su detalle', () => {
    fixture.detectChanges();

    const req = httpTesting.expectOne('/api/mapa/puntos');
    req.flush({ success: true, message: 'OK', data: [PUNTO_MOCK, PUNTO_REFUGIO_MOCK], timestamp: '' });
    fixture.detectChanges();

    component.seleccionarPunto(PUNTO_MOCK);
    fixture.detectChanges();

    expect(component.puntoSeleccionado()).toEqual(PUNTO_MOCK);

    const detalle = fixture.nativeElement.querySelector('.detalle-card h2');
    expect(detalle.textContent).toContain('Centro San José');
  });

  it('debe filtrar puntos por tipo cuando se selecciona un filtro y mapaFiltros es true', () => {
    component.featureToggles.mapa.filtros = true;
    fixture.detectChanges();

    const req = httpTesting.expectOne('/api/mapa/puntos');
    req.flush({ success: true, message: 'OK', data: [PUNTO_MOCK, PUNTO_REFUGIO_MOCK], timestamp: '' });
    fixture.detectChanges();

    component.seleccionarFiltroTipo('REFUGIO');
    fixture.detectChanges();

    expect(component.puntosFiltrados().length).toBe(1);
    expect(component.puntosFiltrados()[0].nombre).toBe('Refugio Santa Cruz');
  });

  it('debe ocultar la columna izquierda cuando mostrarLista es false', () => {
    component.featureToggles.mapa.mostrarLista = false;
    fixture.detectChanges();

    const req = httpTesting.expectOne('/api/mapa/puntos');
    req.flush({ success: true, message: 'OK', data: [PUNTO_MOCK], timestamp: '' });
    fixture.detectChanges();

    const lista = fixture.nativeElement.querySelector('.columna-izquierda');
    expect(lista).toBeNull();
  });

  it('debe ocultar el mapa cuando mostrarMapa es false', () => {
    component.featureToggles.mapa.mostrarMapa = false;
    fixture.detectChanges();

    const req = httpTesting.expectOne('/api/mapa/puntos');
    req.flush({ success: true, message: 'OK', data: [PUNTO_MOCK], timestamp: '' });
    fixture.detectChanges();

    const mapa = fixture.nativeElement.querySelector('.columna-mapa');
    expect(mapa).toBeNull();
  });

  

  it('debe mostrar el selector con todos los departamentos de Bolivia', () => {
  fixture.detectChanges();

  const req =
    httpTesting.expectOne('/api/mapa/puntos');

  req.flush({
    success: true,
    message: 'OK',
    data: [],
    timestamp: ''
  });

  fixture.detectChanges();

  const select =
    fixture.nativeElement.querySelector(
      '.filtro-departamento select'
    );

  const opciones =
    select.querySelectorAll('option');

  expect(select).toBeTruthy();

  expect(opciones.length).toBe(10);

  expect(opciones[1].textContent.trim())
    .toBe('Chuquisaca');

  expect(opciones[9].textContent.trim())
    .toBe('Pando');
});


it('debe mostrar todos los departamentos como opción seleccionada por defecto', () => {
  fixture.detectChanges();

  const req =
    httpTesting.expectOne('/api/mapa/puntos');

  req.flush({
    success: true,
    message: 'OK',
    data: [],
    timestamp: ''
  });

  fixture.detectChanges();

  const select: HTMLSelectElement =
    fixture.nativeElement.querySelector(
      '.filtro-departamento select'
    );

  expect(select.value)
    .toBe('Departamentos');
});
});
