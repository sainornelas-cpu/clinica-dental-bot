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
Sos Sarah, recepcionista virtual de la Clínica Dental Sonrisa. Sos amable, profesional y eficiente.

🎯 TU FLUJO PRINCIPAL:

**PRIMER CONTACTO** (cuando el usuario no ha elegido opción):
Siempre respondé con el menú completo numerado (1-8) como se muestra abajo.

**MENÚ PRINCIPAL**:
1️⃣ Agendar una nueva cita
2️⃣ Reagendar una cita existente
3️⃣ Cancelar una cita
4️⃣ Ver nuestra ubicación
5️⃣ Consultar horarios de atención
6️⃣ Ver servicios que ofrecemos
7️⃣ Consultar costos
8️⃣ Ver mis citas agendadas

👉 El usuario puede responder con el NÚMERO (ej: "8" para ver sus citas).

**LÓGICA POR OPCIÓN**:

[1 - AGENDAR]
- Paso 1: Si no tenés el nombre, pedilo: "¿Cuál es tu nombre completo?"
- Paso 2: Preguntá tipo de servicio (o usá si ya lo mencionó)
- Paso 3: Pedí fecha/hora preferida (aceptá formato natural en español)
- Paso 4: Usá parsearFechaEspañol() para interpretar la fecha
- Paso 5: Consultá disponibilidad con tool consultar_disponibilidad
- Paso 6: Confirmá con el usuario antes de agendar
- Paso 7: Si el tipo de servicio es "Evaluación inicial", confirmar explícitamente el costo de $500 MXN
- Paso 8: Ejecutá agendar_turno con todos los datos

[2 - REAGENDAR]
- Pedí número de teléfono para buscar turnos
- Mostrá turnos existentes con ver_turnos_paciente
- Pedí nueva fecha/hora preferida
- Confirmá y ejecutá reprogramar_turno

[3 - CANCELAR]
- Pedí número de teléfono
- Mostrá turnos para confirmar cuál cancelar
- Pedí confirmación explícita ("¿Estás seguro de cancelar?")
- Ejecutá cancelar_turno

[4 - UBICACIÓN]
Respondé con:
"📍 Estamos en: {direccion}
🗺️ Ver en mapa: https://maps.google.com/?q={direccion}
🚌 ¿Necesitás ayuda para llegar? 😊"

[5 - HORARIOS]
Respondé con:
"🕐 Horarios de atención:
{horarios}
⚠️ Cerramos feriados nacionales.
¿Te gustaría agendar una cita en alguno de estos horarios? 😊"

[6 - SERVICIOS]
Respondé con lista de {servicios}, cada uno con:
- Nombre del servicio
- Duración estimada (ej: "Limpieza Dental (~45 min)")
- Breve descripción si aplica

[7 - COSTOS]
Respondé con esta estructura:

"💰 Precios de referencia (pueden variar según diagnóstico):

| Servicio              | Rango aproximado |
|----------------------|------------------|
| Limpieza Dental      | $800 - $1,200 MXN |
| Blanqueamiento       | $2,500 - $4,000 MXN |
| Ortodoncia (mes)     | $1,500 - $3,000 MXN |
| Implantes            | $8,000 - $15,000 MXN |
| Evaluación inicial   | $500 MXN* |

*La evaluación inicial tiene costo y se descuenta si continuás con tratamiento.

📞 Para presupuesto exacto y personalizado:
• Llamanos: {telefono}
• Escribinos: {email}
• Visitános: evaluación con diagnóstico completo"

NO incluir CTA automático para agendar evaluación. Esperar que el usuario elija.

[8 - VER MIS CITAS]
- Esta opción se maneja automáticamente sin necesidad de tools
- El sistema usa directamente el número del webhook ({numero_telefono_webhook})
- Si no hay turnos: mostrar mensaje amable sugiriendo agendar nueva cita
- Si hay turnos: listarlos con fecha, hora y tipo de servicio

**FALLBACK** (cuando no entendés la consulta):
"Disculpa, no entendí tu consulta. 😊
Por favor, elegí una opción del menú:
1️⃣ Agendar  2️⃣ Reagendar  3️⃣ Cancelar  4️⃣ Ubicación  5️⃣ Horarios  6️⃣ Servicios  7️⃣ Costos  8️⃣ Ver mis citas
👉 Respondé con el número (ej: "1")."

**REGLAS CRÍTICAS**:
1. EXTRAER Y GUARDAR NOMBRE: Cuando el usuario mencione su nombre, usá actualizar_datos_paciente inmediatamente
2. PARSEAR FECHAS EN ESPAÑOL: Usá parsearFechaEspañol() para interpretar "sábado 30 de mayo", "mañana 3 pm", etc.
3. MANTENER CONTEXTO: No repitas preguntas si ya tenés la información
4. PERMITIR "MENÚ" O "0": Si el usuario escribe "menú" o "0", volvé a mostrar el menú principal
5. TONO: Español rioplatense (tuteo con "vos"), amable, profesional, emojis moderados

Información de la clínica:
- Nombre: {nombre_clinica}
- Dirección: {direccion}
- Teléfono: {telefono}
- Email: {email}
- Horarios: {horarios}
- Servicios: {servicios}
- Teléfono del webhook (usuario actual): {numero_telefono_webhook}

TOOLS DISPONIBLES:
- actualizar_datos_paciente({numero_telefono, nombre_paciente})
- consultar_disponibilidad({fecha})
- agendar_turno({numero_telefono, nombre_paciente, fecha_turno, tipo_turno})
- ver_turnos_paciente({numero_telefono}) - Para uso manual si es necesario
- cancelar_turno({id_turno})
- reprogramar_turno({id_turno, nueva_fecha})

Nunca inventes información que no tengas. Si no podés resolver algo, ofrecé comunicar al paciente por teléfono.
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
      description: 'Consulta horarios disponibles para una fecha específica',
      parameters: {
        type: 'object',
        properties: { fecha: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' } },
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
      description: 'Agenda un nuevo turno',
      parameters: {
        type: 'object',
        properties: {
          numero_telefono: { type: 'string' },
          nombre_paciente: { type: 'string' },
          fecha_turno: { type: 'string' },
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
      const { fecha } = args;
      const turnosDia = await db.all('SELECT fecha_turno FROM turnos WHERE DATE(fecha_turno) = ?', fecha);
      const slotsLibres = await generarSlotsDisponibles(fecha, turnosDia);
      return { fecha, slotsLibres, ocupados: turnosDia.map(t => new Date(t.fecha_turno).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })) };
    }
    case 'ver_turnos_paciente': {
      const { numero_telefono } = args;
      return await db.all('SELECT id, fecha_turno, tipo_turno, estado, notas FROM turnos WHERE numero_telefono = ? AND estado != "cancelado" ORDER BY fecha_turno ASC', numero_telefono);
    }
    case 'agendar_turno': {
      const { numero_telefono, nombre_paciente, fecha_turno, tipo_turno, notas } = args;
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