import { useState, useEffect } from 'react';
import { terapiasApi, pacientesApi } from '../api/client';
import styles from './Terapias.module.css';

export default function Terapias() {
  const [list, setList] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ pacienteId: '', nombreTerapia: '', descripcion: '' });
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    terapiasApi
      .list()
      .then((r) => setList(r.data || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);
  useEffect(() => {
    pacientesApi.list().then((r) => setPacientes(r.data || [])).catch(() => setPacientes([]));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await terapiasApi.create({
        pacienteId: form.pacienteId,
        nombreTerapia: form.nombreTerapia.trim(),
        descripcion: form.descripcion?.trim() || null,
      });
      setForm({ pacienteId: '', nombreTerapia: '', descripcion: '' });
      load();
    } catch (err) {
      setError(err.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const toggleEfectuada = async (t) => {
    setError('');
    try {
      await terapiasApi.update(t.id, { efectuada: !t.efectuada });
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const nombreCompleto = (p) => [p?.nombre, p?.apellidos].filter(Boolean).join(' ');

  return (
    <div className={styles.page}>
      <h1>Terapia</h1>
      <p className={styles.subtitle}>Terapias de rehabilitación por residente. Registro y seguimiento.</p>

      <div className={styles.card}>
        <h2>Añadir registro de terapia</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <label>
            Residente
            <select
              value={form.pacienteId}
              onChange={(e) => setForm((f) => ({ ...f, pacienteId: e.target.value }))}
              required
              className={styles.select}
            >
              <option value="">Seleccione residente...</option>
              {pacientes.map((p) => (
                <option key={p.id} value={p.id}>{nombreCompleto(p)}</option>
              ))}
            </select>
          </label>
          <label>
            Terapia de rehabilitación *
            <input
              type="text"
              value={form.nombreTerapia}
              onChange={(e) => setForm((f) => ({ ...f, nombreTerapia: e.target.value }))}
              placeholder="Nombre de la terapia"
              required
              className={styles.input}
            />
          </label>
          <label>
            Descripción
            <textarea
              value={form.descripcion}
              onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))}
              placeholder="Pequeño registro o notas..."
              className={styles.textarea}
              rows={2}
            />
          </label>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Guardando…' : 'Añadir terapia'}
          </button>
        </form>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.card} style={{ marginTop: '1.5rem' }}>
        <h2>Listado de residentes y terapias</h2>
        {loading ? (
          <p className={styles.status}>Cargando…</p>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Nombre completo</th>
                  <th>Terapia de rehabilitación</th>
                  <th>Descripción</th>
                  <th>Efectuada</th>
                </tr>
              </thead>
              <tbody>
                {list.map((t) => (
                  <tr key={t.id}>
                    <td>{nombreCompleto(t.paciente)}</td>
                    <td>{t.nombreTerapia}</td>
                    <td className={styles.cellWrap}>{t.descripcion || '—'}</td>
                    <td>
                      <label className={styles.checkLabel}>
                        <input
                          type="checkbox"
                          checked={!!t.efectuada}
                          onChange={() => toggleEfectuada(t)}
                        />
                        <span>{t.efectuada ? 'Sí' : 'No'}</span>
                      </label>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && list.length === 0 && (
          <p className={styles.empty}>No hay terapias registradas. Añade una arriba.</p>
        )}
      </div>
    </div>
  );
}
