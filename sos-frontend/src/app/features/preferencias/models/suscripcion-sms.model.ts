/**
 * Modelo de suscripción a alertas SMS (SOS-63).
 */
export interface SuscripcionSms {
  /** ID del departamento seleccionado. */
  departamentoId: number;

  /** Nombre del departamento — solo en respuesta. */
  departamentoNombre?: string;

  /** Número de teléfono del suscriptor. */
  telefono: string;

  /** Indica si la suscripción está activa — solo en respuesta. */
  activa?: boolean;

  /** Fecha de registro del consentimiento — solo en respuesta. */
  consentimientoFecha?: string;
}
