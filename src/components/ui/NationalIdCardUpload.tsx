import { useId, useRef, useState } from 'react';
import { guestTheme } from '../../lib/guest-theme';
import { btnSecondary } from '../../lib/styles';
import { toast } from '../../lib/toast';
import { uploadsApi } from '../../lib/uploads';

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

interface NationalIdCardUploadProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  disabled?: boolean;
  className?: string;
}

export function NationalIdCardUpload({
  value,
  onChange,
  disabled = false,
  className = '',
}: NationalIdCardUploadProps) {
  const galleryInputId = useId();
  const cameraInputId = useId();
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const displayUrl = previewUrl ?? value ?? null;

  const handleFile = async (file?: File | null) => {
    if (!file || disabled || uploading) return;

    setUploading(true);
    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);

    try {
      const result = await uploadsApi.uploadNationalIdCard(file);
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
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-slate-600">عکس کارت ملی</span>
        {displayUrl && !uploading && (
          <button
            type="button"
            onClick={handleRemove}
            disabled={disabled}
            className="text-xs text-red-600 hover:underline disabled:opacity-50"
          >
            حذف تصویر
          </button>
        )}
      </div>

      {displayUrl ? (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
          <img
            src={displayUrl}
            alt="پیش‌نمایش کارت ملی"
            className="max-h-56 w-full object-contain"
          />
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-6 text-center text-sm text-slate-500">
          {uploading ? 'در حال آپلود و بهینه‌سازی تصویر...' : 'تصویر کارت ملی را انتخاب یا عکس بگیرید'}
        </div>
      )}

      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          ref={galleryInputRef}
          id={galleryInputId}
          type="file"
          accept="image/*"
          className="hidden"
          disabled={disabled || uploading}
          onChange={(event) => void handleFile(event.target.files?.[0])}
        />
        <input
          ref={cameraInputRef}
          id={cameraInputId}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          disabled={disabled || uploading}
          onChange={(event) => void handleFile(event.target.files?.[0])}
        />

        <button
          type="button"
          disabled={disabled || uploading}
          onClick={() => galleryInputRef.current?.click()}
          className={`${btnSecondary} inline-flex min-h-10 flex-1 items-center justify-center gap-2`}
        >
          <UploadIcon className="h-4 w-4 shrink-0" />
          انتخاب تصویر
        </button>
        <button
          type="button"
          disabled={disabled || uploading}
          onClick={() => cameraInputRef.current?.click()}
          className={`${guestTheme.btnPrimaryLg} inline-flex min-h-10 flex-1 items-center justify-center gap-2 !py-2.5 !text-sm`}
        >
          <CameraIcon className="h-4 w-4 shrink-0" />
          {uploading ? 'در حال آپلود...' : 'گرفتن عکس'}
        </button>
      </div>
    </div>
  );
}
