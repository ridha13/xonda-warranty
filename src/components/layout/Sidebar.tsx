'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const authContext = useAuth();
  const user = authContext?.user;

  const menuItems = [
    {
      title: 'لوحة التحكم',
      icon: '📊',
      path: '/dashboard',
      color: '#3b82f6'
    },
    {
      title: 'الضمانات',
      icon: '📋',
      path: '/warranties',
      color: '#8b5cf6'
    },
    {
      title: 'إنشاء ضمان',
      icon: '➕',
      path: '/warranties/new',
      color: '#10b981'
    },
    {
      title: 'التقارير',
      icon: '📈',
      path: '/reports',
      color: '#f59e0b'
    },
    {
      title: 'الإشعارات',
      icon: '🔔',
      path: '/notifications',
      color: '#ef4444'
    }
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <aside className="w-64 bg-gradient-to-b from-gray-900 to-gray-800 min-h-screen fixed right-0 top-0 shadow-2xl z-50">
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-2xl">⚡</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">XONDA</h1>
            <p className="text-xs text-gray-400">نظام إدارة الضمانات</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      {user && (
        <div className="p-4 m-4 bg-gray-800/50 rounded-xl border border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
              {user.name?.charAt(0) || 'A'}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">{user.name || 'المستخدم'}</p>
              <p className="text-xs text-gray-400">{user.email}</p>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-gray-700">
            <span className="text-xs text-blue-400 bg-blue-500/10 px-2 py-1 rounded-full">
              {user.role === 'ADMIN' ? '👑 مدير' : '👤 مستخدم'}
            </span>
          </div>
        </div>
      )}

      {/* Navigation Menu */}
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.path}
            onClick={() => router.push(item.path)}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 ${
              isActive(item.path)
                ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg scale-105'
                : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
            }`}
          >
            <span className="text-2xl">{item.icon}</span>
            <span className="font-medium">{item.title}</span>
            {isActive(item.path) && (
              <span className="mr-auto">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Quick Stats */}
      <div className="absolute bottom-0 w-full p-4 border-t border-gray-700 bg-gray-900/50">
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-gray-800/50 rounded-lg p-2 text-center">
            <div className="text-xs text-gray-400">الضمانات</div>
            <div className="text-lg font-bold text-blue-400">0</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-2 text-center">
            <div className="text-xs text-gray-400">قيد الانتظار</div>
            <div className="text-lg font-bold text-yellow-400">0</div>
          </div>
        </div>
        <button
          onClick={() => {
            localStorage.clear();
            router.push('/login');
          }}
          className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <span>🚪</span>
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </aside>
  );
}
