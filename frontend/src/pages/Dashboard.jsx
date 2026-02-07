import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ROLE_LABELS } from '../utils/roles';
import { dashboardApi, solicitudesInsumoApi } from '../api/client';
import styles from './Dashboard.module.css';

const ESTADO_COLOR = { PENDIENTE: 'amarillo', RECIBIDA: 'verde', PEDIDO_LISTO: 'azul', COMPLETADA: 'gris' };
const ESTADO_LABEL = { PENDIENTE: 'Pendiente', RECIBIDA: 'Recibida', PEDIDO_LISTO: 'Pedido listo', COMPLETADA: 'Completada' };

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!user || (user.rol !== 'ADMINISTRADOR' && user.rol !== 'RAA' && user.rol !== 'RAS')) return;
    dashboardApi.get().then((res) => setStats(res.data)).catch(() => setStats(null));
  }, [user?.rol, user]);

  const handleCambiarEstado = async (id, nuevoEstado) => {
    try {
      await solicitudesInsumoApi.updateEstado(id, nuevoEstado);
      const res = await dashboardApi.get();
      setStats(res.data);
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div className={styles.dashboard}>
      <h1 className={styles.welcome}>Bienvenido, {user?.nombre}</h1>
      <p className={styles.rol}>Rol: {ROLE_LABELS[user?.rol] || user?.rol}</p>
      {user?.rol === 'ADMINISTRADOR' && stats && (
        <>
          <div className={styles.cards}>
            <div className="card">
              <h3 className={styles.cardTitle}>Profesionales contratados</h3>
              <p className={styles.cardNumber}>{stats.profesionalesContratados}</p>
            </div>
            <div className="card">
              <h3 className={styles.cardTitle}>Pacientes registrados</h3>
              <p className={styles.cardNumber}>{stats.pacientesRegistrados}</p>
            </div>
          </div>
          {stats.solicitudesInsumo?.length > 0 && (
            <div className="card" style={{ marginTop: '1rem' }}>
              <h3 className={styles.cardTitle}>Solicitudes de insumo</h3>
              <div className={styles.solicitudesList}>
                {stats.solicitudesInsumo.map((s) => (
                  <div key={s.id} className={styles.solicitudCard} data-estado={s.estado}>
                    <div className={styles.solicitudDesc}>{s.descripcion}</div>
                    <div className={styles.solicitudMeta}>
                      {s.solicitante && (
                        <>
                          {[s.solicitante.nombre, s.solicitante.apellidos].filter(Boolean).join(' ')}
                          {s.solicitante.rol && <span className={styles.badgeRol}> · {s.solicitante.rol === 'RAA' ? 'RAA' : 'RAS'}</span>}
                        </>
                      )} · {new Date(s.createdAt).toLocaleDateString('es')}
                    </div>
                    <div className={styles.solicitudActions}>
                      <span className={styles.badgeEstado} data-estado={s.estado}>{ESTADO_LABEL[s.estado]}</span>
                      {s.estado === 'PENDIENTE' && (
                        <button type="button" className="btn btn-secondary" onClick={() => handleCambiarEstado(s.id, 'RECIBIDA')}>Marcar recibida</button>
                      )}
                      {s.estado === 'RECIBIDA' && (
                        <button type="button" className="btn btn-primary" onClick={() => handleCambiarEstado(s.id, 'PEDIDO_LISTO')}>Pedido listo</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
      {user?.rol === 'RAA' && stats && (
        <div className={styles.cards}>
          <div className="card">
            <h3 className={styles.cardTitle}>OSS en tu equipo</h3>
            <p className={styles.cardNumber}>{stats.ossEnEquipo ?? 0}</p>
          </div>
        </div>
      )}
      {user?.rol === 'RAS' && stats && (
        <div className={styles.cards}>
          <div className="card">
            <h3 className={styles.cardTitle}>Enfermeras en tu equipo</h3>
            <p className={styles.cardNumber}>{stats.enfermerasEnEquipo ?? 0}</p>
          </div>
        </div>
      )}
      <div className="card" style={{ marginTop: '1.5rem', maxWidth: '480px' }}>
        <h2 className={styles.cardTitle}>Sistema CRACare</h2>
        <p className={styles.cardText}>
          Casa de reposo — Gestión de personal y logística. Utiliza el menú superior para navegar.
        </p>
      </div>
    </div>
  );
}
