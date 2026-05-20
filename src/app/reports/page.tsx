'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ReportsPage() {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [filters, setFilters] = useState({
    start_date: '',
    end_date: '',
    status: '',
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const generateReport = async () => {
    setLoading(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://xonda-backend.vercel.app/api';
      
      const params = new URLSearchParams();
      if (filters.start_date) params.append('start_date', filters.start_date);
      if (filters.end_date) params.append('end_date', filters.end_date);
      if (filters.status) params.append('status', filters.status);
      
      const response = await fetch(`${API_URL}/reports/warranties?${params}`);
      const data = await response.json();
      setReport(data);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('فشل في إنشاء التقرير');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900">التقارير والإحصائيات</h1>
          <p className="text-gray-600 mt-1">إنشاء تقارير مفصلة عن الضمانات</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">فلترة التقرير</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">من تاريخ</label>
              <input type="date" name="start_date" value={filters.start_date} onChange={handleFilterChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">إلى تاريخ</label>
              <input type="date" name="end_date" value={filters.end_date} onChange={handleFilterChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">الحالة</label>
              <select name="status" value={filters.status} onChange={handleFilterChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                <option value="">جميع الحالات</option>
                <option value="pending">قيد الانتظار</option>
                <option value="approved">موافق عليه</option>
                <option value="rejected">مرفوض</option>
              </select>
            </div>

            <div className="flex items-end">
              <button onClick={generateReport} disabled={loading}
                className="w-full bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400">
                {loading ? 'جاري الإنشاء...' : '📊 إنشاء التقرير'}
              </button>
            </div>
          </div>
        </div>

        {report && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="text-sm font-semibold text-gray-600 mb-2">إجمالي الضمانات</div>
                <div className="text-3xl font-bold text-blue-600">{report.total}</div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="text-sm font-semibold text-gray-600 mb-2">قيد الانتظار</div>
                <div className="text-3xl font-bold text-yellow-600">{report.by_status.pending}</div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="text-sm font-semibold text-gray-600 mb-2">موافق عليه</div>
                <div className="text-3xl font-bold text-green-600">{report.by_status.approved}</div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="text-sm font-semibold text-gray-600 mb-2">القيمة الإجمالية</div>
                <div className="text-3xl font-bold text-purple-600">
                  {report.total_value.toLocaleString('ar-SA')} <span className="text-lg">ريال</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">حسب نوع الجهاز</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(report.by_device_type).map(([device, count]) => (
                  <div key={device} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 font-medium">{device}</span>
                      <span className="text-2xl font-bold text-blue-600">{count}</span>
                    </div>
                    <div className="mt-2 bg-blue-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(count / report.total) * 100}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {!report && !loading && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">لم يتم إنشاء تقرير بعد</h3>
            <p className="text-gray-600">اختر الفلاتر المناسبة واضغط على "إنشاء التقرير"</p>
          </div>
        )}

        <div className="mt-6">
          <Link href="/dashboard" className="inline-flex items-center text-gray-600 hover:text-gray-900">
            ← العودة للوحة التحكم
          </Link>
        </div>
      </div>
    </div>
  );
}
