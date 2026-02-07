import { useState, useEffect } from 'react';
import { ingresosMaterialesApi } from '../api/client';
import styles from './Materiales.module.css';

const CATEGORIA_LABEL = { SANITARIA: 'Sanitaria', BASICOS_OTROS: 'Básicos / Otros' };

export default function Materiales() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [filtroDesde, setFiltroDesde] = useState('');
  const [filtroHasta, setFiltroHasta] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({
    fecha: new Date().toISOString().slice(0, 10),
    categoria: 'SANITARIA',
    descripcion: '',
    cantidad: '',
    unidad: '',
    observaciones: '',
  });
  const [saving, setSaving] = useState(false);

  const load = () => {
    const params = {};
    if (filtroCategoria) params.categoria = filtroCategoria;
    if (filtroDesde) params.desde = filtroDesde;
    if (filtroHasta) params.hasta = filtroHasta;
    ingresosMaterialesApi.list(params)
      .then((r) => setList(r.data || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [filtroCategoria, filtroDesde, filtroHasta]);

  const openForm = () => {
    setForm({
      fecha: new Date().toISOString().slice(0, 10),
      categoria: 'SANITARIA',
      descripcion: '',
      cantidad: '',
      unidad: '',
      observaciones: '',
    });
    setFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await ingresosMaterialesApi.create({
        fecha: form.fecha,
        categoria: form.categoria,
        descripcion: form.descripcion.trim(),
        cantidad: form.cantidad !== '' ? Number(form.cantidad) : null,
        unidad: form.unidad?.trim() || null,
        observaciones: form.observaciones?.trim() || null,
      });
      setFormOpen(false);
      load();
    } catch (err) {
      setError(err.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.page}>
      <h1>Materiales</h1>
      <p className={styles.subtitle}>Ingresos de materiales (categoría sanitaria o básicos/otros).</p>

      <div className={styles.toolbar}>
        <div className={styles.filtros}>
          <input
            type="date"
            value={filtroDesde}
            onChange={(e) => setFiltroDesde(e.target.value)}
            className={styles.input}
            title="Desde"
          />
          <input
            type="date"
            value={filtroHasta}
            onChange={(e) => setFiltroHasta(e.target.value)}
            className={styles.input}
            title="Hasta"
          />
          <select
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
            className={styles.select}
          >
            <option value="">Todas las categorías</option>
            {Object.entries(CATEGORIA_LABEL).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
        <button type="button" className="btn btn-primary" onClick={openForm}>
          Registrar ingreso
        </button>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {formOpen && (
        <div className={styles.modal} onClick={() => setFormOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2>Registrar ingreso de material</h2>
            <form onSubmit={handleSubmit}>
              <label>
                Fecha *
                <input
                  type="date"
                  value={form.fecha}
                  onChange={(e) => setForm((f) => ({ ...f, fecha: e.target.value }))}
                  required
                  className={styles.input}
                />
              </label>
              <label>
                Categoría *
                <select
                  value={form.categoria}
                  onChange={(e) => setForm((f) => ({ ...f, categoria: e.target.value }))}
                  required
                  className={styles.select}
                >
                  {Object.entries(CATEGORIA_LABEL).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </label>
              <label>
                Descripción *
                <input
                  type="text"
                  value={form.descripcion}
                  onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))}
                  placeholder="ej. Guantes, mascarillas, papel higiénico..."
                  required
                  className={styles.input}
                />
              </label>
              <div className={styles.row}>
                <label>
                  Cantidad
                  <input
                    type="number"
                    min="0"
                    value={form.cantidad}
                    onChange={(e) => setForm((f) => ({ ...f, cantidad: e.target.value }))}
                    className={styles.input}
                  />
                </label>
                <label>
                  Unidad
                  <input
                    type="text"
                    value={form.unidad}
                    onChange={(e) => setForm((f) => ({ ...f, unidad: e.target.value }))}
                    placeholder="cajas, unidades..."
                    className={styles.input}
                  />
                </label>
              </div>
              <label>
                Observaciones
                <textarea
                  value={form.observaciones}
                  onChange={(e) => setForm((f) => ({ ...f, observaciones: e.target.value }))}
                  className={styles.textarea}
                  rows={2}
                />
              </label>
              <div className={styles.formActions}>
                <button type="submit" className="btn btn-primary" disabled={saving}>Guardar</button>
                <button type="button" className="btn btn-secondary" onClick={() => setFormOpen(false)}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <p className={styles.status}>Cargando…</p>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Categoría</th>
                <th>Descripción</th>
                <th>Cantidad</th>
                <th>Unidad</th>
                <th>Registrado por</th>
              </tr>
            </thead>
            <tbody>
              {list.map((item) => (
                <tr key={item.id}>
                  <td>{new Date(item.fecha).toLocaleDateString('es')}</td>
                  <td><span className={styles.badge} data-cat={item.categoria}>{CATEGORIA_LABEL[item.categoria]}</span></td>
                  <td>{item.descripcion}</td>
                  <td>{item.cantidad != null ? item.cantidad : '—'}</td>
                  <td>{item.unidad || '—'}</td>
                  <td>{item.registradoPor ? [item.registradoPor.nombre, item.registradoPor.apellidos].filter(Boolean).join(' ') : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {!loading && list.length === 0 && <p className={styles.empty}>No hay ingresos con los filtros seleccionados.</p>}
    </div>
  );
}
