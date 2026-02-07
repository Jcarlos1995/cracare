import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usersApi } from '../api/client';
import { ROLE_LABELS } from '../utils/roles';
import styles from './Users.module.css';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    usersApi
      .list()
      .then((res) => {
        if (!cancelled) setUsers(res.data || []);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Error al cargar usuarios');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const handleDesactivar = async (id, nombre) => {
    if (!window.confirm(`¿Desactivar a ${nombre}?`)) return;
    try {
      await usersApi.delete(id);
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, activo: false } : u)));
    } catch (err) {
      alert(err.message || 'Error al desactivar');
    }
  };

  if (loading) return <p className={styles.status}>Cargando usuarios…</p>;
  if (error) return <p className="error-msg">{error}</p>;

  return (
    <div className={styles.page}>
      <div className={styles.top}>
        <h1 className={styles.title}>Usuarios</h1>
        <Link to="/usuarios/nuevo" className="btn btn-primary">
          Nuevo usuario
        </Link>
      </div>
      <div className="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{[u.nombre, u.apellidos].filter(Boolean).join(' ')}</td>
                <td>{u.email}</td>
                <td>{ROLE_LABELS[u.rol] || u.rol}</td>
                <td>
                  <span className={u.activo ? 'badge badge-active' : 'badge badge-inactive'}>
                    {u.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td>
                  <div className={styles.actions}>
                    <Link to={`/usuarios/${u.id}`} className="btn btn-secondary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.9rem' }}>
                      Editar
                    </Link>
                    {u.activo && (
                      <button
                        type="button"
                        className="btn btn-danger"
                        style={{ padding: '0.4rem 0.75rem', fontSize: '0.9rem' }}
                        onClick={() => handleDesactivar(u.id, u.nombre)}
                      >
                        Desactivar
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && <p className={styles.empty}>No hay usuarios.</p>}
      </div>
    </div>
  );
}
