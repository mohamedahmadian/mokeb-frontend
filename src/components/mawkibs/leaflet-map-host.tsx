import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useMap } from 'react-leaflet';

export function MapResizeFix() {
  const map = useMap();

  useEffect(() => {
    const invalidate = () => map.invalidateSize();
    const raf = requestAnimationFrame(invalidate);
    const timer = window.setTimeout(invalidate, 150);
    const timer2 = window.setTimeout(invalidate, 400);
    window.addEventListener('resize', invalidate);

    const container = map.getContainer();
    const observer =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(invalidate)
        : null;
    observer?.observe(container);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
      window.clearTimeout(timer2);
      window.removeEventListener('resize', invalidate);
      observer?.disconnect();
    };
  }, [map]);

  return null;
}

export function MapReadyGate({
  mountKey,
  children,
  minHeightClass = 'min-h-48',
}: {
  mountKey: string | number | boolean;
  children: ReactNode;
  minHeightClass?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(false);
    const el = containerRef.current;
    if (!el) return;

    const tryActivate = () => {
      const { width, height } = el.getBoundingClientRect();
      if (width > 0 && height > 0) {
        setReady(true);
        return true;
      }
      return false;
    };

    if (tryActivate()) return;

    const observer =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => {
            if (tryActivate()) observer?.disconnect();
          })
        : null;
    observer?.observe(el);

    const raf = requestAnimationFrame(() => tryActivate());
    const timer = window.setTimeout(() => tryActivate(), 200);
    const timer2 = window.setTimeout(() => tryActivate(), 500);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
      window.clearTimeout(timer2);
      observer?.disconnect();
    };
  }, [mountKey]);

  return (
    <div ref={containerRef} className={`h-full w-full ${minHeightClass}`}>
      {ready ? (
        children
      ) : (
        <div
          className={`flex h-full w-full items-center justify-center bg-slate-200 ${minHeightClass}`}
        >
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-[#4a6fa5]" />
        </div>
      )}
    </div>
  );
}
