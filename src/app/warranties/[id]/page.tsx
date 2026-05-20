'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function WarrantyDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [warranty, setWarranty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    if (params.id) {
      fetchWarranty();
    }
  }, [params.id]);

  const fetchWarranty = async () => {
    try {
      setLoading(true);
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://xonda-backend.vercel.app/api';
      const response = await fetch(`${API_URL}/warranties/${params.id}`);
      
      if (!response.ok) {
        throw new Error('الضمان غير موجود');
      }
      
      const data = await response.json();
      setWarranty(data);
    } catch (error) {
      console.error('Error fetching warranty:', error);
      alert('فشل في تحميل الضمان');
      router.push('/warranties');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus) => {
    if (!confirm(`هل أنت متأكد من تغيير الحالة إلى "${getStatusLabel(newStatus)}"؟`)) {
      return;
    }

    setUpdating(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://xonda-backend.vercel.app/api';
      const response = await fetch(`${API_URL}/warranties/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('فشل في تحديث الحالة');
      }

      await fetchWarranty();
      alert('تم تحديث الحالة بنجاح');
    } catch (error) {
      console.error('Error updating status:', error);
      alert('فشل في تحديث الحالة');
    } finally {
      setUpdating(false);
    }
  };

  const deleteWarranty = async () => {
    if (!confirm('هل أنت متأكد من حذف هذا الضمان؟ لا يمكن التراجع عن هذا الإجراء.')) {
      return;
    }

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://xonda-backend.vercel.app/api';
      const response = await fetch(`${API_URL}/warranties/${params.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('فشل في حذف الضمان');
      }

      alert('تم حذف الضمان بنجاح');
      router.push('/warranties');
    } catch (error) {
      console.error('Error deleting warranty:', error);
      alert('فشل في حذف الضمان');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      approved: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
      revision_requested: 'bg-blue-100 text-blue-800 border-blue-200'
    };
    
    return styles[status] || styles.pending;
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'قيد الانتظار',
      approved: 'موافق عليه',
      rejected: 'مرفوض',
      revision_requested: 'يحتاج مراجعة'
    };
    
    return labels[status] || status;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRemainingDays = (expiryDate) => {
    if (!expiryDate) return null;
    
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600 text-lg">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!warranty) {
    return null;
  }

  const remainingDays = getRemainingDays(warranty.expiry_date);

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{warranty.xonda_id}</h1>
              <p className="text-gray-600 mt-1">تفاصيل الضمان الكاملة</p>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${getStatusBadge(warranty.status)}`}>
              {getStatusLabel(warranty.status)}
            </span>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-3 flex-wrap">
            {warranty.status === 'pending' && (
              <>
                <button
                  onClick={() => updateStatus('approved')}
                  disabled={updating}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition disabled:bg-gray-400"
                >
                  ✓ موافقة
                </button>
                <button
                  onClick={() => updateStatus('rejected')}
                  disabled={updating}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition disabled:bg-gray-400"
                >
                  ✕ رفض
                </button>
                <button
                  onClick={() => updateStatus('revision_requested')}
                  disabled={updating}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
                >
                  ⚠ طلب مراجعة
                </button>
              </>
            )}
            <button
              onClick={deleteWarranty}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
            >
              🗑️ حذف
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Device Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">معلومات الجهاز</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1">الرقم التسلسلي</div>
                  <div className="font-semibold text-gray-900">{warranty.serial_number}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">نوع الجهاز</div>
                  <div className="font-semibold text-gray-900">{warranty.device_type?.name || '-'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">الموديل</div>
                  <div className="font-semibold text-gray-900">{warranty.device_type?.model || '-'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">الشركة المصنعة</div>
                  <div className="font-semibold text-gray-900">{warranty.device_type?.manufacturer || '-'}</div>
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">معلومات العميل</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1">اسم العميل</div>
                  <div className="font-semibold text-gray-900">{warranty.customer_name}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">رقم الجوال</div>
                  <div className="font-semibold text-gray-900 dir-ltr text-right">{warranty.customer_phone}</div>
                </div>
              </div>
            </div>

            {/* Warranty Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">معلومات الضمان</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1">باقة الضمان</div>
                  <div className="font-semibold text-gray-900">{warranty.warranty_package?.name || '-'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">السعر</div>
                  <div className="font-semibold text-gray-900">{warranty.warranty_package?.price} ريال</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">المدة</div>
                  <div className="font-semibold text-gray-900">{warranty.warranty_package?.duration_months} شهر</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">تاريخ البيع</div>
                  <div className="font-semibold text-gray-900">{formatDate(warranty.sale_date)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">تاريخ الانتهاء</div>
                  <div className="font-semibold text-gray-900">
                    {warranty.expiry_date ? formatDate(warranty.expiry_date) : '-'}
                  </div>
                </div>
                {remainingDays !== null && (
                  <div>
                    <div className="text-sm text-gray-600 mb-1">الأيام المتبقية</div>
                    <div className={`font-bold text-lg ${remainingDays < 30 ? 'text-red-600' : remainingDays < 90 ? 'text-yellow-600' : 'text-green-600'}`}>
                      {remainingDays > 0 ? `${remainingDays} يوم` : 'منتهي'}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Images */}
            {warranty.images && warranty.images.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">الصور والمرفقات ({warranty.images.length})</h2>
                <div className="grid grid-cols-3 gap-4">
                  {warranty.images.map((image, index) => (
                    <div
                      key={index}
                      className="aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-75 transition"
                      onClick={() => setSelectedImage(image)}
                    >
                      <img
                        src={image.url}
                        alt={`صورة ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Timestamp */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-3">التواريخ</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-gray-600">تاريخ الإنشاء</div>
                  <div className="font-semibold text-gray-900">{formatDate(warranty.created_at)}</div>
                </div>
                {warranty.updated_at && warranty.updated_at !== warranty.created_at && (
                  <div>
                    <div className="text-gray-600">آخر تحديث</div>
                    <div className="font-semibold text-gray-900">{formatDate(warranty.updated_at)}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Dealer Info */}
            {warranty.dealer && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="font-bold text-gray-900 mb-3">معلومات التاجر</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <div className="text-gray-600">اسم التاجر</div>
                    <div className="font-semibold text-gray-900">{warranty.dealer.name}</div>
                  </div>
                  {warranty.dealer.phone && (
                    <div>
                      <div className="text-gray-600">الجوال</div>
                      <div className="font-semibold text-gray-900 dir-ltr text-right">{warranty.dealer.phone}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-bold text-blue-900 mb-3">الإجراءات</h3>
              <div className="space-y-2">
                <Link
                  href="/warranties"
                  className="block w-full text-center bg-white text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition text-sm"
                >
                  ← العودة للقائمة
                </Link>
                <button
                  onClick={() => window.print()}
                  className="block w-full text-center bg-white text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition text-sm"
                >
                  🖨️ طباعة
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="max-w-4xl max-h-full">
            <img
              src={selectedImage.url}
              alt="معاينة"
              className="max-w-full max-h-[90vh] object-contain"
            />
          </div>
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 left-4 bg-white text-gray-900 rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-100 text-2xl"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
