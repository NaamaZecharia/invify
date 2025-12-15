import { Navigate } from 'react-router-dom';
import { isLoggedIn } from '../utils/auth';
import type { JSX } from 'react';

interface PrivateRouteProps {
  children: JSX.Element;
}

export default function PrivateRoute({ children }: PrivateRouteProps) {
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
