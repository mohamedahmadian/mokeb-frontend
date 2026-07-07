import { toPng } from 'html-to-image';
import vazirWoff2 from '../assets/fonts/Vazir.woff2';
import vazirMediumWoff2 from '../assets/fonts/Vazir-Medium.woff2';
import vazirBoldWoff2 from '../assets/fonts/Vazir-Bold.woff2';

type PreparedFonts = {
  embedCSS: string;
};

export type PilgrimCardPrintTarget = Window | null;

let preparedFonts: PreparedFonts | null = null;

export function isMobilePrintEnvironment(): boolean {
  if (typeof window === 'undefined') return false;

  const ua = navigator.userAgent;
  const isIOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isAndroid = /Android/i.test(ua);
  const narrowTouch =
    window.matchMedia('(max-width: 768px)').matches &&
    'ontouchstart' in window;

  return isIOS || isAndroid || narrowTouch;
}

/** Must run synchronously inside the user click handler (before await). */
export function openPilgrimCardPrintWindow(): PilgrimCardPrintTarget {
  if (!isMobilePrintEnvironment()) return null;

  const win = window.open('', '_blank');
  if (!win) return null;

  win.document.open();
  win.document.write(`<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>زائر کارت</title>
  <style>
    html, body { margin: 0; min-height: 100%; background: #fff; font-family: Tahoma, sans-serif; }
    body { display: flex; align-items: center; justify-content: center; padding: 16px; box-sizing: border-box; }
    p { color: #475569; font-size: 14px; text-align: center; }
  </style>
</head>
<body><p>در حال آماده‌سازی زائر کارت برای چاپ...</p></body>
</html>`);
  win.document.close();

  return win;
}

