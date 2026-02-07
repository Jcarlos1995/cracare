import { useState, useEffect } from 'react';
import { horariosApi } from '../api/client';
import styles from './Horarios.module.css';

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const TURNOS = [
  { value: 'MANANA_1', label: 'Mañana 1', color: '#16a34a' },
  { value: 'MANANA_2', label: 'Mañana 2', color: '#ea580c' },
  { value: 'TARDE_1', label: 'Tarde 1', color: '#2563eb' },
  { value: 'TARDE_2', label: 'Tarde 2', color: '#6b7280' },
  { value: 'GUARDIA', label: 'Guardia', color: '#ca8a04' },
];

export default function Horarios() {
  const now = new Date();
  const [anio, setAnio] = useState(now.getFullYear());
  const [mes, setMes] = useState(now.getMonth() + 1);
  const [equipo, setEquipo] = useState([]);
  const [horarios, setHorarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(null);
  const [asignaciones, setAsignaciones] = useState({});
  const [saving, setSaving] = useState(false);

  const diasEnMes = new Date(anio, mes, 0).getDate();
  const dias = Array.from({ length: diasEnMes }, (_, i) => new Date(anio, mes - 1, i + 1));
  const hoy = new Date();
  const finDeMes = new Date(anio, mes, 0);
  const diasRestantes = Math.ceil((finDeMes - hoy) / (1000 * 60 * 60 * 24));
  const avisoMes = diasRestantes <= 5 && (hoy.getMonth() + 1) === mes && hoy.getFullYear() === anio;

  useEffect(() => {
    horariosApi.getEquipo().then((r) => setEquipo(r.data || [])).catch(() => setEquipo([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    horariosApi.getMes(anio, mes).then((r) => setHorarios(r.data || [])).catch(() => setHorarios([])).finally(() => setLoading(false));
  }, [anio, mes]);

  const getAsignacion = (fecha, turno) => {
    const key = `${fecha.toISOString().slice(0, 10)}_${turno}`;
    const h = horarios.find((x) => x.fecha?.slice(0, 10) === fecha.toISOString().slice(0, 10) && x.turno === turno);
    return h?.ossId || '';
  };

  const openDia = (fecha) => {
    const asign = {};
    TURNOS.forEach((t) => {
      asign[t.value] = getAsignacion(fecha, t.value);
    });
    setAsignaciones(asign);
    setEditando(fecha.toISOString().slice(0, 10));
  };

  const handleGuardarDia = async () => {
    if (!editando) return;
    setSaving(true);
    try {
      await horariosApi.setDia(editando, asignaciones);
      const r = await horariosApi.getMes(anio, mes);
      setHorarios(r.data || []);
      setEditando(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.page}>
      <h1>Horarios</h1>
      <p className={styles.subtitle}>Asigna los turnos a tu equipo OSS por día. Calendario mensual.</p>
      {avisoMes && (
        <div className={styles.aviso}>
          Faltan {diasRestantes} días para acabar el mes. Actualiza el horario del mes siguiente cuando corresponda.
        </div>
      )}
      <div className={styles.controls}>
        <div className="form-group" style={{ marginBottom: 0, marginRight: '1rem' }}>
          <label>Mes</label>
          <select value={mes} onChange={(e) => setMes(Number(e.target.value))}>
            {MESES.map((m, i) => (
              <option key={i} value={i + 1}>{m}</option>
            ))}
          </select>
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>Año</label>
          <select value={anio} onChange={(e) => setAnio(Number(e.target.value))}>
            {[anio - 1, anio, anio + 1].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>
      <div className={styles.leyenda}>
        {TURNOS.map((t) => (
          <span key={t.value} className={styles.leyendaItem} style={{ background: t.color }}>{t.label}</span>
        ))}
      </div>
      {equipo.length === 0 && <p className={styles.empty}>No tienes OSS en tu equipo. Asigna OSS a tu RAA desde Usuarios (admin).</p>}
      {loading && <p className={styles.status}>Cargando…</p>}
      {!loading && equipo.length > 0 && (
        <div className={styles.calendario}>
          {dias.map((fecha) => (
            <div key={fecha.toISOString()} className={styles.diaCard}>
              <div className={styles.diaHeader}>
                {fecha.getDate()} {MESES[fecha.getMonth()]}
              </div>
              <div className={styles.slots}>
                {TURNOS.map((t) => {
                  const ossId = getAsignacion(fecha, t.value);
                  const oss = equipo.find((o) => o.id === ossId);
                  return (
                    <div key={t.value} className={styles.slot} style={{ borderLeftColor: t.color }}>
                      <span className={styles.slotLabel}>{t.label}</span>
                      <span className={styles.slotNombre}>{oss ? [oss.nombre, oss.apellidos].filter(Boolean).join(' ') : '—'}</span>
                    </div>
                  );
                })}
              </div>
              <button type="button" className="btn btn-secondary" style={{ marginTop: '0.5rem', width: '100%' }} onClick={() => openDia(fecha)}>
                Editar
              </button>
            </div>
          ))}
        </div>
      )}
      {editando && (
        <div className={styles.modal}>
          <div className="card" style={{ maxWidth: '400px' }}>
            <h3>Asignar turnos — {editando}</h3>
            {TURNOS.map((t) => (
              <div key={t.value} className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ width: 8, height: 8, background: t.color, borderRadius: 4 }} />
                  {t.label}
                </label>
                <select
                  value={asignaciones[t.value] || ''}
                  onChange={(e) => setAsignaciones((a) => ({ ...a, [t.value]: e.target.value }))}
                >
                  <option value="">— Sin asignar</option>
                  {equipo.map((o) => (
                    <option key={o.id} value={o.id}>{[o.nombre, o.apellidos].filter(Boolean).join(' ')}</option>
                  ))}
                </select>
              </div>
            ))}
            <button type="button" className="btn btn-primary" onClick={handleGuardarDia} disabled={saving}>Guardar</button>
            <button type="button" className="btn btn-secondary" style={{ marginLeft: '0.5rem' }} onClick={() => setEditando(null)}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
}
