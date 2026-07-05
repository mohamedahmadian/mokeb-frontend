const MAX_BYTES = 1024 * 1024;

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('بارگذاری تصویر ناموفق بود'));
    };
    image.src = url;
  });
}

function canvasToJpegBlob(
  canvas: HTMLCanvasElement,
  quality: number,
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/jpeg', quality);
  });
}

async function compressWithCanvas(
  file: File,
  maxBytes: number,
): Promise<File> {
  const image = await loadImage(file);
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('پردازش تصویر در مرورگر پشتیبانی نمی‌شود');
  }

  let width = image.naturalWidth;
  let height = image.naturalHeight;
  const maxDimension = 1600;

  if (width > maxDimension || height > maxDimension) {
    if (width >= height) {
      height = Math.round((height * maxDimension) / width);
      width = maxDimension;
    } else {
      width = Math.round((width * maxDimension) / height);
      height = maxDimension;
    }
  }

  canvas.width = width;
  canvas.height = height;
  context.drawImage(image, 0, 0, width, height);

  for (let quality = 0.9; quality >= 0.45; quality -= 0.08) {
    const blob = await canvasToJpegBlob(canvas, quality);
    if (blob && blob.size <= maxBytes) {
      return new File([blob], replaceExtension(file.name, '.jpg'), {
        type: 'image/jpeg',
        lastModified: Date.now(),
      });
    }
  }

  canvas.width = Math.max(640, Math.floor(width * 0.75));
  canvas.height = Math.max(480, Math.floor(height * 0.75));
  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  const fallbackBlob = await canvasToJpegBlob(canvas, 0.55);
  if (!fallbackBlob) {
    throw new Error('فشرده‌سازی تصویر ناموفق بود');
  }

  return new File([fallbackBlob], replaceExtension(file.name, '.jpg'), {
    type: 'image/jpeg',
    lastModified: Date.now(),
  });
}

function replaceExtension(name: string, extension: string): string {
  const base = name.replace(/\.[^.]+$/, '');
  return `${base || 'national-id-card'}${extension}`;
}

export async function prepareUploadImage(
  file: File,
  maxBytes = MAX_BYTES,
): Promise<File> {
  if (!file.type.startsWith('image/')) {
    throw new Error('فقط فایل تصویری مجاز است');
  }

  if (file.size <= maxBytes) {
    return file;
  }

  return compressWithCanvas(file, maxBytes);
}

export async function prepareProfileImage(file: File): Promise<File> {
  return prepareUploadImage(file, 300 * 1024);
}

export async function prepareNationalIdCardImage(file: File): Promise<File> {
  return prepareUploadImage(file);
}
