import { useState, useEffect, useCallback } from 'react';
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
          let duration = '1 Month';
          let description = plan.description || '';
          if (description.includes(' | ')) {
            const parts = description.split(' | ');
            duration = parts[0];
            description = parts.slice(1).join(' | ');
          }

          return {
            id: plan._id,
            name: plan.title,
            description: description,
            duration: duration,
            price: `₹${plan.price}`,
            status: plan.isActive ? 'Active' : 'Inactive',
            members: plan.memberCount || 0,
            popular: plan.description.toLowerCase().includes('popular') || false
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
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to update plan status');
      }

      await fetchPlans();
    } catch (error: any) {
      alert(error.message || 'Something went wrong while updating plan status.');
    }
  }, [plans, getHeaders, fetchPlans]);

  const handleDeletePlan = useCallback(async (id: string) => {
    try {
      const response = await fetch(`${process.env.VITE_API_BASE_URL}/subscription-plans/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to delete plan');
      }

      await fetchPlans();
    } catch (error: any) {
      alert(error.message || 'Something went wrong while deleting the plan.');
    }
  }, [getHeaders, fetchPlans]);

  const handleSavePlan = useCallback(async (planData: Plan, editingPlanId: string | null) => {
    try {
      const headers = getHeaders();
      const serializedDescription = `${planData.duration} | ${planData.description}`;
      // Clean price string to number
      const numericPrice = Number(planData.price.replace(/[^\d]/g, ''));

      const payload = {
        title: planData.name,
        description: serializedDescription,
        price: numericPrice,
      };

      if (editingPlanId) {
        // Edit mode
        const response = await fetch(`${process.env.VITE_API_BASE_URL}/subscription-plans/${editingPlanId}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.message || 'Failed to update plan');
        }
      } else {
        // Add mode
        const response = await fetch(`${process.env.VITE_API_BASE_URL}/subscription-plans`, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.message || 'Failed to create plan');
        }
      }

      await fetchPlans();
    } catch (error: any) {
      alert(error.message || 'Something went wrong while saving the plan.');
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
