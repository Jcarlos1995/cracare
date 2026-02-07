import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import UserForm from './pages/UserForm';
import Inventario from './pages/Inventario';
import Consignas from './pages/Consignas';
import Contratos from './pages/Contratos';
import Reportes from './pages/Reportes';
import Pacientes from './pages/Pacientes';
import PacienteDetalle from './pages/PacienteDetalle';
import Horarios from './pages/Horarios';
import HorariosEnfermera from './pages/HorariosEnfermera';
import DiarioUnificado from './pages/DiarioUnificado';
import Medicaciones from './pages/Medicaciones';
import DiarioMedicaciones from './pages/DiarioMedicaciones';
import Citas from './pages/Citas';
import Materiales from './pages/Materiales';
import RegistroDiario from './pages/RegistroDiario';
import Actividades from './pages/Actividades';
import MisTurnos from './pages/MisTurnos';
import Terapias from './pages/Terapias';

function PrivateRoute({ children, adminOnly, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Cargando…
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.rol !== 'ADMINISTRADOR') return <Navigate to="/" replace />;
  if (allowedRoles?.length && !allowedRoles.includes(user.rol)) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="inventario" element={<PrivateRoute allowedRoles={['ADMINISTRADOR', 'RAA', 'RAS']}><Inventario /></PrivateRoute>} />
        <Route path="consignas" element={<Consignas />} />
        <Route path="horarios" element={<PrivateRoute allowedRoles={['RAA']}><Horarios /></PrivateRoute>} />
        <Route path="horarios-enfermera" element={<PrivateRoute allowedRoles={['RAS']}><HorariosEnfermera /></PrivateRoute>} />
        <Route path="contratos" element={<PrivateRoute adminOnly><Contratos /></PrivateRoute>} />
        <Route path="reportes" element={<PrivateRoute adminOnly><Reportes /></PrivateRoute>} />
        <Route path="pacientes" element={<PrivateRoute><Pacientes /></PrivateRoute>} />
        <Route path="pacientes/:id" element={<PrivateRoute><PacienteDetalle /></PrivateRoute>} />
        <Route path="medicaciones" element={<PrivateRoute allowedRoles={['ADMINISTRADOR', 'RAS', 'MEDICO', 'ENFERMERA']}><Medicaciones /></PrivateRoute>} />
        <Route path="diario-unificado" element={<DiarioUnificado />} />
        <Route path="diario-medicaciones" element={<PrivateRoute allowedRoles={['ADMINISTRADOR', 'RAS', 'MEDICO', 'ENFERMERA']}><DiarioMedicaciones /></PrivateRoute>} />
        <Route path="citas" element={<PrivateRoute allowedRoles={['RECEPCIONISTA']}><Citas /></PrivateRoute>} />
        <Route path="materiales" element={<PrivateRoute allowedRoles={['RECEPCIONISTA']}><Materiales /></PrivateRoute>} />
        <Route path="registro-diario" element={<PrivateRoute allowedRoles={['OSS', 'RAA']}><RegistroDiario /></PrivateRoute>} />
        <Route path="actividades" element={<PrivateRoute allowedRoles={['OSS', 'RAA']}><Actividades /></PrivateRoute>} />
        <Route path="mis-turnos" element={<PrivateRoute allowedRoles={['OSS']}><MisTurnos /></PrivateRoute>} />
        <Route path="terapias" element={<PrivateRoute allowedRoles={['FISIOTERAPEUTA']}><Terapias /></PrivateRoute>} />
        <Route
          path="usuarios"
          element={
            <PrivateRoute adminOnly>
              <Users />
            </PrivateRoute>
          }
        />
        <Route
          path="usuarios/nuevo"
          element={
            <PrivateRoute adminOnly>
              <UserForm />
            </PrivateRoute>
          }
        />
        <Route
          path="usuarios/:id"
          element={
            <PrivateRoute adminOnly>
              <UserForm />
            </PrivateRoute>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
