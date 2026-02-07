import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { consignasApi } from '../api/client';
import styles from './Consignas.module.css';

export default function Consignas() {
  const { user } = useAuth();
  const isAdmin = user?.rol === 'ADMINISTRADOR';
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    consignasApi.list().then((r) => setList(r.data || [])).catch((e) => setError(e.message)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const openCreate = () => setForm({ titulo: '', contenido: '' });
  const openEdit = (c) => setForm({ id: c.id, titulo: c.titulo, contenido: c.contenido });
  const closeForm = () => setForm(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (form.id) await consignasApi.update(form.id, { titulo: form.titulo.trim(), contenido: form.contenido.trim() });
      else await consignasApi.create({ titulo: form.titulo.trim(), contenido: form.contenido.trim() });
      closeForm();
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, titulo) => {
    if (!window.confirm(`¿Eliminar consigna "${titulo}"?`)) return;
    try {
      await consignasApi.delete(id);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <p className={styles.status}>Cargando consignas…</p>;
  return (
    <div className={styles.page}>
      <div className={styles.top}>
        <h1>Consignas generales</h1>
        <button type="button" className="btn btn-primary" onClick={openCreate}>
          Nueva consigna
        </button>
      </div>
      {error && <p className="error-msg">{error}</p>}
      <div className={styles.list}>
        {list.map((c) => (
          <div key={c.id} className="card" style={{ marginBottom: '1rem' }}>
            <div className={styles.consignaHeader}>
              <h3 style={{ margin: 0 }}>{c.titulo}</h3>
              <span className={styles.autor}>
                {c.autorNombre} — {c.autorRol}
              </span>
            </div>
            <p className={styles.contenido}>{c.contenido}</p>
            <p className={styles.fecha}>{new Date(c.createdAt).toLocaleString('es')}</p>
            {isAdmin && (
              <div className={styles.actions}>
                <button type="button" className="btn btn-secondary" onClick={() => openEdit(c)}>Editar</button>
                <button type="button" className="btn btn-danger" onClick={() => handleDelete(c.id, c.titulo)}>Eliminar</button>
              </div>
            )}
          </div>
        ))}
        {list.length === 0 && <p className={styles.empty}>No hay consignas.</p>}
      </div>
      {form && (form.id ? isAdmin : true) && (
        <div className={styles.modal}>
          <div className="card" style={{ maxWidth: '520px' }}>
            <h2>{form.id ? 'Editar consigna' : 'Nueva consigna'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Título *</label>
                <input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Contenido *</label>
                <textarea value={form.contenido} onChange={(e) => setForm({ ...form, contenido: e.target.value })} rows={5} required />
              </div>
              <button type="submit" className="btn btn-primary" disabled={saving}>Guardar</button>
              <button type="button" className="btn btn-secondary" style={{ marginLeft: '0.5rem' }} onClick={closeForm}>Cancelar</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
