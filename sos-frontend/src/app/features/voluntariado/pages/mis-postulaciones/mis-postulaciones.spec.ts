import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';

import {
  provideRouter,
  Router
} from '@angular/router';

import {
  of,
  throwError
} from 'rxjs';

import { vi } from 'vitest';

import { MisPostulaciones }
  from './mis-postulaciones';

import { PostulacionService }
  from '../voluntariado/services/postulacion.service';

import { AuthService }
  from '../../../auth/services/auth.service';


describe('MisPostulaciones', () => {

  let component: MisPostulaciones;

  let fixture:
    ComponentFixture<MisPostulaciones>;


  const listarMiasMock =
    vi.fn();


  const authServiceMock = {

    estaAutenticado:
      vi.fn(),

    obtenerNombreUsuario:
      vi.fn()

  };


  beforeEach(async () => {

    listarMiasMock.mockReset();

    authServiceMock.estaAutenticado
      .mockReturnValue(true);

    authServiceMock.obtenerNombreUsuario
      .mockReturnValue('Usuario Wendy');

    listarMiasMock
      .mockReturnValue(of([]));


    await TestBed.configureTestingModule({

      imports: [
        MisPostulaciones
      ],

      providers: [

        provideRouter([]),

        {
          provide: PostulacionService,

          useValue: {
            listarMias:
              listarMiasMock
          }
        },

        {
          provide: AuthService,

          useValue:
            authServiceMock
        }

      ]

    })
      .compileComponents();


    fixture =
      TestBed.createComponent(
        MisPostulaciones
      );

    component =
      fixture.componentInstance;

  });


  it('should create', () => {

    expect(component)
      .toBeTruthy();

  });


  it('should load the authenticated user postulaciones', () => {

    listarMiasMock.mockReturnValue(

      of([

        {
          id: 1,

          voluntariadoId: 10,

          usuarioId: 5,

          fechaPostulacion:
            '2026-10-08T10:30:00',

          estado:
            'PENDIENTE',

          disponibilidad:
            'Mañana',

          comentario:
            'Puedo ayudar durante la mañana.',

          voluntariadoTitulo:
            'Apoyo en distribución de alimentos',

          usuarioNombre:
            'Usuario Wendy'

        }

      ])

    );


    fixture.detectChanges();


    expect(
      component.postulaciones.length
    ).toBe(1);


    expect(
      component.postulaciones[0]
        .voluntariadoTitulo
    ).toBe(
      'Apoyo en distribución de alimentos'
    );


    expect(
      component.postulaciones[0].estado
    ).toBe('PENDIENTE');


    expect(
      component.nombreUsuario
    ).toBe('Usuario Wendy');

  });


  it('should count postulation states correctly', () => {

    component.postulaciones = [

      {
        id: 1,
        voluntariadoId: 10,
        usuarioId: 5,
        estado: 'PENDIENTE',
        voluntariadoTitulo: 'Oportunidad 1'
      },

      {
        id: 2,
        voluntariadoId: 11,
        usuarioId: 5,
        estado: 'APROBADO',
        voluntariadoTitulo: 'Oportunidad 2'
      },

      {
        id: 3,
        voluntariadoId: 12,
        usuarioId: 5,
        estado: 'RECHAZADO',
        voluntariadoTitulo: 'Oportunidad 3'
      }

    ];


    expect(
      component.cantidadPorEstado(
        'PENDIENTE'
      )
    ).toBe(1);


    expect(
      component.cantidadPorEstado(
        'APROBADO'
      )
    ).toBe(1);


    expect(
      component.cantidadPorEstado(
        'RECHAZADO'
      )
    ).toBe(1);

  });


  it('should translate the postulation states', () => {

    expect(
      component.estadoTexto('PENDIENTE')
    ).toBe('Pendiente');


    expect(
      component.estadoTexto('APROBADO')
    ).toBe('Aprobada');


    expect(
      component.estadoTexto('RECHAZADO')
    ).toBe('Rechazada');

  });


  it('should show an error when loading fails', () => {

    listarMiasMock.mockReturnValue(

      throwError(
        () => new Error('Error de prueba')
      )

    );


    fixture.detectChanges();


    expect(
      component.cargando
    ).toBe(false);


    expect(
      component.error
    ).toContain(
      'No pudimos cargar'
    );

  });


  it('should redirect to login when there is no session', () => {

    authServiceMock.estaAutenticado
      .mockReturnValue(false);


    const router =
      TestBed.inject(Router);

    const navigateSpy =
      vi.spyOn(
        router,
        'navigate'
      );


    fixture.detectChanges();


    expect(
      navigateSpy
    ).toHaveBeenCalledWith([
      '/login'
    ]);


    expect(
      listarMiasMock
    ).not.toHaveBeenCalled();

  });


  it('should format the date correctly', () => {

    const resultado =
      component.formatearFecha(
        '2026-10-08T10:30:00'
      );


    expect(resultado)
      .toContain('2026');


    expect(resultado)
      .toContain('octubre');

  });

});