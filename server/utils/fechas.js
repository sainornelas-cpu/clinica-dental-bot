import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const formatFechaES = (fecha) => {
  if (!fecha) return '';
  const date = new Date(fecha);
  return format(date, "d 'de' MMMM 'de' yyyy, HH:mm", { locale: es });
};

export const esFechaValida = (fechaStr) => {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(fechaStr)) return false;
  const fecha = new Date(fechaStr + 'T00:00:00');
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  return fecha >= hoy;
};

export const generarSlotsDisponibles = async (fechaYYYYMMDD, turnosOcupados) => {
  const slots = [];
  const horaInicio = 9;  // 9:00 AM
  const horaFin = 18;    // 18:00 PM (último turno 17:00)

  // Solo slots de 1 hora (XX:00), no de 30 minutos
  for (let hora = horaInicio; hora < horaFin; hora++) {
    const slotTime = `${hora.toString().padStart(2, '0')}:00`;
    const slotDateTime = `${fechaYYYYMMDD}T${slotTime}:00`;
    const ocupado = turnosOcupados.some(t =>
      new Date(t.fecha_turno).toISOString().slice(0, 16) === slotDateTime
    );
    if (!ocupado) slots.push(slotTime);
  }
  return slots;
};

// 🔧 FUNCIÓN ROBUSTA PARA PARSEAR FECHAS EN ESPAÑOL
// Soporta: "sábado 30 de mayo", "viernes 5:00 PM", "mañana 1 pm", "hoy"
export const parsearFechaEspañol = (texto, fechaBase = new Date()) => {
  console.log(`📅 [parsearFechaEspañol] Input: "${texto}"`);

  // Normalizar texto
  const text = texto.toLowerCase()
    .replace(/á/g, 'a').replace(/é/g, 'e').replace(/í/g, 'i')
    .replace(/ó/g, 'o').replace(/ú/g, 'u');

  const diasSemana = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
  const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

  // ✅ VALIDACIÓN CRÍTICA: Rechazar palabras de pasado explícito
  if (text.includes('ayer') || text.includes('anteayer') || text.includes('pasado')) {
    console.warn(`⚠️ [parsearFechaEspañol] Fecha rechazada: contiene referencia al pasado "${texto}"`);
    return null;
  }

  // Buscar hora (ej: "5:00 PM", "13:00", "1 pm")
  const horaMatch = text.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
  let hora = 12; // Default mediodía
  let minutos = 0;

  if (horaMatch) {
    hora = parseInt(horaMatch[1]);
    minutos = horaMatch[2] ? parseInt(horaMatch[2]) : 0;
    const periodo = horaMatch[3]?.toLowerCase();

    if (periodo === 'pm' && hora !== 12) hora += 12;
    if (periodo === 'am' && hora === 12) hora = 0;
  }

  // Función helper para validar que la fecha sea futura
  const validarFechaFutura = (fecha) => {
    const ahora = new Date();
    const margenMinutos = 15; // Margen de 15 minutos para allowing same-day scheduling
    const limiteMinimo = new Date(ahora.getTime() - margenMinutos * 60000);

    if (fecha < limiteMinimo) {
      console.warn(`⚠️ [parsearFechaEspañol] Fecha rechazada: ${fecha.toISOString()} es anterior a ${limiteMinimo.toISOString()}`);
      return null;
    }
    return fecha;
  };

  // Buscar fecha específica (ej: "30 de mayo")
  const fechaEspecificaMatch = text.match(/(\d{1,2})\s+de\s+([a-z]+)/i);
  if (fechaEspecificaMatch) {
    const dia = parseInt(fechaEspecificaMatch[1]);
    const mesNombre = fechaEspecificaMatch[2].toLowerCase();
    const mesIndex = meses.findIndex(m => mesNombre.includes(m));

    if (mesIndex !== -1) {
      const año = fechaBase.getFullYear();
      const fecha = new Date(año, mesIndex, dia, hora, minutos);

      // Si ya pasó este año, usar el próximo año
      if (fecha < fechaBase) {
        fecha.setFullYear(año + 1);
      }

      const validada = validarFechaFutura(fecha);
      if (validada) {
        console.log(`✅ [parsearFechaEspañol] Fecha específica: ${validada.toISOString()}`);
        return validada;
      }
    }
  }

  // Buscar día de la semana (ej: "sábado", "viernes")
  const diaSemanaMatch = text.match(/(lunes|martes|miercoles|jueves|viernes|sabado|domingo)/i);
  if (diaSemanaMatch) {
    const diaNombre = diaSemanaMatch[1].toLowerCase();
    const diaIndex = diasSemana.indexOf(diaNombre);

    if (diaIndex !== -1) {
      const fecha = new Date(fechaBase);
      const diaActual = fecha.getDay();
      const diasParaSumar = (diaIndex - diaActual + 7) % 7 || 7; // Próximo día

      fecha.setDate(fecha.getDate() + diasParaSumar);
      fecha.setHours(hora, minutos, 0, 0);

      const validada = validarFechaFutura(fecha);
      if (validada) {
        console.log(`✅ [parsearFechaEspañol] Día de semana: ${validada.toISOString()}`);
        return validada;
      }
    }
  }

  // "mañana", "hoy"
  if (text.includes('mañana')) {
    const fecha = new Date(fechaBase);
    fecha.setDate(fecha.getDate() + 1);
    fecha.setHours(hora, minutos, 0, 0);

    const validada = validarFechaFutura(fecha);
    if (validada) {
      console.log(`✅ [parsearFechaEspañol] Mañana: ${validada.toISOString()}`);
      return validada;
    }
  }

  if (text.includes('hoy')) {
    const fecha = new Date(fechaBase);
    fecha.setHours(hora, minutos, 0, 0);

    // Validar que la hora de hoy sea futura
    const ahora = new Date();
    if (fecha < ahora) {
      console.warn(`⚠️ [parsearFechaEspañol] Fecha rechazada: hora de hoy ya pasó "${texto}"`);
      return null;
    }

    console.log(`✅ [parsearFechaEspañol] Hoy: ${fecha.toISOString()}`);
    return fecha;
  }

  console.warn(`⚠️ [parsearFechaEspañol] No se pudo parsear: "${texto}"`);
  return null; // No se pudo parsear
};
