import { useQuery } from '@tanstack/react-query';
import { mensajesAPI } from '../lib/api';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Smartphone, Bot, Clock, User } from 'lucide-react';

// Formatear fecha en español
const formatearFecha = (fechaStr) => {
  try {
    return format(new Date(fechaStr), 'dd/MM/yyyy HH:mm:ss', { locale: es });
  } catch {
    return fechaStr;
  }
};

// Determinar color de badge según el remitente
const obtenerEstiloRemitente = (remitente) => {
  switch (remitente) {
    case 'usuario':
      return {
        container: 'bg-gray-100 border-l-4 border-gray-400',
        badge: 'bg-gray-200 text-gray-800',
        icon: <Smartphone className="w-5 h-5 text-gray-600" />,
        align: 'text-left'
      };
    case 'asistente':
      return {
        container: 'bg-blue-50 border-l-4 border-blue-500',
        badge: 'bg-blue-500 text-white',
        icon: <Bot className="w-5 h-5 text-blue-600" />,
        align: 'text-right'
      };
    default:
      return {
        container: 'bg-gray-50',
        badge: 'bg-gray-300 text-gray-700',
        icon: <User className="w-5 h-5 text-gray-500" />,
        align: 'text-left'
      };
  }
};

// Componente TabMensajes - Lista de mensajes WhatsApp con polling
function TabMensajes() {
  // Query con polling cada 5 segundos para mantener actualizado
  const { data: mensajes = [], isLoading, error, refetch } = useQuery({
    queryKey: ['mensajes'],
    queryFn: mensajesAPI.obtenerTodos,
    refetchInterval: 5000, // Polling cada 5 segundos
    refetchIntervalInBackground: true
  });

  // Estado de carga
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando mensajes...</p>
        </div>
      </div>
    );
  }

  // Error de carga
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-800 font-medium mb-2">Error al cargar mensajes</p>
        <p className="text-red-600 text-sm mb-4">{error.message}</p>
        <button
          onClick={() => refetch()}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
        >
          Reintentar
        </button>
      </div>
    );
  }

  // Lista vacía
  if (mensajes.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-12 text-center">
        <Bot className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No hay mensajes aún</h3>
        <p className="text-gray-500">
          Los mensajes de WhatsApp aparecerán aquí cuando los pacientes escriban a Sarah.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con info */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Mensajes</h2>
          <p className="text-gray-600 mt-1">
            {mensajes.length} mensaje{mensajes.length !== 1 ? 's' : ''} • Actualizado automáticamente cada 5s
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
        >
          Actualizar ahora
        </button>
      </div>

      {/* Lista scrolleable de mensajes */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="max-h-[600px] overflow-y-auto">
          <div className="divide-y divide-gray-100">
            {mensajes.map((mensaje) => {
              const estilo = obtenerEstiloRemitente(mensaje.remitente);
              const nombreRemitente = mensaje.remitente === 'usuario' ? 'Usuario' : 'Sarah';

              return (
                <div
                  key={mensaje.id}
                  className={`p-4 hover:bg-gray-50 transition-colors ${estilo.container}`}
                >
                  <div className="flex items-start gap-3">
                    {/* Icono de remitente */}
                    <div className="flex-shrink-0 mt-1">
                      {estilo.icon}
                    </div>

                    {/* Contenido del mensaje */}
                    <div className={`flex-1 ${estilo.align}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${estilo.badge}`}>
                          {nombreRemitente}
                        </span>
                        <span className="text-gray-500 text-sm">
                          {mensaje.numero_telefono}
                        </span>
                      </div>

                      {/* Timestamp */}
                      <div className="flex items-center gap-1 text-gray-400 text-xs mb-2">
                        <Clock className="w-3 h-3" />
                        <span>{formatearFecha(mensaje.recibido_en)}</span>
                      </div>

                      {/* Contenido */}
                      <p className="text-gray-800 leading-relaxed">
                        {mensaje.contenido_mensaje}
                      </p>

                      {/* Tipo de mensaje */}
                      {mensaje.tipo_mensaje && mensaje.tipo_mensaje !== 'texto' && (
                        <span className="inline-block mt-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          📎 {mensaje.tipo_mensaje}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TabMensajes;