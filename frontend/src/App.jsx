import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import UserForm from './pages/UserForm';

function PrivateRoute({ children, adminOnly }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Cargando…
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (adminOnly && user.rol !== 'ADMINISTRADOR') {
    return <Navigate to="/" replace />;
  }
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
