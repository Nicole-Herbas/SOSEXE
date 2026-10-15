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
import { By } from '@angular/platform-browser';
import { APP_TEXTOS } from '../../../../shared/constants/app-textos.constants';


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

const PUNTOS_BUSQUEDA: PuntoMapa[] = [
  PUNTO_MOCK,
  {
    ...PUNTO_REFUGIO_MOCK, id: 1, nombre: 'Refugio Esperanza',
    ciudad: 'El Alto', departamentoNombre: 'La Paz',
    necesidades: ['Agua', 'Ropa'],
  },
  {
    ...PUNTO_MOCK, id: 3, nombre: 'Centro Solidario',
    ciudad: 'La Paz', departamentoNombre: 'La Paz',
    necesidades: ['Agua', 'Alimentos', 'Ropa'],
  },
  {
    ...PUNTO_REFUGIO_MOCK, id: 4, nombre: 'Punto Donación Ñandú (Norte)',
    ciudad: 'Oruro', departamentoNombre: 'Oruro', tipo: 'PUNTO_DONACION',
  },
];


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

  describe('búsqueda SOS-34', () => {
    function cargarPuntos(puntos: PuntoMapa[] = PUNTOS_BUSQUEDA): void {
      fixture.detectChanges();
      httpTesting.expectOne('/api/mapa/puntos').flush({
        success: true, data: puntos, message: 'OK', timestamp: '',
      });
      if (puntos.length) {
        responderDetalle(puntos[0]);
      }
      fixture.detectChanges();
    }

    function escribirBusqueda(texto: string): void {
      const input: HTMLInputElement = fixture.nativeElement.querySelector('#mapa-busqueda');
      input.value = texto;
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();
    }

    function clavesResultados(): string[] {
      return component.puntosFiltrados().map((punto) => `${punto.origen}-${punto.id}`);
    }

    function mapaStub(): MapaLeafletStub {
      return fixture.debugElement.query(By.directive(MapaLeafletStub)).componentInstance;
    }

    it.each([
      ['nombre', 'jos', ['CENTRO-1']],
      ['ciudad', 'alto', ['PUNTO_AYUDA-1']],
      ['departamento', 'paz', ['PUNTO_AYUDA-1', 'CENTRO-3']],
    ])('busca parcialmente por %s y mantiene OR entre campos', (_campo, consulta, esperado) => {
      cargarPuntos();

      escribirBusqueda(consulta as string);

      expect(clavesResultados()).toEqual(esperado);
      expect(fixture.nativeElement.querySelectorAll('.resultado-card').length).toBe(esperado.length);
    });

    it.each([
      ['SAN JOSÉ', 'CENTRO-1'],
      ['san josé', 'CENTRO-1'],
      ['sAn JoSe', 'CENTRO-1'],
      ['San Jose\u0301', 'CENTRO-1'],
      ['donacion', 'PUNTO_AYUDA-4'],
      [' ÑANDÚ ', 'PUNTO_AYUDA-4'],
      ['(norte)', 'PUNTO_AYUDA-4'],
    ])('normaliza Unicode y mayúsculas, conservando caracteres literales: %s', (consulta, esperado) => {
      cargarPuntos();

      escribirBusqueda(consulta);

      expect(clavesResultados()).toEqual([esperado]);
    });

    it('normaliza espacios repetidos en la consulta y en los campos recibidos', () => {
      cargarPuntos([
        { ...PUNTO_MOCK, nombre: '  Centro\t San   José  ', ciudad: ' El\u00a0  Alto ', departamentoNombre: ' La   Paz ' },
      ]);

      for (const consulta of ['  centro   san  jose ', ' EL\tALTO ', 'la  paz']) {
        escribirBusqueda(consulta);
        expect(clavesResultados()).toEqual(['CENTRO-1']);
      }
    });

    it('muestra todas las coincidencias sin duplicar un punto que coincide en varios campos', () => {
      cargarPuntos();

      escribirBusqueda('paz');

      expect(clavesResultados()).toEqual(['PUNTO_AYUDA-1', 'CENTRO-3']);
      expect(fixture.nativeElement.querySelector('.cantidad-resultados').textContent.trim()).toBe('2');
    });

    it('conserva resultados con igual ID y distinto origen en lista y mapa', () => {
      cargarPuntos([
        PUNTO_MOCK,
        { ...PUNTOS_BUSQUEDA[1], nombre: 'Punto San José' },
      ]);

      escribirBusqueda('san jose');

      expect(clavesResultados()).toEqual(['CENTRO-1', 'PUNTO_AYUDA-1']);
      expect(fixture.nativeElement.querySelectorAll('.resultado-card').length).toBe(2);
      expect(mapaStub().puntos).toEqual(component.puntosFiltrados());
    });

    it.each(['', '  \t  '])('recupera todos los puntos al limpiar el input o buscar espacios: %j', (consulta) => {
      cargarPuntos();
      escribirBusqueda('jose');
      expect(clavesResultados()).toEqual(['CENTRO-1']);

      escribirBusqueda(consulta);

      expect(component.busqueda()).toBe(consulta);
      expect(component.puntosFiltrados()).toEqual(PUNTOS_BUSQUEDA);
      expect(fixture.nativeElement.querySelector('.cantidad-resultados').textContent.trim()).toBe('4');
      expect(mapaStub().puntos).toEqual(PUNTOS_BUSQUEDA);
    });

    it('combina búsqueda AND tipo AND todas las necesidades seleccionadas', () => {
      cargarPuntos();
      component.seleccionarFiltroTipo('CENTRO_APOYO');
      component.seleccionarFiltroNecesidad('Agua');
      component.seleccionarFiltroNecesidad('Ropa');

      escribirBusqueda('paz');

      expect(clavesResultados()).toEqual(['CENTRO-3']);
      expect(component.filtrosNecesidadActivos()).toEqual(['Agua', 'Ropa']);
      expect(mapaStub().puntos).toEqual(component.puntosFiltrados());

      component.seleccionarFiltroNecesidad('todas');
      escribirBusqueda('centro');
      expect(clavesResultados()).toEqual(['CENTRO-1', 'CENTRO-3']);
    });

    it('muestra el mensaje y contador cero y entrega cero marcadores cuando no hay coincidencias', () => {
      cargarPuntos();

      escribirBusqueda('ubicación inexistente');

      expect(component.puntosFiltrados()).toEqual([]);
      expect(fixture.nativeElement.querySelectorAll('.resultado-card').length).toBe(0);
      expect(fixture.nativeElement.querySelector('.lista-resultados .mensaje-estado').textContent)
        .toContain(APP_TEXTOS.mapa.sinResultados);
      expect(fixture.nativeElement.querySelector('.cantidad-resultados').textContent.trim()).toBe('0');
      expect(mapaStub().puntos).toEqual([]);
    });

    it('actualiza dinámicamente los puntos enviados a Leaflet al escribir y borrar', () => {
      cargarPuntos();
      for (const consulta of ['j', 'jose', 'paz', 'ninguno', '']) {
        escribirBusqueda(consulta);
        expect(mapaStub().puntos).toEqual(component.puntosFiltrados());
        expect(fixture.nativeElement.querySelectorAll('.resultado-card').length).toBe(mapaStub().puntos.length);
      }
    });

    it.each([null, undefined])('tolera campos de búsqueda nulos o ausentes: %s', (ausente) => {
      // Representa una respuesta incompleta aunque nombre sea obligatorio en el contrato.
      const incompleto = { ...PUNTO_MOCK, nombre: ausente, ciudad: ausente, departamentoNombre: ausente };
      cargarPuntos([
        incompleto as unknown as PuntoMapa,
        { ...incompleto, id: 2, nombre: 'Centro válido' } as unknown as PuntoMapa,
        { ...incompleto, id: 3, ciudad: 'Ciudad válida' } as unknown as PuntoMapa,
        { ...incompleto, id: 4, departamentoNombre: 'Departamento válido' } as unknown as PuntoMapa,
      ]);

      escribirBusqueda('valid');
      expect(clavesResultados()).toEqual(['CENTRO-2', 'CENTRO-3', 'CENTRO-4']);
      escribirBusqueda('inexistente');
      expect(clavesResultados()).toEqual([]);
      escribirBusqueda('');
      expect(component.puntosFiltrados()).toHaveLength(4);
    });

    it('no solicita datos ni detalle adicionales al escribir y conserva el listado original', () => {
      cargarPuntos();
      const originales = component.puntos();
      const copia = structuredClone(originales);

      for (const consulta of ['s', 'sa', 'san', 'san jose', '']) {
        escribirBusqueda(consulta);
        httpTesting.expectNone(() => true);
      }

      expect(component.puntos()).toBe(originales);
      expect(component.puntos()).toEqual(copia);
    });

    it('asocia la etiqueta al buscador y anuncia solo el resumen de resultados de forma no intrusiva', () => {
      cargarPuntos();
      const input: HTMLInputElement = fixture.nativeElement.querySelector('#mapa-busqueda');
      expect(fixture.nativeElement.querySelector('label[for="mapa-busqueda"]').textContent)
        .toContain('Buscar por nombre, ciudad o departamento');
      expect(input.type).toBe('search');
      expect(input.getAttribute('aria-controls')).toBe('mapa-resultados');

      escribirBusqueda('jose');

      const resumen: HTMLElement = fixture.nativeElement.querySelector('.resultados-header');
      expect(resumen.getAttribute('role')).toBe('status');
      expect(resumen.getAttribute('aria-live')).toBe('polite');
      expect(resumen.getAttribute('aria-atomic')).toBe('true');
      expect(resumen.getAttribute('aria-busy')).toBe('false');
      expect(fixture.nativeElement.querySelectorAll('[aria-live="polite"]').length).toBe(1);
      expect(resumen.textContent).toContain(APP_TEXTOS.mapa.resultadosTitulo);
      expect(resumen.querySelector('.cantidad-resultados')?.textContent).toBe('1');
    });

    it('mantiene abierto el detalle seleccionado aunque la búsqueda excluya ese punto', () => {
      cargarPuntos();
      component.abrirModalDetalle();

      escribirBusqueda('alto');

      expect(component.puntoSeleccionado()).toEqual(PUNTO_MOCK);
      expect(component.mostrarModalDetalle()).toBe(true);
      expect(fixture.nativeElement.querySelector('.detalle-card h2').textContent).toContain(PUNTO_MOCK.nombre);
      expect(mapaStub().puntoSeleccionado).toEqual(PUNTO_MOCK);
      expect(mapaStub().puntos).not.toContainEqual(PUNTO_MOCK);
      httpTesting.expectNone(() => true);
    });

    it('mantiene la búsqueda activa con los filtros de tipo y necesidades deshabilitados', () => {
      component.featureToggles.mapa.filtros = false;
      component.seleccionarFiltroTipo('REFUGIO');
      component.seleccionarFiltroNecesidad('Ropa');
      cargarPuntos();

      escribirBusqueda('jose');

      expect(clavesResultados()).toEqual(['CENTRO-1']);
      expect(fixture.nativeElement.querySelector('[data-filtro-tipo]')).toBeNull();
      expect(fixture.nativeElement.querySelector('[data-filtro-necesidad]')).toBeNull();
      expect(mapaStub().puntos).toEqual([PUNTO_MOCK]);
    });

    it('busca también con el backend desactivado sin realizar solicitudes', () => {
      component.featureToggles.mapa.usarBackend = false;
      fixture.detectChanges();
      const punto = component.puntos()[0];

      escribirBusqueda(punto.nombre.toUpperCase());

      expect(component.puntosFiltrados()).toContainEqual(punto);
      expect(mapaStub().puntos).toEqual(component.puntosFiltrados());
      httpTesting.expectNone(() => true);
    });

    it('busca sin alterar el toggle que oculta el detalle', () => {
      component.featureToggles.mapa.mostrarDetalle = false;
      cargarPuntos();

      escribirBusqueda('alto');

      expect(fixture.nativeElement.querySelector('.columna-derecha')).toBeNull();
      expect(clavesResultados()).toEqual(['PUNTO_AYUDA-1']);
      expect(mapaStub().puntos).toEqual(component.puntosFiltrados());
    });
  });
});


