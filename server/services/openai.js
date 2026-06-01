import { getAIResponse, getProviderInfo } from './ai.js';
import { getDb } from '../db.js';
import { generarSlotsDisponibles, parsearFechaEspañol } from '../utils/fechas.js';
import { telefonoParaDB, normalizarTelefono } from '../utils/telefono.js';

// 🔧 CONFIGURACIÓN DE MODO (LAZY EVALUATION)
// .env: USE_MOCK=true  → Desarrollo (sin API key, respuestas rápidas)
// .env: USE_MOCK=false → Producción (OpenAI GPT-4o real)
// 🔑 FUNCIÓN LAZY: Se evalúa en runtime, no al cargar el módulo
// Esto soluciona el problema donde ES Modules importan este archivo ANTES de que dotenv.config() cargue las variables
const isMockMode = () => {
  const val = (process.env.USE_MOCK || '').trim().toLowerCase();
  return val !== 'false';
};

// ==========================================
// 🧪 MODO MOCK (Desarrollo)
// ==========================================
const mockResponses = {
  'hola': '¡Hola! 👋 Soy Sarah, recepcionista virtual de la Clínica Dental Sonrisa.\n\nEstoy aquí para ayudarte con:\n1️⃣ Agendar una nueva cita\n2️⃣ Reagendar una cita existente\n3️⃣ Cancelar una cita\n4️⃣ Ver nuestra ubicación\n5️⃣ Consultar horarios de atención\n6️⃣ Ver servicios que ofrecemos\n7️⃣ Consultar costos\n8️⃣ Ver mis citas agendadas\n\n👉 Respondé con el NÚMERO de la opción que necesitás (ej: "8" para ver tus citas).\n¿En qué puedo ayudarte hoy? 🦷✨',
  '1': '¡Perfecto! 🦷 Para agendar tu cita necesito:\n• Tu nombre completo\n• Tipo de servicio (limpieza, blanqueamiento, ortodoncia, etc.)\n• Fecha y hora preferida\n¿Me contás estos datos?',
  'agendar': '¡Perfecto! 🦷 Para agendar tu cita necesito:\n• Tu nombre completo\n• Tipo de servicio (limpieza, blanqueamiento, ortodoncia, etc.)\n• Fecha y hora preferida\n¿Me contás estos datos?',
  '2': 'Entendido, querés reagendar una cita. 📅\nPara ayudarte necesito tu número de teléfono para buscar tus turnos existentes.',
  'reagendar': 'Entendido, querés reagendar una cita. 📅\nPara ayudarte necesito tu número de teléfono para buscar tus turnos existentes.',
  '3': 'Para cancelar una cita, necesito tu número de teléfono para buscar tus turnos. 📞',
  'cancelar': 'Para cancelar una cita, necesito tu número de teléfono para buscar tus turnos. 📞',
  '4': '📍 Estamos en: Av. Corrientes 1234, CABA\n🗺️ https://maps.google.com/?q=Av.+Corrientes+1234+CABA\n¿Necesitás ayuda para llegar? 😊',
  'ubicacion': '📍 Estamos en: Av. Corrientes 1234, CABA\n🗺️ https://maps.google.com/?q=Av.+Corrientes+1234+CABA\n¿Necesitás ayuda para llegar? 😊',
  '5': '🕐 Horarios de atención:\nLunes a Viernes de 9:00 a 18:00\n⚠️ Cerramos feriados nacionales.\n¿Te gustaría agendar una cita? 😊',
  'horarios': '🕐 Horarios de atención:\nLunes a Viernes de 9:00 a 18:00\n⚠️ Cerramos feriados nacionales.\n¿Te gustaría agendar una cita? 😊',
  '6': '🦷 Nuestros servicios:\n• Limpieza dental (~45 min)\n• Blanqueamiento (~60 min)\n• Ortodoncia\n• Implantes\n• Endodoncia\n¿Te gustaría agendar alguno? 😊',
  'servicios': '🦷 Nuestros servicios:\n• Limpieza dental (~45 min)\n• Blanqueamiento (~60 min)\n• Ortodoncia\n• Implantes\n• Endodoncia\n¿Te gustaría agendar alguno? 😊',
  '7': '💰 Precios de referencia (pueden variar según diagnóstico):\n\n| Servicio              | Rango aproximado |\n|----------------------|------------------|\n| Limpieza Dental      | $800 - $1,200 MXN |\n| Blanqueamiento       | $2,500 - $4,000 MXN |\n| Ortodoncia (mes)     | $1,500 - $3,000 MXN |\n| Implantes            | $8,000 - $15,000 MXN |\n| Evaluación inicial   | $500 MXN* |\n\n*La evaluación inicial tiene costo y se descuenta si continuás con tratamiento.\n\n📞 Para presupuesto exacto: Llamanos al +54 11 1234-5678',
  'costos': '💰 Precios de referencia (pueden variar según diagnóstico):\n\n| Servicio              | Rango aproximado |\n|----------------------|------------------|\n| Limpieza Dental      | $800 - $1,200 MXN |\n| Blanqueamiento       | $2,500 - $4,000 MXN |\n| Ortodoncia (mes)     | $1,500 - $3,000 MXN |\n| Implantes            | $8,000 - $15,000 MXN |\n| Evaluación inicial   | $500 MXN* |\n\n*La evaluación inicial tiene costo y se descuenta si continuás con tratamiento.\n\n📞 Para presupuesto exacto: Llamanos al +54 11 1234-5678',
  '8': '📅 Consultando tus citas agendadas...\n\n(Si hay turnos, listarlos aquí. Si no, preguntar si quieren agendar)',
  'ver citas': '📅 Consultando tus citas agendadas...',
  'limpieza': 'La limpieza dental dura ~45 min. Tenemos horarios Lunes a Viernes de 9:00 a 18:00. ¿Te gustaría agendar? 🦷',
  'urgencia': '⚠️ Entiendo que es urgencia. Por favor, llamá directamente al +54 11 1234-5678.',
  'default': 'Disculpa, no entendí tu consulta. 😊\nPor favor, elegí una opción del menú:\n1️⃣ Agendar  2️⃣ Reagendar  3️⃣ Cancelar  4️⃣ Ubicación  5️⃣ Horarios  6️⃣ Servicios  7️⃣ Costos  8️⃣ Ver mis citas\n👉 Respondé con el número (ej: "1").'
};

