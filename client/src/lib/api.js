// Cliente API para el backend Express
// En desarrollo: localhost:3001, En producción: URL relativa (mismo dominio)
const API_BASE = import.meta.env.DEV ? 'http://localhost:3001/api' : '/api';

// Métodos HTTP base
export const api = {
  async get(endpoint) {
    const res = await fetch(`${API_BASE}${endpoint}`);
    if (!res.ok) throw new Error(`Error HTTP ${res.status}: ${res.statusText}`);
    return res.json();
  },

  async post(endpoint, data) {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(`Error HTTP ${res.status}: ${res.statusText}`);
    return res.json();
  },

  async put(endpoint, data) {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(`Error HTTP ${res.status}: ${res.statusText}`);
    return res.json();
  },

  async delete(endpoint) {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error(`Error HTTP ${res.status}: ${res.statusText}`);
    return res.json();
  }
};

// API de Mensajes
export const mensajesAPI = {
  obtenerTodos: () => api.get('/mensajes'),
  obtenerPorTelefono: (telefono) => api.get(`/mensajes/telefono/${telefono}`)
};

// API de Turnos
export const turnosAPI = {
  obtenerTodos: () => api.get('/turnos'),
  obtenerPorFecha: (fecha) => api.get(`/turnos/${fecha}`),
  obtenerPorTelefono: (telefono) => api.get(`/turnos/telefono/${telefono}`)
};

// API de Configuración
export const configuracionAPI = {
  obtener: () => api.get('/configuracion'),
  actualizar: (data) => api.put('/configuracion', data)
};