import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Sidebar, Topbar } from '@/shared';
import { DashboardPage } from '@/modules/dashboard';
import { MembersPage } from '@/modules/members';
import { PlansPage } from '@/modules/plans';
import { ProfilePage } from '@/modules/profile';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-canvas text-slate-800 font-sans">
      {/* Sidebar Component */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col min-h-screen">

        {/* Topbar Component */}
        <Topbar
          onMenuClick={() => setSidebarOpen(true)}
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

            {/* Profile Route */}
            <Route path="/profile" element={<ProfilePage />} />


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
