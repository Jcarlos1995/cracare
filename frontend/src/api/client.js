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
};
