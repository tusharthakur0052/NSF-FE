import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Plus,
  Eye,
  Edit3,
  Trash2,
  Calendar,
  RotateCcw,
  Receipt,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { AddEditExpenseModal } from '../components/AddEditExpenseModal';
import {
  Select,
  Pagination,
  DeleteConfirmationModal,
  useModal,
  usePagination,
  useDebounce,
} from '@/shared';
import { useExpenses, type ExpenseItem } from '../hooks/useExpenses';

export const ExpensesPage: React.FC = () => {
  const {
    expenses,
    loading,
    totalPages,
    totalExpenses,
    fetchExpenses,
    handleSaveExpense,
    handleDeleteExpense,
  } = useExpenses();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const expenseModal = useModal<ExpenseItem>();
  const deleteModal = useModal<ExpenseItem>();
  const { currentPage, setCurrentPage, resetPage } = usePagination(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchExpenses(
      currentPage,
      itemsPerPage,
      debouncedSearchQuery,
      statusFilter,
      startDate,
      endDate
    );
  }, [
    currentPage,
    debouncedSearchQuery,
    statusFilter,
    startDate,
    endDate,
    fetchExpenses,
  ]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    resetPage();
  };

  const handleStatusFilterChange = (val: string) => {
    setStatusFilter(val);
    resetPage();
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartDate(e.target.value);
    resetPage();
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndDate(e.target.value);
    resetPage();
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('All Status');
    setStartDate('');
    setEndDate('');
    resetPage();
  };

  const onSave = async (expenseData: any) => {
    await handleSaveExpense(
      expenseData,
      expenseModal.activeItem ? expenseModal.activeItem._id : null
    );
    fetchExpenses(
      currentPage,
      itemsPerPage,
      debouncedSearchQuery,
      statusFilter,
      startDate,
      endDate
    );
  };

  const onDeleteConfirm = async () => {
    if (deleteModal.activeItem) {
      await handleDeleteExpense(deleteModal.activeItem._id);
      fetchExpenses(
        currentPage,
        itemsPerPage,
        debouncedSearchQuery,
        statusFilter,
        startDate,
        endDate
      );
      deleteModal.close();
      resetPage();
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(amount || 0);
  };

  // Stats calculation on current fetched page or dataset
  const stats = useMemo(() => {
    let totalAmt = 0;
    let paidAmt = 0;
    let pendingAmt = 0;

    expenses.forEach((item) => {
      const amt = Number(item.amount) || 0;
      totalAmt += amt;
      if (item.isPaid) {
        paidAmt += amt;
      } else {
        pendingAmt += amt;
      }
    });

    return { totalAmt, paidAmt, pendingAmt };
  }, [expenses]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Expenses</h1>
          <p className="text-slate-500 mt-1 text-sm">
            Manage, record, and track gym utility & operational expenses.
          </p>
        </div>

        <button
          onClick={expenseModal.openAdd}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-semibold rounded-full shadow-md shadow-red-500/15 transition-all self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>Add Expense</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-soft flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search expense description..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all duration-200"
          />
        </div>

        {/* Dropdowns and Date Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="min-w-[140px] flex-1 sm:flex-initial">
            <Select
              options={[
                { value: 'All Status', label: 'All Status' },
                { value: 'Paid', label: 'Paid' },
                { value: 'Unpaid', label: 'Unpaid' },
              ]}
              value={statusFilter}
              onChange={handleStatusFilterChange}
              variant="pill"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <label className="text-xs font-semibold text-slate-500 whitespace-nowrap">From:</label>
            <input
              type="date"
              value={startDate}
              onChange={handleStartDateChange}
              className="w-full sm:w-36 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-xs font-medium focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <label className="text-xs font-semibold text-slate-500 whitespace-nowrap">To:</label>
            <input
              type="date"
              value={endDate}
              onChange={handleEndDateChange}
              className="w-full sm:w-36 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-xs font-medium focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            />
          </div>

          {(startDate || endDate || searchQuery || statusFilter !== 'All Status') && (
            <button
              onClick={handleClearFilters}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl border border-slate-200 transition-colors whitespace-nowrap"
              title="Clear Filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Date</span>
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-12">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                    </div>
                  </td>
                </tr>
              ) : expenses.length > 0 ? (
                expenses.map((expense) => (
                  <tr key={expense._id} className="hover:bg-slate-50/40 transition-colors">
                    {/* Description */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-red-50 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                          <Receipt className="w-4.5 h-4.5" />
                        </div>
                        <div className="text-sm font-semibold text-slate-900 line-clamp-2">
                          {expense.description}
                        </div>
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">
                      {formatCurrency(expense.amount)}
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-semibold">
                      {formatDate(expense.date || expense.createdAt || '')}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${expense.isPaid
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-amber-50 text-amber-600'
                          }`}
                      >
                        {expense.isPaid ? 'Paid' : 'Unpaid'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => expenseModal.openView(expense)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4.5 h-4.5" />
                        </button>
                        <button
                          onClick={() => expenseModal.openEdit(expense)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                          title="Edit Expense"
                        >
                          <Edit3 className="w-4.5 h-4.5" />
                        </button>
                        <button
                          onClick={() => deleteModal.openEdit(expense)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete Expense"
                        >
                          <Trash2 className="w-4.5 h-4.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-slate-400 text-sm font-medium">
                    No expenses found matching the criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {!loading && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalExpenses}
            itemLabel="expenses"
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      {/* Add / Edit / View Expense Modal */}
      <AddEditExpenseModal
        isOpen={expenseModal.isOpen}
        onClose={expenseModal.close}
        onSave={onSave}
        expenseToEdit={expenseModal.activeItem}
        mode={expenseModal.mode}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        onConfirm={onDeleteConfirm}
        title="Delete Expense"
        description={
          deleteModal.activeItem ? (
            <>
              Are you sure you want to delete this expense{' '}
              <span className="font-semibold text-slate-800">
                "{deleteModal.activeItem.description}" (₹{deleteModal.activeItem.amount})
              </span>
              ? This action cannot be undone.
            </>
          ) : (
            'Are you sure you want to delete this expense? This action cannot be undone.'
          )
        }
      />
    </div>
  );
};
