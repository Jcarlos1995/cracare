import { useState, useEffect } from 'react';
import { medicacionesApi, medicamentosPacienteApi } from '../api/client';
import styles from './Medicaciones.module.css';

function nombrePaciente(p) {
  return p ? [p.nombre, p.apellidos].filter(Boolean).join(' ') : '—';
}

function tratamientosText(paciente) {
  if (!paciente?.tratamientos?.length) return '—';
  return paciente.tratamientos.map((t) => t.descripcion).join('; ');
}

export default function Medicaciones() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState(null);

  const load = () => {
    setLoading(true);
    medicacionesApi.getGrid().then((r) => setList(r.data || [])).catch(() => setList([])).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleEfectuado = async (row) => {
    setTogglingId(row.id);
    try {
      await medicamentosPacienteApi.update(row.id, { efectuado: !row.efectuado });
      load();
    } catch (err) {
      alert(err.message);
    } finally {
      setTogglingId(null);
    }
  };

  const formatFechaHora = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('es', { dateStyle: 'short', timeStyle: 'short' });
  };

  return (
    <div className={styles.page}>
      <h1>Medicaciones</h1>
      <p className={styles.subtitle}>Grid de medicamentos por paciente. Marca como efectuado cuando se administre la toma.</p>
      {loading && <p className={styles.status}>Cargando…</p>}
      {!loading && list.length === 0 && <p className={styles.empty}>No hay medicaciones registradas.</p>}
      {!loading && list.length > 0 && (
        <div className="card table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nombre del paciente</th>
                <th>Medicamento</th>
                <th>Tratamientos</th>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Efectuado</th>
              </tr>
            </thead>
            <tbody>
              {list.map((row) => (
                <tr key={row.id}>
                  <td>{nombrePaciente(row.paciente)}</td>
                  <td>
                    <strong>{row.medicamento}</strong>
                    {(row.dosis || row.frecuencia) && (
                      <span className={styles.dosis}> {[row.dosis, row.frecuencia].filter(Boolean).join(' · ')}</span>
                    )}
                  </td>
                  <td className={styles.cellWrap}>{tratamientosText(row.paciente)}</td>
                  <td>{row.fechaHora ? new Date(row.fechaHora).toLocaleDateString('es') : '—'}</td>
                  <td>{row.fechaHora ? new Date(row.fechaHora).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                  <td>
                    <label className={styles.checkLabel}>
                      <input
                        type="checkbox"
                        checked={!!row.efectuado}
                        disabled={togglingId === row.id}
                        onChange={() => handleEfectuado(row)}
                      />
                      <span>{row.efectuado ? 'Sí' : 'No'}</span>
                    </label>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
