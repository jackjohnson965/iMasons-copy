import { Navigate } from 'react-router-dom';

/**
 * Route guard that redirects unauthenticated users to the login page.
 * Optionally checks for a specific role.
 *
 * Usage:
 *   <Route path="/student/..." element={<ProtectedRoute><StudentPage /></ProtectedRoute>} />
 *   <Route path="/admin/..." element={<ProtectedRoute role="admin"><AdminPage /></ProtectedRoute>} />
 */
export default function ProtectedRoute({ children, role }) {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (role && userRole !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
}
