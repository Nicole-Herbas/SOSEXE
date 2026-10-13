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

  describe('detalle completo SOS-36', () => {
    function cargarDetalle(punto: PuntoMapa): void {
      fixture.detectChanges();
      httpTesting.expectOne('/api/mapa/puntos').flush({
        success: true, message: 'OK', data: [punto], timestamp: '',
      });
      responderDetalle(punto);
      component.abrirModalDetalle();
      fixture.detectChanges();
    }

    function vistas(): HTMLElement[] {
      return [
        fixture.nativeElement.querySelector('.detalle-card'),
        fixture.nativeElement.querySelector('.detalle-modal'),
      ];
    }

    it('comparte horario, donaciones y descripción restante entre panel y modal', () => {
      const descripcion = 'Colecta comunitaria\nHorario: Lun-Vie 09:00–17:00\nDonaciones aceptadas: Agua, Ropa\nTraer bolsas';
      cargarDetalle({ ...PUNTO_REFUGIO_MOCK, descripcion, direccion: 'Av. Principal 123' });

      for (const vista of vistas()) {
        expect(vista.querySelector('.detalle-horario p')?.textContent).toContain('Lun-Vie 09:00–17:00');
        expect(vista.querySelector('.detalle-donaciones p')?.textContent).toContain('Agua, Ropa');
        const texto = vista.querySelector('.descripcion, .detalle-modal-descripcion')?.textContent ?? '';
        expect(texto).toContain('Colecta comunitaria');
        expect(texto).toContain('Traer bolsas');
        expect(texto).not.toContain('Horario:');
        expect(texto).not.toContain('Donaciones aceptadas:');
        expect(vista.textContent).toContain('Av. Principal 123');
      }
      // La extracción es exclusivamente de presentación.
      expect(component.puntoSeleccionado()?.descripcion).toBe(descripcion);
      expect(component.puntos()[0].descripcion).toBe(descripcion);
      httpTesting.expectNone(() => true);
    });

    it.each([undefined, '', 'Texto antiguo sin datos complementarios'])('muestra No informado sin inferir donaciones de las necesidades: %s', (descripcion) => {
      cargarDetalle({ ...PUNTO_MOCK, descripcion });

      for (const vista of vistas()) {
        expect(vista.querySelector('.detalle-horario p')?.textContent?.trim()).toBe(APP_TEXTOS.mapa.detalle.noInformado);
        expect(vista.querySelector('.detalle-donaciones p')?.textContent?.trim()).toBe(APP_TEXTOS.mapa.detalle.noInformado);
        expect(vista.textContent).toContain('Agua');
        expect(vista.textContent).toContain('Alimentos');
        if (descripcion) expect(vista.textContent).toContain(descripcion);
      }
    });

    it('conserva teléfono y correo públicos de los centros en ambas vistas', () => {
      cargarDetalle({ ...PUNTO_MOCK, telefono: '71234567', email: 'centro@example.org' });

      for (const vista of vistas()) {
        const contacto = vista.querySelector('.detalle-contacto');
        expect(contacto?.textContent).toContain('71234567');
        expect(contacto?.querySelector('a')?.getAttribute('href')).toBe('mailto:centro@example.org');
      }
    });

    it('no muestra campos personales de registro aunque lleguen como propiedades adicionales', () => {
      cargarDetalle({
        ...PUNTO_REFUGIO_MOCK,
        nombreContacto: 'Contacto privado', telefonoContacto: '79999999', correoContacto: 'privado@example.org',
      } as PuntoMapa);

      for (const vista of vistas()) {
        expect(vista.querySelector('.detalle-contacto p')?.textContent?.trim()).toBe(APP_TEXTOS.mapa.detalle.noInformado);
        expect(vista.textContent).not.toContain('Contacto privado');
        expect(vista.textContent).not.toContain('79999999');
        expect(vista.textContent).not.toContain('privado@example.org');
      }
    });

    it('muestra las secciones sin datos como No informado', () => {
      cargarDetalle({ ...PUNTO_MOCK, direccion: undefined, necesidades: [] });

      for (const vista of vistas()) {
        for (const etiqueta of [
          APP_TEXTOS.mapa.detalle.direccionEtiqueta, APP_TEXTOS.mapa.detalle.contactoEtiqueta,
          APP_TEXTOS.mapa.detalle.necesidadesEtiqueta,
        ]) {
          const bloque = Array.from(vista.querySelectorAll('.detalle-dato, .modal-bloque'))
            .find((elemento) => elemento.querySelector('span')?.textContent?.trim() === etiqueta);
          expect(bloque?.querySelector('p')?.textContent?.trim()).toBe(APP_TEXTOS.mapa.detalle.noInformado);
        }
      }
    });

    it.each([
      ['VERIFICADO', 'verificado', APP_TEXTOS.mapa.verificado],
      ['PENDIENTE', 'pendiente', APP_TEXTOS.mapa.verificacionPendiente],
      ['RECHAZADO', 'rechazado', APP_TEXTOS.mapa.detalle.verificacionRechazada],
      ['ESTADO_DESCONOCIDO', 'desconocido', APP_TEXTOS.mapa.detalle.noInformado],
    ])('distingue el estado %s con igual etiqueta en panel y modal', (estado, clase, etiqueta) => {
      cargarDetalle({ ...PUNTO_MOCK, estadoVerificacion: estado });

      const lateral = fixture.nativeElement.querySelector('.detalle-card .tag-verificado') as HTMLElement;
      const modal = fixture.nativeElement.querySelector(`.detalle-modal .modal-${clase}`) as HTMLElement;
      expect(lateral.textContent?.trim()).toBe(etiqueta);
      expect(modal.textContent?.trim()).toBe(etiqueta);
      if (clase !== 'verificado') expect(lateral.classList.contains(clase)).toBe(true);
      if (estado === 'RECHAZADO') {
        expect(lateral.classList.contains('pendiente')).toBe(false);
        expect(fixture.nativeElement.querySelector('.detalle-modal .modal-pendiente')).toBeNull();
      }
    });

    it('recalcula los campos complementarios al cambiar de punto sin reutilizar datos anteriores', () => {
      cargarDetalle({ ...PUNTO_MOCK, descripcion: 'Horario: 09:00–16:00\nDonaciones aceptadas: Agua' });

      component.seleccionarPunto(PUNTO_REFUGIO_MOCK);
      responderDetalle(PUNTO_REFUGIO_MOCK);

      for (const vista of vistas()) {
        expect(vista.querySelector('.detalle-horario p')?.textContent?.trim()).toBe(APP_TEXTOS.mapa.detalle.noInformado);
        expect(vista.querySelector('.detalle-donaciones p')?.textContent?.trim()).toBe(APP_TEXTOS.mapa.detalle.noInformado);
      }
    });

    it('conserva búsqueda, filtros y selección al mostrar el detalle complementario', () => {
      cargarDetalle({ ...PUNTO_MOCK, descripcion: 'Horario: 09:00–16:00\nDonaciones aceptadas: Ropa' });
      component.seleccionarFiltroTipo('REFUGIO');
      const input: HTMLInputElement = fixture.nativeElement.querySelector('.bloque-busqueda input');
      input.value = 'otra ciudad';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(component.puntosFiltrados()).toEqual([]);
      expect(component.puntoSeleccionado()?.id).toBe(PUNTO_MOCK.id);
      expect(component.mostrarModalDetalle()).toBe(true);
      expect(fixture.nativeElement.querySelector('.detalle-card .detalle-horario p').textContent).toContain('09:00–16:00');
      const mapa = fixture.debugElement.query(By.directive(MapaLeafletStub)).componentInstance as MapaLeafletStub;
      expect(mapa.puntos).toEqual([]);
      httpTesting.expectNone(() => true);
    });
  });
});


