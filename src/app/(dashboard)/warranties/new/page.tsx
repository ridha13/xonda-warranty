'use client';
import { useState } from 'react';
import api from '@/lib/api';

export default function NewWarrantyPage() {
  const [form, setForm] = useState<any>({ xonda_id:'', serial_number:'', customer_name:'', customer_phone:'', sale_date:'' });
  const [msg, setMsg] = useState('');

  const submit = async () => {
    const { data } = await api.post('/warranties', form);
    setMsg(`تم إنشاء الطلب: ${data.data.xonda_id}`);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">ضمان جديد</h1>
      <div className="bg-white border rounded-2xl p-6 space-y-3">
        {[['xonda_id','معرف زوندا'],['serial_number','الرقم التسلسلي'],['customer_name','اسم العميل'],['customer_phone','جوال العميل'],['sale_date','تاريخ البيع']].map(([key,label]) => (
          <input key={key} className="w-full border rounded-xl p-3" placeholder={label} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} />
        ))}
        <button onClick={submit} className="bg-sky-600 hover:bg-sky-700 text-white rounded-xl p-3 w-full">حفظ الطلب</button>
        {msg && <div className="text-green-700 bg-green-50 border border-green-200 rounded-lg p-3">{msg}</div>}
      </div>
    </div>
  );
}
