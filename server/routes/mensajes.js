import express from 'express';
import { getDb } from '../db.js';
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const db = getDb();
    const mensajes = await db.all('SELECT * FROM mensajes_whatsapp ORDER BY recibido_en DESC LIMIT 50');
    res.json(mensajes);
  } catch (err) {
    console.error('❌ Error en GET /api/mensajes:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;