import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router} from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';
import { firstValueFrom } from 'rxjs';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import { ApiResponse } from '../../../../shared/models/api-response';
import { APP_TEXTOS } from '../../../../shared/constants/app-textos.constants';

// Forma en que el backend devuelve cada departamento
export interface Departamento {
  id: number;
  nombre: string;
}

@Component({
  selector: 'app-registrar-centro',
  standalone: true,
 imports: [FormsModule],
  templateUrl: './registrar-centro.html',
  styleUrl: './registrar-centro.scss'
})
export class RegistrarCentroComponent implements OnInit {
  readonly textos = APP_TEXTOS.registrarCentro;

  constructor(
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer
  ) {}

  // Rutas relativas: proxy.conf.json las envía al backend
  private readonly API_SOLICITUDES = '/api/solicitudes-centro';
  private readonly API_DEPARTAMENTOS = '/api/departamentos';

  // SOS-42: borrador guardado en el navegador
  // Textos -> localStorage | Archivos -> IndexedDB (localStorage no guarda archivos)
    private usuarioEmail = '';

    private readonly DB_NAME = 'SosExeDB';
    private readonly DB_VERSION = 1;
    private readonly STORE_ARCHIVOS = 'archivosBorrador';

    private get BORRADOR_KEY(): string {
      return `registroCentroBorrador_${this.usuarioEmail}`;
    }

    private archivoKey(tipo: string): string {
      return `${this.usuarioEmail}_${tipo}`;
    }

  ngOnInit(): void {
    this.cargarDepartamentos();
    this.cargarBorrador();
  }

  currentStep = 1;
  mostrarModalEnvio = false;
  mostrarModalError = false;
  enviando = false;
  errorEnvio = '';

  // SOS-42: estado del borrador (para los avisos en pantalla)
  borradorRecuperado = false;
  fechaBorrador = '';
  mensajeBorrador = '';
  errorBorrador = false;
  mostrarModalBorrador = false;
  guardandoBorrador = false;

  // ==========================================
  // SESIÓN (el POST exige login; el token lo pone el authInterceptor)
  // ==========================================

  get haySesion(): boolean {
    return typeof localStorage !== 'undefined'
      && !!localStorage.getItem('token');
  }

  irALogin(): void {
    this.router.navigate(['/login']);
  }

  // ==========================================
  // DEPARTAMENTOS (vienen del backend)
  // ==========================================

  departamentos: Departamento[] = [];
  errorDepartamentos = '';

  cargarDepartamentos(): void {
    this.http
      .get<ApiResponse<Departamento[]>>(this.API_DEPARTAMENTOS)
      .subscribe({
        next: (respuesta) => {
          this.departamentos = respuesta.data ?? [];
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error al cargar departamentos:', error);
          this.errorDepartamentos =
            this.textos.errores.departamentos;
          this.cdr.markForCheck();

        }
      });
  }

  // Nombre del departamento elegido (para mostrarlo en pantalla)
  get nombreDepartamento(): string {
    return this.departamentos
      .find(d => d.id === this.departamentoId)?.nombre ?? '';
  }

  // ==========================================
  // VISTA PREVIA DE ARCHIVOS
  // ==========================================

  mostrarModalArchivo = false;
  archivoVistaPrevia: File | null = null;
  urlArchivoVistaPrevia = '';
  urlSeguraVistaPrevia: SafeResourceUrl | null = null; // para el <iframe> del PDF
  esImagenArchivoVistaPrevia = false;

  // ==========================================
  // DATOS DEL CENTRO - PASO 1
  // ==========================================

  nombreCentro = '';
  tipoOrganizacion = '';
  departamentoId: number | null = null;
  nit = '';
  personeriaJuridica = '';
  fechaFundacion = '';
  paginaWeb = '';
  descripcion = '';
  poblacionAtendida = '';

  // ==========================================
  // DATOS DEL RESPONSABLE - PASO 2
  // ==========================================

  nombreResponsable = '';
  cargoResponsable = '';
  documentoResponsable = '';
  correoResponsable = '';
  telefonoResponsable = '';

  ciudad = '';
  departamentoUbicacion = '';
  direccionExacta = '';
  referencia = '';

  // ==========================================
  // DOCUMENTOS - PASO 3
  // ==========================================