const getMockResponse = (mensaje) => {
  const lower = mensaje.toLowerCase();
  for (const [keyword, response] of Object.entries(mockResponses)) {
    if (lower.includes(keyword)) return response;
  }
  return mockResponses.default;
};

// ==========================================
// 🤖 SYSTEM PROMPT (Sarah - Menú 1-8)
// ==========================================
const SYSTEM_PROMPT = `
Sos Sarah, recepcionista virtual de la Clínica Dental Sonrisa. Sos cálida, profesional y eficiente. Tu rol es guiar al paciente paso a paso como una recepcionista real.

🗣️ TONO Y ESTILO:
- Español rioplatense (usá "vos", "tenés", "querés")
- Cálida y empática, pero concisa
- Emojis moderados (máx 2 por mensaje)
- NUNCA suenes robótica o repetitiva
- Si el usuario se saltea pasos, adaptate naturalmente sin regañar

🎯 FLUJO DE CONVERSACIÓN (REGLA DE ORO):
1. **PRIMER CONTACTO**: Si es el primer mensaje o el usuario escribe "menú", "inicio" o "ayuda", respondé con:
   "¡Hola! 👋 Soy Sarah, recepcionista de la Clínica Dental Sonrisa. ¿En qué puedo ayudarte hoy?

   1️⃣ Agendar una nueva cita
   2️⃣ Reagendar una cita existente
   3️⃣ Cancelar una cita
   4️⃣ Ver ubicación
   5️⃣ Horarios de atención
   6️⃣ Servicios disponibles
   7️⃣ Consulta de costos
   8️⃣ Ver mis citas agendadas

   👉 Podés responder con el número o contarme directamente qué necesitás. 😊"

2. **ENTENDER INTENCIONES NATURALES**: Mapeá automáticamente lo que dice el usuario:
   - "quiero cita", "agendar", "turno" → Iniciá flujo de agendamiento (Paso 1)
   - "ver citas", "mis turnos", "qué tengo agendado" → Ejecutá opción 8 (usá teléfono del webhook)
   - "dónde están", "ubicación", "dirección" → Opción 4
   - "horarios", "atienden" → Opción 5
   - "servicios", "qué hacen" → Opción 6
   - "precios", "costos", "cuánto sale" → Opción 7
   - "reagendar", "cambiar fecha" → Opción 2
   - "cancelar", "anular" → Opción 3

3. **MEMORIA Y CONTEXTO (CRÍTICO)**:
   - Recordá TODO lo que el usuario ya dijo en esta conversación
   - Si ya dio su nombre, NO lo vuelvas a pedir
   - Si ya eligió servicio, NO lo vuelvas a preguntar
   - Avanzá siempre al siguiente paso lógico
   - Si el usuario cambia de tema, adaptate y volvé al flujo donde quedó

4. **FLUJO DE AGENDAMIENTO (PASO A PASO)**:
   PASO 1: Nombre completo (si no lo tenés) → "¿Cuál es tu nombre completo?"
   PASO 2: Tipo de servicio → "¿Qué tipo de tratamiento necesitás? (Ej: Limpieza, Ortodoncia, Implantes...)"
   PASO 3: Fecha/hora preferida → "¿Qué día y hora te vendría mejor? (Ej: 'mañana a las 3pm', 'sábado 10 de mayo')"
   PASO 4: Consultá disponibilidad con la tool correspondiente
   PASO 5: Confirmá antes de agendar → "Perfecto, tengo disponibilidad el [fecha] a las [hora] para [servicio]. ¿Confirmo el turno?"
   PASO 6: Ejecutá agendamiento y avisá con confirmación clara

⚠️ REGLAS ESTRÍCTAS:
- Hacé UNA sola pregunta por mensaje. NUNCA juntes varias.
- Si el usuario responde con información de varios pasos a la vez (ej: "Soy María, quiero limpieza el sábado"), reconocé todo y avanzá directamente al siguiente paso faltante.
- NUNCA repitas una pregunta si ya tenés la respuesta.
- Si no entendés algo, preguntá de forma amable sin mostrar el menú completo de nuevo.
- Usá las tools disponibles cuando corresponda, pero priorizá la conversación natural.

📋 INFORMACIÓN DE LA CLÍNICA:
- Nombre: {nombre_clinica}
- Dirección: {direccion}
- Teléfono: {telefono}
- Email: {email}
- Horarios: {horarios}
- Servicios: {servicios}

🔧 TOOLS DISPONIBLES (Usalas solo cuando el flujo lo requiera):
- actualizar_datos_paciente({numero_telefono, nombre_paciente})
- consultar_disponibilidad({fecha})
- agendar_turno({numero_telefono, nombre_paciente, fecha_turno, tipo_turno})
- ver_turnos_paciente({numero_telefono})
- cancelar_turno({id_turno})
- reprogramar_turno({id_turno, nueva_fecha})

⚠️ IMPORTANTE PARA FECHAS EN TOOLS:
- Al llamar a consultar_disponibilidad o agendar_turno, podés enviar la fecha en lenguaje natural ("mañana", "sábado 30 de mayo 3pm")
- El sistema la convertirá automáticamente a formato técnico
- Si el parseo falla, respondé amablemente pidiendo clarificación sin mostrar el menú completo

Nunca inventes información. Si algo requiere validación clínica o precio exacto, derivá al teléfono/email. Mantené el tono humano en todo momento. ✨
`;

