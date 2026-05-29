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
  const [horaInicio, horaFin] = [9, 18];
  for (let hora = horaInicio; hora < horaFin; hora++) {
    for (let minuto of [0, 30]) {
      const slotTime = `${hora.toString().padStart(2, '0')}:${minuto.toString().padStart(2, '0')}`;
      const slotDateTime = `${fechaYYYYMMDD}T${slotTime}:00`;
      const ocupado = turnosOcupados.some(t => 
        new Date(t.fecha_turno).toISOString().slice(0, 16) === slotDateTime
      );
      if (!ocupado) slots.push(slotTime);
    }
  }
  return slots;
};
