import React, { useState } from 'react';
import { X, User, CreditCard, Smartphone, MapPin, Fingerprint, Calendar } from 'lucide-react';
import { Input, TextArea, Select } from '@/shared';
import { MemberPhotoCapture } from './MemberPhotoCapture';
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
    admissionNo: '',
    address: '',
    plan: 'Standard',
    status: 'Active',
    joinDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'Cash',
    imageUrl: '',
    documentId: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [plans, setPlans] = useState<any[]>([]);

  const extractPhoneDigits = (raw: string) => {
    let cleaned = (raw || '').replace(/\D/g, '');
    if (cleaned.startsWith('91') && cleaned.length > 10) {
      cleaned = cleaned.slice(2);
    } else if (cleaned.startsWith('0') && cleaned.length > 10) {
      cleaned = cleaned.slice(1);
    }
    return cleaned.slice(0, 10);
  };

  React.useEffect(() => {
    if (isOpen) {
      if (member && (mode === 'edit' || mode === 'view')) {
        const [first, ...rest] = (member.name || '').split(' ');
        setFormData({
          firstName: first || '',
          lastName: rest.join(' ') || '',
          phone: extractPhoneDigits(member.phone || ''),
          dob: (member as any).dob || '',
          age: member.age?.toString() || '',
          fingerprintId: (member as any).fingerprintId || '',
          admissionNo: member.admission_No || '',
          address: (member as any).address || '',
          plan: (member as any).subscriptionPlanId || member.plan || '',
          status: member.status || 'Active',
          joinDate: member.joinDate || new Date().toISOString().split('T')[0],
          paymentMethod: (member as any).paymentMethod || 'Cash',
          imageUrl: (member as any).imageUrl || '',
          documentId: (member as any).documentId || '',
        });
      } else {
        setFormData({
          firstName: '',
          lastName: '',
          phone: '',
          dob: '',
          age: '',
          fingerprintId: '',
          admissionNo: '',
          address: '',
          plan: 'Standard',
          status: 'Active',
          joinDate: new Date().toISOString().split('T')[0],
          paymentMethod: 'Cash',
          imageUrl: '',
          documentId: '',
        });
      }
      setErrors({});
    }
  }, [isOpen, member, mode]);

  React.useEffect(() => {
    if (isOpen) {
      const token = localStorage.getItem('accessToken');
      fetch(`${process.env.VITE_API_BASE_URL}/subscription-plans`, {
        headers: {
          'accept': '*/*',
          'Authorization': `Bearer ${token}`
        }
      })
        .then(res => res.json())
        .then(resData => {
          if (resData && resData.success && Array.isArray(resData.data)) {
            setPlans(resData.data);
            // If we are in 'add' mode and have plans, default the selected plan to the first plan's ID
            if (mode === 'add' && resData.data.length > 0 && !formData.plan) {
              setFormData(prev => ({ ...prev, plan: resData.data[0]._id }));
            }
          }
        })
        .catch(err => console.error("Error fetching subscription plans:", err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === 'phone') {
      const digitsOnly = extractPhoneDigits(value);
      setFormData((prev) => ({ ...prev, phone: digitsOnly }));
      if (errors.phone) {
        setErrors((prev) => {
          const copy = { ...prev };
          delete copy.phone;
          return copy;
        });
      }
      return;
    }

    let extra = {};
    if (name === 'dob' && value) {
      const birthDate = new Date(value);
      if (!isNaN(birthDate.getTime())) {
        const today = new Date();
        let calculatedAge = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          calculatedAge--;
        }
        extra = { age: Math.max(0, calculatedAge).toString() };
      }
    }

    setFormData((prev) => ({ ...prev, [name]: value, ...extra }));
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

    // First Name Validation
    const trimmedFirst = formData.firstName.trim();
    if (!trimmedFirst) {
      newErrors.firstName = 'First name is required';
    } else if (trimmedFirst.length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    } else if (!/^[a-zA-Z\s'-]+$/.test(trimmedFirst)) {
      newErrors.firstName = 'First name can only contain letters';
    }

    // Last Name Validation
    const trimmedLast = formData.lastName.trim();
    if (!trimmedLast) {
      newErrors.lastName = 'Last name is required';
    } else if (!/^[a-zA-Z\s'-]+$/.test(trimmedLast)) {
      newErrors.lastName = 'Last name can only contain letters';
    }

    // Phone Number Validation (+91 default country code)
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (formData.phone.length !== 10) {
      newErrors.phone = 'Phone number must be exactly 10 digits';
    } else if (!/^[6-9]\d{9}$/.test(formData.phone)) {
      newErrors.phone = 'Phone number must start with 6, 7, 8, or 9';
    }

    // Date of Birth Validation
    if (!formData.dob) {
      newErrors.dob = 'Date of birth is required';
    } else {
      const birthDate = new Date(formData.dob);
      const today = new Date();
      if (isNaN(birthDate.getTime())) {
        newErrors.dob = 'Please enter a valid date of birth';
      } else if (birthDate > today) {
        newErrors.dob = 'Date of birth cannot be in the future';
      } else {
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        if (age < 5) {
          newErrors.dob = 'Member must be at least 5 years old';
        } else if (age > 120) {
          newErrors.dob = 'Please enter a valid date of birth';
        }
      }
    }

    // Plan Validation
    if (mode === 'add' && !formData.plan) {
      newErrors.plan = 'Please select a membership plan';
    }

    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const fullPhoneNumber = `+91${formData.phone.trim()}`;

    const payload = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
      phone: fullPhoneNumber,
      age: parseInt(formData.age, 10) || 25,
      plan: formData.plan,
      status: formData.status,
      lastVisit: member && mode === 'edit' ? member.lastVisit : new Date().toISOString().split('T')[0],
      joinDate: formData.joinDate,
      dob: formData.dob,
      fingerprintId: formData.fingerprintId,
      admissionNo: formData.admissionNo,
      address: formData.address,
      paymentMethod: formData.paymentMethod,
      imageUrl: formData.imageUrl,
      documentId: formData.documentId || null,
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
      admissionNo: '',
      address: '',
      plan: 'Standard',
      status: 'Active',
      joinDate: new Date().toISOString().split('T')[0],
      paymentMethod: 'Cash',
      imageUrl: '',
      documentId: '',
    });
    onClose();
  };



  const planOptions = plans.length > 0
    ? plans.map(p => ({ value: p._id, label: `${p.title} (₹${p.price})` }))
    : [
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

          {/* Member Photo Capture / Upload Section */}
          <MemberPhotoCapture
            value={formData.imageUrl}
            documentId={formData.documentId}
            onChange={(url, docId) =>
              setFormData((prev) => ({
                ...prev,
                imageUrl: url,
                documentId: docId !== undefined ? docId : prev.documentId,
              }))
            }
            disabled={mode === 'view'}
            mode={mode}
          />

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
                placeholder="e.g. Tushar"
                maxLength={50}
                error={errors.firstName}
                disabled={mode === 'view'}
              />

              <Input
                label="Last Name"
                name="lastName"
                required={mode !== 'view'}
                value={formData.lastName}
                onChange={handleChange}
                placeholder="e.g. Thakur"
                maxLength={50}
                error={errors.lastName}
                disabled={mode === 'view'}
              />

              <Input
                label="Phone Number"
                name="phone"
                type="tel"
                prefix="+91"
                required={mode !== 'view'}
                value={formData.phone}
                onChange={handleChange}
                placeholder="98765 43210"
                maxLength={10}
                error={errors.phone}
                icon={<Smartphone className="w-4 h-4 text-slate-400" />}
                disabled={mode === 'view'}
              />

              <Input
                label="Date of Birth"
                name="dob"
                type="date"
                max={new Date().toISOString().split('T')[0]}
                required={mode !== 'view'}
                value={formData.dob}
                onChange={handleChange}
                error={errors.dob}
                disabled={mode === 'view'}
              />

              <Input
                label="Age (auto-calculated)"
                name="age"
                type="number"
                value={formData.age}
                onChange={handleChange}
                placeholder="e.g. 25"
                disabled={true}
              />

              <Input
                label="Admission No. id"
                name="admissionNo"
                value={formData.admissionNo}
                onChange={handleChange}
                placeholder="1"
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
                error={errors.plan}
                required={mode !== 'view'}
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

              <Select
                label="Payment Method"
                options={[
                  { value: 'Cash', label: 'Cash' },
                  { value: 'UPI', label: 'UPI' },
                ]}
                value={formData.paymentMethod}
                onChange={(val) => handleSelectChange('paymentMethod', val)}
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
