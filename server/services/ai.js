// server/services/ai.js
// Wrapper de IA con prioridad Groq (FREE) y fallback OpenAI
import Groq from 'groq-sdk';
import OpenAI from 'openai';

// ==========================================
// 🔧 CONFIGURACIÓN DE PROVEEDOR
// ==========================================
const getProvider = () => {
  const groqKey = process.env.GROQ_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (groqKey) {
    return { provider: 'groq', key: groqKey };
  } else if (openaiKey) {
    return { provider: 'openai', key: openaiKey };
  }
  return { provider: null, key: null };
};

// Cliente Groq (lazy init)
let groqClient = null;
const getGroqClient = () => {
  if (!groqClient) {
    const { key } = getProvider();
    if (!key) throw new Error('GROQ_API_KEY no está definida');
    groqClient = new Groq({ apiKey: key });
    console.log('🚀 Cliente Groq inicializado');
  }
  return groqClient;
};

// Cliente OpenAI (fallback, lazy init)
let openaiClient = null;
const getOpenAIClient = () => {
  if (!openaiClient) {
    const { provider, key } = getProvider();
    if (provider === 'openai' && key) {
      openaiClient = new OpenAI({ apiKey: key });
      console.log('🔄 Cliente OpenAI inicializado (fallback)');
    } else {
      throw new Error('OPENAI_API_KEY no está definida');
    }
  }
  return openaiClient;
};

// ==========================================
// 🤖 FUNCIÓN PRINCIPAL DE RESPUESTA
// ==========================================
export const getAIResponse = async (messages, tools, toolChoice = 'auto') => {
  const { provider } = getProvider();

  if (provider === 'groq') {
    return await getGroqResponse(messages, tools, toolChoice);
  } else if (provider === 'openai') {
    return await getOpenAIResponse(messages, tools, toolChoice);
  }

  throw new Error('No hay provider de IA configurado (GROQ_API_KEY u OPENAI_API_KEY)');
};

// ==========================================
// 🚀 RESPUESTA CON GROQ (Llama 3.1)
// ==========================================
const getGroqResponse = async (messages, tools, toolChoice) => {
  console.log('🤖 [Groq] Usando Llama 3.1 8B - FREE');

  const completion = await getGroqClient().chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages,
    tools: tools || undefined,
    tool_choice: toolChoice || undefined,
    temperature: 0.7,
    max_tokens: 300,
  });

  const usage = completion.usage;
  console.log(`✅ [Groq] Tokens: ${usage?.total_tokens || 'N/A'} | Prompt: ${usage?.prompt_tokens || 'N/A'} | Completion: ${usage?.completion_tokens || 'N/A'}`);

  return {
    choices: completion.choices,
    usage: completion.usage,
    provider: 'groq'
  };
};

// ==========================================
// 🔄 RESPUESTA CON OPENAI (Fallback)
// ==========================================
const getOpenAIResponse = async (messages, tools, toolChoice) => {
  console.log('🔄 [OpenAI] Usando GPT-4o-mini (fallback)');

  const completion = await getOpenAIClient().chat.completions.create({
    model: 'gpt-4o-mini',
    messages,
    tools: tools || undefined,
    tool_choice: toolChoice || undefined,
    temperature: 0.7,
    max_tokens: 300,
  });

  const usage = completion.usage;
  console.log(`✅ [OpenAI] Tokens: ${usage?.total_tokens || 'N/A'}`);

  return {
    choices: completion.choices,
    usage: completion.usage,
    provider: 'openai'
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
    isFree: provider === 'groq'
  };
  console.log('📊 [Provider Info]', info);
  return info;
};
