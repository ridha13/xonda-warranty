// src/components/forms/WarrantyForm.tsx
'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';
import type { DeviceType, WarrantyPackage } from '@/types';

interface FormData {
  xondaId: string; serialNumber: string;
  customerName: string; customerPhone: string;
  saleDate: string; deviceTypeId: string; warrantyPackageId: string;
}

export default function WarrantyForm({ onSuccess }: { onSuccess?: (id: string) => void }) {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>();
  const selectedDevice = watch('deviceTypeId');

  const { data: devices = [] } = useQuery<DeviceType[]>({
    queryKey: ['device-types'],
    queryFn: () => api.get('/devices/types').then(r => r.data)
  });

  const availablePackages = devices
    .find(d => d.id === selectedDevice)
    ?.packages?.map(p => p.warrantyPackage) ?? [];

  const mutation = useMutation({
    mutationFn: (data: FormData) => api.post('/warranties', data).then(r => r.data),
    onSuccess: (warranty) => {
      toast.success('تم إنشاء طلب الضمان بنجاح');
      onSuccess?.(warranty.id);
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'خطأ في الحفظ')
  });

  return (
    <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Xonda ID */}
        <div>
          <label className="label">معرف زوندا (Xonda ID) *</label>
          <input className="input-field" placeholder="XND-0000-0000"
            {...register('xondaId', { required: 'الحقل مطلوب' })} />
          {errors.xondaId && <p className="text-red-500 text-xs mt-1">{errors.xondaId.message}</p>}
        </div>
        {/* Serial */}
        <div>
          <label className="label">الرقم التسلسلي *</label>
          <input className="input-field" {...register('serialNumber', { required: 'الحقل مطلوب' })} />
          {errors.serialNumber && <p className="text-red-500 text-xs mt-1">{errors.serialNumber.message}</p>}
        </div>
        {/* Customer Name */}
        <div>
          <label className="label">اسم العميل *</label>
          <input className="input-field" {...register('customerName', { required: 'الحقل مطلوب' })} />
        </div>
        {/* Customer Phone */}
        <div>
          <label className="label">رقم جوال العميل *</label>
          <input className="input-field" type="tel" placeholder="05xxxxxxxx"
            {...register('customerPhone', { required: 'الحقل مطلوب',
              pattern: { value: /^05\d{8}$/, message: 'رقم الجوال غير صحيح' } })} />
          {errors.customerPhone && <p className="text-red-500 text-xs mt-1">{errors.customerPhone.message}</p>}
        </div>
        {/* Device Type */}
        <div>
          <label className="label">نوع الجهاز *</label>
          <select className="input-field" {...register('deviceTypeId', { required: true })}>
            <option value="">— اختر نوع الجهاز —</option>
            {devices.map(d => <option key={d.id} value={d.id}>{d.name} {d.model && `— ${d.model}`}</option>)}
          </select>
        </div>
        {/* Warranty Package */}
        <div>
          <label className="label">باقة الضمان *</label>
          <select className="input-field"
            {...register('warrantyPackageId', { required: true })}
            disabled={!selectedDevice}>
            <option value="">— اختر الباقة —</option>
            {availablePackages.map(p =>
              <option key={p.id} value={p.id}>
                {p.name} — {formatCurrency(p.price)}
              </option>
            )}
          </select>
        </div>
        {/* Sale Date */}
        <div>
          <label className="label">تاريخ البيع *</label>
          <input type="date" className="input-field"
            {...register('saleDate', { required: 'الحقل مطلوب' })} />
        </div>
      </div>

      <button type="submit" disabled={mutation.isPending} className="btn-primary">
        {mutation.isPending ? 'جارٍ الحفظ...' : 'التالي: رفع الصور →'}
      </button>
    </form>
  );
}