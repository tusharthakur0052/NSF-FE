import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  ClipboardList,
  BarChart3,
  Settings,
  User,
  LogOut,
  X,
  Activity
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  onLogout
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { id: 'members', label: 'Members', icon: Users, path: '/member' },
    { id: 'plans', label: 'Subscription Plans', icon: CreditCard, path: '/plans' },
    { id: 'entries', label: 'Entries', icon: ClipboardList, path: '/entries' },
    { id: 'profile', label: 'Profile', icon: User, path: '/profile' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col w-64 bg-white border-r border-slate-100 transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        {/* Header Branding */}
        <div className="flex items-center justify-between h-[72px] px-6 border-b border-slate-100">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => { navigate('/'); onClose(); }}>
            {/* Red badge logo with dumbbell/fitness logo style */}
            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-primary text-white">
              <Activity className="w-5 h-5" />
            </div>
            <span className="font-bold text-xl text-slate-900 tracking-tight">NSF</span>
          </div>

          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg hover:bg-slate-50 text-slate-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 py-6 overflow-y-auto px-4 space-y-7">
          <div>
            <span className="block px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              MENU
            </span>
            <nav className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      navigate(item.path);
                      onClose(); // Close mobile sidebar on select
                    }}
                    className={`flex items-center w-full gap-3 px-4 py-3 rounded-full transition-all duration-200 group text-left ${isActive
                      ? 'bg-primary text-white font-semibold shadow-md shadow-red-500/10'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                  >
                    <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'
                      }`} />
                    <span className="text-sm">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Footer / Logout */}
        <div className="p-4 border-t border-slate-100">
          <button
            className="flex items-center w-full gap-3 px-4 py-3 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors text-left"
            onClick={() => onLogout && onLogout()}
          >
            <LogOut className="w-5 h-5 text-slate-400" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};
