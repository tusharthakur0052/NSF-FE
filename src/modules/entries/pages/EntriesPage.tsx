import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Eye,
  Edit3,
  Trash2,
  Calendar
} from 'lucide-react';
import { AddEditEntryModal } from '../components/AddEditEntryModal';
import { Pagination, DeleteConfirmationModal, useModal, usePagination } from '@/shared';
import { useEntries } from '../hooks/useEntries';

export const EntriesPage: React.FC = () => {
  const {
    entries,
    loading,
    totalPages,
    fetchEntries,
    handleSaveEntry,
    handleDeleteEntry,
  } = useEntries();

  const [searchQuery, setSearchQuery] = useState('');
  const entryModal = useModal<any>();
  const deleteModal = useModal<any>();
  const { currentPage, setCurrentPage, resetPage } = usePagination(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchEntries(currentPage, itemsPerPage, searchQuery);
  }, [currentPage, searchQuery, fetchEntries]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    resetPage();
  };

  const onSave = async (entryData: any) => {
    await handleSaveEntry(entryData, entryModal.activeItem ? entryModal.activeItem._id : null);
    fetchEntries(currentPage, itemsPerPage, searchQuery);
  };

  const onDeleteConfirm = async () => {
    if (deleteModal.activeItem) {
      await handleDeleteEntry(deleteModal.activeItem._id);
      fetchEntries(currentPage, itemsPerPage, searchQuery);
      deleteModal.close();
      resetPage();
    }
  };

  const getInitials = (user: any) => {
    if (!user) return '??';
    const first = user.firstName || '';
    const last = user.lastName || '';
    return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Gym Entries</h1>
          <p className="text-slate-500 mt-1 text-sm">Track and check-in members entries.</p>
        </div>

        <button
          onClick={entryModal.openAdd}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-semibold rounded-full shadow-md shadow-red-500/15 transition-all self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>Log Entry</span>
        </button>
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
            placeholder="Search check-in note..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-full text-slate-800 text-sm focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all duration-200"
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Member</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Plan</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Payment</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Note</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Checked In</span>
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {entries.length > 0 ? (
                entries.map((entry) => (
                  <tr key={entry._id} className="hover:bg-slate-50/40 transition-colors">
                    {/* Member Info */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs">
                          {getInitials(entry.userId)}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-900">
                            {entry.userId ? `${entry.userId.firstName} ${entry.userId.lastName}` : 'Unknown User'}
                          </div>
                          <div className="text-xs text-slate-400">
                            {entry.userId?.phoneNumber || 'No phone'}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Plan */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">
                      {entry.subscriptionPlanId?.title || 'Unknown Plan'}
                    </td>

                    {/* Payment Method */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                        entry.paymentMethod === 'UPI'
                          ? 'bg-blue-50 text-blue-600'
                          : 'bg-amber-50 text-amber-600'
                      }`}>
                        {entry.paymentMethod || 'Cash'}
                      </span>
                    </td>

                    {/* Note */}
                    <td className="px-6 py-4 text-sm text-slate-500 font-medium max-w-xs truncate">
                      {entry.note || <span className="text-slate-350 italic">None</span>}
                    </td>

                    {/* Checked In Time */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-semibold">
                      {formatDate(entry.entryDate || entry.createdAt)}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => entryModal.openView(entry)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4.5 h-4.5" />
                        </button>
                        <button
                          onClick={() => entryModal.openEdit(entry)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                          title="Edit Entry"
                        >
                          <Edit3 className="w-4.5 h-4.5" />
                        </button>
                        <button
                          onClick={() => deleteModal.openEdit(entry)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete Entry"
                        >
                          <Trash2 className="w-4.5 h-4.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400 text-sm">
                    No entries logged yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {loading ? (
          <div className="flex items-center justify-center p-6">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      <AddEditEntryModal
        isOpen={entryModal.isOpen}
        onClose={entryModal.close}
        onSave={onSave}
        entryToEdit={entryModal.activeItem}
        mode={entryModal.mode}
      />

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        onConfirm={onDeleteConfirm}
        title="Delete Gym Entry Log"
        description="Are you sure you want to delete this gym entry? This action cannot be undone."
      />
    </div>
  );
};
