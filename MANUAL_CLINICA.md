# 🦷 Manual de Uso - Clínica Dental Sonrisa

> Guía práctica para usar Sarah (tu recepcionista virtual) y el Dashboard administrativo

---

## 👋 Bienvenida

¡Hola equipo de Clínica Dental Sonrisa! 🎉

Este manual te ayudará a usar el nuevo sistema de recepción con inteligencia artificial. Sarah, tu asistente virtual, atenderá a los pacientes por WhatsApp 24/7, y vos podrás gestionar todo desde el Dashboard.

### ¿Qué puede hacer Sarah?
✅ Responder preguntas frecuentes automáticamente
✅ Agendar, reagendar y cancelar turnos
✅ Informar ubicación, horarios y servicios
✅ Recordar el nombre y contexto de cada paciente
✅ Derivar al personal humano cuando sea necesario

### ¿Qué NO hace Sarah?
❌ No diagnostica condiciones médicas
❌ No prescribe medicamentos
❌ No reemplaza la atención personalizada para casos complejos

---

## 📱 Para los Pacientes: Cómo Usar WhatsApp

### Primer Contacto

1. El paciente guarda el número de WhatsApp de la clínica: `+[número-configurado]`
2. Escribe **"Hola"** para comenzar
3. Sarah responde con el menú de opciones:

```
¡Hola! 👋 Soy Sarah, recepcionista de la Clínica Dental Sonrisa.
¿En qué puedo ayudarte hoy?

1️⃣ Agendar una nueva cita
2️⃣ Reagendar una cita existente
3️⃣ Cancelar una cita
4️⃣ Ver ubicación
5️⃣ Horarios de atención
6️⃣ Servicios disponibles
7️⃣ Consulta de costos
8️⃣ Ver mis citas agendadas

👉 Podés responder con el número o contarme directamente qué necesitás. 😊
```

### Flujo de Agendamiento (Paso a Paso)

#### Paso 1: Iniciar agendamiento

**Paciente:** "Quiero agendar una cita" o "1"

**Sarah:** "¡Perfecto! Para poder agendar tu cita, ¿cuál es tu nombre completo? 😊"

#### Paso 2: Proporcionar nombre

**Paciente:** "Alfredo Ornelas"

**Sarah:** "Gracias, Alfredo. 😊 Ahora, ¿qué tipo de tratamiento necesitás?
Nuestros servicios son:
• Limpieza Dental
• Ortodoncia
• Blanqueamiento
• Implantes
• Extracción de Muelas
👉 Respondé con el nombre del servicio o elegí uno de la lista."

#### Paso 3: Seleccionar servicio y horario

**Paciente:** "Limpieza Dental"

**Sarah:** "¿Qué día y hora te vendría mejor? (Ej: 'mañana a las 3pm', 'sábado 10 de junio')
🕘 Atendemos de Lunes a Viernes: 9:00 - 18:00
⚠️ IMPORTANTE: Solo podemos agendar turnos para fechas y horarios FUTUROS."

#### Paso 4: Confirmación

**Sarah:** "✅ Sí, está disponible el martes 2 de junio a las 10:00 para tu limpieza dental. ¿Confirmo el turno? 😊"

**Paciente:** "Si" o "Confirmo"

**Sarah:** "¡Listo, Alfredo! Tu turno para limpieza dental está agendado exitosamente para el martes 2 de junio a las 10:00. 🎉
Si necesitás algo más o tenés alguna pregunta, no dudes en decírmelo. ¡Te esperamos en la Clínica Dental Sonrisa! 😊✨"

### Comandos Rápidos para Pacientes

| Mensaje del Paciente | Resultado |
|---------------------|-----------|
| "Hola" | Menú principal de opciones |
| "Agendar" / "1" | Iniciar proceso de nueva cita |
| "Reagendar" / "2" | Modificar cita existente |
| "Cancelar" / "3" | Cancelar una cita |
| "Ubicación" / "4" | Dirección y mapa de la clínica |
| "Horarios" / "5" | Horarios de atención (Lun-Vie 9:00-18:00) |
| "Servicios" / "6" | Lista de tratamientos disponibles |
| "Costos" / "7" | Información de precios (si está configurada) |
| "Mis citas" / "8" | Listar citas agendadas para ese número |
| "Gracias" / "Adiós" | Despedida cordial |

