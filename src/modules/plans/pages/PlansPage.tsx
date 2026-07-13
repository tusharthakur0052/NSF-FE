import React, { useState, useEffect } from 'react';
import { Plus, Users, Edit3, Trash2, Power, Award } from 'lucide-react';
import { AddEditPlanModal, type Plan } from '../components/AddEditPlanModal';
import { DeleteConfirmationModal } from '@/shared';

export const PlansPage: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<Plan | null>(null);

  // Format currency helpers
  const formatPrice = (price: string) => {
    if (price.startsWith('₹')) return price;
    return `₹${Number(price).toLocaleString('en-IN')}`;
  };

  const getHeaders = () => {
    const token = localStorage.getItem('accessToken');
    return {
      'accept': '*/*',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const fetchPlans = async () => {
    try {
      const response = await fetch('http://localhost:9001/subscription-plans', {
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
            members: 0,
            popular: plan.description.toLowerCase().includes('popular') || false
          };
        });
        setPlans(mappedPlans);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleCreateClick = () => {
    setEditingPlan(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (plan: Plan) => {
    setEditingPlan(plan);
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (id: string) => {
    try {
      const plan = plans.find(p => p.id === id);
      if (!plan) return;

      const newIsActive = plan.status !== 'Active';
      const response = await fetch(`http://localhost:9001/subscription-plans/${id}/status`, {
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
  };

  const handleDeleteClick = (plan: Plan) => {
    setPlanToDelete(plan);
    setDeleteModalOpen(true);
  };

  const confirmDeletePlan = async () => {
    if (planToDelete && planToDelete.id) {
      try {
        const response = await fetch(`http://localhost:9001/subscription-plans/${planToDelete.id}`, {
          method: 'DELETE',
          headers: getHeaders()
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.message || 'Failed to delete plan');
        }

        await fetchPlans();
        setDeleteModalOpen(false);
        setPlanToDelete(null);
      } catch (error: any) {
        alert(error.message || 'Something went wrong while deleting the plan.');
      }
    }
  };

  const handleSavePlan = async (planData: Plan) => {
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

      if (editingPlan && editingPlan.id) {
        // Edit mode
        const response = await fetch(`http://localhost:9001/subscription-plans/${editingPlan.id}`, {
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
        const response = await fetch('http://localhost:9001/subscription-plans', {
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
    setIsModalOpen(false);
  };

  // Extract cards to show (max 4, active status preferred, popular status preferred)
  const displayCards = plans.filter(p => p.status === 'Active').slice(0, 4);

  return (
    <div className="space-y-8 p-4 md:p-0">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Subscription Plans</h1>
          <p className="text-slate-500 mt-1 text-sm">Create and manage membership plans.</p>
        </div>

        <button
          onClick={handleCreateClick}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-semibold rounded-full shadow-md shadow-red-500/15 transition-all self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>Create Plan</span>
        </button>
      </div>

      {/* Grid of display cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {displayCards.map((plan) => {
          const isPopular = plan.popular;
          return (
            <div
              key={plan.id}
              className={`relative p-6 rounded-2xl border transition-all duration-300 flex flex-col justify-between min-h-[220px] ${isPopular
                  ? 'bg-primary text-white border-primary shadow-lg shadow-red-500/20'
                  : 'bg-white text-slate-800 border-slate-100 shadow-soft hover:shadow-md'
                }`}
            >
              {isPopular && (
                <span className="absolute top-4 right-4 bg-white/20 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Award className="w-3 h-3" />
                  Popular
                </span>
              )}

              <div>
                <p className={`text-xs font-semibold uppercase tracking-wider ${isPopular ? 'text-white/70' : 'text-slate-400'}`}>
                  {plan.name}
                </p>
                <h3 className="text-3xl font-extrabold mt-2 tracking-tight">
                  {plan.price}
                </h3>
                <p className={`text-xs font-medium mt-1 ${isPopular ? 'text-white/80' : 'text-slate-500'}`}>
                  {plan.duration}
                </p>
              </div>

              <div className="mt-4">
                <p className={`text-sm ${isPopular ? 'text-white/90' : 'text-slate-600'} font-medium`}>
                  {plan.description}
                </p>
                <div className={`flex items-center gap-2 mt-4 text-xs font-semibold ${isPopular ? 'text-white/70' : 'text-slate-400'}`}>
                  <Users className="w-4 h-4" />
                  <span>{plan.members} active members</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Table Section: All Plans */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-soft overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-50">
          <h4 className="font-bold text-lg text-slate-900">All Plans</h4>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Plan</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Description</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Duration</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Price</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Members</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {plans.map((plan) => (
                <tr key={plan.id} className="hover:bg-slate-50/40 transition-colors">

                  {/* Plan Name */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">
                    {plan.name}
                  </td>

                  {/* Description */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-medium">
                    {plan.description}
                  </td>

                  {/* Duration */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-semibold">
                    {plan.duration}
                  </td>

                  {/* Price */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-extrabold">
                    {plan.price}
                  </td>

                  {/* Active members */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-semibold">
                    {plan.members}
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${plan.status === 'Active'
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-slate-100 text-slate-500'
                      }`}>
                      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${plan.status === 'Active'
                          ? 'bg-emerald-500'
                          : 'bg-slate-400'
                        }`} />
                      {plan.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEditClick(plan)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        title="Edit Plan"
                      >
                        <Edit3 className="w-4.5 h-4.5" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(plan.id!)}
                        className={`p-1.5 rounded-lg transition-colors ${plan.status === 'Active'
                            ? 'text-emerald-500 hover:bg-emerald-50 hover:text-emerald-600'
                            : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                          }`}
                        title={plan.status === 'Active' ? 'Deactivate Plan' : 'Activate Plan'}
                      >
                        <Power className="w-4.5 h-4.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(plan)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete Plan"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>

                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Plan Modal */}
      <AddEditPlanModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSavePlan}
        planToEdit={editingPlan}
      />

      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDeletePlan}
        title="Delete Plan"
        description={
          planToDelete ? (
            <>
              Are you sure you want to delete the <span className="font-semibold text-slate-800">{planToDelete.name}</span> subscription plan? This action cannot be undone.
            </>
          ) : null
        }
      />
    </div>
  );
};
