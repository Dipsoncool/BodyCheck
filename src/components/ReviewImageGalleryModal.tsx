import React, { useState, useEffect, useMemo } from 'react';
import { GalleryImageAsset, GALLERY_REVIEW_ASSETS } from '../data/mockRecords';
import { BodyRegion } from '../types/bodyCheck';
import { X, CheckCircle2, Image as ImageIcon, AlertCircle } from 'lucide-react';

interface ReviewImageGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAsset: (asset: GalleryImageAsset) => void;
  currentlySelectedId?: string;
  recordId: string;
  bodyRegion: BodyRegion;
  referenceImage?: string;
  referenceImageId?: string;
}

export const ReviewImageGalleryModal: React.FC<ReviewImageGalleryModalProps> = ({
  isOpen,
  onClose,
  onSelectAsset,
  currentlySelectedId,
  recordId,
  bodyRegion,
  referenceImage,
  referenceImageId
}) => {
  // Strictly filter images belonging ONLY to the selected Record ID and Body Region
  const matchingAssets = useMemo(() => {
    if (!recordId) return [];
    return GALLERY_REVIEW_ASSETS.filter(asset => {
      const matchRecord = asset.recordId.trim().toUpperCase() === recordId.trim().toUpperCase();
      const matchRegion = !bodyRegion || asset.bodyRegion.trim().toLowerCase() === bodyRegion.trim().toLowerCase();
      return matchRecord && matchRegion;
    });
  }, [recordId, bodyRegion]);

  const [selectedAssetId, setSelectedAssetId] = useState<string>(() => {
    if (currentlySelectedId && matchingAssets.some(a => a.id === currentlySelectedId)) {
      return currentlySelectedId;
    }
    return matchingAssets[0]?.id || '';
  });

  // Keep selected ID in sync when modal opens or matching assets change
  useEffect(() => {
    if (currentlySelectedId && matchingAssets.some(a => a.id === currentlySelectedId)) {
      setSelectedAssetId(currentlySelectedId);
    } else if (matchingAssets.length > 0) {
      setSelectedAssetId(matchingAssets[0].id);
    } else {
      setSelectedAssetId('');
    }
  }, [isOpen, currentlySelectedId, matchingAssets]);

  if (!isOpen) return null;

  const selectedAsset = matchingAssets.find(a => a.id === selectedAssetId);
  const hasNewImages = matchingAssets.some(a => a.isNew);
  const refImgSrc = referenceImage || `/images/body-check/${recordId}/reference.webp`;

  const handleConfirm = () => {
    if (selectedAsset) {
      onSelectAsset(selectedAsset);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-lg shadow-xl border border-slate-200 max-w-5xl xl:max-w-6xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header - Fixed */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-md bg-sky-100 text-sky-800 flex items-center justify-center shadow-2xs shrink-0">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-slate-900">
                  Review Image Selection
                </h3>
                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-200">
                  {recordId}
                </span>
                <span className="text-xs font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                  {bodyRegion}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Review images strictly filtered for Record <strong className="text-slate-700 font-mono">{recordId}</strong> ({bodyRegion}). Unrelated records are excluded.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer shrink-0 ml-2"
            title="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Main Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-slate-50/40">
          <div className="flex flex-col md:flex-row gap-4 sm:gap-5 items-start">
            
            {/* 1. LEFT: [Reference Image] Reference Baseline (Reasonably sized fixed panel) */}
            <div className="w-full md:w-64 lg:w-72 shrink-0 bg-white rounded-lg border border-slate-200 p-3.5 shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    [Reference Image]
                  </span>
                  <span className="text-xs font-semibold text-slate-900">
                    Reference
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                  Baseline
                </span>
              </div>

              {/* Reference Thumbnail Area (190px height, object-contain) */}
              <div className="h-[190px] w-full bg-slate-950 rounded border border-slate-200 overflow-hidden relative flex items-center justify-center">
                <img
                  src={refImgSrc}
                  alt={`Reference Baseline ${recordId}`}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLElement).style.opacity = '0.9';
                  }}
                />
                <span className="absolute top-2 left-2 bg-slate-900/85 text-white text-[10px] font-mono px-2 py-0.5 rounded shadow-2xs">
                  BASELINE
                </span>
                <span className="absolute bottom-2 left-2 bg-slate-900/85 text-slate-200 text-[10px] font-mono px-2 py-0.5 rounded shadow-2xs">
                  {referenceImageId || `${recordId}-REF`}
                </span>
              </div>

              {/* Compact Reference Details */}
              <div className="bg-slate-50 rounded p-2.5 text-xs space-y-1.5 border border-slate-200 text-slate-600">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Record ID:</span>
                  <span className="font-mono font-bold text-slate-900">{recordId}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Body Region:</span>
                  <span className="font-medium text-slate-800">{bodyRegion}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Reference ID:</span>
                  <span className="font-mono text-slate-700">{referenceImageId || `${recordId}-REF`}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] pt-1.5 border-t border-slate-200">
                  <span className="text-slate-400">File:</span>
                  <span className="font-mono text-slate-600 truncate max-w-[170px]" title={`public/images/body-check/${recordId}/reference.webp`}>
                    reference.webp
                  </span>
                </div>
              </div>
            </div>

            {/* 2. RIGHT: [Review Image] Review Candidates (Multi-column compact grid) */}
            <div className="flex-1 min-w-0 w-full bg-white rounded-lg border border-slate-200 p-3.5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    [Review Image]
                  </span>
                  <span className="text-xs font-semibold text-slate-900">
                    Review Candidates
                  </span>
                </div>
                {hasNewImages ? (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                    NEW AVAILABLE
                  </span>
                ) : (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                    NO NEW IMAGES
                  </span>
                )}
              </div>

              {/* Review Images Grid or Empty State */}
              {matchingAssets.length === 0 ? (
                <div className="py-12 px-4 border-2 border-dashed border-slate-200 rounded-lg text-center space-y-3 bg-slate-50/60">
                  <div className="h-10 w-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-800">
                      No new images available
                    </h4>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                      No review images are registered for record <strong className="font-mono text-slate-700">{recordId}</strong> in region <strong className="text-slate-700">{bodyRegion}</strong>.
                    </p>
                    <p className="text-[11px] text-slate-400 pt-1">
                      Images from other records are strictly isolated and not displayed.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Warning/Banner if none of the images are NEW */}
                  {!hasNewImages && (
                    <div className="p-2.5 bg-amber-50/70 border border-amber-200 rounded text-xs text-amber-800 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div className="text-[11px] leading-tight">
                        <span className="font-bold">No new images available.</span> Displaying existing reference/follow-up record asset.
                      </div>
                    </div>
                  )}

                  {/* Responsive Candidate Cards Grid */}
                  <div className={`grid gap-3.5 ${
                    matchingAssets.length === 1
                      ? 'grid-cols-1 max-w-md'
                      : matchingAssets.length === 2
                      ? 'grid-cols-1 sm:grid-cols-2'
                      : 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3'
                  }`}>
                    {matchingAssets.map((asset) => {
                      const isSelected = asset.id === selectedAssetId;
                      return (
                        <div
                          key={asset.id}
                          onClick={() => setSelectedAssetId(asset.id)}
                          className={`rounded-lg border overflow-hidden cursor-pointer transition-all flex flex-col group ${
                            isSelected
                              ? 'border-sky-600 ring-2 ring-sky-500/30 shadow-xs bg-sky-50/15'
                              : 'border-slate-200 hover:border-slate-300 bg-white hover:shadow-2xs'
                          }`}
                        >
                          {/* Compact Thumbnail Container (Fixed 190px height, object-contain) */}
                          <div className="h-[190px] w-full bg-slate-950 relative overflow-hidden flex items-center justify-center">
                            <img
                              src={asset.imageUrl}
                              alt={asset.id}
                              className="w-full h-full object-contain transition-transform duration-200 group-hover:scale-[1.01]"
                            />

                            {/* Top Badges */}
                            <div className="absolute top-2 left-2 flex items-center gap-1.5">
                              {asset.isNew ? (
                                <span className="bg-emerald-600 text-white font-bold text-[10px] font-mono px-2 py-0.5 rounded shadow-2xs flex items-center gap-1">
                                  NEW
                                </span>
                              ) : (
                                <span className="bg-slate-800/90 text-slate-300 text-[10px] font-mono px-1.5 py-0.5 rounded shadow-2xs">
                                  Existing
                                </span>
                              )}
                            </div>

                            {/* Selected Checkmark Indicator */}
                            {isSelected && (
                              <div className="absolute top-2 right-2 bg-sky-600 text-white p-1 rounded-full shadow-xs">
                                <CheckCircle2 className="w-4 h-4" />
                              </div>
                            )}

                            <span className="absolute bottom-2 left-2 bg-slate-900/85 text-slate-300 text-[10px] font-mono px-2 py-0.5 rounded">
                              {asset.id}
                            </span>
                          </div>

                          {/* Candidate Card Info: NEW/Existing, Review ID, Date, Filename */}
                          <div className="p-3 text-xs space-y-2 flex-1 flex flex-col justify-between">
                            <div className="flex items-center justify-between gap-1.5">
                              <span className="font-mono font-bold text-slate-900 text-sm">
                                {asset.id}
                              </span>
                              {asset.isNew ? (
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  NEW
                                </span>
                              ) : (
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                                  Existing
                                </span>
                              )}
                            </div>

                            <div className="bg-slate-50 p-2 rounded border border-slate-200 space-y-1 text-slate-600 text-[11px]">
                              <div className="flex justify-between items-center">
                                <span className="text-slate-400">Date:</span>
                                <span className="font-mono text-slate-700">{asset.captureDate}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-slate-400">File:</span>
                                <span className="font-mono text-slate-700 truncate max-w-[170px]" title={asset.fileName}>
                                  {asset.fileName}
                                </span>
                              </div>
                            </div>
                          </div>

                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>

          </div>
        </div>

        {/* Footer Actions - Fixed Always Visible */}
        <div className="p-3.5 sm:p-4 border-t border-slate-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shrink-0">
          <div className="text-slate-600">
            {selectedAsset ? (
              <span className="flex items-center gap-1.5 flex-wrap">
                <span>Selected:</span>
                <strong className="font-mono text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                  {selectedAsset.id}
                </strong>
                {selectedAsset.isNew && (
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.2 rounded">
                    NEW
                  </span>
                )}
                <span className="text-slate-500">({selectedAsset.bodyRegion})</span>
              </span>
            ) : (
              <span className="text-slate-400 italic">
                {matchingAssets.length === 0 ? 'No review images available to select.' : 'Click on a review image above to select it.'}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 border border-slate-300 rounded text-slate-700 bg-white hover:bg-slate-50 font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!selectedAsset}
              onClick={handleConfirm}
              className={`px-4 py-2 rounded font-semibold transition-colors shadow-2xs ${
                selectedAsset
                  ? 'bg-sky-700 hover:bg-sky-800 text-white cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              Use Selected Image
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
