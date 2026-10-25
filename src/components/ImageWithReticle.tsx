import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { DeltaRegion } from '../types/bodyCheck';
import { ZoomIn } from 'lucide-react';

export interface ImageWithReticleProps {
  src: string;
  alt: string;
  deltaRegion?: DeltaRegion;
  changeCoordinates?: {
    xPercent: number;
    yPercent: number;
    radiusPercent: number;
  };
  showReticle?: boolean;
  className?: string;
  containerClassName?: string;
  onClick?: () => void;
  reticleLabel?: string;
  badgeText?: string;
  onInspect?: () => void;
  showInspectButton?: boolean;
  isNormalOrUnchanged?: boolean;
}

export const ImageWithReticle: React.FC<ImageWithReticleProps> = ({
  src,
  alt,
  deltaRegion,
  changeCoordinates,
  showReticle = true,
  className = '',
  containerClassName = '',
  onClick,
  reticleLabel = 'INDICATED CHANGE',
  badgeText,
  onInspect,
  showInspectButton = true,
  isNormalOrUnchanged = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const [renderedBounds, setRenderedBounds] = useState<{
    left: number;
    top: number;
    width: number;
    height: number;
  } | null>(null);

  // Derive normalized delta region
  const region: DeltaRegion | null = useMemo(() => {
    if (isNormalOrUnchanged) return null;
    if (deltaRegion && typeof deltaRegion.x === 'number' && typeof deltaRegion.y === 'number') {
      return deltaRegion;
    }
    if (changeCoordinates && typeof changeCoordinates.xPercent === 'number' && typeof changeCoordinates.yPercent === 'number') {
      return {
        x: changeCoordinates.xPercent / 100,
        y: changeCoordinates.yPercent / 100,
        width: ((changeCoordinates.radiusPercent || 10) * 2) / 100,
        height: ((changeCoordinates.radiusPercent || 10) * 2) / 100
      };
    }
    return null;
  }, [deltaRegion, changeCoordinates, isNormalOrUnchanged]);

  // Accurately compute rendered image rectangle inside object-fit: contain
  const updateRenderedBounds = useCallback(() => {
    const container = containerRef.current;
    const img = imgRef.current;
    if (!container || !img || !img.naturalWidth || !img.naturalHeight) {
      return;
    }

    const cW = container.clientWidth;
    const cH = container.clientHeight;
    if (cW === 0 || cH === 0) return;

    const cRatio = cW / cH;
    const iRatio = img.naturalWidth / img.naturalHeight;

    let w: number;
    let h: number;
    let left: number;
    let top: number;

    if (iRatio > cRatio) {
      // Constrained by container width
      w = cW;
      h = cW / iRatio;
      left = 0;
      top = (cH - h) / 2;
    } else {
      // Constrained by container height
      h = cH;
      w = cH * iRatio;
      left = (cW - w) / 2;
      top = 0;
    }

    setRenderedBounds({ left, top, width: w, height: h });
  }, []);

  useEffect(() => {
    updateRenderedBounds();
    const container = containerRef.current;
    if (!container) return;

    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(() => {
        updateRenderedBounds();
      });
      observer.observe(container);
    }

    window.addEventListener('resize', updateRenderedBounds);

    return () => {
      if (observer) observer.disconnect();
      window.removeEventListener('resize', updateRenderedBounds);
    };
  }, [updateRenderedBounds]);

  const hasReticle = showReticle && region !== null;

  // Sizing of reticle
  const reticleWidthPercent = region ? Math.max(region.width * 1.25, 0.08) * 100 : 0;
  const reticleHeightPercent = region ? Math.max(region.height * 1.25, 0.08) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className={`relative aspect-[4/3] bg-slate-950 flex items-center justify-center overflow-hidden ${onClick ? 'cursor-zoom-in' : ''} group ${containerClassName}`}
      onClick={onClick}
    >
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        onLoad={updateRenderedBounds}
        className={`w-full h-full object-contain transition-transform duration-200 group-hover:scale-[1.01] ${className}`}
      />

      {/* Responsive, Image-Anchored Reticle Overlay */}
      {hasReticle && renderedBounds && (
        <div
          className="absolute pointer-events-none"
          style={{
            left: `${renderedBounds.left}px`,
            top: `${renderedBounds.top}px`,
            width: `${renderedBounds.width}px`,
            height: `${renderedBounds.height}px`,
          }}
        >
          <div
            className="absolute pointer-events-none transition-all duration-200"
            style={{
              left: `${region.x * 100}%`,
              top: `${region.y * 100}%`,
              transform: 'translate(-50%, -50%)',
              width: `${reticleWidthPercent}%`,
              height: `${reticleHeightPercent}%`,
            }}
          >
            {/* Visual Delta Reticle ring and center indicator */}
            <div className="w-full h-full rounded-full border-2 border-dashed border-rose-500 bg-rose-500/15 flex items-center justify-center shadow-xs">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-600 shadow-xs"></div>
            </div>

            {reticleLabel && (
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap bg-rose-900/90 text-white text-[9px] font-mono px-1.5 py-0.5 rounded shadow">
                {reticleLabel}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Subtle message when change overlay is toggled ON but no change exists */}
      {showReticle && !region && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-slate-900/85 backdrop-blur-xs text-slate-100 text-xs px-3.5 py-1.5 rounded-full border border-slate-700/60 shadow-lg flex items-center gap-2 pointer-events-none select-none z-10 whitespace-nowrap">
          <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
          <span className="font-medium text-[11px] tracking-wide">No localized visual change detected</span>
        </div>
      )}

      {badgeText && (
        <div className="absolute top-2 left-2 bg-sky-900/85 text-white text-[10px] font-mono px-2 py-0.5 rounded backdrop-blur-xs">
          {badgeText}
        </div>
      )}

      {showInspectButton && (
        <button
          type="button"
          onClick={(e) => {
            if (onInspect) {
              e.stopPropagation();
              onInspect();
            }
          }}
          className="absolute top-2 right-2 bg-slate-900/75 hover:bg-slate-900 text-white text-[11px] px-2 py-1 rounded backdrop-blur-xs flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity no-print"
          title="Inspect high-resolution image"
        >
          <ZoomIn className="w-3.5 h-3.5" />
          <span>Inspect</span>
        </button>
      )}
    </div>
  );
};
