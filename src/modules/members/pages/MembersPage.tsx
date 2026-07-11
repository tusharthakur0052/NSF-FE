import React, { useState } from 'react';
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
import { Select, Pagination, DeleteConfirmationModal } from '@/shared';

export interface Member {
  id: string;
  name: string;
  phone: string;
  age: number;
  plan: string;
  status: 'Active' | 'Expiring Soon' | 'Expired';
  lastVisit: string;
  joinDate: string;
}

const initialMembers: Member[] = [
  { id: 'M-1000', name: 'Aarav Sharma', phone: '+91 9800000000', age: 18, plan: 'Basic', status: 'Active', lastVisit: '2026-07-07', joinDate: '2026-06-07' },
  { id: 'M-1001', name: 'Vihaan Mehta', phone: '+91 9800012345', age: 21, plan: 'Standard', status: 'Active', lastVisit: '2026-06-24', joinDate: '2026-05-27' },
  { id: 'M-1002', name: 'Reyansh Kapoor', phone: '+91 9800024690', age: 24, plan: 'Premium', status: 'Active', lastVisit: '2026-06-11', joinDate: '2026-05-16' },
  { id: 'M-1003', name: 'Ishaan Gupta', phone: '+91 9800037035', age: 27, plan: 'Elite', status: 'Expiring Soon', lastVisit: '2026-05-29', joinDate: '2026-05-05' },
  { id: 'M-1004', name: 'Aadhya Das', phone: '+91 9800049380', age: 30, plan: 'Quarterly', status: 'Expired', lastVisit: '2026-06-30', joinDate: '2026-04-24' },
  { id: 'M-1005', name: 'Myra Singh', phone: '+91 9800061725', age: 33, plan: 'Annual', status: 'Active', lastVisit: '2026-06-17', joinDate: '2026-04-13' },
  { id: 'M-1006', name: 'Pari Rao', phone: '+91 9800074070', age: 36, plan: 'Basic', status: 'Active', lastVisit: '2026-06-04', joinDate: '2026-04-02' },
  { id: 'M-1007', name: 'Vivaan Kumar', phone: '+91 9800086415', age: 39, plan: 'Standard', status: 'Active', lastVisit: '2026-07-06', joinDate: '2026-03-22' },
  { id: 'M-1008', name: 'Arjun Joshi', phone: '+91 9800098760', age: 42, plan: 'Premium', status: 'Active', lastVisit: '2026-06-23', joinDate: '2026-03-11' },
];

export const MembersPage: React.FC = () => {
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [searchQuery, setSearchQuery] = useState('');
  const [planFilter, setPlanFilter] = useState('All Plans');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view'>('add');
  const [activeMember, setActiveMember] = useState<Member | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Get Initials for Avatar
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  // Add Member handler
  const handleAddMember = (newMemberData: any) => {
    const nextId = `M-${1000 + members.length}`;
    const newMember: Member = {
      id: nextId,
      name: newMemberData.name,
      phone: newMemberData.phone,
      age: parseInt(newMemberData.age, 10) || 25,
      plan: newMemberData.plan,
      status: newMemberData.status,
      lastVisit: newMemberData.lastVisit,
      joinDate: newMemberData.joinDate,
    };
    setMembers([newMember, ...members]);
    setCurrentPage(1); // Go to first page to see the new member
  };

  // Edit Member handler
  const handleEditMember = (id: string, updatedData: any) => {
    setMembers(
      members.map((m) =>
        m.id === id
          ? {
              ...m,
              name: updatedData.name,
              phone: updatedData.phone,
              age: updatedData.age,
              plan: updatedData.plan,
              status: updatedData.status,
              joinDate: updatedData.joinDate,
              dob: updatedData.dob,
              fingerprintId: updatedData.fingerprintId,
              address: updatedData.address,
            }
          : m
      )
    );
  };

  // Delete Member handler
  const confirmDeleteMember = () => {
    if (memberToDelete) {
      setMembers(members.filter(m => m.id !== memberToDelete.id));
      setDeleteModalOpen(false);
      setMemberToDelete(null);
      setCurrentPage(1);
    }
  };

  const handleDeleteTrigger = (member: Member) => {
    setMemberToDelete(member);
    setDeleteModalOpen(true);
  };

  // Filter & Search Logic
  const filteredMembers = members.filter((member) => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.phone.includes(searchQuery) ||
      member.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPlan = planFilter === 'All Plans' || member.plan.toLowerCase() === planFilter.toLowerCase();

    const matchesStatus = statusFilter === 'All Status' || member.status === statusFilter;

    return matchesSearch && matchesPlan && matchesStatus;
  });

  // Calculate paginated slice
  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
  const paginatedMembers = filteredMembers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Wrapper for state updates to reset page
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const handlePlanFilterChange = (val: string) => {
    setPlanFilter(val);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (val: string) => {
    setStatusFilter(val);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">

      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Members</h1>
          <p className="text-slate-500 mt-1 text-sm">{filteredMembers.length} members</p>
        </div>

        <div className="flex gap-3">
          <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-lg shadow-sm transition-all">
            <Download className="w-4 h-4 text-slate-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => {
              setModalMode('add');
              setActiveMember(null);
              setIsModalOpen(true);
            }}
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
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Last Visit</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Join Date</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedMembers.map((member) => (
                <tr key={member.id} className="hover:bg-slate-50/40 transition-colors">
                  {/* Member Name and ID */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs">
                        {getInitials(member.name)}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-900">{member.name}</div>
                        <div className="text-xs text-slate-400">{member.id}</div>
                      </div>
                    </div>
                  </td>

                  {/* Phone */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-medium">
                    {member.phone}
                  </td>

                  {/* Age */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 font-bold">
                    {member.age}
                  </td>

                  {/* Plan */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-medium">
                    {member.plan}
                  </td>

                  {/* Status Pills */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${member.status === 'Active'
                      ? 'bg-emerald-50 text-emerald-600'
                      : member.status === 'Expiring Soon'
                        ? 'bg-amber-50 text-amber-600'
                        : 'bg-rose-50 text-rose-600'
                      }`}>
                      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${member.status === 'Active'
                        ? 'bg-emerald-500'
                        : member.status === 'Expiring Soon'
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                        }`} />
                      {member.status}
                    </span>
                  </td>

                  {/* Last Visit */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-semibold">
                    {member.lastVisit}
                  </td>

                  {/* Join Date */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-semibold">
                    {member.joinDate}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => {
                          setActiveMember(member);
                          setModalMode('view');
                          setIsModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4.5 h-4.5" />
                      </button>
                      <button
                        onClick={() => {
                          setActiveMember(member);
                          setModalMode('edit');
                          setIsModalOpen(true);
                        }}
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
                        onClick={() => handleDeleteTrigger(member)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete Member"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredMembers.length === 0 && (
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
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddMember={handleAddMember}
        onEditMember={handleEditMember}
        mode={modalMode}
        member={activeMember}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDeleteMember}
        title="Delete Member"
        description={
          memberToDelete ? (
            <>
              Are you sure you want to delete <span className="font-semibold text-slate-800">{memberToDelete.name}</span> ({memberToDelete.id})? This action cannot be undone.
            </>
          ) : null
        }
      />

    </div>
  );
};
