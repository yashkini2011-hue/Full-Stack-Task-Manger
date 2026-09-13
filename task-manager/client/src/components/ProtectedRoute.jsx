import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="page-loading">Loading…</div>;
  }

  if (!user) {
    // Remember where they wanted to go, so we can return after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}