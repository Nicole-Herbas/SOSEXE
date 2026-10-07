import { MAX_CARACTERES_RESUMEN, recortarResumen } from './resumen-noticia';

describe('recortarResumen', () => {
  it('conserva resúmenes que caben en la vista previa', () => {
    expect(recortarResumen('Texto breve.')).toBe('Texto breve.');
  });

  it('limita resúmenes largos a 180 caracteres sin cortar una palabra', () => {
    const resumen = 'Comunidad afectada por las lluvias intensas. '.repeat(20);
    const resultado = recortarResumen(resumen);

    expect(resultado.length).toBeLessThanOrEqual(MAX_CARACTERES_RESUMEN);
    expect(resultado.endsWith('…')).toBe(true);
  });
});