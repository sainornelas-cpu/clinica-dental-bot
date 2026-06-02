import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { turnosAPI } from '../lib/api';
import { Calendar, User, Phone, Clock, Activity, Trash2, Edit2, Check, X } from 'lucide-react';
import { formatearFechaUTC, formatearHoraUTC } from '../utils/formato';

export default function OwnerSchedule() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    numero_telefono: '',
    nombre_paciente: '',
    fecha_turno: '',  // Formato: "2026-06-02"
    hora_turno: '',   // Formato: "14:00" (slot de 1 hora)
    tipo_turno: '',
    notas: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fechaMinima, setFechaMinima] = useState('');

  // Calcular fecha mínima (hoy)
  useEffect(() => {
    const hoy = new Date().toISOString().split('T')[0];
    setFechaMinima(hoy);
  }, []);

  // Fetch de slots disponibles cuando cambia la fecha
  const { data: slotsData, isLoading: loadingSlots } = useQuery({
    queryKey: ['slots', formData.fecha_turno],
    queryFn: async () => {
      if (!formData.fecha_turno) return { slots: [] };

      const response = await fetch(`/api/turnos/slots?fecha=${formData.fecha_turno}`);
      if (!response.ok) throw new Error('Error al obtener slots');
      return response.json();
    },
    enabled: !!formData.fecha_turno,  // Solo ejecutar si hay fecha seleccionada
  });

  // Query para obtener turnos
  const { data: turnos = [], isLoading } = useQuery({
    queryKey: ['turnos'],
    queryFn: turnosAPI.obtenerTodos,
    refetchInterval: 10000
  });

  // Mutation para crear turno
  const crearMutation = useMutation({
    mutationFn: (data) => fetch('/api/turnos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(r => r.json()),
    onSuccess: (data) => {
      setSuccess(data.mensaje);
      setError('');
      setFormData({
        numero_telefono: '',
        nombre_paciente: '',
        fecha_turno: '',
        hora_turno: '',
        tipo_turno: '',
        notas: ''
      });
      queryClient.invalidateQueries(['turnos']);
      queryClient.invalidateQueries(['slots']);
      setTimeout(() => setSuccess(''), 5000);
    },
    onError: (err) => {
      setError(err.message || 'Error al agendar turno');
      setSuccess('');
    }
  });

  // Mutation para cancelar turno
  const cancelarMutation = useMutation({
    mutationFn: (id) => fetch(`/api/turnos/${id}`, { method: 'DELETE' }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries(['turnos']);
      queryClient.invalidateQueries(['slots']);
    }
  });

  // Validar que fecha+hora sean futuras
  const validarFechaHoraFutura = (fechaStr, horaStr) => {
    if (!fechaStr || !horaStr) return true;  // Sin validar si no hay datos

    const [hora, minuto] = horaStr.split(':').map(Number);
    const [year, month, day] = fechaStr.split('-').map(Number);

    const fechaSeleccionada = new Date(year, month - 1, day, hora, minuto);
    const ahora = new Date();
    const margenMinutos = 5;
    const limiteMinimo = new Date(ahora.getTime() + margenMinutos * 60000);

    return fechaSeleccionada >= limiteMinimo;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validar fecha/hora futura
    if (!validarFechaHoraFutura(formData.fecha_turno, formData.hora_turno)) {
      setError('⚠️ La fecha y hora deben ser al menos 5 minutos posteriores a la hora actual.');
      return;
    }

    // Validar horario de atención (9:00 - 18:00)
    const horaSeleccionada = parseInt(formData.hora_turno.split(':')[0]);
    if (horaSeleccionada < 9 || horaSeleccionada >= 18) {
      setError('⚠️ La clínica atiende de 9:00 a 18:00. Por favor, seleccioná un horario dentro de este rango.');
      return;
    }

    // Combinar fecha y hora para enviar al backend
    const fechaHoraCompleta = `${formData.fecha_turno}T${formData.hora_turno}:00.000Z`;

    crearMutation.mutate({
      ...formData,
      fecha_turno: fechaHoraCompleta
    });
  };

  const handleCancel = (id, nombre) => {
    if (confirm(`¿Cancelar turno de ${nombre}?`)) {
      cancelarMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header con toggle de formulario */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Gestión de Turnos</h2>
          <p className="text-gray-600 mt-1">Agendá y cancelá turnos desde el dashboard</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
        >
          {showForm ? <X className="w-5 h-5" /> : <Calendar className="w-5 h-5" />}
          {showForm ? 'Cancelar' : 'Nuevo Turno'}
        </button>
      </div>

      {/* Formulario para agendar turno */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Agendar Nuevo Turno</h3>

          {error && <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">{error}</div>}
          {success && <div className="bg-green-100 text-green-700 p-3 rounded-md mb-4">{success}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Número de teléfono */}
              <div>
                <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                  <Phone className="w-4 h-4" /> Número de teléfono
                </label>
                <input
                  type="tel"
                  value={formData.numero_telefono}
                  onChange={(e) => setFormData({ ...formData, numero_telefono: e.target.value })}
                  placeholder="+5216651108583"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Nombre del paciente */}
              <div>
                <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                  <User className="w-4 h-4" /> Nombre del paciente
                </label>
                <input
                  type="text"
                  value={formData.nombre_paciente}
                  onChange={(e) => setFormData({ ...formData, nombre_paciente: e.target.value })}
                  placeholder="Alfredo Ornelas"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Fecha */}
              <div>
                <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Fecha
                </label>
                <input
                  type="date"
                  value={formData.fecha_turno}
                  onChange={(e) => setFormData({ ...formData, fecha_turno: e.target.value, hora_turno: '' })}
                  min={fechaMinima}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  required
                />
                <p className="text-xs text-gray-600 mt-1">
                  💡 Fecha mínima: {new Date().toLocaleDateString('es-AR')}
                </p>
              </div>

              {/* Hora (slots de 1 hora) */}
              <div>
                <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Hora (turnos de 1 hora)
                </label>

                {!formData.fecha_turno ? (
                  <input
                    type="text"
                    placeholder="Primero seleccioná una fecha"
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500"
                  />
                ) : loadingSlots ? (
                  <input
                    type="text"
                    placeholder="Cargando horarios..."
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500"
                  />
                ) : slotsData?.slots.length === 0 ? (
                  <input
                    type="text"
                    placeholder="No hay horarios disponibles"
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500"
                  />
                ) : (
                  <select
                    value={formData.hora_turno}
                    onChange={(e) => setFormData({ ...formData, hora_turno: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Seleccioná un horario</option>
                    {slotsData?.slots.map(slot => (
                      <option key={slot} value={slot}>
                        {slot} - {parseInt(slot.split(':')[0]) + 1}:00
                      </option>
                    ))}
                  </select>
                )}

                <p className="text-xs text-gray-600 mt-1">
                  🕘 Horarios: 9:00 - 17:00 (turnos de 1 hora)
                </p>
              </div>
            </div>

            {/* Tipo de tratamiento */}
            <div>
              <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                <Activity className="w-4 h-4" /> Tipo de tratamiento
              </label>
              <select
                value={formData.tipo_turno}
                onChange={(e) => setFormData({ ...formData, tipo_turno: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Seleccionar...</option>
                <option value="Limpieza Dental">Limpieza Dental</option>
                <option value="Ortodoncia">Ortodoncia</option>
                <option value="Implantes">Implantes</option>
                <option value="Blanqueamiento">Blanqueamiento</option>
                <option value="Endodoncia">Endodoncia</option>
                <option value="Extracción de Muelas">Extracción de Muelas</option>
              </select>
            </div>

            {/* Notas */}
            <div>
              <label className="block text-sm font-medium mb-1">Notas (opcional)</label>
              <textarea
                value={formData.notas}
                onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                rows="3"
              />
            </div>

            <button
              type="submit"
              disabled={!formData.hora_turno || crearMutation.isPending}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {crearMutation.isPending ? 'Agendando...' : 'Agendar Turno'}
            </button>
          </form>
        </div>
      )}

      {/* Lista de turnos */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando turnos...</p>
          </div>
        ) : turnos.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No hay turnos agendados</h3>
            <p className="text-gray-500">Los turnos aparecerán aquí cuando se agenden.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paciente</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teléfono</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tratamiento</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {turnos.map((turno) => (
                  <tr key={turno.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{turno.nombre_paciente}</td>
                    <td className="px-4 py-3 text-gray-600">{turno.numero_telefono}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {formatearFechaUTC(turno.fecha_turno, {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short'
                      })}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{turno.tipo_turno}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        turno.estado === 'confirmado'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {turno.estado}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {turno.estado === 'confirmado' && (
                        <button
                          onClick={() => handleCancel(turno.id, turno.nombre_paciente)}
                          className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition"
                          title="Cancelar turno"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
