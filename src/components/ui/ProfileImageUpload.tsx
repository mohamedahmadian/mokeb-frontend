import { useId, useRef, useState } from 'react';
import { resolveAssetUrl } from '../../lib/geo';
import { btnSecondary } from '../../lib/styles';
import { toast } from '../../lib/toast';
import { uploadsApi } from '../../lib/uploads';
import { UserAvatar } from '../users/UserAvatar';

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 16V4m0 0L8 8m4-4l4 4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
    </svg>
  );
}

function CameraIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 8.25h10.5M6.75 8.25A2.25 2.25 0 014.5 6V5.25A2.25 2.25 0 016.75 3h10.5A2.25 2.25 0 0119.5 5.25V6a2.25 2.25 0 01-2.25 2.25M6.75 8.25v9A2.25 2.25 0 009 19.5h6A2.25 2.25 0 0017.25 17.25v-9M12 16.5a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" />
    </svg>
  );
}

interface ProfileImageUploadProps {
  fullName: string;
  value?: string | null;
  onChange: (url: string | null) => void;
  disabled?: boolean;
  className?: string;
}

export function ProfileImageUpload({
  fullName,
  value,
  onChange,
  disabled = false,
  className = '',
}: ProfileImageUploadProps) {
  const galleryInputId = useId();
  const cameraInputId = useId();
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const displayUrl = previewUrl ?? (value ? resolveAssetUrl(value) : null);

  const handleFile = async (file?: File | null) => {
    if (!file || disabled || uploading) return;

    setUploading(true);
    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);

    try {
      const result = await uploadsApi.uploadProfileImage(file);
      onChange(result.url);
      setPreviewUrl(null);
      URL.revokeObjectURL(localPreview);
    } catch (err) {
      setPreviewUrl(null);
      URL.revokeObjectURL(localPreview);
      toast.error(err instanceof Error ? err.message : 'خطا در آپلود تصویر');
    } finally {
      setUploading(false);
      if (galleryInputRef.current) galleryInputRef.current.value = '';
      if (cameraInputRef.current) cameraInputRef.current.value = '';
    }
  };

  const handleRemove = () => {
    if (disabled || uploading) return;
    setPreviewUrl(null);
    onChange(null);
  };

  return (
    <div className={`rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-50/90 to-white p-4 ${className}`}>
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
        <div className="relative">
          {displayUrl ? (
            <img
              src={displayUrl}
              alt={fullName}
              className="h-24 w-24 rounded-full object-cover shadow-lg shadow-slate-300/50 ring-4 ring-white"
            />
          ) : (
            <UserAvatar fullName={fullName} size="lg" className="shadow-lg shadow-slate-300/50 ring-4 ring-white" />
          )}
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/35">
              <span className="h-7 w-7 animate-spin rounded-full border-2 border-white border-t-transparent" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-2 text-center sm:text-right">
          <div>
            <p className="text-sm font-medium text-slate-800">عکس پروفایل</p>
            <p className="mt-0.5 text-xs text-slate-500">تصویر مربعی کوچک برای نمایش در پروفایل و لیست‌ها</p>
          </div>

          <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
            <label
              htmlFor={galleryInputId}
              className={`inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 ${disabled || uploading ? 'pointer-events-none opacity-60' : ''}`}
            >
              <UploadIcon className="h-4 w-4" />
              انتخاب عکس
            </label>
            <label
              htmlFor={cameraInputId}
              className={`inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 ${disabled || uploading ? 'pointer-events-none opacity-60' : ''}`}
            >
              <CameraIcon className="h-4 w-4" />
              دوربین
            </label>
            {(value || previewUrl) && !uploading && (
              <button type="button" onClick={handleRemove} className={btnSecondary}>
                حذف عکس
              </button>
            )}
          </div>
        </div>
      </div>

      <input
        id={galleryInputId}
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        disabled={disabled || uploading}
        onChange={(e) => void handleFile(e.target.files?.[0])}
      />
      <input
        id={cameraInputId}
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="user"
        className="hidden"
        disabled={disabled || uploading}
        onChange={(e) => void handleFile(e.target.files?.[0])}
      />
    </div>
  );
}
