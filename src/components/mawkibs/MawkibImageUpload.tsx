import { useId, useRef, useState } from 'react';
import { resolveAssetUrl } from '../../lib/geo';
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

interface MawkibImageUploadProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  disabled?: boolean;
  label?: string;
  className?: string;
}

export function MawkibImageUpload({
  value,
  onChange,
  disabled = false,
  label = 'تصویر اصلی موکب',
  className = '',
}: MawkibImageUploadProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const displayUrl = previewUrl ?? (value ? resolveAssetUrl(value) : null);

  const handleFile = async (file?: File | null) => {
    if (!file || disabled || uploading) return;

    setUploading(true);
    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);

    try {
      const result = await uploadsApi.uploadMawkibImage(file);
      onChange(result.url);
      setPreviewUrl(null);
      URL.revokeObjectURL(localPreview);
    } catch (err) {
      setPreviewUrl(null);
      URL.revokeObjectURL(localPreview);
      toast.error(err instanceof Error ? err.message : 'خطا در آپلود تصویر');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
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
        <span className="text-sm text-slate-600">{label}</span>
        {displayUrl && !uploading && !disabled && (
          <button
            type="button"
            onClick={handleRemove}
            className="text-xs text-red-600 hover:underline"
          >
            حذف تصویر
          </button>
        )}
      </div>

      {displayUrl ? (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
          <img
            src={displayUrl}
            alt={label}
            className="max-h-56 w-full object-cover"
          />
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-6 text-center text-sm text-slate-500">
          {uploading ? 'در حال آپلود و بهینه‌سازی تصویر...' : 'تصویر موکب را انتخاب کنید'}
        </div>
      )}

      {!disabled && (
        <>
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            accept="image/*"
            className="hidden"
            disabled={uploading}
            onChange={(event) => void handleFile(event.target.files?.[0])}
          />
          <button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className={`${btnSecondary} inline-flex min-h-10 w-full items-center justify-center gap-2 sm:w-auto`}
          >
            <UploadIcon className="h-4 w-4 shrink-0" />
            {uploading ? 'در حال آپلود...' : displayUrl ? 'تغییر تصویر' : 'انتخاب تصویر'}
          </button>
        </>
      )}
    </div>
  );
}

interface MawkibGalleryUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  disabled?: boolean;
  className?: string;
}

export function MawkibGalleryUpload({
  value,
  onChange,
  disabled = false,
  className = '',
}: MawkibGalleryUploadProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length || disabled || uploading) return;

    setUploading(true);
    const uploaded: string[] = [];

    try {
      for (const file of Array.from(files)) {
        const result = await uploadsApi.uploadMawkibImage(file);
        uploaded.push(result.url);
      }
      onChange([...value, ...uploaded]);
    } catch (err) {
      if (uploaded.length > 0) {
        onChange([...value, ...uploaded]);
      }
      toast.error(err instanceof Error ? err.message : 'خطا در آپلود تصاویر');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleRemove = (index: number) => {
    if (disabled || uploading) return;
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-slate-600">گالری تصاویر موکب</span>
        <span className="text-xs text-slate-400">معرفی امکانات و فضاهای موکب</span>
      </div>

      {value.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {value.map((url, index) => (
            <div
              key={`${url}-${index}`}
              className="group relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
            >
              <img
                src={resolveAssetUrl(url)}
                alt={`تصویر ${index + 1} موکب`}
                className="aspect-[4/3] w-full object-cover"
              />
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="absolute left-2 top-2 rounded-lg bg-black/55 px-2 py-1 text-xs text-white opacity-0 transition group-hover:opacity-100"
                >
                  حذف
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {!disabled && (
        <>
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            disabled={uploading}
            onChange={(event) => void handleFiles(event.target.files)}
          />
          <button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className={`${btnSecondary} inline-flex min-h-10 w-full items-center justify-center gap-2 sm:w-auto`}
          >
            <UploadIcon className="h-4 w-4 shrink-0" />
            {uploading ? 'در حال آپلود...' : 'افزودن تصویر به گالری'}
          </button>
        </>
      )}

      {value.length === 0 && !uploading && (
        <p className="text-xs text-slate-500">
          می‌توانید چند تصویر از امکانات، فضاها و خدمات موکب اضافه کنید.
        </p>
      )}
    </div>
  );
}