  personeriaAdjunta = false;
  nitAdjunto = false;
  identidadAdjunta = false;
  domicilioAdjunto = false;

  // Archivos seleccionados
  personeriaArchivo: File | null = null;
  nitArchivo: File | null = null;
  identidadArchivo: File | null = null;
  domicilioArchivo: File | null = null;

  // Mensaje de error para archivos
  errorArchivo = '';

  // Tamaño máximo permitido: 10 MB
  readonly MAX_FILE_SIZE = 10 * 1024 * 1024;

  // ==========================================
  // CONTADOR DE DOCUMENTOS
  // ==========================================

  get documentosAdjuntos(): number {
    return [
      this.personeriaArchivo,
      this.nitArchivo,
      this.identidadArchivo,
      this.domicilioArchivo
    ].filter(Boolean).length;
  }

  // ==========================================
  // VALIDACIÓN DEL PASO 3
  // ==========================================

  get paso3Valido(): boolean {
    return this.documentosAdjuntos === 4;
  }

  necesidadesSeleccionadas: string[] = [];

  donacionesSeleccionadas: string[] = [];

  actividadesSeleccionadas: string[] = [];

  solicitaVoluntarios: boolean | null = null;

  descripcionVoluntariado = '';

  // ==========================================
  // VALIDACIÓN DEL PASO 4
  // ==========================================

  get paso4Valido(): boolean {

    if (this.necesidadesSeleccionadas.length === 0) {
      return false;
    }

    if (this.donacionesSeleccionadas.length === 0) {
      return false;
    }

    if (this.solicitaVoluntarios === null) {
      return false;
    }

    if (
      this.solicitaVoluntarios &&
      this.actividadesSeleccionadas.length === 0
    ) {
      return false;
    }

    return true;
  }

  // ==========================================
  // SELECCIÓN DE NECESIDADES
  // ==========================================

  alternarNecesidad(necesidad: string): void {

    if (this.necesidadesSeleccionadas.includes(necesidad)) {

      this.necesidadesSeleccionadas =
        this.necesidadesSeleccionadas.filter(
          item => item !== necesidad
        );

    } else {

      this.necesidadesSeleccionadas = [
        ...this.necesidadesSeleccionadas,
        necesidad
      ];

    }
  }

  // ==========================================
  // SELECCIÓN DE DONACIONES
  // ==========================================

  alternarDonacion(donacion: string): void {

    if (this.donacionesSeleccionadas.includes(donacion)) {

      this.donacionesSeleccionadas =
        this.donacionesSeleccionadas.filter(
          item => item !== donacion
        );

    } else {

      this.donacionesSeleccionadas = [
        ...this.donacionesSeleccionadas,
        donacion
      ];

    }
  }

  // ==========================================
  // SELECCIÓN DE ACTIVIDADES
  // ==========================================

  alternarActividad(actividad: string): void {

    if (this.actividadesSeleccionadas.includes(actividad)) {

      this.actividadesSeleccionadas =
        this.actividadesSeleccionadas.filter(
          item => item !== actividad
        );

    } else {

      this.actividadesSeleccionadas = [
        ...this.actividadesSeleccionadas,
        actividad
      ];

    }
  }

  // ==========================================
  // PASO 5 - REVISIÓN Y ENVÍO
  // ==========================================

  // Datos de texto que se envían (sin archivos)
  construirSolicitud() {
    return {
      nombreCentro: this.nombreCentro.trim(),
      tipoOrganizacion: this.tipoOrganizacion,
      departamentoId: this.departamentoId,

      nit: this.nit.trim(),
      personeriaJuridica: this.personeriaJuridica.trim(),
      fechaFundacion: this.fechaFundacion || null, // '' haría fallar el LocalDate
      paginaWeb: this.paginaWeb.trim() || null,
      descripcion: this.descripcion.trim(),
      poblacionAtendida: this.poblacionAtendida.trim() || null,

      nombreResponsable: this.nombreResponsable.trim(),
      cargoResponsable: this.cargoResponsable.trim(),
      documentoResponsable: this.documentoResponsable.trim(),
      correoResponsable: this.correoResponsable.trim(),
      telefonoResponsable: this.telefonoResponsable.trim(),

      ciudad: this.ciudad.trim(),
      departamentoUbicacion: this.departamentoUbicacion,
      direccionExacta: this.direccionExacta.trim(),
      referencia: this.referencia.trim() || null,

      necesidades: this.necesidadesSeleccionadas,
      donaciones: this.donacionesSeleccionadas,

      solicitaVoluntarios: this.solicitaVoluntarios,
      actividadesVoluntariado:
        this.solicitaVoluntarios ? this.actividadesSeleccionadas : [],
      descripcionVoluntariado:
        this.solicitaVoluntarios ? (this.descripcionVoluntariado.trim() || null) : null
    };
  }

