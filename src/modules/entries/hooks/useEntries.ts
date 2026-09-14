import { useState, useCallback } from 'react';
import { toast } from '@/shared';

export const useEntries = () => {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEntries, setTotalEntries] = useState(0);

  const getHeaders = useCallback(() => {
    const token = localStorage.getItem('accessToken');
    return {
      'accept': '*/*',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }, []);

  const fetchEntries = useCallback(async (page: number, limit: number, search: string) => {
    try {
      setLoading(true);
      const headers = getHeaders();
      let url = `${process.env.VITE_API_BASE_URL}/entries?page=${page}&limit=${limit}`;
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }

      const response = await fetch(url, { headers });
      const resData = await response.json();

      if (resData && resData.success && Array.isArray(resData.data)) {
        setEntries(resData.data);
        setTotalEntries(resData.total || resData.data.length);
        setTotalPages(resData.totalPages || Math.ceil((resData.total || resData.data.length) / limit));
      }
    } catch (error) {
      console.error('Error fetching entries:', error);
    } finally {
      setLoading(false);
    }
  }, [getHeaders]);

  const handleSaveEntry = useCallback(async (entryData: any, editingEntryId: string | null) => {
    try {
      const headers = getHeaders();
      let response;
      if (editingEntryId) {
        // Edit Mode
        response = await fetch(`${process.env.VITE_API_BASE_URL}/entries/${editingEntryId}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify(entryData),
        });
      } else {
        // Add Mode
        response = await fetch(`${process.env.VITE_API_BASE_URL}/entries`, {
          method: 'POST',
          headers,
          body: JSON.stringify(entryData),
        });
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to save entry');
      }

      toast.success(editingEntryId ? 'Entry updated successfully!' : 'Entry created successfully!');
    } catch (error: any) {
      console.error('Save entry error:', error);
    }
  }, [getHeaders]);

  const handleDeleteEntry = useCallback(async (id: string) => {
    try {
      const headers = getHeaders();
      const response = await fetch(`${process.env.VITE_API_BASE_URL}/entries/${id}`, {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete entry');
      }

      toast.success('Entry deleted successfully!');
    } catch (error: any) {
      console.error('Delete entry error:', error);
    }
  }, [getHeaders]);

  return {
    entries,
    loading,
    totalPages,
    totalEntries,
    fetchEntries,
    handleSaveEntry,
    handleDeleteEntry,
  };
};

