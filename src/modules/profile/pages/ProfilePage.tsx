import React, { useState } from 'react';
import { Mail, Phone, MapPin, Calendar, User } from 'lucide-react';
import { Input } from '@/shared';
import { ChangePasswordModal } from '../components/ChangePasswordModal';

export const ProfilePage: React.FC = () => {
  const [adminData, setAdminData] = useState({
    fullName: 'Aarav Sharma',
    email: 'admin@fitcore.io',
    phone: '+91 98765 43210',
    location: 'Bengaluru, IN',
    joined: 'Jan 12, 2024',
    title: 'Gym Administrator'
  });

  const [editName, setEditName] = useState(adminData.fullName);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // Get initials from name
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminData(prev => ({
      ...prev,
      fullName: editName
    }));
    alert('Profile updated successfully!');
  };

  const handleCancel = () => {
    setEditName(adminData.fullName);
  };

  const handlePasswordConfirm = (newPassword: string) => {
    alert('Password updated successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Profile</h1>
        <p className="text-slate-500 mt-1 text-sm">Your admin account details.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Avatar Card */}
        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-soft flex flex-col items-center text-center h-fit">
          <div className="w-24 h-24 rounded-full bg-primary text-white flex items-center justify-center font-bold text-3xl shadow-md">
            {getInitials(adminData.fullName)}
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-5">{adminData.fullName}</h2>
          <p className="text-xs text-slate-400 font-medium mt-1">{adminData.title}</p>
          
          <button 
            type="button"
            onClick={() => alert('Change Photo clicked')}
            className="w-full mt-6 px-6 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-semibold rounded-full shadow-md shadow-red-500/15 transition-all"
          >
            Change Photo
          </button>
        </div>

        {/* Right Side: Information & Settings */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Contact Information Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-soft">
            <h3 className="text-base font-bold text-slate-900 mb-4">Contact Information</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Email */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50/60 border border-slate-100">
                <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Email</p>
                  <p className="text-sm font-bold text-slate-800 mt-0.5 break-all">{adminData.email}</p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50/60 border border-slate-100">
                <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Phone</p>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">{adminData.phone}</p>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50/60 border border-slate-100">
                <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Location</p>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">{adminData.location}</p>
                </div>
              </div>

              {/* Joined */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50/60 border border-slate-100">
                <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Joined</p>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">{adminData.joined}</p>
                </div>
              </div>

            </div>
          </div>

          {/* Account Settings Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-soft">
            <h3 className="text-base font-bold text-slate-900 mb-4">Account Settings</h3>
            
            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  name="fullName"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />

                <Input
                  label="Email"
                  name="email"
                  value={adminData.email}
                  disabled
                  className="bg-slate-100 text-slate-400 cursor-not-allowed border-slate-200"
                />
              </div>

              {/* Password Section */}
              <div className="border-t border-slate-100 pt-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Security</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Manage your account access password.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPasswordModalOpen(true)}
                    className="px-5 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-sm font-semibold border border-slate-200 rounded-full transition-all"
                  >
                    Change Password
                  </button>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-5 py-2.5 text-sm font-semibold border border-slate-200 text-slate-600 rounded-full hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-semibold rounded-full shadow-md shadow-red-500/15 transition-all"
                >
                  Update
                </button>
              </div>

            </form>
          </div>

        </div>

      </div>

      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onConfirm={handlePasswordConfirm}
      />
    </div>
  );
};
