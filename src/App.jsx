import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminRoutes from './admin/routes/AdminRoutes';
import ClientRoutes from './client/routes/ClientRoutes';

/**
 * Top-level Application Router orchestrating Admin and Client portals
 */
function App() {
  return (
    <Router>
      <div className="min-h-screen font-sans">
        <Routes>
          {/* Super Admin Portal Routing */}
          <Route path="/admin/*" element={<AdminRoutes />} />
          <Route path="/admin-dashboard" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin-dashboard/*" element={<Navigate to="/admin/dashboard" replace />} />

          {/* Client & Partner Portal Routing */}
          <Route path="/*" element={<ClientRoutes />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;