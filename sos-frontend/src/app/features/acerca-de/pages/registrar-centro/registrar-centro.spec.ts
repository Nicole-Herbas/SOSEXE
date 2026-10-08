import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { vi } from 'vitest';

import { RegistrarCentroComponent } from './registrar-centro';

describe('RegistrarCentroComponent', () => {

  let component: RegistrarCentroComponent;
  let fixture: ComponentFixture<RegistrarCentroComponent>;
  let httpMock: HttpTestingController;

  const URL_SOLICITUDES = '/api/solicitudes-centro';
  const URL_DEPARTAMENTOS = '/api/departamentos';

  const EMAIL_PRUEBA = 'prueba@sos.com';

  const BORRADOR_KEY =
    `registroCentroBorrador_${EMAIL_PRUEBA}`;

  const departamentosMock = [
    { id: 3, nombre: 'Cochabamba' },
    { id: 2, nombre: 'La Paz' }
  ];

  const crearArchivo = (nombre: string) =>
    new File(
      ['contenido'],
      nombre,
      { type: 'application/pdf' }
    );

  // ============================================================
  // INICIAR SESIÓN DE PRUEBA
  // ============================================================

  const iniciarSesionPrueba = () => {

    localStorage.setItem(
      'token',
      'token-de-prueba'
    );

    localStorage.setItem(
      'usuario_email',
      EMAIL_PRUEBA
    );

    /*
     * RegistrarCentroComponent obtiene el email real
     * mediante AuthService /api/auth/me.
     *
     * En estos tests establecemos directamente el valor
     * privado para evitar hacer una petición HTTP adicional.
     */
    (component as any).usuarioEmail =
      EMAIL_PRUEBA;
  };

  // ============================================================
  // LLENAR FORMULARIO
  // ============================================================

  const llenarFormulario = () => {

    // Paso 1
    component.nombreCentro =
      'Centro San José';

    component.tipoOrganizacion =
      'Refugio';

    component.departamentoId =
      3;

    component.nit =
      '123456';

    component.personeriaJuridica =
      'RES-001';

    component.descripcion =
      'Ayuda a familias';

    // Paso 2
    component.nombreResponsable =
      'Ana Pérez';

    component.cargoResponsable =
      'Directora';

    component.documentoResponsable =
      '1234567';

    component.correoResponsable =
      'ana@centro.org';

    component.telefonoResponsable =
      '70000000';

    component.ciudad =
      'Cochabamba';

    component.departamentoUbicacion =
      'Cochabamba';

    component.direccionExacta =
      'Av. Siempre Viva 123';

    // Paso 3
    component.personeriaArchivo =
      crearArchivo('personeria.pdf');

    component.nitArchivo =
      crearArchivo('nit.pdf');

    component.identidadArchivo =
      crearArchivo('identidad.pdf');

    component.domicilioArchivo =
      crearArchivo('domicilio.pdf');

    // Paso 4
    component.necesidadesSeleccionadas =
      ['Alimentos'];

    component.donacionesSeleccionadas =
      ['Ropa'];

    component.solicitaVoluntarios =
      false;
  };

  // ============================================================
  // CONFIGURACIÓN
  // ============================================================

  beforeEach(async () => {

    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [
        RegistrarCentroComponent
      ],

      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    }).compileComponents();

    fixture =
      TestBed.createComponent(
        RegistrarCentroComponent
      );

    component =
      fixture.componentInstance;

    httpMock =
      TestBed.inject(
        HttpTestingController
      );

    /*
     * ngOnInit():
     * - carga departamentos
     * - como todavía no hay token,
     *   no intenta recuperar borrador
     */
    fixture.detectChanges();

    httpMock
      .expectOne(URL_DEPARTAMENTOS)
      .flush({
        success: true,
        message: 'ok',
        data: departamentosMock,
        timestamp: ''
      });
  });

  // ============================================================
  // LIMPIEZA
  // ============================================================

  afterEach(() => {

    httpMock.verify();

    localStorage.clear();
  });

  // ============================================================
  // PRUEBAS ORIGINALES
  // ============================================================

  it('should create', () => {

    expect(component)
      .toBeTruthy();
  });

  it('should start in step 1', () => {

    expect(component.currentStep)
      .toBe(1);
  });

  it('should not allow continuing with empty required fields', () => {

    expect(component.paso1Valido)
      .toBeFalsy();
  });

  it('should validate step 4 when required options are selected', () => {

    component.necesidadesSeleccionadas =
      ['Alimentos'];

    component.donacionesSeleccionadas =
      ['Ropa'];

    component.solicitaVoluntarios =
      false;

    expect(component.paso4Valido)
      .toBeTruthy();
  });

  it('should not validate step 4 when volunteer activities are missing', () => {

    component.necesidadesSeleccionadas =
      ['Alimentos'];

    component.donacionesSeleccionadas =
      ['Ropa'];

    component.solicitaVoluntarios =
      true;

    component.actividadesSeleccionadas =
      [];

    expect(component.paso4Valido)
      .toBeFalsy();
  });

  it('should validate step 4 when volunteer activities are selected', () => {

    component.necesidadesSeleccionadas =
      ['Alimentos'];

    component.donacionesSeleccionadas =
      ['Ropa'];

    component.solicitaVoluntarios =
      true;

    component.actividadesSeleccionadas =
      ['Logística'];

    expect(component.paso4Valido)
      .toBeTruthy();
  });

  // ============================================================
  // SOS-41
  // ============================================================

  it('should load departamentos from the backend', () => {

    expect(component.departamentos)
      .toEqual(departamentosMock);

    component.departamentoId =
      3;

    expect(component.nombreDepartamento)
      .toBe('Cochabamba');
  });

  it('should build the payload with the real departamentoId', () => {

    llenarFormulario();

    const solicitud =
      component.construirSolicitud();

    expect(solicitud.departamentoId)
      .toBe(3);

    expect(solicitud.fechaFundacion)
      .toBeNull();

    expect(solicitud.necesidades)
      .toEqual(['Alimentos']);
  });

  it('should send a multipart POST with the data and the 4 files', async () => {

    iniciarSesionPrueba();

    llenarFormulario();

    /*
     * Después de enviar correctamente,
     * el componente elimina el borrador.
     *
     * No necesitamos probar IndexedDB en este test;
     * eso se prueba en los tests específicos del borrador.
     */
    vi.spyOn(
      component,
      'eliminarBorrador'
    ).mockResolvedValue(undefined);

    component.enviarSolicitud();

    const req =
      httpMock.expectOne(
        URL_SOLICITUDES
      );

    expect(req.request.method)
      .toBe('POST');

    expect(
      req.request.body instanceof FormData
    ).toBe(true);

    const body =
      req.request.body as FormData;

    expect(
      body.get('solicitud')
    ).toBeTruthy();

    expect(
      (body.get('personeria') as File).name
    ).toBe('personeria.pdf');

    expect(
      (body.get('nit') as File).name
    ).toBe('nit.pdf');

    expect(
      (body.get('identidad') as File).name
    ).toBe('identidad.pdf');

    expect(
      (body.get('domicilio') as File).name
    ).toBe('domicilio.pdf');

    req.flush({
      success: true,
      message: 'creado',
      data: { id: 1 },
      timestamp: ''
    });

    await fixture.whenStable();

    expect(
      component.mostrarModalEnvio
    ).toBe(true);
  });

  it('should show the backend message when the POST fails', async () => {

    iniciarSesionPrueba();

    llenarFormulario();

    component.enviarSolicitud();

    httpMock
      .expectOne(URL_SOLICITUDES)
      .flush(
        {
          success: false,
          message: 'Falta el documento: NIT'
        },
        {
          status: 400,
          statusText: 'Bad Request'
        }
      );

    await fixture.whenStable();

    expect(
      component.errorEnvio
    ).toBe(
      'Falta el documento: NIT'
    );

    expect(
      component.mostrarModalError
    ).toBe(true);
  });

  it('should not send anything without a session', () => {

    llenarFormulario();

    component.enviarSolicitud();

    httpMock.expectNone(
      URL_SOLICITUDES
    );
  });

  // ============================================================
  // SOS-42 - GUARDAR BORRADOR
  // ============================================================

  it('should save the draft text in localStorage', async () => {

    iniciarSesionPrueba();

    /*
     * IndexedDB no se prueba aquí.
     * Simulamos correctamente el guardado de archivos.
     */
    vi.spyOn(
      component as any,
      'guardarArchivosBorrador'
    ).mockResolvedValue(undefined);

    component.currentStep =
      2;

    component.nombreCentro =
      'Centro San José';

    component.departamentoId =
      3;

    component.necesidadesSeleccionadas =
      ['Alimentos'];

    await component.guardarBorrador();

    const guardado =
      JSON.parse(
        localStorage.getItem(
          BORRADOR_KEY
        )!
      );

    expect(
      guardado.currentStep
    ).toBe(2);

    expect(
      guardado.nombreCentro
    ).toBe(
      'Centro San José'
    );

    expect(
      guardado.departamentoId
    ).toBe(3);

    expect(
      guardado.necesidadesSeleccionadas
    ).toEqual(
      ['Alimentos']
    );

    expect(
      component.mensajeBorrador
    ).toContain(
      'Borrador guardado'
    );
  });

  // ============================================================
  // SOS-42 - RECUPERAR BORRADOR
  // ============================================================

  it('should recover the draft with the same information', async () => {

    iniciarSesionPrueba();

    /*
     * Simulamos IndexedDB porque este test
     * solamente comprueba la recuperación
     * de los datos del formulario.
     */
    vi.spyOn(
      component as any,
      'cargarArchivosBorrador'
    ).mockResolvedValue(undefined);

    localStorage.setItem(
      BORRADOR_KEY,
      JSON.stringify({
        guardadoEn:
          new Date().toISOString(),

        currentStep:
          3,

        nombreCentro:
          'Refugio Esperanza',

        departamentoId:
          2,

        solicitaVoluntarios:
          true,

        actividadesSeleccionadas:
          ['Cocina']
      })
    );

    await component.cargarBorrador();

    expect(
      component.currentStep
    ).toBe(3);

    expect(
      component.nombreCentro
    ).toBe(
      'Refugio Esperanza'
    );

    expect(
      component.departamentoId
    ).toBe(2);

    expect(
      component.actividadesSeleccionadas
    ).toEqual(
      ['Cocina']
    );

    expect(
      component.borradorRecuperado
    ).toBe(true);
  });

  it('should not recover anything when there is no draft', async () => {

    await component.cargarBorrador();

    expect(
      component.currentStep
    ).toBe(1);

    expect(
      component.borradorRecuperado
    ).toBe(false);
  });

  // ============================================================
  // SOS-42 - ELIMINAR BORRADOR DESPUÉS DEL ENVÍO
  // ============================================================

  it('should delete the draft after a successful submission', async () => {

    iniciarSesionPrueba();

    llenarFormulario();

    const eliminar =
      vi.spyOn(
        component,
        'eliminarBorrador'
      ).mockResolvedValue(undefined);

    component.enviarSolicitud();

    const req =
      httpMock.expectOne(
        URL_SOLICITUDES
      );

    expect(
      req.request.method
    ).toBe('POST');

    req.flush({
      success: true,
      message: 'creado',
      data: { id: 1 },
      timestamp: ''
    });

    await fixture.whenStable();

    expect(
      eliminar
    ).toHaveBeenCalled();

    expect(
      component.mostrarModalEnvio
    ).toBe(true);
  });

});