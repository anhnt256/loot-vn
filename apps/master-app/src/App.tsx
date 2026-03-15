import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MasterHomePage from './pages/MasterHomePage';
import AppsPage from './pages/AppsPage';
import LoginPage from './pages/LoginPage';
import BranchSelectPage from './pages/BranchSelectPage';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#151b22] text-white font-sans">
        <Routes>
          <Route path="/" element={<MasterHomePage />} />
          <Route path="/apps" element={<AppsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/branch-select" element={<BranchSelectPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
