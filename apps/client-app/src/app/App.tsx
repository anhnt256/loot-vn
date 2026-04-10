import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { App as AntdApp, ConfigProvider, theme } from 'antd';

import Login from './pages/Login';
import Maintenance from './pages/Maintenance';
import DashboardLayout from './components/DashboardLayout';
import CheckIn from './pages/CheckIn';
import Game from './pages/Game';
import Store from './pages/Store';
import FeedbackPage from './pages/FeedbackPage';
import BattlePass from './pages/BattlePass';
import Voucher from './pages/Voucher';
import OrderPage from './pages/OrderPage';
import EventsPage from './pages/EventsPage';
import SupportPage from './pages/SupportPage';
import ProtectedRoute from './components/ProtectedRoute';

export function App() {
  const tenantConfig = (window as any).__TENANT_CONFIG__ ?? {};
  const primaryColor = tenantConfig.primaryColor || '#eb2b90';
  const secondaryColor = tenantConfig.secondaryColor || '#23c3f3';

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: primaryColor,
          colorLink: secondaryColor,
          colorInfo: secondaryColor,
        },
      }}
    >
      <AntdApp>
        <BrowserRouter>
          <Routes>
            <Route path="/maintenance" element={<Maintenance />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="order" replace />} />
              <Route path="order" element={<OrderPage />} />
              <Route path="check-in" element={<CheckIn />} />
              <Route path="games" element={<Game />} />
              <Route path="store" element={<Store />} />
              <Route path="feedback" element={<FeedbackPage />} />
              <Route path="support" element={<SupportPage />} />
              <Route path="battle-pass" element={<BattlePass />} />
              <Route path="events" element={<EventsPage />} />
              <Route path="voucher" element={<Voucher />} />
            </Route>
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </AntdApp>
    </ConfigProvider>
  );
}

export default App;
