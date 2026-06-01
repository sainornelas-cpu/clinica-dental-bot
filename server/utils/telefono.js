// 🔧 UTILIDADES PARA NORMALIZACIÓN DE TELÉFONOS
// Usado en webhook para extraer y normalizar números de WhatsApp

/**
 * Normaliza número de WhatsApp a formato E.164
 * @param {string} from - Número del webhook (ej: "whatsapp:+5216651108583")
 * @returns {string} Número en formato E.164 (ej: "+5216651108583")
 */
export const normalizarTelefono = (from) => {
  console.log(`📞 [telefono] Input original: "${from}"`);

  // Remover prefijo "whatsapp:" si existe
  let numero = from.replace('whatsapp:', '').trim();

  // Si está vacío, retornar vacío
  if (!numero) {
    console.warn('⚠️ [telefono] Número vacío');
    return '';
  }

  // Si no empieza con +, agregar prefijo de México por defecto
  if (!numero.startsWith('+')) {
    if (numero.startsWith('52')) {
      numero = '+' + numero;
    } else if (numero.length === 10) {
      numero = '+52' + numero; // Asumir México si son 10 dígitos
    }
  }

  console.log(`✅ [telefono] Número normalizado: "${numero}"`);
  return numero;
};

/**
 * Extrae número limpio para búsquedas en DB
 * @param {string} from - Número del webhook
 * @returns {string} Número sin + para búsquedas SQLite
 */
export const telefonoParaDB = (from) => {
  const normalizado = normalizarTelefono(from);
  let limpio = normalizado.replace('+', '');

  // Si es un número de Argentina (54) sin el 9, agregarlo para formato WhatsApp
  if (limpio.startsWith('54') && !limpio.startsWith('549') && limpio.length >= 10) {
    limpio = '549' + limpio.slice(2);
  }
  // Si es México (52) sin el 1, agregarlo
  else if (limpio.startsWith('52') && !limpio.startsWith('521') && limpio.length >= 10) {
    limpio = '521' + limpio.slice(2);
  }

  console.log(`📊 [telefono] Para DB: "${limpio}"`);
  return limpio;
};

/**
 * Formatea número para mostrar al usuario
 * @param {string} numero - Número en cualquier formato
 * @returns {string} Número formateado para display
 */
export const formatearTelefonoParaDisplay = (numero) => {
  // Si ya tiene formato, retornar como está
  if (numero.startsWith('+')) {
    return numero;
  }

  // Si es solo dígitos, formatear
  if (numero.startsWith('52') && numero.length === 12) {
    return '+' + numero;
  }

  return numero;
};
