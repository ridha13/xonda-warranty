'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewWarrantyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [deviceTypes, setDeviceTypes] = useState([]);
  const [warrantyPackages, setWarrantyPackages] = useState([]);
  const [images, setImages] = useState([]);
  
  const [formData, setFormData] = useState({
    serial_number: '',
    device_type_id: '',
    warranty_package_id: '',
    customer_name: '',
    customer_phone: '',
    sale_date: new Date().toISOString().split('T')[0],
    dealer_id: '1'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://xonda-backend.vercel.app/api';
      
      const [devicesRes, packagesRes] = await Promise.all([
        fetch(`${API_URL}/device-types`),
        fetch(`${API_URL}/warranty-packages`)
      ]);
      
      const devices = await devicesRes.json();
      const packages = await packagesRes.json();
      
      setDeviceTypes(devices);
      setWarrantyPackages(packages);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('فشل في تحميل البيانات');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length + images.length > 5) {
      alert('يمكنك رفع 5 صور كحد أقصى');
      return;
    }
    
    setImages(prev => [...prev, ...files]);
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.serial_number || !formData.device_type_id || !formData.warranty_package_id || 
        !formData.customer_name || !formData.customer_phone) {
      alert('الرجاء ملء جميع الحقول المطلوبة');
      return;
    }
    
    setLoading(true);
    
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://xonda-backend.vercel.app/api';
      
      const formDataToSend = new FormData();
      formDataToSend.append('data', JSON.stringify(formData));
      
      images.forEach((image) => {
        formDataToSend.append('images', image);
      });
      
      const response = await fetch(`${API_URL}/warranties`, {
        method: 'POST',
        body: formDataToSend
      });
      
      if (!response.ok) {
        throw new Error('فشل في إنشاء الضمان');
      }
      
      const result = await response.json();
      alert(`تم إنشاء الضمان بنجاح!\nرقم زوندا: ${result.xonda_id}`);
      router.push('/warranties');
    } catch (error) {
      console.error('Error creating warranty:', error);
      alert('فشل في إنشاء الضمان: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900">إنشاء ضمان جديد</h1>
          <p className="text-gray-600 mt-1">املأ جميع البيانات المطلوبة</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6">
          {/* Serial Number */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              الرقم التسلسلي *
            </label>
            <input
              type="text"
              name="serial_number"
              value={formData.serial_number}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="أدخل الرقم التسلسلي للجهاز"
              required
            />
          </div>

          {/* Device Type */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              نوع الجهاز *
            </label>
            <select
              name="device_type_id"
              value={formData.device_type_id}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">اختر نوع الجهاز</option>
              {deviceTypes.map(device => (
                <option key={device.id} value={device.id}>
                  {device.name} - {device.model}
                </option>
              ))}
            </select>
          </div>

          {/* Warranty Package */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              باقة الضمان *
            </label>
            <select
              name="warranty_package_id"
              value={formData.warranty_package_id}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">اختر باقة الضمان</option>
              {warrantyPackages.map(pkg => (
                <option key={pkg.id} value={pkg.id}>
                  {pkg.name} - {pkg.price} ريال ({pkg.duration_months} شهر)
                </option>
              ))}
            </select>
          </div>

          {/* Customer Name */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              اسم العميل *
            </label>
            <input
              type="text"
              name="customer_name"
              value={formData.customer_name}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="الاسم الكامل"
              required
            />
          </div>

          {/* Customer Phone */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              رقم الجوال *
            </label>
            <input
              type="tel"
              name="customer_phone"
              value={formData.customer_phone}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="05xxxxxxxx"
              required
            />
          </div>

          {/* Sale Date */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              تاريخ البيع *
            </label>
            <input
              type="date"
              name="sale_date"
              value={formData.sale_date}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Image Upload */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              صور الجهاز والفاتورة (اختياري)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                accept="image/*,.pdf"
                multiple
                onChange={handleImageChange}
                className="hidden"
                id="image-upload"
                disabled={images.length >= 5}
              />
              <label
                htmlFor="image-upload"
                className="cursor-pointer inline-block bg-blue-50 text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-100 transition"
              >
                📷 اختر الصور ({images.length}/5)
              </label>
              <p className="text-sm text-gray-500 mt-2">
                يمكنك رفع حتى 5 صور (JPG, PNG, PDF - حد أقصى 5MB لكل ملف)
              </p>
            </div>

            {/* Preview Images */}
            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-4 mt-4">
                {images.map((image, index) => (
                  <div key={index} className="relative">
                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 left-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                    >
                      ×
                    </button>
                    <p className="text-xs text-gray-600 mt-1 truncate">{image.name}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'جاري الإنشاء...' : '✓ إنشاء الضمان'}
            </button>
            <Link
              href="/warranties"
              className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition text-center"
            >
              إلغاء
            </Link>
          </div>
        </form>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">💡 ملاحظات:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• سيتم توليد رقم زوندا تلقائياً للضمان</li>
            <li>• سيتم حساب تاريخ انتهاء الضمان بناءً على الباقة المختارة</li>
            <li>• الحد الأقصى لحجم الصورة 5MB</li>
            <li>• الصيغ المدعومة: JPG, PNG, PDF</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
