import { useState, useEffect, useRef } from 'react';
import { usersApi } from '../api/client';
import { ROLE_LABELS } from '../utils/roles';
import styles from './Contratos.module.css';

const API_BASE = import.meta.env.VITE_API_URL || '';

export default function Contratos() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(null);
  const fileRef = useRef(null);

  useEffect(() => {
    usersApi.list().then((r) => setUsers(r.data || [])).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }, []);

  const pdfUrl = (u) => (u.contratoUrl ? `${API_BASE}${u.contratoUrl}` : null);

  const handleFile = (userId, e) => {
    const file = e.target.files?.[0];
    if (!file || !file.name.toLowerCase().endsWith('.pdf')) {
      alert('Selecciona un archivo PDF');
      return;
    }
    setUploading(userId);
    usersApi
      .uploadContrato(userId, file)
      .then((res) => {
        setUsers((prev) => prev.map((u) => (u.id === userId ? res.data : u)));
      })
      .catch((err) => alert(err.message || 'Error al subir'))
      .finally(() => {
        setUploading(null);
        if (fileRef.current) fileRef.current.value = '';
      });
  };

  if (loading) return <p className={styles.status}>Cargando empleados…</p>;
  return (
    <div className={styles.page}>
      <h1>Contratos</h1>
      <p className={styles.subtitle}>Lista de empleados y contrato en PDF</p>
      {error && <p className="error-msg">{error}</p>}
      <div className="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>DNI/NIF</th>
              <th>Teléfono</th>
              <th>Contrato</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{[u.nombre, u.apellidos].filter(Boolean).join(' ')}</td>
                <td>{u.email}</td>
                <td>{ROLE_LABELS[u.rol] || u.rol}</td>
                <td>{u.dniNif || '—'}</td>
                <td>{u.telefono || '—'}</td>
                <td>
                  {pdfUrl(u) ? (
                    <a href={pdfUrl(u)} target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.9rem' }}>
                      Ver PDF
                    </a>
                  ) : (
                    '—'
                  )}
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    style={{ display: 'none' }}
                    onChange={(e) => handleFile(u.id, e)}
                    id={`file-${u.id}`}
                  />
                  <label htmlFor={`file-${u.id}`} className="btn btn-primary" style={{ marginLeft: '0.5rem', padding: '0.4rem 0.75rem', fontSize: '0.9rem', cursor: 'pointer' }}>
                    {uploading === u.id ? 'Subiendo…' : 'Subir PDF'}
                  </label>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && <p className={styles.empty}>No hay empleados.</p>}
      </div>
    </div>
  );
}
