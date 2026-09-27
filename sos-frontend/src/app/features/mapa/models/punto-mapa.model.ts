export interface PuntoMapa {
  id: number;
  origen: 'CENTRO' | 'PUNTO_AYUDA';
  nombre: string;
  tipo: string;
  descripcion?: string;
  direccion?: string;
  ciudad?: string;
  departamentoNombre?: string;
  telefono?: string;
  email?: string;
  latitud: number;
  longitud: number;
  estadoVerificacion: string;
  necesidades: string[];
  fechaActualizacion?: string;
}
