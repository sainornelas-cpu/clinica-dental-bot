import express from 'express';
import { getDb } from '../db.js';
import { processMessage } from '../services/openai.js';

const router = express.Router();

router.post('/whatsapp', async (req, res) => {
  const startTime = Date.now();
  try {
    const mensaje = req.body.Body?.trim();
    const from = req.body.From?.replace('whatsapp:', '').trim();

    if (!mensaje || !from) {
      console.log('⚠️ [Webhook] Datos incompletos', { Body: req.body.Body, From: req.body.From });
      return res.status(400).send('Datos incompletos');
    }

    console.log(`📥 [Webhook] Request recibido:`, { from, body: mensaje });
    const db = getDb();

    // Guardar mensaje del usuario
    await db.run(
      'INSERT INTO mensajes_whatsapp (numero_telefono, contenido_mensaje, remitente) VALUES (?, ?, ?)',
      [from, mensaje, 'usuario']
    );

    // Obtener configuración e historial
    const clinicaConfig = await db.get('SELECT * FROM configuracion_clinica WHERE id = 1');
    const historial = await db.all(
      'SELECT remitente, contenido_mensaje FROM mensajes_whatsapp WHERE numero_telefono = ? ORDER BY recibido_en DESC LIMIT 20',
      from
    ).then(rows => rows.reverse());

    // Procesar con IA
    console.log(`🤖 [Webhook] Procesando mensaje con IA...`);
    const respuestaIA = await processMessage({ from, mensaje, clinicaConfig, historial });

    // Guardar respuesta de la IA
    await db.run(
      'INSERT INTO mensajes_whatsapp (numero_telefono, contenido_mensaje, remitente, respuesta_ia) VALUES (?, ?, ?, ?)',
      [from, respuestaIA, 'asistente', respuestaIA]
    );

    // Escapar caracteres especiales para XML
    const escapeXML = (str) => {
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
    };

    const respuestaEscapada = escapeXML(respuestaIA);

    // TwiML para Twilio
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>
    <Body>${respuestaEscapada}</Body>
  </Message>
</Response>`;

    const duration = Date.now() - startTime;

    console.log('📤 [Webhook] === DETALLES DE RESPUESTA ===');
    console.log('Status: 200');
    console.log('Content-Type: text/xml');
    console.log('To:', from);
    console.log('Message Length:', respuestaIA.length);
    console.log('Duration:', duration + 'ms');
    console.log('TwiML Preview:', twiml.substring(0, 200) + '...');
    console.log('======================================');

    res.set('Content-Type', 'text/xml').status(200).send(twiml);

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ [Webhook] Error (${duration}ms):`, error.message);
    console.error('Stack trace:', error.stack);

    // TwiML de error
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>
    <Body>Disculpá, estoy teniendo problemas técnicos. Intentá de nuevo en unos minutos.</Body>
  </Message>
</Response>`;

    res.set('Content-Type', 'text/xml').status(500).send(twiml);
  }
});

export default router;