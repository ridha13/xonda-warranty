'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://xonda-backend.vercel.app/api';
      const response = await fetch(`${API_URL}/notifications`);
      const data = await response.json();
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://xonda-backend.vercel.app/api';
      await fetch(`${API_URL}/notifications/${id}/read`, {method: 'PUT'});
      setNotifications(prev => prev.map(n => n.id === id ? {...n, is_read: true} : n));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      default: return 'ℹ️';
    }
  };

  const getTypeStyle = (type) => {
    switch(type) {
      case 'success': return 'bg-green-50 border-green-200';
      case 'error': return 'bg-red-50 border-red-200';
      case 'warning': return 'bg-yellow-50 border-yellow-200';
      default: return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900">الإشعارات</h1>
          <p className="text-gray-600 mt-1">
            جميع الإشعارات ({notifications.filter(n => !n.is_read).length} غير مقروء)
          </p>
        </div>

        {loading ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">جاري التحميل...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">🔔</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">لا توجد إشعارات</h3>
            <p className="text-gray-600">ستظهر الإشعارات هنا عند حدوث أي تحديثات</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white rounded-lg shadow-sm border-r-4 p-6 transition ${getTypeStyle(notification.type)} ${
                  !notification.is_read ? 'font-semibold' : 'opacity-75'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="text-3xl">{getTypeIcon(notification.type)}</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {notification.title}
                    </h3>
                    <p className="text-gray-700 mb-3">{notification.message}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>
                        {new Date(notification.created_at).toLocaleString('ar-SA')}
                      </span>
                      {!notification.is_read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          تحديد كمقروء
                        </button>
                      )}
                      {notification.related_warranty_id && (
                        <Link
                          href={`/warranties/${notification.related_warranty_id}`}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          عرض الضمان →
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
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
