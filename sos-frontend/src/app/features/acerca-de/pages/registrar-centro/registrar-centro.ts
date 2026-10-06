import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
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
 imports: [FormsModule, RouterLink],
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

  ngOnInit(): void {
    this.cargarDepartamentos();
  }

  currentStep = 1;
  mostrarModalEnvio = false;
  mostrarModalError = false;
  enviando = false;
  errorEnvio = '';

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
          this.cdr.markForCheck();
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
          console.log('✅ Solicitud guardada, mostrando modal');
          this.enviando = false;
          this.mostrarModalEnvio = true;
          this.cdr.detectChanges();
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error al guardar la solicitud:', error);
          this.enviando = false;
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
        'Formato no válido. Solo se permiten archivos PDF, JPG, PNG o WEBP.';

      input.value = '';

      return null;
    }

    // Validar tamaño
    if (archivo.size > this.MAX_FILE_SIZE) {

      this.errorArchivo =
        'El archivo es demasiado grande. El tamaño máximo permitido es de 10 MB.';

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
  // GUARDAR BORRADOR (se completa en SOS-42)
  // ==========================================

  guardarBorrador(): void {

    console.log('Borrador guardado:', {

      nombreCentro: this.nombreCentro,
      tipoOrganizacion: this.tipoOrganizacion,
      departamentoId: this.departamentoId,
      nit: this.nit,
      personeriaJuridica: this.personeriaJuridica,
      fechaFundacion: this.fechaFundacion,
      paginaWeb: this.paginaWeb,
      descripcion: this.descripcion,
      poblacionAtendida: this.poblacionAtendida,

      nombreResponsable: this.nombreResponsable,
      cargoResponsable: this.cargoResponsable,
      documentoResponsable: this.documentoResponsable,
      correoResponsable: this.correoResponsable,
      telefonoResponsable: this.telefonoResponsable,

      ciudad: this.ciudad,
      departamentoUbicacion: this.departamentoUbicacion,
      direccionExacta: this.direccionExacta,
      referencia: this.referencia,

      personeriaArchivo: this.personeriaArchivo?.name,
      nitArchivo: this.nitArchivo?.name,
      identidadArchivo: this.identidadArchivo?.name,
      domicilioArchivo: this.domicilioArchivo?.name
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