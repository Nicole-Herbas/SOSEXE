export interface OportunidadVoluntariado {
  id: number;
  titulo: string;
  descripcion: string;
  fechaInicio: string;
  fechaFin: string;
  habilidadesRequeridas: string | null;
  estado: string;
  centroId: number | null;
  creadoPorId: number | null;
  centroNombre: string | null;
  centroCiudad: string | null;
  centroDepartamento: string | null;
}
