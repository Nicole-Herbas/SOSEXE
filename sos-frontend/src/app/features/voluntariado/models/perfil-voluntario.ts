export interface PerfilVoluntario {
  id?: number;
  telefono: string;
  emailContacto: string;
  departamentoId: number;
  ciudad: string;
  habilidades: string[];
  disponibilidad: string[];
  nombreUsuario?: string;
  emailUsuario?: string;
  departamentoNombre?: string;
}
