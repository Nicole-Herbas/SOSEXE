export interface SolicitudCentro {

  id: number;

  nombreCentro: string;
  tipoOrganizacion: string;

  departamentoId: number;
  departamentoNombre?: string;

  nit: string;
  personeriaJuridica: string;
  fechaFundacion?: string;
  paginaWeb?: string;

  descripcion: string;
  poblacionAtendida?: string;

  nombreResponsable: string;
  cargoResponsable: string;
  documentoResponsable: string;
  correoResponsable: string;
  telefonoResponsable: string;

  ciudad: string;
  departamentoUbicacion: string;
  direccionExacta: string;
  referencia?: string;

  personeriaArchivo?: string;
  nitArchivo?: string;
  identidadArchivo?: string;
  domicilioArchivo?: string;

  necesidades?: string[];
  donaciones?: string[];

  solicitaVoluntarios: boolean;
  actividadesVoluntariado?: string[];
  descripcionVoluntariado?: string;

  estado: string;

  fechaCreacion: string;
  fechaActualizacion: string;

  observacionAdmin?: string;
  fechaRevision?: string;
  revisadoPor?: number;
}