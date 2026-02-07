import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { usersApi } from '../api/client';
import { ROLE_LABELS, ROLES, TURNOS } from '../utils/roles';
import styles from './UserForm.module.css';

const ROL_LIST = Object.entries(ROLE_LABELS).map(([value, label]) => ({ value, label }));

const emptyForm = {
  email: '',
  password: '',
  nombre: '',
  apellidos: '',
  dniNif: '',
  telefono: '',
  rol: ROLES.RECEPCIONISTA,
  numColegiado: '',
  especialidad: '',
  certificacionOss: '',
  turno: '',
  departamento: '',
  rasId: '',
  raaId: '',
};

export default function UserForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    usersApi
      .list()
      .then((res) => setAllUsers(res.data || []))
      .catch(() => setAllUsers([]));
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    setLoading(true);
    usersApi
      .get(id)
      .then((res) => {
        const u = res.data;
        setForm({
          email: u.email || '',
          password: '',
          nombre: u.nombre || '',
          apellidos: u.apellidos || '',
          dniNif: u.dniNif || '',
          telefono: u.telefono || '',
          rol: u.rol || ROLES.RECEPCIONISTA,
          numColegiado: u.numColegiado || '',
          especialidad: u.especialidad || '',
          certificacionOss: u.certificacionOss || '',
          turno: u.turno || '',
          departamento: u.departamento || '',
          rasId: u.rasId || '',
          raaId: u.raaId || '',
          activo: u.activo,
        });
      })
      .catch((err) => setError(err.message || 'Error al cargar usuario'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const rasUsers = allUsers.filter((u) => u.rol === ROLES.RAS && u.activo);
  const raaUsers = allUsers.filter((u) => u.rol === ROLES.RAA && u.activo);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    const payload = {
      nombre: form.nombre.trim(),
      apellidos: form.apellidos?.trim() || null,
      dniNif: form.dniNif?.trim() || null,
      telefono: form.telefono?.trim() || null,
      rol: form.rol,
      numColegiado: form.numColegiado?.trim() || null,
      especialidad: form.especialidad?.trim() || null,
      certificacionOss: form.certificacionOss?.trim() || null,
      turno: form.turno || null,
      departamento: form.departamento?.trim() || null,
      rasId: form.rol === ROLES.ENFERMERA && form.rasId ? form.rasId : undefined,
      raaId: form.rol === ROLES.OSS && form.raaId ? form.raaId : undefined,
    };
    if (!isEdit) {
      payload.email = form.email.trim();
      if (form.password?.trim()) payload.password = form.password.trim();
    } else {
      if (form.password?.trim()) payload.password = form.password.trim();
      if (form.activo !== undefined) payload.activo = form.activo;
    }
    try {
      if (isEdit) {
        await usersApi.update(id, payload);
        navigate('/usuarios');
      } else {
        await usersApi.create(payload);
        navigate('/usuarios');
      }
    } catch (err) {
      setError(err.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className={styles.status}>Cargando…</p>;

  return (
    <div className={styles.page}>
      <div className={styles.top}>
        <h1 className={styles.title}>{isEdit ? 'Editar usuario' : 'Nuevo usuario'}</h1>
        <Link to="/usuarios" className="btn btn-secondary">
          Volver
        </Link>
      </div>
      <form onSubmit={handleSubmit} className="card" style={{ maxWidth: '520px' }}>
        <div className="form-group">
          <label>Email *</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            required
            disabled={isEdit}
            placeholder="email@ejemplo.com"
          />
        </div>
        <div className="form-group">
          <label>Contraseña {isEdit ? '(dejar en blanco para no cambiar)' : '*'}</label>
          <input
            type="password"
            value={form.password}
            onChange={(e) => update('password', e.target.value)}
            required={!isEdit}
            placeholder="••••••••"
          />
        </div>
        <div className="form-group">
          <label>Nombre *</label>
          <input
            value={form.nombre}
            onChange={(e) => update('nombre', e.target.value)}
            required
            placeholder="Nombre"
          />
        </div>
        <div className="form-group">
          <label>Apellidos</label>
          <input
            value={form.apellidos}
            onChange={(e) => update('apellidos', e.target.value)}
            placeholder="Apellidos"
          />
        </div>
        <div className="form-group">
          <label>DNI/NIF</label>
          <input
            value={form.dniNif}
            onChange={(e) => update('dniNif', e.target.value)}
            placeholder="Documento de identidad"
          />
        </div>
        <div className="form-group">
          <label>Teléfono</label>
          <input
            type="tel"
            value={form.telefono}
            onChange={(e) => update('telefono', e.target.value)}
            placeholder="Teléfono"
          />
        </div>
        <div className="form-group">
          <label>Rol *</label>
          <select value={form.rol} onChange={(e) => update('rol', e.target.value)} required>
            {ROL_LIST.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
        {(form.rol === ROLES.MEDICO || form.rol === ROLES.ENFERMERA || form.rol === ROLES.RAS || form.rol === ROLES.FISIOTERAPEUTA) && (
          <div className="form-group">
            <label>Nº Colegiado</label>
            <input
              value={form.numColegiado}
              onChange={(e) => update('numColegiado', e.target.value)}
              placeholder="Número de colegiado"
            />
          </div>
        )}
        {(form.rol === ROLES.MEDICO || form.rol === ROLES.FISIOTERAPEUTA) && (
          <div className="form-group">
            <label>Especialidad</label>
            <input
              value={form.especialidad}
              onChange={(e) => update('especialidad', e.target.value)}
              placeholder="Especialidad"
            />
          </div>
        )}
        {(form.rol === ROLES.RAA || form.rol === ROLES.OSS) && (
          <div className="form-group">
            <label>Certificación OSS</label>
            <input
              value={form.certificacionOss}
              onChange={(e) => update('certificacionOss', e.target.value)}
              placeholder="Certificación"
            />
          </div>
        )}
        {form.rol === ROLES.ADMINISTRADOR && (
          <div className="form-group">
            <label>Departamento</label>
            <input
              value={form.departamento}
              onChange={(e) => update('departamento', e.target.value)}
              placeholder="Departamento"
            />
          </div>
        )}
        <div className="form-group">
          <label>Turno</label>
          <select value={form.turno} onChange={(e) => update('turno', e.target.value)}>
            <option value="">—</option>
            {TURNOS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        {form.rol === ROLES.ENFERMERA && rasUsers.length > 0 && (
          <div className="form-group">
            <label>RAS (Jefa de Enfermería)</label>
            <select value={form.rasId} onChange={(e) => update('rasId', e.target.value)}>
              <option value="">— Sin asignar</option>
              {rasUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nombre} {u.apellidos || ''}
                </option>
              ))}
            </select>
          </div>
        )}
        {form.rol === ROLES.OSS && raaUsers.length > 0 && (
          <div className="form-group">
            <label>RAA (Jefa de OSS)</label>
            <select value={form.raaId} onChange={(e) => update('raaId', e.target.value)}>
              <option value="">— Sin asignar</option>
              {raaUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nombre} {u.apellidos || ''}
                </option>
              ))}
            </select>
          </div>
        )}
        {isEdit && (
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                checked={form.activo !== false}
                onChange={(e) => update('activo', e.target.checked)}
              />
              Usuario activo
            </label>
          </div>
        )}
        {error && <p className="error-msg">{error}</p>}
        <button type="submit" className="btn btn-primary" disabled={saving} style={{ marginTop: '0.5rem' }}>
          {saving ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear usuario'}
        </button>
      </form>
    </div>
  );
}
