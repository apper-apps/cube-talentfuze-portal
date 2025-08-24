import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';

const ProtectedRoute = ({ children, requiredPermission }) => {
  const { isAuthenticated, loading, hasPermission } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check for specific permission if required
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Error message="Access denied. You do not have permission to view this page." />;
  }

  return children;
};

export default ProtectedRoute;