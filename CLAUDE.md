# 🦷 CLÍNICA DENTAL BOT - CONTEXTO ACTUAL (01/06/2026)

## 📊 ESTADO DEL PROYECTO
- **Versión:** v3.6
- **Estado:** ✅ PRODUCCIÓN ACTIVA
- **URL:** https://clinica-dental-bot-production.up.railway.app
- **Dashboard:** https://clinica-dental-bot-production.up.railway.app/dashboard

## 🎯 QUÉ ES ESTE PROYECTO
Sistema de recepción dental con IA (Sarah) vía WhatsApp + Dashboard administrativo para gestión de turnos.

## 🏗️ ARQUITECTURA
- **Backend:** Node.js + Express + SQLite (Railway)
- **Frontend:** React 18 + Vite + Tailwind CSS
- **IA:** OpenAI GPT-4o-mini (principal) + Groq fallback
- **WhatsApp:** Twilio Sandbox → Webhook → Sarah → TwiML → Respuesta
- **Deploy:** Automático con git push

## ✅ FUNCIONALIDADES ACTUALES

### WhatsApp (Sarah)
- Menú numerado 1-8 con intenciones naturales
- Agendamiento paso a paso: nombre → servicio → fecha/hora → confirmación
- Parseo de fechas en español ("mañana 3pm", "sábado 10 de junio")
- Validación de fechas futuras (no permite pasado)
- Consulta disponibilidad en tiempo real
- Reagendar/cancelar turnos
- Ver ubicación, horarios, servicios, costos
- Ver mis citas (usa teléfono del webhook automáticamente)
- Tono rioplatense (vos, tenés, querés)

### Dashboard
- **Mensajes:** Lista con filtro por usuario + auto-refresh 5s
- **Turnos:** Vista Lista + Calendario (próximos 7 días)
- **Owner Schedule:** Agendar/cancelar manualmente desde dashboard
- **Configuración:** Datos clínica, horarios, servicios, webhook URL

## 📁 ARCHIVOS CRÍTICOS

### Backend
- `server/index.js` - Express + static files + SPA routing
- `server/db.js` - SQLite connection
- `server/routes/webhook.js` - POST /api/webhook/whatsapp → TwiML
- `server/routes/turnos.js` - GET/POST/PUT/DELETE para owner
- `server/services/openai.js` - SYSTEM_PROMPT, processMessage, executeTool
- `server/services/ai.js` - Wrapper OpenAI + Groq
- `server/utils/fechas.js` - parsearFechaEspañol + validación futuro
- `server/utils/telefono.js` - normalización multi-país

### Frontend
- `client/src/App.jsx` - Router + Auth
- `client/src/pages/Dashboard.jsx` - Tabs principales
- `client/src/components/TabMensajes.jsx` - Filtro por usuario
- `client/src/components/TabTurnos.jsx` - Lista + Calendario
- `client/src/components/OwnerSchedule.jsx` - Agendar/cancelar owner
- `client/src/components/TabConfiguracion.jsx` - Configuración clínica

## 🔑 VARIABLES DE ENTORNO (Railway)
OPENAI_API_KEY=sk-proj-... (requerida)
GROQ_API_KEY=gsk_... (opcional, fallback)
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=whatsapp:+14155238886
PORT=3001
NODE_ENV=production
DATABASE_URL=file:clinica_dental.db

## 🗄️ BASE DE DATOS
**Tablas:**
- `configuracion_clinica` - Datos clínica (nombre, dirección, horarios, servicios)
- `turnos` - Turnos (id, numero_telefono, nombre_paciente, fecha_turno, tipo_turno, estado, creado_por)
- `mensajes_whatsapp` - Historial mensajes (id, numero_telefono, contenido, remitente, respuesta_ia)
- `pacientes` - Pacientes conocidos (id, numero_telefono, nombre)

## 💬 FLUJO DE CONVERSACIÓN
Usuario: "Hola" → Sarah: Menú 1-8
Usuario: "Quiero agendar" → Sarah: "¿Nombre completo?"
Usuario: "Alfredo Ornelas" → Sarah: "¿Qué tratamiento?"
Usuario: "Limpieza" → Sarah: "¿Qué día/hora?"
Usuario: "Martes 2 de junio 10am" → 🔧 consultar_disponibilidad
Sarah: "✅ Disponible. ¿Confirmo?" → Usuario: "Si" → 🔧 agendar_turno
Sarah: "¡Listo! Turno confirmado 🎉"

## 🚀 COMANDOS
```bash
# Local
npm run dev:server          # Backend
cd client && npm run dev    # Frontend

# Build
cd client && npm run build

# Deploy
git add . && git commit -m "📝 Descripción" && git push

# Ver logs
railway logs  # o Railway Console → Logs
```

## ⚠️ ISSUES ACTIVOS (Prioridad)
🔴 WhatsApp no recibe respuestas - Logs dicen status 200 pero no llega. Debugging activo: verificar TwiML + Twilio Console
🔴 Fechas mostrando 2023 - Turnos aparecen con año 2023 en lugar de 2026. Investigar DB o formato visualización
🟡 Owner Schedule: validación - Input datetime-local da error de validación. Necesita fix de formato + min={fecha_actual}
🟡 Cancelar turno no funciona - Endpoint DELETE existe pero UI no llama correctamente

## 🔍 DEBUGGING ACTUAL
**WhatsApp Delivery**
Logs muestran: 📤 [Webhook] Enviando a Twilio: { status: 200, duration: '3126ms' }
Pero WhatsApp no recibe
Próximo paso: Verificar Twilio Console → Message Logs → errores 30008/30007

**Dashboard Cache**
Build exitoso con cache-busting (hash en filenames)
Hard refresh necesario: Ctrl + Shift + R

## 📋 PRÓXIMOS PASOS INMEDIATOS
Fix WhatsApp: Agregar logging detallado de TwiML completo
Fix fechas: Verificar formato de visualización en TabTurnos.jsx
Fix Owner Schedule: Validación datetime-local + botón cancelar funcional
Testear: Agendar desde dashboard → Verificar en Lista/Calendario

## 🔄 PROTOCOLO ROLLBACK
```bash
git reset --hard HEAD~1
# Railway Console → Deployments → Redeploy commit anterior
```

## 📞 NOTAS IMPORTANTES
- NO modificar SYSTEM_PROMPT sin validación (flujo conversacional funciona)
- Validación de fechas: margen 15min para allowing same-day scheduling
- Horario atención: 9:00 - 18:00 (Lunes a Viernes)
- Twilio Sandbox requiere prefijo "join <palabra>" cada 24h
- Owner Schedule: nuevo feature, necesita testing completo
