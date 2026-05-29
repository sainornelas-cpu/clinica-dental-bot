# 🦷 CLÍNICA DENTAL BOT - CLAUDE.md (ESTADO FINAL - FUNCIONAL)

> Archivo de contexto técnico. Leer al inicio de CUALQUIER sesión de desarrollo.

## 🎯 OBJETIVO
Sistema de turnos para clínica dental con agente IA "Sarah" vía WhatsApp + Dashboard web para gestión manual.

## ✅ ESTADO ACTUAL: 100% FUNCIONAL
- **Backend:** Express + Node.js en http://localhost:3001 ✅
- **Frontend:** React 18 + Vite + Tailwind en http://localhost:5173 ✅
- **IA:** OpenAI GPT-4o real (USE_MOCK=false) ✅
- **Base de datos:** SQLite local (clinica_dental.db) ✅
- **WhatsApp:** Twilio Sandbox + Ngrok ✅
- **Contexto:** Sarah recuerda conversaciones multi-turno ✅
- **Tools:** Agendar, consultar, cancelar, reprogramar turnos ✅

## 🔧 FIXES CRÍTICOS APLICADOS (NO REVERTIR)

### 1. Lazy Init de OpenAI Client (`server/services/openai.js`)
```javascript
// Problema: En ES Modules, los imports se ejecutan antes que dotenv.config()
// Solución: Inicializar el cliente DENTRO de la función, no al nivel módulo
let openaiClient = null;
const getOpenAIClient = () => {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error('OPENAI_API_KEY no definida');
    openaiClient = new OpenAI({ apiKey });
    console.log('🔑 OpenAI client inicializado');
  }
  return openaiClient;
};
// Uso: await getOpenAIClient().chat.completions.create(...)

Evaluación Lazy de USE_MOCK (server/services/openai.js)
// Problema: const USE_MOCK = process.env.USE_MOCK !== 'false' se evaluaba antes de dotenv
// Solución: Función que evalúa en runtime, con parsing robusto
const isMockMode = () => {
  const val = (process.env.USE_MOCK || '').trim().toLowerCase();
  return val !== 'false';
};
// Uso: if (isMockMode()) { ... }

3. dotenv.config() al inicio absoluto de server/index.js
// LÍNEAS 1-3 de index.js (CRÍTICO):
import dotenv from 'dotenv';
dotenv.config();
// ← Todo lo demás va DESPUÉS
 ESTRUCTURA DEL PROYECTO

 clinica-dental-bot/
├── server/
│   ├── index.js              # Express + dotenv.config() al inicio
│   ├── db.js                 # SQLite + schema
│   ├── routes/
│   │   ├── webhook.js        # POST /api/webhook/whatsapp (con logs debug)
│   │   ├── turnos.js, mensajes.js, configuracion.js
│   ├── services/
│   │   └── openai.js         # Sarah: lazy init + isMockMode() + tools
│   └── utils/fechas.js
├── client/                   # React + Vite + Tailwind
│   ├── src/
│   │   ├── main.jsx, App.jsx
│   │   ├── lib/api.js
│   │   ├── pages/Landing.jsx, Dashboard.jsx
│   │   └── components/TabMensajes.jsx, TabTurnos.jsx, TabConfiguracion.jsx
│   └── vite.config.js        # Proxy /api → localhost:3001
├── .env                      # OPENAI_API_KEY, USE_MOCK=false, PORT=3001
├── clinica_dental.db         # SQLite local
└── CLAUDE.md                 # ESTE ARCHIVO

 VARIABLES DE ENTORNO (.env) - FORMATO EXACTO
 OPENAI_API_KEY=sk-proj-tu-clave-aqui
USE_MOCK=false
PORT=3001
 Reglas críticas:
Sin comillas: KEY=valor ✅ | KEY="valor" ❌
Sin espacios: USE_MOCK=false ✅ | USE_MOCK = false ❌
Encoding: UTF-8 sin BOM (usar PowerShell para crear/editar)

SERVICIOS EXTERNOS
Servicio
Configuración
Notas
Twilio WhatsApp Sandbox
Número: +1 415 523 8886
Webhook: [NGROK_URL]/api/webhook/whatsapp
Ngrok
.\ngrok.exe http 3001
URL dinámica: cambia al reiniciar
OpenAI
GPT-4o + Function Calling
Tools: consultar_disponibilidad, agendar_turno, etc.
LOGS DE DEBUG ACTIVOS (OPCIONALES)
Estos logs ayudan a debuggear pero pueden removerse en producción:
Archivo
Líneas
Log
Propósito
webhook.js
~antes de processMessage
🔍 [DEBUG] Historial enviado...
Verificar contexto
openai.js
~línea 12
🔍 [MODULE-LOAD]...
Confirmar parsing de USE_MOCK
openai.js
~línea 200
🔍 [LAZY-CHECK]...
Confirmar modo en runtime
openai.js
~línea 210
🔍 [DEBUG] Array messages...
Verificar formato para OpenAI
openai.js
~línea 215
⚠️ [DEBUG] DUPLICACIÓN...
Detectar mensajes duplicados (no crítico)
💡 Para remover logs de debug: Buscar // 🔍 [DEBUG] y console.log asociados, eliminar, guardar.
WhatsApp → Twilio Sandbox → Ngrok → POST /api/webhook/whatsapp
→ Express parsea Body/From → Guarda mensaje usuario en SQLite
→ Obtiene historial (últimos 20 mensajes) → Llama a processMessage
→ isMockMode() evalúa USE_MOCK en runtime → Si false: usa OpenAI
→ getOpenAIClient() inicializa cliente si es primera vez
→ Construye array messages: [system, ...historial, mensaje_actual]
→ OpenAI responde (posiblemente con tool_calls)
→ Si hay tools: ejecutar executeTool() → segunda llamada a OpenAI
→ Guarda respuesta en SQLite → Responde TwiML XML → Twilio → WhatsApp
→ Dashboard recibe mensaje vía polling cada 5s
 COMANDOS DE VERIFICACIÓN RÁPIDA
 # Backend
cd "C:/Users/HP/Projects/Clinica-Dental-bot" && npm run dev:server
# Esperar: "🚀 Servidor escuchando en http://localhost:3001"

# Frontend
cd "C:/Users/HP/Projects/Clinica-Dental-bot/client" && npm run dev
# Esperar: "➜  Local:   http://localhost:5173/"

# Ngrok
cd "C:\ngrok" && .\ngrok.exe http 3001
# Copiar URL: https://xxx.ngrok-free.dev

# Probar webhook (curl)
curl.exe -k -X POST https://xxx.ngrok-free.dev/api/webhook/whatsapp `
  -d "Body=Hola Sarah&From=whatsapp:+5491112345678"

