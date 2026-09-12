import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Pages
import CountdownPage from './pages/CountdownPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import LiveCameras from './pages/LiveCameras';
import Vehicles from './pages/Vehicles';
import ANPR from './pages/ANPR';
import Trajectories from './pages/Trajectories';
import Analytics from './pages/Analytics';
import Alerts from './pages/Alerts';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

// Components
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<CountdownPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/cameras" element={<LiveCameras />} />
          <Route path="/vehicles" element={<Vehicles />} />
          <Route path="/anpr" element={<ANPR />} />
          <Route path="/trajectories" element={<Trajectories />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
