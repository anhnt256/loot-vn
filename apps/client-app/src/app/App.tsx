import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import DashboardLayout from './components/DashboardLayout';
import DashboardHome from './pages/DashboardHome';
import TenantManagement from './pages/TenantManagement';
import OrgManagement from './pages/OrgManagement';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Navigate to="tenant" replace />} />
          <Route path="tenant" element={<TenantManagement />} />
          <Route path="organization" element={<OrgManagement />} />
          <Route path="*" element={<DashboardHome />} />
        </Route>
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
