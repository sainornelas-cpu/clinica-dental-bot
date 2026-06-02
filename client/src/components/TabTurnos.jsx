import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { turnosAPI } from '../lib/api';
import { format, isToday, isPast, parseISO, startOfDay, addDays, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, List, CheckCircle, Clock, XCircle, CircleDot } from 'lucide-react';

// Formatear fecha y hora en español
const formatearFechaHora = (fechaStr) => {
  try {
    const fecha = new Date(fechaStr);
    // 🔍 DIAGNÓSTICO: Verificar año de la fecha
    if (fecha.getFullYear() < 2024) {
      console.warn(`⚠️ [Fecha] Turno con año antiguo: ${fechaStr} → ${fecha.getFullYear()}`);
    }
    return format(fecha, 'EEEE dd/MM/yyyy - HH:mm', { locale: es });
  } catch {
    return fechaStr;
  }
};

const formatearFechaCorta = (fechaStr) => {
  try {
    return format(new Date(fechaStr), 'dd/MM', { locale: es });
  } catch {
    return fechaStr;
  }
};

// Obtener color de badge según el estado
const obtenerEstiloEstado = (estado) => {
  switch (estado) {
    case 'confirmado':
      return {
        bg: 'bg-green-100',
        text: 'text-green-800',
        border: 'border-green-200',
        icon: <CheckCircle className="w-4 h-4" />,
        emoji: '🟢'
      };
    case 'pendiente':
      return {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        border: 'border-yellow-200',
        icon: <Clock className="w-4 h-4" />,
        emoji: '🟡'
      };
    case 'cancelado':
      return {
        bg: 'bg-red-100',
        text: 'text-red-800',
        border: 'border-red-200',
        icon: <XCircle className="w-4 h-4" />,
        emoji: '🔴'
      };
    case 'completado':
      return {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        border: 'border-blue-200',
        icon: <CircleDot className="w-4 h-4" />,
        emoji: '🔵'
      };
    default:
      return {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        border: 'border-gray-200',
        icon: null,
        emoji: '⚪'
      };
  }
};

