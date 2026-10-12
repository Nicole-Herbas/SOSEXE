import { APP_TEXTOS } from '../../../shared/constants/app-textos.constants';
import { ESTADO_VERIFICACION_PUNTO } from './estado-punto.constants';

export interface ItemCatalogo {
  id: number;
  nombre: string;
}

export type TipoPuntoCiudadano =
  (typeof APP_TEXTOS.registrarPunto.tipos)[number]['valor'];

export type EstadoPunto =
  (typeof ESTADO_VERIFICACION_PUNTO)[keyof typeof ESTADO_VERIFICACION_PUNTO];

export interface RegistroPuntoSolicitud {
  nombre: string;
  tipo: TipoPuntoCiudadano;
  descripcion: string;
  direccion: string;
  ciudad: string;
  departamentoId: number;
  latitud: number;
  longitud: number;
  necesidadIds: number[];
  nombreContacto: string;
  telefonoContacto: string;
  correoContacto: string | null;
}

export interface PuntoAyudaPropio {
  id: number;
  nombre: string;
  tipo: string;
  descripcion: string | null;
  direccion: string | null;
  ciudad: string | null;
  departamentoNombre: string | null;
  latitud: number | null;
  longitud: number | null;
  estadoVerificacion: EstadoPunto;
  necesidadNombres: string[] | null;
  nombreContacto: string | null;
  telefonoContacto: string | null;
  correoContacto: string | null;
}

export interface UbicacionSeleccionada {
  latitud: number;
  longitud: number;
}
