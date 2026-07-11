import React, { useState } from 'react';
import { X, User, CreditCard, Smartphone, MapPin, Fingerprint, Calendar } from 'lucide-react';
import { Input, TextArea, Select } from '@/shared';
import type { Member } from '../pages/MembersPage';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMember: (member: any) => void;
  onEditMember?: (id: string, member: any) => void;
  mode?: 'add' | 'edit' | 'view';
  member?: Member | null;
}

export const AddMemberModal: React.FC<AddMemberModalProps> = ({
  isOpen,
  onClose,
  onAddMember,
  onEditMember,
  mode = 'add',
  member = null,
}) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    dob: '',
    age: '',
    fingerprintId: '',
    address: '',
    plan: 'Standard',
    status: 'Active',
    joinDate: new Date().toISOString().split('T')[0],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  React.useEffect(() => {
    if (isOpen) {
      if (member && (mode === 'edit' || mode === 'view')) {
        const [first, ...rest] = (member.name || '').split(' ');
        setFormData({
          firstName: first || '',
          lastName: rest.join(' ') || '',
          phone: member.phone || '',
          dob: (member as any).dob || '',
          age: member.age?.toString() || '',
          fingerprintId: (member as any).fingerprintId || '',
          address: (member as any).address || '',
          plan: member.plan || 'Standard',
          status: member.status || 'Active',
          joinDate: member.joinDate || new Date().toISOString().split('T')[0],
        });
      } else {
        setFormData({
          firstName: '',
          lastName: '',
          phone: '',
          dob: '',
          age: '',
          fingerprintId: '',
          address: '',
          plan: 'Standard',
          status: 'Active',
          joinDate: new Date().toISOString().split('T')[0],
        });
      }
      setErrors({});
    }
  }, [isOpen, member, mode]);

  if (!isOpen) return null;

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
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple Validation
    const newErrors: Record<string, string> = {};
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.phone) newErrors.phone = 'Phone number is required';
    if (!formData.dob) newErrors.dob = 'Date of birth is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const fullName = `${formData.firstName} ${formData.lastName}`;
    const payload = {
      name: fullName,
      phone: formData.phone,
      age: parseInt(formData.age, 10) || 25,
      plan: formData.plan,
      status: formData.status,
      lastVisit: member && mode === 'edit' ? member.lastVisit : new Date().toISOString().split('T')[0],
      joinDate: formData.joinDate,
      dob: formData.dob,
      fingerprintId: formData.fingerprintId,
      address: formData.address,
    };

    if (mode === 'edit' && member && onEditMember) {
      onEditMember(member.id, payload);
    } else {
      onAddMember(payload);
    }

    // Reset Form
    setFormData({
      firstName: '',
      lastName: '',
      phone: '',
      dob: '',
      age: '',
      fingerprintId: '',
      address: '',
      plan: 'Standard',
      status: 'Active',
      joinDate: new Date().toISOString().split('T')[0],
    });
    onClose();
  };

  const planOptions = [
    { value: 'Basic', label: 'Basic' },
    { value: 'Standard', label: 'Standard' },
    { value: 'Premium', label: 'Premium' },
    { value: 'Elite', label: 'Elite' },
    { value: 'Quarterly', label: 'Quarterly' },
    { value: 'Annual', label: 'Annual' },
  ];

  const statusOptions = [
    { value: 'Active', label: 'Active' },
    { value: 'Expiring Soon', label: 'Expiring Soon' },
    { value: 'Expired', label: 'Expired' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto z-10 border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {mode === 'view' ? 'Member Details' : mode === 'edit' ? 'Edit Member Details' : 'Register New Member'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {mode === 'view' 
                ? 'Viewing details and membership plan for this member' 
                : mode === 'edit' 
                  ? 'Update personal details and edit membership plan' 
                  : 'Enter personal details and assign a membership plan'}
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
          
          {/* Section: Personal Info */}
          <div>
            <div className="flex items-center gap-2 mb-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <User className="w-4 h-4 text-primary" />
              <span>Personal Info</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="First Name"
                name="firstName"
                required={mode !== 'view'}
                value={formData.firstName}
                onChange={handleChange}
                placeholder="John"
                error={errors.firstName}
                disabled={mode === 'view'}
              />

              <Input
                label="Last Name"
                name="lastName"
                required={mode !== 'view'}
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Doe"
                error={errors.lastName}
                disabled={mode === 'view'}
              />

              <Input
                label="Phone Number"
                name="phone"
                type="tel"
                required={mode !== 'view'}
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 98765 43210"
                error={errors.phone}
                icon={<Smartphone className="w-4 h-4" />}
                disabled={mode === 'view'}
              />

              <Input
                label="Date of Birth"
                name="dob"
                type="date"
                required={mode !== 'view'}
                value={formData.dob}
                onChange={handleChange}
                error={errors.dob}
                disabled={mode === 'view'}
              />

              <Input
                label="Age"
                name="age"
                type="number"
                value={formData.age}
                onChange={handleChange}
                placeholder="25"
                disabled={mode === 'view'}
              />

              <Input
                label="Fingerprint ID"
                name="fingerprintId"
                value={formData.fingerprintId}
                onChange={handleChange}
                placeholder="FP-0001"
                icon={<Fingerprint className="w-4 h-4" />}
                disabled={mode === 'view'}
              />
            </div>

            <div className="mt-4">
              <TextArea
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={2}
                placeholder="Street, City, State"
                icon={<MapPin className="w-4 h-4" />}
                disabled={mode === 'view'}
              />
            </div>
          </div>

          {/* Section: Membership Plan */}
          <div className="border-t border-slate-100 pt-6">
            <div className="flex items-center gap-2 mb-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <CreditCard className="w-4 h-4 text-primary" />
              <span>Membership & Plan</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Select Plan"
                options={planOptions}
                value={formData.plan}
                onChange={(val) => handleSelectChange('plan', val)}
                disabled={mode === 'view'}
              />

              <Select
                label="Status"
                options={statusOptions}
                value={formData.status}
                onChange={(val) => handleSelectChange('status', val)}
                disabled={mode === 'view'}
              />

              <Input
                label="Start / Join Date"
                name="joinDate"
                type="date"
                value={formData.joinDate}
                onChange={handleChange}
                icon={<Calendar className="w-4 h-4 text-slate-400" />}
                disabled={mode === 'view'}
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button 
              type="button" 
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-semibold border border-slate-200 text-slate-600 rounded-full hover:bg-slate-50 transition-colors"
            >
              {mode === 'view' ? 'Close' : 'Cancel'}
            </button>
            {mode !== 'view' && (
              <button 
                type="submit"
                className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-semibold rounded-full shadow-md shadow-red-500/15 transition-all"
              >
                {mode === 'edit' ? 'Save Changes' : 'Register & Add Plan'}
              </button>
            )}
          </div>

        </form>
      </div>
    </div>
  );
};