### 💡 Tips para los Pacientes

- 🗣️ Podés escribir de forma natural: "necesito una limpieza la próxima semana"
- 📅 Sarah entiende fechas en español: "mañana", "el lunes", "10 de junio"
- ⏰ Los turnos son de **1 hora de duración**
- 🔁 Para cambiar una cita: usá la opción 2 o escribí "reagendar"
- ❌ Para cancelar: usá la opción 3 o escribí "cancelar mi cita"

---

## 👨‍⚕️ Para el Personal: Dashboard Administrativo

### Acceso al Dashboard

🔗 **URL:** `https://clinica-dental-bot-production.up.railway.app/dashboard`

> 🔐 **Nota:** Actualmente el acceso es abierto. En futuras versiones se agregará login con usuario/contraseña.

### 📋 Pestaña: Mensajes

![Screenshot: Lista de mensajes](placeholder-mensajes.png)

**Qué ves aquí:**
- 📬 Todas las conversaciones de WhatsApp en tiempo real
- 🔄 Actualización automática cada 5 segundos
- 👤 Selector para filtrar por paciente (número de teléfono)

**Cómo usar:**
1. Usá el selector "Filtrar por usuario" para ver conversaciones de un paciente específico
2. Los mensajes del paciente aparecen a la derecha (💬 Usuario)
3. Las respuestas de Sarah aparecen a la izquierda (🤖 Sarah)
4. Podés copiar cualquier mensaje para referencia

**Cuándo revisar esta sección:**
- ✅ Para monitorear conversaciones en tiempo real
- ✅ Para entender qué preguntas hacen los pacientes
- ✅ Para identificar oportunidades de mejorar las respuestas de Sarah

### 📅 Pestaña: Turnos

![Screenshot: Vista Lista y Calendario](placeholder-turnos.png)

**Vista Lista:**
- 📋 Todos los turnos confirmados, ordenados por fecha
- 🟢 Estado "Confirmado" / 🔴 Estado "Cancelado"
- 👁️ Información: paciente, teléfono, servicio, fecha/hora

**Vista Calendario:**
- 🗓️ Próximos 7 días en formato visual
- 🎯 Click en un día para ver turnos de esa fecha
- 🎨 Colores por tipo de tratamiento (configurable)

**Cómo gestionar turnos:**
- ✅ **Ver turnos del día:** Ir a Calendario → Seleccionar fecha de hoy
- ✅ **Buscar paciente:** Usar el buscador (próxima feature) o filtrar en Mensajes
- ✅ **Exportar lista:** Copiar y pegar en Excel (próxima feature: botón exportar)

### 👤 Pestaña: Owner Schedule (Gestión Manual)

![Screenshot: Formulario de agendamiento](placeholder-owner.png)

**Cuándo usar esta función:**
- 📞 Cuando un paciente llama por teléfono en lugar de WhatsApp
- 🏥 Para agendar turnos de emergencia fuera del horario de Sarah
- ✏️ Para corregir o ajustar turnos creados por error

**Pasos para agendar manualmente:**

1. **Número de teléfono**
   - Formato: `+5216651108583` (con código de país)
   - Importante: Usar el mismo formato que WhatsApp

2. **Nombre del paciente**
   - Nombre completo como aparece en documentos
   - Ej: "Alfredo Ornelas" (no "Alfredo O.")

3. **Fecha**
   - Click en el calendario o escribir: `YYYY-MM-DD`
   - 🚫 No se pueden agendar fechas pasadas

4. **Hora**
   - Dropdown con slots de 1 hora: `9:00`, `10:00`, `11:00`... `17:00`
   - ✅ Los horarios ocupados NO aparecen en la lista
   - ⏰ Último turno disponible: 17:00 (termina a 18:00)

5. **Tipo de tratamiento**
   - Seleccionar de la lista: Limpieza, Ortodoncia, Implantes, etc.

6. **Notas (opcional)**
   - Información adicional: "Paciente sensible", "Primera vez", etc.

7. **Click en "Agendar Turno"**
   - ✅ Mensaje de éxito: "Turno agendado para [nombre]"
   - 🔄 El turno aparece inmediatamente en Lista y Calendario

