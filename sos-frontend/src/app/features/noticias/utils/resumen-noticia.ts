export const MAX_CARACTERES_RESUMEN = 180;

export function recortarResumen(
  resumen: string,
  maxCaracteres = MAX_CARACTERES_RESUMEN,
): string {
  const texto = resumen.trim();
  if (texto.length <= maxCaracteres || maxCaracteres < 2) {
    return texto;
  }

  const limiteTexto = maxCaracteres - 1;
  const corteNatural = texto.lastIndexOf(' ', limiteTexto);
  const corte = corteNatural >= limiteTexto * 0.7 ? corteNatural : limiteTexto;
  return `${texto.slice(0, corte).trimEnd()}…`;
}