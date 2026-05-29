import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { configuracionAPI } from '../lib/api';
import { Save, Copy, Check, X, Webhook, Settings, Building2, Mail, Phone, Clock, FileText } from 'lucide-react';

// URL del webhook
const WEBHOOK_URL = 'http://localhost:3001/api/webhook/whatsapp';

// Componente TabConfiguración
function TabConfiguracion() {
  const queryClient = useQueryClient();
  const [copiado, setCopiado] = useState(false);
  const [mensajeToast, setMensajeToast] = useState(null); // { tipo: 'exito'|'error', texto: string }
  const [formData, setFormData] = useState({
    nombre_clinica: '',
    direccion: '',
    telefono: '',
    email: '',
    horarios: '',
    servicios: '',
    sobre_clinica: ''
  });

  // Cargar configuración inicial
  const { data: config = {}, isLoading: cargandoConfig, error: errorConfig } = useQuery({
    queryKey: ['configuracion'],
    queryFn: configuracionAPI.obtener
  });

  // Actualizar formData cuando se carga la configuración
  useEffect(() => {
    if (config) {
      setFormData({
        nombre_clinica: config.nombre_clinica || '',
        direccion: config.direccion || '',
        telefono: config.telefono || '',
        email: config.email || '',
        horarios: config.horarios || '',
        servicios: Array.isArray(config.servicios)
          ? config.servicios.join('\n')
          : (config.servicios || ''),
        sobre_clinica: config.sobre_clinica || ''
      });
    }
  }, [config]);

  // Mutación para guardar configuración
  const mutation = useMutation({
    mutationFn: (data) => configuracionAPI.actualizar(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['configuracion']);
      mostrarToast('exito', 'Configuración guardada correctamente');
    },
    onError: (error) => {
      mostrarToast('error', `Error al guardar: ${error.message}`);
    }
  });

  // Copiar URL al portapapeles
  const copiarWebhook = async () => {
    try {
      await navigator.clipboard.writeText(WEBHOOK_URL);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch (err) {
      mostrarToast('error', 'No se pudo copiar al portapapeles');
    }
  };

  // Mostrar toast temporal
  const mostrarToast = (tipo, texto) => {
    setMensajeToast({ tipo, texto });
    setTimeout(() => setMensajeToast(null), 4000);
  };

  // Manejar cambio de inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Enviar formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    // Convertir servicios a array si es multilinea
    const datosEnviar = {
      ...formData,
      servicios: formData.servicios.split('\n').filter(s => s.trim())
    };
    mutation.mutate(datosEnviar);
  };

  // Estado de carga
  if (cargandoConfig) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando configuración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Configuración</h2>
        <p className="text-gray-600 mt-1">
          Configura tu clínica dental y la integración con Twilio
        </p>
      </div>

      {/* Toast de notificación */}
      {mensajeToast && (
        <div className={`
          fixed top-4 right-4 px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 animate-fade-in
          ${mensajeToast.tipo === 'exito'
            ? 'bg-green-500 text-white'
            : 'bg-red-500 text-white'
          }
        `}>
          {mensajeToast.tipo === 'exito' ? (
            <Check className="w-5 h-5" />
          ) : (
            <X className="w-5 h-5" />
          )}
          <span>{mensajeToast.texto}</span>
        </div>
      )}

      {/* Tarjeta de Webhook URL */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-blue-100 p-2 rounded-lg">
            <Webhook className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">URL del Webhook</h3>
            <p className="text-sm text-gray-600">
              Configura esta URL en tu cuenta de Twilio para recibir mensajes
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 font-mono text-sm text-gray-700 overflow-x-auto">
            {WEBHOOK_URL}
          </div>
          <button
            onClick={copiarWebhook}
            className={`
              px-4 py-3 rounded-lg font-medium transition flex items-center gap-2
              ${copiado
                ? 'bg-green-100 text-green-700'
                : 'bg-blue-600 text-white hover:bg-blue-700'
              }
            `}
          >
            {copiado ? (
              <>
                <Check className="w-5 h-5" />
                Copiado
              </>
            ) : (
              <>
                <Copy className="w-5 h-5" />
                Copiar
              </>
            )}
          </button>
        </div>

        {/* Instrucciones Twilio */}
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2">Instrucciones para Twilio:</h4>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>Ingresa a tu consola de Twilio</li>
            <li>Ve a Messaging → Try it out → Send a WhatsApp message</li>
            <li>Ingresa la URL del webhook en "When a message comes in"</li>
            <li>Selecciona "HTTP POST"</li>
            <li>Guarda los cambios</li>
          </ol>
        </div>
      </div>

      {/* Formulario de configuración */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-purple-100 p-2 rounded-lg">
            <Settings className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Datos de la Clínica</h3>
            <p className="text-sm text-gray-600">
              Actualiza la información que Sarah usará al responder
            </p>
          </div>
        </div>

        {errorConfig && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 font-medium">Error al cargar configuración</p>
            <p className="text-red-600 text-sm">{errorConfig.message}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nombre de la clínica */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre de la Clínica
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="nombre_clinica"
                value={formData.nombre_clinica}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ej: Clínica Dental Sonrisa"
              />
            </div>
          </div>

          {/* Dirección */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dirección
            </label>
            <input
              type="text"
              name="direccion"
              value={formData.direccion}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ej: Av. Corrientes 1234, CABA"
            />
          </div>

          {/* Teléfono y Email en grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ej: +54 11 1234-5678"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ej: contacto@clinicadental.com"
                />
              </div>
            </div>
          </div>

          {/* Horarios */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Horarios de Atención
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="horarios"
                value={formData.horarios}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ej: Lunes a Viernes 9:00-18:00"
              />
            </div>
          </div>

          {/* Servicios */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Servicios (uno por línea)
            </label>
            <textarea
              name="servicios"
              value={formData.servicios}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Limpieza dental&#10;Blanqueamiento&#10;Ortodoncia&#10;Implantes"
            />
          </div>

          {/* Sobre la clínica */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sobre la Clínica
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <textarea
                name="sobre_clinica"
                value={formData.sobre_clinica}
                onChange={handleChange}
                rows={3}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Breve descripción de la clínica..."
              />
            </div>
          </div>

          {/* Botón guardar */}
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                if (config) {
                  setFormData({
                    nombre_clinica: config.nombre_clinica || '',
                    direccion: config.direccion || '',
                    telefono: config.telefono || '',
                    email: config.email || '',
                    horarios: config.horarios || '',
                    servicios: Array.isArray(config.servicios)
                      ? config.servicios.join('\n')
                      : (config.servicios || ''),
                    sobre_clinica: config.sobre_clinica || ''
                  });
                }
              }}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              disabled={mutation.isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={mutation.isLoading}
              className={`
                px-6 py-3 rounded-lg font-medium transition flex items-center gap-2
                ${mutation.isLoading
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
                }
              `}
            >
              {mutation.isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Guardar Cambios
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TabConfiguracion;