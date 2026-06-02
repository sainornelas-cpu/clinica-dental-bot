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
    let respuestaIA = await processMessage({ from, mensaje, clinicaConfig, historial });

    // Validar que respuestaIA no sea null/undefined
    if (!respuestaIA || respuestaIA.trim() === '') {
      console.error('❌ [Webhook] Respuesta vacía o null');
      respuestaIA = 'Disculpá, tuve un error. Intentá de nuevo.';
    }

    // Validar longitud (Twilio limita a 1600 caracteres aprox)
    if (respuestaIA.length > 1600) {
      console.warn(`⚠️ [Webhook] Respuesta muy larga: ${respuestaIA.length} chars. Truncando...`);
      respuestaIA = respuestaIA.substring(0, 1550) + '... [mensaje truncado]';
    }

    // Guardar respuesta de la IA
    await db.run(
      'INSERT INTO mensajes_whatsapp (numero_telefono, contenido_mensaje, remitente, respuesta_ia) VALUES (?, ?, ?, ?)',
      [from, respuestaIA, 'asistente', respuestaIA]
    );

    // Escape XML robusto
    const escapeXML = (str) => {
      if (!str) return '';
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;')
        .replace(/\n/g, ' ')  // Twilio no soporta saltos de línea en SMS
        .replace(/\r/g, '');
    };

    const respuestaEscapada = escapeXML(respuestaIA);

    // TwiML EXACTO que Twilio espera (formato corto)
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${respuestaEscapada}</Message>
</Response>`;

    const duration = Date.now() - startTime;

    console.log('📤 [Webhook] === ENVIANDO A TWILIO ===');
    console.log('Status: 200');
    console.log('Content-Type: text/xml');
    console.log('Recipient:', from);
    console.log('Message Length:', respuestaIA.length);
    console.log('Message Preview:', respuestaIA.substring(0, 100) + '...');
    console.log('TwiML Length:', twiml.length);
    console.log('Duration:', duration + 'ms');
    console.log('========================');

    // Enviar CON status explícito
    res.set('Content-Type', 'text/xml');
    res.status(200);
    res.send(twiml);

    // Logging DESPUÉS de enviar
    setTimeout(() => {
      console.log('✅ [Webhook] Respuesta enviada a Twilio');
    }, 100);

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ [Webhook] Error (${duration}ms):`, error.message);
    console.error('Stack trace:', error.stack);

    // TwiML de error
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>Disculpá, estoy teniendo problemas técnicos. Intentá de nuevo en unos minutos.</Message>
</Response>`;

    res.set('Content-Type', 'text/xml').status(500).send(twiml);
  }
});

export default router;