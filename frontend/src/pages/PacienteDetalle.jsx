import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  pacientesApi,
  medicamentosPacienteApi,
  tratamientosPacienteApi,
  consignasPersonalesApi,
} from '../api/client';
import { ROLE_LABELS } from '../utils/roles';
import styles from './PacienteDetalle.module.css';

const IconoPersona = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const API_BASE = import.meta.env.VITE_API_URL || '';

export default function PacienteDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isRas = user?.rol === 'RAS';
  const canEditMedTrat = ['ADMINISTRADOR', 'RAS', 'MEDICO', 'ENFERMERA'].includes(user?.rol);
  const canEditPaciente = user?.rol === 'ADMINISTRADOR' || user?.rol === 'RAA';
  const canUploadHoja = user?.rol === 'ADMINISTRADOR' || user?.rol === 'RAA';

  const [paciente, setPaciente] = useState(null);
  const [medicamentos, setMedicamentos] = useState([]);
  const [tratamientos, setTratamientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [verPdf, setVerPdf] = useState(null);
  const [formMed, setFormMed] = useState(null);
  const [formTrat, setFormTrat] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadingHoja, setUploadingHoja] = useState(false);
  const [consignaPersonalOpen, setConsignaPersonalOpen] = useState(false);
  const [consignasPersonalesList, setConsignasPersonalesList] = useState([]);
  const [nuevaConsignaContenido, setNuevaConsignaContenido] = useState('');
  const [savingConsigna, setSavingConsigna] = useState(false);

  const loadConsignasPersonales = () => {
    if (!id) return;
    consignasPersonalesApi.list(id).then((r) => setConsignasPersonalesList(r.data || [])).catch(() => setConsignasPersonalesList([]));
  };

  const openConsignaPersonal = () => {
    setConsignaPersonalOpen(true);
    setNuevaConsignaContenido('');
    loadConsignasPersonales();
  };

  const handleNuevaConsigna = async (e) => {
    e.preventDefault();
    if (!nuevaConsignaContenido.trim()) return;
    setSavingConsigna(true);
    try {
      await consignasPersonalesApi.create(id, { contenido: nuevaConsignaContenido.trim() });
      setNuevaConsignaContenido('');
      loadConsignasPersonales();
    } catch (err) {
      alert(err.message);
    } finally {
      setSavingConsigna(false);
    }
  };

  const loadPaciente = () => {
    if (!id) return;
    pacientesApi
      .get(id)
      .then((r) => {
        setPaciente(r.data);
        setMedicamentos(r.data?.medicamentos ?? []);
        setTratamientos(r.data?.tratamientos ?? []);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(loadPaciente, [id]);

  const pdfUrl = paciente?.hojaClinicaUrl ? `${API_BASE}${paciente.hojaClinicaUrl}` : null;

  const handleHojaFile = (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.name.toLowerCase().endsWith('.pdf')) {
      alert('Selecciona un archivo PDF');
      return;
    }
    setUploadingHoja(true);
    pacientesApi
      .uploadHojaClinica(id, file)
      .then((r) => setPaciente((p) => (p ? { ...p, hojaClinicaUrl: r.data?.hojaClinicaUrl ?? p.hojaClinicaUrl } : null)))
      .catch((err) => alert(err.message || 'Error al subir'))
      .finally(() => setUploadingHoja(false));
  };

  const toFechaHora = (dateStr, timeStr) => {
    if (!dateStr) return null;
    if (!timeStr) return new Date(dateStr + 'T12:00:00').toISOString();
    return new Date(dateStr + 'T' + timeStr + ':00').toISOString();
  };
  const fromFechaHora = (iso) => {
    if (!iso) return { fecha: '', hora: '' };
    const d = new Date(iso);
    const fecha = d.toISOString().slice(0, 10);
    const hora = d.toTimeString().slice(0, 5);
    return { fecha, hora };
  };
  const addMedicamento = () => setFormMed({ medicamento: '', dosis: '', frecuencia: '', indicaciones: '', fecha: '', hora: '' });
  const editMedicamento = (m) => setFormMed({
    ...m,
    ...fromFechaHora(m.fechaHora),
  });
  const saveMedicamento = async (e) => {
    e.preventDefault();
    if (!formMed?.medicamento?.trim()) return;
    setSaving(true);
    const fechaHora = toFechaHora(formMed.fecha, formMed.hora);
    try {
      if (formMed.id) {
        await medicamentosPacienteApi.update(formMed.id, {
          medicamento: formMed.medicamento,
          dosis: formMed.dosis,
          frecuencia: formMed.frecuencia,
          indicaciones: formMed.indicaciones,
          fechaHora: fechaHora || undefined,
        });
      } else {
        await medicamentosPacienteApi.create(id, {
          medicamento: formMed.medicamento,
          dosis: formMed.dosis,
          frecuencia: formMed.frecuencia,
          indicaciones: formMed.indicaciones,
          fechaHora: fechaHora || undefined,
        });
      }
      setFormMed(null);
      loadPaciente();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteMedicamento = async (medId) => {
    if (!window.confirm('¿Eliminar este medicamento?')) return;
    try {
      await medicamentosPacienteApi.delete(medId);
      loadPaciente();
    } catch (err) {
      alert(err.message);
    }
  };

  const addTratamiento = () => setFormTrat({ descripcion: '' });
  const editTratamiento = (t) => setFormTrat({ id: t.id, descripcion: t.descripcion || '' });
  const saveTratamiento = async (e) => {
    e.preventDefault();
    if (!formTrat?.descripcion?.trim()) return;
    setSaving(true);
    try {
      if (formTrat.id) {
        await tratamientosPacienteApi.update(formTrat.id, { descripcion: formTrat.descripcion });
      } else {
        await tratamientosPacienteApi.create(id, { descripcion: formTrat.descripcion });
      }
      setFormTrat(null);
      loadPaciente();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteTratamiento = async (tratId) => {
    if (!window.confirm('¿Eliminar este tratamiento?')) return;
    try {
      await tratamientosPacienteApi.delete(tratId);
      loadPaciente();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <p className={styles.status}>Cargando…</p>;
  if (error || !paciente) return <p className="error-msg">{error || 'Paciente no encontrado'}</p>;

  return (
    <div className={styles.page}>
      <div className={styles.top}>
        <h1>Paciente: {[paciente.nombre, paciente.apellidos].filter(Boolean).join(' ')}</h1>
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.iconoConsignaPersonal}
            onClick={openConsignaPersonal}
            title="Consignas personales del residente (incidencias diarias)"
            aria-label="Consignas personales"
          >
            <IconoPersona />
            <span className={styles.iconoConsignaLabel}>Consigna personal</span>
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/pacientes')}>
            Volver a lista
          </button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <h3>Datos del paciente</h3>
        <div className={styles.grid}>
          <div><strong>Nombre</strong> {[paciente.nombre, paciente.apellidos].filter(Boolean).join(' ')}</div>
          <div><strong>DNI/NIF</strong> {paciente.dniNif || '—'}</div>
          <div><strong>F. nacimiento</strong> {paciente.fechaNacimiento ? new Date(paciente.fechaNacimiento).toLocaleDateString('es') : '—'}</div>
          <div><strong>F. ingreso</strong> {paciente.fechaIngreso ? new Date(paciente.fechaIngreso).toLocaleDateString('es') : '—'}</div>
          <div><strong>Alergias</strong> {paciente.alergias || '—'}</div>
          <div><strong>Patologías</strong> {paciente.patologias || '—'}</div>
          <div><strong>Estado</strong> <span className={paciente.activo ? 'badge badge-active' : 'badge badge-inactive'}>{paciente.activo ? 'Activo' : 'Inactivo'}</span></div>
        </div>
        <div className={styles.hojaSection}>
          <strong>Hoja clínica</strong>
          {pdfUrl ? (
            <>
              <button type="button" className="btn btn-primary" style={{ marginLeft: '0.5rem' }} onClick={() => setVerPdf(pdfUrl)}>Ver PDF</button>
              {canUploadHoja && (
                <>
                  <input type="file" accept=".pdf,application/pdf" style={{ display: 'none' }} id="hoja-detalle" onChange={handleHojaFile} />
                  <label htmlFor="hoja-detalle" className="btn btn-secondary" style={{ marginLeft: '0.5rem', cursor: 'pointer' }}>
                    {uploadingHoja ? 'Subiendo…' : 'Cambiar PDF'}
                  </label>
                </>
              )}
            </>
          ) : (
            <>
              <span style={{ marginLeft: '0.5rem', color: 'var(--text-muted)' }}>Sin hoja clínica</span>
              {canUploadHoja && (
                <>
                  <input type="file" accept=".pdf,application/pdf" style={{ display: 'none' }} id="hoja-detalle" onChange={handleHojaFile} />
                  <label htmlFor="hoja-detalle" className="btn btn-primary" style={{ marginLeft: '0.5rem', cursor: 'pointer' }}>Subir PDF</label>
                </>
              )}
            </>
          )}
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <h3>Medicamentos</h3>
        {medicamentos.length === 0 && <p className={styles.empty}>No hay medicamentos asignados.</p>}
        <ul className={styles.lista}>
          {medicamentos.map((m) => (
            <li key={m.id}>
              <span><strong>{m.medicamento}</strong> {m.dosis && ` · ${m.dosis}`} {m.frecuencia && ` · ${m.frecuencia}`}</span>
              {(m.fechaHora || m.efectuado) && (
                <span className={styles.medMeta}>
                  {m.fechaHora && new Date(m.fechaHora).toLocaleString('es', { dateStyle: 'short', timeStyle: 'short' })}
                  {m.efectuado && <span className="badge badge-active" style={{ marginLeft: '0.5rem' }}>Efectuado</span>}
                </span>
              )}
              {m.indicaciones && <div className={styles.indicaciones}>{m.indicaciones}</div>}
              {canEditMedTrat && (
                <span>
                  <button type="button" className="btn btn-secondary" style={{ marginLeft: '0.5rem', padding: '0.25rem 0.5rem', fontSize: '0.85rem' }} onClick={() => editMedicamento(m)}>Editar</button>
                  <button type="button" className="btn btn-danger" style={{ marginLeft: '0.25rem', padding: '0.25rem 0.5rem', fontSize: '0.85rem' }} onClick={() => deleteMedicamento(m.id)}>Eliminar</button>
                </span>
              )}
            </li>
          ))}
        </ul>
        {canEditMedTrat && (
          <>
            {!formMed ? (
              <button type="button" className="btn btn-primary" onClick={addMedicamento}>Añadir medicamento</button>
            ) : (
              <form onSubmit={saveMedicamento} className={styles.formMedicamento}>
                <input value={formMed.medicamento} onChange={(e) => setFormMed({ ...formMed, medicamento: e.target.value })} placeholder="Medicamento *" required />
                <input value={formMed.dosis || ''} onChange={(e) => setFormMed({ ...formMed, dosis: e.target.value })} placeholder="Dosis" />
                <input value={formMed.frecuencia || ''} onChange={(e) => setFormMed({ ...formMed, frecuencia: e.target.value })} placeholder="Frecuencia" />
                <input value={formMed.indicaciones || ''} onChange={(e) => setFormMed({ ...formMed, indicaciones: e.target.value })} placeholder="Indicaciones" />
                <span className={styles.fechaHoraRow}>
                  <input type="date" value={formMed.fecha || ''} onChange={(e) => setFormMed({ ...formMed, fecha: e.target.value })} placeholder="Fecha" />
                  <input type="time" value={formMed.hora || ''} onChange={(e) => setFormMed({ ...formMed, hora: e.target.value })} placeholder="Hora" />
                </span>
                <button type="submit" className="btn btn-primary" disabled={saving}>Guardar</button>
                <button type="button" className="btn btn-secondary" onClick={() => setFormMed(null)}>Cancelar</button>
              </form>
            )}
          </>
        )}
      </div>

      <div className="card">
        <h3>Tratamientos</h3>
        {tratamientos.length === 0 && <p className={styles.empty}>No hay tratamientos asignados.</p>}
        <ul className={styles.lista}>
          {tratamientos.map((t) => (
            <li key={t.id}>
              <span>{t.descripcion}</span>
              {canEditMedTrat && (
                <span>
                  <button type="button" className="btn btn-secondary" style={{ marginLeft: '0.5rem', padding: '0.25rem 0.5rem', fontSize: '0.85rem' }} onClick={() => editTratamiento(t)}>Editar</button>
                  <button type="button" className="btn btn-danger" style={{ marginLeft: '0.25rem', padding: '0.25rem 0.5rem', fontSize: '0.85rem' }} onClick={() => deleteTratamiento(t.id)}>Eliminar</button>
                </span>
              )}
            </li>
          ))}
        </ul>
        {canEditMedTrat && (
          <>
            {!formTrat ? (
              <button type="button" className="btn btn-primary" onClick={addTratamiento}>Añadir tratamiento</button>
            ) : (
              <form onSubmit={saveTratamiento} className={styles.formInline}>
                <input value={formTrat.descripcion || ''} onChange={(e) => setFormTrat({ ...formTrat, descripcion: e.target.value })} placeholder="Descripción *" required style={{ flex: 1 }} />
                <button type="submit" className="btn btn-primary" disabled={saving}>Guardar</button>
                <button type="button" className="btn btn-secondary" onClick={() => setFormTrat(null)}>Cancelar</button>
              </form>
            )}
          </>
        )}
      </div>

      {consignaPersonalOpen && (
        <div className={styles.modal} onClick={() => setConsignaPersonalOpen(false)}>
          <div className={styles.modalConsignaPersonal} onClick={(e) => e.stopPropagation()}>
            <h3>Consignas personales del residente</h3>
            <p className={styles.consignaSubtitle}>Incidencias diarias. Pueden escribir todos los roles.</p>
            <div className={styles.consignasList}>
              {consignasPersonalesList.length === 0 && <p className={styles.empty}>Aún no hay consignas personales.</p>}
              {consignasPersonalesList.map((c) => (
                <div key={c.id} className={styles.consignaCard}>
                  <div className={styles.consignaContenido}>{c.contenido}</div>
                  <div className={styles.consignaMeta}>
                    {c.autor && [c.autor.nombre, c.autor.apellidos].filter(Boolean).join(' ')}
                    {c.autor?.rol && <span> · {ROLE_LABELS[c.autor.rol] || c.autor.rol}</span>}
                    {' · '}{new Date(c.createdAt).toLocaleString('es')}
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={handleNuevaConsigna} className={styles.formNuevaConsigna}>
              <textarea
                value={nuevaConsignaContenido}
                onChange={(e) => setNuevaConsignaContenido(e.target.value)}
                placeholder="Escribir incidencia o nota..."
                rows={3}
                required
              />
              <button type="submit" className="btn btn-primary" disabled={savingConsigna}>Añadir consigna</button>
            </form>
            <button type="button" className="btn btn-secondary" style={{ marginTop: '1rem' }} onClick={() => setConsignaPersonalOpen(false)}>Cerrar</button>
          </div>
        </div>
      )}

      {verPdf && (
        <div className={styles.modal} onClick={() => setVerPdf(null)}>
          <div className={styles.pdfViewer} onClick={(e) => e.stopPropagation()}>
            <iframe title="Hoja clínica" src={verPdf} style={{ width: '90vw', height: '90vh', border: 'none' }} />
            <button type="button" className="btn btn-secondary" style={{ marginTop: '0.5rem' }} onClick={() => setVerPdf(null)}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
}
