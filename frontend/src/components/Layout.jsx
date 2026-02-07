import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLE_LABELS } from '../utils/roles';
import styles from './Layout.module.css';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.rol === 'ADMINISTRADOR';
  const isRaa = user?.rol === 'RAA';
  const isRas = user?.rol === 'RAS';
  const isMedico = user?.rol === 'MEDICO';
  const isEnfermera = user?.rol === 'ENFERMERA';
  const isRecepcionista = user?.rol === 'RECEPCIONISTA';
  const isOss = user?.rol === 'OSS';
  const isFisioterapeuta = user?.rol === 'FISIOTERAPEUTA';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <span className={styles.logo}>CRACare</span>
          <span className={styles.tagline}>Casa de Reposo</span>
        </div>
        <nav className={styles.nav}>
          <NavLink to="/" end className={({ isActive }) => (isActive ? styles.navActive : '')}>
            Dashboard
          </NavLink>
          <NavLink to="/consignas" className={({ isActive }) => (isActive ? styles.navActive : '')}>
            Consignas
          </NavLink>
          {(isAdmin || isRaa || isRas) && (
            <NavLink to="/inventario" className={({ isActive }) => (isActive ? styles.navActive : '')}>
              Inventario
            </NavLink>
          )}
          {isRaa && (
            <NavLink to="/horarios" className={({ isActive }) => (isActive ? styles.navActive : '')}>
              Horarios
            </NavLink>
          )}
          {isRas && (
            <NavLink to="/horarios-enfermera" className={({ isActive }) => (isActive ? styles.navActive : '')}>
              Horarios enfermera
            </NavLink>
          )}
          <NavLink to="/pacientes" className={({ isActive }) => (isActive ? styles.navActive : '')}>
            Pacientes
          </NavLink>
          {isOss && (
            <>
              <NavLink to="/mis-turnos" className={({ isActive }) => (isActive ? styles.navActive : '')}>
                Mis turnos
              </NavLink>
              <NavLink to="/registro-diario" className={({ isActive }) => (isActive ? styles.navActive : '')}>
                Registro diario
              </NavLink>
              <NavLink to="/actividades" className={({ isActive }) => (isActive ? styles.navActive : '')}>
                Actividades
              </NavLink>
            </>
          )}
          {(isRaa && !isOss) && (
            <>
              <NavLink to="/registro-diario" className={({ isActive }) => (isActive ? styles.navActive : '')}>
                Registro diario
              </NavLink>
              <NavLink to="/actividades" className={({ isActive }) => (isActive ? styles.navActive : '')}>
                Actividades
              </NavLink>
            </>
          )}
          {(isAdmin || isRas || isMedico || isEnfermera) && (
            <NavLink to="/medicaciones" className={({ isActive }) => (isActive ? styles.navActive : '')}>
              Medicaciones
            </NavLink>
          )}
          {isFisioterapeuta && (
            <NavLink to="/terapias" className={({ isActive }) => (isActive ? styles.navActive : '')}>
              Terapia
            </NavLink>
          )}
          <NavLink to="/diario-unificado" className={({ isActive }) => (isActive ? styles.navActive : '')}>
            Diario unificado
          </NavLink>
          {(isAdmin || isRas || isMedico || isEnfermera) && (
            <NavLink to="/diario-medicaciones" className={({ isActive }) => (isActive ? styles.navActive : '')}>
              Diario medicaciones
            </NavLink>
          )}
          {isRecepcionista && (
            <>
              <NavLink to="/citas" className={({ isActive }) => (isActive ? styles.navActive : '')}>
                Citas
              </NavLink>
              <NavLink to="/materiales" className={({ isActive }) => (isActive ? styles.navActive : '')}>
                Materiales
              </NavLink>
            </>
          )}
          {isAdmin && (
            <>
              <NavLink to="/contratos" className={({ isActive }) => (isActive ? styles.navActive : '')}>
                Contratos
              </NavLink>
              <NavLink to="/reportes" className={({ isActive }) => (isActive ? styles.navActive : '')}>
                Reportes
              </NavLink>
              <NavLink to="/usuarios" className={({ isActive }) => (isActive ? styles.navActive : '')}>
                Usuarios
              </NavLink>
            </>
          )}
        </nav>
        <div className={styles.user}>
          <span className={styles.userName}>{user?.nombre}</span>
          <span className={styles.userRol}>{ROLE_LABELS[user?.rol] || user?.rol}</span>
          <button type="button" className="btn btn-secondary" onClick={handleLogout}>
            Salir
          </button>
        </div>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
