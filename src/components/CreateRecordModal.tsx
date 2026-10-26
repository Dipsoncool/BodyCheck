import React, { useState, useRef } from 'react';
import { 
  X, 
  FolderPlus, 
  Upload, 
  Sparkles, 
  AlertCircle, 
  Image as ImageIcon,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { BodyRegion, PatientRecord } from '../types/bodyCheck';

const ALL_BODY_REGIONS: BodyRegion[] = [
  'Left Shoulder',
  'Right Shoulder',
  'Left Upper Arm',
  'Right Upper Arm',
  'Left Forearm',
  'Right Forearm',
  'Chest',
  'Abdomen',
  'Back',
  'Upper Back',
  'Lower Back',
  'Left Knee',
  'Right Knee',
  'Left Thigh',
  'Right Thigh',
  'Left Lower Leg',
  'Right Lower Leg',
  'Foot',
  'Upper Arm',
  'Lower Leg',
  'Other'
];

interface CreateRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingIds: string[];
  onCreate: (record: PatientRecord, refImage?: { dataUrl: string; fileName: string }) => void;
  initialQuery?: string;
}

export const CreateRecordModal: React.FC<CreateRecordModalProps> = ({
  isOpen,
  onClose,
  existingIds,
  onCreate,
  initialQuery = ''
}) => {
  // Suggest next ID based on highest existing IF number or generic
  const getSuggestedId = () => {
    if (initialQuery && initialQuery.trim().length >= 2) {
      return initialQuery.trim().toUpperCase();
    }
    const numbers = existingIds
      .map(id => {
        const match = id.match(/IF(\d+)/i);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter(n => !isNaN(n) && n > 0);

    const maxNum = numbers.length > 0 ? Math.max(...numbers) : 463;
    return `IF${maxNum + 1}`;
  };

  const [recordId, setRecordId] = useState<string>(getSuggestedId());
  const [recordName, setRecordName] = useState<string>(`Record ${getSuggestedId()}`);
  const [unit, setUnit] = useState<string>('Clinical Assessment Unit');
  const [bodyRegion, setBodyRegion] = useState<BodyRegion>('Left Shoulder');
  
  // Optional reference image upload right inside modal
  const [refImage, setRefImage] = useState<{ dataUrl: string; fileName: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync initialQuery when modal opens
  React.useEffect(() => {
    if (isOpen) {
      const id = getSuggestedId();
      setRecordId(id);
      setRecordName(`Record ${id}`);
      setError(null);
      setRefImage(null);
    }
  }, [isOpen, initialQuery]);

  const handleIdChange = (newId: string) => {
    const formatted = newId.trim().toUpperCase();
    setRecordId(formatted);
    if (recordName.startsWith('Record IF') || recordName.startsWith('Record ')) {
      setRecordName(`Record ${formatted}`);
    }
    setError(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (JPG, PNG, or WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setRefImage({
        dataUrl,
        fileName: file.name
      });
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanId = recordId.trim().toUpperCase();
    if (!cleanId) {
      setError('Please provide a valid Record ID.');
      return;
    }

    // Check duplicate ID
    if (existingIds.some(id => id.toUpperCase() === cleanId)) {
      setError(`A record with ID "${cleanId}" already exists. Please choose a unique Record ID.`);
      return;
    }

    const newRecord: PatientRecord = {
      id: cleanId,
      name: recordName.trim() || `Record ${cleanId}`,
      unit: unit.trim() || 'General Intake Wing',
      dateOfBirth: '2008-01-01',
      lastCheckDate: new Date().toISOString().slice(0, 16).replace('T', ' '),
      activeStatus: 'active',
      defaultRegion: bodyRegion,
      availableBodyRegions: [bodyRegion],
      referenceImage: refImage?.dataUrl
    };

    onCreate(newRecord, refImage || undefined);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden text-slate-900">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-sky-100 text-sky-700">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Add New Patient Record
              </h2>
              <p className="text-xs text-slate-500">
                Register a new profile for comparison and photo scans.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Record ID & Quick Suggest */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">
                Record ID <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => handleIdChange(getSuggestedId())}
                className="text-[11px] text-sky-700 hover:underline flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                <span>Auto-suggest ID</span>
              </button>
            </div>
            <input
              type="text"
              required
              value={recordId}
              onChange={(e) => handleIdChange(e.target.value)}
              placeholder="e.g. IF464, SCAN-001"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm font-mono font-bold text-slate-900 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 focus:outline-none"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Unique identifier used for tagging photographic baseline scans and review records.
            </p>
          </div>

          {/* Name & Department */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Record Name / Label
              </label>
              <input
                type="text"
                value={recordName}
                onChange={(e) => setRecordName(e.target.value)}
                placeholder="e.g. Record IF-464"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-xs text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Department / Unit
              </label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="e.g. Clinical Assessment Unit"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-xs text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Body Region */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Primary Designated Body Region <span className="text-rose-500">*</span>
            </label>
            <select
              value={bodyRegion}
              onChange={(e) => setBodyRegion(e.target.value as BodyRegion)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none"
            >
              {ALL_BODY_REGIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-500 mt-1">
              The designated anatomical area for this record (can be changed during review).
            </p>
          </div>

          {/* Optional Baseline Reference Image Upload */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-sky-600" />
                <span>Baseline Reference Photograph</span>
                <span className="text-[10px] text-slate-400 font-normal">(Optional)</span>
              </label>
              {refImage && (
                <button
                  type="button"
                  onClick={() => setRefImage(null)}
                  className="text-[11px] text-rose-600 hover:underline flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Remove</span>
                </button>
              )}
            </div>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileUpload}
              className="hidden"
            />

            {!refImage ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-4 px-3 border-2 border-dashed border-slate-300 hover:border-sky-400 rounded-lg text-center bg-slate-50 hover:bg-sky-50/50 transition-colors cursor-pointer group"
              >
                <Upload className="w-5 h-5 text-slate-400 group-hover:text-sky-600 mx-auto mb-1" />
                <span className="text-xs font-semibold text-slate-700 group-hover:text-sky-800 block">
                  Attach Reference Baseline Photo
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  JPG, PNG, or WebP. Can also be uploaded later in Step 2.
                </span>
              </button>
            ) : (
              <div className="flex items-center gap-3 p-2.5 bg-sky-50 border border-sky-200 rounded-lg">
                <div className="w-12 h-12 bg-black rounded overflow-hidden shrink-0">
                  <img
                    src={refImage.dataUrl}
                    alt="Reference preview"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-semibold text-sky-950 truncate block">
                    {refImage.fileName}
                  </span>
                  <span className="text-[10px] text-emerald-700 flex items-center gap-1 font-medium mt-0.5">
                    <CheckCircle2 className="w-3 h-3" /> Ready as baseline reference
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs text-sky-700 hover:underline px-2 py-1"
                >
                  Change
                </button>
              </div>
            )}
          </div>

          {/* Footer buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-md text-xs font-medium hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-sky-700 hover:bg-sky-800 text-white rounded-md text-xs font-semibold shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <FolderPlus className="w-4 h-4" />
              <span>Create Record & Start Check</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