**Para cancelar un turno desde Owner Schedule:**
1. Ir a la pestaña "Turnos" → Vista Lista
2. Buscar el turno a cancelar
3. Click en el botón 🗑️ "Cancelar"
4. Confirmar la acción
5. ✅ El turno cambia a estado "Cancelado" (aparece en gris)

### ⚙️ Pestaña: Configuración

![Screenshot: Formulario de configuración](placeholder-config.png)

**Qué podés editar:**
- 🏥 Nombre de la clínica
- 📍 Dirección completa (para mostrar en WhatsApp)
- 📞 Teléfono de contacto
- 📧 Email de la clínica
- 🕘 Horarios de atención (ej: "Lunes a Viernes: 9:00 - 18:00")
- 🦷 Servicios disponibles (lista que Sarah muestra al agendar)
- 🔗 URL del webhook (solo para soporte técnico)

**Cómo actualizar:**
1. Modificar los campos que necesites cambiar
2. Click en "Guardar Cambios"
3. ✅ Confirmación: "Configuración actualizada exitosamente"
4. 🔄 Los cambios se reflejan inmediatamente en las respuestas de Sarah

> ⚠️ **Importante:** No modificar la "URL del Webhook" a menos que lo indique el equipo técnico.

---

## ⚠️ Notas Importantes y Límites del Sistema

### WhatsApp: Límite de Mensajes (Modo Testing)

⚠️ **Actualmente estamos usando Twilio Sandbox (modo gratuito)**

- 📊 **Límite:** ~100 mensajes por día
- 🔄 **Reset:** Cada 24 horas (aproximadamente a la misma hora)
- 👥 **Usuarios:** Solo números verificados pueden escribir primero

✅ **Qué significa para vos:**
- Los pacientes que ya escribieron antes pueden seguir conversando
- Nuevos pacientes deben enviar "join [palabra]" primero (solo en testing)
- Si Sarah no responde, esperar unas horas e intentar de nuevo

🚀 **En producción real (post-aprobación Meta):**
- Sin límite de mensajes (pagás por uso: ~$0.0075 por mensaje)
- Cualquier número de WhatsApp puede escribir directamente
- Sin necesidad de código "join"

### Horarios y Disponibilidad

- 🕘 **Horario de atención configurado:** Lunes a Viernes, 9:00 - 18:00
- ✅ Sarah solo agenda turnos dentro de este rango
- ✅ Los turnos son de 1 hora de duración
- ✅ Último turno que se puede agendar: 17:00 (termina a 18:00)
- ✅ No se pueden agendar turnos en el pasado ni en días no laborables

💡 **Tip:** Si un paciente pide un horario fuera de rango, Sarah sugiere alternativas cercanas.

### Privacidad y Datos

🔒 Los datos de los pacientes se guardan de forma segura en la base de datos
📁 **Backup:** Se recomienda hacer backup manual mensual (contactar a soporte)
🗑️ Cancelar un turno NO elimina los datos, solo cambia el estado a "cancelado"
📊 Los mensajes de WhatsApp se guardan para mejorar el servicio

✅ **Cumplimiento:** Este sistema está diseñado para cumplir con buenas prácticas de privacidad. Consultar con legal para requisitos específicos de tu región.

---

## 🛠️ Solución de Problemas Comunes

### Sarah no responde a un mensaje de WhatsApp

🔍 **Posibles causas:**
- Límite diario de Twilio Sandbox excedido (error 63038)
- El número del paciente no está verificado (solo en testing)
- Problema temporal de conexión

✅ **Qué hacer:**
- Esperar 5-10 minutos e intentar de nuevo
- Verificar en el Dashboard → Mensajes si el mensaje llegó
- Si persiste, contactar a soporte técnico

📋 **Para soporte:** Proporcionar
- Número del paciente (con código de país)
- Hora aproximada del mensaje
- Captura de pantalla del error (si hay)

### Turno no aparece en el Dashboard después de agendar

🔍 **Posibles causas:**
- El turno se agendó con estado "cancelado" por error
- Filtro aplicado en la vista Lista/Calendario
- Problema de caché del navegador

✅ **Qué hacer:**
- Refresh de página: Presionar F5 o Ctrl+R
- Verificar que no haya filtro activo en "Filtrar por usuario"
- Revisar en Owner Schedule si el turno está listado
- Si persiste, contactar a soporte

