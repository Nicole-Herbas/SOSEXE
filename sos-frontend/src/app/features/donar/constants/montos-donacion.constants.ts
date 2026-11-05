/** Valores expresados en centavos para no acumular errores de coma flotante. */
export const MONTOS_DONACION_CENTAVOS = [2000, 5000, 10000, 20000] as const;
export const MONTO_MINIMO_CENTAVOS = 500;

/** Acepta bolivianos con hasta dos decimales, sin exponentes ni separadores de miles. */
export function convertirMontoACentavos(valor: string): number | null {
  if (!/^\d+(?:[.,]\d{1,2})?$/.test(valor)) return null;

  const [enteros, decimales = ''] = valor.replace(',', '.').split('.');
  const centavos = Number(enteros) * 100 + Number(decimales.padEnd(2, '0'));
  return Number.isSafeInteger(centavos) ? centavos : null;
}
