import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  ChevronDown,
  LayoutGrid,
  LogOut
} from 'lucide-react';

interface TopbarProps {
  onMenuClick: () => void;
  onLogout?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onMenuClick, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Format path to clean title
  const getTabTitle = (pathname: string) => {
    if (pathname === '/') return 'Dashboard';
    if (pathname === '/member') return 'Members';
    if (pathname === '/plans') return 'Subscription Plans';
    if (pathname === '/attendance') return 'Attendance Logs';

    // Remove slash and capitalize
    const title = pathname.replace('/', '');
    return title.charAt(0).toUpperCase() + title.slice(1);
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-[72px] px-4 md:px-8 bg-white border-b border-slate-100">

      {/* Left side: Mobile menu toggle & Breadcrumbs */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-lg hover:bg-slate-50 text-slate-500 lg:hidden focus:outline-none"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Layout/Breadcrumbs Section */}
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <LayoutGrid className="w-4 h-4 hidden sm:block text-slate-400" />
          <span
            className="hover:text-slate-700 cursor-pointer hidden sm:inline"
            onClick={() => navigate('/')}
          >
            Home
          </span>
          <span className="hidden sm:inline">/</span>
          <span className="font-semibold text-slate-900">{getTabTitle(location.pathname)}</span>
        </div>
      </div>

      {/* Right side: Search, Notifications, Profile */}
      <div className="flex items-center gap-4 md:gap-6">

        {/* Search Input */}
        <div className="relative hidden md:block w-72">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="h-4.5 w-4.5 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search members, plans..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border-0 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all text-slate-700 placeholder-slate-400"
          />
        </div>

        {/* Search icon for mobile screen */}
        <button className="p-2 rounded-full hover:bg-slate-50 text-slate-500 md:hidden">
          <Search className="w-5 h-5" />
        </button>

        {/* Notifications Icon */}
        <button className="relative p-2 rounded-full hover:bg-slate-50 text-slate-500 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full ring-2 ring-white"></span>
        </button>

        {/* Profile Section */}
        <div className="relative">
          <div
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-3 pl-2 border-l border-slate-100 cursor-pointer group"
          >
            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-primary text-white font-bold text-sm tracking-wider shadow-sm">
              AR
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-sm font-semibold text-slate-900 leading-tight">Admin</div>
              <div className="text-xs text-slate-500">admin@fitcore.io</div>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
          </div>
          {dropdownOpen && (
            <>
              {/* Click backdrop to close dropdown */}
              <div
                className="fixed inset-0 z-40 cursor-default"
                onClick={() => setDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-2.5 w-48 bg-white border border-slate-100 rounded-xl shadow-soft p-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    onLogout && onLogout();
                  }}
                  className="flex items-center w-full gap-2.5 px-3 py-2 text-sm text-slate-600 hover:bg-red-50 hover:text-primary rounded-lg transition-colors text-left"
                >
                  <LogOut className="w-4.5 h-4.5" />
                  <span>Logout</span>
                </button>
              </div>
            </>
          )}
        </div>

      </div>
    </header>
  );
};
