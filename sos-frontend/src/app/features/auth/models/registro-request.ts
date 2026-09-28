export interface RegistroRequest {
  nombre: string;
  email: string;
  password: string;
  telefono?: string;
  departamentoId?: number | null;
}

