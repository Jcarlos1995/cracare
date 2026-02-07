import { useState, useEffect } from 'react';
import { pacientesApi, visitantesApi, citasApi } from '../api/client';
import styles from './Citas.module.css';

const ESTADO_LABEL = { AGENDADA: 'Agendada', REALIZADA: 'Realizada', CANCELADA: 'Cancelada', NO_ASISTIO: 'No asistió' };

export default function Citas() {
  const [pacientes, setPacientes] = useState([]);
  const [citas, setCitas] = useState([]);
  const [visitantes, setVisitantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtroFecha, setFiltroFecha] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({
    pacienteId: '',
    visitanteId: '',
    nuevoVisitante: false,
    nombre: '', apellidos: '', telefono: '', email: '', relacionConPaciente: '',
    fechaHora: '',
    observaciones: '',
  });
  const [buscaVisitante, setBuscaVisitante] = useState('');
  const [saving, setSaving] = useState(false);

  const loadPacientes = () => {
    pacientesApi.list().then((r) => setPacientes(r.data || [])).catch(() => setPacientes([]));
  };
  const loadCitas = () => {
    const params = {};
    if (filtroFecha) params.fecha = filtroFecha;
    if (filtroEstado) params.estado = filtroEstado;
    citasApi.list(params).then((r) => setCitas(r.data || [])).catch((e) => setError(e.message));
  };
  const loadVisitantes = () => {
    const q = buscaVisitante.trim() ? { q: buscaVisitante } : {};
    visitantesApi.list(q).then((r) => setVisitantes(r.data || [])).catch(() => setVisitantes([]));
  };

  useEffect(loadPacientes, []);
  useEffect(loadCitas, [filtroFecha, filtroEstado]);
  useEffect(() => {
    if (!loading) loadCitas();
  }, [loading]);
  useEffect(() => {
    loadVisitantes();
    const t = setTimeout(loadVisitantes, 300);
    return () => clearTimeout(t);
  }, [buscaVisitante]);

  useEffect(() => { setLoading(false); }, []);

  const openForm = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    setForm({
      pacienteId: '',
      visitanteId: '',
      nuevoVisitante: false,
      nombre: '', apellidos: '', telefono: '', email: '', relacionConPaciente: '',
      fechaHora: now.toISOString().slice(0, 16),
      observaciones: '',
    });
    setBuscaVisitante('');
    setFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      let visitanteId = form.visitanteId;
      if (form.nuevoVisitante) {
        if (!form.nombre?.trim()) throw new Error('Nombre del visitante obligatorio');
        const v = await visitantesApi.create({
          nombre: form.nombre.trim(),
          apellidos: form.apellidos?.trim() || null,
          telefono: form.telefono?.trim() || null,
          email: form.email?.trim() || null,
          relacionConPaciente: form.relacionConPaciente?.trim() || null,
        });
        visitanteId = v.data.id;
      }
      if (!visitanteId) throw new Error('Seleccione o registre el visitante');
      await citasApi.create({
        pacienteId: form.pacienteId,
        visitanteId,
        fechaHora: new Date(form.fechaHora).toISOString(),
        observaciones: form.observaciones?.trim() || null,
      });
      setFormOpen(false);
      loadCitas();
    } catch (err) {
      setError(err.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const updateEstado = async (id, estado) => {
    try {
      await citasApi.update(id, { estado });
      loadCitas();
    } catch (err) {
      setError(err.message);
    }
  };

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar esta cita?')) return;
    try {
      await citasApi.delete(id);
      loadCitas();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className={styles.page}>
      <h1>Citas</h1>
      <p className={styles.subtitle}>Registro de visitas de familiares y amigos a los residentes.</p>

      <div className={styles.toolbar}>
        <div className={styles.filtros}>
          <input
            type="date"
            value={filtroFecha}
            onChange={(e) => setFiltroFecha(e.target.value)}
            className={styles.input}
          />
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className={styles.select}
          >
            <option value="">Todos los estados</option>
            {Object.entries(ESTADO_LABEL).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
        <button type="button" className="btn btn-primary" onClick={openForm}>
          Nueva cita
        </button>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {formOpen && (
        <div className={styles.modal} onClick={() => setFormOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2>Registrar visita</h2>
            <form onSubmit={handleSubmit}>
              <label>
                Paciente a visitar
                <select
                  value={form.pacienteId}
                  onChange={(e) => setForm((f) => ({ ...f, pacienteId: e.target.value }))}
                  required
                  className={styles.select}
                >
                  <option value="">Seleccione...</option>
                  {pacientes.map((p) => (
                    <option key={p.id} value={p.id}>
                      {[p.nombre, p.apellidos].filter(Boolean).join(' ')}
                    </option>
                  ))}
                </select>
              </label>

              <div className={styles.visitanteBlock}>
                <label className={styles.checkLabel}>
                  <input
                    type="checkbox"
                    checked={form.nuevoVisitante}
                    onChange={(e) => setForm((f) => ({ ...f, nuevoVisitante: e.target.checked, visitanteId: '' }))}
                  />
                  Nuevo visitante (registrar datos)
                </label>

                {!form.nuevoVisitante ? (
                  <>
                    <label>
                      Buscar visitante
                      <input
                        type="text"
                        value={buscaVisitante}
                        onChange={(e) => setBuscaVisitante(e.target.value)}
                        placeholder="Nombre, teléfono..."
                        className={styles.input}
                      />
                    </label>
                    <select
                      value={form.visitanteId}
                      onChange={(e) => setForm((f) => ({ ...f, visitanteId: e.target.value }))}
                      className={styles.select}
                      size="4"
                    >
                      <option value="">Seleccione...</option>
                      {visitantes.map((v) => (
                        <option key={v.id} value={v.id}>
                          {[v.nombre, v.apellidos].filter(Boolean).join(' ')}
                          {v.telefono ? ` · ${v.telefono}` : ''}
                        </option>
                      ))}
                    </select>
                  </>
                ) : (
                  <div className={styles.nuevoVisitante}>
                    <label>Nombre * <input type="text" value={form.nombre} onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))} className={styles.input} required /></label>
                    <label>Apellidos <input type="text" value={form.apellidos} onChange={(e) => setForm((f) => ({ ...f, apellidos: e.target.value }))} className={styles.input} /></label>
                    <label>Teléfono <input type="text" value={form.telefono} onChange={(e) => setForm((f) => ({ ...f, telefono: e.target.value }))} className={styles.input} /></label>
                    <label>Email <input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className={styles.input} /></label>
                    <label>Relación con el paciente <input type="text" value={form.relacionConPaciente} onChange={(e) => setForm((f) => ({ ...f, relacionConPaciente: e.target.value }))} placeholder="ej. familiar, amigo" className={styles.input} /></label>
                  </div>
                )}
              </div>

              <label>
                Fecha y hora *
                <input
                  type="datetime-local"
                  value={form.fechaHora}
                  onChange={(e) => setForm((f) => ({ ...f, fechaHora: e.target.value }))}
                  required
                  className={styles.input}
                />
              </label>
              <label>
                Observaciones
                <textarea value={form.observaciones} onChange={(e) => setForm((f) => ({ ...f, observaciones: e.target.value }))} className={styles.textarea} rows={2} />
              </label>

              <div className={styles.formActions}>
                <button type="submit" className="btn btn-primary" disabled={saving}>Guardar cita</button>
                <button type="button" className="btn btn-secondary" onClick={() => setFormOpen(false)}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Paciente</th>
              <th>Visitante</th>
              <th>Fecha y hora</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {citas.map((c) => (
              <tr key={c.id}>
                <td>{[c.paciente?.nombre, c.paciente?.apellidos].filter(Boolean).join(' ')}</td>
                <td>
                  {[c.visitante?.nombre, c.visitante?.apellidos].filter(Boolean).join(' ')}
                  {c.visitante?.relacionConPaciente && <span className={styles.relacion}> · {c.visitante.relacionConPaciente}</span>}
                </td>
                <td>{new Date(c.fechaHora).toLocaleString('es', { dateStyle: 'short', timeStyle: 'short' })}</td>
                <td><span className={styles.badge} data-estado={c.estado}>{ESTADO_LABEL[c.estado]}</span></td>
                <td>
                  {c.estado === 'AGENDADA' && (
                    <>
                      <button type="button" className="btn btn-secondary btnSmall" onClick={() => updateEstado(c.id, 'REALIZADA')}>Realizada</button>
                      <button type="button" className="btn btn-secondary btnSmall" onClick={() => updateEstado(c.id, 'CANCELADA')}>Cancelar</button>
                    </>
                  )}
                  <button type="button" className="btn btn-secondary btnSmall" onClick={() => eliminar(c.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {citas.length === 0 && !loading && <p className={styles.empty}>No hay citas con los filtros seleccionados.</p>}
    </div>
  );
}
