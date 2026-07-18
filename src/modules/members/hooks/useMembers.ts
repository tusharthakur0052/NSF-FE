import { useState, useCallback } from 'react';
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
            plan: planMap[user.subscriptionPlanId] || 'Standard',
            status: user.subscriptionStatus || (user.subscriptionIsActive ? 'Active' : 'Expired'),
            lastVisit: user.updatedAt ? new Date(user.updatedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            joinDate: user.createdAt ? new Date(user.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            latestSubscriptionDate: user.latestSubscriptionDate ? new Date(user.latestSubscriptionDate).toISOString().split('T')[0] : '-',
            dob: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
            fingerprintId: user.fingerPrint || '',
            address: user.address || '',
            subscriptionPlanId: user.subscriptionPlanId,
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
        subscriptionPlanId: newMemberData.plan,
        subscriptionIsActive: newMemberData.status === 'Active',
        paymentMethod: newMemberData.paymentMethod || 'Cash',
        joinDate: newMemberData.joinDate,
      };

      const response = await fetch(`${process.env.VITE_API_BASE_URL}/users`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create user');
      }
    } catch (error: any) {
      alert(error.message || 'Something went wrong while creating the member.');
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
        subscriptionPlanId: updatedData.plan,
        subscriptionIsActive: updatedData.status === 'Active'
      };

      const response = await fetch(`${process.env.VITE_API_BASE_URL}/users/${id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update user');
      }
    } catch (error: any) {
      alert(error.message || 'Something went wrong while updating the member.');
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
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete user');
      }
    } catch (error: any) {
      alert(error.message || 'Something went wrong while deleting the member.');
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
  };
};
