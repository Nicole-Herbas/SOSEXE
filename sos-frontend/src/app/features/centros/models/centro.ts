export interface Centro {

  id?: number;

  nombre: string;
  tipo: string;
  descripcion?: string;

  direccion: string;
  ciudad: string;
  departamentoId: number;

  telefono?: string;
  email?: string;

  latitud: number;
  longitud: number;

  estadoVerificacion?: string;
  responsableId?: number;
}