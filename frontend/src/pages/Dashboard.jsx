import { useAuth } from '../context/AuthContext';
import { ROLE_LABELS } from '../utils/roles';
import styles from './Dashboard.module.css';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className={styles.dashboard}>
      <h1 className={styles.welcome}>Bienvenido, {user?.nombre}</h1>
      <p className={styles.rol}>Rol: {ROLE_LABELS[user?.rol] || user?.rol}</p>
      <div className="card" style={{ marginTop: '1.5rem', maxWidth: '480px' }}>
        <h2 className={styles.cardTitle}>Sistema CRACare</h2>
        <p className={styles.cardText}>
          Casa de reposo — Gestión de personal y logística. Utiliza el menú superior para navegar.
        </p>
      </div>
    </div>
  );
}
