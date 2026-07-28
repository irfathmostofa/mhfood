import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../../hooks/useAdminAuth';

export default function ProtectedRoute({ children }) {
  const { isLoggedIn, loading } = useAdminAuth();

  if (loading) return <div className="p-8">Loading...</div>;
  if (!isLoggedIn) return <Navigate to="/admin/login" replace />;

  return children;
}
