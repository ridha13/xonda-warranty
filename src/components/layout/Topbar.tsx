'use client';

import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';

export default function Topbar() {
  const authContext = useAuth();
  const user = authContext?.user;
  const pathname = usePathname();

  const getPageTitle = () => {
    if (pathname === '/dashboard') return 'لوحة التحكم';
    if (pathname === '/warranties') return 'إدارة الضمانات';
    if (pathname === '/warranties/new') return 'إنشاء ضمان جديد';
    if (pathname === '/reports') return 'التقارير والإحصائيات';
    if (pathname === '/notifications') return 'الإشعارات';
    if (pathname?.startsWith('/warranties/')) return 'تفاصيل الضمان';
    return 'XONDA';
  };

  const getPageIcon = () => {
    if (pathname === '/dashboard') return '📊';
    if (pathname === '/warranties') return '📋';
    if (pathname === '/warranties/new') return '➕';
    if (pathname === '/reports') return '📈';
    if (pathname === '/notifications') return '🔔';
    if (pathname?.startsWith('/warranties/')) return '🔍';
    return '⚡';
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('ar-SA', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getCurrentDate = () => {
    const now = new Date();
    return now.toLocaleDateString('ar-SA', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Page Title */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-2xl">{getPageIcon()}</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{getPageTitle()}</h1>
              <p className="text-sm text-gray-500">{getCurrentDate()}</p>
            </div>
          </div>

          {/* User Info & Actions */}
          <div className="flex items-center gap-6">
            {/* Time */}
            <div className="hidden md:block text-center">
              <div className="text-2xl font-bold text-gray-900">{getCurrentTime()}</div>
              <div className="text-xs text-gray-500">الوقت الحالي</div>
            </div>

            {/* Notifications */}
            <button className="relative p-3 hover:bg-gray-100 rounded-xl transition-colors">
              <span className="text-2xl">🔔</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* User Profile */}
            {user && (
              <div className="flex items-center gap-3 bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-2 rounded-xl border border-blue-100">
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{user.name || 'المستخدم'}</p>
                  <p className="text-xs text-gray-500">
                    {user.role === 'ADMIN' ? '👑 مدير النظام' : '👤 مستخدم'}
                  </p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                  {user.name?.charAt(0) || 'A'}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