### Fecha o hora incorrecta en un turno

🔍 **Causa más común:**
- Diferencia de zona horaria entre el dispositivo del paciente y el servidor

✅ **Qué hacer:**
- Verificar la fecha/hora en el Dashboard (usa UTC consistente)
- Si el error es significativo, cancelar y reagendar el turno
- Reportar el caso a soporte para investigación

💡 **Prevención:** Sarah confirma siempre la fecha y hora antes de agendar:
"✅ Sí, está disponible el martes 2 de junio a las 10:00. ¿Confirmo el turno?"

### No se pueden agendar turnos en Owner Schedule

🔍 **Causas posibles:**
- Fecha seleccionada es pasada o hoy con hora ya transcurrida
- Horario fuera del rango 9:00-18:00
- Ese slot de hora ya está ocupado

✅ **Qué hacer:**
- Verificar que la fecha sea futura (mínimo hoy + 5 minutos)
- Seleccionar hora dentro del dropdown disponible
- Si el horario no aparece, significa que ya está ocupado → elegir otro

💡 **Tip:** Los slots disponibles se actualizan automáticamente cuando se crea/cancela un turno.

---

## 📞 Soporte Técnico

### Contacto

- 👤 **Responsable:** [Tu Nombre]
- 📧 **Email:** [tu-email@ejemplo.com]
- 💬 **WhatsApp:** [tu-número] (solo para urgencias técnicas)

### Cuándo contactar soporte

✅ El sistema no responde por más de 30 minutos
✅ Error persistente al agendar/cancelar turnos
✅ Necesitás cambiar configuración avanzada
✅ Querés reportar un bug o sugerir una mejora

❌ **No contactar para:**
- Preguntas sobre cómo usar el sistema (revisar este manual primero)
- Solicitar cambios en respuestas de Sarah (se pueden ajustar en Configuración)
- Consultas médicas o de agenda de pacientes (usar el sistema normal)

### Información útil para reportar un problema

📋 **Por favor incluir:**
- Descripción clara del problema
- Pasos para reproducirlo
- Hora aproximada del incidente
- Número de teléfono del paciente (si aplica)
- Capturas de pantalla (si es posible)
- Mensaje de error exacto (si aparece)

**Ejemplo de buen reporte:**
```
🔴 Problema: Sarah no respondió a paciente nuevo a las 14:30
📱 Número: +5216651108583
🗣️ Mensaje enviado: 'Hola, quiero agendar'
📸 Adjunto: Captura de WhatsApp
🔍 En Dashboard: El mensaje NO aparece en la lista de Mensajes
```

---

## 🔄 Actualizaciones y Nuevas Features

### Próximas Mejoras Planeadas

📅 Recordatorios automáticos (24h antes de la cita)
📊 Reportes mensuales de turnos y pacientes
🔐 Login con usuario/contraseña para el Dashboard
📤 Exportar lista de turnos a Excel/PDF
🌐 Soporte para múltiples clínicas (multi-tenant)
🗣️ Reconocimiento de voz para pacientes que prefieren audio

### Cómo enterarse de actualizaciones

- 📧 Newsletter técnico mensual (opcional)
- 🔔 Notificaciones en el Dashboard (próxima feature)
- 📝 Changelog en este manual (se actualizará con cada release)

---

## 📄 Anexo: Glosario de Términos

| Término | Significado |
|---------|-------------|
| **Sarah** | Asistente virtual con IA que atiende por WhatsApp |
| **Slot** | Espacio de tiempo de 1 hora para un turno (ej: 10:00-11:00) |
| **Webhook** | Conexión técnica que permite que WhatsApp se comunique con el sistema |
| **Twilio Sandbox** | Modo gratuito de testing de WhatsApp (con límites) |
| **Dashboard** | Panel administrativo web para gestionar turnos y ver mensajes |
| **Owner Schedule** | Función para que el personal agende turnos manualmente |
| **UTC** | Zona horaria universal usada para evitar errores de fecha/hora |

---

> 🦷 **Clínica Dental Sonrisa**
> *Tu sonrisa, nuestra prioridad*
>
> 📍 [Dirección de la clínica]
> 📞 [Teléfono]
> 🌐 [Sitio web]
>
> *Manual actualizado: 02/06/2026*
> *Versión: 1.0 - Producción Ready*
