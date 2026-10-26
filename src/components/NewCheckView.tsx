import React, { useState, useRef, useEffect, useMemo } from 'react';
import { BodyRegion, PatientRecord, DemoScenario } from '../types/bodyCheck';
import { DEMO_SCENARIOS, GalleryImageAsset } from '../data/mockRecords';
import { ReviewImageGalleryModal } from './ReviewImageGalleryModal';
import { CreateRecordModal } from './CreateRecordModal';
import { 
  Upload, 
  AlertCircle, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Search, 
  X,
  Image as ImageIcon,
  Activity,
  Plus,
  FolderPlus
} from 'lucide-react';

export interface SelectableRecord {
  id: string;
  name: string;
  unit?: string;
  availableBodyRegions: BodyRegion[];
  defaultRegion?: BodyRegion;
  referenceImage?: string;
  reviewImage?: string;
  scenario?: DemoScenario;
}

export const BASELINE_SAMPLE_PRESETS: Array<{
  id: string;
  name: string;
  region: BodyRegion;
  url: string;
  description: string;
}> = [
  {
    id: 'REF-SHOULDER',
    name: 'Left Shoulder Healthy Baseline',
    region: 'Left Shoulder',
    url: '/images/body-check/IF456/reference.webp',
    description: 'Deltoid and shoulder contour uninjured skin baseline'
  },
  {
    id: 'REF-FOREARM',
    name: 'Right Forearm Healthy Baseline',
    region: 'Right Forearm',
    url: '/images/body-check/IF455/reference.webp',
    description: 'Volar mid-shaft forearm normal skin baseline'
  },
  {
    id: 'REF-BACK',
    name: 'Upper/Mid Back Healthy Baseline',
    region: 'Back',
    url: '/images/body-check/IF452/reference.webp',
    description: 'Paraspinal torso uninjured skin baseline'
  },
  {
    id: 'REF-LEG',
    name: 'Right Lower Leg Healthy Baseline',
    region: 'Right Lower Leg',
    url: '/images/body-check/IF439/reference.webp',
    description: 'Pre-tibial lower leg uninjured skin baseline'
  },
  {
    id: 'REF-CHEST',
    name: 'Chest / Torso Healthy Baseline',
    region: 'Chest',
    url: '/images/body-check/IF462/reference.webp',
    description: 'Pectoral region healthy skin baseline'
  }
];

