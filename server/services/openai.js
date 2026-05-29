import OpenAI from 'openai';
import { getDb } from '../db.js';
import { generarSlotsDisponibles } from '../utils/fechas.js';

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
  'hola': '¡Hola! 👋 Soy Sarah, tu recepcionista virtual. ¿En qué puedo ayudarte hoy? 🦷✨',
  'turno': '¡Claro! Para agendar necesito: tu nombre completo, el día que preferís y el tipo de consulta. ¿Me contás?',
  'limpieza': 'La limpieza dental dura ~45 min. Tenemos horarios martes y jueves. ¿Te gustaría agendar?',
  'horarios': 'Atendemos Lunes a Viernes de 9:00 a 18:00. ¿Qué día te viene bien?',
  'precio': 'Los precios varían según el tratamiento. ¿Qué servicio te interesa?',
  'cancelar': 'Para cancelar un turno, necesito el ID del turno o tu número de teléfono.',
  'urgencia': '⚠️ Entiendo que es urgencia. Por favor, llamá directamente al teléfono de la clínica.',
  'default': 'Entendí tu consulta. Para darte una respuesta precisa, ¿podrías contarme un poco más? 🦷'
};

const getMockResponse = (mensaje) => {
  const lower = mensaje.toLowerCase();
  for (const [keyword, response] of Object.entries(mockResponses)) {
    if (lower.includes(keyword)) return response;
  }
  return mockResponses.default;
};

// ==========================================
// 🚀 MODO PRODUCCIÓN (OpenAI GPT-4o)
// ==========================================
// 🔑 CLIENTE LAZY: Se crea dentro de la función para asegurar que dotenv ya cargó
// Esto soluciona el problema de imports en ES Modules donde dotenv.config() 
// se ejecuta después de que los módulos importan este archivo.
let openaiClient = null;
const getOpenAIClient = () => {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY no está definida en process.env. Verificá tu archivo .env');
    }
    openaiClient = new OpenAI({ apiKey });
    console.log('🔑 OpenAI client inicializado correctamente');
  }
  return openaiClient;
};

const SYSTEM_PROMPT = `
Sos Sarah, recepcionista virtual de {nombre_clinica}. Sos amable, profesional y eficiente.
Tu rol es:
- Responder preguntas sobre la clínica, servicios y horarios
- Ayudar a agendar, consultar, cancelar o reprogramar turnos
- Ser cálida y concisa, usar emojis moderadamente
- Usar español rioplatense (tuteo con "vos", no "usted")

Información de la clínica:
- Nombre: {nombre_clinica}
- Dirección: {direccion}
- Teléfono: {telefono}
- Email: {email}
- Horarios: {horarios}
- Servicios: {servicios}

Reglas:
- Si quieren un turno, pedí nombre completo, fecha/hora preferida y tipo de consulta
- Si no hay disponibilidad, sugerí alternativas cercanas
- Nunca inventes información que no tengas
- Si no podés resolver algo, ofrecé comunicar al paciente por teléfono
`;

const TOOLS = [
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

    // 🧪 MODO MOCK
    if (isMockMode()) {
      await new Promise(resolve => setTimeout(resolve, 800));
      const respuesta = getMockResponse(mensaje);
      console.log(`✅ [MOCK] Respuesta: "${respuesta}"`);
      return respuesta;
    }

    // 🚀 MODO PRODUCCIÓN (OpenAI)
    console.log('🚀 Modo Producción (OpenAI) activado');
    const systemPrompt = SYSTEM_PROMPT
      .replace('{nombre_clinica}', clinicaConfig?.nombre_clinica || 'la clínica')
      .replace('{direccion}', clinicaConfig?.direccion || '')
      .replace('{telefono}', clinicaConfig?.telefono || '')
      .replace('{email}', clinicaConfig?.email || '')
      .replace('{horarios}', clinicaConfig?.horarios || '')
      .replace('{servicios}', Array.isArray(clinicaConfig?.servicios) ? clinicaConfig.servicios.join(', ') : clinicaConfig?.servicios || '');

    const messages = [
      { role: 'system', content: systemPrompt },
      ...historial.map(h => ({ role: h.remitente === 'usuario' ? 'user' : 'assistant', content: h.contenido_mensaje })),
      { role: 'user', content: mensaje }
    ];

    // 🔑 PRIMERA LLAMADA: Usar getOpenAIClient() en lugar de openai directo
    let response = await getOpenAIClient().chat.completions.create({
      model: 'gpt-4o',
      messages,
      tools: TOOLS,
      tool_choice: 'auto',
      temperature: 0.7
    });

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
      
      // 🔑 SEGUNDA LLAMADA: También usar getOpenAIClient()
      response = await getOpenAIClient().chat.completions.create({ 
        model: 'gpt-4o', 
        messages, 
        temperature: 0.7 
      });
    }

    return response.choices[0].message.content;

  } catch (error) {
    console.error('❌ Error en processMessage:', error);
    const telefono = clinicaConfig?.telefono || 'la clínica';
    return `Disculpá, estoy teniendo problemas técnicos. Intentá de nuevo o llamá al ${telefono}.`;
  }
};