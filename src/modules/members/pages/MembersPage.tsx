import React, { useState, useEffect } from 'react';
import {
  Search,
  Download,
  Plus,
  Filter,
  Eye,
  Edit3,
  RotateCw,
  Trash2
} from 'lucide-react';
import { AddMemberModal } from '../components/AddMemberModal';
import { Select, Pagination, DeleteConfirmationModal, useModal, usePagination } from '@/shared';
import { useMembers } from '../hooks/useMembers';

export interface Member {
  id: string;
  name: string;
  phone: string;
  age: number;
  plan: string;
  status: 'Active' | 'Expiring Soon' | 'Expired';
  lastVisit: string;
  joinDate: string;
  latestSubscriptionDate?: string;
  dob?: string;
  fingerprintId?: string;
  address?: string;
  subscriptionPlanId?: any;
}

export const MembersPage: React.FC = () => {
  const {
    members,
    loading,
    totalPages,
    totalMembers,
    fetchData,
    handleAddMember,
    handleEditMember,
    handleDeleteMember,
  } = useMembers();

  const [searchQuery, setSearchQuery] = useState('');
  const [planFilter, setPlanFilter] = useState('All Plans');
  const [statusFilter, setStatusFilter] = useState('All Status');

  const memberModal = useModal<Member>();
  const deleteModal = useModal<Member>();
  const { currentPage, setCurrentPage, resetPage } = usePagination(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchData(currentPage, itemsPerPage, searchQuery, statusFilter, planFilter);
  }, [currentPage, searchQuery, statusFilter, planFilter, fetchData]);

  // Get Initials for Avatar
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const onAddMemberSave = async (data: any) => {
    await handleAddMember(data);
    fetchData(currentPage, itemsPerPage, searchQuery, statusFilter, planFilter);
    resetPage();
  };

  const onEditMemberSave = async (id: string, data: any) => {
    await handleEditMember(id, data);
    fetchData(currentPage, itemsPerPage, searchQuery, statusFilter, planFilter);
  };

  const onDeleteConfirm = async () => {
    if (deleteModal.activeItem) {
      await handleDeleteMember(deleteModal.activeItem.id);
      fetchData(currentPage, itemsPerPage, searchQuery, statusFilter, planFilter);
      deleteModal.close();
      resetPage();
    }
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    resetPage();
  };

  const handlePlanFilterChange = (val: string) => {
    setPlanFilter(val);
    resetPage();
  };

  const handleStatusFilterChange = (val: string) => {
    setStatusFilter(val);
    resetPage();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Members</h1>
          <p className="text-slate-500 mt-1 text-sm">{totalMembers} members</p>
        </div>

        <div className="flex gap-3">
          <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-lg shadow-sm transition-all">
            <Download className="w-4 h-4 text-slate-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={memberModal.openAdd}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-semibold rounded-full shadow-md shadow-red-500/15 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Member</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-soft flex flex-col md:flex-row gap-4 items-center">
        {/* Search */}
        <div className="relative w-full md:flex-1">
          <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search by name or phone..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border-0 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all text-slate-700 placeholder-slate-400"
          />
        </div>

        {/* Dropdowns & More button */}
        <div className="flex flex-wrap w-full md:w-auto items-center gap-3">
          <div className="min-w-[140px] flex-1 sm:flex-initial">
            <Select
              options={[
                { value: 'All Plans', label: 'All Plans' },
                { value: 'Basic', label: 'Basic' },
                { value: 'Standard', label: 'Standard' },
                { value: 'Premium', label: 'Premium' },
                { value: 'Elite', label: 'Elite' },
                { value: 'Quarterly', label: 'Quarterly' },
                { value: 'Annual', label: 'Annual' },
              ]}
              value={planFilter}
              onChange={handlePlanFilterChange}
              variant="pill"
            />
          </div>

          <div className="min-w-[140px] flex-1 sm:flex-initial">
            <Select
              options={[
                { value: 'All Status', label: 'All Status' },
                { value: 'Active', label: 'Active' },
                { value: 'Expiring Soon', label: 'Expiring Soon' },
                { value: 'Expired', label: 'Expired' },
              ]}
              value={statusFilter}
              onChange={handleStatusFilterChange}
              variant="pill"
            />
          </div>

          <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 hover:bg-slate-100 border-0 rounded-full text-sm font-medium text-slate-700 transition-colors">
            <Filter className="w-4 h-4 text-slate-400" />
            <span>More</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Member</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Age</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Plan</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                {/* <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Last Visit</th> */}
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Join Date</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Latest Subscription</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {members.map((member) => (
                <tr key={member.id} className="hover:bg-slate-50/40 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs">
                        {getInitials(member.name)}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-900">{member.name}</div>
                        {/* <div className="text-xs text-slate-450">ID: {member.id}</div> */}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">
                    {member.phone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-650 font-medium">
                    {member.age}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-semibold">
                    {member?.subscriptionPlanId?.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${member.status === 'Active'
                      ? 'bg-emerald-50 text-emerald-600'
                      : member.status === 'Expiring Soon'
                        ? 'bg-amber-50 text-amber-600'
                        : 'bg-rose-50 text-rose-600'
                      }`}>
                      {member.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-semibold">
                    {member.joinDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-semibold">
                    {member.latestSubscriptionDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => memberModal.openView(member)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4.5 h-4.5" />
                      </button>
                      <button
                        onClick={() => memberModal.openEdit(member)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                        title="Edit Member"
                      >
                        <Edit3 className="w-4.5 h-4.5" />
                      </button>
                      <button
                        onClick={() => alert(`Renewing plan for ${member.name}`)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                        title="Renew Subscription"
                      >
                        <RotateCw className="w-4.5 h-4.5" />
                      </button>
                      <button
                        onClick={() => deleteModal.openEdit(member)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete Member"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {members.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-400 text-sm font-medium">
                    No members found matching the filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Register / Edit / View Member Modal */}
      <AddMemberModal
        isOpen={memberModal.isOpen}
        onClose={memberModal.close}
        onAddMember={onAddMemberSave}
        onEditMember={(id, data) => onEditMemberSave(id, data)}
        mode={memberModal.mode}
        member={memberModal.activeItem}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        onConfirm={onDeleteConfirm}
        title="Delete Member"
        description={
          deleteModal.activeItem ? (
            <>
              Are you sure you want to delete <span className="font-semibold text-slate-800">{deleteModal.activeItem.name}</span> ({deleteModal.activeItem.id})? This action cannot be undone.
            </>
          ) : null
        }
      />
    </div>
  );
};
