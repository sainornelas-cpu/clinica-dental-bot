import { useState, useEffect } from 'react';
import { demoConfig } from '../data/demo-config';
import {
  MessageCircle,
  Calendar,
  Clock,
  CheckCircle,
  Users,
  BarChart,
  Zap,
  Star,
  Award,
  Phone,
  Mail,
  MapPin,
  Instagram,
  ChevronRight,
  Sparkles,
  Heart,
  Send
} from 'lucide-react';

/**
 * 🎯 PÁGINA DE DEMO - CLÍNICA DENTAL BOT
 *
 * Landing page interactiva para demostrar el sistema a clientes potenciales.
 * Incluye simulador visual de WhatsApp con mensajes predefinidos.
 *
 * 📝 CONFIGURACIÓN: Editar client/src/data/demo-config.js
 */
function Demo() {
  const [activeSection, setActiveSection] = useState('inicio');
  const [currentMensaje, setCurrentMensaje] = useState(0);
  const [mostrarSimulador, setMostrarSimulador] = useState(false);
  const [simulacionActiva, setSimulacionActiva] = useState(false);
  const [conversacion, setConversacion] = useState([]);

  // ==========================================
  // SCROLL TO SECTION
  // ==========================================
  const scrollToSection = (id) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // ==========================================
  // SIMULADOR DE WHATSAPP
  // ==========================================
  const iniciarSimulacion = () => {
    setMostrarSimulador(true);
    setSimulacionActiva(true);
    setCurrentMensaje(0);

    const mensajes = [...demoConfig.conversacionDemo];
    let mensajeIndex = 0;

    const mostrarSiguienteMensaje = () => {
      if (mensajeIndex < mensajes.length) {
        const msg = mensajes[mensajeIndex];

        setTimeout(() => {
          setConversacion(prev => [...prev, { ...msg, mostrado: true }]);

          if (mensajeIndex < mensajes.length - 1) {
            mensajeIndex++;
            setCurrentMensaje(mensajeIndex);
            mostrarSiguienteMensaje();
          } else {
            setSimulacionActiva(false);
          }
        }, msg.delay);
      }
    };

    mostrarSiguienteMensaje();
  };

  const reiniciarSimulacion = () => {
    setConversacion([]);
    setCurrentMensaje(0);
    setSimulacionActiva(false);
    setTimeout(() => iniciarSimulacion(), 500);
  };

  // ==========================================
  // ICONS VISUALES
  // ==========================================
  const whatsappPhone = demoConfig.clinica.whatsapp;
  const whatsappLink = `https://wa.me/${whatsappPhone}`;

  // ==========================================
  // RETURN - COMPONENTE PRINCIPAL
  // ==========================================
  return (
    <div className="min-h-screen bg-white">
      {/* ==========================================
          NAVBAR
      ========================================== */}
      <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">🦷</span>
              </div>
              <span className="font-bold text-gray-800 text-lg">{demoConfig.clinica.nombre}</span>
            </div>

            {/* Links Desktop */}
            <div className="hidden md:flex items-center gap-8">
              <button
                onClick={() => scrollToSection('inicio')}
                className={`text-sm font-medium transition ${
                  activeSection === 'inicio' ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                Inicio
              </button>
              <button
                onClick={() => scrollToSection('caracteristicas')}
                className={`text-sm font-medium transition ${
                  activeSection === 'caracteristicas' ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                Características
              </button>
              <button
                onClick={() => scrollToSection('simulador')}
                className={`text-sm font-medium transition ${
                  activeSection === 'simulador' ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                Demo en Vivo
              </button>
              <button
                onClick={() => scrollToSection('testimonios')}
                className={`text-sm font-medium transition ${
                  activeSection === 'testimonios' ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                Testimonios
              </button>
            </div>

            {/* CTA Button */}
            <div className="flex items-center gap-3">
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition font-medium"
              >
                <MessageCircle className="w-4 h-4" />
                Agendar Ahora
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* ==========================================
          HERO SECTION
      ========================================== */}
      <section id="inicio" className="pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Contenido */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                <span>Nuevo sistema con IA</span>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                {demoConfig.clinica.nombre}
                <span className="block text-2xl md:text-3xl text-gray-600 mt-2">
                  {demoConfig.clinica.slogan}
                </span>
              </h1>

              <p className="text-lg text-gray-600">
                Tu recepcionista virtual con IA disponible 24/7. Agenda citas, responde preguntas
                y gestiona tu clínica dental automáticamente por WhatsApp.
              </p>

              {/* Features rápidas */}
              <div className="grid grid-cols-2 gap-4">
                {demoConfig.sarah.características.slice(0, 4).map((caracteristica, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span>{caracteristica}</span>
                  </div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => scrollToSection('simulador')}
                  className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium shadow-lg shadow-blue-500/30"
                >
                  <MessageCircle className="w-5 h-5" />
                  Probar Demo
                </button>
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition font-medium shadow-lg shadow-green-500/30"
                >
                  Agendar Ahora
                </a>
              </div>

              {/* Métricas */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{demoConfig.metrics.mensajesPorMes}</div>
                  <div className="text-sm text-gray-500">Mensajes/mes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{demoConfig.metrics.turnosAgendados}</div>
                  <div className="text-sm text-gray-500">Turnos/mes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{demoConfig.metrics.tiempoRespuesta}</div>
                  <div className="text-sm text-gray-500">Tiempo respuesta</div>
                </div>
              </div>
            </div>

            {/* Visual/Illustration */}
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-3xl p-8 shadow-2xl">
                {/* Mockup de teléfono */}
                <div className="bg-gray-900 rounded-[2.5rem] p-3 shadow-2xl max-w-xs mx-auto">
                  {/* Screen del teléfono */}
                  <div className="bg-gray-100 rounded-[2rem] overflow-hidden">
                    {/* Header de WhatsApp */}
                    <div className="bg-green-500 p-3 flex items-center gap-2">
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                        <span className="text-white text-lg">🦷</span>
                      </div>
                      <div className="text-white text-sm font-medium">Sarah - IA</div>
                    </div>

                    {/* Mensaje de ejemplo */}
                    <div className="p-4 space-y-3">
                      {/* Mensaje paciente */}
                      <div className="bg-green-100 rounded-lg p-3 text-sm">
                        <div className="font-medium text-gray-800 mb-1">👤 Paciente</div>
                        <p className="text-gray-700">Hola, quiero agendar una cita 😊</p>
                      </div>

                      {/* Mensaje Sarah */}
                      <div className="bg-white rounded-lg p-3 text-sm ml-8">
                        <div className="font-medium text-gray-800 mb-1">🤖 Sarah</div>
                        <p className="text-gray-700">¡Hola! 👋 Soy Sarah, recepcionista virtual...</p>
                      </div>

                      {/* Typing indicator */}
                      <div className="ml-8 flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Badge flotante */}
                <div className="absolute -bottom-4 -right-4 bg-white rounded-full shadow-lg p-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-green-500" />
                    <div>
                      <div className="text-xs text-gray-500">Respuesta</div>
                      <div className="text-sm font-bold text-gray-900">{demoConfig.metrics.tiempoRespuesta}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================
          CARACTERÍSTICAS
          ========================================== */}
      <section id="caracteristicas" className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Características del Sistema
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Todo lo que necesitás para automatizar tu recepción dental
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Card 1: WhatsApp */}
            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <MessageCircle className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                WhatsApp Integrado
              </h3>
              <p className="text-gray-600">
                Los pacientes agendan por WhatsApp como lo harían naturalmente.
                Sin descargar apps, sin formularios complicados.
              </p>
            </div>

            {/* Card 2: IA */}
            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Inteligencia Artificial
              </h3>
              <p className="text-gray-600">
                {demoConfig.sarah.nombre} entiende lenguaje natural, horarios en español
                y confirma cada turno antes de agendar.
              </p>
            </div>

            {/* Card 3: Dashboard */}
            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <BarChart className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Dashboard Administrativo
              </h3>
              <p className="text-gray-600">
                Gestioná turnos, vea conversaciones y configurá la clínica
                desde un panel web fácil de usar.
              </p>
            </div>

            {/* Card 4: 24/7 */}
            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Disponible 24/7
              </h3>
              <p className="text-gray-600">
                {demoConfig.sarah.nombre} nunca duerme. Los pacientes pueden agendar
                a cualquier hora, incluso fuera de horario de atención.
              </p>
            </div>

            {/* Card 5: Multi-servicio */}
            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Todos los Servicios
              </h3>
              <p className="text-gray-600">
                Agenda cualquier tratamiento: limpieza, ortodoncia, implantes,
                blanqueamiento y más.
              </p>
            </div>

            {/* Card 6: Sin cambios */}
            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-pink-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Recordatorio Automático
              </h3>
              <p className="text-gray-600">
                {demoConfig.sarah.nombre} recuerda el nombre y contexto de cada paciente
                para una experiencia personalizada.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================
          SIMULADOR EN VIVO
          ========================================== */}
      <section id="simulador" className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              📱 Demo en Vivo
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Ve cómo {demoConfig.sarah.nombre} atiende a un paciente en tiempo real
            </p>
          </div>

          {/* Simulador de WhatsApp */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-100 rounded-3xl p-4 md:p-8 shadow-xl">
              {/* Header del simulador */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Simulador de WhatsApp</div>
                    <div className="text-sm text-gray-500">Conversación en tiempo real</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {!simulacionActiva && conversacion.length === 0 && (
                    <button
                      onClick={iniciarSimulacion}
                      className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
                    >
                      <Zap className="w-4 h-4" />
                      Iniciar Demo
                    </button>
                  )}
                  {conversacion.length > 0 && !simulacionActiva && (
                    <button
                      onClick={reiniciarSimulacion}
                      className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition font-medium"
                    >
                      <Zap className="w-4 h-4" />
                      Repetir
                    </button>
                  )}
                </div>
              </div>

              {/* Área de conversación */}
              <div className="bg-white rounded-2xl p-6 min-h-[400px] max-h-[500px] overflow-y-auto space-y-3">
                {conversacion.length === 0 && !simulacionActiva ? (
                  <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                    <MessageCircle className="w-16 h-16 mb-4 opacity-50" />
                    <p className="text-center">Click en "Iniciar Demo" para ver cómo funciona</p>
                  </div>
                ) : (
                  conversacion.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex ${
                        msg.remitente === 'paciente' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl p-4 ${
                          msg.remitente === 'paciente'
                            ? 'bg-green-100 text-gray-800'
                            : 'bg-white text-gray-800 shadow-sm'
                        }`}
                      >
                        {msg.remitente === 'sarah' && (
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs">🦷</span>
                            </div>
                            <span className="text-sm font-medium text-blue-600">{demoConfig.sarah.nombre}</span>
                          </div>
                        )}
                        <p className="text-sm whitespace-pre-line">{msg.mensaje}</p>
                        {msg.remitente === 'sarah' && index < conversacion.length - 1 && (
                          <div className="mt-2 flex gap-1">
                            <span className="bg-gray-100 rounded px-2 py-1 text-xs">1</span>
                            <span className="bg-gray-100 rounded px-2 py-1 text-xs">2</span>
                            <span className="bg-gray-100 rounded px-2 py-1 text-xs">3</span>
                            <span className="bg-gray-100 rounded px-2 py-1 text-xs">4</span>
                            <span className="bg-gray-100 rounded px-2 py-1 text-xs">5</span>
                            <span className="bg-gray-100 rounded px-2 py-1 text-xs">6</span>
                            <span className="bg-gray-100 rounded px-2 py-1 text-xs">7</span>
                            <span className="bg-gray-100 rounded px-2 py-1 text-xs">8</span>
                          </div>
                        )}
                        <div className="text-xs text-gray-500 mt-1">
                          {msg.remitente === 'paciente' ? '👤 Paciente' : '🤖 Sarah'}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer del simulador */}
              <div className="mt-4 text-center text-sm text-gray-500">
                💡 Tip: Esta es una demo pregrabada. En producción, {demoConfig.sarah.nombre} responde
                a cada mensaje en tiempo real.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================
          SERVICIOS Y PRECIOS
          ========================================== */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Servicios y Precios
            </h2>
            <p className="text-lg text-gray-600">
              Transparencia total para tus pacientes
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {demoConfig.operacion.servicios.map((servicio, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-lg text-gray-900">{servicio.nombre}</h3>
                  <div className="text-2xl">🦷</div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Precio:</span>
                    <span className="font-semibold text-gray-900">{servicio.precio}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Duración:</span>
                    <span className="text-gray-700">{servicio.duracion}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 bg-blue-50 rounded-xl p-8 text-center">
            <p className="text-gray-700 mb-4">
              🕘 <strong>Horarios de atención:</strong> {demoConfig.operacion.horarios}
            </p>
            <p className="text-sm text-gray-500">
              Los turnos son de 1 hora de duración. El último turno disponible es a las 17:00.
            </p>
          </div>
        </div>
      </section>

      {/* ==========================================
          TESTIMONIOS
          ========================================== */}
      {demoConfig.demo.mostrarTestimonios && (
        <section id="testimonios" className="py-16 px-4 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Lo que dicen nuestros clientes
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {demoConfig.testimonios.map((testimonio, index) => (
                <div key={index} className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonio.calificacion)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400" style={{ fill: 'currentColor' }} />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4 italic">"{testimonio.text}"</p>
                  <div className="border-t pt-4">
                    <div className="font-semibold text-gray-900">{testimonio.nombre}</div>
                    <div className="text-sm text-gray-500">{testimonio.rol}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ==========================================
          LOGROS
      ========================================== */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Resultados Comprobados
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {demoConfig.logros.map((logro, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-blue-500">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{logro[0]}</div>
                  <p className="text-gray-700 font-medium">{logro.substring(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==========================================
          CONTACTO
      ========================================== */}
      <section className="py-16 px-4 bg-gradient-to-br from-blue-600 to-green-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">
            ¿Listo para transformar tu clínica?
          </h2>

          <p className="text-xl mb-8 text-blue-50">
            Comienza hoy mismo. Prueba gratis, sin compromiso.
          </p>

          <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto mb-8">
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 bg-white text-gray-900 px-6 py-4 rounded-lg hover:bg-gray-50 transition font-medium shadow-lg"
            >
              <MessageCircle className="w-5 h-5" />
              Agendar Demo
            </a>

            <a
              href="mailto:demo@clinicadentalbot.com"
              className="flex items-center justify-center gap-3 bg-transparent border-2 border-white text-white px-6 py-4 rounded-lg hover:bg-white/10 transition font-medium"
            >
              <Mail className="w-5 h-5" />
              Contactar
            </a>
          </div>

          {/* Contacto rápido */}
          <div className="grid md:grid-cols-3 gap-6 text-left max-w-3xl mx-auto">
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5" />
              <span>{demoConfig.clinica.telefono}</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5" />
              <span>{demoConfig.clinica.email}</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5" />
              <span>{demoConfig.clinica.direccion}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================
          FOOTER
      ========================================== */}
      <footer className="bg-gray-900 text-white py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">🦷</span>
              </div>
              <span className="font-medium">{demoConfig.clinica.nombre}</span>
            </div>

            <div className="text-sm text-gray-400">
              © 2026 {demoConfig.clinica.nombre}. Todos los derechos reservados.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Demo;
