export interface CrearPostulacion {
  voluntariadoId: number;
  disponibilidad: string;
  comentario?: string;
}

export interface Postulacion {
  id: number;
  voluntariadoId: number;
  usuarioId: number;
  estado: string;
  disponibilidad: string | null;
  comentario: string | null;
  fechaPostulacion: string | null;
  voluntariadoTitulo: string | null;
  usuarioNombre: string | null;
}
