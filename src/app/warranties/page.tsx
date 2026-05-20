'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function WarrantiesPage() {
  const [warranties, setWarranties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchWarranties();
  }, [filter]);

  const fetchWarranties = async () => {
    try {
      setLoading(true);
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://xonda-backend.vercel.app/api';
      const url = filter === 'all' 
        ? `${API_URL}/warranties`
        : `${API_URL}/warranties?status=${filter}`;
      
      const response = await fetch(url);
      const data = await response.json();
      setWarranties(data);
    } catch (error) {
      console.error('Error fetching warranties:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      revision_requested: 'bg-blue-100 text-blue-800'
    };
    
    const labels = {
      pending: 'قيد الانتظار',
      approved: 'موافق عليه',
      rejected: 'مرفوض',
      revision_requested: 'يحتاج مراجعة'
    };
    
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ar-SA');
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">إدارة الضمانات</h1>
              <p className="text-gray-600 mt-1">عرض وإدارة جميع الضمانات</p>
            </div>
            <Link 
              href="/warranties/new"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              ➕ إنشاء ضمان جديد
            </Link>
          </div>

          {/* Filters */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
            >
              الكل ({warranties.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg ${filter === 'pending' ? 'bg-yellow-600 text-white' : 'bg-gray-100'}`}
            >
              قيد الانتظار
            </button>
            <button
              onClick={() => setFilter('approved')}
              className={`px-4 py-2 rounded-lg ${filter === 'approved' ? 'bg-green-600 text-white' : 'bg-gray-100'}`}
            >
              موافق عليه
            </button>
            <button
              onClick={() => setFilter('rejected')}
              className={`px-4 py-2 rounded-lg ${filter === 'rejected' ? 'bg-red-600 text-white' : 'bg-gray-100'}`}
            >
              مرفوض
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">جاري التحميل...</p>
            </div>
          ) : warranties.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500 text-lg">لا توجد ضمانات</p>
              <Link 
                href="/warranties/new"
                className="inline-block mt-4 text-blue-600 hover:underline"
              >
                إنشاء أول ضمان
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">رقم زوندا</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">الرقم التسلسلي</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">نوع الجهاز</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">اسم العميل</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">تاريخ البيع</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">تاريخ الانتهاء</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">الحالة</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {warranties.map((warranty) => (
                    <tr key={warranty.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-blue-600">
                        {warranty.xonda_id}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {warranty.serial_number}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {warranty.device_type?.name || 'غير محدد'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {warranty.customer_name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDate(warranty.sale_date)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {warranty.expiry_date ? formatDate(warranty.expiry_date) : '-'}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(warranty.status)}
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/warranties/${warranty.id}`}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          عرض التفاصيل →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Back to Dashboard */}
        <div className="mt-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-gray-600 hover:text-gray-900"
          >
            ← العودة للوحة التحكم
          </Link>
        </div>
      </div>
    </div>
  );
}
