import React, { useState, useRef, useMemo } from 'react';
import { BodyRegion } from '../types/bodyCheck';
import {
  Upload,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Zap,
  Trash2,
  Copy
} from 'lucide-react';

const BODY_REGIONS: BodyRegion[] = [
  'Forehead',
  'Chest',
  'Abdomen',
  'Back',
  'Legs',
  'Full Body Front',
  'Full Body Back',
  'Left Shoulder',
  'Right Shoulder',
  'Left Upper Arm',
  'Right Upper Arm',
  'Left Forearm',
  'Right Forearm',
  'Left Knee',
  'Right Knee',
  'Left Lower Leg',
  'Right Lower Leg',
  'Foot',
  'Other'
];

interface DirectScanViewProps {
  onAnalyze: (params: {
    patientRecordId: string;
    referenceImage: string;
    referenceImageId: string;
    referenceDate: string;
    newImage: string;
    newImageId: string;
    newImageDate: string;
    bodyRegion: BodyRegion;
  }) => void;
  onCancel: () => void;
}

export const DirectScanView: React.FC<DirectScanViewProps> = ({
  onAnalyze,
  onCancel
}) => {
  const [refImage, setRefImage] = useState<string>('');
  const [refFileName, setRefFileName] = useState<string>('');
  const [revImage, setRevImage] = useState<string>('');
  const [revFileName, setRevFileName] = useState<string>('');
  const [bodyRegion, setBodyRegion] = useState<BodyRegion>('Other');
  const [patientRecordTag, setPatientRecordTag] = useState<string>('DIRECT-SCAN');
  const [error, setError] = useState<string | null>(null);

  const refInputRef = useRef<HTMLInputElement>(null);
  const revInputRef = useRef<HTMLInputElement>(null);

  // Check if images are identical (same dataUrl or same preset path)
  const isSameImage = useMemo(() => {
    if (!refImage || !revImage) return false;
    return refImage === revImage;
  }, [refImage, revImage]);

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'reference' | 'review'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (JPG, PNG, or WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (type === 'reference') {
        setRefImage(dataUrl);
        setRefFileName(file.name);
      } else {
        setRevImage(dataUrl);
        setRevFileName(file.name);
      }
      setError(null);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, type: 'reference' | 'review') => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please drop a valid image file (JPG, PNG, or WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (type === 'reference') {
        setRefImage(dataUrl);
        setRefFileName(file.name);
      } else {
        setRevImage(dataUrl);
        setRevFileName(file.name);
      }
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleCopyRefToRev = () => {
    if (!refImage) return;
    setRevImage(refImage);
    setRevFileName(`${refFileName || 'reference_copy'} (Same Image Control)`);
    setError(null);
  };


  const handleClear = () => {
    setRefImage('');
    setRefFileName('');
    setRevImage('');
    setRevFileName('');
    setError(null);
  };

  const handleRunScan = () => {
    if (!refImage) {
      setError('Please provide a Reference Baseline image.');
      return;
    }
    if (!revImage) {
      setError('Please provide a Review image to compare against the baseline.');
      return;
    }

    const nowStr = new Date().toLocaleString('sv-SE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).replace('T', ' ');

    onAnalyze({
      patientRecordId: patientRecordTag.trim().toUpperCase() || 'DIRECT-SCAN',
      referenceImage: refImage,
      referenceImageId: 'REF-DIRECT',
      referenceDate: nowStr,
      newImage: revImage,
      newImageId: isSameImage ? 'REF-DIRECT (Same Image)' : 'DIRECT-REVIEW',
      newImageDate: nowStr,
      bodyRegion: bodyRegion || 'Other'
    });
  };

  return (
    <div className="space-y-6">

      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700">
                <Zap className="w-5 h-5 text-indigo-600" />
              </span>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Direct Scan
              </h1>
            </div>
            <p className="mt-1.5 text-sm text-slate-600 max-w-2xl">
              Directly compare any reference baseline photograph against a review scan without creating records. Automatically detects bruises, redness, abrasions, wounds, or verifies identical control images.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {(refImage || revImage) && (
              <button
                type="button"
                onClick={handleClear}
                className="px-3 py-2 border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Images</span>
              </button>
            )}
            <button
              type="button"
              onClick={onCancel}
              className="px-3 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-md text-xs font-medium transition-colors cursor-pointer"
            >
              Back to Dashboard
            </button>
            <button
              type="button"
              onClick={handleRunScan}
              disabled={!refImage || !revImage}
              className={`px-5 py-2.5 rounded-md text-sm font-semibold flex items-center gap-2 shadow-sm transition-all ${refImage && revImage
                  ? 'bg-indigo-700 hover:bg-indigo-800 text-white cursor-pointer shadow-indigo-200 hover:shadow-md'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
            >
              <Zap className="w-4 h-4" />
              <span>Run Direct Scan</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-md text-xs text-rose-800 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Same Image Match Realtime Notification */}
      {isSameImage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-lg text-xs text-emerald-900 flex items-start gap-3 shadow-2xs">
          <div className="p-1 rounded bg-emerald-200 text-emerald-900 shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <span className="font-bold block">
              Identical Image Detected (Negative Control Pair)
            </span>
            <p className="text-emerald-800 leading-relaxed text-[11px]">
              Reference baseline and review image are the exact same photograph (100% pixel match). The comparison confirms this as an unchanged control check with zero false positives.
            </p>
          </div>
        </div>
      )}

      {/* Two-Column Dropzones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Hidden Inputs */}
        <input
          type="file"
          ref={refInputRef}
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => handleFileUpload(e, 'reference')}
          className="hidden"
        />
        <input
          type="file"
          ref={revInputRef}
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => handleFileUpload(e, 'review')}
          className="hidden"
        />

        {/* LEFT COLUMN: Reference Baseline Image */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
                1. Reference Baseline
              </span>
              <h2 className="text-sm font-bold text-slate-900 mt-0.5">
                Baseline Reference Photograph
              </h2>
            </div>
            {refImage && (
              <button
                type="button"
                onClick={() => {
                  setRefImage('');
                  setRefFileName('');
                }}
                className="text-xs text-rose-600 hover:text-rose-800 flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            )}
          </div>

          {!refImage ? (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, 'reference')}
              onClick={() => refInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-sky-500 rounded-lg p-8 text-center bg-slate-50/50 hover:bg-sky-50/20 transition-all cursor-pointer space-y-3 group"
            >
              <div className="h-12 w-12 rounded-full bg-slate-100 group-hover:bg-sky-100 text-slate-400 group-hover:text-sky-700 flex items-center justify-center mx-auto transition-colors">
                <Upload className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="text-xs font-bold text-slate-800 group-hover:text-sky-900">
                  Upload Reference Baseline
                </div>
                <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                  Drag and drop an image here, or click to browse (JPG, PNG, WebP)
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="aspect-[4/3] bg-slate-950 rounded-lg border border-slate-200 flex items-center justify-center overflow-hidden relative group">
                <img
                  src={refImage}
                  alt="Reference baseline preview"
                  className="w-full h-full object-contain"
                />
                <span className="absolute top-2 left-2 bg-slate-900/80 text-white text-[10px] font-mono px-2 py-0.5 rounded">
                  BASELINE
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-50 p-2.5 rounded border border-slate-200 font-mono">
                <span className="truncate max-w-[220px] font-medium text-slate-700">
                  {refFileName || 'reference_image.webp'}
                </span>
                <button
                  type="button"
                  onClick={() => refInputRef.current?.click()}
                  className="text-sky-700 hover:underline font-sans font-medium"
                >
                  Replace
                </button>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Follow-up Review Image */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 font-mono">
                2. Review Photograph
              </span>
              <h2 className="text-sm font-bold text-slate-900 mt-0.5">
                Current / Review Scan Photograph
              </h2>
            </div>
            <div className="flex items-center gap-2">
              {refImage && !revImage && (
                <button
                  type="button"
                  onClick={handleCopyRefToRev}
                  className="text-xs px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  title="Copy reference image to test same image negative control"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copy Reference (Same Image)</span>
                </button>
              )}
              {revImage && (
                <button
                  type="button"
                  onClick={() => {
                    setRevImage('');
                    setRevFileName('');
                  }}
                  className="text-xs text-rose-600 hover:text-rose-800 flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              )}
            </div>
          </div>

          {!revImage ? (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, 'review')}
              onClick={() => revInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-lg p-8 text-center bg-slate-50/50 hover:bg-indigo-50/20 transition-all cursor-pointer space-y-3 group"
            >
              <div className="h-12 w-12 rounded-full bg-slate-100 group-hover:bg-indigo-100 text-slate-400 group-hover:text-indigo-700 flex items-center justify-center mx-auto transition-colors">
                <Upload className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="text-xs font-bold text-slate-800 group-hover:text-indigo-900">
                  Upload Review Scan
                </div>
                <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                  Drag and drop a new scan, or click to browse (JPG, PNG, WebP)
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="aspect-[4/3] bg-slate-950 rounded-lg border border-slate-200 flex items-center justify-center overflow-hidden relative group">
                <img
                  src={revImage}
                  alt="Review scan preview"
                  className="w-full h-full object-contain"
                />
                <span className="absolute top-2 left-2 bg-indigo-900/80 text-white text-[10px] font-mono px-2 py-0.5 rounded">
                  REVIEW PHOTO
                </span>
                {isSameImage && (
                  <span className="absolute bottom-2 left-2 bg-emerald-600/90 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded shadow-2xs">
                    IDENTICAL TO BASELINE
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-50 p-2.5 rounded border border-slate-200 font-mono">
                <span className="truncate max-w-[220px] font-medium text-slate-700">
                  {revFileName || 'review_image.webp'}
                </span>
                <button
                  type="button"
                  onClick={() => revInputRef.current?.click()}
                  className="text-indigo-700 hover:underline font-sans font-medium"
                >
                  Replace
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Settings Row & Run Button */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4 text-xs">

          {/* Anatomical Region */}
          <div className="flex items-center gap-2">
            <label className="font-semibold text-slate-700">
              Anatomical Region:
            </label>
            <select
              value={bodyRegion}
              onChange={(e) => setBodyRegion(e.target.value as BodyRegion)}
              className="bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
            >
              {BODY_REGIONS.map((r) => (
                <option key={r} value={r}>
                  {r === 'Other' ? 'General / Skin Assessment' : r}
                </option>
              ))}
            </select>
          </div>

          {/* Record Tag */}
          <div className="flex items-center gap-2">
            <label className="font-semibold text-slate-700">
              Scan Tag:
            </label>
            <input
              type="text"
              value={patientRecordTag}
              onChange={(e) => setPatientRecordTag(e.target.value)}
              placeholder="e.g. DIRECT-SCAN"
              className="bg-slate-50 border border-slate-300 rounded px-2 py-1.5 text-xs font-mono font-semibold text-slate-800 w-32 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

        </div>

        <div className="flex items-center gap-3 justify-end">
          <button
            type="button"
            onClick={handleRunScan}
            disabled={!refImage || !revImage}
            className={`w-full sm:w-auto px-6 py-2.5 rounded-md text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition-all ${refImage && revImage
                ? 'bg-indigo-700 hover:bg-indigo-800 text-white cursor-pointer shadow-indigo-200 hover:shadow-md'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
          >
            <Zap className="w-4 h-4" />
            <span>Compare & Run Scan</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
};
