import { Noticia } from '../models/noticia.model';
import {
  filtrarNoticiasPorCategoria,
  normalizarCategoriaExterna,
  normalizarTextoCategoria,
} from './categoria-noticia';

describe('categorias de noticias', () => {
  it('normaliza tildes y diferencias de mayúsculas', () => {
    expect(normalizarTextoCategoria('  SEQUÍAS ')).toBe('sequias');
    expect(normalizarCategoriaExterna('droughts')).toBe('Sequías');
  });

  it('mapea categorías externas conocidas y conserva las desconocidas como Otras', () => {
    expect(normalizarCategoriaExterna('wildfires')).toBe('Incendios');
    expect(normalizarCategoriaExterna('flooding')).toBe('Inundaciones');
    expect(normalizarCategoriaExterna('community')).toBe('Comunidad');
    expect(normalizarCategoriaExterna('environment')).toBe('Otras');
  });

  it('incluye la alerta de referencia al seleccionar Alertas', () => {
    const noticia: Noticia = {
      id: 1,
      titulo: 'Aviso local',
      resumen: 'Resumen',
      imagenUrl: null,
      fuente: 'SOS.exe',
      categoria: 'Incendios',
      ubicacion: 'Bolivia',
      fechaPublicacion: null,
      esExterna: false,
    };

    const resultado = filtrarNoticiasPorCategoria([noticia], 'Alertas');
    expect(resultado).toHaveLength(1);
    expect(resultado[0].id).toBe('alerta-referencia');
    expect(resultado[0].titulo).toContain('río Piraí');
  });
});