// Componente para vista de calendario simple (7 días)
function VistaCalendario({ turnos, fechaSeleccionada, setFechaSeleccionada }) {
  // Generar próximos 7 días
  const dias = Array.from({ length: 7 }, (_, i) => {
    const fecha = addDays(startOfDay(new Date()), i);
    return {
      fecha,
      fechaStr: format(fecha, 'yyyy-MM-dd'),
      esHoy: isToday(fecha),
      esPasado: isPast(fecha)
    };
  });

  // Obtener turnos de la fecha seleccionada
  const turnosDelDia = turnos.filter(
    t => t.fecha_turno.startsWith(fechaSeleccionada)
  );

  // 🔍 DEBUG LOGS
  console.log('📅 [DEBUG] Turnos recibidos:', turnos);
  console.log('📅 [DEBUG] Fecha seleccionada:', fechaSeleccionada);
  console.log('📅 [DEBUG] Turnos del día:', turnosDelDia);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendario */}
      <div className="lg:col-span-1">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Próximos 7 días
        </h3>
        <div className="grid grid-cols-1 gap-2">
          {dias.map((dia) => {
            const turnosEsteDia = turnos.filter(
              t => t.fecha_turno.startsWith(dia.fechaStr)
            );
            const tieneTurnos = turnosEsteDia.length > 0;
            const isSelected = fechaSeleccionada === dia.fechaStr;

            return (
              <button
                key={dia.fechaStr}
                onClick={() => setFechaSeleccionada(dia.fechaStr)}
                className={`
                  p-4 rounded-lg border-2 transition-all text-left
                  ${isSelected
                    ? 'border-blue-500 bg-blue-50'
                    : tieneTurnos
                      ? 'border-teal-200 bg-teal-50 hover:border-teal-400'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }
                  ${dia.esPasado && !dia.esHoy ? 'opacity-50' : ''}
                `}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-800">
                      {dia.esHoy ? 'Hoy' : format(dia.fecha, 'EEEE', { locale: es })}
                    </div>
                    <div className="text-sm text-gray-600">
                      {formatearFechaCorta(dia.fecha)}
                    </div>
                  </div>
                  {tieneTurnos && (
                    <span className={`text-xs font-medium ${isSelected ? 'text-blue-600' : 'text-teal-600'}`}>
                      {turnosEsteDia.length}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Panel lateral con turnos del día */}
      <div className="lg:col-span-2">
        <h3 className="font-semibold text-gray-800 mb-4">
          Turnos del {format(parseISO(fechaSeleccionada), 'EEEE dd/MM/yyyy', { locale: es })}
        </h3>

        {turnosDelDia.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600">No hay turnos agendados para este día</p>
          </div>
        ) : (
          <div className="space-y-3">
            {turnosDelDia
              .sort((a, b) => new Date(a.fecha_turno) - new Date(b.fecha_turno))
              .map((turno) => {
                const estilo = obtenerEstiloEstado(turno.estado);
                const hora = format(new Date(turno.fecha_turno), 'HH:mm', { locale: es });

                return (
                  <div
                    key={turno.id}
                    className={`bg-white rounded-lg p-4 border ${estilo.border} hover:shadow-md transition-shadow`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl font-bold text-gray-800">{hora}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${estilo.bg} ${estilo.text}`}>
                            {estilo.emoji} {turno.estado.charAt(0).toUpperCase() + turno.estado.slice(1)}
                          </span>
                        </div>
                        <h4 className="font-medium text-gray-800">{turno.nombre_paciente}</h4>
                        <p className="text-sm text-gray-600">
                          📱 {turno.numero_telefono}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          🦷 {turno.tipo_turno}
                        </p>
                        {turno.notas && (
                          <p className="text-sm text-gray-500 mt-2 bg-gray-50 p-2 rounded">
                            📝 {turno.notas}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}

// Componente para vista de lista
function VistaLista({ turnos }) {
  if (turnos.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-12 text-center">
        <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No hay turnos agendados</h3>
        <p className="text-gray-500">
          Los turnos aparecerán aquí cuando los pacientes los agenden con Sarah.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {turnos
        .sort((a, b) => new Date(a.fecha_turno) - new Date(b.fecha_turno))
        .map((turno) => {
          const estilo = obtenerEstiloEstado(turno.estado);

          return (
            <div
              key={turno.id}
              className={`bg-white rounded-lg shadow-sm p-6 border ${estilo.border} hover:shadow-md transition-shadow`}
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                {/* Información principal */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-xl font-semibold text-gray-800">
                      {turno.nombre_paciente}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${estilo.bg} ${estilo.text}`}>
                      {estilo.emoji} {turno.estado.charAt(0).toUpperCase() + turno.estado.slice(1)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Calendar className="w-4 h-4" />
                      <span>{formatearFechaHora(turno.fecha_turno)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <span className="font-medium">📱</span>
                      <span>{turno.numero_telefono}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <span className="font-medium">🦷</span>
                      <span>{turno.tipo_turno}</span>
                    </div>
                  </div>

                  {turno.notas && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Notas:</span> {turno.notas}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
    </div>
  );
}

// Componente principal TabTurnos
function TabTurnos() {
  const [vista, setVista] = useState('lista'); // 'lista' | 'calendario'
  const [fechaSeleccionada, setFechaSeleccionada] = useState(
    format(new Date(), 'yyyy-MM-dd')
  );

  // Query con polling cada 5 segundos
  const { data: turnos = [], isLoading, error, refetch } = useQuery({
    queryKey: ['turnos'],
    queryFn: turnosAPI.obtenerTodos,
    refetchInterval: 5000,
    refetchIntervalInBackground: true
  });

  // Estado de carga
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando turnos...</p>
        </div>
      </div>
    );
  }

  // Error de carga
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-800 font-medium mb-2">Error al cargar turnos</p>
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Turnos</h2>
          <p className="text-gray-600 mt-1">
            {turnos.length} turno{turnos.length !== 1 ? 's' : ''} • Actualizado automáticamente cada 5s
          </p>
        </div>

        {/* Toggle de vista */}
        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setVista('lista')}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-md font-medium transition
              ${vista === 'lista'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
              }
            `}
          >
            <List className="w-4 h-4" />
            Lista
          </button>
          <button
            onClick={() => setVista('calendario')}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-md font-medium transition
              ${vista === 'calendario'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
              }
            `}
          >
            <Calendar className="w-4 h-4" />
            Calendario
          </button>
        </div>

        {/* Botón actualizar */}
        <button
          onClick={() => refetch()}
          className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
        >
          Actualizar ahora
        </button>
      </div>

      {/* Vista seleccionada */}
      {vista === 'lista' ? (
        <VistaLista turnos={turnos} />
      ) : (
        <VistaCalendario
          turnos={turnos}
          fechaSeleccionada={fechaSeleccionada}
          setFechaSeleccionada={setFechaSeleccionada}
        />
      )}
    </div>
  );
}

export default TabTurnos;