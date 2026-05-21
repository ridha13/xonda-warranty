'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export const dynamic = 'force-dynamic';

interface Stats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  revisionRequested: number;
}

interface Warranty {
  id: number;
  xondaId: string;
  customerName: string;
  status: string;
  createdAt: string;
  dealer?: { name: string };
}

export default function DashboardPage() {
  const router = useRouter();
  const authContext = useAuth();
  const token = authContext?.token;
  
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentWarranties, setRecentWarranties] = useState<Warranty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    fetchDashboardData();
  }, [token]);

  const fetchDashboardData = async () => {
    try {
      const statsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/warranties/dashboard-stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const statsData = await statsRes.json();
      setStats(statsData);

      const warrantiesRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/warranties`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const warrantiesData = await warrantiesRes.json();
      if (Array.isArray(warrantiesData)) {
        setRecentWarranties(warrantiesData.slice(0, 5));
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    { label: 'إجمالي الطلبات', key: 'total' as keyof Stats, icon: '📋', color: '#2563eb' },
    { label: 'قيد الانتظار', key: 'pending' as keyof Stats, icon: '⏳', color: '#f59e0b' },
    { label: 'موافق عليه', key: 'approved' as keyof Stats, icon: '✅', color: '#10b981' },
    { label: 'مرفوض', key: 'rejected' as keyof Stats, icon: '❌', color: '#ef4444' },
    { label: 'يحتاج تعديل', key: 'revisionRequested' as keyof Stats, icon: '✏️', color: '#8b5cf6' }
  ];

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PENDING: 'قيد الانتظار',
      APPROVED: 'موافق عليه',
      REJECTED: 'مرفوض',
      REVISION_REQUESTED: 'يحتاج تعديل'
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
      REVISION_REQUESTED: 'bg-purple-100 text-purple-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">لوحة التحكم</h1>
        <p className="text-gray-600 mt-1">مرحباً بك في نظام إدارة الضمانات</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {statsCards.map(card => (
          <div
            key={card.key}
            className="bg-white rounded-lg shadow p-6 border-t-4"
            style={{ borderTopColor: card.color }}
          >
            <div className="text-3xl mb-2">{card.icon}</div>
            <div className="text-3xl font-bold" style={{ color: card.color }}>
              {stats?.[card.key] ?? 0}
            </div>
            <div className="text-sm text-gray-600 mt-1">{card.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">آخر الطلبات</h2>
          <button
            onClick={() => router.push('/warranties')}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            عرض الكل ←
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">معرف زوندا</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">العميل</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الوكيل</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">التاريخ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentWarranties.map(warranty => (
                <tr
                  key={warranty.id}
                  onClick={() => router.push(`/warranties/${warranty.id}`)}
                  className="hover:bg-gray-50 cursor-pointer"
                >
                  <td className="px-6 py-4 text-sm font-mono font-semibold">{warranty.xondaId}</td>
                  <td className="px-6 py-4 text-sm">{warranty.customerName}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{warranty.dealer?.name || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(warranty.status)}`}>
                      {getStatusLabel(warranty.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(warranty.createdAt).toLocaleDateString('ar-SA')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
