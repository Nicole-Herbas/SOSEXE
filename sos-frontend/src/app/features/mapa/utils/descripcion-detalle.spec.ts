import { extraerDescripcionDetalle } from './descripcion-detalle';

describe('extraerDescripcionDetalle', () => {
  it('extrae únicamente las líneas con prefijos explícitos y conserva el resto', () => {
    expect(extraerDescripcionDetalle(
      'Punto comunitario\nHorario: Lun-Vie, 09:00–17:00\nDonaciones aceptadas: Agua, Ropa\nInformación adicional: Traer bolsas',
    )).toEqual({
      descripcion: 'Punto comunitario\nInformación adicional: Traer bolsas',
      horario: 'Lun-Vie, 09:00–17:00',
      donacionesAceptadas: 'Agua, Ropa',
    });
  });

  it.each([null, undefined, ''])('tolera descripciones ausentes: %s', (descripcion) => {
    expect(extraerDescripcionDetalle(descripcion)).toEqual({
      descripcion: '', horario: null, donacionesAceptadas: null,
    });
  });

  it('conserva descripciones antiguas, espacios y párrafos sin prefijos', () => {
    const descripcion = '  Apoyamos a las familias.\n\nRecibimos alimentos durante la mañana.  ';
    expect(extraerDescripcionDetalle(descripcion)).toEqual({
      descripcion, horario: null, donacionesAceptadas: null,
    });
  });

  it('no interpreta menciones dentro de frases ni prefijos parecidos', () => {
    const descripcion = [
      'Consultar Horario: con el responsable.',
      'Sobre Donaciones aceptadas: preguntar antes.',
      'horario: 09:00', 'Horario de atención: 09:00',
      'Donaciones: Ropa', 'Donaciones aceptadas por el centro: Agua',
      'Estado: Activa', 'Inicio reportado: 2026-10-15 09:00',
    ].join('\n');
    expect(extraerDescripcionDetalle(descripcion)).toEqual({
      descripcion, horario: null, donacionesAceptadas: null,
    });
  });

  it('maneja CRLF, sangría y espacios alrededor del valor', () => {
    expect(extraerDescripcionDetalle('Descripción\r\n  Horario:  09:00–16:00  \r\n\tDonaciones aceptadas:  Ropa  '))
      .toEqual({ descripcion: 'Descripción', horario: '09:00–16:00', donacionesAceptadas: 'Ropa' });
  });

  it('deja valores nulos cuando las líneas explícitas están vacías', () => {
    expect(extraerDescripcionDetalle('Horario:   \nDonaciones aceptadas:\t'))
      .toEqual({ descripcion: '', horario: null, donacionesAceptadas: null });
  });

  it('conserva valores distintos de prefijos repetidos sin duplicar los idénticos', () => {
    expect(extraerDescripcionDetalle(
      'Horario: Lunes 09:00\nHorario: Martes 10:00\nHorario: Lunes 09:00\nDonaciones aceptadas: Agua\nDonaciones aceptadas: Ropa',
    )).toEqual({
      descripcion: '', horario: 'Lunes 09:00\nMartes 10:00', donacionesAceptadas: 'Agua\nRopa',
    });
  });

  it('conserva los valores como texto sin interpretar HTML ni categorías', () => {
    expect(extraerDescripcionDetalle('Donaciones aceptadas: Artículo especial, <b>Ropa</b>'))
      .toEqual({ descripcion: '', horario: null, donacionesAceptadas: 'Artículo especial, <b>Ropa</b>' });
  });
});
