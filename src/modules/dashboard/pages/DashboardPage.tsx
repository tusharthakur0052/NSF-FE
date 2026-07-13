import React, { useState, useEffect } from 'react';
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

const getLast12Months = () => {
  const months = [];
  const date = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(date.getFullYear(), date.getMonth() - i, 1);
    months.push({
      name: d.toLocaleString('default', { month: 'short' }),
      year: d.getFullYear(),
      monthIndex: d.getMonth(),
    });
  }
  return months;
};

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const getHeaders = () => {
    const token = localStorage.getItem('accessToken');
    return {
      'accept': '*/*',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = getHeaders();
        const plansResponse = await fetch('http://localhost:9001/subscription-plans', { headers });
        const plansData = await plansResponse.json();
        if (plansData && plansData.success && Array.isArray(plansData.data)) {
          setPlans(plansData.data);
        }

        const usersResponse = await fetch('http://localhost:9001/users', { headers });
        const usersData = await usersResponse.json();
        if (usersData && usersData.success && Array.isArray(usersData.data)) {
          setMembers(usersData.data);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const totalMembersCount = members.length;
  const activeMembersCount = members.filter(m => m.subscriptionIsActive).length;
  const expiredMembersCount = members.filter(m => !m.subscriptionIsActive).length;

  const todayStr = new Date().toISOString().split('T')[0];
  const visitedToday = members.filter(m => m.updatedAt && m.updatedAt.split('T')[0] === todayStr).length;
  const absentToday = Math.max(0, activeMembersCount - visitedToday);

  // Expiring Soon (Active but registered/updated > 25 days ago)
  const expiringSoon = members.filter(m => {
    if (!m.subscriptionIsActive) return false;
    const joinDate = new Date(m.createdAt || m.updatedAt);
    const diffTime = Math.abs(Date.now() - joinDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 25 && diffDays <= 30;
  }).length;

  // Monthly Revenue (active members plan sum)
  const planPriceMap = new Map(plans.map(p => [p._id, p.price]));
  const monthlyRevenue = members
    .filter(m => m.subscriptionIsActive)
    .reduce((sum, m) => sum + (planPriceMap.get(m.subscriptionPlanId) || 0), 0);

  // Today's Revenue (registered/renewed today)
  const todaysRevenue = members
    .filter(m => {
      const regDate = m.createdAt ? m.createdAt.split('T')[0] : '';
      return regDate === todayStr;
    })
    .reduce((sum, m) => sum + (planPriceMap.get(m.subscriptionPlanId) || 0), 0);

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
      change: activeMembersCount > 0 ? `${Math.round((absentToday / activeMembersCount) * 100)}%` : '0%',
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

  // Member Growth Graph calculations
  const monthsList = getLast12Months();
  const growthData = monthsList.map(m => {
    return members.filter(user => {
      const regDate = new Date(user.createdAt);
      return regDate.getFullYear() < m.year ||
        (regDate.getFullYear() === m.year && regDate.getMonth() <= m.monthIndex);
    }).length;
  });

  const maxGrowth = Math.max(...growthData, 10);
  const minGrowth = Math.min(...growthData, 0);
  const yRange = maxGrowth - minGrowth || 10;
  const points = growthData.map((val, idx) => {
    const x = 20 + idx * ((580 - 20) / 11);
    const y = 200 - ((val - minGrowth) / yRange) * 170;
    return { x, y, value: val };
  });

  const pathD = points.length > 0
    ? points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
    : '';

  // Plan Distribution Calculations
  const planCounts: Record<string, number> = {};
  let totalActive = 0;
  members.forEach(m => {
    if (m.subscriptionIsActive) {
      const planId = m.subscriptionPlanId;
      planCounts[planId] = (planCounts[planId] || 0) + 1;
      totalActive++;
    }
  });

  const distribution = plans.map(p => {
    const count = planCounts[p._id] || 0;
    const percentage = totalActive > 0 ? Math.round((count / totalActive) * 100) : 0;
    return {
      id: p._id,
      title: p.title,
      count,
      percentage,
    };
  }).sort((a, b) => b.count - a.count);

  const topPlan = distribution[0] || { title: 'Elite Plan', percentage: 0 };
  const secondPlan = distribution[1] || { title: 'Standard Plan', percentage: 0 };

  const topPlanOffset = 251.2 - (251.2 * topPlan.percentage) / 100;
  const secondPlanOffset = 251.2 - (251.2 * (topPlan.percentage + secondPlan.percentage)) / 100;

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
    </>
  );
};
