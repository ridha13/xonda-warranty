// src/components/forms/ImageUploader.tsx
'use client';
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Upload, X, ImageIcon } from 'lucide-react';
import Image from 'next/image';

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:4000';

export default function ImageUploader({ warrantyId }: { warrantyId: string }) {
  const [previews, setPreviews] = useState<{ file: File; preview: string }[]>([]);
  const qc = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: (files: File[]) => {
      const fd = new FormData();
      files.forEach(f => fd.append('images', f));
      return api.post(`/warranties/${warrantyId}/images`, fd,
        { headers: { 'Content-Type': 'multipart/form-data' } });
    },
    onSuccess: () => {
      toast.success('تم رفع الصور بنجاح');
      setPreviews([]);
      qc.invalidateQueries({ queryKey: ['warranty', warrantyId] });
    },
    onError: () => toast.error('فشل رفع الصور')
  });

  const onDrop = useCallback((accepted: File[]) => {
    const newPreviews = accepted.map(f => ({ file: f, preview: URL.createObjectURL(f) }));
    setPreviews(p => [...p, ...newPreviews].slice(0, 10));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'image/jpeg': [], 'image/png': [], 'image/webp': [] },
    maxFiles: 10, maxSize: 10 * 1024 * 1024
  });

  const removePreview = (idx: number) => {
    URL.revokeObjectURL(previews[idx].preview);
    setPreviews(p => p.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors
        ${isDragActive ? 'border-xonda-500 bg-blue-50' : 'border-gray-300 hover:border-xonda-500 hover:bg-gray-50'}`}>
        <input {...getInputProps()} />
        <Upload className="mx-auto mb-3 text-gray-400" size={40} />
        <p className="text-gray-600 font-medium">اسحب الصور هنا أو انقر للاختيار</p>
        <p className="text-gray-400 text-sm mt-1">JPG، PNG، WEBP — حجم أقصى 10MB — حتى 10 صور</p>
      </div>

      {/* Previews */}
      {previews.length > 0 && (
        <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
          {previews.map((p, i) => (
            <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border">
              <Image src={p.preview} alt="" fill className="object-cover" />
              <button onClick={() => removePreview(i)}
                className="absolute top-1 left-1 bg-red-500 text-white rounded-full p-0.5
                           opacity-0 group-hover:opacity-100 transition-opacity">
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {previews.length > 0 && (
        <button onClick={() => uploadMutation.mutate(previews.map(p => p.file))}
          disabled={uploadMutation.isPending} className="btn-primary">
          <Upload size={16} />
          {uploadMutation.isPending ? 'جارٍ الرفع...' : `رفع ${previews.length} صورة`}
        </button>
      )}
    </div>
  );
}