import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';

import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';

import {
  provideHttpClient
} from '@angular/common/http';

import {
  provideHttpClientTesting,
  HttpTestingController
} from '@angular/common/http/testing';

import {
  MapaLeaflet
} from '../../components/mapa-leaflet/mapa-leaflet';

import {
  Mapa
} from './mapa';

import {
  PuntoMapa
} from '../../models/punto-mapa.model';


@Component({
  selector: 'app-mapa-leaflet',
  template: '',
})
class MapaLeafletStub {

  @Input()
  puntos: PuntoMapa[] = [];

  @Input()
  puntoSeleccionado:
    PuntoMapa | null = null;

  @Output()
  puntoClick =
    new EventEmitter<PuntoMapa>();
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
  necesidades: [
    'Agua',
    'Alimentos'
  ],
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
  necesidades: [
    'Ropa'
  ],
};


describe('Mapa', () => {

  let component: Mapa;
  let fixture: ComponentFixture<Mapa>;

  let httpTesting:
    HttpTestingController;


  beforeEach(async () => {

    await TestBed
      .configureTestingModule({
        imports: [
          Mapa
        ],
        providers: [
          provideHttpClient(),
          provideHttpClientTesting(),
        ],
      })
      .overrideComponent(
        Mapa,
        {
          remove: {
            imports: [
              MapaLeaflet
            ]
          },
          add: {
            imports: [
              MapaLeafletStub
            ]
          },
        }
      )
      .compileComponents();


    httpTesting =
      TestBed.inject(
        HttpTestingController
      );


    fixture =
      TestBed.createComponent(
        Mapa
      );


    component =
      fixture.componentInstance;
  });

  it(
    'debe mostrar email y fecha de actualización en el detalle',
    () => {

      const puntoDetalle: PuntoMapa = {
        ...PUNTO_MOCK,
        email: 'centro@sos.com',
        fechaActualizacion:
          '2026-10-05T20:30:00'
      };


      fixture.detectChanges();


      const req =
        httpTesting.expectOne(
          '/api/mapa/puntos'
        );


      req.flush({
        success: true,
        message: 'OK',
        data: [
          puntoDetalle
        ],
        timestamp: ''
      });


      responderDetalle(
        puntoDetalle
      );


      fixture.detectChanges();


      expect(
        fixture.nativeElement.textContent
      ).toContain(
        'centro@sos.com'
      );


      expect(
        component
          .formatearFechaActualizacion(
            puntoDetalle.fechaActualizacion
          )
      ).not.toBe('');
    }
  );


  it(
    'debe mostrar error cuando falla la carga del detalle',
    () => {

      fixture.detectChanges();


      const req =
        httpTesting.expectOne(
          '/api/mapa/puntos'
        );


      req.flush({
        success: true,
        message: 'OK',
        data: [
          PUNTO_MOCK
        ],
        timestamp: ''
      });


      const reqDetalle =
        httpTesting.expectOne(
          '/api/mapa/puntos/CENTRO/1'
        );


      reqDetalle.flush(
        {
          success: false,
          message: 'Error',
          data: null,
          timestamp: ''
        },
        {
          status: 500,
          statusText:
            'Server Error'
        }
      );


      fixture.detectChanges();


      expect(
        component.errorDetalle()
      ).toBe(
        component
          .detalleEtiquetas
          .errorCarga
      );


      expect(
        component.cargandoDetalle()
      ).toBe(false);
    }
  );


  it(
    'debe abrir y cerrar el modal de detalle',
    () => {

      component.puntoSeleccionado.set(
        PUNTO_MOCK
      );


      component.abrirModalDetalle();


      expect(
        component.mostrarModalDetalle()
      ).toBe(true);


      component.cerrarModalCompleto();


      expect(
        component.mostrarModalDetalle()
      ).toBe(false);
    }
  );


  it(
    'debe distinguir puntos con el mismo id usando el origen',
    () => {

      const centro: PuntoMapa = {
        ...PUNTO_MOCK,
        id: 1,
        origen: 'CENTRO'
      };


      const puntoAyuda: PuntoMapa = {
        ...PUNTO_REFUGIO_MOCK,
        id: 1,
        origen: 'PUNTO_AYUDA'
      };


      component.puntos.set([
        centro,
        puntoAyuda
      ]);


      expect(
        centro.id
      ).toBe(
        puntoAyuda.id
      );


      expect(
        centro.origen
      ).not.toBe(
        puntoAyuda.origen
      );
    }
  );


  const responderDetalle = (
    punto: PuntoMapa
  ): void => {

    const reqDetalle =
      httpTesting.expectOne(
        `/api/mapa/puntos/${punto.origen}/${punto.id}`
      );


    expect(
      reqDetalle.request.method
    ).toBe('GET');


    reqDetalle.flush({
      success: true,
      message: 'OK',
      data: punto,
      timestamp: ''
    });


    fixture.detectChanges();
  };


  afterEach(() => {

    httpTesting.verify();

  });


  it(
    'debe mostrar el título y los cinco filtros de tipo cuando mapaFiltros es true',
    () => {

      component
        .featureToggles
        .mapa
        .filtros = true;


      fixture.detectChanges();


      const req =
        httpTesting.expectOne(
          '/api/mapa/puntos'
        );


      req.flush({
        success: true,
        message: 'OK',
        data: [],
        timestamp: ''
      });


      fixture.detectChanges();


      const titulo =
        fixture.nativeElement
          .querySelector(
            'h1'
          );


      const filtros =
        fixture.nativeElement
          .querySelectorAll(
            '[data-filtro-tipo]'
          );


      expect(
        titulo.textContent
      ).toContain(
        'Mapa de ayuda y emergencias'
      );


      expect(
        filtros.length
      ).toBe(5);
    }
  );


  it(
    'debe ocultar los filtros de tipo y necesidad cuando mapaFiltros es false',
    () => {

      component
        .featureToggles
        .mapa
        .filtros = false;


      fixture.detectChanges();


      const req =
        httpTesting.expectOne(
          '/api/mapa/puntos'
        );


      req.flush({
        success: true,
        message: 'OK',
        data: [],
        timestamp: ''
      });


      fixture.detectChanges();


      const filtrosTipo =
        fixture.nativeElement
          .querySelectorAll(
            '[data-filtro-tipo]'
          );


      const filtrosNecesidad =
        fixture.nativeElement
          .querySelectorAll(
            '[data-filtro-necesidad]'
          );


      expect(
        filtrosTipo.length
      ).toBe(0);


      expect(
        filtrosNecesidad.length
      ).toBe(0);
    }
  );


  it(
    'debe seleccionar un punto y cargar su detalle desde el backend',
    () => {

      fixture.detectChanges();


      const req =
        httpTesting.expectOne(
          '/api/mapa/puntos'
        );


      req.flush({
        success: true,
        message: 'OK',
        data: [
          PUNTO_MOCK,
          PUNTO_REFUGIO_MOCK
        ],
        timestamp: ''
      });


      responderDetalle(
        PUNTO_MOCK
      );


      component.seleccionarPunto(
        PUNTO_REFUGIO_MOCK
      );


      const reqDetalle =
        httpTesting.expectOne(
          '/api/mapa/puntos/PUNTO_AYUDA/2'
        );


      expect(
        reqDetalle.request.method
      ).toBe('GET');


      reqDetalle.flush({
        success: true,
        message: 'OK',
        data: PUNTO_REFUGIO_MOCK,
        timestamp: ''
      });


      fixture.detectChanges();


      expect(
        component.puntoSeleccionado()
      ).toEqual(
        PUNTO_REFUGIO_MOCK
      );


      const detalle =
        fixture.nativeElement
          .querySelector(
            '.detalle-card h2'
          );


      expect(
        detalle.textContent
      ).toContain(
        'Refugio Santa Cruz'
      );
    }
  );


  it(
    'debe filtrar puntos por tipo cuando se selecciona un filtro y mapaFiltros es true',
    () => {

      component
        .featureToggles
        .mapa
        .filtros = true;


      fixture.detectChanges();


      const req =
        httpTesting.expectOne(
          '/api/mapa/puntos'
        );


      req.flush({
        success: true,
        message: 'OK',
        data: [
          PUNTO_MOCK,
          PUNTO_REFUGIO_MOCK
        ],
        timestamp: ''
      });


      responderDetalle(
        PUNTO_MOCK
      );


      component.seleccionarFiltroTipo(
        'REFUGIO'
      );


      fixture.detectChanges();


      expect(
        component.puntosFiltrados().length
      ).toBe(1);


      expect(
        component
          .puntosFiltrados()[0]
          .nombre
      ).toBe(
        'Refugio Santa Cruz'
      );
    }
  );


  it(
    'debe ocultar la columna izquierda cuando mostrarLista es false',
    () => {

      component
        .featureToggles
        .mapa
        .mostrarLista = false;


      fixture.detectChanges();


      const req =
        httpTesting.expectOne(
          '/api/mapa/puntos'
        );


      req.flush({
        success: true,
        message: 'OK',
        data: [
          PUNTO_MOCK
        ],
        timestamp: ''
      });


      responderDetalle(
        PUNTO_MOCK
      );


      fixture.detectChanges();


      const lista =
        fixture.nativeElement
          .querySelector(
            '.columna-izquierda'
          );


      expect(
        lista
      ).toBeNull();
    }
  );


  it(
    'debe ocultar el mapa cuando mostrarMapa es false',
    () => {

      component
        .featureToggles
        .mapa
        .mostrarMapa = false;


      fixture.detectChanges();


      const req =
        httpTesting.expectOne(
          '/api/mapa/puntos'
        );


      req.flush({
        success: true,
        message: 'OK',
        data: [
          PUNTO_MOCK
        ],
        timestamp: ''
      });


      responderDetalle(
        PUNTO_MOCK
      );


      fixture.detectChanges();


      const mapa =
        fixture.nativeElement
          .querySelector(
            '.columna-mapa'
          );


      expect(
        mapa
      ).toBeNull();
    }
  );


  it(
    'debe filtrar los puntos por necesidad sin realizar una nueva petición al backend',
    () => {

      component
        .featureToggles
        .mapa
        .filtros = true;


      fixture.detectChanges();


      const req =
        httpTesting.expectOne(
          '/api/mapa/puntos'
        );


      req.flush({
        success: true,
        message: 'OK',
        data: [
          PUNTO_MOCK,
          PUNTO_REFUGIO_MOCK
        ],
        timestamp: ''
      });


      responderDetalle(
        PUNTO_MOCK
      );


      component
        .seleccionarFiltroNecesidad(
          'Ropa'
        );


      fixture.detectChanges();


      expect(
        component
          .filtrosNecesidadActivos()
      ).toEqual([
        'Ropa'
      ]);


      expect(
        component
          .puntosFiltrados()
          .length
      ).toBe(1);


      expect(
        component
          .puntosFiltrados()[0]
          .nombre
      ).toBe(
        'Refugio Santa Cruz'
      );


      httpTesting.expectNone(
        '/api/mapa/puntos'
      );
    }
  );


  it(
    'debe combinar el filtro por tipo con el filtro por necesidad',
    () => {

      component
        .featureToggles
        .mapa
        .filtros = true;


      fixture.detectChanges();


      const req =
        httpTesting.expectOne(
          '/api/mapa/puntos'
        );


      req.flush({
        success: true,
        message: 'OK',
        data: [
          PUNTO_MOCK,
          PUNTO_REFUGIO_MOCK
        ],
        timestamp: ''
      });


      responderDetalle(
        PUNTO_MOCK
      );


      component.seleccionarFiltroTipo(
        'REFUGIO'
      );


      component
        .seleccionarFiltroNecesidad(
          'Ropa'
        );


      fixture.detectChanges();


      expect(
        component
          .filtroTipoActivo()
      ).toBe(
        'REFUGIO'
      );


      expect(
        component
          .filtrosNecesidadActivos()
      ).toEqual([
        'Ropa'
      ]);


      expect(
        component
          .puntosFiltrados()
          .length
      ).toBe(1);


      expect(
        component
          .puntosFiltrados()[0]
          .nombre
      ).toBe(
        'Refugio Santa Cruz'
      );


      httpTesting.expectNone(
        '/api/mapa/puntos'
      );
    }
  );


  it(
    'debe filtrar los resultados por tipo sin realizar una nueva petición al backend',
    () => {

      component
        .featureToggles
        .mapa
        .filtros = true;


      fixture.detectChanges();


      const req =
        httpTesting.expectOne(
          '/api/mapa/puntos'
        );


      req.flush({
        success: true,
        message: 'OK',
        data: [
          PUNTO_MOCK,
          PUNTO_REFUGIO_MOCK
        ],
        timestamp: ''
      });


      responderDetalle(
        PUNTO_MOCK
      );


      const botonRefugios:
        HTMLButtonElement =
        fixture.nativeElement
          .querySelector(
            '[data-filtro-tipo="REFUGIO"]'
          );


      botonRefugios.click();


      fixture.detectChanges();


      expect(
        component
          .filtroTipoActivo()
      ).toBe(
        'REFUGIO'
      );


      expect(
        component
          .puntosFiltrados()
          .length
      ).toBe(1);


      expect(
        component
          .puntosFiltrados()[0]
          .nombre
      ).toBe(
        'Refugio Santa Cruz'
      );


      httpTesting.expectNone(
        '/api/mapa/puntos'
      );
    }
  );


  it(
    'debe volver a mostrar todos los puntos al seleccionar Todos sin recargar datos',
    () => {

      component
        .featureToggles
        .mapa
        .filtros = true;


      fixture.detectChanges();


      const req =
        httpTesting.expectOne(
          '/api/mapa/puntos'
        );


      req.flush({
        success: true,
        message: 'OK',
        data: [
          PUNTO_MOCK,
          PUNTO_REFUGIO_MOCK
        ],
        timestamp: ''
      });


      responderDetalle(
        PUNTO_MOCK
      );


      component.seleccionarFiltroTipo(
        'REFUGIO'
      );


      expect(
        component
          .puntosFiltrados()
          .length
      ).toBe(1);


      const botonTodos:
        HTMLButtonElement =
        fixture.nativeElement
          .querySelector(
            '[data-filtro-tipo="todos"]'
          );


      botonTodos.click();


      fixture.detectChanges();


      expect(
        component
          .filtroTipoActivo()
      ).toBe(
        'todos'
      );


      expect(
        component
          .puntosFiltrados()
          .length
      ).toBe(2);


      httpTesting.expectNone(
        '/api/mapa/puntos'
      );
    }
  );

});


