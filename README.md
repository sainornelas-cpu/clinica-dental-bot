# 🦷 Clínica Dental Bot

![Production Ready](https://img.shields.io/badge/status-producción--ready-success?style=flat-square)
![Version](https://img.shields.io/badge/v3.7-estable-blue?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)

Sistema de recepción dental inteligente con IA vía WhatsApp + Dashboard administrativo para gestión de turnos.

## 📋 Tabla de Contenidos

- [Descripción](#-descripción)
- [Arquitectura](#-arquitectura)
- [Requisitos](#-requisitos)
- [Instalación Local](#-instalación-local)
- [Variables de Entorno](#-variables-de-entorno)
- [Deploy en Railway](#-deploy-en-railway)
- [Base de Datos](#-base-de-datos)
- [API Endpoints](#-api-endpoints)
- [Testing](#-testing)
- [Troubleshooting](#-troubleshooting)
- [Contribuir](#-contribuir)
- [Licencia](#-licencia)

## 🎯 Descripción

**Clínica Dental Bot** es un sistema automatizado de recepción dental que permite:

- 📱 **Agendamiento vía WhatsApp**: Los pacientes envían mensajes y Sarah (IA) gestiona el turno
- 👤 **Dashboard administrativo**: Los dueños pueden ver, crear y cancelar turnos manualmente
- 💾 **Persistencia garantizada**: Base de datos con volumen persistente en Railway
- 🌍 **Fechas correctas**: Sistema de timezone UTC para evitar errores de día/año
- 🕐 **Slots consistentes**: Turnos de 1 hora (9:00-17:00) en WhatsApp y Dashboard

**Valor principal**: Automatiza el 80% de las tareas de recepción (agendamiento, consultas, recordatorios) permitiendo que el personal se enfoque en atención al paciente.

## 🏗️ Arquitectura

```
┌─────────────────┐
│  WhatsApp User  │
│  (Paciente)     │
└────────┬────────┘
         │ Mensaje
         ↓
┌─────────────────┐      ┌──────────────┐      ┌─────────────┐
│   Twilio API    │──────│  Express     │──────│   SQLite    │
│  (Webhook)      │      │  Server      │      │   Railway    │
└─────────────────┘      │  + OpenAI    │      │   Volume     │
                         │  (Sarah)     │      └─────────────┘
                         └───────┬───────┘              ↑
                                 │                        │
┌─────────────────┐      ┌───────▼───────┐              │
│   Dashboard     │◀─────│   React SPA   │───────────────┘
│   (Owner)       │      │   TanStack    │
└─────────────────┘      └───────────────┘
```

### Componentes Principales

| Componente | Tecnología | Propósito |
|-----------|-----------|-----------|
| **Backend** | Node.js + Express | API REST, webhook handler, lógica de negocio |
| **Frontend** | React 18 + Vite + Tailwind CSS | Dashboard administrativo con tiempo real |
| **IA** | OpenAI GPT-4o-mini + Groq fallback | Procesamiento de lenguaje natural en español |
| **DB** | SQLite + Railway Volume | Persistencia de turnos, mensajes y configuración |
| **WhatsApp** | Twilio API | Comunicación bidireccional con pacientes |

## 🔧 Requisitos

- **Node.js** >= 18.x
- **npm** >= 9.x
- **Git** (para control de versiones)
- **Cuenta en [Railway.app](https://railway.app)**
- **API Keys**: [OpenAI](https://platform.openai.com), [Twilio](https://www.twilio.com)

## 🚀 Instalación Local

### 1. Clonar repositorio

```bash
git clone https://github.com/sainornelas-cpu/clinica-dental-bot.git
cd clinica-dental-bot
```

### 2. Instalar dependencias

```bash
# Backend (raíz del proyecto)
npm install

# Frontend
cd client && npm install && cd ..
```

### 3. Configurar variables de entorno

```bash
cp .env.example .env
# Editar .env con tus credenciales (ver sección Variables)
```

### 4. Ejecutar en desarrollo

```bash
# Terminal 1: Backend
npm run dev:server
# → Escuchando en http://localhost:3001

# Terminal 2: Frontend
cd client && npm run dev
# → Escuchando en http://localhost:5173
```

### 5. Acceder

- **Frontend**: http://localhost:5173
- **API**: http://localhost:3001/api
- **Dashboard**: http://localhost:5173/dashboard

## 🔑 Variables de Entorno

### Archivo .env.example

```bash
# ==========================================
# 🤖 IA Providers
# ==========================================
OPENAI_API_KEY=sk-proj-...          # Requerido - Proveedor principal
GROQ_API_KEY=gsk_...                # Opcional - Backup si OpenAI falla
USE_MOCK=false                       # true para usar respuestas mock

# ==========================================
# 📱 Twilio (WhatsApp)
# ==========================================
TWILIO_ACCOUNT_SID=AC...            # Requerido - Dashboard Twilio
TWILIO_AUTH_TOKEN=...               # Requerido - Dashboard Twilio
TWILIO_PHONE_NUMBER=whatsapp:+...   # Sandbox: +14155238886

# ==========================================
# 🖥️ Servidor
# ==========================================
PORT=3001                            # Puerto del backend
NODE_ENV=development                 # development | production
DATABASE_URL=file:clinica_dental.db # Local usa archivo, Railway usa volumen
```

### ⚠️ Notas Importantes

- **Nunca** commitear `.env` con credenciales reales
- ✅ Usar **Railway Variables** para producción
- 🔁 **Rotar API keys** periódicamente por seguridad
- 📝 **Usar USE_MOCK=true** para desarrollo sin consumir API credits

## 🚀 Deploy en Railway

### Configuración Inicial

1. **Crear proyecto en Railway**
   - Ir a https://railway.app
   - Click "New Project" → "Deploy from GitHub repo"
   - Seleccionar este repositorio

2. **Configurar variables de entorno**
   - Railway Console → Variables
   - Agregar todas las variables de la sección anterior

3. **Crear volumen persistente**
   ```bash
   # Vía CLI
   railway volume add -m //app/data

   # O vía Dashboard: Settings → Volumes → New Volume
   # Name: clinica-db
   # Mount Path: //app/data
   # Attach to: clinica-dental-bot
   ```

### railway.json (ya incluido en repo)

```json
{
  "build": { "builder": "NIXPACKS" },
  "deploy": {
    "startCommand": "node server/index.js",
    "buildCommand": "cd client && npm run build",
    "volumes": [{ "name": "clinica-db", "mountPath": "//app/data" }]
  }
}
```

### Deploy Automático

```bash
# Cada push a main triggera deploy automático
git add .
git commit -m "📝 Descripción del cambio"
git push origin main

# Ver estado
railway status

# Ver logs en tiempo real
railway logs --follow
```

## 🗄️ Base de Datos

### Esquema Principal

```sql
-- Tabla: turnos
CREATE TABLE turnos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  numero_telefono TEXT NOT NULL,
  nombre_paciente TEXT NOT NULL,
  fecha_turno DATETIME NOT NULL,
  tipo_turno TEXT NOT NULL,
  notas TEXT,
  estado TEXT DEFAULT 'confirmado',
  creado_por TEXT DEFAULT 'whatsapp',
  creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
  cancelado_por TEXT,
  cancelado_en DATETIME,
  modificado_por TEXT
);

-- Tabla: mensajes_whatsapp
CREATE TABLE mensajes_whatsapp (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  numero_telefono TEXT NOT NULL,
  contenido_mensaje TEXT NOT NULL,
  remitente TEXT NOT NULL,
  respuesta_ia TEXT,
  recibido_en DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: configuracion_clinica
CREATE TABLE configuracion_clinica (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre_clinica TEXT,
  direccion TEXT,
  telefono TEXT,
  email TEXT,
  horarios TEXT,
  servicios TEXT,
  webhook_url TEXT,
  actualizado_en DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Backup Manual

```bash
# Acceder a shell de Railway
railway shell

# Ejecutar backup
sqlite3 //app/data/clinica_dental.db ".backup backup_$(date +%Y%m%d_%H%M%S).db"
.exit

# Descargar backup a local
railway volume files download //app/data/backup.db ./backup.db
```

### Migraciones

Las migraciones de schema se aplican manualmente vía railway shell:

```bash
# Ejemplo de migración
railway shell
node --input-type=module -e "
import { conectarBaseDeDatos, getDb } from './server/db.js';
await conectarBaseDeDatos();
const db = getDb();
// Tu código de migración aquí
await db.close();
"
```

Script de ejemplo: `server/scripts/migrate-persistent.js`

## 🔌 API Endpoints

### WhatsApp Webhook

```
POST /api/webhook/whatsapp
Content-Type: application/x-www-form-urlencoded
Body: Body=<mensaje>&From=<whatsapp:+numero>
Response: TwiML XML
```

### Turnos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/turnos` | Lista de turnos confirmados |
| `GET` | `/api/turnos/slots?fecha=YYYY-MM-DD` | Slots disponibles para fecha |
| `POST` | `/api/turnos` | Crear nuevo turno (Owner) |
| `PUT` | `/api/turnos/:id` | Actualizar turno (Owner) |
| `DELETE` | `/api/turnos/:id` | Cancelar turno (Owner) |

### Configuración

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/configuracion` | Datos de la clínica |
| `PUT` | `/api/configuracion` | Actualizar configuración (Owner) |

### Debug (solo desarrollo)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/debug/turnos` | Turnos con campo `_year` para diagnóstico |
| `GET` | `/api/debug/migrate` | Ejecutar migración de schema |

## 🧪 Testing

### Pruebas de Humo (Post-Deploy)

```bash
# 1. Servicio online
railway status
# → Debe decir: "● Online"

# 2. DB persistente
railway logs --lines 50 | grep "Usando volumen persistente"
# → Debe ver: "💾 [DB] Usando volumen persistente: //app/data/..."

# 3. API responde
curl.exe https://tu-url.railway.app/api/configuracion
# → JSON válido con datos de clínica

# 4. Crear turno
curl.exe -X POST https://tu-url.railway.app/api/turnos `
  -H "Content-Type: application/json" `
  -d '{"numero_telefono":"+521...","nombre_paciente":"Test","fecha_turno":"2026-06-10T10:00:00","tipo_turno":"Limpieza Dental"}'
# → {"success":true,"id":X,"mensaje":"Turno agendado..."}

# 5. Persistencia post-deploy
# → Hacer deploy trivial → curl /api/turnos → verificar turno sigue ahí
```

### WhatsApp Testing

**Sandbox (testing):**
```bash
# 1. Guardar número en teléfono
whatsapp:+14155238886

# 2. Enviar mensaje de unión
"join dental-bot"

# 3. Probar agendamiento
"Hola"
# → Debe recibir menú de Sarah
"Quiero agendar"
# → Flujo de agendamiento
```

**Producción (post-aprobación Meta):**
```bash
# 1. Usar número configurado en TWILIO_PHONE_NUMBER
# 2. Enviar directamente sin join code
"Hola"
# → Debe recibir respuesta de Sarah en <10s
```

## 🛠️ Troubleshooting

| Problema | Causa Probable | Solución |
|----------|----------------|-----------|
| `SQLITE_ERROR: no such column` | Migración no aplicada | Ejecutar `server/scripts/migrate.js` en railway shell |
| Fechas muestran año incorrecto | Timezone frontend | Verificar `timeZone: 'UTC'` en `formato.js` |
| WhatsApp no recibe respuesta | Límite Twilio Sandbox (63038) | Esperar reset 24h o upgrade a cuenta paga |
| `Invalid Date` en DB | Formato fecha incorrecto | Usar `YYYY-MM-DDTHH:mm:ss` sin 'Z' final |
| Deploy falla en Railway | Error en build o variables | `railway logs --lines 100` |
| Slots no aparecen en Owner | Endpoint `/slots` no registrado | Verificar `server/routes/turnos.js` tiene `router.get('/slots')` |

### Comandos de Diagnóstico Rápido

```powershell
# Ver estado del servicio
railway status

# Ver logs recientes
railway logs --lines 100

# Ver variables de entorno
railway variables

# Ver volumen montado
railway volume list

# Reiniciar servicio sin rebuild
railway restart

# Rollback a commit anterior
git reset --hard HEAD~1
git push origin main --force
```

## 🤝 Contribuir

1. **Fork** el repositorio
2. **Crear branch**: `git checkout -b feature/nueva-funcionalidad`
3. **Commit** con convención: `git commit -m "✨ Add: descripción"`
4. **Push**: `git push origin feature/nueva-funcionalidad`
5. **Abrir Pull Request** en GitHub
6. **Esperar** review y aprobación

### Convenciones de Commit

| Emoji | Tipo | Ejemplo |
|-------|------|---------|
| ✨ | Add: Nueva funcionalidad | `✨ Add: menú de opciones en WhatsApp` |
| 🔧 | Fix: Corrección de bug | `🔧 Fix: formato de fecha en Owner Schedule` |
| 📝 | Docs: Actualización de documentación | `📝 Docs: agregar README.md` |
| 🎨 | Style: Cambios de formato/estilo | `🎨 Style: formato de código` |
| ♻️ | Refactor: Refactorización de código | `♻️ Refactor: simplificar lógica de turnos` |
| 🚀 | Perf: Mejoras de performance | `🚀 Perf: optimizar query de turnos` |
| ✅ | Test: Agregar/modificar tests | `✅ Test: test de validación de fechas` |
| 🔒 | Security: Fix de seguridad | `🔒 Security: sanitizar inputs de usuario` |

## 📄 Licencia

MIT License - Ver archivo `LICENSE` para detalles.

---

**Desarrollado con ❤️ para clínicas dentales que quieren automatizar su recepción**

📧 Soporte: [Issues en GitHub](https://github.com/sainornelas-cpu/clinica-dental-bot/issues)
