import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { registroCuidadosApi } from '../api/client';
import styles from './RegistroDiario.module.css';

const CAMPOS = [
  { key: 'desayunado', label: 'Desayunado' },
  { key: 'almorzado', label: 'Almorzado' },
  { key: 'merendado', label: 'Merendado' },
  { key: 'cenado', label: 'Cenado' },
  { key: 'evacuado', label: 'Evacuado' },
  { key: 'evacuadoAlvo', label: 'Alvo' },
  { key: 'dormido', label: 'Dormido' },
  { key: 'hidratado', label: 'Hidratado' },
];

export default function RegistroDiario() {
  const navigate = useNavigate();
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(null);

  const load = () => {
    setLoading(true);
    registroCuidadosApi
      .getByFecha(fecha)
      .then((r) => setList(r.data || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [fecha]);

  const handleChange = (pacienteId, field, value) => {
    setList((prev) =>
      prev.map((item) => {
        if (item.paciente.id !== pacienteId) return item;
        const reg = item.registro ? { ...item.registro } : {};
        reg[field] = value;
        return { ...item, registro: reg };
      })
    );
  };

  const handleGuardar = async (item) => {
    const r = item.registro || {};
    setSaving(item.paciente.id);
    setError('');
    try {
      await registroCuidadosApi.upsert({
        pacienteId: item.paciente.id,
        fecha,
        desayunado: r.desayunado ?? false,
        almorzado: r.almorzado ?? false,
        merendado: r.merendado ?? false,
        cenado: r.cenado ?? false,
        evacuado: r.evacuado ?? false,
        evacuadoAlvo: r.evacuadoAlvo ?? false,
        dormido: r.dormido ?? false,
        hidratado: r.hidratado ?? false,
      });
      load();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(null);
    }
  };

  const nombrePaciente = (p) => [p.nombre, p.apellidos].filter(Boolean).join(' ');

  return (
    <div className={styles.page}>
      <h1>Registro diario de cuidados</h1>
      <p className={styles.subtitle}>Desayuno, comida, cena, evacuación (Alvo), sueño e hidratación.</p>

      <div className={styles.toolbar}>
        <label>
          Fecha
          <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className={styles.input} />
        </label>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {loading ? (
        <p className={styles.status}>Cargando…</p>
      ) : (
        <div className={styles.list}>
          {list.map((item) => (
            <div key={item.paciente.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <h3>{nombrePaciente(item.paciente)}</h3>
                <div className={styles.actions}>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => handleGuardar(item)}
                    disabled={saving === item.paciente.id}
                  >
                    {saving === item.paciente.id ? 'Guardando…' : 'Guardar'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => navigate(`/pacientes/${item.paciente.id}`)}
                  >
                    Diario personal
                  </button>
                </div>
              </div>
              <div className={styles.checkboxes}>
                {CAMPOS.map(({ key, label }) => (
                  <label key={key} className={styles.check}>
                    <input
                      type="checkbox"
                      checked={!!(item.registro && item.registro[key])}
                      onChange={(e) => handleChange(item.paciente.id, key, e.target.checked)}
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      {!loading && list.length === 0 && <p className={styles.empty}>No hay residentes asignados.</p>}
    </div>
  );
}
