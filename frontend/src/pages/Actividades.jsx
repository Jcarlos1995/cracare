import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { actividadesApi, pacientesApi } from '../api/client';
import styles from './Actividades.module.css';

const DIAS = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export default function Actividades() {
  const { user } = useAuth();
  const isRaa = user?.rol === 'RAA';
  const [data, setData] = useState(null);
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    actividadesApi
      .get()
      .then((r) => setData(r.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);
  useEffect(() => {
    if (isRaa) {
      pacientesApi.list().then((r) => setPacientes(r.data || [])).catch(() => setPacientes([]));
    }
  }, [isRaa]);

  const handleSetBano = async (pacienteId, diaSemana) => {
    setError('');
    try {
      await actividadesApi.setBano({ pacienteId, diaSemana });
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  const toggleBano = (pacienteId, diaSemana) => {
    const exists = data?.todos?.some((b) => b.pacienteId === pacienteId && b.diaSemana === diaSemana);
    handleSetBano(pacienteId, diaSemana);
  };

  if (loading) return <p className={styles.status}>Cargando…</p>;

  const diaSemanaHoy = data?.diaSemanaHoy ?? (new Date().getDay() === 0 ? 7 : new Date().getDay());
  const diaNombreHoy = data?.diaNombreHoy || '';

  return (
    <div className={styles.page}>
      <h1>Actividades</h1>
      <p className={styles.subtitle}>
        Baño semanal. {isRaa ? 'Asigna qué residente tiene baño cada día. El OSS solo visualiza.' : 'Vista de la semana completa (solo lectura).'}
      </p>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.card}>
        <h2>Baño semanal — Semana completa</h2>
        {!isRaa && (
          <p className={styles.help}>Hoy: <strong>{diaNombreHoy}</strong>. Solo visualización.</p>
        )}
        {isRaa && (
          <p className={styles.help}>Marca en qué día tiene baño cada residente. Se mantiene hasta que lo modifiques. Hoy: <strong>{diaNombreHoy}</strong>.</p>
        )}
        <div className={styles.gridDias}>
          {[1, 2, 3, 4, 5, 6, 7].map((dia) => (
            <div
              key={dia}
              className={`${styles.colDia} ${dia === diaSemanaHoy ? styles.colDiaHoy : ''}`}
            >
              <h3>
                {DIAS[dia]}
                {dia === diaSemanaHoy && <span className={styles.badgeHoy}>Hoy</span>}
              </h3>
              <ul className={styles.lista}>
                {(data?.porDia?.[dia] || []).map((p) => (
                  <li key={p.id}>
                    {[p.nombre, p.apellidos].filter(Boolean).join(' ')}
                    {isRaa && (
                      <button
                        type="button"
                        className={styles.btnQuitar}
                        onClick={() => toggleBano(p.id, dia)}
                        title="Quitar"
                      >
                        ×
                      </button>
                    )}
                  </li>
                ))}
              </ul>
              {isRaa && (
                <select
                  className={styles.select}
                  value=""
                  onChange={(e) => {
                    const id = e.target.value;
                    if (id) {
                      toggleBano(id, dia);
                      e.target.value = '';
                    }
                  }}
                >
                  <option value="">+ Añadir residente</option>
                  {pacientes
                    .filter((p) => !(data?.porDia?.[dia] || []).some((b) => b.id === p.id))
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {[p.nombre, p.apellidos].filter(Boolean).join(' ')}
                      </option>
                    ))}
                </select>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
