export type Severidad = 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA';

export interface CrearAlerta {
  titulo: string;
  departamentoId: number;
  severidad: Severidad;
  mensaje: string;
  fechaPublicacion: string;
  fechaExpiracion: string;
  fuente: string;
}

export interface Alerta extends CrearAlerta {
  id: number;
  estado: string;
  creadoPorId: number;
  departamentoNombre: string;
}

export interface Departamento {
  id: number;
  nombre: string;
}
