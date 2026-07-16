import React from 'react';
import { Plus, Users, Edit3, Trash2, Power, Award } from 'lucide-react';
import { AddEditPlanModal, type Plan } from '../components/AddEditPlanModal';
import { DeleteConfirmationModal, useModal } from '@/shared';
import { usePlans } from '../hooks/usePlans';

export const PlansPage: React.FC = () => {
  const {
    plans,
    loading,
    handleToggleStatus,
    handleDeletePlan,
    handleSavePlan,
  } = usePlans();

  const planModal = useModal<Plan>();
  const deleteModal = useModal<Plan>();

  // Format currency helpers
  const formatPrice = (price: string) => {
    if (price.startsWith('₹')) return price;
    return `₹${Number(price).toLocaleString('en-IN')}`;
  };

  const onSave = async (planData: Plan) => {
    await handleSavePlan(planData, planModal.activeItem?.id || null);
    planModal.close();
  };

  const onDeleteConfirm = async () => {
    if (deleteModal.activeItem && deleteModal.activeItem.id) {
      await handleDeletePlan(deleteModal.activeItem.id);
      deleteModal.close();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

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
          onClick={planModal.openAdd}
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
              className={`bg-white rounded-2xl border p-6 flex flex-col justify-between relative overflow-hidden transition-all duration-300 hover:shadow-md ${
                isPopular ? 'border-primary ring-1 ring-primary' : 'border-slate-100'
              }`}
            >
              {isPopular && (
                <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold uppercase tracking-wider px-3.5 py-1 rounded-bl-xl flex items-center gap-1 shadow-sm">
                  <Award className="w-3.5 h-3.5" />
                  <span>Popular</span>
                </div>
              )}

              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  {plan.duration}
                </span>
                <h4 className="font-bold text-xl text-slate-800 mt-1.5">{plan.name}</h4>
                <p className="text-slate-400 text-xs mt-2 leading-relaxed min-h-[48px]">
                  {plan.description}
                </p>
              </div>

              <div className="mt-6 pt-5 border-t border-slate-50 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase block">Price</span>
                  <span className="text-2xl font-extrabold text-slate-900 mt-0.5 block">
                    {formatPrice(plan.price)}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-8 h-8 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center">
                    <Users className="w-4.5 h-4.5" />
                  </div>
                  <span className="text-sm font-bold text-slate-800">{plan.members}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Plans Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-soft overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex items-center justify-between">
          <h4 className="font-bold text-lg text-slate-950">All Subscription Plans</h4>
          <span className="text-xs font-bold text-slate-450 bg-slate-50 px-3 py-1.5 rounded-full">
            Total {plans.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Plan Name</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Duration</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Price</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Enrolled Members</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {plans.map((plan) => (
                <tr key={plan.id} className="hover:bg-slate-50/40 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">{plan.name}</div>
                      <div className="text-xs text-slate-400 mt-0.5 max-w-xs truncate">{plan.description}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-semibold">
                    {plan.duration}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800 font-bold">
                    {formatPrice(plan.price)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800 font-medium">
                    {plan.members}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                      plan.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {plan.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleToggleStatus(plan.id!)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          plan.status === 'Active'
                            ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'
                            : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                        }`}
                        title={plan.status === 'Active' ? 'Deactivate Plan' : 'Activate Plan'}
                      >
                        <Power className="w-4.5 h-4.5" />
                      </button>
                      <button
                        onClick={() => planModal.openEdit(plan)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                        title="Edit Plan"
                      >
                        <Edit3 className="w-4.5 h-4.5" />
                      </button>
                      <button
                        onClick={() => deleteModal.openEdit(plan)}
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

      {/* Save Modal */}
      <AddEditPlanModal
        isOpen={planModal.isOpen}
        onClose={planModal.close}
        onSave={onSave}
        planToEdit={planModal.activeItem}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        onConfirm={onDeleteConfirm}
        title="Delete Subscription Plan"
        description={
          deleteModal.activeItem ? (
            <>
              Are you sure you want to delete <span className="font-semibold text-slate-800">{deleteModal.activeItem.name}</span>? This action cannot be undone.
            </>
          ) : null
        }
      />

    </div>
  );
};
