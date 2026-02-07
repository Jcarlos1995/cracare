import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { pacientesApi } from '../api/client';
import styles from './Pacientes.module.css';

const API_BASE = import.meta.env.VITE_API_URL || '';

export default function Pacientes() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isRas = user?.rol === 'RAS';
  const isMedico = user?.rol === 'MEDICO';
  const isEnfermera = user?.rol === 'ENFERMERA';
  const isRasOrMedicoOrEnfermera = isRas || isMedico || isEnfermera;
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadingHoja, setUploadingHoja] = useState(null);
  const [verPdf, setVerPdf] = useState(null);
  const fileHojaRef = useRef(null);

  const load = () => {
    pacientesApi.list().then((r) => setList(r.data || [])).catch((e) => setError(e.message)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const openCreate = () => setForm({ nombre: '', apellidos: '', dniNif: '', fechaNacimiento: '', fechaIngreso: '', alergias: '', patologias: '', activo: true });
  const openEdit = (p) => setForm({
    ...p,
    fechaNacimiento: p.fechaNacimiento ? p.fechaNacimiento.slice(0, 10) : '',
    fechaIngreso: p.fechaIngreso ? p.fechaIngreso.slice(0, 10) : '',
    alergias: p.alergias ?? '',
    patologias: p.patologias ?? '',
  });
  const closeForm = () => setForm(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        nombre: form.nombre.trim(),
        apellidos: form.apellidos?.trim() || null,
        dniNif: form.dniNif?.trim() || null,
        fechaNacimiento: form.fechaNacimiento || null,
        fechaIngreso: form.fechaIngreso || null,
        alergias: form.alergias?.trim() || null,
        patologias: form.patologias?.trim() || null,
        activo: form.activo !== false,
      };
      if (form.id) await pacientesApi.update(form.id, payload);
      else await pacientesApi.create(payload);
      closeForm();
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const pdfHojaUrl = (p) => (p.hojaClinicaUrl ? `${API_BASE}${p.hojaClinicaUrl}` : null);

  const handleHojaFile = (pacienteId, e) => {
    const file = e.target.files?.[0];
    if (!file || !file.name.toLowerCase().endsWith('.pdf')) {
      alert('Selecciona un archivo PDF');
      return;
    }
    setUploadingHoja(pacienteId);
    pacientesApi.uploadHojaClinica(pacienteId, file)
      .then((res) => setList((prev) => prev.map((p) => (p.id === pacienteId ? res.data : p))))
      .catch((err) => alert(err.message || 'Error al subir'))
      .finally(() => {
        setUploadingHoja(null);
        if (fileHojaRef.current) fileHojaRef.current.value = '';
      });
  };

  const handleDelete = async (id, nombre) => {
    if (!window.confirm(`¿Eliminar paciente "${nombre}"?`)) return;
    try {
      await pacientesApi.delete(id);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <p className={styles.status}>Cargando pacientes…</p>;
  return (
    <div className={styles.page}>
      <div className={styles.top}>
        <h1>Pacientes</h1>
        {!isRasOrMedicoOrEnfermera && (
          <button type="button" className="btn btn-primary" onClick={openCreate}>
            Nuevo paciente
          </button>
        )}
      </div>
      {error && <p className="error-msg">{error}</p>}
      <div className="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>DNI/NIF</th>
              <th>F. nacimiento</th>
              <th>F. ingreso</th>
              <th>Alergias</th>
              <th>Patologías</th>
              <th>Hoja clínica</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {list.map((p) => (
              <tr key={p.id}>
                <td>{[p.nombre, p.apellidos].filter(Boolean).join(' ')}</td>
                <td>{p.dniNif || '—'}</td>
                <td>{p.fechaNacimiento ? new Date(p.fechaNacimiento).toLocaleDateString('es') : '—'}</td>
                <td>{p.fechaIngreso ? new Date(p.fechaIngreso).toLocaleDateString('es') : '—'}</td>
                <td className={styles.cellWrap}>{p.alergias || '—'}</td>
                <td className={styles.cellWrap}>{p.patologias || '—'}</td>
                <td>
                  {pdfHojaUrl(p) ? (
                    <button type="button" className="btn btn-secondary" style={{ marginRight: '0.5rem', padding: '0.4rem 0.75rem', fontSize: '0.9rem' }} onClick={() => setVerPdf(pdfHojaUrl(p))}>Ver PDF</button>
                  ) : null}
                  {!isRasOrMedicoOrEnfermera && (
                    <>
                      <input ref={fileHojaRef} type="file" accept=".pdf,application/pdf" style={{ display: 'none' }} id={`hoja-${p.id}`} onChange={(e) => handleHojaFile(p.id, e)} />
                      <label htmlFor={`hoja-${p.id}`} className="btn btn-primary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.9rem', cursor: 'pointer' }}>
                        {uploadingHoja === p.id ? 'Subiendo…' : pdfHojaUrl(p) ? 'Cambiar PDF' : 'Subir PDF'}
                      </label>
                    </>
                  )}
                </td>
                <td><span className={p.activo ? 'badge badge-active' : 'badge badge-inactive'}>{p.activo ? 'Activo' : 'Inactivo'}</span></td>
                <td>
                  {isRasOrMedicoOrEnfermera ? (
                    <button type="button" className="btn btn-primary" onClick={() => navigate(`/pacientes/${p.id}`)}>Ver</button>
                  ) : (
                    <>
                      <button type="button" className="btn btn-secondary" style={{ marginRight: '0.5rem' }} onClick={() => openEdit(p)}>Editar</button>
                      <button type="button" className="btn btn-secondary" style={{ marginRight: '0.5rem' }} onClick={() => navigate(`/pacientes/${p.id}`)}>Ver detalle</button>
                      <button type="button" className="btn btn-danger" onClick={() => handleDelete(p.id, p.nombre)}>Eliminar</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.length === 0 && <p className={styles.empty}>No hay pacientes.</p>}
      </div>
      {verPdf && (
        <div className={styles.modal} onClick={() => setVerPdf(null)}>
          <div className={styles.pdfViewer} onClick={(e) => e.stopPropagation()}>
            <iframe title="Hoja clínica" src={verPdf} style={{ width: '90vw', height: '90vh', border: 'none' }} />
            <button type="button" className="btn btn-secondary" style={{ marginTop: '0.5rem' }} onClick={() => setVerPdf(null)}>Cerrar</button>
          </div>
        </div>
      )}
      {form && (
        <div className={styles.modal}>
          <div className="card" style={{ maxWidth: '420px' }}>
            <h2>{form.id ? 'Editar paciente' : 'Nuevo paciente'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nombre *</label>
                <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Apellidos</label>
                <input value={form.apellidos || ''} onChange={(e) => setForm({ ...form, apellidos: e.target.value })} />
              </div>
              <div className="form-group">
                <label>DNI/NIF</label>
                <input value={form.dniNif || ''} onChange={(e) => setForm({ ...form, dniNif: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Fecha nacimiento</label>
                <input type="date" value={form.fechaNacimiento || ''} onChange={(e) => setForm({ ...form, fechaNacimiento: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Fecha ingreso</label>
                <input type="date" value={form.fechaIngreso || ''} onChange={(e) => setForm({ ...form, fechaIngreso: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Alergias</label>
                <textarea value={form.alergias || ''} onChange={(e) => setForm({ ...form, alergias: e.target.value })} rows={2} placeholder="Ej: Penicilina, látex..." />
              </div>
              <div className="form-group">
                <label>Patologías</label>
                <textarea value={form.patologias || ''} onChange={(e) => setForm({ ...form, patologias: e.target.value })} rows={2} placeholder="Ej: HTA, diabetes tipo 2..." />
              </div>
              {form.id && (
                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input type="checkbox" checked={form.activo} onChange={(e) => setForm({ ...form, activo: e.target.checked })} />
                    Activo
                  </label>
                </div>
              )}
              <button type="submit" className="btn btn-primary" disabled={saving}>Guardar</button>
              <button type="button" className="btn btn-secondary" style={{ marginLeft: '0.5rem' }} onClick={closeForm}>Cancelar</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
