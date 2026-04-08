import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { App as AntApp } from 'antd';

import Login from './pages/Login';
import StaffPage from './pages/Staff';

export function App() {
  return (
    <AntApp>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/dashboard" element={<StaffPage />} />
        </Routes>
      </BrowserRouter>
    </AntApp>
  );
}

export default App;

