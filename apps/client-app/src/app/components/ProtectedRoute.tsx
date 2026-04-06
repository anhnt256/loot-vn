import React from 'react';
import { Navigate } from 'react-router-dom';
import { getToken } from '@gateway-workspace/shared/utils/client';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = getToken();
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export default ProtectedRoute;