async function fetchFontDataUrl(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load font: ${url}`);
  }
  const blob = await response.blob();
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error(`Failed to read font: ${url}`));
    reader.readAsDataURL(blob);
  });
}

function buildFontFaceRule(weight: number, dataUrl: string): string {
  return `@font-face{font-family:'Vazir';src:url('${dataUrl}') format('woff2');font-weight:${weight};font-style:normal;font-display:swap;}`;
}

/**
 * html-to-image با fontEmbedCSS، URLهای معمولی را embed نمی‌کند.
 * فونت باید data URL باشد و در document.fonts هم ثبت شود.
 */
async function prepareVazirFonts(): Promise<PreparedFonts> {
  if (preparedFonts) return preparedFonts;

  const [regular, medium, bold] = await Promise.all([
    fetchFontDataUrl(vazirWoff2),
    fetchFontDataUrl(vazirMediumWoff2),
    fetchFontDataUrl(vazirBoldWoff2),
  ]);

  const weightSources: Array<[string, string]> = [
    ['400', regular],
    ['500', medium],
    ['600', medium],
    ['700', bold],
    ['800', bold],
  ];

  await Promise.all(
    weightSources.map(async ([weight, src]) => {
      const face = new FontFace('Vazir', `url(${src})`, { weight });
      const loaded = await face.load();
      document.fonts.add(loaded);
    }),
  );
  await document.fonts.ready;

  preparedFonts = {
    embedCSS: weightSources
      .map(([weight, src]) => buildFontFaceRule(Number(weight), src))
      .join(''),
  };

  return preparedFonts;
}

async function waitForImages(root: HTMLElement): Promise<void> {
  const images = Array.from(root.querySelectorAll('img'));
  await Promise.all(
    images.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete && img.naturalWidth > 0) {
            resolve();
            return;
          }
          const done = () => resolve();
          img.addEventListener('load', done, { once: true });
          img.addEventListener('error', done, { once: true });
        }),
    ),
  );
}

/** A5 printable area with 8mm margins (148×210mm sheet). */
const A5_PRINT_MAX_WIDTH_MM = 132;
const A5_PRINT_MAX_HEIGHT_MM = 194;

function buildPrintDocumentHtml(imageSrc: string): string {
  return `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>زائر کارت</title>
  <style>
    @page { size: A5 portrait; margin: 8mm; }
    html, body { margin: 0; padding: 0; background: #fff; }
    body {
      display: flex;
      justify-content: center;
      align-items: flex-start;
      min-height: 100%;
    }
    img {
      display: block;
      width: auto;
      height: auto;
      max-width: ${A5_PRINT_MAX_WIDTH_MM}mm;
      max-height: ${A5_PRINT_MAX_HEIGHT_MM}mm;
      object-fit: contain;
    }
  </style>
</head>
<body>
  <img src="${imageSrc}" alt="زائر کارت" />
</body>
</html>`;
}

async function dataUrlToBlobUrl(dataUrl: string): Promise<string> {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

function agentLog(
  hypothesisId: string,
  location: string,
  message: string,
  data: Record<string, unknown>,
): void {
  // #region agent log
  fetch('http://127.0.0.1:7929/ingest/64824c4b-ac44-41b9-87b8-d1ea5f1d3aa4', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Debug-Session-Id': '06086f',
    },
    body: JSON.stringify({
      sessionId: '06086f',
      hypothesisId,
      location,
      message,
      data,
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion
}

function runPrintInWindow(
  win: Window,
  imageSrc: string,
  cleanup?: () => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const doc = win.document;
    if (!doc) {
      cleanup?.();
      reject(new Error('چاپ در دسترس نیست'));
      return;
    }

    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      cleanup?.();
      resolve();
    };

    doc.open();
    doc.write(buildPrintDocumentHtml(imageSrc));
    doc.close();

    const img = doc.querySelector('img');
    const runPrint = () => {
      agentLog('H1', 'pilgrim-card-download.ts:runPrint', 'Triggering print', {
        mobile: isMobilePrintEnvironment(),
        viaPopup: win !== window,
        imageSrcKind: imageSrc.startsWith('blob:') ? 'blob' : 'data',
        naturalWidth: img?.naturalWidth ?? 0,
        naturalHeight: img?.naturalHeight ?? 0,
        a5MaxWidthMm: A5_PRINT_MAX_WIDTH_MM,
        a5MaxHeightMm: A5_PRINT_MAX_HEIGHT_MM,
      });

      win.addEventListener('afterprint', finish, { once: true });
      win.focus();
      win.print();
      window.setTimeout(finish, 6000);
    };

    if (!img) {
      cleanup?.();
      reject(new Error('چاپ در دسترس نیست'));
      return;
    }

    if (img.complete) {
      runPrint();
    } else {
      img.addEventListener('load', runPrint, { once: true });
      img.addEventListener(
        'error',
        () => {
          cleanup?.();
          reject(new Error('بارگذاری تصویر چاپ ناموفق بود'));
        },
        { once: true },
      );
    }
  });
}

export async function capturePilgrimCardPng(element: HTMLElement): Promise<string> {
  const mobile = isMobilePrintEnvironment();
  const { embedCSS } = await prepareVazirFonts();
  await waitForImages(element);

  try {
    const dataUrl = await toPng(element, {
      cacheBust: true,
      pixelRatio: mobile ? 1.5 : 2,
      backgroundColor: '#ffffff',
      fontEmbedCSS: embedCSS,
      style: {
        fontFamily: "'Vazir', Tahoma, sans-serif",
      },
    });

    agentLog('H4', 'pilgrim-card-download.ts:capture', 'Capture succeeded', {
      mobile,
      dataUrlLength: dataUrl.length,
    });

    return dataUrl;
  } catch (error) {
    agentLog('H4', 'pilgrim-card-download.ts:capture', 'Capture failed', {
      mobile,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

export async function downloadPilgrimCardImage(
  element: HTMLElement,
  filename: string,
): Promise<void> {
  const dataUrl = await capturePilgrimCardPng(element);
  const blob = await (await fetch(dataUrl)).blob();
  const blobUrl = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = filename;
  link.rel = 'noopener';
  link.style.display = 'none';
  document.body.appendChild(link);

  // #region agent log
  fetch('http://127.0.0.1:7929/ingest/64824c4b-ac44-41b9-87b8-d1ea5f1d3aa4', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Debug-Session-Id': '06086f',
    },
    body: JSON.stringify({
      sessionId: '06086f',
      hypothesisId: 'H5',
      location: 'pilgrim-card-download.ts:download',
      message: 'Triggering file download',
      data: {
        filename,
        blobSize: blob.size,
        userActivationActive:
          typeof navigator !== 'undefined' &&
          'userActivation' in navigator &&
          navigator.userActivation?.isActive,
        userActivationHasBeenActive:
          typeof navigator !== 'undefined' &&
          'userActivation' in navigator &&
          navigator.userActivation?.hasBeenActive,
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  link.click();

  window.setTimeout(() => {
    URL.revokeObjectURL(blobUrl);
    link.remove();
  }, 250);
}

export async function printPilgrimCardImage(
  element: HTMLElement,
  printWindow?: PilgrimCardPrintTarget,
): Promise<void> {
  const mobile = isMobilePrintEnvironment();
  const dataUrl = await capturePilgrimCardPng(element);
  const imageSrc = mobile ? await dataUrlToBlobUrl(dataUrl) : dataUrl;

  agentLog('H2', 'pilgrim-card-download.ts:print-start', 'Print pipeline', {
    mobile,
    hasPrintWindow: Boolean(printWindow && !printWindow.closed),
    imageSrcKind: imageSrc.startsWith('blob:') ? 'blob' : 'data',
    dataUrlLength: dataUrl.length,
  });

  if (printWindow && !printWindow.closed) {
    try {
      await runPrintInWindow(printWindow, imageSrc, () => {
        if (imageSrc.startsWith('blob:')) URL.revokeObjectURL(imageSrc);
      });
      return;
    } catch (error) {
      agentLog('H1', 'pilgrim-card-download.ts:popup-print-failed', 'Popup print failed', {
        error: error instanceof Error ? error.message : String(error),
      });
      printWindow.close();
    }
  }

  if (mobile && !printWindow) {
    agentLog('H2', 'pilgrim-card-download.ts:popup-blocked', 'Print window blocked', {});
    if (imageSrc.startsWith('blob:')) URL.revokeObjectURL(imageSrc);
    throw new Error('POPUP_BLOCKED');
  }

  await new Promise<void>((resolve, reject) => {
    const iframe = document.createElement('iframe');
    iframe.style.cssText =
      'position:fixed;width:0;height:0;border:0;visibility:hidden';
    document.body.appendChild(iframe);

    const win = iframe.contentWindow;
    if (!win) {
      iframe.remove();
      reject(new Error('چاپ در دسترس نیست'));
      return;
    }

    const cleanup = () => {
      iframe.remove();
      if (imageSrc.startsWith('blob:')) URL.revokeObjectURL(imageSrc);
    };

    runPrintInWindow(win, imageSrc, cleanup)
      .then(resolve)
      .catch((error) => {
        cleanup();
        agentLog('H1', 'pilgrim-card-download.ts:iframe-print-failed', 'Iframe print failed', {
          mobile,
          error: error instanceof Error ? error.message : String(error),
        });
        reject(error);
      });
  });
}
