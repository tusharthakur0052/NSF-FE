import { useState, useEffect, useCallback } from 'react';
import { toast } from '@/shared';
import type { Plan } from '../components/AddEditPlanModal';

export const usePlans = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  const getHeaders = useCallback(() => {
    const token = localStorage.getItem('accessToken');
    return {
      'accept': '*/*',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }, []);

  const fetchPlans = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.VITE_API_BASE_URL}/subscription-plans`, {
        headers: getHeaders()
      });
      const resData = await response.json();
      if (resData && resData.success && Array.isArray(resData.data)) {
        const mappedPlans = resData.data.map((plan: any) => {
          const numMonths = plan.numberOfMonths || 1;
          let duration = `${numMonths} ${numMonths === 1 ? 'Month' : 'Months'}`;
          let description = plan.description || '';
          if (description.includes(' | ')) {
            const parts = description.split(' | ');
            if (!plan.numberOfMonths) {
              duration = parts[0];
            }
            description = parts.slice(1).join(' | ');
          }

          return {
            id: plan._id,
            name: plan.title,
            description: description,
            duration: duration,
            numberOfMonths: numMonths,
            price: `₹${plan.price}`,
            status: plan.isActive ? 'Active' : 'Inactive',
            members: plan.userCount || 0,
            popular: (plan.description || '').toLowerCase().includes('popular') || false
          };
        });
        setPlans(mappedPlans);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  }, [getHeaders]);

  const handleToggleStatus = useCallback(async (id: string) => {
    try {
      const plan = plans.find(p => p.id === id);
      if (!plan) return;

      const newIsActive = plan.status !== 'Active';
      const response = await fetch(`${process.env.VITE_API_BASE_URL}/subscription-plans/${id}/status`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ isActive: newIsActive })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to update plan status');
      }

      toast.success(`Plan ${newIsActive ? 'activated' : 'deactivated'} successfully!`);
      await fetchPlans();
    } catch (error: any) {
      console.error('Toggle plan status error:', error);
    }
  }, [plans, getHeaders, fetchPlans]);

  const handleDeletePlan = useCallback(async (id: string) => {
    try {
      const response = await fetch(`${process.env.VITE_API_BASE_URL}/subscription-plans/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to delete plan');
      }

      toast.success('Plan deleted successfully!');
      await fetchPlans();
    } catch (error: any) {
      console.error('Delete plan error:', error);
    }
  }, [getHeaders, fetchPlans]);

  const handleSavePlan = useCallback(async (planData: Plan, editingPlanId: string | null) => {
    try {
      const headers = getHeaders();
      const numMonths = Number(planData.numberOfMonths) || 1;
      // Clean price string to number
      const numericPrice = Number(String(planData.price).replace(/[^\d]/g, ''));

      const payload = {
        title: planData.name,
        description: planData.description,
        price: numericPrice,
        numberOfMonths: numMonths,
      };

      if (editingPlanId) {
        // Edit mode
        const response = await fetch(`${process.env.VITE_API_BASE_URL}/subscription-plans/${editingPlanId}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.message || 'Failed to update plan');
        }

        toast.success('Plan updated successfully!');
      } else {
        // Add mode
        const response = await fetch(`${process.env.VITE_API_BASE_URL}/subscription-plans`, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.message || 'Failed to create plan');
        }

        toast.success('Plan created successfully!');
      }

      await fetchPlans();
    } catch (error: any) {
      console.error('Save plan error:', error);
    }
  }, [getHeaders, fetchPlans]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  return {
    plans,
    loading,
    fetchPlans,
    handleToggleStatus,
    handleDeletePlan,
    handleSavePlan,
  };
};

