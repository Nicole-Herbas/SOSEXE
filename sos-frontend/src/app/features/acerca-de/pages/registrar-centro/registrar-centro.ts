import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-registrar-centro',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './registrar-centro.html',
  styleUrl: './registrar-centro.scss'
})
export class RegistrarCentroComponent {

  currentStep = 1;

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

  get documentosAdjuntos(): number {
    return [
      this.personeriaAdjunta,
      this.nitAdjunto,
      this.identidadAdjunta,
      this.domicilioAdjunto
    ].filter(Boolean).length;
  }

  get paso3Valido(): boolean {
    return this.documentosAdjuntos === 4;
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

  alternarPersoneria(): void {
    this.personeriaAdjunta = !this.personeriaAdjunta;
  }

  alternarNit(): void {
    this.nitAdjunto = !this.nitAdjunto;
  }

  alternarIdentidad(): void {
    this.identidadAdjunta = !this.identidadAdjunta;
  }

  alternarDomicilio(): void {
    this.domicilioAdjunto = !this.domicilioAdjunto;
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

    if (this.currentStep < 5) {
      this.currentStep++;
    }

  }

  volver(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

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
      poblacionAtendida: this.poblacionAtendida
    });
  }

  cancelar(): void {
    window.history.back();
  }
}