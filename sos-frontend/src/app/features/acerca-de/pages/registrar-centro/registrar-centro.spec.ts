import 'fake-indexeddb/auto';
import { IDBFactory } from 'fake-indexeddb';

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { vi } from 'vitest';

import { RegistrarCentroComponent } from './registrar-centro';
import {
  archivosVacios,
  cargarArchivosBorrador,
  claveBorrador,
  guardarArchivosBorrador
} from '../../utils/borrador-registro-centro';

/**
 * SOS-42: las pruebas de borrador usan IndexedDB REAL (fake-indexeddb),
 * sin simular los métodos de guardado ni de recuperación.
 */
describe('RegistrarCentroComponent', () => {

  let component: RegistrarCentroComponent;
  let fixture: ComponentFixture<RegistrarCentroComponent>;
  let httpMock: HttpTestingController;

  const URL_SOLICITUDES = '/api/solicitudes-centro';
  const URL_DEPARTAMENTOS = '/api/departamentos';
  const URL_ME = '/api/auth/me';

  const EMAIL_PRUEBA = 'prueba@sos.com';
  const OTRO_EMAIL = 'otro@sos.com';

  const BORRADOR_KEY = claveBorrador(EMAIL_PRUEBA);

  const departamentosMock = [
    { id: 3, nombre: 'Cochabamba' },
    { id: 2, nombre: 'La Paz' }
  ];

  const crearArchivo = (nombre: string, contenido = 'contenido') =>
    new File([contenido], nombre, { type: 'application/pdf' });

  // ============================================================
  // AYUDAS
  // ============================================================

  const iniciarSesionPrueba = (c = component, email = EMAIL_PRUEBA) => {
    localStorage.setItem('token', 'token-de-prueba');
    localStorage.setItem('usuario_email', email);

    // El componente obtiene el email con /api/auth/me en ngOnInit;
    // aquí lo fijamos directamente para el componente ya creado.
    (c as any).usuarioEmail = email;
  };

  const llenarFormulario = (c = component) => {
    // Paso 1
    c.nombreCentro = 'Centro San José';
    c.tipoOrganizacion = 'Refugio';
    c.departamentoId = 3;
    c.nit = '123456';
    c.personeriaJuridica = 'RES-001';
    c.descripcion = 'Ayuda a familias';

    // Paso 2
    c.nombreResponsable = 'Ana Pérez';
    c.cargoResponsable = 'Directora';
    c.documentoResponsable = '1234567';
    c.correoResponsable = 'ana@centro.org';
    c.telefonoResponsable = '70000000';
    c.ciudad = 'Cochabamba';
    c.departamentoUbicacion = 'Cochabamba';
    c.direccionExacta = 'Av. Siempre Viva 123';

    // Paso 3
    c.personeriaArchivo = crearArchivo('personeria.pdf', 'PDF personeria');
    c.nitArchivo = crearArchivo('nit.pdf', 'PDF nit');
    c.identidadArchivo = crearArchivo('identidad.pdf', 'PDF identidad');
    c.domicilioArchivo = crearArchivo('domicilio.pdf', 'PDF domicilio');

    // Paso 4
    c.necesidadesSeleccionadas = ['Alimentos'];
    c.donacionesSeleccionadas = ['Ropa'];
    c.solicitaVoluntarios = false;
  };

  /**
   * Simula recargar la página con sesión iniciada:
   * crea un componente NUEVO y responde /departamentos y /auth/me.
   */
  const recargarPagina = async (email = EMAIL_PRUEBA) => {

    localStorage.setItem('token', 'token-de-prueba');

    const nuevoFixture = TestBed.createComponent(RegistrarCentroComponent);
    const nuevo = nuevoFixture.componentInstance;

    nuevoFixture.detectChanges(); // ngOnInit

    httpMock.expectOne(URL_DEPARTAMENTOS).flush({
      success: true, message: 'ok', data: departamentosMock, timestamp: ''
    });

    httpMock.expectOne(URL_ME).flush({
      id: 1, nombre: 'Usuario', email, rol: 'USER'
    });

    // Espera a que termine la lectura asíncrona de localStorage + IndexedDB
    await vi.waitFor(() => {
      expect((nuevo as any).usuarioEmail).toBe(email);
    });
    await new Promise(resolve => setTimeout(resolve, 50));

    return nuevo;
  };

  // ============================================================
  // CONFIGURACIÓN
  // ============================================================

  beforeEach(async () => {

    localStorage.clear();

    // IndexedDB nuevo y vacío en cada prueba
    (globalThis as any).indexedDB = new IDBFactory();

    await TestBed.configureTestingModule({
      imports: [RegistrarCentroComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegistrarCentroComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);

    // Sin token: ngOnInit solo carga departamentos
    fixture.detectChanges();

    httpMock.expectOne(URL_DEPARTAMENTOS).flush({
      success: true, message: 'ok', data: departamentosMock, timestamp: ''
    });
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  // ============================================================
  // PRUEBAS ORIGINALES
  // ============================================================

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start in step 1', () => {
    expect(component.currentStep).toBe(1);
  });

  it('should not allow continuing with empty required fields', () => {
    expect(component.paso1Valido).toBeFalsy();
  });

  it('should validate step 4 when required options are selected', () => {
    component.necesidadesSeleccionadas = ['Alimentos'];
    component.donacionesSeleccionadas = ['Ropa'];
    component.solicitaVoluntarios = false;

    expect(component.paso4Valido).toBeTruthy();
  });

  it('should not validate step 4 when volunteer activities are missing', () => {
    component.necesidadesSeleccionadas = ['Alimentos'];
    component.donacionesSeleccionadas = ['Ropa'];
    component.solicitaVoluntarios = true;
    component.actividadesSeleccionadas = [];

    expect(component.paso4Valido).toBeFalsy();
  });

  it('should validate step 4 when volunteer activities are selected', () => {
    component.necesidadesSeleccionadas = ['Alimentos'];
    component.donacionesSeleccionadas = ['Ropa'];
    component.solicitaVoluntarios = true;
    component.actividadesSeleccionadas = ['Logística'];

    expect(component.paso4Valido).toBeTruthy();
  });

  // ============================================================
  // SOS-41
  // ============================================================

  it('should load departamentos from the backend', () => {
    expect(component.departamentos).toEqual(departamentosMock);

    component.departamentoId = 3;
    expect(component.nombreDepartamento).toBe('Cochabamba');
  });

  it('should build the payload with the real departamentoId', () => {
    llenarFormulario();

    const solicitud = component.construirSolicitud();

    expect(solicitud.departamentoId).toBe(3);
    expect(solicitud.fechaFundacion).toBeNull();
    expect(solicitud.necesidades).toEqual(['Alimentos']);
  });

  it('should send a multipart POST with the data and the 4 files', async () => {
    iniciarSesionPrueba();
    llenarFormulario();

    component.enviarSolicitud();

    const req = httpMock.expectOne(URL_SOLICITUDES);

    expect(req.request.method).toBe('POST');
    expect(req.request.body instanceof FormData).toBe(true);

    const body = req.request.body as FormData;
    expect(body.get('solicitud')).toBeTruthy();
    expect((body.get('personeria') as File).name).toBe('personeria.pdf');
    expect((body.get('nit') as File).name).toBe('nit.pdf');
    expect((body.get('identidad') as File).name).toBe('identidad.pdf');
    expect((body.get('domicilio') as File).name).toBe('domicilio.pdf');

    req.flush({ success: true, message: 'creado', data: { id: 1 }, timestamp: '' });

    await vi.waitFor(() => expect(component.mostrarModalEnvio).toBe(true));
  });

  it('should show the backend message when the POST fails', async () => {
    iniciarSesionPrueba();
    llenarFormulario();

    component.enviarSolicitud();

    httpMock.expectOne(URL_SOLICITUDES).flush(
      { success: false, message: 'Falta el documento: NIT' },
      { status: 400, statusText: 'Bad Request' }
    );

    expect(component.errorEnvio).toBe('Falta el documento: NIT');
    expect(component.mostrarModalError).toBe(true);
  });

  it('should not send anything without a session', () => {
    llenarFormulario();

    component.enviarSolicitud();

    httpMock.expectNone(URL_SOLICITUDES);
  });

  // ============================================================
  // SOS-42 - GUARDAR Y RECUPERAR (IndexedDB real)
  // ============================================================

  it('guarda y, al recargar la página, recupera texto, paso y los 4 documentos', async () => {
    iniciarSesionPrueba();
    llenarFormulario();
    component.currentStep = 4;

    await component.guardarBorrador();

    expect(component.errorBorrador).toBe(false);
    expect(component.mensajeBorrador).toContain('Borrador guardado');

    const recuperado = await recargarPagina();

    expect(recuperado.borradorRecuperado).toBe(true);
    expect(recuperado.currentStep).toBe(4);
    expect(recuperado.nombreCentro).toBe('Centro San José');
    expect(recuperado.departamentoId).toBe(3);
    expect(recuperado.necesidadesSeleccionadas).toEqual(['Alimentos']);

    expect(recuperado.personeriaArchivo?.name).toBe('personeria.pdf');
    expect(await recuperado.personeriaArchivo?.text()).toBe('PDF personeria');
    expect(await recuperado.nitArchivo?.text()).toBe('PDF nit');
    expect(await recuperado.identidadArchivo?.text()).toBe('PDF identidad');
    expect(await recuperado.domicilioArchivo?.text()).toBe('PDF domicilio');
    expect(recuperado.documentosAdjuntos).toBe(4);
    expect(recuperado.paso3Valido).toBe(true);
  });

  it('should not recover anything when there is no draft', async () => {
    const recuperado = await recargarPagina();

    expect(recuperado.currentStep).toBe(1);
    expect(recuperado.borradorRecuperado).toBe(false);
  });

  // ============================================================
  // SOS-42 - AISLAMIENTO Y PRIVACIDAD
  // ============================================================

  it('no recupera el borrador de otro usuario en el mismo navegador', async () => {
    iniciarSesionPrueba(component, EMAIL_PRUEBA);
    llenarFormulario();
    await component.guardarBorrador();

    const deOtro = await recargarPagina(OTRO_EMAIL);

    expect(deOtro.borradorRecuperado).toBe(false);
    expect(deOtro.nombreCentro).toBe('');
    expect(deOtro.personeriaArchivo).toBeNull();

    // El borrador del primer usuario sigue intacto
    expect(localStorage.getItem(BORRADOR_KEY)).not.toBeNull();
  });

  it('elimina un borrador vencido (más de 7 días) y avisa al usuario', async () => {
    const hace8Dias = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString();

    localStorage.setItem(BORRADOR_KEY, JSON.stringify({
      guardadoEn: hace8Dias,
      propietario: EMAIL_PRUEBA,
      currentStep: 3,
      nombreCentro: 'Viejo'
    }));
    await guardarArchivosBorrador(EMAIL_PRUEBA, {
      ...archivosVacios(),
      nit: crearArchivo('viejo.pdf')
    });

    const recuperado = await recargarPagina();

    expect(recuperado.borradorRecuperado).toBe(false);
    expect(recuperado.avisoBorradorVencido).toBe(true);
    expect(recuperado.nombreCentro).toBe('');
    expect(localStorage.getItem(BORRADOR_KEY)).toBeNull();
    expect(await cargarArchivosBorrador(EMAIL_PRUEBA)).toEqual(archivosVacios());
  });

  it('si IndexedDB está bloqueado, muestra error y no deja un borrador a medias', async () => {
    iniciarSesionPrueba();
    llenarFormulario();

    (globalThis as any).indexedDB = undefined;

    await component.guardarBorrador();

    expect(component.errorBorrador).toBe(true);
    expect(component.mensajeBorrador).toContain('No se pudo guardar');
    expect(localStorage.getItem(BORRADOR_KEY)).toBeNull();
  });

  it('si falla IndexedDB, conserva el borrador anterior que ya estaba guardado', async () => {
    iniciarSesionPrueba();
    llenarFormulario();
    await component.guardarBorrador();

    const anterior = localStorage.getItem(BORRADOR_KEY);

    component.nombreCentro = 'Cambio que no se pudo guardar';
    (globalThis as any).indexedDB = undefined;

    await component.guardarBorrador();

    expect(component.errorBorrador).toBe(true);
    expect(localStorage.getItem(BORRADOR_KEY)).toBe(anterior);
  });

  // ============================================================
  // SOS-42 - LIMPIEZA TRAS EL ENVÍO
  // ============================================================

  it('201: elimina por completo el borrador (texto + documentos)', async () => {
    iniciarSesionPrueba();
    llenarFormulario();
    await component.guardarBorrador();

    component.enviarSolicitud();

    httpMock.expectOne(URL_SOLICITUDES).flush(
      { success: true, message: 'creado', data: { id: 1 }, timestamp: '' },
      { status: 201, statusText: 'Created' }
    );

    await vi.waitFor(() => expect(component.mostrarModalEnvio).toBe(true));

    expect(localStorage.getItem(BORRADOR_KEY)).toBeNull();
    expect(await cargarArchivosBorrador(EMAIL_PRUEBA)).toEqual(archivosVacios());
  });

  it('500: conserva el borrador para no perder el trabajo', async () => {
    iniciarSesionPrueba();
    llenarFormulario();
    await component.guardarBorrador();

    component.enviarSolicitud();

    httpMock.expectOne(URL_SOLICITUDES).flush(
      { success: false, message: 'Error interno del servidor' },
      { status: 500, statusText: 'Server Error' }
    );

    expect(component.mostrarModalError).toBe(true);
    expect(localStorage.getItem(BORRADOR_KEY)).not.toBeNull();

    const archivos = await cargarArchivosBorrador(EMAIL_PRUEBA);
    expect(archivos.personeria?.name).toBe('personeria.pdf');
  });

  it('201 de un usuario no borra el borrador de otro usuario', async () => {
    localStorage.setItem(claveBorrador(OTRO_EMAIL), '{"nombreCentro":"Otro"}');
    await guardarArchivosBorrador(OTRO_EMAIL, {
      ...archivosVacios(),
      nit: crearArchivo('otro.pdf')
    });

    iniciarSesionPrueba();
    llenarFormulario();
    await component.guardarBorrador();

    component.enviarSolicitud();

    httpMock.expectOne(URL_SOLICITUDES).flush(
      { success: true, message: 'creado', data: { id: 1 }, timestamp: '' }
    );

    await vi.waitFor(() => expect(component.mostrarModalEnvio).toBe(true));

    expect(localStorage.getItem(claveBorrador(OTRO_EMAIL))).not.toBeNull();
    expect((await cargarArchivosBorrador(OTRO_EMAIL)).nit?.name).toBe('otro.pdf');
  });
});