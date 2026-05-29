import express from 'express';
import { getDb } from '../db.js';
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const db = getDb();
    const config = await db.get('SELECT * FROM configuracion_clinica WHERE id = 1');
    res.json(config || {});
  } catch (err) {
    console.error('❌ Error en GET /api/configuracion:', err);
    res.status(500).json({ error: err.message });
  }
});

router.put('/', async (req, res) => {
  try {
    const db = getDb();
    const { nombre_clinica, direccion, telefono, email, horarios, servicios, sobre_clinica, webhook_url } = req.body;
    await db.run(`
      UPDATE configuracion_clinica SET 
        nombre_clinica=?, direccion=?, telefono=?, email=?, 
        horarios=?, servicios=?, sobre_clinica=?, webhook_url=? 
      WHERE id=1
    `, [
      nombre_clinica, direccion, telefono, email, 
      horarios, JSON.stringify(servicios), sobre_clinica, webhook_url
    ]);
    res.json({ message: 'Configuración actualizada' });
  } catch (err) {
    console.error('❌ Error en PUT /api/configuracion:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;