/**
 * Utilidades para formatear fechas con timezone UTC consistente
 * Evita problemas de shift de día/año por timezone local
 */

/**
 * Formatea fecha ISO con timezone UTC (formato largo)
 * @param {string} fechaISO - Fecha en formato ISO (ej: "2026-06-10T15:00:00.000Z")
 * @param {object} opciones - Opciones adicionales de toLocaleDateString
 * @returns {string} Fecha formateada en español
 */
export const formatearFechaUTC = (fechaISO, opciones = {}) => {
  if (!fechaISO) return '';

  const defaults = {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
    ...opciones
  };

  return new Date(fechaISO + 'Z').toLocaleDateString('es-AR', defaults);
};

/**
 * Formatea fecha ISO con timezone UTC (formato corto)
 * @param {string} fechaISO - Fecha en formato ISO
 * @returns {string} Fecha corta: "10/06/2026"
 */
export const formatearFechaCorta = (fechaISO) => {
  if (!fechaISO) return '';

  return new Date(fechaISO + 'Z').toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'UTC'
  });
};

/**
 * Formatea solo la hora con timezone UTC
 * @param {string} fechaISO - Fecha en formato ISO
 * @returns {string} Hora: "15:00"
 */
export const formatearHoraUTC = (fechaISO) => {
  if (!fechaISO) return '';

  return new Date(fechaISO + 'Z').toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC'
  });
};

/**
 * Formatea fecha completa para mensajes (día + hora)
 * @param {string} fechaISO - Fecha en formato ISO
 * @returns {string} Fecha completa: "miércoles 10/06/2026 - 15:00"
 */
export const formatearFechaCompleta = (fechaISO) => {
  if (!fechaISO) return '';

  const fecha = new Date(fechaISO + 'Z');
  const dia = fecha.toLocaleDateString('es-AR', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'UTC'
  });
  const hora = fecha.toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC'
  });

  return `${dia} - ${hora}`;
};
