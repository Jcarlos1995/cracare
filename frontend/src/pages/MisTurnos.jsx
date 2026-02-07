import { useState, useEffect } from 'react';
import { horariosApi } from '../api/client';
import styles from './MisTurnos.module.css';

const TURNOS_LABEL = {
  MANANA_1: 'Mañana 1',
  MANANA_2: 'Mañana 2',
  TARDE_1: 'Tarde 1',
  TARDE_2: 'Tarde 2',
  GUARDIA: 'Guardia',
};

export default function MisTurnos() {
  const [anio, setAnio] = useState(new Date().getFullYear());
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    horariosApi
      .getMisTurnos(anio, mes)
      .then((r) => setList(r.data || []))
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }, [anio, mes]);

  const diasEnMes = new Date(anio, mes, 0).getDate();
  const primerDia = new Date(anio, mes - 1, 1).getDay();
  const offset = primerDia === 0 ? 6 : primerDia - 1;

  const getTurno = (dia) => {
    const fecha = new Date(anio, mes - 1, dia);
    const iso = fecha.toISOString().slice(0, 10);
    const h = list.find((x) => x.fecha && String(x.fecha).slice(0, 10) === iso);
    return h ? TURNOS_LABEL[h.turno] || h.turno : null;
  };

  return (
    <div className={styles.page}>
      <h1>Mis turnos</h1>
      <p className={styles.subtitle}>Turnos asignados por tu RAA para este mes.</p>

      <div className={styles.toolbar}>
        <select value={mes} onChange={(e) => setMes(Number(e.target.value))} className={styles.select}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
            <option key={m} value={m}>
              {new Date(2000, m - 1).toLocaleString('es', { month: 'long' })}
            </option>
          ))}
        </select>
        <select value={anio} onChange={(e) => setAnio(Number(e.target.value))} className={styles.select}>
          {[anio - 1, anio, anio + 1].map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className={styles.status}>Cargando…</p>
      ) : (
        <div className={styles.calendario}>
          {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((d) => (
            <div key={d} className={styles.diaHeader}>
              {d}
            </div>
          ))}
          {Array(offset)
            .fill(null)
            .map((_, i) => (
              <div key={`e-${i}`} className={styles.celdaVacia} />
            ))}
          {Array(diasEnMes)
            .fill(0)
            .map((_, i) => {
              const dia = i + 1;
              const turno = getTurno(dia);
              return (
                <div key={dia} className={styles.celda}>
                  <span className={styles.numDia}>{dia}</span>
                  {turno && <span className={styles.turno}>{turno}</span>}
                </div>
              );
            })}
        </div>
      )}
      {!loading && list.length === 0 && (
        <p className={styles.empty}>No tienes turnos asignados este mes.</p>
      )}
    </div>
  );
}