  // Paquete multipart: JSON + 4 archivos
  // Los nombres deben coincidir con @RequestPart del backend
  construirFormData(): FormData {

    const formData = new FormData();

    formData.append(
      'solicitud',
      new Blob([JSON.stringify(this.construirSolicitud())], { type: 'application/json' })
    );

    formData.append('personeria', this.personeriaArchivo as File);
    formData.append('nit', this.nitArchivo as File);
    formData.append('identidad', this.identidadArchivo as File);
    formData.append('domicilio', this.domicilioArchivo as File);

    return formData;
  }

  get formularioCompleto(): boolean {
    return this.paso1Valido && this.paso2Valido && this.paso3Valido && this.paso4Valido;
  }

  enviarSolicitud(): void {

    if (this.enviando || !this.formularioCompleto || !this.haySesion) {
      return;
    }

    this.enviando = true;
    this.errorEnvio = '';

    this.http
      .post<ApiResponse<unknown>>(this.API_SOLICITUDES, this.construirFormData())
      .subscribe({
        next: () => {
          this.eliminarBorrador(); // SOS-42: ya no se necesita el borrador
          this.enviando = false;
          this.mostrarModalEnvio = true;
          this.cdr.detectChanges();
        },
        error: (error: HttpErrorResponse) => {
          this.enviando = false;
          console.error('Error al guardar la solicitud:', error);
          this.errorEnvio = this.mensajeDeError(error);
          this.mostrarModalError = true;
          this.cdr.detectChanges();
        }
      });
  }

  private mensajeDeError(error: HttpErrorResponse): string {

  if (error.status === 401) {
    return this.textos.errores.sesionExpirada;
  }

  if (error.status === 413) {
    return this.textos.errores.archivosGrandes;
  }

  if (error.status === 422) {
    return this.textos.errores.datosInvalidos;
  }

  return error.error?.message
    ?? this.textos.errores.errorEnvio;
}

 readonly tiposOrganizacion =
  this.textos.opciones.tiposOrganizacion;

readonly necesidadesDisponibles =
  this.textos.opciones.necesidades;

readonly donacionesDisponibles =
  this.textos.opciones.donaciones;

readonly actividadesVoluntariado =
  this.textos.opciones.actividadesVoluntariado;

  // ==========================================
  // VALIDACIÓN DEL PASO 1
  // ==========================================

  get paso1Valido(): boolean {
    return (
      this.nombreCentro.trim() !== '' &&
      this.tipoOrganizacion !== '' &&
      this.departamentoId !== null &&
      this.nit.trim() !== '' &&
      this.personeriaJuridica.trim() !== '' &&
      this.descripcion.trim() !== ''
    );
  }

  // ==========================================
  // VALIDACIÓN DEL PASO 2
  // ==========================================

  get paso2Valido(): boolean {
    return (
      this.nombreResponsable.trim() !== '' &&
      this.cargoResponsable.trim() !== '' &&
      this.documentoResponsable.trim() !== '' &&
      this.correoResponsable.trim() !== '' &&
      this.telefonoResponsable.trim() !== '' &&
      this.ciudad.trim() !== '' &&
      this.departamentoUbicacion !== '' &&
      this.direccionExacta.trim() !== ''
    );
  }

  // ==========================================
  // DOCUMENTOS
  // ==========================================

  seleccionarPersoneria(event: Event): void {
    const archivo = this.obtenerArchivo(event);

    if (!archivo) {
      return;
    }

    this.personeriaArchivo = archivo;
    this.personeriaAdjunta = true;
    this.errorArchivo = '';
  }

  seleccionarNit(event: Event): void {
    const archivo = this.obtenerArchivo(event);

    if (!archivo) {
      return;
    }

    this.nitArchivo = archivo;
    this.nitAdjunto = true;
    this.errorArchivo = '';
  }

