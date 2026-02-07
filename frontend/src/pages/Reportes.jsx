import { useState, useEffect } from 'react';
import { reportesApi, movimientosApi } from '../api/client';
import styles from './Reportes.module.css';

const API_BASE = import.meta.env.VITE_API_URL || '';
const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

function getToken() {
  return localStorage.getItem('cracare_token');
}

export default function Reportes() {
  const [anio, setAnio] = useState(new Date().getFullYear());
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    reportesApi.mensual(anio, mes).then((r) => setData(r.data)).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }, [anio, mes]);

  const [showNew, setShowNew] = useState(false);
  const [newMov, setNewMov] = useState({ fecha: new Date().toISOString().slice(0, 10), tipo: 'INGRESO', concepto: '', monto: '', categoria: '' });
  const [saving, setSaving] = useState(false);

  const reload = () => {
    setLoading(true);
    reportesApi.mensual(anio, mes).then((r) => setData(r.data)).catch((e) => setError(e.message)).finally(() => setLoading(false));
  };

  const handleNewMovimiento = async (e) => {
    e.preventDefault();
    if (!newMov.concepto || newMov.monto === '') return;
    setSaving(true);
    try {
      await movimientosApi.create({ ...newMov, monto: Number(newMov.monto) });
      setShowNew(false);
      setNewMov({ fecha: new Date().toISOString().slice(0, 10), tipo: 'INGRESO', concepto: '', monto: '', categoria: '' });
      reload();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleExport = () => {
    const url = `${API_BASE}/api/reportes/export?anio=${anio}&mes=${mes}`;
    const token = getToken();
    fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then((res) => res.blob())
      .then((blob) => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `reporte_${anio}_${String(mes).padStart(2, '0')}.csv`;
        a.click();
        URL.revokeObjectURL(a.href);
      })
      .catch(() => alert('Error al descargar'));
  };

  return (
    <div className={styles.page}>
      <h1>Reportes</h1>
      <p className={styles.subtitle}>Gastos e ingresos mensuales</p>
      <div className={styles.filters}>
        <div className="form-group" style={{ marginBottom: 0, marginRight: '1rem' }}>
          <label>Año</label>
          <select value={anio} onChange={(e) => setAnio(Number(e.target.value))}>
            {[anio - 2, anio - 1, anio, anio + 1].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        <div className="form-group" style={{ marginBottom: 0, marginRight: '1rem' }}>
          <label>Mes</label>
          <select value={mes} onChange={(e) => setMes(Number(e.target.value))}>
            {MESES.map((m, i) => (
              <option key={i} value={i + 1}>{m}</option>
            ))}
          </select>
        </div>
        <button type="button" className="btn btn-secondary" onClick={() => setShowNew(true)} style={{ alignSelf: 'flex-end' }}>
          Nuevo movimiento
        </button>
        <button type="button" className="btn btn-primary" onClick={handleExport} style={{ alignSelf: 'flex-end' }}>
          Exportar CSV
        </button>
      </div>
      {showNew && (
        <div className={styles.modal}>
          <div className="card" style={{ maxWidth: '400px' }}>
            <h3>Nuevo movimiento</h3>
            <form onSubmit={handleNewMovimiento}>
              <div className="form-group">
                <label>Fecha *</label>
                <input type="date" value={newMov.fecha} onChange={(e) => setNewMov({ ...newMov, fecha: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Tipo *</label>
                <select value={newMov.tipo} onChange={(e) => setNewMov({ ...newMov, tipo: e.target.value })}>
                  <option value="INGRESO">Ingreso</option>
                  <option value="GASTO">Gasto</option>
                </select>
              </div>
              <div className="form-group">
                <label>Concepto *</label>
                <input value={newMov.concepto} onChange={(e) => setNewMov({ ...newMov, concepto: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Monto *</label>
                <input type="number" step="0.01" value={newMov.monto} onChange={(e) => setNewMov({ ...newMov, monto: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Categoría</label>
                <input value={newMov.categoria} onChange={(e) => setNewMov({ ...newMov, categoria: e.target.value })} />
              </div>
              <button type="submit" className="btn btn-primary" disabled={saving}>Guardar</button>
              <button type="button" className="btn btn-secondary" style={{ marginLeft: '0.5rem' }} onClick={() => setShowNew(false)}>Cancelar</button>
            </form>
          </div>
        </div>
      )}
      {error && <p className="error-msg">{error}</p>}
      {loading && <p className={styles.status}>Cargando…</p>}
      {!loading && data && (
        <>
          <div className={styles.totales}>
            <div className="card">
              <span>Total ingresos</span>
              <strong>{Number(data.totalIngresos).toFixed(2)} €</strong>
            </div>
            <div className="card">
              <span>Total gastos</span>
              <strong>{Number(data.totalGastos).toFixed(2)} €</strong>
            </div>
            <div className="card">
              <span>Balance</span>
              <strong className={data.balance >= 0 ? styles.positivo : styles.negativo}>{Number(data.balance).toFixed(2)} €</strong>
            </div>
          </div>
          <div className="card table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Tipo</th>
                  <th>Concepto</th>
                  <th>Categoría</th>
                  <th>Monto</th>
                </tr>
              </thead>
              <tbody>
                {data.movimientos.length === 0 && (
                  <tr><td colSpan={5} className={styles.empty}>No hay movimientos este mes.</td></tr>
                )}
                {data.movimientos.map((m) => (
                  <tr key={m.id}>
                    <td>{new Date(m.fecha).toLocaleDateString('es')}</td>
                    <td>{m.tipo}</td>
                    <td>{m.concepto}</td>
                    <td>{m.categoria || '—'}</td>
                    <td className={m.tipo === 'INGRESO' ? styles.positivo : styles.negativo}>{Number(m.monto).toFixed(2)} €</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
