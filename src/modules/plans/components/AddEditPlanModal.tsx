import React, { useState, useEffect } from 'react';
import { X, Award } from 'lucide-react';
import { Input, Select } from '@/shared';

export interface Plan {
  id?: string;
  name: string;
  description: string;
  duration?: string;
  numberOfMonths?: number;
  price: string;
  status: 'Active' | 'Inactive';
  members?: number;
  popular?: boolean;
}

interface AddEditPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (plan: Plan) => void;
  planToEdit?: Plan | null;
}

export const AddEditPlanModal: React.FC<AddEditPlanModalProps> = ({
  isOpen,
  onClose,
  onSave,
  planToEdit,
}) => {
  const [formData, setFormData] = useState<Plan>({
    name: '',
    description: '',
    duration: '1 Month',
    numberOfMonths: 1,
    price: '',
    status: 'Active',
    popular: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (planToEdit) {
      const numMonths = planToEdit.numberOfMonths || 1;
      setFormData({
        ...planToEdit,
        numberOfMonths: numMonths,
        duration: `${numMonths} ${numMonths === 1 ? 'Month' : 'Months'}`,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        duration: '1 Month',
        numberOfMonths: 1,
        price: '',
        status: 'Active',
        popular: false,
      });
    }
    setErrors({});
  }, [planToEdit, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'numberOfMonths') {
      const num = parseInt(value, 10) || 0;
      setFormData((prev) => ({
        ...prev,
        numberOfMonths: num,
        duration: `${num} ${num === 1 ? 'Month' : 'Months'}`,
      }));
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

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePresetMonths = (months: number) => {
    setFormData((prev) => ({
      ...prev,
      numberOfMonths: months,
      duration: `${months} ${months === 1 ? 'Month' : 'Months'}`,
    }));
    if (errors.numberOfMonths) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy.numberOfMonths;
        return copy;
      });
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = 'Plan title is required';
    if (!formData.description) newErrors.description = 'Description is required';
    if (!formData.price) newErrors.price = 'Price is required';
    if (!formData.numberOfMonths || Number(formData.numberOfMonths) < 1) {
      newErrors.numberOfMonths = 'Valid duration in months is required (min: 1)';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      ...formData,
      numberOfMonths: Number(formData.numberOfMonths) || 1,
      duration: `${formData.numberOfMonths} ${Number(formData.numberOfMonths) === 1 ? 'Month' : 'Months'}`,
    });
    onClose();
  };

  const statusOptions = [
    { value: 'Active', label: 'Active' },
    { value: 'Inactive', label: 'Inactive' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md z-10 border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {planToEdit ? 'Edit Subscription Plan' : 'Create Subscription Plan'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {planToEdit ? 'Modify details of existing plan' : 'Configure details for a new tier'}
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <Input
            label="Plan Title"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Premium"
            error={errors.name}
          />

          <Input
            label="Description"
            name="description"
            required
            value={formData.description}
            onChange={handleChange}
            placeholder="e.g. All classes + trainer"
            error={errors.description}
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Input
                label="Duration (Months) *"
                name="numberOfMonths"
                type="number"
                min="1"
                required
                value={formData.numberOfMonths?.toString() || ''}
                onChange={handleChange}
                placeholder="e.g. 1"
                error={errors.numberOfMonths}
              />
              <div className="flex items-center gap-1.5 mt-2">
                {[1, 3, 6, 12].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => handlePresetMonths(m)}
                    className={`px-2 py-0.5 text-[11px] font-semibold rounded-md border transition-all ${
                      formData.numberOfMonths === m
                        ? 'bg-primary text-white border-primary shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {m}M
                  </button>
                ))}
              </div>
            </div>

            <Input
              label="Price (₹)"
              name="price"
              required
              value={formData.price}
              onChange={handleChange}
              placeholder="e.g. 7499"
              error={errors.price}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <Select
              label="Status"
              options={statusOptions}
              value={formData.status}
              onChange={(val) => handleSelectChange('status', val)}
            />

            <div className="flex items-center gap-2 pt-5">
              <input
                id="popular"
                type="checkbox"
                name="popular"
                checked={formData.popular || false}
                onChange={handleCheckboxChange}
                className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary/20"
              />
              <label htmlFor="popular" className="text-xs font-semibold text-slate-600 flex items-center gap-1 cursor-pointer">
                <Award className="w-3.5 h-3.5 text-amber-500" />
                <span>Mark as Popular</span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
            <button 
              type="button" 
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-semibold border border-slate-200 text-slate-600 rounded-full hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-semibold rounded-full shadow-md shadow-red-500/15 transition-all"
            >
              {planToEdit ? 'Save Changes' : 'Create Plan'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
