import { toPng } from 'html-to-image';
import vazirWoff2 from '../assets/fonts/Vazir.woff2';
import vazirMediumWoff2 from '../assets/fonts/Vazir-Medium.woff2';
import vazirBoldWoff2 from '../assets/fonts/Vazir-Bold.woff2';

type PreparedFonts = {
  embedCSS: string;
};

let preparedFonts: PreparedFonts | null = null;

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

export async function downloadPilgrimCardImage(
  element: HTMLElement,
  filename: string,
): Promise<void> {
  const { embedCSS } = await prepareVazirFonts();
  await waitForImages(element);

  const dataUrl = await toPng(element, {
    cacheBust: true,
    pixelRatio: 2,
    backgroundColor: '#ffffff',
    fontEmbedCSS: embedCSS,
    style: {
      fontFamily: "'Vazir', Tahoma, sans-serif",
    },
  });

  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  link.click();
}
