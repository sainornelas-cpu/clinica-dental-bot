// server/services/ai.js
// Wrapper de IA con prioridad OpenAI (producción) y fallback Groq
import Groq from 'groq-sdk';
import OpenAI from 'openai';

// ==========================================
// 🔧 CONFIGURACIÓN DE PROVEEDOR
// ==========================================
const getProvider = () => {
  const openaiKey = process.env.OPENAI_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;

  // OpenAI como principal si está disponible (más estable para producción)
  if (openaiKey) {
    return { provider: 'openai', key: openaiKey };
  }
  // Fallback a Groq si OpenAI no está configurado
  if (groqKey) {
    return { provider: 'groq', key: groqKey };
  }
  return { provider: null, key: null };
};

// Cliente OpenAI (principal, lazy init)
let openaiClient = null;
const getOpenAIClient = () => {
  if (!openaiClient) {
    const { provider, key } = getProvider();
    if (provider === 'openai' && key) {
      openaiClient = new OpenAI({
        apiKey: key,
        timeout: 10000,  // ⚡ 10s máximo para evitar timeout de Twilio (15s)
        maxRetries: 2    // Reintentar 2 veces si falla por red
      });
      console.log('🚀 Cliente OpenAI inicializado (principal)');
    } else {
      throw new Error('OPENAI_API_KEY no está definida');
    }
  }
  return openaiClient;
};

// Cliente Groq (fallback, lazy init)
let groqClient = null;
const getGroqClient = () => {
  if (!groqClient) {
    const { key } = getProvider();
    if (!key) throw new Error('GROQ_API_KEY no está definida');
    groqClient = new Groq({
      apiKey: key,
      timeout: 10000  // ⚡ También 10s para Groq
    });
    console.log('🔄 Cliente Groq inicializado (fallback)');
  }
  return groqClient;
};

// ==========================================
// 🤖 FUNCIÓN PRINCIPAL DE RESPUESTA
// ==========================================
export const getAIResponse = async (messages, tools, toolChoice = 'auto') => {
  const { provider } = getProvider();

  if (!provider) {
    throw new Error('No hay provider de IA configurado (GROQ_API_KEY u OPENAI_API_KEY)');
  }

  // ⚡ Medir performance
  const startTime = Date.now();

  let response;
  if (provider === 'groq') {
    response = await getGroqResponse(messages, tools, toolChoice);
  } else {
    response = await getOpenAIResponse(messages, tools, toolChoice);
  }

  // ⚡ Log de performance
  const duration = Date.now() - startTime;
  const usage = response.usage;
  console.log(`⚡ [AI] ${provider.toUpperCase()} | Modelo: ${provider === 'groq' ? 'llama-3.1-8b' : 'gpt-4o-mini'} | Tokens: ${usage?.total_tokens || 'N/A'} | Tiempo: ${duration}ms`);

  // ⚠️ Alerta si tarda demasiado
  if (duration > 8000) {
    console.warn(`⚠️ [ALERTA] Respuesta de IA lenta: ${duration}ms (límite recomendado: 8000ms)`);
  }

  return response;
};

// ==========================================
// 🚀 RESPUESTA CON OPENAI (Principal)
// ==========================================
const getOpenAIResponse = async (messages, tools, toolChoice) => {
  const completion = await getOpenAIClient().chat.completions.create({
    model: 'gpt-4o-mini',
    messages,
    tools: tools || undefined,
    tool_choice: toolChoice || undefined,
    temperature: 0.7,
    max_tokens: 250,  // ⚡ Limitar a 250 tokens para velocidad
  });

  return {
    choices: completion.choices,
    usage: completion.usage,
    provider: 'openai'
  };
};

// ==========================================
// 🔄 RESPUESTA CON GROQ (Fallback)
// ==========================================
const getGroqResponse = async (messages, tools, toolChoice) => {
  const completion = await getGroqClient().chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages,
    tools: tools || undefined,
    tool_choice: toolChoice || undefined,
    temperature: 0.7,
    max_tokens: 250,  // ⚡ También limitado para velocidad
  });

  return {
    choices: completion.choices,
    usage: completion.usage,
    provider: 'groq'
  };
};

// ==========================================
// 📊 INFO DEL PROVEEDOR ACTIVO
// ==========================================
export const getProviderInfo = () => {
  const { provider } = getProvider();
  const info = {
    provider,
    model: provider === 'groq' ? 'llama-3.1-8b-instant' : 'gpt-4o-mini',
    isFree: provider === 'groq',
    timeout: 10000
  };
  console.log('📊 [Provider Info]', info);
  return info;
};
