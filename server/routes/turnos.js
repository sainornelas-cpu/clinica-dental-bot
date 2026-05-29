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

export default router;