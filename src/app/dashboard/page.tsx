'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://xonda-backend.vercel.app/api';
      const response = await fetch(`${API_URL}/dashboard/stats`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ar-SA');
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900">لوحة التحكم</h1>
          <p className="text-gray-600 mt-1">نظام إدارة الضمانات - زوندا</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Link
            href="/warranties/new"
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-lg shadow-sm hover:shadow-md transition"
          >
            <div className="text-4xl mb-2">➕</div>
            <div className="text-xl font-bold">إنشاء ضمان جديد</div>
            <div className="text-blue-100 text-sm mt-1">إضافة ضمان للنظام</div>
          </Link>

          <Link
            href="/warranties"
            className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 rounded-lg shadow-sm hover:shadow-md transition"
          >
            <div className="text-4xl mb-2">📋</div>
            <div className="text-xl font-bold">إدارة الضمانات</div>
            <div className="text-purple-100 text-sm mt-1">عرض وتعديل الضمانات</div>
          </Link>

          <Link
            href="/reports"
            className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 rounded-lg shadow-sm hover:shadow-md transition"
          >
            <div className="text-4xl mb-2">📊</div>
            <div className="text-xl font-bold">التقارير</div>
            <div className="text-green-100 text-sm mt-1">إنشاء تقارير مفصلة</div>
          </Link>
        </div>

        {/* Statistics */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">جاري تحميل الإحصائيات...</p>
          </div>
        ) : stats ? (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-3xl">📦</div>
                  <span className="text-blue-600 text-sm font-semibold">الإجمالي</span>
                </div>
                <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
                <div className="text-gray-600 text-sm mt-1">إجمالي الضمانات</div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-3xl">⏳</div>
                  <span className="text-yellow-600 text-sm font-semibold">معلق</span>
                </div>
                <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
                <div className="text-gray-600 text-sm mt-1">قيد الانتظار</div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-3xl">✅</div>
                  <span className="text-green-600 text-sm font-semibold">موافق</span>
                </div>
                <div className="text-3xl font-bold text-green-600">{stats.approved}</div>
                <div className="text-gray-600 text-sm mt-1">موافق عليه</div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-3xl">❌</div>
                  <span className="text-red-600 text-sm font-semibold">مرفوض</span>
                </div>
                <div className="text-3xl font-bold text-red-600">{stats.rejected}</div>
                <div className="text-gray-600 text-sm mt-1">مرفوض</div>
              </div>
            </div>

            {/* Total Value */}
            {stats.total_value > 0 && (
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-sm p-6 mb-6 text-white">
                <div className="text-lg font-semibold mb-2">💰 القيمة الإجمالية</div>
                <div className="text-4xl font-bold">{stats.total_value.toFixed(2)} ريال</div>
                <div className="text-blue-100 text-sm mt-2">إجمالي قيمة جميع الضمانات</div>
              </div>
            )}

            {/* Recent Warranties */}
            {stats.recent_warranties && stats.recent_warranties.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900">آخر الضمانات</h2>
                  <Link href="/warranties" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    عرض الكل →
                  </Link>
                </div>

                <div className="space-y-3">
                  {stats.recent_warranties.map((warranty) => (
                    <Link
                      key={warranty.id}
                      href={`/warranties/${warranty.id}`}
                      className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-bold text-blue-600">{warranty.xonda_id}</div>
                          <div className="text-sm text-gray-700 mt-1">
                            {warranty.device_name} - {warranty.customer_name}
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatDate(warranty.created_at)}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">مرحباً في لوحة التحكم</h3>
            <p className="text-gray-600">ابدأ بإنشاء أول ضمان</p>
            <Link
              href="/warranties/new"
              className="inline-block mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              إنشاء ضمان جديد
            </Link>
          </div>
        )}

        {/* Navigation Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <Link
            href="/warranties"
            className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition text-center"
          >
            <div className="text-3xl mb-2">📋</div>
            <div className="font-semibold text-gray-900">الضمانات</div>
          </Link>

          <Link
            href="/reports"
            className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition text-center"
          >
            <div className="text-3xl mb-2">📊</div>
            <div className="font-semibold text-gray-900">التقارير</div>
          </Link>

          <Link
            href="/notifications"
            className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition text-center"
          >
            <div className="text-3xl mb-2">🔔</div>
            <div className="font-semibold text-gray-900">الإشعارات</div>
          </Link>

          <button
            onClick={() => {
              localStorage.clear();
              router.push('/login');
            }}
            className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition text-center"
          >
            <div className="text-3xl mb-2">🚪</div>
            <div className="font-semibold text-gray-900">تسجيل الخروج</div>
          </button>
        </div>
      </div>
    </div>
  );
}
