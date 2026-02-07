const API_BASE = import.meta.env.VITE_API_URL || '';

function getToken() {
  return localStorage.getItem('cracare_token');
}

export async function api(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error(data.message || 'Error en la petición');
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export const authApi = {
  login: (email, password) =>
    api('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  me: () => api('/api/auth/me'),
};

export const usersApi = {
  list: () => api('/api/users'),
  get: (id) => api(`/api/users/${id}`),
  create: (body) => api('/api/users', { method: 'POST', body: JSON.stringify(body) }),
  update: (id, body) => api(`/api/users/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (id) => api(`/api/users/${id}`, { method: 'DELETE' }),
  uploadContrato: (id, file) => {
    const formData = new FormData();
    formData.append('contrato', file);
    const token = getToken();
    return fetch(`${API_BASE}/api/users/${id}/contrato`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    }).then((res) => {
      if (!res.ok) return res.json().then((d) => { throw new Error(d.message || 'Error'); });
      return res.json();
    });
  },
};

export const dashboardApi = {
  get: () => api('/api/dashboard'),
};

export const inventarioApi = {
  list: () => api('/api/inventario'),
  get: (id) => api(`/api/inventario/${id}`),
  create: (body) => api('/api/inventario', { method: 'POST', body: JSON.stringify(body) }),
  update: (id, body) => api(`/api/inventario/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (id) => api(`/api/inventario/${id}`, { method: 'DELETE' }),
};

export const consignasApi = {
  list: () => api('/api/consignas'),
  get: (id) => api(`/api/consignas/${id}`),
  create: (body) => api('/api/consignas', { method: 'POST', body: JSON.stringify(body) }),
  update: (id, body) => api(`/api/consignas/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (id) => api(`/api/consignas/${id}`, { method: 'DELETE' }),
};

export const movimientosApi = {
  list: (params) => api('/api/movimientos?' + new URLSearchParams(params).toString()),
  create: (body) => api('/api/movimientos', { method: 'POST', body: JSON.stringify(body) }),
  update: (id, body) => api(`/api/movimientos/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (id) => api(`/api/movimientos/${id}`, { method: 'DELETE' }),
};

export const pacientesApi = {
  list: () => api('/api/pacientes'),
  get: (id) => api(`/api/pacientes/${id}`),
  create: (body) => api('/api/pacientes', { method: 'POST', body: JSON.stringify(body) }),
  update: (id, body) => api(`/api/pacientes/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (id) => api(`/api/pacientes/${id}`, { method: 'DELETE' }),
  uploadHojaClinica: (id, file) => {
    const formData = new FormData();
    formData.append('hojaClinica', file);
    const token = getToken();
    return fetch(`${API_BASE}/api/pacientes/${id}/hoja-clinica`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    }).then((res) => {
      if (!res.ok) return res.json().then((d) => { throw new Error(d.message || 'Error'); });
      return res.json();
    });
  },
};

export const solicitudesInsumoApi = {
  list: () => api('/api/solicitudes-insumo'),
  create: (body) => api('/api/solicitudes-insumo', { method: 'POST', body: JSON.stringify(body) }),
  updateEstado: (id, estado) => api(`/api/solicitudes-insumo/${id}/estado`, { method: 'PATCH', body: JSON.stringify({ estado }) }),
  marcarCompletada: (id) => api(`/api/solicitudes-insumo/${id}/completada`, { method: 'PATCH' }),
};

export const horariosApi = {
  getEquipo: () => api('/api/horarios/equipo'),
  getMes: (anio, mes) => api(`/api/horarios/mes?anio=${anio}&mes=${mes}`),
  getMisTurnos: (anio, mes) => api(`/api/horarios/mis-turnos?anio=${anio}&mes=${mes}`),
  setDia: (fecha, asignaciones) => api('/api/horarios/dia', { method: 'POST', body: JSON.stringify({ fecha, asignaciones }) }),
};

export const horariosEnfermeraApi = {
  getEquipo: () => api('/api/horarios-enfermera/equipo'),
  getMes: (anio, mes) => api(`/api/horarios-enfermera/mes?anio=${anio}&mes=${mes}`),
  setDia: (fecha, asignaciones) => api('/api/horarios-enfermera/dia', { method: 'POST', body: JSON.stringify({ fecha, asignaciones }) }),
};

export const medicamentosPacienteApi = {
  list: (pacienteId) => api(`/api/pacientes/${pacienteId}/medicamentos`),
  create: (pacienteId, body) => api(`/api/pacientes/${pacienteId}/medicamentos`, { method: 'POST', body: JSON.stringify(body) }),
  update: (id, body) => api(`/api/medicamentos/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (id) => api(`/api/medicamentos/${id}`, { method: 'DELETE' }),
};

export const medicacionesApi = {
  getGrid: () => api('/api/medicaciones'),
};

export const diarioMedicacionesApi = {
  get: () => api('/api/diario-medicaciones'),
};

export const tratamientosPacienteApi = {
  list: (pacienteId) => api(`/api/pacientes/${pacienteId}/tratamientos`),
  create: (pacienteId, body) => api(`/api/pacientes/${pacienteId}/tratamientos`, { method: 'POST', body: JSON.stringify(body) }),
  update: (id, body) => api(`/api/tratamientos/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (id) => api(`/api/tratamientos/${id}`, { method: 'DELETE' }),
};

export const consignasPersonalesApi = {
  list: (pacienteId) => api(`/api/pacientes/${pacienteId}/consignas-personales`),
  create: (pacienteId, body) => api(`/api/pacientes/${pacienteId}/consignas-personales`, { method: 'POST', body: JSON.stringify(body) }),
};

export const diarioUnificadoApi = {
  get: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return api('/api/diario-unificado' + (q ? '?' + q : ''));
  },
};

export const reportesApi = {
  mensual: (anio, mes) => api(`/api/reportes/mensual?anio=${anio}&mes=${mes}`),
  exportUrl: (anio, mes) => `${API_BASE}/api/reportes/export?anio=${anio}&mes=${mes}`,
};

// Recepcionista: visitantes, citas, ingresos de materiales
export const visitantesApi = {
  list: (params = {}) => api('/api/visitantes?' + new URLSearchParams(params).toString()),
  get: (id) => api(`/api/visitantes/${id}`),
  create: (body) => api('/api/visitantes', { method: 'POST', body: JSON.stringify(body) }),
  update: (id, body) => api(`/api/visitantes/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
};

export const citasApi = {
  list: (params = {}) => api('/api/citas?' + new URLSearchParams(params).toString()),
  getAgendadas: () => api('/api/citas/agendadas'),
  get: (id) => api(`/api/citas/${id}`),
  create: (body) => api('/api/citas', { method: 'POST', body: JSON.stringify(body) }),
  update: (id, body) => api(`/api/citas/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (id) => api(`/api/citas/${id}`, { method: 'DELETE' }),
};

export const ingresosMaterialesApi = {
  list: (params = {}) => api('/api/ingresos-materiales?' + new URLSearchParams(params).toString()),
  get: (id) => api(`/api/ingresos-materiales/${id}`),
  create: (body) => api('/api/ingresos-materiales', { method: 'POST', body: JSON.stringify(body) }),
};

// OSS/RAA: registro diario de cuidados y actividades (baño semanal)
export const registroCuidadosApi = {
  getByFecha: (fecha) => api('/api/registro-cuidados?' + new URLSearchParams({ fecha: fecha || new Date().toISOString().slice(0, 10) }).toString()),
  upsert: (body) => api('/api/registro-cuidados', { method: 'POST', body: JSON.stringify(body) }),
};

export const actividadesApi = {
  get: () => api('/api/actividades'),
  getBanos: () => api('/api/actividades/banos'),
  setBano: (body) => api('/api/actividades/banos', { method: 'POST', body: JSON.stringify(body) }),
};

// Fisioterapeuta: terapias de rehabilitación
export const terapiasApi = {
  list: () => api('/api/terapias'),
  listByPaciente: (pacienteId) => api(`/api/pacientes/${pacienteId}/terapias`),
  create: (body) => api('/api/terapias', { method: 'POST', body: JSON.stringify(body) }),
  update: (id, body) => api(`/api/terapias/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (id) => api(`/api/terapias/${id}`, { method: 'DELETE' }),
};
