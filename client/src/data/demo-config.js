/**
 * 🔧 CONFIGURACIÓN DE DEMO - CLÍNICA DENTAL BOT
 *
 * Este archivo contiene TODA la configuración personalizable de la demo.
 * Para personalizar para un cliente, solo edita los valores en este archivo.
 *
 * ⚠️ INSTRUCCIONES:
 * 1. Editar los valores según la clínica del cliente
 * 2. No modificar las claves (solo los valores)
 * 3. Guardar y hacer git push
 * 4. La demo se actualiza automáticamente en Railway
 */

export const demoConfig = {
  // ==========================================
  // 🏥 DATOS DE LA CLÍNICA
  // ==========================================
  clinica: {
    nombre: "Dr. Baltierres",
    slogan: "Tu atencion y seguridad es nuestra prioridad",
    telefono: "+54 9 11 1234-5678",
    email: "contacto@clinicasonrisa.com",
    direccion: "Av. Corrientes 1234, CABA",
    whatsapp: "5491112345678", // Sin el + ni espacios
    instagram: "@clinicasonrisa",
    website: "https://clinicasonrisa.com.ar"
  },

  // ==========================================
  // 🕐 HORARIOS Y SERVICIOS
  // ==========================================
  operacion: {
    horarios: "Lunes a Viernes: 9:00 - 18:00\nSábados: 9:00 - 14:00",
    servicios: [
      { nombre: "Limpieza Dental", precio: "$3,500", duracion: "45 min" },
      { nombre: "Ortodoncia", precio: "$15,000", duracion: "60 min" },
      { nombre: "Blanqueamiento", precio: "$8,000", duracion: "90 min" },
      { nombre: "Implantes", precio: "$25,000", duracion: "120 min" },
      { nombre: "Endodoncia", precio: "$12,000", duracion: "90 min" },
      { nombre: "Extracción", precio: "$5,000", duracion: "60 min" }
    ]
  },

  // ==========================================
  // 🤖 CONFIGURACIÓN DE SARAH (IA)
  // ==========================================
  sarah: {
    nombre: "Sarah",
    descripcion: "Recepcionista virtual con IA",
    características: [
      "Disponible 24/7",
      "Responde en segundos",
      "Agenda automáticamente",
      "Recuerda cada paciente",
      "Habla español rioplatense"
    ]
  },

  // ==========================================
  // 📱 CONFIGURACIÓN DE WHATSAPP
  // ==========================================
  whatsapp: {
    numerosDemo: [
      "+54 9 11 1234-5678",  // Paciente 1
      "+54 9 22 3456-7890",  // Paciente 2
      "+54 9 33 4567-8901",  // Paciente 3
      "+54 9 44 5678-9012"   // Paciente 4
    ]
  },

  // ==========================================
  // 📊 ESTADÍSTICAS Y MÉTRICAS
  // ==========================================
  metrics: {
    mensajesPorMes: "2,500+",
    turnosAgendados: "180+",
    tiempoRespuesta: "< 10 segundos",
    satisfaccion: "98%"
  },

  // ==========================================
  // 🎨 CONFIGURACIÓN VISUAL
  // ==========================================
  tema: {
    primario: "#3B82F6",      // Azul
    secundario: "#10B981",    // Verde
    acento: "#F59E0B",       // Naranja
    fondo: "#F9FAFB",        // Gris claro
    texto: "#1F2937"         // Gris oscuro
  },

  // ==========================================
  // 🎬 CONFIGURACIÓN DE LA DEMO
  // ==========================================
  demo: {
    duracionMensajes: 2000, // ms entre mensajes
    mostrarContacto: true,   // Mostrar botón de contacto
    mostrarCalendario: true, // Mostrar mini calendario
    mostrarTestimonios: true // Mostrar testimonials
  },

  // ==========================================
  // 💬 MENSAJES PREDEFINIDOS (SIMULADOR)
  // ==========================================
  conversacionDemo: [
    {
      remitente: "paciente",
      mensaje: "Hola, quiero agendar una cita",
      delay: 500
    },
    {
      remitente: "sarah",
      mensaje: "¡Hola! 👋 Soy Sarah, recepcionista de la Clínica Dental Sonrisa.\n\n¿En qué puedo ayudarte hoy?\n\n1️⃣ Agendar una nueva cita\n2️⃣ Reagendar una cita existente\n3️⃣ Cancelar una cita\n4️⃣ Ver ubicación\n5️⃣ Horarios de atención\n6️⃣ Servicios disponibles\n👉 Podés responder con el número o contarme directamente qué necesitás. 😊",
      delay: 1500
    },
    {
      remitente: "paciente",
      mensaje: "1",
      delay: 1000
    },
    {
      remitente: "sarah",
      mensaje: "¡Perfecto! Para poder agendar tu cita, ¿cuál es tu nombre completo? 😊",
      delay: 1200
    },
    {
      remitente: "paciente",
      mensaje: "María González",
      delay: 1000
    },
    {
      remitente: "sarah",
      mensaje: "Gracias, María. 😊\n\nAhora, ¿qué tipo de tratamiento necesitás?\n\nNuestros servicios son:\n• Limpieza Dental\n• Ortodoncia\n• Blanqueamiento\n• Implantes\n• Extracción de Muelas\n\n👉 Respondé con el nombre del servicio o elegí uno de la lista.",
      delay: 2000
    },
    {
      remitente: "paciente",
      mensaje: "Limpieza Dental",
      delay: 1200
    },
    {
      remitente: "sarah",
      mensaje: "¿Qué día y hora te vendría mejor? (Ej: 'mañana a las 3pm', 'sábado 10 de junio')\n\n🕘 Atendemos de Lunes a Viernes: 9:00 - 18:00\n⚠️ IMPORTANTE: Solo podemos agendar turnos para fechas y horarios FUTUROS.",
      delay: 1800
    },
    {
      remitente: "paciente",
      mensaje: "Mañana a las 10am",
      delay: 1000
    },
    {
      remitente: "sarah",
      mensaje: "✅ Sí, está disponible mañana a las 10:00 para tu limpieza dental. ¿Confirmo el turno? 😊",
      delay: 1500
    },
    {
      remitente: "paciente",
      mensaje: "Sí, confirmo",
      delay: 800
    },
    {
      remitente: "sarah",
      mensaje: "¡Listo, María! Tu turno para limpieza dental está agendado exitosamente para mañana a las 10:00. 🎉\n\n📍 Nos encontramos en: Av. Corrientes 1234, CABA\n📞 Si necesitás algo más, no dudes en consultarme.\n\n¡Te esperamos en la Clínica Dental Sonrisa! 😊✨",
      delay: 2000
    }
  ],

  // ==========================================
  // ⭐ TESTIMONIOS
  // ==========================================
  testimonios: [
    {
      nombre: "Dr. Carlos Méndez",
      rol: "Odontólogo - Dueño",
      texto: "Desde que implementamos Sarah, nuestras consultas se redujeron un 60%. Los pacientes pueden agendar cuando quieran, incluso fuera de horario laboral.",
      calificacion: 5
    },
    {
      nombre: "Lucía Fernández",
      rol: "Pacienta",
      texto: "¡Es increíble! Agendé mi cita a las 2am cuando no podía dormir. A la mañana siguiente ya estaba todo confirmado.",
      calificacion: 5
    },
    {
      nombre: "Roberto Sánchez",
      rol: "Administrativo",
      texto: "El Dashboard es super fácil de usar. En 5 minutos agendo 3 turnos por teléfono y puedo ver todo en un solo lugar.",
      calificacion: 5
    }
  ],

  // ==========================================
  // 🏆 LOGROS Y CERTIFICACIONES
  // ==========================================
  logros: [
    "🥇 Más de 180 turnos agendados en el primer mes",
    "⭐ 98% de satisfacción de pacientes",
    "🏆 Mejor implementación tecnológica 2026",
    "📈 300% de aumento en agendamientos"
  ]
};
