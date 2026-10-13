export interface DescripcionDetalle {
  descripcion: string;
  horario: string | null;
  donacionesAceptadas: string | null;
}

// Estos prefijos son el formato persistido por el registro, no etiquetas traducibles.
export function extraerDescripcionDetalle(descripcion: string | null | undefined): DescripcionDetalle {
  const restantes: string[] = [];
  const horarios = new Set<string>();
  const donaciones = new Set<string>();

  for (const linea of (descripcion ?? '').split(/\r?\n/)) {
    const contenido = linea.trimStart();
    if (contenido.startsWith('Horario:')) {
      const valor = contenido.slice('Horario:'.length).trim();
      if (valor) horarios.add(valor);
    } else if (contenido.startsWith('Donaciones aceptadas:')) {
      const valor = contenido.slice('Donaciones aceptadas:'.length).trim();
      if (valor) donaciones.add(valor);
    } else {
      restantes.push(linea);
    }
  }

  return {
    descripcion: restantes.join('\n'),
    horario: horarios.size ? Array.from(horarios).join('\n') : null,
    donacionesAceptadas: donaciones.size ? Array.from(donaciones).join('\n') : null,
  };
}
