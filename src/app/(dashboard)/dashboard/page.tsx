'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  useEffect(() => { api.get('/reports/stats').then(({ data }) => setStats(data.data)); }, []);
  const cards = [
    ['إجمالي الضمانات', stats?.total],
    ['المفعلة', stats?.approved],
    ['المعلقة', stats?.pending],
    ['المرفوضة', stats?.rejected],
    ['تحتاج تعديل', stats?.revision_requested],
  ];
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">لوحة التحكم</h1>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {cards.map(([label, value]) => (
          <div key={String(label)} className="bg-white rounded-2xl border p-5">
            <div className="text-3xl font-bold">{value ?? '—'}</div>
            <div className="text-gray-500 mt-1">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
