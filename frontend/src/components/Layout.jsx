import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLE_LABELS } from '../utils/roles';
import styles from './Layout.module.css';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.rol === 'ADMINISTRADOR';

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
            Inicio
          </NavLink>
          {isAdmin && (
            <NavLink to="/usuarios" className={({ isActive }) => (isActive ? styles.navActive : '')}>
              Usuarios
            </NavLink>
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
