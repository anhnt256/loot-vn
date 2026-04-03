import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminLayout from './components/AdminLayout';
import DashboardOverview from './pages/DashboardOverview';
import LayoutManager from './pages/LayoutManager';
import SystemConfig from './pages/SystemConfig';
import HandoverReports from './pages/handover-reports/HandoverReports';
import ShiftReports from './pages/shift-reports/ShiftReports';
import DeviceHistoryPage from './pages/device-history/DeviceHistoryPage';
import MaterialManagementPage from './pages/MaterialManagementPage';
import RecipeManagementPage from './pages/RecipeManagementPage';
import InventoryAuditPage from './pages/InventoryAuditPage';
import ProfitAnalysisPage from './pages/ProfitAnalysisPage';
import MenuManagementPage from './pages/MenuManagementPage';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<AdminLayout />}>
          <Route index element={<DashboardOverview />} />
          <Route path="layout-manager" element={<LayoutManager />} />
          <Route path="system-config" element={<SystemConfig />} />
          <Route path="handover-reports" element={<HandoverReports />} />
          <Route path="menu-management" element={<MenuManagementPage />} />
          <Route path="material-management" element={<MaterialManagementPage />} />
          <Route path="recipe-management" element={<RecipeManagementPage />} />
          <Route path="inventory-audit" element={<InventoryAuditPage />} />
          <Route path="profit-analysis" element={<ProfitAnalysisPage />} />
          <Route path="reports" element={<ShiftReports />} />
          <Route path="device-history" element={<DeviceHistoryPage />} />
          <Route path="*" element={<div className="p-8 text-white">Chức năng đang được phát triển...</div>} />
        </Route>
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
