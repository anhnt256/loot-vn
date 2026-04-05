import React from 'react';
import { Navigate } from 'react-router-dom';
import { ACCESS_TOKEN_KEY, getCookie } from '@gateway-workspace/shared/utils/client';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = getCookie(ACCESS_TOKEN_KEY);
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export default ProtectedRoute;
