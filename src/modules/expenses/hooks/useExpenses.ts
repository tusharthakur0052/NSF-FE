import { useState, useCallback } from 'react';
import { toast } from '@/shared';

export interface ExpenseItem {
  _id: string;
  description: string;
  amount: number;
  date: string;
  isPaid: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const useExpenses = () => {
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalExpenses, setTotalExpenses] = useState(0);

  const getHeaders = useCallback(() => {
    const token = localStorage.getItem('accessToken');
    return {
      'accept': '*/*',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }, []);

  const fetchExpenses = useCallback(
    async (
      page: number,
      limit: number,
      search: string,
      statusFilter?: string,
      startDate?: string,
      endDate?: string
    ) => {
      try {
        setLoading(true);
        const headers = getHeaders();
        let url = `${process.env.VITE_API_BASE_URL}/expenses?page=${page}&limit=${limit}`;

        if (search) {
          url += `&search=${encodeURIComponent(search)}`;
        }
        if (statusFilter && statusFilter !== 'All Status') {
          url += `&isPaid=${statusFilter === 'Paid' ? 'true' : 'false'}`;
        }
        if (startDate) {
          url += `&startDate=${encodeURIComponent(startDate)}`;
        }
        if (endDate) {
          url += `&endDate=${encodeURIComponent(endDate)}`;
        }

        const response = await fetch(url, { headers });
        const resData = await response.json();

        if (resData && resData.data && Array.isArray(resData.data)) {
          setExpenses(resData.data);
          setTotalExpenses(resData.total || resData.data.length);
          setTotalPages(resData.totalPages || Math.ceil((resData.total || resData.data.length) / limit));
        } else {
          setExpenses([]);
          setTotalExpenses(0);
          setTotalPages(1);
        }
      } catch (error) {
        console.error('Error fetching expenses:', error);
      } finally {
        setLoading(false);
      }
    },
    [getHeaders]
  );

  const handleSaveExpense = useCallback(
    async (expenseData: any, editingExpenseId: string | null) => {
      try {
        const headers = getHeaders();
        let response;
        if (editingExpenseId) {
          // Edit Mode
          response = await fetch(`${process.env.VITE_API_BASE_URL}/expenses/${editingExpenseId}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify(expenseData),
          });
        } else {
          // Add Mode
          response = await fetch(`${process.env.VITE_API_BASE_URL}/expenses`, {
            method: 'POST',
            headers,
            body: JSON.stringify(expenseData),
          });
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to save expense');
        }

        toast.success(editingExpenseId ? 'Expense updated successfully!' : 'Expense created successfully!');
      } catch (error: any) {
        console.error('Save expense error:', error);
      }
    },
    [getHeaders]
  );

  const handleDeleteExpense = useCallback(
    async (id: string) => {
      try {
        const headers = getHeaders();
        const response = await fetch(`${process.env.VITE_API_BASE_URL}/expenses/${id}`, {
          method: 'DELETE',
          headers,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to delete expense');
        }

        toast.success('Expense deleted successfully!');
      } catch (error: any) {
        console.error('Delete expense error:', error);
      }
    },
    [getHeaders]
  );

  return {
    expenses,
    loading,
    totalPages,
    totalExpenses,
    fetchExpenses,
    handleSaveExpense,
    handleDeleteExpense,
  };
};
