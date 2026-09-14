import { useState, useCallback } from 'react';
import { toast } from '@/shared';
import type { Member } from '../pages/MembersPage';

export const useMembers = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalMembers, setTotalMembers] = useState(0);

  const getHeaders = useCallback(() => {
    const token = localStorage.getItem('accessToken');
    return {
      'accept': '*/*',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }, []);

  const fetchData = useCallback(async (page: number, limit: number, search: string, statusFilter: string, planFilter: string) => {
    try {
      setLoading(true);
      const headers = getHeaders();

      // Fetch plans first to build a mapping dictionary
      const plansResponse = await fetch(`${process.env.VITE_API_BASE_URL}/subscription-plans`, { headers });
      const plansData = await plansResponse.json();
      let activePlans = [];
      const planMap: Record<string, string> = {};
      const planTitleToIdMap: Record<string, string> = {};

      if (plansData && plansData.success && Array.isArray(plansData.data)) {
        activePlans = plansData.data;
        setPlans(activePlans);
        activePlans.forEach((p: any) => {
          planMap[p._id] = p.title;
          planTitleToIdMap[p.title.toLowerCase()] = p._id;
        });
      }

      // Fetch members
      let url = `${process.env.VITE_API_BASE_URL}/users?page=${page}&limit=${limit}`;
      if (statusFilter && statusFilter !== 'All Status') {
        url += `&status=${encodeURIComponent(statusFilter)}`;
      }
      if (planFilter && planFilter !== 'All Plans') {
        const mappedPlanId = planTitleToIdMap[planFilter.toLowerCase()];
        if (mappedPlanId) {
          url += `&planId=${mappedPlanId}`;
        } else {
          url += `&planId=${encodeURIComponent(planFilter)}`;
        }
      }
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }

      const membersResponse = await fetch(url, { headers });
      const membersData = await membersResponse.json();

      if (membersData && membersData.success && Array.isArray(membersData.data)) {
        const mappedMembers: Member[] = membersData.data.map((user: any) => {
          return {
            id: user._id,
            name: `${user.firstName} ${user.lastName}`,
            phone: user.phoneNumber,
            age: user.age,
            plan: user.subscriptionPlanId?.title || planMap[user.subscriptionPlanId] || 'Standard',
            status: user.subscriptionStatus || (user.subscriptionIsActive ? 'Active' : 'Expired'),
            lastVisit: user.updatedAt ? new Date(user.updatedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            joinDate: user.createdAt ? new Date(user.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            latestSubscriptionDate: user.latestSubscriptionDate ? new Date(user.latestSubscriptionDate).toISOString().split('T')[0] : '-',
            subscriptionExpiryDate: user.subscriptionExpiryDate ? new Date(user.subscriptionExpiryDate).toISOString().split('T')[0] : '-',
            dob: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
            fingerprintId: user.fingerPrint || '',
            admission_No: user.admission_No || '',
            address: user.address || '',
            subscriptionPlanId: user.subscriptionPlanId?._id || user.subscriptionPlanId || '',
            imageUrl: user.imageUrl || '',
            documentId: user.documentId?._id || user.documentId || '',
          };
        });
        setMembers(mappedMembers);
        setTotalMembers(membersData.total || mappedMembers.length);
        setTotalPages(membersData.totalPages || Math.ceil((membersData.total || membersData.data.length) / limit));
      }
    } catch (error) {
      console.error('Error fetching members data:', error);
    } finally {
      setLoading(false);
    }
  }, [getHeaders]);

  const handleAddMember = useCallback(async (newMemberData: any) => {
    try {
      const headers = getHeaders();
      const payload = {
        firstName: newMemberData.firstName,
        lastName: newMemberData.lastName,
        phoneNumber: newMemberData.phone,
        isWhatsAppNo: true,
        gender: 'male',
        age: parseInt(newMemberData.age, 10) || 25,
        dateOfBirth: new Date(newMemberData.dob).toISOString(),
        address: newMemberData.address,
        fingerPrint: newMemberData.fingerprintId || 'FP-0001',
        admission_No: newMemberData.admissionNo || '',
        subscriptionPlanId: newMemberData.plan,
        subscriptionIsActive: newMemberData.status === 'Active',
        paymentMethod: newMemberData.paymentMethod || 'Cash',
        joinDate: newMemberData.joinDate,
        imageUrl: newMemberData.imageUrl || '',
        documentId: newMemberData.documentId || null,
      };

      const response = await fetch(`${process.env.VITE_API_BASE_URL}/users`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create user');
      }

      toast.success('Member created successfully!');
    } catch (error: any) {
      console.error('Add member error:', error);
    }
  }, [getHeaders]);

  const handleEditMember = useCallback(async (id: string, updatedData: any) => {
    try {
      const headers = getHeaders();
      const payload = {
        firstName: updatedData.firstName,
        lastName: updatedData.lastName,
        phoneNumber: updatedData.phone,
        isWhatsAppNo: true,
        gender: 'male',
        age: parseInt(updatedData.age, 10) || 25,
        dateOfBirth: new Date(updatedData.dob).toISOString(),
        address: updatedData.address,
        fingerPrint: updatedData.fingerprintId || 'FP-0001',
        admission_No: updatedData.admissionNo || '',
        subscriptionPlanId: updatedData.plan,
        subscriptionIsActive: updatedData.status === 'Active',
        imageUrl: updatedData.imageUrl || '',
        documentId: updatedData.documentId || null,
      };

      const response = await fetch(`${process.env.VITE_API_BASE_URL}/users/${id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update user');
      }

      toast.success('Member updated successfully!');
    } catch (error: any) {
      console.error('Edit member error:', error);
    }
  }, [getHeaders]);

  const handleDeleteMember = useCallback(async (id: string) => {
    try {
      const headers = getHeaders();
      const response = await fetch(`${process.env.VITE_API_BASE_URL}/users/${id}`, {
        method: 'DELETE',
        headers
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete user');
      }

      toast.success('Member deleted successfully!');
    } catch (error: any) {
      console.error('Delete member error:', error);
    }
  }, [getHeaders]);

  const handleImportExcel = useCallback(async (file: File) => {
    try {
      const token = localStorage.getItem('accessToken');
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${process.env.VITE_API_BASE_URL}/users/import`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to import excel data');
      }

      const result = await response.json();
      toast.success(result.message || 'Import successful!');
    } catch (error: any) {
      console.error('Import excel error:', error);
    }
  }, []);

  const handleExportExcel = useCallback(async () => {
    try {
      const headers = getHeaders();
      // Fetch plans first to map IDs to plan names
      const plansResponse = await fetch(`${process.env.VITE_API_BASE_URL}/subscription-plans`, { headers });
      const plansData = await plansResponse.json();
      const planMap: Record<string, string> = {};
      if (plansData && plansData.success && Array.isArray(plansData.data)) {
        plansData.data.forEach((p: any) => {
          planMap[p._id] = p.title;
        });
      }

      // Fetch all members (limit=10000 to get everyone)
      const url = `${process.env.VITE_API_BASE_URL}/users?page=1&limit=10000`;
      const response = await fetch(url, { headers });
      const data = await response.json();

      if (data && data.success && Array.isArray(data.data)) {
        const csvRows = [
          ['S No.', 'Name', 'Admission No. id', 'Mob. No.', 'Date of Joining', 'latest Date Sub.', 'Plan', 'Expiry Date', 'Status']
        ];

        data.data.forEach((user: any, index: number) => {
          const joinDate = user.createdAt ? new Date(user.createdAt).toISOString().split('T')[0] : '';
          const latestSubDate = user.latestSubscriptionDate ? new Date(user.latestSubscriptionDate).toISOString().split('T')[0] : '';
          const expiryDate = user.subscriptionExpiryDate ? new Date(user.subscriptionExpiryDate).toISOString().split('T')[0] : '';
          const planTitle = planMap[user.subscriptionPlanId] || 'Basic';
          const name = `${user.firstName} ${user.lastName}`;

          csvRows.push([
            String(index + 1),
            name,
            user.fingerPrint || '',
            user.phoneNumber || '',
            joinDate,
            latestSubDate,
            planTitle,
            expiryDate,
            user.subscriptionStatus || (user.subscriptionIsActive ? 'Active' : 'Expired')
          ]);
        });

        const csvContent = csvRows
          .map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
          .join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const urlBlob = URL.createObjectURL(blob);
        link.setAttribute('href', urlBlob);
        link.setAttribute('download', `Members_Export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Members exported successfully!');
      }
    } catch (error: any) {
      console.error('Export excel error:', error);
    }
  }, [getHeaders]);

  return {
    members,
    plans,
    loading,
    totalPages,
    totalMembers,
    fetchData,
    handleAddMember,
    handleEditMember,
    handleDeleteMember,
    handleImportExcel,
    handleExportExcel,
  };
};

