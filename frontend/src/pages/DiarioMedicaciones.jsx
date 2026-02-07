import { useState, useEffect } from 'react';
import { diarioMedicacionesApi } from '../api/client';
import { ROLE_LABELS } from '../utils/roles';
import styles from './DiarioMedicaciones.module.css';

function nombrePaciente(p) {
  return p ? [p.nombre, p.apellidos].filter(Boolean).join(' ') : '—';
}

function nombreAutor(a) {
  return a ? [a.nombre, a.apellidos].filter(Boolean).join(' ') : '—';
}

export default function DiarioMedicaciones() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    diarioMedicacionesApi.get().then((r) => setList(r.data || [])).catch(() => setList([])).finally(() => setLoading(false));
  };

  useEffect(load, []);

  return (
    <div className={styles.page}>
      <h1>Diario medicaciones</h1>
      <p className={styles.subtitle}>Registro automático de tomas marcadas como efectuadas en Medicaciones. Solo consulta (no modificable). Visible para Médico, RAS y Enfermeras.</p>
      {loading && <p className={styles.status}>Cargando…</p>}
      {!loading && list.length === 0 && <p className={styles.empty}>Aún no hay medicaciones efectuadas.</p>}
      {!loading && list.length > 0 && (
        <div className={styles.grid}>
          {list.map((row) => (
            <div key={row.id} className={styles.card}>
              <div className={styles.cardPaciente}>{nombrePaciente(row.paciente)}</div>
              <div className={styles.cardMedicamento}><strong>{row.medicamento}</strong> {row.dosis && ` · ${row.dosis}`}</div>
              <div className={styles.cardMeta}>
                Efectuado el {row.efectuadoAt ? new Date(row.efectuadoAt).toLocaleString('es') : '—'}
                {row.efectuadoPor && (
                  <span> por {nombreAutor(row.efectuadoPor)} {row.efectuadoPor.rol && `(${ROLE_LABELS[row.efectuadoPor.rol] || row.efectuadoPor.rol})`}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
