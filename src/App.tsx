import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import MSMEDashboard from './components/dashboards/MSMEDashboard';
import AdminDashboard from './components/dashboards/AdminDashboard';
import Marketplace from './components/marketplace/Marketplace';
import FuelComparison from './components/fuel/FuelComparison';
import OrderTracking from './components/orders/OrderTracking';
import ESGReports from './components/reports/ESGReports';
import FleetManagement from './components/fleet/FleetManagement';
import MonitoringDashboard from './components/monitoring/MonitoringDashboard';
import Login from './components/auth/Login';
import { UserProvider, useUser } from './contexts/UserContext';
import { DataProvider } from './contexts/DataContext';
import { ToastProvider } from './components/common/Toast';

function AppContent() {
  const { user, logout } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        user={user} 
        onLogout={logout}
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
      />
      
      <div className="flex">
        <Sidebar 
          userType={user.type}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        
        <main className="flex-1 min-w-0">
          <div className="p-6">
            <Routes>
              <Route 
                path="/" 
                element={
                  user.type === 'msme' ? <MSMEDashboard /> : <AdminDashboard />
                } 
              />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/fuel-comparison" element={<FuelComparison />} />
              <Route path="/orders" element={<OrderTracking />} />
              <Route path="/reports" element={<ESGReports />} />
              {user.type === 'admin' && (
                <>
                  <Route path="/fleet" element={<FleetManagement />} />
                  <Route path="/monitoring" element={<MonitoringDashboard />} />
                  <Route path="/monitoring/:unitId" element={<MonitoringDashboard />} />
                </>
              )}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <ToastProvider>
        <UserProvider>
          <DataProvider>
            <AppContent />
          </DataProvider>
        </UserProvider>
      </ToastProvider>
    </Router>
  );
}

export default App;