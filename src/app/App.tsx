import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar, Topbar } from '@/shared';
import { DashboardPage } from '@/modules/dashboard';
import { MembersPage } from '@/modules/members';
import { PlansPage } from '@/modules/plans';
import { ProfilePage } from '@/modules/profile';
import { LoginPage } from '@/modules/auth';
import { EntriesPage } from '@/modules/entries';

const isTokenExpired = (token: string | null): boolean => {
  if (!token) return true;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    if (typeof payload.exp !== 'number') return false;
    return Date.now() >= payload.exp * 1000;
  } catch (e) {
    return true;
  }
};

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const token = localStorage.getItem('accessToken');
    if (!token || isTokenExpired(token)) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      return false;
    }
    return true;
  });

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setIsAuthenticated(false);
  };

  // Intercept window.fetch to automatically logout on 401 unauthorized responses
  useEffect(() => {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        if (response.status === 401) {
          handleLogout();
        }
        return response;
      } catch (error) {
        throw error;
      }
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  // Periodically check access token expiration
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      const token = localStorage.getItem('accessToken');
      if (isTokenExpired(token)) {
        handleLogout();
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage onLoginSuccess={handleLoginSuccess} />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen bg-canvas text-slate-800 font-sans">
      {/* Sidebar Component */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col min-h-screen">

        {/* Topbar Component */}
        <Topbar
          onMenuClick={() => setSidebarOpen(true)}
          onLogout={handleLogout}
        />

        {/* Content Body */}
        <main className="flex-1 md:p-8 space-y-8 w-full">
          <Routes>
            {/* Dashboard Route */}
            <Route path="/" element={<DashboardPage />} />

            {/* Members Route */}
            <Route path="/member" element={<MembersPage />} />

            {/* Plans Route */}
            <Route path="/plans" element={<PlansPage />} />

            {/* Entries Route */}
            <Route path="/entries" element={<EntriesPage />} />

            {/* Profile Route */}
            <Route path="/profile" element={<ProfilePage />} />

            {/* If logged in, redirect /login to dashboard */}
            <Route path="/login" element={<Navigate to="/" replace />} />

            {/* Coming Soon Fallback for other routes */}
            <Route path="*" element={
              <div className="text-center py-20 bg-white border border-slate-100 rounded-2xl shadow-soft">
                <h3 className="text-lg font-semibold text-slate-600">Coming Soon</h3>
                <p className="text-slate-400 text-sm mt-1">This section is currently under construction.</p>
              </div>
            } />
          </Routes>
        </main>
      </div>
    </div>
  );
}
