import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import DashboardLayout from './components/DashboardLayout';
import DashboardHome from './pages/DashboardHome';
import StaffManagement from './pages/StaffManagement';
import WorkShiftManagement from './pages/settings/WorkShiftManagement';
import RewardPunishRules from './pages/settings/RewardPunishRules';
import AttendanceManagement from './pages/AttendanceManagement';
import RequestManagement from './pages/RequestManagement';
import RewardPunishManagement from './pages/RewardPunishManagement';
import PayrollManagement from './pages/PayrollManagement';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<DashboardHome />} />
          <Route path="staff" element={<StaffManagement />} />
          <Route path="attendance" element={<AttendanceManagement />} />
          <Route path="payroll" element={<PayrollManagement />} />
          <Route path="requests" element={<RequestManagement />} />
          <Route path="rewards" element={<RewardPunishManagement />} />
          <Route path="settings/work-shifts" element={<WorkShiftManagement />} />
          <Route path="settings/reward-punish" element={<RewardPunishRules />} />
          <Route path="*" element={<DashboardHome />} />
        </Route>
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