  seleccionarIdentidad(event: Event): void {
    const archivo = this.obtenerArchivo(event);

    if (!archivo) {
      return;
    }

    this.identidadArchivo = archivo;
    this.identidadAdjunta = true;
    this.errorArchivo = '';
  }

  seleccionarDomicilio(event: Event): void {
    const archivo = this.obtenerArchivo(event);

    if (!archivo) {
      return;
    }

    this.domicilioArchivo = archivo;
    this.domicilioAdjunto = true;
    this.errorArchivo = '';
  }

  // ==========================================
  // OBTENER Y VALIDAR ARCHIVO
  // ==========================================

  private obtenerArchivo(event: Event): File | null {

    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      return null;
    }

    const archivo = input.files[0];

    // Validar tipo
    const tiposPermitidos = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/webp'
    ];

    if (!tiposPermitidos.includes(archivo.type)) {

     this.errorArchivo =
       this.textos.archivos.formatoInvalido;

      input.value = '';

      return null;
    }

    // Validar tamaño
    if (archivo.size > this.MAX_FILE_SIZE) {

      this.errorArchivo =
        this.textos.archivos.archivoGrande;

      input.value = '';

      return null;
    }

    return archivo;
  }

  // ==========================================
  // QUITAR ARCHIVOS
  // ==========================================

  quitarPersoneria(): void {
    this.personeriaArchivo = null;
    this.personeriaAdjunta = false;
  }

  quitarNit(): void {
    this.nitArchivo = null;
    this.nitAdjunto = false;
  }

  quitarIdentidad(): void {
    this.identidadArchivo = null;
    this.identidadAdjunta = false;
  }

  quitarDomicilio(): void {
    this.domicilioArchivo = null;
    this.domicilioAdjunto = false;
  }

  // ==========================================
  // VISTA PREVIA
  // ==========================================

  verArchivo(archivo: File | null): void {
    if (!archivo) {
      return;
    }

    this.cerrarVistaPrevia();

    this.archivoVistaPrevia = archivo;
    this.esImagenArchivoVistaPrevia = archivo.type.startsWith('image/');
    this.urlArchivoVistaPrevia = URL.createObjectURL(archivo);

    // Angular bloquea URLs en <iframe> por seguridad; esta es un blob local
    this.urlSeguraVistaPrevia =
      this.sanitizer.bypassSecurityTrustResourceUrl(this.urlArchivoVistaPrevia);

    this.mostrarModalArchivo = true;
  }

  cerrarVistaPrevia(): void {
    if (this.urlArchivoVistaPrevia) {
      URL.revokeObjectURL(this.urlArchivoVistaPrevia);
    }

    this.urlArchivoVistaPrevia = '';
    this.urlSeguraVistaPrevia = null;
    this.archivoVistaPrevia = null;
    this.esImagenArchivoVistaPrevia = false;
    this.mostrarModalArchivo = false;
  }

  // ==========================================
  // NAVEGACIÓN
  // ==========================================

  continuar(): void {

    if (this.currentStep === 1 && !this.paso1Valido) {
      return;
    }

    if (this.currentStep === 2 && !this.paso2Valido) {
      return;
    }

    if (this.currentStep === 3 && !this.paso3Valido) {
      return;
    }

    if (this.currentStep === 4 && !this.paso4Valido) {
      return;
    }

    if (this.currentStep < 5) {
      this.currentStep++;
    }
  }

  volver(): void {

    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  // ==========================================
  // SOS-42: GUARDAR BORRADOR
  // ==========================================

  async guardarBorrador(): Promise<void> {

    // Abre el modal en modo "Guardando..."
    this.mostrarModalBorrador = true;
    this.guardandoBorrador = true;
    this.errorBorrador = false;
    this.cdr.detectChanges();

    const borrador = {
      guardadoEn: new Date().toISOString(),
      currentStep: this.currentStep,

      // Paso 1
      nombreCentro: this.nombreCentro,
      tipoOrganizacion: this.tipoOrganizacion,
      departamentoId: this.departamentoId,
      nit: this.nit,
      personeriaJuridica: this.personeriaJuridica,
      fechaFundacion: this.fechaFundacion,
      paginaWeb: this.paginaWeb,
      descripcion: this.descripcion,
      poblacionAtendida: this.poblacionAtendida,

      // Paso 2
      nombreResponsable: this.nombreResponsable,
      cargoResponsable: this.cargoResponsable,
      documentoResponsable: this.documentoResponsable,
      correoResponsable: this.correoResponsable,
      telefonoResponsable: this.telefonoResponsable,
      ciudad: this.ciudad,
      departamentoUbicacion: this.departamentoUbicacion,
      direccionExacta: this.direccionExacta,
      referencia: this.referencia,

      // Paso 4
      necesidadesSeleccionadas: [...this.necesidadesSeleccionadas],
      donacionesSeleccionadas: [...this.donacionesSeleccionadas],
      solicitaVoluntarios: this.solicitaVoluntarios,
      actividadesSeleccionadas: [...this.actividadesSeleccionadas],
      descripcionVoluntariado: this.descripcionVoluntariado
    };

        try {
      // 1. Textos
      localStorage.setItem(this.BORRADOR_KEY, JSON.stringify(borrador));

      // 2. Archivos (paso 3)
      await this.guardarArchivosBorrador();

      // Pequeña pausa para que se alcance a ver "Guardando..."
      await this.esperar(700);

      this.fechaBorrador = this.formatearFecha(borrador.guardadoEn);
      this.mensajeBorrador = `Borrador guardado · ${this.fechaBorrador}`;

    } catch (error) {
      console.error('Error al guardar el borrador:', error);
      this.errorBorrador = true;
      this.mensajeBorrador = 'No se pudo guardar el borrador. Inténtalo de nuevo.';
    }

    // Cambia el modal a "¡Guardado!" o "Error"
    this.guardandoBorrador = false;
    this.cdr.detectChanges();
  }

  // ==========================================
  // SOS-42: RECUPERAR BORRADOR
  // ==========================================

  async cargarBorrador(): Promise<void> {

    if (typeof localStorage === 'undefined') {
      return;
    }

    const guardado = localStorage.getItem(this.BORRADOR_KEY);

    if (!guardado) {
      return;
    }

    try {
      const b = JSON.parse(guardado);

      this.currentStep = b.currentStep ?? 1;

      // Paso 1
      this.nombreCentro = b.nombreCentro ?? '';
      this.tipoOrganizacion = b.tipoOrganizacion ?? '';
      this.departamentoId = b.departamentoId ?? null;
      this.nit = b.nit ?? '';
      this.personeriaJuridica = b.personeriaJuridica ?? '';
      this.fechaFundacion = b.fechaFundacion ?? '';
      this.paginaWeb = b.paginaWeb ?? '';
      this.descripcion = b.descripcion ?? '';
      this.poblacionAtendida = b.poblacionAtendida ?? '';

      // Paso 2
      this.nombreResponsable = b.nombreResponsable ?? '';
      this.cargoResponsable = b.cargoResponsable ?? '';
      this.documentoResponsable = b.documentoResponsable ?? '';
      this.correoResponsable = b.correoResponsable ?? '';
      this.telefonoResponsable = b.telefonoResponsable ?? '';
      this.ciudad = b.ciudad ?? '';
      this.departamentoUbicacion = b.departamentoUbicacion ?? '';
      this.direccionExacta = b.direccionExacta ?? '';
      this.referencia = b.referencia ?? '';

      // Paso 4
      this.necesidadesSeleccionadas = b.necesidadesSeleccionadas ?? [];
      this.donacionesSeleccionadas = b.donacionesSeleccionadas ?? [];
      this.solicitaVoluntarios = b.solicitaVoluntarios ?? null;
      this.actividadesSeleccionadas = b.actividadesSeleccionadas ?? [];
      this.descripcionVoluntariado = b.descripcionVoluntariado ?? '';

      // Paso 3 (archivos)
      await this.cargarArchivosBorrador();

      this.borradorRecuperado = true;
      this.fechaBorrador = b.guardadoEn ? this.formatearFecha(b.guardadoEn) : '';

    } catch (error) {
      console.error('Error al recuperar el borrador:', error);
      await this.eliminarBorrador(); // borrador dañado: se descarta
    }

    this.cdr.detectChanges();
  }

  // ==========================================
  // SOS-42: DESCARTAR / ELIMINAR BORRADOR
  // ==========================================

  // Botón "Empezar de cero": borra el borrador y limpia el formulario
  async descartarBorrador(): Promise<void> {
    await this.eliminarBorrador();
    window.location.reload();
  }

  async eliminarBorrador(): Promise<void> {

    this.borradorRecuperado = false;

    if (typeof localStorage === 'undefined') {
      return;
    }

    localStorage.removeItem(this.BORRADOR_KEY);

    try {
      const db = await this.abrirBaseDatos();

      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(this.STORE_ARCHIVOS, 'readwrite');
        tx.objectStore(this.STORE_ARCHIVOS).clear();
        tx.oncomplete = () => { db.close(); resolve(); };
        tx.onerror = () => { db.close(); reject(tx.error); };
      });
    } catch (error) {
      console.error('Error al eliminar los archivos del borrador:', error);
    }
  }

  // ==========================================
  // SOS-42: ARCHIVOS EN INDEXEDDB
  // ==========================================

  private abrirBaseDatos(): Promise<IDBDatabase> {

    return new Promise((resolve, reject) => {

      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(this.STORE_ARCHIVOS)) {
          db.createObjectStore(this.STORE_ARCHIVOS);
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  private async guardarArchivosBorrador(): Promise<void> {

    const db = await this.abrirBaseDatos();

    return new Promise((resolve, reject) => {

      const tx = db.transaction(this.STORE_ARCHIVOS, 'readwrite');
      const store = tx.objectStore(this.STORE_ARCHIVOS);

      store.clear();

      if (this.personeriaArchivo) { store.put(this.personeriaArchivo, 'personeria'); }
      if (this.nitArchivo) { store.put(this.nitArchivo, 'nit'); }
      if (this.identidadArchivo) { store.put(this.identidadArchivo, 'identidad'); }
      if (this.domicilioArchivo) { store.put(this.domicilioArchivo, 'domicilio'); }

      tx.oncomplete = () => { db.close(); resolve(); };
      tx.onerror = () => { db.close(); reject(tx.error); };
    });
  }

  private async cargarArchivosBorrador(): Promise<void> {

    const db = await this.abrirBaseDatos();

    const leer = (clave: string) =>
      new Promise<File | null>((resolve, reject) => {
        const tx = db.transaction(this.STORE_ARCHIVOS, 'readonly');
        const request = tx.objectStore(this.STORE_ARCHIVOS).get(clave);
        request.onsuccess = () => resolve(request.result ?? null);
        request.onerror = () => reject(request.error);
      });

    try {
      this.personeriaArchivo = await leer('personeria');
      this.nitArchivo = await leer('nit');
      this.identidadArchivo = await leer('identidad');
      this.domicilioArchivo = await leer('domicilio');

      this.personeriaAdjunta = !!this.personeriaArchivo;
      this.nitAdjunto = !!this.nitArchivo;
      this.identidadAdjunta = !!this.identidadArchivo;
      this.domicilioAdjunto = !!this.domicilioArchivo;
    } finally {
      db.close();
    }
  }

  // ==========================================
  // SOS-42: AYUDAS
  // ==========================================

  // Muestra un aviso pequeño que desaparece solo después de 4 segundos
  // Botón "Seguir completando": cierra el modal y se queda en el mismo paso
  seguirCompletando(): void {
    this.mostrarModalBorrador = false;
  }

  // Botón "Salir y continuar después": el borrador ya está guardado
  salirYContinuarDespues(): void {
    this.mostrarModalBorrador = false;
    this.router.navigate(['/acerca-de']);
  }

  private esperar(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private formatearFecha(iso: string): string {
    return new Date(iso).toLocaleString('es-BO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // ==========================================
  // MODAL DE SOLICITUD ENVIADA
  // ==========================================

  cerrarModalEnvio(): void {
    this.mostrarModalEnvio = false;
    this.router.navigate(['/acerca-de']);
  }

  // ==========================================
  // MODAL DE ERROR
  // ==========================================

  // Cierra el modal y deja al usuario en el formulario (no se pierde nada)
  cerrarModalError(): void {
    this.mostrarModalError = false;
  }

  irALoginDesdeError(): void {
    this.mostrarModalError = false;
    this.irALogin();
  }

  // ==========================================
  // CANCELAR
  // ==========================================

  cancelar(): void {
    window.history.back();
  }
}