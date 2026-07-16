import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  UserCheck,
  Activity,
  UserX,
  AlertCircle,
  Calendar,
  TrendingUp,
  Plus,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { AddEditEntryModal } from '../../entries/components/AddEditEntryModal';
import { useDashboard } from '../hooks/useDashboard';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    loading,
    isEntryModalOpen,
    setIsEntryModalOpen,
    handleSaveEntry,
    totalMembersCount,
    activeMembersCount,
    expiredMembersCount,
    visitedToday,
    absentToday,
    expiringSoon,
    monthlyRevenue,
    todaysRevenue,
    monthsList,
    points,
    pathD,
    topPlan,
    secondPlan,
    topPlanOffset,
    secondPlanOffset,
    totalActive,
  } = useDashboard();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Format currency
  const formatCurrency = (value: number) => {
    if (value >= 100000) {
      return `₹${(value / 100000).toFixed(2)}L`;
    }
    return `₹${value.toLocaleString('en-IN')}`;
  };

  const stats = [
    {
      title: 'Total Members',
      value: totalMembersCount.toLocaleString(),
      change: '100%',
      isPositive: true,
      icon: Users,
    },
    {
      title: 'Active Members',
      value: activeMembersCount.toLocaleString(),
      change: totalMembersCount > 0 ? `${Math.round((activeMembersCount / totalMembersCount) * 100)}%` : '0%',
      isPositive: true,
      icon: UserCheck,
    },
    {
      title: 'Visited Today',
      value: visitedToday.toLocaleString(),
      change: activeMembersCount > 0 ? `${Math.round((visitedToday / activeMembersCount) * 100)}%` : '0%',
      isPositive: true,
      icon: Activity,
    },
    {
      title: 'Absent Today',
      value: absentToday.toLocaleString(),
      change: activeMembersCount > 0 ? `${Math.round((absentToday / activeMembersCount) * 105)}%` : '0%',
      isPositive: false,
      icon: UserX,
    },
    {
      title: 'Expired Memberships',
      value: expiredMembersCount.toLocaleString(),
      change: totalMembersCount > 0 ? `${Math.round((expiredMembersCount / totalMembersCount) * 100)}%` : '0%',
      isPositive: false,
      icon: AlertCircle,
    },
    {
      title: 'Expiring Soon',
      value: expiringSoon.toLocaleString(),
      change: activeMembersCount > 0 ? `${Math.round((expiringSoon / activeMembersCount) * 100)}%` : '0%',
      isPositive: true,
      icon: Calendar,
    },
    {
      title: 'Monthly Revenue',
      value: formatCurrency(monthlyRevenue),
      change: '100%',
      isPositive: true,
      icon: (props: any) => (
        <span {...props} className="font-bold text-lg select-none">₹</span>
      ),
    },
    {
      title: "Today's Revenue",
      value: formatCurrency(todaysRevenue),
      change: monthlyRevenue > 0 ? `${((todaysRevenue / monthlyRevenue) * 100).toFixed(1)}%` : '0%',
      isPositive: true,
      icon: TrendingUp,
    },
  ];

  return (
    <>
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-slate-500 mt-1 text-sm md:text-base">
            Welcome back — here's your gym at a glance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 self-start sm:self-center">
          <button
            onClick={() => setIsEntryModalOpen(true)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-full shadow-md shadow-emerald-500/15 transition-all duration-200 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Log Entry</span>
          </button>
          <button
            onClick={() => navigate('/member')}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-semibold rounded-full shadow-md shadow-red-500/15 transition-all duration-200 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Member</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white p-6 rounded-2xl border border-slate-100 shadow-soft hover:shadow-md transition-shadow duration-300 flex flex-col justify-between min-h-[140px]"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    {stat.title}
                  </p>
                  <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mt-2">
                    {stat.value}
                  </h3>
                </div>
                <div className="w-10 h-10 rounded-full bg-red-50 text-primary flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              <div className="flex items-center gap-1.5 mt-4 text-xs font-semibold">
                <span className={`flex items-center gap-0.5 px-2 py-1 rounded-full ${stat.isPositive
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'bg-rose-50 text-rose-600'
                  }`}>
                  {stat.isPositive ? (
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  ) : (
                    <ArrowDownRight className="w-3.5 h-3.5" />
                  )}
                  {stat.change}
                </span>
                <span className="text-slate-400">vs last month</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Graphical Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Member Growth Graph */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-soft">
          <div className="mb-6">
            <h4 className="font-bold text-lg text-slate-900">Member Growth</h4>
            <p className="text-slate-400 text-xs mt-0.5">Last 12 months</p>
          </div>

          {/* Custom SVG Line Chart */}
          <div className="relative h-64 w-full">
            <svg className="w-full h-full" viewBox="0 0 600 220" preserveAspectRatio="none">
              {/* Grid Lines */}
              <line x1="0" y1="20" x2="600" y2="20" stroke="#f1f5f9" strokeDasharray="4 4" />
              <line x1="0" y1="70" x2="600" y2="70" stroke="#f1f5f9" strokeDasharray="4 4" />
              <line x1="0" y1="120" x2="600" y2="120" stroke="#f1f5f9" strokeDasharray="4 4" />
              <line x1="0" y1="170" x2="600" y2="170" stroke="#f1f5f9" strokeDasharray="4 4" />
              <line x1="0" y1="210" x2="600" y2="210" stroke="#e2e8f0" />

              {/* Growth Line */}
              {pathD && (
                <path
                  d={pathD}
                  fill="none"
                  stroke="#DC2626"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Dots on the line */}
              {points.map((pt, i) => (
                <circle key={i} cx={pt.x} cy={pt.y} r="5" fill="#DC2626" stroke="#FFFFFF" strokeWidth="2" />
              ))}
            </svg>

            {/* X Axis Labels */}
            <div className="flex justify-between text-[10px] md:text-xs text-slate-400 font-semibold mt-4 px-2">
              {monthsList.map((m, i) => (
                <span key={i}>{m.name}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Plan Distribution (Donut Chart) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-soft flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-lg text-slate-900">Plan Distribution</h4>
            <p className="text-slate-400 text-xs mt-0.5">Active memberships</p>
          </div>

          {/* Custom SVG Donut Chart */}
          <div className="flex items-center justify-center py-6">
            <div className="relative w-44 h-44">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Background Circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#f1f5f9"
                  strokeWidth="10"
                />
                {/* Value segments */}
                {topPlan.percentage > 0 && (
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#DC2626" /* Primary/Elite Plan */
                    strokeWidth="10"
                    strokeDasharray="251.2"
                    strokeDashoffset={topPlanOffset}
                    className="transition-all duration-1000"
                  />
                )}
                {secondPlan.percentage > 0 && (
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#FDA4AF" /* Light Red/Standard Plan */
                    strokeWidth="10"
                    strokeDasharray="251.2"
                    strokeDashoffset={secondPlanOffset}
                    className="transition-all duration-1000"
                  />
                )}
              </svg>
              {/* Center Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-slate-900">
                  {totalActive > 0 ? `${topPlan.percentage}%` : '0%'}
                </span>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider text-center px-2">
                  {totalActive > 0 ? topPlan.title : 'No Active Plans'}
                </span>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-col gap-2 text-xs font-semibold text-slate-600 border-t border-slate-50 pt-4">
            {totalActive > 0 ? (
              <div className="flex justify-around">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-primary block"></span>
                  <span>{topPlan.title} ({topPlan.percentage}%)</span>
                </div>
                {secondPlan.percentage > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-200 block"></span>
                    <span>{secondPlan.title} ({secondPlan.percentage}%)</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-slate-400">No active members to display</div>
            )}
          </div>

        </div>

      </div>

      <AddEditEntryModal
        isOpen={isEntryModalOpen}
        onClose={() => setIsEntryModalOpen(false)}
        onSave={handleSaveEntry}
        mode="add"
      />
    </>
  );
};
