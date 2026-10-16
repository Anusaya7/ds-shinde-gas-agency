import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Role } from '../../types';
import { Spinner } from '../ui/Spinner';

export interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Spinner size="lg" label="Authenticating session..." />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    const loginTarget = location.pathname.startsWith('/admin')
      ? '/admin/login'
      : location.pathname.startsWith('/rider')
      ? '/rider/login'
      : '/login';
    return <Navigate to={loginTarget} state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirect to their respective home dashboard based on role
    if (user.role === 'ADMIN') {
      return <Navigate to="/admin" replace />;
    } else if (user.role === 'RIDER') {
      return <Navigate to="/rider" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
};