interface NewCheckViewProps {
  patients: PatientRecord[];
  initialPatientId?: string;
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
  onSaveReadyToAnalyze?: (params: {
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
  onAddPatient?: (patient: PatientRecord) => void;
}

export const NewCheckView: React.FC<NewCheckViewProps> = ({
  patients,
  initialPatientId,
  onAnalyze,
  onSaveReadyToAnalyze,
  onCancel,
  onAddPatient
}) => {
  // Dynamically derive available records from patients and scenarios (scalable to hundreds of records)
  const availableRecords = useMemo<SelectableRecord[]>(() => {
    const map = new Map<string, SelectableRecord>();

    patients.forEach(p => {
      const scenario = DEMO_SCENARIOS.find(s => s.patientRecordId.toLowerCase() === p.id.toLowerCase());
      
      let regions: BodyRegion[] = [];
      if (p.availableBodyRegions && p.availableBodyRegions.length > 0) {
        regions = [...p.availableBodyRegions];
      } else if (scenario?.bodyRegion) {
        regions = [scenario.bodyRegion];
      } else if (p.defaultRegion) {
        regions = [p.defaultRegion];
      } else {
        regions = ['Other'];
      }

      map.set(p.id.toUpperCase(), {
        id: p.id,
        name: p.name.replace('Youth Record ', 'Record '),
        unit: p.unit,
        availableBodyRegions: regions,
        defaultRegion: p.defaultRegion || regions[0],
        referenceImage: p.referenceImage || scenario?.referenceImage,
        reviewImage: p.reviewImage || scenario?.newImage,
        scenario,
      });
    });

    DEMO_SCENARIOS.forEach(s => {
      const upperId = s.patientRecordId.toUpperCase();
      if (!map.has(upperId)) {
        map.set(upperId, {
          id: s.patientRecordId,
          name: `Record ${s.patientRecordId}`,
          availableBodyRegions: [s.bodyRegion],
          defaultRegion: s.bodyRegion,
          referenceImage: s.referenceImage,
          reviewImage: s.newImage,
          scenario: s,
        });
      }
    });

    return Array.from(map.values());
  }, [patients]);

  const initialRecord = useMemo(() => {
    if (!initialPatientId) return undefined;
    return availableRecords.find(r => r.id.toLowerCase() === initialPatientId.toLowerCase());
  }, [initialPatientId, availableRecords]);

  // Current active step (1 to 4)
  const [currentStep, setCurrentStep] = useState<number>(1);
  // Furthest step reached / unlocked (1 to 4)
  const [maxUnlockedStep, setMaxUnlockedStep] = useState<number>(1);

  // Selected Record State
  const [patientId, setPatientId] = useState<string>(initialRecord ? initialRecord.id : '');
  const [bodyRegion, setBodyRegion] = useState<BodyRegion>(() => {
    if (!initialRecord) return '' as BodyRegion;
    if (initialRecord.availableBodyRegions.length === 1) return initialRecord.availableBodyRegions[0];
    return '' as BodyRegion;
  });
  
  // Reference Image Data
  const [refImage, setRefImage] = useState<string>(initialRecord?.referenceImage || initialRecord?.scenario?.referenceImage || '');
  const [refImageId, setRefImageId] = useState<string>(initialRecord?.scenario ? initialRecord.scenario.expectedResult.referenceImageId : (initialRecord ? `${initialRecord.id}-REF` : ''));
  const [refDate, setRefDate] = useState<string>(initialRecord?.scenario ? initialRecord.scenario.referenceDate : '2026-09-14 09:30');
  const [refFileName, setRefFileName] = useState<string>(initialRecord?.referenceImage || initialRecord?.scenario?.referenceImage ? 'reference.webp' : '');
  
  // Review Image Data (Starts EMPTY; user must explicitly upload or pick from gallery)
  const [newImage, setNewImage] = useState<string>(() => {
    try {
      return sessionStorage.getItem('bodycheck_review_image_draft') || '';
    } catch {
      return '';
    }
  });
  const [newImageId, setNewImageId] = useState<string>(() => {
    try {
      return sessionStorage.getItem('bodycheck_review_image_id_draft') || '';
    } catch {
      return '';
    }
  });
  const [newDate, setNewDate] = useState<string>(() => {
    try {
      return sessionStorage.getItem('bodycheck_review_date_draft') || '';
    } catch {
      return '';
    }
  });
  const [newFileName, setNewFileName] = useState<string>(() => {
    try {
      return sessionStorage.getItem('bodycheck_review_filename_draft') || '';
    } catch {
      return '';
    }
  });
  const [isReviewNew, setIsReviewNew] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('bodycheck_review_is_new_draft') === 'true';
    } catch {
      return true;
    }
  });

  const [isGalleryOpen, setIsGalleryOpen] = useState<boolean>(false);
  const [isCreateRecordModalOpen, setIsCreateRecordModalOpen] = useState<boolean>(false);
  const [isSampleBaselineModalOpen, setIsSampleBaselineModalOpen] = useState<boolean>(false);

  // Search & Picker State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const existingIds = useMemo(() => {
    return availableRecords.map(r => r.id);
  }, [availableRecords]);

  const handleCreateRecord = (
    newRecord: PatientRecord,
    initialRefImage?: { dataUrl: string; fileName: string }
  ) => {
    onAddPatient?.(newRecord);
    setPatientId(newRecord.id);
    const chosenRegion = newRecord.defaultRegion || 'Left Shoulder';
    setBodyRegion(chosenRegion);

    const nowStr = new Date().toLocaleString('sv-SE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).replace('T', ' ');

    if (initialRefImage) {
      setRefImage(initialRefImage.dataUrl);
      setRefImageId(`${newRecord.id}-REF`);
      setRefDate(nowStr);
      setRefFileName(initialRefImage.fileName);
      setMaxUnlockedStep(prev => Math.max(prev, 3));
      setCurrentStep(3);
    } else {
      setRefImage('');
      setRefImageId(`${newRecord.id}-REF`);
      setRefDate(nowStr);
      setRefFileName('');
      setMaxUnlockedStep(prev => Math.max(prev, 2));
      setCurrentStep(2);
    }

    setNewImage('');
    setNewImageId('');
    setNewDate('');
    setNewFileName('');
    setIsReviewNew(true);
    setValidationError(null);
  };

  const [validationError, setValidationError] = useState<string | null>(null);

  const refFileInputRef = useRef<HTMLInputElement>(null);
  const newFileInputRef = useRef<HTMLInputElement>(null);

  // Sync when initialPatientId changes
  useEffect(() => {
    if (initialPatientId) {
      const match = availableRecords.find(r => r.id.toLowerCase() === initialPatientId.toLowerCase());
      if (match) {
        handleSelectRecord(match);
      }
    }
  }, [initialPatientId, availableRecords]);

  const handleSelectRecord = (record: SelectableRecord) => {
    setPatientId(record.id);
    
    // If single region, auto-select it; if multiple, require explicit selection
    if (record.availableBodyRegions.length === 1) {
      setBodyRegion(record.availableBodyRegions[0]);
    } else {
      setBodyRegion('' as BodyRegion);
    }

    const ref = record.referenceImage || record.scenario?.referenceImage || '';

    if (ref) {
      setRefImage(ref);
      setRefImageId(record.scenario?.expectedResult.referenceImageId || `${record.id}-REF`);
      setRefDate(record.scenario?.referenceDate || '2026-09-14 09:30');
      setRefFileName('reference.webp');
    } else {
      setRefImage('');
      setRefImageId('');
      setRefDate('');
      setRefFileName('');
    }

    // Step 3 review image MUST start EMPTY
    setNewImage('');
    setNewImageId('');
    setNewDate('');
    setNewFileName('');
    setIsReviewNew(true);
    try {
      sessionStorage.removeItem('bodycheck_review_image_draft');
      sessionStorage.removeItem('bodycheck_review_image_id_draft');
      sessionStorage.removeItem('bodycheck_review_date_draft');
      sessionStorage.removeItem('bodycheck_review_filename_draft');
      sessionStorage.removeItem('bodycheck_review_is_new_draft');
    } catch {
      // Ignore
    }

    setValidationError(null);
    setSearchQuery('');
    setMaxUnlockedStep(1);
    setCurrentStep(1);
  };

  const handleResetRecordSelection = () => {
    setPatientId('');
    setBodyRegion('' as BodyRegion);
    setRefImage('');
    setRefImageId('');
    setRefDate('');
    setRefFileName('');
    setNewImage('');
    setNewImageId('');
    setNewDate('');
    setNewFileName('');
    setIsReviewNew(true);
    try {
      sessionStorage.removeItem('bodycheck_review_image_draft');
      sessionStorage.removeItem('bodycheck_review_image_id_draft');
      sessionStorage.removeItem('bodycheck_review_date_draft');
      sessionStorage.removeItem('bodycheck_review_filename_draft');
      sessionStorage.removeItem('bodycheck_review_is_new_draft');
    } catch {
      // Ignore
    }
    setValidationError(null);
    setMaxUnlockedStep(1);
    setCurrentStep(1);
    setSearchQuery('');
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 50);
  };

  const filteredRecords = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return availableRecords;
    return availableRecords.filter(rec => 
      rec.id.toLowerCase().includes(query)
    );
  }, [availableRecords, searchQuery]);

  const selectedRecord = availableRecords.find(r => r.id.toUpperCase() === patientId.toUpperCase());

  // Sequential Step Verification Gates
  const isStep1Valid = Boolean(patientId && bodyRegion);
  const isStep2Valid = Boolean(isStep1Valid && refImage && refImageId);
  const isStep3Valid = Boolean(isStep2Valid && newImage && newImageId);

  const isStepAccessible = (stepNum: number): boolean => {
    if (stepNum === 1) return true;
    if (stepNum === 2) return maxUnlockedStep >= 2 && isStep1Valid;
    if (stepNum === 3) return maxUnlockedStep >= 3 && isStep2Valid;
    if (stepNum === 4) return maxUnlockedStep >= 4 && isStep3Valid;
    return false;
  };

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    target: 'reference' | 'new'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate format
    const validFormats = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (!validFormats.includes(file.type)) {
      setValidationError('Unsupported image format. Please upload a standard JPG or PNG photo.');
      return;
    }

    // Validate size (max 15MB)
    if (file.size > 15 * 1024 * 1024) {
      setValidationError('File size exceeds 15MB limit. Please provide an optimized photo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      const nowStr = new Date().toLocaleString('sv-SE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }).replace('T', ' ');

      if (target === 'reference') {
        setRefImage(result);
        setRefImageId(`REF-${patientId || 'RECORD'}`);
        setRefFileName(file.name);
        setRefDate(nowStr);
        setMaxUnlockedStep(prev => Math.max(prev, 3));
      } else {
        const genId = `NEW-${patientId || 'RECORD'}-${Math.floor(100 + Math.random() * 900)}`;
        setNewImage(result);
        setNewImageId(genId);
        setNewFileName(file.name);
        setNewDate(nowStr);
        setIsReviewNew(true);
        try {
          sessionStorage.setItem('bodycheck_review_image_draft', result);
          sessionStorage.setItem('bodycheck_review_image_id_draft', genId);
          sessionStorage.setItem('bodycheck_review_date_draft', nowStr);
          sessionStorage.setItem('bodycheck_review_filename_draft', file.name);
          sessionStorage.setItem('bodycheck_review_is_new_draft', 'true');
        } catch {
          // Ignore
        }
      }
      setValidationError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectGalleryAsset = (asset: GalleryImageAsset) => {
    setNewImage(asset.imageUrl);
    setNewImageId(asset.id);
    setNewFileName(asset.fileName);
    setNewDate(asset.captureDate);
    setIsReviewNew(Boolean(asset.isNew));
    setValidationError(null);
    try {
      sessionStorage.setItem('bodycheck_review_image_draft', asset.imageUrl);
      sessionStorage.setItem('bodycheck_review_image_id_draft', asset.id);
      sessionStorage.setItem('bodycheck_review_date_draft', asset.captureDate);
      sessionStorage.setItem('bodycheck_review_filename_draft', asset.fileName);
      sessionStorage.setItem('bodycheck_review_is_new_draft', String(Boolean(asset.isNew)));
    } catch {
      // Ignore
    }
  };

  const handleNextStep = () => {
    setValidationError(null);
    if (currentStep === 1) {
      if (!patientId || !bodyRegion) {
        setValidationError('Please select a valid record to continue.');
        return;
      }
      setMaxUnlockedStep(prev => Math.max(prev, 2));
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!refImage || !refImageId) {
        setValidationError('Please select or upload a baseline reference photograph.');
        return;
      }
      setMaxUnlockedStep(prev => Math.max(prev, 3));
      setCurrentStep(3);
    } else if (currentStep === 3) {
      if (!newImage || !newImageId) {
        setValidationError('Please select or upload a new review photograph.');
        return;
      }
      setMaxUnlockedStep(prev => Math.max(prev, 4));
      setCurrentStep(4);
    }
  };

  const handleProcessSubmit = () => {
    if (!refImage || !newImage) {
      setValidationError('Both reference baseline and follow-up review images are required.');
      return;
    }

    onAnalyze({
      patientRecordId: patientId,
      referenceImage: refImage,
      referenceImageId: refImageId || `${patientId}-REF`,
      referenceDate: refDate,
      newImage: newImage,
      newImageId: newImageId || `${patientId}-NEW`,
      newImageDate: newDate,
      bodyRegion: bodyRegion,
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      
      {/* Top Header Card */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">New Body Check</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Guided visual comparison workflow: record selection, baseline reference image, review photograph, and comparison.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="text-xs font-medium px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded border border-slate-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Guarded Step Indicator: 1 Record → 2 Reference Image → 3 Review Image → 4 Compare */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs overflow-x-auto gap-2 py-1">
            {[
              { num: 1, title: 'Record' },
              { num: 2, title: 'Reference Image' },
              { num: 3, title: 'Review Image' },
              { num: 4, title: 'Compare' }
            ].map((step, idx, arr) => {
              const isCurrent = currentStep === step.num;
              const isAccessible = isStepAccessible(step.num);
              const isCompleted = isAccessible && currentStep > step.num;

              return (
                <React.Fragment key={step.num}>
                  <button
                    type="button"
                    disabled={!isAccessible}
                    onClick={() => {
                      if (isAccessible) {
                        setValidationError(null);
                        setCurrentStep(step.num);
                      }
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors text-xs font-medium ${
                      isCurrent
                        ? 'bg-sky-50 text-sky-900 font-semibold border border-sky-300 ring-1 ring-sky-200'
                        : isAccessible
                        ? 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 cursor-pointer'
                        : 'text-slate-400 opacity-40 cursor-not-allowed'
                    }`}
                    title={!isAccessible ? `Complete earlier steps to unlock Step ${step.num}` : undefined}
                  >
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-mono font-bold ${
                      isCurrent
                        ? 'bg-sky-700 text-white'
                        : isCompleted
                        ? 'bg-emerald-600 text-white'
                        : isAccessible
                        ? 'bg-slate-200 text-slate-700'
                        : 'bg-slate-100 text-slate-400'
                    }`}>
                      {isCompleted ? '✓' : step.num}
                    </span>
                    <span>{step.num} {step.title}</span>
                  </button>
                  {idx < arr.length - 1 && (
                    <span className="text-slate-300 select-none font-bold">→</span>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {validationError && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-md text-xs text-rose-800 flex items-start gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
          <span>{validationError}</span>
        </div>
      )}

      {/* STEP 1: SELECT RECORD */}
      {currentStep === 1 && (
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                STEP 1 — SELECT RECORD
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Choose an existing record or create a new record for comparative review and scanning.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsCreateRecordModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold rounded-md shadow-2xs transition-colors cursor-pointer self-start sm:self-auto"
            >
              <FolderPlus className="w-4 h-4 text-indigo-600" />
              <span>+ Add New Record</span>
            </button>
          </div>

          {/* Two-Column Record + Body Region Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 md:divide-x md:divide-slate-200 gap-6">
            
            {/* LEFT COLUMN: Record selection */}
            <div className="space-y-3 md:pr-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    Record
                  </label>
                  {!patientId && (
                    <button
                      type="button"
                      onClick={() => setIsCreateRecordModalOpen(true)}
                      className="text-[11px] text-sky-700 hover:text-sky-900 font-medium flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>New Record</span>
                    </button>
                  )}
                </div>

                {!patientId ? (
                  <div className="space-y-3">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Search className="w-4 h-4" />
                      </div>
                      <input
                        ref={searchInputRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setValidationError(null);
                        }}
                        placeholder="Search by record ID (e.g. IF456)..."
                        className="w-full pl-9 pr-8 py-2 bg-white border border-slate-300 rounded-md text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 focus:outline-none transition-all"
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => setSearchQuery('')}
                          className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Scalable Record Results List */}
                    <div className="border border-slate-200 rounded-md max-h-72 overflow-y-auto divide-y divide-slate-100 bg-white shadow-2xs">
                      {filteredRecords.length === 0 ? (
                        <div className="p-6 text-center text-xs text-slate-500 space-y-2.5">
                          <p>No records found matching "{searchQuery}"</p>
                          <button
                            type="button"
                            onClick={() => setIsCreateRecordModalOpen(true)}
                            className="px-3.5 py-2 bg-sky-700 hover:bg-sky-800 text-white rounded text-xs font-semibold inline-flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                          >
                            <FolderPlus className="w-4 h-4" />
                            <span>Create New Record {searchQuery ? `"${searchQuery}"` : ''}</span>
                          </button>
                        </div>
                      ) : (
                        filteredRecords.map((rec) => (
                          <button
                            key={rec.id}
                            type="button"
                            onClick={() => handleSelectRecord(rec)}
                            className="w-full text-left p-3 hover:bg-sky-50/70 transition-colors cursor-pointer group"
                          >
                            <div className="font-mono font-bold text-sm text-slate-900 group-hover:text-sky-900">
                              {rec.id}
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5">
                              Available body regions:{' '}
                              <span className="text-slate-700 font-medium">
                                {rec.availableBodyRegions.join(', ')}
                              </span>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                ) : (
                  /* Display Selected Record Clearly */
                  <div className="bg-slate-50 border border-slate-200 rounded-md p-4 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-base text-slate-900">
                          {selectedRecord?.id || patientId}
                        </span>
                        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded border border-emerald-200">
                          Selected
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setIsCreateRecordModalOpen(true)}
                          className="text-xs font-semibold px-2.5 py-1 text-indigo-700 hover:text-indigo-950 bg-white hover:bg-indigo-50 border border-slate-300 hover:border-indigo-300 rounded shadow-2xs transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          <span>New</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleResetRecordSelection}
                          className="text-xs font-semibold px-2.5 py-1 text-sky-800 hover:text-sky-950 bg-white hover:bg-sky-50 border border-slate-300 hover:border-sky-300 rounded shadow-2xs transition-colors cursor-pointer"
                        >
                          Change record
                        </button>
                      </div>
                    </div>

                    <div className="text-xs text-slate-600">
                      <span className="text-slate-500">Available body regions: </span>
                      <span className="font-medium text-slate-800">
                        {selectedRecord?.availableBodyRegions.join(', ') || bodyRegion}
                      </span>
                    </div>

                    {selectedRecord?.unit && (
                      <div className="text-[11px] text-slate-400 truncate">
                        {selectedRecord.unit}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: Body Region selection */}
            <div className="space-y-3 md:pl-6">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Body Region
              </label>

              {!patientId ? (
                /* Unselected State: disabled selector + info panel */
                <div className="space-y-3">
                  <select
                    disabled
                    value=""
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm text-slate-400 cursor-not-allowed"
                  >
                    <option value="">Select a body region...</option>
                  </select>

                  <div className="bg-slate-50 border border-slate-200 rounded-md p-3 text-xs text-slate-500 space-y-1">
                    <div className="font-semibold text-slate-700">Select a record first</div>
                    <p>Choose a record from the left to view available body regions.</p>
                  </div>
                </div>
              ) : selectedRecord && selectedRecord.availableBodyRegions.length > 1 ? (
                /* Multiple Regions: Dropdown containing only available regions */
                <div className="space-y-2">
                  <select
                    value={bodyRegion}
                    onChange={(e) => {
                      setBodyRegion(e.target.value as BodyRegion);
                      setValidationError(null);
                    }}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm font-medium text-slate-900 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 focus:outline-none shadow-2xs"
                  >
                    <option value="">Select a body region...</option>
                    {selectedRecord.availableBodyRegions.map((region) => (
                      <option key={region} value={region}>
                        {region}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-500">
                    Choose from the body regions available for {selectedRecord.id}.
                  </p>
                </div>
              ) : (
                /* Single Region: Clean display showing the auto-selected region */
                <div className="space-y-2">
                  <div className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm font-medium text-slate-900 flex items-center justify-between shadow-2xs">
                    <span className="font-semibold text-slate-900">{bodyRegion}</span>
                    <span className="text-[11px] text-slate-400 font-normal">Auto-selected</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Single designated body region for {selectedRecord?.id || patientId}.
                  </p>
                </div>
              )}
            </div>

          </div>

          {/* Step 1 Actions */}
          <div className="pt-4 flex justify-end border-t border-slate-100">
            <button
              type="button"
              onClick={handleNextStep}
              disabled={!patientId || !bodyRegion}
              className={`px-4 py-2 text-xs font-semibold rounded shadow-sm flex items-center gap-1.5 transition-colors ${
                patientId && bodyRegion
                  ? 'bg-sky-700 hover:bg-sky-800 text-white cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <span>Continue to Step 2 (Reference Image)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: REFERENCE BASELINE IMAGE */}
      {currentStep === 2 && (
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              STEP 2 — REFERENCE IMAGE
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select or upload the earlier baseline image of uninjured skin for comparison.
            </p>
          </div>

          {/* Hidden File Input for Reference Image */}
          <input
            type="file"
            ref={refFileInputRef}
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => handleFileUpload(e, 'reference')}
            className="hidden"
          />

          {!refImage ? (
            /* Clean Empty Upload State for New Records */
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-10 text-center space-y-4 bg-slate-50/50">
              <div className="h-12 w-12 rounded-full bg-sky-50 border border-sky-200 text-sky-700 flex items-center justify-center mx-auto">
                <Upload className="w-6 h-6" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="text-sm font-bold text-slate-900">
                  Upload Baseline Reference Photograph
                </h3>
                <p className="text-xs text-slate-500">
                  Attach an uninjured, healthy skin baseline photo for {bodyRegion} on Record {patientId} to use as comparison baseline.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => refFileInputRef.current?.click()}
                  className="w-full sm:w-auto px-4 py-2.5 bg-sky-700 hover:bg-sky-800 text-white rounded text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Baseline Photo</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsSampleBaselineModalOpen(true)}
                  className="w-full sm:w-auto px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded text-xs font-semibold flex items-center justify-center gap-2 shadow-2xs transition-colors cursor-pointer"
                >
                  <ImageIcon className="w-4 h-4 text-slate-500" />
                  <span>Choose Sample Baseline</span>
                </button>
              </div>
            </div>
          ) : (
            /* Selected Reference Baseline Image Layout */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <div className="aspect-[4/3] bg-slate-950 rounded border border-slate-200 flex items-center justify-center overflow-hidden relative">
                <img
                  src={refImage}
                  alt="Reference Baseline"
                  className="w-full h-full object-contain"
                />
                <span className="absolute top-2 left-2 bg-slate-900/80 text-white text-[10px] font-mono px-2 py-0.5 rounded">
                  REFERENCE BASELINE
                </span>
              </div>

              <div className="space-y-4 text-xs">
                <div className="bg-slate-50 p-3.5 rounded border border-slate-200 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Reference ID:</span>
                    <span className="font-mono font-bold text-slate-900">{refImageId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Capture Timestamp:</span>
                    <span className="font-mono text-slate-800">{refDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Asset File:</span>
                    <span className="font-mono text-slate-700 truncate max-w-[200px]">{refFileName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Validation:</span>
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Validated Reference Baseline
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => refFileInputRef.current?.click()}
                    className="w-full py-2 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded text-xs font-medium text-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-slate-500" />
                    <span>Upload Alternative Reference Image</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsSampleBaselineModalOpen(true)}
                    className="w-full py-2 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded text-xs font-medium text-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
                    <span>Choose Sample Baseline Preset</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="pt-4 flex justify-between border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setValidationError(null);
                setCurrentStep(1);
              }}
              className="px-3 py-1.5 border border-slate-300 text-slate-600 rounded text-xs font-medium flex items-center gap-1 hover:bg-slate-50 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Step 1 (Record)</span>
            </button>
            <button
              type="button"
              onClick={handleNextStep}
              disabled={!refImage}
              className={`px-4 py-2 text-xs font-semibold rounded shadow-sm flex items-center gap-1.5 transition-colors ${
                refImage
                  ? 'bg-sky-700 hover:bg-sky-800 text-white cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <span>Continue to Step 3 (Review Image)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: NEW / REVIEW IMAGE */}
      {currentStep === 3 && (
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              STEP 3 — REVIEW IMAGE
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Upload the new image to compare with the reference.
            </p>
          </div>

          {/* Hidden File Input for Review Image */}
          <input
            type="file"
            ref={newFileInputRef}
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => handleFileUpload(e, 'new')}
            className="hidden"
          />

          {!newImage ? (
            /* Clean Empty Selection / Upload State */
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-10 text-center space-y-4 bg-slate-50/50">
              <div className="h-12 w-12 rounded-full bg-sky-50 border border-sky-200 text-sky-700 flex items-center justify-center mx-auto">
                <Upload className="w-6 h-6" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="text-sm font-bold text-slate-900">
                  Select a review image
                </h3>
                <p className="text-xs text-slate-500">
                  Choose an image to compare against the reference image.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => newFileInputRef.current?.click()}
                  className="w-full sm:w-auto px-4 py-2.5 bg-sky-700 hover:bg-sky-800 text-white rounded text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Image</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsGalleryOpen(true)}
                  className="w-full sm:w-auto px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded text-xs font-semibold flex items-center justify-center gap-2 shadow-2xs transition-colors cursor-pointer"
                >
                  <ImageIcon className="w-4 h-4 text-slate-500" />
                  <span>Choose from Gallery</span>
                </button>
              </div>
            </div>
          ) : (
            /* Selected Review Image Preview Layout */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <div className="aspect-[4/3] bg-slate-950 rounded border border-slate-200 flex items-center justify-center overflow-hidden relative">
                <img
                  src={newImage}
                  alt="New Review Photo"
                  className="w-full h-full object-contain"
                />
                <span className="absolute top-2 left-2 bg-sky-900/80 text-white text-[10px] font-mono px-2 py-0.5 rounded flex items-center gap-1.5 shadow-2xs">
                  <span>REVIEW IMAGE</span>
                  {isReviewNew && (
                    <span className="bg-emerald-600 text-white font-bold text-[9px] px-1 py-0.2 rounded uppercase">
                      NEW
                    </span>
                  )}
                </span>
              </div>

              <div className="space-y-4 text-xs">
                <div className="bg-slate-50 p-3.5 rounded border border-slate-200 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">New Image ID:</span>
                    <span className="font-mono font-bold text-slate-900">{newImageId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Review Timestamp:</span>
                    <span className="font-mono text-slate-800">{newDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Asset File:</span>
                    <span className="font-mono text-slate-700 truncate max-w-[200px]">{newFileName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">New Image Status:</span>
                    <span className={isReviewNew ? "text-emerald-700 font-semibold" : "text-slate-700 font-semibold"}>
                      {isReviewNew ? "Newly Added Review Image [NEW]" : "Existing Record Image"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Validation:</span>
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Validated Review Image
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-white rounded border border-slate-200 space-y-2">
                  <span className="text-[11px] font-semibold text-slate-700 block">Replace Image:</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => newFileInputRef.current?.click()}
                      className="flex-1 py-2 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded text-xs font-medium text-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5 text-slate-500" />
                      <span>Upload Different</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsGalleryOpen(true)}
                      className="flex-1 py-2 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded text-xs font-medium text-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
                      <span>Choose from Gallery</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="pt-4 flex justify-between border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setValidationError(null);
                setCurrentStep(2);
              }}
              className="px-3 py-1.5 border border-slate-300 text-slate-600 rounded text-xs font-medium flex items-center gap-1 hover:bg-slate-50 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Step 2 (Reference Image)</span>
            </button>
            <button
              type="button"
              onClick={handleNextStep}
              disabled={!newImage}
              className={`px-4 py-2 text-xs font-semibold rounded shadow-sm flex items-center gap-1.5 transition-colors ${
                newImage
                  ? 'bg-sky-700 hover:bg-sky-800 text-white cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <span>Continue to Step 4 (Compare)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: REVIEW SIDE-BY-SIDE & RUN ANALYSIS */}
      {currentStep === 4 && (
        <div className="space-y-6">
          
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  STEP 4 — COMPARE & ANALYZE
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Summary of the two selected images and body region.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Region:</span>
                <span className="text-xs font-bold font-mono px-2 py-1 bg-slate-100 rounded border border-slate-300 text-slate-800">
                  {bodyRegion}
                </span>
              </div>
            </div>

            {/* Side-by-Side Verification Viewport */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              
              {/* Reference Preview Card */}
              <div className="border border-slate-200 rounded overflow-hidden flex flex-col">
                <div className="bg-slate-50 px-3 py-2 border-b border-slate-200 flex justify-between items-center text-xs">
                  <span className="font-mono font-bold text-slate-700">REFERENCE IMAGE: {refImageId}</span>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="text-[11px] text-sky-700 hover:underline"
                  >
                    Replace
                  </button>
                </div>
                <div className="aspect-[4/3] bg-slate-950 flex items-center justify-center">
                  <img src={refImage} alt="Reference Baseline" className="w-full h-full object-contain" />
                </div>
                <div className="p-2.5 bg-slate-50 text-[11px] text-slate-600 font-mono border-t border-slate-200 flex justify-between">
                  <span>Baseline: {refDate}</span>
                  <span className="truncate max-w-[150px]">{refFileName}</span>
                </div>
              </div>

              {/* New Review Preview Card */}
              <div className="border border-slate-200 rounded overflow-hidden flex flex-col">
                <div className="bg-sky-50 px-3 py-2 border-b border-slate-200 flex justify-between items-center text-xs">
                  <span className="font-mono font-bold text-slate-800">REVIEW IMAGE: {newImageId}</span>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="text-[11px] text-sky-700 hover:underline"
                  >
                    Replace
                  </button>
                </div>
                <div className="aspect-[4/3] bg-slate-950 flex items-center justify-center">
                  <img src={newImage} alt="New Review" className="w-full h-full object-contain" />
                </div>
                <div className="p-2.5 bg-slate-50 text-[11px] text-slate-600 font-mono border-t border-slate-200 flex justify-between">
                  <span>Review: {newDate}</span>
                  <span className="truncate max-w-[150px]">{newFileName}</span>
                </div>
              </div>

            </div>

            {/* Run Action Bar */}
            <div className="mt-6 pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  setValidationError(null);
                  setCurrentStep(3);
                }}
                className="px-3 py-1.5 border border-slate-300 text-slate-600 rounded text-xs font-medium flex items-center gap-1 hover:bg-slate-50"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Step 3 (Review Image)</span>
              </button>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
                <div className="hidden sm:flex items-center gap-1.5 text-xs text-sky-700 font-medium bg-sky-50 border border-sky-200/80 px-2.5 py-1.5 rounded-md">
                  <Activity className="w-3.5 h-3.5 text-sky-600 animate-pulse" />
                  <span>Differential Scanner active</span>
                </div>

                {onSaveReadyToAnalyze && (
                  <button
                    type="button"
                    onClick={() => {
                      if (!refImage || !newImage) {
                        setValidationError('Both reference baseline and follow-up review images are required.');
                        return;
                      }
                      onSaveReadyToAnalyze({
                        patientRecordId: patientId,
                        referenceImage: refImage,
                        referenceImageId: refImageId || `${patientId}-REF`,
                        referenceDate: refDate,
                        newImage: newImage,
                        newImageId: newImageId || `${patientId}-NEW`,
                        newImageDate: newDate,
                        bodyRegion: bodyRegion,
                      });
                    }}
                    className="px-4 py-2 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-md shadow-sm transition-colors"
                  >
                    Save Check (Ready to Analyze)
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleProcessSubmit}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-sky-700 hover:bg-sky-800 text-white text-sm font-semibold rounded-md shadow-sm transition-colors focus:ring-2 focus:ring-sky-500"
                >
                  <span>Analyze Images</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Review Image Gallery Selection Modal */}
      <ReviewImageGalleryModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        onSelectAsset={handleSelectGalleryAsset}
        currentlySelectedId={newImageId}
        recordId={patientId}
        bodyRegion={bodyRegion}
        referenceImage={refImage}
        referenceImageId={refImageId}
      />

      {/* Register New Record Modal */}
      <CreateRecordModal
        isOpen={isCreateRecordModalOpen}
        onClose={() => setIsCreateRecordModalOpen(false)}
        existingIds={existingIds}
        onCreate={handleCreateRecord}
        initialQuery={searchQuery}
      />

      {/* Sample Baseline Picker Modal */}
      {isSampleBaselineModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden text-slate-900">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-sky-100 text-sky-700">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Select Baseline Reference Photograph
                  </h3>
                  <p className="text-xs text-slate-500">
                    Choose an uninjured healthy baseline photograph for Record <span className="font-mono font-bold text-slate-800">{patientId}</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSampleBaselineModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/50 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {BASELINE_SAMPLE_PRESETS.map((preset) => (
                  <div
                    key={preset.id}
                    onClick={() => {
                      setRefImage(preset.url);
                      setRefImageId(`${patientId || 'REC'}-${preset.id}`);
                      setRefDate('2026-09-14 09:30');
                      setRefFileName('baseline_sample.webp');
                      if (!bodyRegion) {
                        setBodyRegion(preset.region);
                      }
                      setMaxUnlockedStep(prev => Math.max(prev, 3));
                      setIsSampleBaselineModalOpen(false);
                      setValidationError(null);
                    }}
                    className="border border-slate-200 hover:border-sky-500 rounded-lg overflow-hidden bg-white hover:bg-sky-50/20 shadow-2xs hover:shadow-sm cursor-pointer transition-all group flex flex-col"
                  >
                    <div className="aspect-[4/3] bg-slate-950 overflow-hidden relative flex items-center justify-center">
                      <img
                        src={preset.url}
                        alt={preset.name}
                        className="w-full h-full object-contain group-hover:scale-[1.02] transition-transform duration-200"
                      />
                      <span className="absolute top-2 left-2 bg-slate-900/80 text-white text-[9px] font-mono px-1.5 py-0.5 rounded">
                        BASELINE
                      </span>
                    </div>
                    <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                      <div>
                        <div className="text-xs font-bold text-slate-900 group-hover:text-sky-900">
                          {preset.name}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {preset.description}
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10px]">
                        <span className="font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                          {preset.region}
                        </span>
                        <span className="text-sky-700 font-semibold group-hover:underline">
                          Select →
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setIsSampleBaselineModalOpen(false)}
                className="px-4 py-2 border border-slate-300 rounded text-xs font-medium text-slate-700 hover:bg-white cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
