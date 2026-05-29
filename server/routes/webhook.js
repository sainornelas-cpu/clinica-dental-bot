import express from 'express';
import { getDb } from '../db.js';
import { processMessage } from '../services/openai.js';

const router = express.Router();

router.post('/whatsapp', async (req, res) => {
  try {
    const mensaje = req.body.Body?.trim();
    const from = req.body.From?.replace('whatsapp:', '').trim();

    if (!mensaje || !from) {
      console.log('⚠️ Webhook: datos incompletos', { Body: req.body.Body, From: req.body.From });
      return res.status(400).send('Datos incompletos');
    }

    console.log(`📥 Webhook recibido de ${from}: "${mensaje}"`);
    const db = getDb();

    await db.run(
      'INSERT INTO mensajes_whatsapp (numero_telefono, contenido_mensaje, remitente) VALUES (?, ?, ?)',
      [from, mensaje, 'usuario']
    );

    const clinicaConfig = await db.get('SELECT * FROM configuracion_clinica WHERE id = 1');

    const historial = await db.all(
      'SELECT remitente, contenido_mensaje FROM mensajes_whatsapp WHERE numero_telefono = ? ORDER BY recibido_en DESC LIMIT 20',
      from
    ).then(rows => rows.reverse());

    const respuestaIA = await processMessage({ from, mensaje, clinicaConfig, historial });

    await db.run(
      'INSERT INTO mensajes_whatsapp (numero_telefono, contenido_mensaje, remitente, respuesta_ia) VALUES (?, ?, ?, ?)',
      [from, respuestaIA, 'asistente', respuestaIA]
    );

    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message><Body>${respuestaIA}</Body></Message>
</Response>`;

    res.set('Content-Type', 'text/xml').send(twiml);
    console.log(`📤 Respuesta enviada a ${from}`);

  } catch (error) {
    console.error('❌ Error en webhook:', error);
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message><Body>Disculpá, estoy teniendo problemas técnicos. Intentá de nuevo en unos minutos.</Body></Message>
</Response>`;
    res.set('Content-Type', 'text/xml').status(500).send(twiml);
  }
});

export default router;