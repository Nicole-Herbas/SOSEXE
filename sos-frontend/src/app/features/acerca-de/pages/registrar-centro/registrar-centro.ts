import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-registrar-centro',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './registrar-centro.html',
  styleUrl: './registrar-centro.scss'
})
export class RegistrarCentroComponent {

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  currentStep = 1;
  mostrarModalEnvio = false;

  // ==========================================
// VISTA PREVIA DE ARCHIVOS
// ==========================================
  mostrarModalArchivo = false;
  archivoVistaPrevia: File | null = null;
  urlArchivoVistaPrevia = '';
  esImagenArchivoVistaPrevia = false;
  // ==========================================
  // DATOS DEL CENTRO - PASO 1
  // ==========================================

  nombreCentro = '';
  tipoOrganizacion = '';
  departamento = '';
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

    // ==========================================
  // NECESIDADES Y VOLUNTARIADO - PASO 4
  // ==========================================

  necesidadesDisponibles = [
    'Alimentos',
    'Medicamentos',
    'Ropa',
    'Útiles escolares',
    'Productos de higiene',
    'Artículos para animales',
    'Apoyo económico',
    'Otro'
  ];

  donacionesDisponibles = [
    'Alimentos',
    'Ropa',
    'Medicamentos',
    'Útiles escolares',
    'Productos de higiene',
    'Dinero',
    'Artículos para animales',
    'Otro'
  ];

  actividadesVoluntariado = [
    'Atención y acompañamiento',
    'Apoyo educativo',
    'Salud',
    'Logística',
    'Cocina',
    'Limpieza',
    'Cuidado de animales',
    'Comunicación',
    'Otro'
  ];

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

enviarSolicitud(): void {

  if (!this.paso4Valido) {
    return;
  }

  const departamentoIds: { [key: string]: number } = {
    'Beni': 8,
    'Chuquisaca': 1,
    'Cochabamba': 3,
    'La Paz': 2,
    'Oruro': 4,
    'Pando': 9,
    'Potosí': 5,
    'Santa Cruz': 7,
    'Tarija': 6
  };

  const departamentoId = departamentoIds[this.departamento];

  if (!departamentoId) {
    console.error('Departamento no válido:', this.departamento);
    return;
  }

  const solicitud = {

    nombreCentro: this.nombreCentro,
    tipoOrganizacion: this.tipoOrganizacion,
    departamentoId: departamentoId,

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

    personeriaArchivo: this.personeriaArchivo?.name ?? '',
    nitArchivo: this.nitArchivo?.name ?? '',
    identidadArchivo: this.identidadArchivo?.name ?? '',
    domicilioArchivo: this.domicilioArchivo?.name ?? '',

    necesidades: this.necesidadesSeleccionadas,
    donaciones: this.donacionesSeleccionadas,

    solicitaVoluntarios: this.solicitaVoluntarios,
    actividadesVoluntariado: this.actividadesSeleccionadas,
    descripcionVoluntariado: this.descripcionVoluntariado
  };

  console.log('Enviando solicitud al backend:', solicitud);

  this.http.post(
    'http://localhost:8080/api/solicitudes-centro',
    solicitud
  ).subscribe({

    next: (respuesta) => {

      console.log('Solicitud guardada correctamente:', respuesta);

      this.mostrarModalEnvio = true;
    },

    error: (error) => {

      console.error(
        'Error al guardar la solicitud:',
        error
      );

      alert(
        'No se pudo registrar la solicitud. Revisa los datos e intenta nuevamente.'
      );
    }

  });
}
  // ==========================================
  // DEPARTAMENTOS DE BOLIVIA
  // ==========================================

  departamentos = [
    'Beni',
    'Chuquisaca',
    'Cochabamba',
    'La Paz',
    'Oruro',
    'Pando',
    'Potosí',
    'Santa Cruz',
    'Tarija'
  ];


  // ==========================================
  // TIPOS DE ORGANIZACIÓN
  // ==========================================

  tiposOrganizacion = [
    'Centro de apoyo',
    'Refugio',
    'Organización no gubernamental',
    'Fundación',
    'Institución pública',
    'Organización comunitaria',
    'Otro'
  ];


  // ==========================================
  // VALIDACIÓN DEL PASO 1
  // ==========================================

  get paso1Valido(): boolean {
    return (
      this.nombreCentro.trim() !== '' &&
      this.tipoOrganizacion !== '' &&
      this.departamento !== '' &&
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

verArchivo(archivo: File | null): void {
  if (!archivo) {
    return;
  }

  this.cerrarVistaPrevia();

  this.archivoVistaPrevia = archivo;
  this.esImagenArchivoVistaPrevia = archivo.type.startsWith('image/');
  this.urlArchivoVistaPrevia = URL.createObjectURL(archivo);
  this.mostrarModalArchivo = true;
}

cerrarVistaPrevia(): void {
  if (this.urlArchivoVistaPrevia) {
    URL.revokeObjectURL(this.urlArchivoVistaPrevia);
  }

  this.urlArchivoVistaPrevia = '';
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
  // GUARDAR BORRADOR
  // ==========================================

  guardarBorrador(): void {

    console.log('Borrador guardado:', {

      nombreCentro: this.nombreCentro,
      tipoOrganizacion: this.tipoOrganizacion,
      departamento: this.departamento,
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
  // CANCELAR
  // ==========================================

  cancelar(): void {

    window.history.back();

  }
}