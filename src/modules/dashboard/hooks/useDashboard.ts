import { useState, useEffect, useCallback } from 'react';
import { toast } from '@/shared';

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

export interface DashboardStats {
  totalMembers: number;
  activeMembers: number;
  expiredMembers: number;
  expiringSoon: number;
  monthlyRevenue: number;
  todaysRevenue: number;
  growthData: { month: string; year: number; count: number }[];
  planDistribution: {
    id: string;
    title: string;
    price: number;
    count: number;
    percentage: number;
  }[];
}

export const useDashboard = () => {
  const [plans, setPlans] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);

  const getHeaders = useCallback(() => {
    const token = localStorage.getItem('accessToken');
    return {
      'accept': '*/*',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }, []);

  const refreshData = useCallback(async () => {
    try {
      const headers = getHeaders();

      const [statsRes, plansRes, usersRes] = await Promise.all([
        fetch(`${process.env.VITE_API_BASE_URL}/users/stats`, { headers }),
        fetch(`${process.env.VITE_API_BASE_URL}/subscription-plans`, { headers }),
        fetch(`${process.env.VITE_API_BASE_URL}/users?limit=100`, { headers }),
      ]);

      const statsData = await statsRes.json();
      if (statsData && statsData.success && statsData.data) {
        setStats(statsData.data);
      }

      const plansData = await plansRes.json();
      if (plansData && plansData.success && Array.isArray(plansData.data)) {
        setPlans(plansData.data);
      }

      const usersData = await usersRes.json();
      if (usersData && usersData.success && Array.isArray(usersData.data)) {
        setMembers(usersData.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  }, [getHeaders]);

  const handleSaveEntry = useCallback(async (entryData: any) => {
    try {
      const headers = getHeaders();
      const response = await fetch(`${process.env.VITE_API_BASE_URL}/entries`, {
        method: 'POST',
        headers,
        body: JSON.stringify(entryData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to log entry');
      }

      toast.success('Entry logged successfully!');
      await refreshData();
    } catch (error: any) {
      console.error('Dashboard log entry error:', error);
    }
  }, [getHeaders, refreshData]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await refreshData();
      setLoading(false);
    };

    fetchData();
  }, [refreshData]);

  // Statistics from API
  const totalMembersCount = stats?.totalMembers ?? 0;
  const activeMembersCount = stats?.activeMembers ?? 0;
  const expiredMembersCount = stats?.expiredMembers ?? 0;
  const expiringSoon = stats?.expiringSoon ?? 0;
  const monthlyRevenue = stats?.monthlyRevenue ?? 0;
  const todaysRevenue = stats?.todaysRevenue ?? 0;

  // Member Growth Graph calculations
  const fallbackMonths = getLast12Months();
  const monthsList = stats?.growthData?.length
    ? stats.growthData.map((g) => ({ name: g.month, year: g.year }))
    : fallbackMonths;

  const rawGrowthData = stats?.growthData?.length
    ? stats.growthData.map((g) => g.count)
    : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  const maxGrowth = Math.max(...rawGrowthData, 10);
  const minGrowth = Math.min(...rawGrowthData, 0);
  const yRange = maxGrowth - minGrowth || 10;
  const points = rawGrowthData.map((val, idx) => {
    const x = 20 + idx * ((580 - 20) / (rawGrowthData.length - 1 || 1));
    const y = 200 - ((val - minGrowth) / yRange) * 170;
    return { x, y, value: val };
  });

  const pathD = points.length > 0
    ? points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
    : '';

  // Plan Distribution Calculations from API or fallback
  const distribution = stats?.planDistribution?.length
    ? stats.planDistribution
    : plans.map((p) => ({ id: p._id, title: p.title, count: 0, percentage: 0 }));

  const topPlan = distribution[0] || { title: 'Elite Plan', percentage: 0 };
  const secondPlan = distribution[1] || { title: 'Standard Plan', percentage: 0 };

  const topPlanOffset = 251.2 - (251.2 * (topPlan.percentage || 0)) / 100;
  const secondPlanOffset = 251.2 - (251.2 * ((topPlan.percentage || 0) + (secondPlan.percentage || 0))) / 100;
  const totalActive = activeMembersCount;

  return {
    plans,
    members,
    stats,
    loading,
    isEntryModalOpen,
    setIsEntryModalOpen,
    handleSaveEntry,
    totalMembersCount,
    activeMembersCount,
    expiredMembersCount,
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
  };
};