# Ver logs de modo (al enviar mensaje)
# Buscar: "🔑 [MODO] USE_MOCK env: "false" → Modo activo: OPENAI"
 RUTA A PRODUCCIÓN (Fase 5 - Pendiente)
Remover logs de debug de webhook.js y openai.js
Migrar SQLite → PostgreSQL (opcional, recomendado para escala)
Deploy backend en Railway/Render con variables de entorno seguras
Deploy frontend en Vercel/Netlify o servir desde Express
Actualizar webhook en Twilio a URL de producción (sin Ngrok)
Configurar dominio personalizado + HTTPS
Switch a número real de Twilio (no Sandbox)

 REGLAS PARA IA ASISTENTE
Archivos COMPLETOS, UTF-8, JavaScript (no TypeScript)
Español total en UI, logs, comentarios y prompts
NO modificar vite.config.js ni tailwind.config.js sin autorización
Usar async/await y try/catch en todas las operaciones de DB/API
Mantener compatibilidad con lazy init (getOpenAIClient, isMockMode)
Antes de escribir archivos, confirmar ruta absoluta
Esperar confirmación del usuario entre pasos críticos
Si se agregan logs de debug, documentarlos en esta sección de CLAUDE.md

ARCHIVOS CRÍTICOS (NO MODIFICAR SIN CONFIRMACIÓN)
server/index.js - Orden de imports + dotenv.config()
server/services/openai.js - Lazy init + isMockMode() + tools
server/routes/webhook.js - Flujo de webhook + historial
.env - Variables de entorno (formato exacto)
client/vite.config.js - Proxy de API