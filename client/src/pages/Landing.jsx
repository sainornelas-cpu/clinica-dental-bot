import { Link } from 'react-router-dom';
import { MessageCircle, Calendar, Bot, ArrowRight } from 'lucide-react';

// Página Landing - Punto de entrada de la aplicación
function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-blue-900">🦷 Clínica Dental Sonrisa</h1>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <section className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-blue-900 mb-6 leading-tight">
            Tu Clínica Dental,<br />
            Siempre Disponible
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Atención inteligente vía WhatsApp las 24 horas. Agendá tus turnos
            con Sarah, nuestra recepcionista virtual amigable y eficiente.
          </p>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg"
          >
            Ir al Dashboard
            <ArrowRight className="w-5 h-5" />
          </Link>
        </section>

        {/* Features Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* Feature 1: 24/7 */}
          <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
              <MessageCircle className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-blue-900">Disponible 24/7</h3>
            <p className="text-gray-600 leading-relaxed">
              Atención por WhatsApp a cualquier hora del día, todos los días del año.
            </p>
          </div>

          {/* Feature 2: Turnos Automáticos */}
          <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className="bg-teal-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
              <Calendar className="w-8 h-8 text-teal-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-blue-900">Turnos Automáticos</h3>
            <p className="text-gray-600 leading-relaxed">
              Agendá, cancelá o reprogramá tus turnos sin necesidad de llamar.
            </p>
          </div>

          {/* Feature 3: IA Inteligente */}
          <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className="bg-cyan-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
              <Bot className="w-8 h-8 text-cyan-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-blue-900">IA Inteligente</h3>
            <p className="text-gray-600 leading-relaxed">
              Respuestas instantáneas y personalizadas con Sarah, nuestra asistente virtual.
            </p>
          </div>
        </section>

        {/* How it Works Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center text-blue-900 mb-12">¿Cómo Funciona?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="text-lg font-semibold mb-2 text-blue-900">Envíale un mensaje</h3>
              <p className="text-gray-600">
                Escribí al número de WhatsApp de la clínica con tu consulta.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="text-lg font-semibold mb-2 text-blue-900">Sarah responde</h3>
              <p className="text-gray-600">
                Nuestra IA entiende tu mensaje y te ayuda en segundos.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="text-lg font-semibold mb-2 text-blue-900">¡Turno confirmado!</h3>
              <p className="text-gray-600">
                Recibí confirmación y recordatorios automáticos.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-blue-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-lg mb-2">© 2026 Clínica Dental Sonrisa</p>
          <p className="text-blue-200">Todos los derechos reservados • Buenos Aires, Argentina</p>
        </div>
      </footer>
    </div>
  );
}

export default Landing;