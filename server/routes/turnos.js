import express from 'express';
import { getDb } from '../db.js';
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const db = getDb();
    const turnos = await db.all(
      `SELECT id, numero_telefono, nombre_paciente, fecha_turno, tipo_turno, estado, creado_por
       FROM turnos
       WHERE estado != 'cancelado'
       ORDER BY fecha_turno ASC`
    );

    console.log(`📊 [Owner] Obtenidos ${turnos.length} turnos activos`);
    res.json(turnos);
  } catch (error) {
    console.error('❌ [Owner] Error obteniendo turnos:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 🕐 OWNER SCHEDULING: Obtener slots disponibles
// ==========================================
router.get('/slots', async (req, res) => {
  try {
    const { fecha } = req.query;  // Formato: "2026-06-02"

    if (!fecha) {
      return res.status(400).json({ error: 'Fecha requerida' });
    }

    const db = getDb();

    // Obtener turnos ocupados para esa fecha
    const turnosOcupados = await db.all(
      'SELECT fecha_turno FROM turnos WHERE DATE(fecha_turno) = ? AND estado != "cancelado"',
      [fecha]
    );

    // Extraer solo las horas (ej: "14:00:00" → "14:00")
    const horasOcupadas = turnosOcupados.map(t => {
      const date = new Date(t.fecha_turno);
      return `${date.getHours().toString().padStart(2, '0')}:00`;
    });

    // Generar slots disponibles
    const { generarSlotsDisponibles } = await import('../utils/fechas.js');
    const slotsDisponibles = generarSlotsDisponibles(fecha, turnosOcupados);

    // Filtrar slots pasados si es hoy
    const hoy = new Date().toISOString().split('T')[0];
    let slotsFiltrados = slotsDisponibles;

    if (fecha === hoy) {
      const ahora = new Date();
      const horaActual = ahora.getHours();
      const minutoActual = ahora.getMinutes();
      const horaLimite = horaActual + (minutoActual > 0 ? 1 : 0) + 1; // +1 hora de margen

      slotsFiltrados = slotsDisponibles.filter(slot => {
        const horaSlot = parseInt(slot.split(':')[0]);
        return horaSlot >= horaLimite;
      });
    }

    res.json({
      fecha,
      slots: slotsFiltrados,
      ocupados: horasOcupadas
    });

  } catch (error) {
    console.error('❌ [Owner/Slots] Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

router.get('/:fecha', async (req, res) => {
  try {
    const db = getDb();
    const turnos = await db.all('SELECT * FROM turnos WHERE DATE(fecha_turno) = ?', req.params.fecha);
    res.json(turnos);
  } catch (err) {
    console.error('❌ Error en GET /api/turnos/:fecha:', err);
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 👤 OWNER SCHEDULING: Crear turno desde dashboard
// ==========================================
router.post('/', async (req, res) => {
  try {
    const { numero_telefono, nombre_paciente, fecha_turno, tipo_turno, notas } = req.body;

    console.log('📝 [Owner] Datos recibidos:', {
      fecha_turno,
      tipo: typeof fecha_turno,
      numero_telefono,
      nombre_paciente
    });

    // Validar campos requeridos
    if (!numero_telefono || !nombre_paciente || !fecha_turno || !tipo_turno) {
      return res.status(400).json({
        error: 'Faltan campos requeridos',
        requeridos: ['numero_telefono', 'nombre_paciente', 'fecha_turno', 'tipo_turno']
      });
    }

    // Validar que fecha_turno es una fecha válida
    const fechaObj = new Date(fecha_turno);
    if (isNaN(fechaObj.getTime())) {
      console.error('❌ [Owner] Fecha inválida:', fecha_turno);
      return res.status(400).json({
        error: 'Fecha inválida',
        fecha_recibida: fecha_turno
      });
    }

    console.log('💾 [Owner] Insertando en DB:', {
      fecha_turno: fecha_turno,
      fecha_obj: fechaObj,
      fecha_iso: fechaObj.toISOString(),
      tipo_turno,
      nombre_paciente
    });

    // Validar que fecha sea futura
    const ahora = new Date();
    if (fechaObj <= ahora) {
      return res.status(400).json({
        error: 'No se pueden agendar turnos en el pasado',
        fecha_solicitada: fecha_turno,
        fecha_actual: ahora.toISOString()
      });
    }

    // Verificar disponibilidad
    const db = getDb();
    const existente = await db.get(
      'SELECT id FROM turnos WHERE DATE(fecha_turno) = ? AND TIME(fecha_turno) = TIME(?) AND estado != "cancelado"',
      [fecha_turno, fecha_turno]
    );

    if (existente) {
      return res.status(400).json({ error: 'Ese horario ya está ocupado' });
    }

    // Insertar turno
    const result = await db.run(
      `INSERT INTO turnos (numero_telefono, nombre_paciente, fecha_turno, tipo_turno, notas, estado, creado_por, creado_en)
       VALUES (?, ?, ?, ?, ?, 'confirmado', 'owner', CURRENT_TIMESTAMP)`,
      [numero_telefono, nombre_paciente, fecha_turno, tipo_turno, notas || '']
    );

    console.log(`✅ [Owner] Turno agendado: ID ${result.lastID} para ${nombre_paciente}`);

    res.json({
      success: true,
      id: result.lastID,
      mensaje: `Turno agendado para ${nombre_paciente}`
    });
  } catch (error) {
    console.error('❌ [Owner] Error agendando turno:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// ❌ OWNER SCHEDULING: Cancelar turno desde dashboard
// ==========================================
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDb();

    console.log(`🗑️ [Owner] Cancelando turno ID: ${id}`);

    // Verificar que el turno existe
    const turno = await db.get('SELECT id, nombre_paciente FROM turnos WHERE id = ?', [id]);
    if (!turno) {
      console.error(`❌ [Owner] Turno ${id} no encontrado`);
      return res.status(404).json({ error: 'Turno no encontrado' });
    }

    // Cancelar
    await db.run(
      'UPDATE turnos SET estado = "cancelado", cancelado_por = "owner", cancelado_en = CURRENT_TIMESTAMP WHERE id = ?',
      [id]
    );

    console.log(`✅ [Owner] Turno cancelado: ID ${id} (${turno.nombre_paciente})`);

    res.json({ success: true, mensaje: 'Turno cancelado exitosamente' });
  } catch (error) {
    console.error('❌ [Owner] Error cancelando turno:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 📋 OWNER SCHEDULING: Actualizar turno existente
// ==========================================
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { numero_telefono, nombre_paciente, fecha_turno, tipo_turno, notas } = req.body;

    const db = getDb();

    // Verificar que el turno existe
    const turno = await db.get('SELECT id FROM turnos WHERE id = ?', [id]);
    if (!turno) {
      return res.status(404).json({ error: 'Turno no encontrado' });
    }

    // Si se cambia la fecha, validar que sea futura
    if (fecha_turno) {
      const fechaObj = new Date(fecha_turno);
      const ahora = new Date();
      if (fechaObj < ahora) {
        return res.status(400).json({
          error: 'No se pueden agendar turnos en el pasado',
          fecha_solicitada: fecha_turno
        });
      }
    }

    // Actualizar turno
    await db.run(
      `UPDATE turnos
       SET numero_telefono = COALESCE(?, numero_telefono),
           nombre_paciente = COALESCE(?, nombre_paciente),
           fecha_turno = COALESCE(?, fecha_turno),
           tipo_turno = COALESCE(?, tipo_turno),
           notas = COALESCE(?, notas),
           modificado_por = 'owner'
       WHERE id = ?`,
      [numero_telefono, nombre_paciente, fecha_turno, tipo_turno, notas, id]
    );

    console.log(`✅ [Owner] Turno actualizado: ID ${id}`);

    res.json({ success: true, mensaje: 'Turno actualizado exitosamente' });
  } catch (error) {
    console.error('❌ [Error] Actualizando turno:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;