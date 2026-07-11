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

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  // Stats Card Data
  const stats = [
    {
      title: 'Total Members',
      value: '1,284',
      change: '8.2%',
      isPositive: true,
      icon: Users,
    },
    {
      title: 'Active Members',
      value: '1,102',
      change: '4.1%',
      isPositive: true,
      icon: UserCheck,
    },
    {
      title: 'Visited Today',
      value: '248',
      change: '12.5%',
      isPositive: true,
      icon: Activity,
    },
    {
      title: 'Absent Today',
      value: '182',
      change: '3.4%',
      isPositive: false,
      icon: UserX,
    },
    {
      title: 'Expired Memberships',
      value: '46',
      change: '1.8%',
      isPositive: false,
      icon: AlertCircle,
    },
    {
      title: 'Expiring Soon',
      value: '72',
      change: '6.0%',
      isPositive: true,
      icon: Calendar,
    },
    {
      title: 'Monthly Revenue',
      value: '₹1.32L',
      change: '14.8%',
      isPositive: true,
      icon: (props: any) => (
        <span {...props} className="font-bold text-lg select-none">₹</span>
      ),
    },
    {
      title: "Today's Revenue",
      value: '₹8,450',
      change: '9.2%',
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

        <button
          onClick={() => navigate('/member')}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-semibold rounded-full shadow-md shadow-red-500/15 transition-all duration-200 active:scale-95 self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>Add Member</span>
        </button>
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
              <path
                d="M 10 200 L 60 185 L 110 180 L 160 170 L 210 155 L 260 145 L 310 135 L 360 120 L 410 110 L 460 95 L 510 85 L 560 70"
                fill="none"
                stroke="#DC2626"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Dots on the line */}
              {[
                { x: 10, y: 200 },
                { x: 60, y: 185 },
                { x: 110, y: 180 },
                { x: 160, y: 170 },
                { x: 210, y: 155 },
                { x: 260, y: 145 },
                { x: 310, y: 135 },
                { x: 360, y: 120 },
                { x: 410, y: 110 },
                { x: 460, y: 95 },
                { x: 510, y: 85 },
                { x: 560, y: 70 },
              ].map((pt, i) => (
                <circle key={i} cx={pt.x} cy={pt.y} r="5" fill="#DC2626" stroke="#FFFFFF" strokeWidth="2" />
              ))}
            </svg>

            {/* X Axis Labels */}
            <div className="flex justify-between text-[10px] md:text-xs text-slate-400 font-semibold mt-4 px-2">
              <span>Jan</span>
              <span>Feb</span>
              <span>Mar</span>
              <span>Apr</span>
              <span>May</span>
              <span>Jun</span>
              <span>Jul</span>
              <span>Aug</span>
              <span>Sep</span>
              <span>Oct</span>
              <span>Nov</span>
              <span>Dec</span>
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
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#DC2626" /* Primary/Elite Plan */
                  strokeWidth="10"
                  strokeDasharray="251.2"
                  strokeDashoffset="75.3" /* 70% */
                  className="transition-all duration-1000"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#FDA4AF" /* Light Red/Standard Plan */
                  strokeWidth="10"
                  strokeDasharray="251.2"
                  strokeDashoffset="188.4" /* 25% */
                  className="transition-all duration-1000"
                />
              </svg>
              {/* Center Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-slate-900">82%</span>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Elite Plan</span>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex justify-around text-xs font-semibold text-slate-600 border-t border-slate-50 pt-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-primary block"></span>
              <span>Elite (70%)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-200 block"></span>
              <span>Standard (25%)</span>
            </div>
          </div>

        </div>

      </div>
    </>
  );
};
