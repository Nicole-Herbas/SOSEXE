export interface Postulacion {
  id?: number;
  voluntariadoId: number;
  usuarioId?: number;
  fechaPostulacion?: string;
  estado?: string;
  disponibilidad?: string;
  comentario?: string;
  voluntariadoTitulo?: string;
  usuarioNombre?: string;
}