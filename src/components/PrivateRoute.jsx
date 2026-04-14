import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useEffect } from 'react';

const PrivateRoute = ({ allowedRoles }) => {
  const { user, isAuthenticated, refreshSession, logout } = useAuthStore();
  const location = useLocation();

  // Check session validity on every route change
  useEffect(() => {
    if (isAuthenticated) {
      const valid = refreshSession();
      if (!valid) {
        logout();
      }
    }
  }, [location.pathname, isAuthenticated, refreshSession, logout]);

  // Not authenticated → redirect to login, preserve intended URL
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role check → redirect to unauthorized page
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
