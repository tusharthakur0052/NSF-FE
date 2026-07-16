import { useState, useEffect, useCallback } from 'react';

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

export const useDashboard = () => {
  const [plans, setPlans] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
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
      const plansResponse = await fetch(`${process.env.VITE_API_BASE_URL}/subscription-plans`, { headers });
      const plansData = await plansResponse.json();
      if (plansData && plansData.success && Array.isArray(plansData.data)) {
        setPlans(plansData.data);
      }

      const usersResponse = await fetch(`${process.env.VITE_API_BASE_URL}/users`, { headers });
      const usersData = await usersResponse.json();
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
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to log entry');
      }

      await refreshData();
    } catch (error: any) {
      alert(error.message || 'Something went wrong while logging the entry.');
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

  // Derived statistics state
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

  return {
    plans,
    members,
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
  };
};
