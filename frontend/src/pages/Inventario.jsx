import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { inventarioApi, solicitudesInsumoApi } from '../api/client';
import styles from './Inventario.module.css';

const ESTADO_LABEL = { PENDIENTE: 'Pendiente (notificación enviada)', RECIBIDA: 'Recibida', PEDIDO_LISTO: 'Pedido listo (efectuada)', COMPLETADA: 'Completada' };

function InventarioRAA() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [descripcion, setDescripcion] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => {
    solicitudesInsumoApi.list().then((r) => setList(r.data || [])).catch(() => setList([])).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleEnviar = async (e) => {
    e.preventDefault();
    if (!descripcion.trim()) return;
    setSaving(true);
    try {
      await solicitudesInsumoApi.create({ descripcion: descripcion.trim() });
      setDescripcion('');
      load();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCompletada = async (id) => {
    try {
      await solicitudesInsumoApi.marcarCompletada(id);
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <p className={styles.status}>Cargando…</p>;
  return (
    <div className={styles.page}>
      <h1>Inventario — Notificar insumo</h1>
      <p className={styles.subtitle}>Indica qué insumo sanitario falta. El administrador recibirá la notificación.</p>
      <form onSubmit={handleEnviar} className="card" style={{ maxWidth: '480px', marginBottom: '1rem' }}>
        <div className="form-group">
          <label>Descripción del insumo que falta *</label>
          <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} rows={3} required placeholder="Ej: Guantes talla M, mascarillas..." />
        </div>
        <button type="submit" className="btn btn-primary" disabled={saving}>Enviar notificación</button>
      </form>
      <div className="card">
        <h3>Mis solicitudes</h3>
        <div className={styles.solicitudesRaa}>
          {list.length === 0 && <p className={styles.empty}>No has enviado ninguna solicitud.</p>}
          {list.map((s) => (
            <div key={s.id} className={styles.solCard} data-estado={s.estado}>
              <div className={styles.solDesc}>{s.descripcion}</div>
              <div className={styles.solMeta}>{ESTADO_LABEL[s.estado]} · {new Date(s.createdAt).toLocaleString('es')}</div>
              {s.estado === 'PEDIDO_LISTO' && (
                <button type="button" className="btn btn-primary" onClick={() => handleCompletada(s.id)}>Marcar como recibido (completada)</button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Inventario() {
  const { user } = useAuth();
  if (user?.rol === 'RAA' || user?.rol === 'RAS') return <InventarioRAA />;

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    inventarioApi.list().then((r) => setItems(r.data || [])).catch((e) => setError(e.message)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const openCreate = () => setForm({ nombre: '', descripcion: '', cantidad: 0, unidad: 'unidades', categoria: 'sanidad', minimo: '' });
  const openEdit = (item) => setForm({ ...item, minimo: item.minimo ?? '' });
  const closeForm = () => setForm(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        nombre: form.nombre.trim(),
        descripcion: form.descripcion?.trim() || null,
        cantidad: Number(form.cantidad) || 0,
        unidad: form.unidad || 'unidades',
        categoria: form.categoria || 'sanidad',
        minimo: form.minimo === '' ? null : Number(form.minimo),
      };
      if (form.id) await inventarioApi.update(form.id, payload);
      else await inventarioApi.create(payload);
      closeForm();
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, nombre) => {
    if (!window.confirm(`¿Eliminar "${nombre}"?`)) return;
    try {
      await inventarioApi.delete(id);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <p className={styles.status}>Cargando inventario…</p>;
  return (
    <div className={styles.page}>
      <div className={styles.top}>
        <h1>Inventario</h1>
        <button type="button" className="btn btn-primary" onClick={openCreate}>
          Nuevo insumo
        </button>
      </div>
      {error && <p className="error-msg">{error}</p>}
      <div className="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Cantidad</th>
              <th>Unidad</th>
              <th>Categoría</th>
              <th>Mínimo</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((i) => (
              <tr key={i.id}>
                <td>{i.nombre}</td>
                <td>{i.cantidad}</td>
                <td>{i.unidad}</td>
                <td>{i.categoria}</td>
                <td>{i.minimo ?? '—'}</td>
                <td>
                  <button type="button" className="btn btn-secondary" style={{ marginRight: '0.5rem' }} onClick={() => openEdit(i)}>Editar</button>
                  <button type="button" className="btn btn-danger" onClick={() => handleDelete(i.id, i.nombre)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && <p className={styles.empty}>No hay insumos.</p>}
      </div>
      {form && (
        <div className={styles.modal}>
          <div className="card" style={{ maxWidth: '420px' }}>
            <h2>{form.id ? 'Editar insumo' : 'Nuevo insumo'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nombre *</label>
                <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Descripción</label>
                <input value={form.descripcion || ''} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Cantidad</label>
                <input type="number" value={form.cantidad} onChange={(e) => setForm({ ...form, cantidad: e.target.value })} min="0" />
              </div>
              <div className="form-group">
                <label>Unidad</label>
                <select value={form.unidad} onChange={(e) => setForm({ ...form, unidad: e.target.value })}>
                  <option value="unidades">Unidades</option>
                  <option value="cajas">Cajas</option>
                  <option value="litros">Litros</option>
                  <option value="kg">Kg</option>
                </select>
              </div>
              <div className="form-group">
                <label>Categoría</label>
                <input value={form.categoria || ''} onChange={(e) => setForm({ ...form, categoria: e.target.value })} placeholder="sanidad" />
              </div>
              <div className="form-group">
                <label>Mínimo (alerta)</label>
                <input type="number" value={form.minimo} onChange={(e) => setForm({ ...form, minimo: e.target.value })} min="0" placeholder="Opcional" />
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