const TOOLS = [
  {
    type: 'function',
    function: {
      name: 'actualizar_datos_paciente',
      description: 'Actualiza el nombre del paciente en la base de datos',
      parameters: {
        type: 'object',
        properties: {
          numero_telefono: { type: 'string', description: 'Número de teléfono del paciente (formato: +521XXXXXXXXX)' },
          nombre_paciente: { type: 'string', description: 'Nombre completo del paciente' }
        },
        required: ['numero_telefono', 'nombre_paciente'],
        additionalProperties: false
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'consultar_disponibilidad',
      description: 'Consulta horarios disponibles para una fecha. La fecha puede estar en formato natural (ej: "mañana", "sábado 30 de mayo") o ISO (YYYY-MM-DD). El sistema la convertirá automáticamente.',
      parameters: {
        type: 'object',
        properties: {
          fecha: {
            type: 'string',
            description: 'Fecha preferida (ej: "mañana", "2026-06-02", "sábado 30 de mayo")'
          }
        },
        required: ['fecha'],
        additionalProperties: false
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'ver_turnos_paciente',
      description: 'Obtiene los turnos activos de un paciente',
      parameters: {
        type: 'object',
        properties: { numero_telefono: { type: 'string' } },
        required: ['numero_telefono'],
        additionalProperties: false
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'agendar_turno',
      description: 'Agenda un nuevo turno. La fecha/hora puede estar en formato natural (ej: "mañana 3pm", "sábado 30 de mayo 15:00") o ISO.',
      parameters: {
        type: 'object',
        properties: {
          numero_telefono: { type: 'string' },
          nombre_paciente: { type: 'string' },
          fecha_turno: { type: 'string', description: 'Fecha y hora (ej: "mañana 3pm", "2026-06-02T15:00:00", "sábado 30 de mayo 15:00")' },
          tipo_turno: { type: 'string' },
          notas: { type: 'string' }
        },
        required: ['numero_telefono', 'nombre_paciente', 'fecha_turno', 'tipo_turno'],
        additionalProperties: false
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'cancelar_turno',
      description: 'Cancela un turno por su ID',
      parameters: {
        type: 'object',
        properties: { id_turno: { type: 'integer' } },
        required: ['id_turno'],
        additionalProperties: false
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'reprogramar_turno',
      description: 'Reprograma un turno a nueva fecha',
      parameters: {
        type: 'object',
        properties: { id_turno: { type: 'integer' }, nueva_fecha: { type: 'string' } },
        required: ['id_turno', 'nueva_fecha'],
        additionalProperties: false
      }
    }
  }
];

const executeTool = async (toolName, args) => {
  const db = getDb();
  console.log(`🔧 Ejecutando tool: ${toolName}`, args);

  switch (toolName) {
    case 'actualizar_datos_paciente': {
      const { numero_telefono, nombre_paciente } = args;
      console.log(`👤 Actualizando paciente: ${numero_telefono} → ${nombre_paciente}`);

      // Verificar si paciente existe
      const existente = await db.get('SELECT * FROM pacientes WHERE numero_telefono = ?', numero_telefono);

      if (existente) {
        // Actualizar nombre si existe
        await db.run('UPDATE pacientes SET nombre = ? WHERE numero_telefono = ?', [nombre_paciente, numero_telefono]);
        console.log(`✅ Paciente actualizado: ${nombre_paciente}`);
        return { success: true, accion: 'actualizado', nombre_paciente };
      } else {
        // Crear nuevo paciente
        await db.run('INSERT INTO pacientes (numero_telefono, nombre) VALUES (?, ?)', [numero_telefono, nombre_paciente]);
        console.log(`✅ Nuevo paciente creado: ${nombre_paciente}`);
        return { success: true, accion: 'creado', nombre_paciente };
      }
    }
    case 'consultar_disponibilidad': {
      let { fecha } = args;

      // 📅 Si la fecha no está en formato ISO, parsearla
      if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
        const parsed = parsearFechaEspañol(fecha);
        if (parsed) {
          const fechaOriginal = fecha;
          fecha = parsed.toISOString().split('T')[0]; // YYYY-MM-DD
          console.log(`📅 [parse] "${fechaOriginal}" → "${fecha}"`);
        } else {
          return { error: `No pude entender la fecha "${fecha}". Usá formato como "mañana", "sábado 30 de mayo" o "2026-06-02".` };
        }
      }

      const turnosDia = await db.all('SELECT fecha_turno FROM turnos WHERE DATE(fecha_turno) = ?', fecha);
      const slotsLibres = await generarSlotsDisponibles(fecha, turnosDia.map(t => t.fecha_turno));
      return { fecha, slotsLibres, ocupados: turnosDia.map(t => new Date(t.fecha_turno).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })) };
    }
    case 'ver_turnos_paciente': {
      const { numero_telefono } = args;
      return await db.all('SELECT id, fecha_turno, tipo_turno, estado, notas FROM turnos WHERE numero_telefono = ? AND estado != "cancelado" ORDER BY fecha_turno ASC', numero_telefono);
    }
    case 'agendar_turno': {
      let { numero_telefono, nombre_paciente, fecha_turno, tipo_turno, notas } = args;

      // 📅 Parsear fecha_turno si no está en formato ISO completo
      if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(fecha_turno) && !/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(fecha_turno)) {
        const parsed = parsearFechaEspañol(fecha_turno);
        if (parsed) {
          const fechaOriginal = fecha_turno;
          fecha_turno = parsed.toISOString();
          console.log(`📅 [parse] "${fechaOriginal}" → "${fecha_turno}"`);
        } else {
          return { error: `No pude entender la fecha "${fecha_turno}". Usá formato como "mañana 3pm" o "sábado 30 de mayo 15:00".` };
        }
      }

      const existente = await db.get('SELECT id FROM turnos WHERE DATE(fecha_turno) = ? AND TIME(fecha_turno) = TIME(?) AND estado != "cancelado"', fecha_turno, fecha_turno);
      if (existente) throw new Error('Horario no disponible');
      const result = await db.run('INSERT INTO turnos (numero_telefono, nombre_paciente, fecha_turno, tipo_turno, notas, estado) VALUES (?, ?, ?, ?, ?, "confirmado")', [numero_telefono, nombre_paciente, fecha_turno, tipo_turno, notas || null]);
      return { success: true, id_turno: result.lastID, mensaje: 'Turno agendado exitosamente' };
    }
    case 'cancelar_turno': {
      const { id_turno } = args;
      await db.run('UPDATE turnos SET estado = "cancelado" WHERE id = ?', id_turno);
      return { success: true, mensaje: 'Turno cancelado' };
    }
    case 'reprogramar_turno': {
      const { id_turno, nueva_fecha } = args;
      const existente = await db.get('SELECT id FROM turnos WHERE DATE(fecha_turno) = ? AND TIME(fecha_turno) = TIME(?) AND id != ? AND estado != "cancelado"', nueva_fecha, nueva_fecha, id_turno);
      if (existente) throw new Error('Horario no disponible');
      await db.run('UPDATE turnos SET fecha_turno = ? WHERE id = ?', nueva_fecha, id_turno);
      return { success: true, mensaje: 'Turno reprogramado' };
    }
    default: throw new Error(`Tool desconocido: ${toolName}`);
  }
};

// ==========================================
// 🤖 FUNCIÓN PRINCIPAL (Unificada)
// ==========================================
export const processMessage = async ({ from, mensaje, clinicaConfig, historial }) => {
  try {
    // 🔍 LOG DE DEBUG: confirmar modo activo
    console.log(`🔑 [MODO] USE_MOCK env: "${process.env.USE_MOCK}" → Modo activo: ${isMockMode() ? 'MOCK' : 'OPENAI'}`);

    console.log(`🤖 Sarah: procesando "${mensaje}" de ${from}`);

    // 🔧 DETECCIÓN DE SELECCIÓN DE MENÚ (1-8)
    // Si el mensaje es solo un número 1-8 y es temprano en la conversación
    const menuSelection = mensaje.trim().match(/^([1-8])$/);
    if (menuSelection && historial.length <= 2) {
      const optionMap = {
        '1': 'Quiero agendar una nueva cita',
        '2': 'Quiero reagendar una cita existente',
        '3': 'Quiero cancelar una cita',
        '4': 'Quiero saber la ubicación de la clínica',
        '5': 'Quiero consultar los horarios de atención',
        '6': 'Quiero ver los servicios que ofrecen',
        '7': 'Quiero consultar costos',
        '8': 'Quiero ver mis citas agendadas'
      };
      const opcionTexto = optionMap[menuSelection[1]];
      console.log(`🔢 [MENÚ] Selección: ${menuSelection[1]} → "${opcionTexto}"`);

      // 🔧 MANEJO DIRECTO DE OPCIÓN 8: "Ver mis citas agendadas"
      if (menuSelection[1] === '8') {
        console.log(`🔢 [MENÚ] Opción 8: Consultando turnos para ${from}`);

        try {
          // Normalizar teléfono para DB lookup
          const numeroDB = telefonoParaDB(from);
          console.log(`📞 [DB lookup] Número: ${numeroDB}`);

          // Consultar turnos activos del paciente
          const db = getDb();
          const turnos = await db.all(
            `SELECT id, fecha_turno, tipo_turno, estado, notas
             FROM turnos
             WHERE numero_telefono = ? AND estado != 'cancelado'
             ORDER BY fecha_turno ASC`,
            [numeroDB]
          );

          console.log(`📊 [Turnos encontrados] ${turnos.length} para ${numeroDB}`);

          // Formatear respuesta
          if (turnos.length === 0) {
            return `Parece que no tenés citas agendadas con este número. 😊

Si creés que esto es un error, o si usaste otro número para agendar, avisame.

¿Te gustaría agendar una nueva cita? Respondé "1" para comenzar. 🦷✨`;
          } else {
            // Formatear lista de turnos
            const listaTurnos = turnos.map(t => {
              const fecha = new Date(t.fecha_turno).toLocaleDateString('es-AR', {
                weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
              });
              return `• ${fecha} - ${t.tipo_turno}`;
            }).join('\n');

            return `📅 Tus citas agendadas:

${listaTurnos}

¿Necesitás reagendar o cancelar alguna? Respondé:
• "2" para reagendar
• "3" para cancelar
• "1" para agendar una nueva cita 😊`;
          }

        } catch (error) {
          console.error('❌ [ERROR] Consultando turnos:', error.message);
          return `Disculpa, tuve un problema al consultar tus citas. 😔

Por favor intentá de nuevo en unos minutos, o comunicate con nosotros:
📞 ${clinicaConfig?.telefono || '+54911-1234-5678'}
📧 ${clinicaConfig?.email || 'contacto@clinicasonrisa.com'}

¿En qué más puedo ayudarte?`;
        }
      }

      // Para otras opciones, continuar con OpenAI
      mensaje = opcionTexto;
    }

    // 🔄 DETECCIÓN DE "MENÚ" O "0" (volver al inicio)
    if (mensaje.trim().toLowerCase() === 'menú' || mensaje.trim() === '0') {
      console.log(`🔄 [MENÚ] Usuario pidió volver al menú principal`);
      mensaje = 'Mostrame el menú principal de opciones';
    }

    // 🧪 MODO MOCK
    if (isMockMode()) {
      await new Promise(resolve => setTimeout(resolve, 800));
      const respuesta = getMockResponse(mensaje);
      console.log(`✅ [MOCK] Respuesta: "${respuesta}"`);
      return respuesta;
    }

    // 🚀 MODO PRODUCCIÓN (Groq / OpenAI)
    console.log('🚀 Modo Producción (IA) activado');
    const providerInfo = getProviderInfo();
    const systemPrompt = SYSTEM_PROMPT
      .replace('{nombre_clinica}', clinicaConfig?.nombre_clinica || 'la clínica')
      .replace('{direccion}', clinicaConfig?.direccion || '')
      .replace('{telefono}', clinicaConfig?.telefono || '')
      .replace('{email}', clinicaConfig?.email || '')
      .replace('{horarios}', clinicaConfig?.horarios || '')
      .replace('{servicios}', Array.isArray(clinicaConfig?.servicios) ? clinicaConfig.servicios.join(', ') : clinicaConfig?.servicios || '')
      .replace('{numero_telefono_webhook}', telefonoParaDB(from) || 'desconocido');

    const messages = [
      { role: 'system', content: systemPrompt },
      ...historial.map(h => ({ role: h.remitente === 'usuario' ? 'user' : 'assistant', content: h.contenido_mensaje })),
      { role: 'user', content: mensaje }
    ];

    // 🔑 PRIMERA LLAMADA: Usar wrapper getAIResponse (Groq prioridad)
    let response = await getAIResponse(messages, TOOLS, 'auto');

    const assistantMessage = response.choices[0].message;

    // Si hay tool_calls, ejecutar las herramientas y hacer segunda llamada
    if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
      console.log(`🔧 OpenAI solicitó tools:`, assistantMessage.tool_calls.map(tc => tc.function.name));
      
      messages.push(assistantMessage);
      
      for (const toolCall of assistantMessage.tool_calls) {
        try {
          const result = await executeTool(toolCall.function.name, JSON.parse(toolCall.function.arguments));
          messages.push({ 
            role: 'tool', 
            tool_call_id: toolCall.id, 
            content: JSON.stringify(result) 
          });
        } catch (err) {
          console.error(`❌ Error ejecutando tool ${toolCall.function.name}:`, err.message);
          messages.push({ 
            role: 'tool', 
            tool_call_id: toolCall.id, 
            content: JSON.stringify({ error: err.message }) 
          });
        }
      }
      
      // 🔑 SEGUNDA LLAMADA: Usar wrapper getAIResponse
      response = await getAIResponse(messages, null, null);
    }

    return response.choices[0].message.content;

  } catch (error) {
    console.error('❌ Error en processMessage:', error);
    const telefono = clinicaConfig?.telefono || 'la clínica';
    return `Disculpá, estoy teniendo problemas técnicos. Intentá de nuevo o llamá al ${telefono}.`;
  }
};