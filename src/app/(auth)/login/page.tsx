'use client';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try { await login(email, password); }
    catch (e: any) { setError(e?.response?.data?.message || 'فشل تسجيل الدخول'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-sky-900 via-sky-700 to-sky-500">
      <form onSubmit={submit} className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-2 text-center">زوندا</h1>
        <p className="text-gray-500 text-center mb-6">نظام إدارة الضمانات</p>
        {error && <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 p-3 text-sm">{error}</div>}
        <input className="w-full border rounded-xl p-3 mb-3" placeholder="البريد الإلكتروني" value={email} onChange={e => setEmail(e.target.value)} />
        <input className="w-full border rounded-xl p-3 mb-4" type="password" placeholder="كلمة المرور" value={password} onChange={e => setPassword(e.target.value)} />
        <button className="w-full bg-sky-600 hover:bg-sky-700 text-white rounded-xl p-3" disabled={loading}>{loading ? 'جارٍ الدخول...' : 'تسجيل الدخول'}</button>
      </form>
    </div>
  );
}
