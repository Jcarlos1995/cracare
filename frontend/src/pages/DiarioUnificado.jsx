import { useState, useEffect } from 'react';
import { diarioUnificadoApi, pacientesApi } from '../api/client';
import { ROLE_LABELS } from '../utils/roles';
import styles from './DiarioUnificado.module.css';

export default function DiarioUnificado() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fechaFiltro, setFechaFiltro] = useState('');
  const [pacienteIdFiltro, setPacienteIdFiltro] = useState('');
  const [pacientes, setPacientes] = useState([]);

  useEffect(() => {
    pacientesApi.list().then((r) => setPacientes(r.data || [])).catch(() => setPacientes([]));
  }, []);

  const load = () => {
    setLoading(true);
    const params = {};
    if (fechaFiltro) params.fecha = fechaFiltro;
    if (pacienteIdFiltro) params.pacienteId = pacienteIdFiltro;
    diarioUnificadoApi
      .get(params)
      .then((r) => setList(r.data || []))
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  };

  useEffect(load, [fechaFiltro, pacienteIdFiltro]);

  const nombrePaciente = (p) => (p ? [p.nombre, p.apellidos].filter(Boolean).join(' ') : '—');
  const nombreAutor = (a) => (a ? [a.nombre, a.apellidos].filter(Boolean).join(' ') : '—');

  return (
    <div className={styles.page}>
      <h1>Diario unificado</h1>
      <p className={styles.subtitle}>Bitácora de consignas personales de todos los residentes (incidencias diarias).</p>
      <div className={styles.filtros}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>Filtrar por fecha</label>
          <input
            type="date"
            value={fechaFiltro}
            onChange={(e) => setFechaFiltro(e.target.value)}
          />
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>Paciente</label>
          <select value={pacienteIdFiltro} onChange={(e) => setPacienteIdFiltro(e.target.value)}>
            <option value="">Todos</option>
            {pacientes.map((p) => (
              <option key={p.id} value={p.id}>{nombrePaciente(p)}</option>
            ))}
          </select>
        </div>
      </div>
      {loading && <p className={styles.status}>Cargando…</p>}
      {!loading && list.length === 0 && <p className={styles.empty}>No hay consignas personales con los filtros aplicados.</p>}
      {!loading && list.length > 0 && (
        <div className={styles.grid}>
          {list.map((c) => (
            <div key={c.id} className={styles.card}>
              <div className={styles.cardPaciente}>{nombrePaciente(c.paciente)}</div>
              <div className={styles.cardContenido}>{c.contenido}</div>
              <div className={styles.cardMeta}>
                {nombreAutor(c.autor)}
                {c.autor?.rol && <span> · {ROLE_LABELS[c.autor.rol] || c.autor.rol}</span>}
                {' · '}{new Date(c.createdAt).toLocaleString('es')}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
