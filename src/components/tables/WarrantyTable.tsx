// src/components/tables/WarrantyTable.tsx
'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { STATUS_LABELS, STATUS_CLASS, formatDate } from '@/lib/utils';
import type { WarrantyRequest } from '@/types';
import { useState } from 'react';
import { Download, Eye, CheckCircle, XCircle, Edit } from 'lucide-react';
import { toast } from 'sonner';

export default function WarrantyTable() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [filters, setFilters] = useState({ status: '', page: 1 });
  const [actionModal, setActionModal] = useState<
    { id: string; action: 'APPROVED' | 'REJECTED' | 'REVISION_REQUESTED' } | null>(null);
  const [reason, setReason] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['warranties', filters],
    queryFn: () => api.get('/warranties', { params: filters }).then(r => r.data)
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, action, reason }: any) =>
      api.patch(`/warranties/${id}/status`, {
        status: action,
        rejectionReason: action === 'REJECTED' ? reason : undefined,
        revisionNotes: action === 'REVISION_REQUESTED' ? reason : undefined,
      }),
    onSuccess: () => {
      toast.success('تم تحديث حالة الضمان');
      setActionModal(null);
      setReason('');
      qc.invalidateQueries({ queryKey: ['warranties'] });
    }
  });

  const exportExcel = () => {
    const params = new URLSearchParams(filters as any);
    window.open(`${process.env.NEXT_PUBLIC_API_URL}/reports/export/excel?${params}`, '_blank');
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-3 flex-wrap items-center justify-between">
        <select className="input-field w-auto"
          value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value, page: 1 }))}>
          <option value="">جميع الحالات</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <button onClick={exportExcel} className="btn-secondary flex items-center gap-2">
          <Download size={16} /> تصدير Excel
        </button>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#1B4F72] text-white">
              <tr>
                {['معرف زوندا','العميل','الجهاز','الباقة','التاجر','تاريخ البيع','الحالة','الإجراءات']
                  .map(h => <th key={h} className="px-4 py-3 text-right font-medium">{h}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={8} className="text-center py-12 text-gray-400">جارٍ التحميل...</td></tr>
              ) : data?.data?.map((w: WarrantyRequest) => (
                <tr key={w.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs">{w.xondaId}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{w.customerName}</div>
                    <div className="text-gray-400 text-xs">{w.customerPhone}</div>
                  </td>
                  <td className="px-4 py-3">{w.deviceType?.name}</td>
                  <td className="px-4 py-3">{w.warrantyPackage?.name}</td>
                  <td className="px-4 py-3">{w.dealer?.name}</td>
                  <td className="px-4 py-3">{formatDate(w.saleDate)}</td>
                  <td className="px-4 py-3">
                    <span className={STATUS_CLASS[w.status]}>{STATUS_LABELS[w.status]}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <a href={`/dashboard/warranties/${w.id}`}
                        className="p-1.5 text-gray-500 hover:text-xonda-500 hover:bg-blue-50 rounded">
                        <Eye size={16} />
                      </a>
                      {user?.role === 'SUPER_ADMIN' && w.status === 'PENDING' && (<>
                        <button onClick={() => setActionModal({ id: w.id, action: 'APPROVED' })}
                          className="p-1.5 text-green-600 hover:bg-green-50 rounded">
                          <CheckCircle size={16} />
                        </button>
                        <button onClick={() => setActionModal({ id: w.id, action: 'REJECTED' })}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded">
                          <XCircle size={16} />
                        </button>
                        <button onClick={() => setActionModal({ id: w.id, action: 'REVISION_REQUESTED' })}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded">
                          <Edit size={16} />
                        </button>
                      </>)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && (
          <div className="flex items-center justify-between px-4 py-3 border-t text-sm text-gray-600">
            <span>إجمالي: {data.total?.toLocaleString('ar-SA')} ضمان</span>
            <div className="flex gap-2">
              <button disabled={filters.page <= 1}
                onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}
                className="btn-secondary py-1 px-3 disabled:opacity-40">السابق</button>
              <span className="py-1 px-3">{filters.page} / {data.totalPages}</span>
              <button disabled={filters.page >= data.totalPages}
                onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}
                className="btn-secondary py-1 px-3 disabled:opacity-40">التالي</button>
            </div>
          </div>
        )}
      </div>

      {/* Action Modal */}
      {actionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="font-bold text-lg mb-4">
              {actionModal.action === 'APPROVED' ? '✅ تأكيد الموافقة' :
               actionModal.action === 'REJECTED' ? '❌ تأكيد الرفض' : '✏️ طلب تعديل'}
            </h3>
            {actionModal.action !== 'APPROVED' && (
              <textarea rows={3} className="input-field mb-4"
                placeholder={actionModal.action === 'REJECTED' ? 'سبب الرفض...' : 'ما الذي يحتاج للتعديل...'}
                value={reason} onChange={e => setReason(e.target.value)} />
            )}
            <div className="flex gap-3 justify-end">
              <button onClick={() => setActionModal(null)} className="btn-secondary">إلغاء</button>
              <button onClick={() => statusMutation.mutate({ id: actionModal.id, action: actionModal.action, reason })}
                disabled={statusMutation.isPending}
                className={actionModal.action === 'APPROVED' ? 'btn-primary' : 'btn-danger'}>
                تأكيد
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}