import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
    if (!user) return;
    const allowed = ['ADMINISTRADOR', 'RAA', 'RAS', 'RECEPCIONISTA', 'OSS', 'FISIOTERAPEUTA'];
    if (!allowed.includes(user.rol)) return;
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
          {stats.citasRegistradas?.length > 0 && (
            <div className="card" style={{ marginTop: '1rem' }}>
              <h3 className={styles.cardTitle}>Citas registradas (recepcionista)</h3>
              <p className={styles.cardText}>Visitas de familiares y amigos agendadas.</p>
              <div className={styles.citasList}>
                {stats.citasRegistradas.map((c) => (
                  <div key={c.id} className={styles.citaCard}>
                    <div className={styles.citaPaciente}>
                      {[c.paciente?.nombre, c.paciente?.apellidos].filter(Boolean).join(' ')}
                    </div>
                    <div className={styles.citaVisitante}>
                      {[c.visitante?.nombre, c.visitante?.apellidos].filter(Boolean).join(' ')}
                      {c.visitante?.relacionConPaciente && (
                        <span className={styles.citaRelacion}> · {c.visitante.relacionConPaciente}</span>
                      )}
                    </div>
                    <div className={styles.citaHora}>
                      {new Date(c.fechaHora).toLocaleString('es', { dateStyle: 'short', timeStyle: 'short' })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {stats.citasRegistradas?.length === 0 && (
            <div className="card" style={{ marginTop: '1rem' }}>
              <h3 className={styles.cardTitle}>Citas registradas (recepcionista)</h3>
              <p className={styles.empty}>No hay citas agendadas.</p>
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
      {user?.rol === 'OSS' && (
        <div className="card" style={{ marginTop: '1.5rem' }}>
          <h3 className={styles.cardTitle}>Acceso rápido</h3>
          <p className={styles.cardText}>
            <Link to="/mis-turnos">Mis turnos</Link> · <Link to="/registro-diario">Registro diario</Link> · <Link to="/actividades">Actividades</Link> · <Link to="/pacientes">Residentes</Link> · <Link to="/diario-unificado">Diario unificado</Link>
          </p>
        </div>
      )}
      {user?.rol === 'FISIOTERAPEUTA' && stats && (
        <>
          <div className={styles.terapiasGrid}>
            <div className="card">
              <h3 className={styles.cardTitle}>Terapias pendientes</h3>
              <p className={styles.cardText}>Sin marcar como efectuadas en el módulo Terapia.</p>
              {stats.terapiasPendientes?.length > 0 ? (
                <div className={styles.terapiasList}>
                  {stats.terapiasPendientes.map((t) => (
                    <div key={t.id} className={styles.terapiaCard} data-estado="pendiente">
                      <div className={styles.terapiaPaciente}>
                        {[t.paciente?.nombre, t.paciente?.apellidos].filter(Boolean).join(' ')}
                      </div>
                      <div className={styles.terapiaNombre}>{t.nombreTerapia}</div>
                      {t.descripcion && <div className={styles.terapiaDesc}>{t.descripcion}</div>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className={styles.empty}>No hay terapias pendientes.</p>
              )}
            </div>
            <div className="card">
              <h3 className={styles.cardTitle}>Terapias efectuadas</h3>
              <p className={styles.cardText}>Marcadas con check en el módulo Terapia.</p>
              {stats.terapiasEfectuadas?.length > 0 ? (
                <div className={styles.terapiasList}>
                  {stats.terapiasEfectuadas.map((t) => (
                    <div key={t.id} className={styles.terapiaCard} data-estado="efectuada">
                      <div className={styles.terapiaPaciente}>
                        {[t.paciente?.nombre, t.paciente?.apellidos].filter(Boolean).join(' ')}
                      </div>
                      <div className={styles.terapiaNombre}>{t.nombreTerapia}</div>
                      {t.descripcion && <div className={styles.terapiaDesc}>{t.descripcion}</div>}
                      {t.efectuadoAt && (
                        <div className={styles.terapiaFecha}>
                          Efectuada: {new Date(t.efectuadoAt).toLocaleString('es', { dateStyle: 'short', timeStyle: 'short' })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className={styles.empty}>No hay terapias efectuadas.</p>
              )}
            </div>
          </div>
          <div className="card" style={{ marginTop: '1rem' }}>
            <p className={styles.cardText}>
              <Link to="/terapias">Ir al módulo Terapia</Link> para añadir registros o marcar como efectuadas.
            </p>
          </div>
        </>
      )}
      {user?.rol === 'RECEPCIONISTA' && stats && (
        <div className="card" style={{ marginTop: '1.5rem' }}>
          <h3 className={styles.cardTitle}>Citas agendadas</h3>
          <p className={styles.cardText}>Visitas de familiares y amigos a residentes.</p>
          {stats.citasAgendadas?.length > 0 ? (
            <div className={styles.citasList}>
              {stats.citasAgendadas.map((c) => (
                <div key={c.id} className={styles.citaCard}>
                  <div className={styles.citaPaciente}>
                    {[c.paciente?.nombre, c.paciente?.apellidos].filter(Boolean).join(' ')}
                  </div>
                  <div className={styles.citaVisitante}>
                    {[c.visitante?.nombre, c.visitante?.apellidos].filter(Boolean).join(' ')}
                    {c.visitante?.relacionConPaciente && (
                      <span className={styles.citaRelacion}> · {c.visitante.relacionConPaciente}</span>
                    )}
                  </div>
                  <div className={styles.citaHora}>
                    {new Date(c.fechaHora).toLocaleString('es', { dateStyle: 'short', timeStyle: 'short' })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.empty}>No hay citas agendadas.</p>
          )}
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
