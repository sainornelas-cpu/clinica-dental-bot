import express from 'express';
import { getDb } from '../db.js';
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const db = getDb();
    const turnos = await db.all('SELECT * FROM turnos ORDER BY fecha_turno DESC');
    res.json(turnos);
  } catch (err) {
    console.error('❌ Error en GET /api/turnos:', err);
    res.status(500).json({ error: err.message });
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

    // Validar campos requeridos
    if (!numero_telefono || !nombre_paciente || !fecha_turno || !tipo_turno) {
      return res.status(400).json({
        error: 'Faltan campos requeridos',
        requeridos: ['numero_telefono', 'nombre_paciente', 'fecha_turno', 'tipo_turno']
      });
    }

    // Validar que fecha sea futura
    const fechaObj = new Date(fecha_turno);
    const ahora = new Date();
    if (fechaObj < ahora) {
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
      `INSERT INTO turnos (numero_telefono, nombre_paciente, fecha_turno, tipo_turno, notas, estado, creado_por)
       VALUES (?, ?, ?, ?, ?, 'confirmado', 'owner')`,
      [numero_telefono, nombre_paciente, fecha_turno, tipo_turno, notas || '']
    );

    console.log(`✅ [Owner] Turno agendado: ID ${result.lastID} para ${nombre_paciente}`);

    res.json({
      success: true,
      id: result.lastID,
      mensaje: `Turno agendado para ${nombre_paciente} el ${fecha_turno}`
    });
  } catch (error) {
    console.error('❌ [Error] Creando turno desde dashboard:', error);
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

    // Verificar que el turno existe
    const turno = await db.get('SELECT id, nombre_paciente FROM turnos WHERE id = ?', [id]);
    if (!turno) {
      return res.status(404).json({ error: 'Turno no encontrado' });
    }

    await db.run(
      'UPDATE turnos SET estado = "cancelado", cancelado_por = "owner" WHERE id = ?',
      [id]
    );

    console.log(`✅ [Owner] Turno cancelado: ID ${id} (${turno.nombre_paciente})`);

    res.json({ success: true, mensaje: 'Turno cancelado exitosamente' });
  } catch (error) {
    console.error('❌ [Error] Cancelando turno:', error);
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