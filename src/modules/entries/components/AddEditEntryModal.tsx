import React, { useState, useEffect } from 'react';
import { X, User, CreditCard, Calendar } from 'lucide-react';
import { TextArea, Select } from '@/shared';

interface AddEditEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: any) => void;
  entryToEdit?: any | null;
  mode?: 'add' | 'edit' | 'view';
}

export const AddEditEntryModal: React.FC<AddEditEntryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  entryToEdit = null,
  mode = 'add',
}) => {
  const [formData, setFormData] = useState({
    userId: '',
    subscriptionPlanId: '',
    note: '',
    date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
    paymentMethod: 'Cash',
  });

  const [users, setUsers] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      const token = localStorage.getItem('accessToken');
      const headers = {
        'accept': '*/*',
        'Authorization': `Bearer ${token}`
      };

      // Fetch users: in add mode, fetch only active members; otherwise fetch all
      const userUrl = `${process.env.VITE_API_BASE_URL}/users${mode === 'add' ? '?nonActive=true' : ''}`;
      fetch(userUrl, { headers })
        .then(res => res.json())
        .then(resData => {
          if (resData && resData.success && Array.isArray(resData.data)) {
            setUsers(resData.data);
          }
        })
        .catch(err => console.error('Error fetching users:', err));

      // Fetch plans
      fetch(`${process.env.VITE_API_BASE_URL}/subscription-plans`, { headers })
        .then(res => res.json())
        .then(resData => {
          if (resData && resData.success && Array.isArray(resData.data)) {
            setPlans(resData.data);
          }
        })
        .catch(err => console.error('Error fetching plans:', err));

      if (entryToEdit && (mode === 'edit' || mode === 'view')) {
        const rawDate = entryToEdit.entryDate || entryToEdit.createdAt || new Date().toISOString();
        setFormData({
          userId: entryToEdit.userId?._id || entryToEdit.userId || '',
          subscriptionPlanId: entryToEdit.subscriptionPlanId?._id || entryToEdit.subscriptionPlanId || '',
          note: entryToEdit.note || '',
          date: new Date(rawDate).toISOString().split('T')[0],
          paymentMethod: entryToEdit.paymentMethod || 'Cash',
        });
      } else {
        setFormData({
          userId: '',
          subscriptionPlanId: '',
          note: '',
          date: new Date().toISOString().split('T')[0],
          paymentMethod: 'Cash',
        });
      }
      setErrors({});
    }
  }, [isOpen, entryToEdit, mode]);

  // Auto-select the user's plan when a user is selected (only in add mode)
  const handleUserChange = (value: string) => {
    setFormData(prev => ({ ...prev, userId: value }));

    if (mode === 'add' && value) {
      const selectedUser = users.find(u => u._id === value);
      if (selectedUser && selectedUser.subscriptionPlanId) {
        setFormData(prev => ({ ...prev, subscriptionPlanId: selectedUser.subscriptionPlanId }));
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === 'userId') {
      handleUserChange(value);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    if (errors[name]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'view') {
      onClose();
      return;
    }

    const newErrors: Record<string, string> = {};
    if (!formData.userId) newErrors.userId = 'User is required';
    if (!formData.subscriptionPlanId) newErrors.subscriptionPlanId = 'Subscription plan is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      userId: formData.userId,
      subscriptionPlanId: formData.subscriptionPlanId,
      note: formData.note,
      paymentMethod: formData.paymentMethod,
      entryDate: new Date(formData.date).toISOString(), // Use entryDate instead of createdAt
    });
    onClose();
  };

  if (!isOpen) return null;

  const userOptions = users.map(u => ({
    value: u._id,
    label: `${u.firstName} ${u.lastName} (${u.phoneNumber})`,
  }));

  const planOptions = plans.map(p => ({
    value: p._id,
    label: `${p.title} (₹${p.price})`,
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto z-10 border border-slate-100 animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {mode === 'view' ? 'Entry Details' : mode === 'edit' ? 'Edit Entry' : 'Create Entry Log'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {mode === 'view'
                ? 'Viewing user check-in entry details'
                : mode === 'edit'
                  ? 'Update check-in entry note, plan or user details'
                  : 'Log a new gym entry for a member'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">

          {/* User Selection */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <User className="w-4 h-4 text-primary" />
              <span>Select Member *</span>
            </label>
            <Select
              value={formData.userId}
              onChange={(val) => handleSelectChange('userId', val)}
              options={userOptions}
              disabled={mode === 'view'}
              placeholder="Search or select a member"
            />
            {errors.userId && <p className="text-rose-500 text-xs mt-1">{errors.userId}</p>}
          </div>

          {/* Subscription Plan Selection */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-primary" />
              <span>Subscription Plan *</span>
            </label>
            <Select
              value={formData.subscriptionPlanId}
              onChange={(val) => handleSelectChange('subscriptionPlanId', val)}
              options={planOptions}
              disabled={mode === 'view'}
              placeholder="Select a subscription plan"
            />
            {errors.subscriptionPlanId && <p className="text-rose-500 text-xs mt-1">{errors.subscriptionPlanId}</p>}
          </div>

          {/* Date selector */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-primary" />
              <span>Date</span>
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              disabled={mode === 'view'}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all duration-200 disabled:bg-slate-50 disabled:text-slate-400"
            />
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-primary" />
              <span>Payment Method</span>
            </label>
            <Select
              value={formData.paymentMethod}
              onChange={(val) => handleSelectChange('paymentMethod', val)}
              options={[
                { value: 'Cash', label: 'Cash' },
                { value: 'UPI', label: 'UPI' },
              ]}
              disabled={mode === 'view'}
            />
          </div>

          {/* Note Input */}
          <div>
            <TextArea
              label="Note (Optional)"
              name="note"
              value={formData.note}
              onChange={handleChange}
              placeholder="Add any specific check-in details or notes..."
              disabled={mode === 'view'}
              rows={3}
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-semibold rounded-full transition-all duration-200"
            >
              {mode === 'view' ? 'Close' : 'Cancel'}
            </button>
            {mode !== 'view' && (
              <button
                type="submit"
                className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-semibold rounded-full shadow-md shadow-red-500/10 transition-all duration-200 active:scale-95"
              >
                {mode === 'edit' ? 'Update Entry' : 'Log Entry'}
              </button>
            )}
          </div>

        </form>
      </div>
    </div>
  );
};
