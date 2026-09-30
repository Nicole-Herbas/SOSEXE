export interface NoticiaPublicada {
  id: number;
  titulo: string;
  contenido: string;
  categoria: string;
  imagenUrl: string | null;
  fuente: string | null;
  fechaPublicacion: string | null;
  estado: string;
  esExterna: false;
}

export interface NoticiaExterna {
  id: string;
  titulo: string | null;
  descripcion: string | null;
  url: string | null;
  imagenUrl: string | null;
  fuente: string | null;
  categoria: string | null;
  pais: string | null;
  fechaPublicacion: string | null;
  esExterna: true;
}

export interface Noticia {
  id: number | string;
  titulo: string;
  resumen: string;
  url?: string | null;
  imagenUrl: string | null;
  fuente: string | null;
  categoria: string;
  ubicacion: string;
  fechaPublicacion: string | null;
  esExterna: boolean;
}