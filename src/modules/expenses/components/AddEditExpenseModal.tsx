import React, { useState, useEffect } from 'react';
import { X, IndianRupee, Calendar, CheckCircle2 } from 'lucide-react';
import { Input, TextArea, Select } from '@/shared';
import type { ExpenseItem } from '../hooks/useExpenses';

interface AddEditExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: any) => void;
  expenseToEdit?: ExpenseItem | null;
  mode?: 'add' | 'edit' | 'view';
}

export const AddEditExpenseModal: React.FC<AddEditExpenseModalProps> = ({
  isOpen,
  onClose,
  onSave,
  expenseToEdit = null,
  mode = 'add',
}) => {
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
    isPaid: 'true',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      if (expenseToEdit && (mode === 'edit' || mode === 'view')) {
        const rawDate = expenseToEdit.date || expenseToEdit.createdAt || new Date().toISOString();
        setFormData({
          description: expenseToEdit.description || '',
          amount: expenseToEdit.amount?.toString() || '',
          date: new Date(rawDate).toISOString().split('T')[0],
          isPaid: expenseToEdit.isPaid ? 'true' : 'false',
        });
      } else {
        setFormData({
          description: '',
          amount: '',
          date: new Date().toISOString().split('T')[0],
          isPaid: 'true',
        });
      }
      setErrors({});
    }
  }, [isOpen, expenseToEdit, mode]);

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
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    const numAmount = parseFloat(formData.amount);
    if (!formData.amount || isNaN(numAmount)) {
      newErrors.amount = 'Amount is required';
    } else if (numAmount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'view') {
      onClose();
      return;
    }

    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      description: formData.description.trim(),
      amount: parseFloat(formData.amount),
      date: new Date(formData.date).toISOString(),
      isPaid: formData.isPaid === 'true',
    });
    onClose();
  };

  if (!isOpen) return null;

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
              {mode === 'view' ? 'Expense Details' : mode === 'edit' ? 'Edit Expense' : 'Add New Expense'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {mode === 'view'
                ? 'Viewing gym expense information'
                : mode === 'edit'
                  ? 'Update expense details and payment status'
                  : 'Record a new expense for the gym'}
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
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Description Input */}
          <div>
            <TextArea
              label="Expense Description *"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="e.g. Monthly Electricity Bill, Equipment Repair, Drinking Water..."
              disabled={mode === 'view'}
              error={errors.description}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Amount Input */}
            <div>
              <Input
                label="Amount (₹) *"
                name="amount"
                type="number"
                min="0"
                step="any"
                value={formData.amount}
                onChange={handleChange}
                placeholder="e.g. 2500"
                disabled={mode === 'view'}
                error={errors.amount}
                icon={<IndianRupee className="w-4 h-4 text-slate-400" />}
              />
            </div>

            {/* Date Input */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-primary" />
                <span>Date *</span>
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                disabled={mode === 'view'}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all duration-200 disabled:bg-slate-50 disabled:text-slate-400"
              />
              {errors.date && <p className="text-rose-500 text-xs mt-1">{errors.date}</p>}
            </div>
          </div>

          {/* Payment Status */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <span>Payment Status</span>
            </label>
            <Select
              value={formData.isPaid}
              onChange={(val) => handleSelectChange('isPaid', val)}
              options={[
                { value: 'true', label: 'Paid' },
                { value: 'false', label: 'Unpaid / Pending' },
              ]}
              disabled={mode === 'view'}
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
                {mode === 'edit' ? 'Update Expense' : 'Add Expense'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
