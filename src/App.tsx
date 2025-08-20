import React, { useState } from 'react';
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
import Login from './components/auth/Login';
import { UserProvider, useUser } from './contexts/UserContext';
import { MessageCircle } from 'lucide-react';
import Chatbot from './components/chat/Chatbot';

function AppContent() {
  const { user, logout } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  console.log('AppContent rendering, user:', user);

  if (!user) {
    console.log('No user found, showing Login component');
    return <Login />;
  }

  console.log('User found, rendering main app with user type:', user.type);

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
        
        <main className="flex-1 lg:ml-64">
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
                <Route path="/fleet" element={<FleetManagement />} />
              )}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </main>
      </div>

      {/* Floating Chatbot at Bottom Left */}
      <div className="fixed bottom-6 left-6 z-50">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-center mb-2">
            <MessageCircle className="h-5 w-5 text-blue-600 mr-2" />
            <span className="text-sm font-medium text-blue-900">Ask TARAL</span>
          </div>
          <p className="text-xs text-blue-700 mb-3">
            Get instant help with fuel switching and cost benefits
          </p>
          <button className="w-full bg-blue-600 text-white text-xs py-2 px-3 rounded-md hover:bg-blue-700 transition-colors">
            Start Chat
          </button>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <UserProvider>
        <AppContent />
      </UserProvider>
    </Router>
  );
}

export default App;