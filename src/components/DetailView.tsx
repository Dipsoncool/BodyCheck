import React, { useState, useEffect } from 'react';
import { BodyCheckRecord, AuditEvent } from '../types/bodyCheck';
import { UserProfile } from '../types/auth';
import { 
  ArrowLeft, 
  Printer, 
  CheckCircle2, 
  ShieldCheck, 
  FileText, 
  Tag, 
  ZoomIn, 
  X, 
  History, 
  User, 
  Clock,
  RotateCcw,
  Check,
  Loader2,
  PlayCircle
} from 'lucide-react';
import { renderStatusBadge } from '../utils/statusUtils';
import { ImageWithReticle } from './ImageWithReticle';

interface DetailViewProps {
  record: BodyCheckRecord;
  currentUser?: UserProfile | null;
  onBack: () => void;
  onConfirmRecord?: (updatedRecord: BodyCheckRecord) => void;
  onStartAnalysis?: (record: BodyCheckRecord) => void;
  onViewProgress?: (record: BodyCheckRecord) => void;
}

export const DetailView: React.FC<DetailViewProps> = ({ 
  record: initialRecord, 
  currentUser,
  onBack,
  onConfirmRecord,
  onStartAnalysis,
  onViewProgress
}) => {
  const [record, setRecord] = useState<BodyCheckRecord>(initialRecord);
  const [activeZoomImage, setActiveZoomImage] = useState<{
    title: string;
    src: string;
    id: string;
    date: string;
  } | null>(null);

  // Review & Confirmation Modal State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);
  const [editedObservation, setEditedObservation] = useState<string>(
    initialRecord.finalObservation || initialRecord.aiObservation || ''
  );
  const [reviewerName, setReviewerName] = useState<string>(
    currentUser?.name || 'Sarah Mitchell'
  );
  const [reviewerRole, setReviewerRole] = useState<string>(
    currentUser?.role || 'Reviewer'
  );
  const [reviewerNotes, setReviewerNotes] = useState<string>('');
  const [confirmationNotice, setConfirmationNotice] = useState<string | null>(null);

  useEffect(() => {
    setRecord(initialRecord);
    setEditedObservation(initialRecord.finalObservation || initialRecord.aiObservation || '');
  }, [initialRecord]);

  const handlePrint = () => {
    window.print();
  };

  const handleOpenReviewModal = () => {
    setEditedObservation(record.finalObservation || record.aiObservation || '');
    setReviewerNotes(record.reviewerNotes || '');
    setIsReviewModalOpen(true);
  };

  const handleConfirmSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!editedObservation.trim()) {
      alert('Please provide an observation text before confirming.');
      return;
    }

    const nowStr = new Date().toLocaleString('sv-SE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).replace('T', ' ');

    const newAuditEvents: AuditEvent[] = [];

    if (editedObservation.trim() !== (record.aiObservation || '').trim()) {
      newAuditEvents.push({
        id: `aud-${Date.now()}-edit`,
        timestamp: nowStr,
        actor: reviewerName.trim(),
        actorRole: reviewerRole.trim(),
        action: 'Reviewer edited observation draft',
        details: 'Observation text modified prior to human confirmation.'
      });
    }

    newAuditEvents.push({
      id: `aud-${Date.now()}-confirm`,
      timestamp: nowStr,
      actor: reviewerName.trim(),
      actorRole: reviewerRole.trim(),
      action: 'Observation confirmed by reviewer',
      details: reviewerNotes.trim()
        ? `Confirmed with note: "${reviewerNotes.trim()}"`
        : 'Attestation confirmed and logged.'
    });

    const updatedRecord: BodyCheckRecord = {
      ...record,
      status: 'confirmed',
      finalObservation: editedObservation.trim(),
      reviewer: reviewerName.trim(),
      reviewerRole: reviewerRole.trim(),
      confirmedAt: nowStr,
      reviewerNotes: reviewerNotes.trim() || undefined,
      auditTrail: [...newAuditEvents, ...(record.auditTrail || [])]
    };

    setRecord(updatedRecord);
    setIsReviewModalOpen(false);
    setConfirmationNotice(`Observation confirmed by ${reviewerName.trim()} on ${nowStr}`);

    if (onConfirmRecord) {
      onConfirmRecord(updatedRecord);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 print:space-y-4 print:p-0">
      
      {/* Top Header / Action Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm no-print">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 rounded-md hover:bg-slate-100 text-slate-600 transition-colors border border-slate-200 cursor-pointer"
              title="Return to list"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-mono font-bold text-slate-900">{record.id}</span>
                {renderStatusBadge(record.status, 'md')}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Patient Record: <strong className="font-mono text-slate-800">{record.patientRecordId}</strong> • Region: <strong className="text-slate-800">{record.bodyRegion}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {(record.status === 'ready_for_review' || record.status === 'ai_draft_ready' || record.status === 'human_review') && (
              <button
                type="button"
                onClick={handleOpenReviewModal}
                className="px-3.5 py-2 bg-sky-700 hover:bg-sky-800 text-white text-xs font-semibold rounded shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Review & Confirm</span>
              </button>
            )}

            {record.status === 'ready_to_analyze' && onStartAnalysis && (
              <button
                type="button"
                onClick={() => onStartAnalysis(record)}
                className="px-3.5 py-2 bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-semibold rounded shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <PlayCircle className="w-3.5 h-3.5" />
                <span>Start Analysis</span>
              </button>
            )}

            {record.status === 'processing' && onViewProgress && (
              <button
                type="button"
                onClick={() => onViewProgress(record)}
                className="px-3.5 py-2 bg-sky-700 hover:bg-sky-800 text-white text-xs font-semibold rounded shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>View Progress</span>
              </button>
            )}

            <button
              onClick={handlePrint}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded border border-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Record</span>
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Success Alert (if just confirmed) */}
      {confirmationNotice && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-lg p-4 shadow-sm flex items-center justify-between no-print animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-emerald-900">
                Observation Successfully Confirmed
              </div>
              <div className="text-[11px] text-emerald-700 mt-0.5">
                {confirmationNotice}. The observation is now officially recorded in the audit trail.
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setConfirmationNotice(null)}
            className="text-emerald-700 hover:text-emerald-900 p-1 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Printable Report Header */}
      <div className="hidden print:block border-b border-slate-400 pb-4 mb-4">
        <h1 className="text-xl font-bold">Body Check Visual Comparison Record</h1>
        <p className="text-xs text-slate-600">Comparison Documentation</p>
        <div className="text-xs font-mono mt-2">
          Record ID: {record.id} | Patient: {record.patientRecordId} | Date: {record.newImageDate}
        </div>
      </div>

      {/* Side-by-Side Images Card */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden p-5 space-y-4 print-card">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2">
          <FileText className="w-3.5 h-3.5" />
          Comparative Visual Evidence
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Reference Image */}
          <div className="border border-slate-200 rounded overflow-hidden flex flex-col">
            <div className="bg-slate-50 px-3 py-2 border-b border-slate-200 flex justify-between text-xs">
              <span className="font-mono font-bold text-slate-700">REFERENCE: {record.referenceImageId}</span>
              <span className="font-mono text-slate-500">{record.referenceDate}</span>
            </div>
            <div 
              className="relative aspect-[4/3] bg-slate-950 flex items-center justify-center cursor-zoom-in group"
              onClick={() => setActiveZoomImage({
                title: 'Reference Baseline Image',
                src: record.referenceImage,
                id: record.referenceImageId,
                date: record.referenceDate
              })}
            >
              <img
                src={record.referenceImage}
                alt="Baseline reference"
                className="w-full h-full object-contain transition-transform duration-200 group-hover:scale-[1.01]"
              />
              <button
                type="button"
                className="absolute top-2 right-2 bg-slate-900/75 hover:bg-slate-900 text-white text-[11px] px-2 py-1 rounded backdrop-blur-xs flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity no-print"
                title="Inspect high-resolution image"
              >
                <ZoomIn className="w-3.5 h-3.5" />
                <span>Inspect</span>
              </button>
            </div>
            <div className="p-2.5 bg-slate-50 text-[10px] text-slate-500 font-mono border-t border-slate-200 flex justify-between">
              <span>Baseline Documentation</span>
            </div>
          </div>

          {/* New Image / Review Photograph */}
          <div className="border border-slate-200 rounded overflow-hidden flex flex-col">
            <div className="bg-sky-50 px-3 py-2 border-b border-slate-200 flex justify-between text-xs">
              <span className="font-mono font-bold text-slate-800">
                {record.newImageId ? `NEW REVIEW: ${record.newImageId}` : 'REVIEW PHOTOGRAPH'}
              </span>
              <span className="font-mono text-slate-500">
                {record.newImageDate || 'Not selected'}
              </span>
            </div>
            {record.newImage ? (
              <ImageWithReticle
                src={record.newImage}
                alt="New follow-up review"
                deltaRegion={record.deltaRegion}
                changeCoordinates={record.changeCoordinates}
                showReticle={record.status !== 'not_analyzed' && record.status !== 'ready_to_analyze'}
                isNormalOrUnchanged={
                  record.finding?.toLowerCase().includes('normal') ||
                  record.changeType?.toLowerCase().includes('no significant')
                }
                onClick={() => setActiveZoomImage({
                  title: 'New Review Image',
                  src: record.newImage || '',
                  id: record.newImageId || '',
                  date: record.newImageDate || ''
                })}
                onInspect={() => setActiveZoomImage({
                  title: 'New Review Image',
                  src: record.newImage || '',
                  id: record.newImageId || '',
                  date: record.newImageDate || ''
                })}
              />
            ) : (
              <div className="aspect-[4/3] bg-slate-100 flex flex-col items-center justify-center p-6 text-center">
                <Clock className="w-8 h-8 text-slate-400 mb-2" />
                <p className="text-xs font-semibold text-slate-700">No Review Photograph Selected</p>
                <p className="text-[11px] text-slate-500 mt-1 max-w-xs">
                  Select a review image and run comparative analysis to view visual findings.
                </p>
              </div>
            )}
            <div className="p-2.5 bg-slate-50 text-[10px] text-slate-500 font-mono border-t border-slate-200 flex justify-between">
              <span className={record.status === 'not_analyzed' ? 'text-slate-400 italic font-sans' : 'text-rose-700 font-semibold'}>
                {record.status === 'not_analyzed' ? 'Awaiting comparative analysis' : (record.finding || 'Review Documentation')}
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* Metadata & Analysis Details */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4 print-card">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2">
          <Tag className="w-3.5 h-3.5" />
          Analysis & Finding Classification
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="bg-slate-50 p-3 rounded border border-slate-200">
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Body Region</span>
            <span className="font-semibold text-slate-900 mt-1 block">{record.bodyRegion}</span>
          </div>

          <div className="bg-slate-50 p-3 rounded border border-slate-200">
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Change Classification</span>
            <span className={`mt-1 block ${record.status === 'not_analyzed' ? 'text-slate-400 italic font-normal' : 'font-medium text-slate-800'}`}>
              {record.status === 'not_analyzed' ? 'Not analyzed yet' : (record.changeType || 'None recorded')}
            </span>
          </div>

          <div className="bg-slate-50 p-3 rounded border border-slate-200">
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Candidate Finding</span>
            <span className={`mt-1 block ${record.status === 'not_analyzed' ? 'text-slate-400 italic font-normal' : 'font-semibold text-rose-800'}`}>
              {record.status === 'not_analyzed' ? 'Not analyzed yet' : (record.finding || 'No finding recorded')}
            </span>
          </div>

          <div className="bg-slate-50 p-3 rounded border border-slate-200 flex flex-col justify-between">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Assessed Confidence</span>
              <span className={`mt-1 block ${record.status === 'not_analyzed' ? 'text-slate-400 italic font-normal' : 'font-semibold text-slate-900'}`}>
                {record.status === 'not_analyzed' ? 'Pending comparison' : `${record.confidence || 'Moderate'} confidence`}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1" title="Confidence reflects the comparison result and is not diagnostic accuracy.">
              Non-diagnostic comparison
            </span>
          </div>
        </div>
      </div>

      {/* Observation Documentation (AI Draft vs Final Confirmed) */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4 print-card">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-sky-700" />
          Observation Documentation & Human Review
        </h2>

        {/* 1. Original AI Draft */}
        <div className="bg-slate-50 border border-slate-200 rounded p-3.5 text-xs space-y-1">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              1. Initial AI-Generated Assistive Draft
            </span>
            <span className="text-[10px] font-mono text-slate-400">Automated Comparison Output</span>
          </div>
          <p className="text-slate-700 italic leading-relaxed">
            {record.status === 'processing'
              ? 'Comparative analysis is currently executing. Assistive draft observation will be generated upon pipeline completion.'
              : record.status === 'ready_to_analyze'
              ? 'Review photograph registered. Run comparative analysis to generate an assistive draft observation.'
              : record.status === 'not_analyzed' 
              ? 'Not analyzed yet. Select a review image and run comparative analysis to generate an assistive draft observation.' 
              : `"${record.aiObservation}"`}
          </p>
        </div>

        {/* 2. Reviewer Observation: Final Confirmed VS Pending Review VS Processing VS Ready to Analyze VS Not Analyzed */}
        {record.status === 'confirmed' ? (
          <div className="bg-emerald-50/50 border border-emerald-200 rounded p-4 text-xs space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                2. FINAL HUMAN-CONFIRMED OBSERVATION
              </span>
              <span className="text-[10px] font-mono text-emerald-700 font-bold">Confirmed Observation</span>
            </div>
            <p className="text-slate-900 font-medium text-sm leading-relaxed">
              "{record.finalObservation || record.aiObservation}"
            </p>
          </div>
        ) : record.status === 'processing' ? (
          <div className="bg-sky-50 border border-sky-200 rounded p-4 text-xs space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-sky-900 uppercase tracking-wider flex items-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 text-sky-600 animate-spin" />
                2. Comparative Analysis In Progress
              </span>
              <span className="text-[10px] font-mono text-sky-700 font-semibold px-2 py-0.5 rounded bg-sky-100 border border-sky-200">
                Processing
              </span>
            </div>
            <p className="text-sky-800 text-xs leading-relaxed">
              Automated comparative pipeline is currently evaluating visual differences between the reference baseline and follow-up review image.
            </p>
            {onViewProgress && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => onViewProgress(record)}
                  className="px-3.5 py-1.5 bg-sky-700 hover:bg-sky-800 text-white text-xs font-semibold rounded shadow-sm transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <span>View Progress Pipeline →</span>
                </button>
              </div>
            )}
          </div>
        ) : record.status === 'ready_to_analyze' ? (
          <div className="bg-indigo-50 border border-indigo-200 rounded p-4 text-xs space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                <PlayCircle className="w-3.5 h-3.5 text-indigo-600" />
                2. Review Photograph Registered
              </span>
              <span className="text-[10px] font-mono text-indigo-700 font-semibold px-2 py-0.5 rounded bg-indigo-100 border border-indigo-200">
                Ready to Analyze
              </span>
            </div>
            <p className="text-indigo-800 text-xs leading-relaxed">
              Follow-up photograph has been selected and registered. Execute comparative analysis to evaluate skin differences and generate an assistive finding draft.
            </p>
            {onStartAnalysis && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => onStartAnalysis(record)}
                  className="px-3.5 py-1.5 bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-semibold rounded shadow-sm transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Start Comparative Analysis →</span>
                </button>
              </div>
            )}
          </div>
        ) : record.status === 'not_analyzed' ? (
          <div className="bg-slate-50 border border-slate-200 rounded p-4 text-xs space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                2. Reviewer Evaluation & Confirmation
              </span>
              <span className="text-[10px] font-mono text-slate-600 px-2 py-0.5 rounded bg-slate-200">
                Not Analyzed
              </span>
            </div>
            <p className="text-slate-500 text-xs leading-relaxed">
              Comparative analysis has not been executed for this record. An authorized reviewer must select a review image and run the comparison before an observation can be confirmed.
            </p>
          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-200 rounded p-4 text-xs space-y-3">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                2. Reviewer Evaluation & Confirmation
              </span>
              <span className="text-[10px] font-mono text-amber-700 font-semibold px-2 py-0.5 rounded bg-amber-50 border border-amber-200">
                Pending Human Review
              </span>
            </div>
            <p className="text-slate-600 text-xs leading-relaxed">
              This AI-generated draft has not been confirmed yet. An authorized reviewer must inspect the comparative evidence and confirm or edit the observation.
            </p>
            <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleOpenReviewModal}
                className="px-3.5 py-2 bg-sky-700 hover:bg-sky-800 text-white text-xs font-semibold rounded shadow-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Review & Confirm Observation</span>
              </button>
              <span className="text-[11px] text-slate-400 italic">Action required before final documentation</span>
            </div>
          </div>
        )}

        {/* Reviewer Signature Box */}
        <div className="pt-3 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Reviewer Name</span>
            <span className={`mt-0.5 block ${record.status === 'confirmed' ? 'font-semibold text-slate-900' : 'text-slate-400 italic'}`}>
              {record.status === 'confirmed' ? (record.reviewer || 'Reviewer') : (record.status === 'not_analyzed' ? '—' : 'Pending review')}
            </span>
          </div>

          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Reviewer Role</span>
            <span className="text-slate-700 mt-0.5 block">
              {record.status === 'not_analyzed' ? '—' : (record.reviewerRole || 'Reviewer')}
            </span>
          </div>

          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Confirmation Timestamp</span>
            <span className={`font-mono mt-0.5 block ${record.status === 'confirmed' ? 'text-slate-800' : 'text-slate-400 italic'}`}>
              {record.status === 'confirmed' ? (record.confirmedAt || 'Confirmed') : (record.status === 'not_analyzed' ? 'Not analyzed yet' : 'Not confirmed yet')}
            </span>
          </div>
        </div>

        {record.reviewerNotes && (
          <div className="bg-slate-50 p-2.5 rounded border border-slate-200 text-xs">
            <span className="text-[10px] font-bold uppercase text-slate-500 block mb-0.5">Reviewer Follow-up Notes:</span>
            <p className="text-slate-800">{record.reviewerNotes}</p>
          </div>
        )}
      </div>

      {/* Chronological Audit Activity Timeline */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4 print-card">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <History className="w-3.5 h-3.5 text-slate-500" />
            Activity Timeline ({record.auditTrail?.length || 0} Events)
          </h2>
          <span className="text-[11px] font-mono text-slate-400">Activity Log</span>
        </div>

        <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
          {record.auditTrail && record.auditTrail.length > 0 ? (
            record.auditTrail.map((ev, index) => {
              const isSystem = ev.actor.toLowerCase() === 'system';
              const isConfirmedAction = ev.action.toLowerCase().includes('confirmed');
              return (
                <div key={ev.id || index} className="relative group text-xs">
                  {/* Timeline bullet */}
                  <div className={`absolute -left-6 top-1 w-3.5 h-3.5 rounded-full border-2 border-white flex items-center justify-center ${
                    isConfirmedAction ? 'bg-emerald-600' : isSystem ? 'bg-slate-400' : 'bg-sky-600'
                  }`}></div>

                  <div className="bg-slate-50/70 hover:bg-slate-50 p-3 rounded border border-slate-200 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                      <div className="flex items-center gap-1.5 font-bold text-slate-900">
                        {isSystem ? (
                          <FileText className="w-3 h-3 text-slate-500" />
                        ) : isConfirmedAction ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <User className="w-3 h-3 text-sky-700" />
                        )}
                        <span>{ev.action}</span>
                      </div>
                      <div className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{ev.timestamp}</span>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-600 mt-0.5">
                      Actor: <span className="font-semibold text-slate-800">{ev.actor}</span> ({ev.actorRole})
                    </div>

                    {ev.details && (
                      <div className="text-[11px] text-slate-500 mt-1 font-mono bg-white p-1.5 rounded border border-slate-200">
                        {ev.details}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-xs text-slate-400 italic">No audit events logged yet.</div>
          )}
        </div>
      </div>

      {/* Human Review & Confirmation Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 max-w-xl w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-sky-700" />
                <h3 className="text-base font-bold text-slate-900">
                  Review & Confirm Observation
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsReviewModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                title="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Review the automated assistive draft against the comparative evidence. You can edit the text to ensure exact clinical observation before confirming.
            </p>

            {/* Quick Evidence Summary */}
            <div className="bg-slate-50 p-3 rounded border border-slate-200 text-xs space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-600">
                <span>Record: <strong className="font-mono text-slate-900">{record.id}</strong> ({record.patientRecordId})</span>
                <span>Region: <strong className="text-slate-800">{record.bodyRegion}</strong></span>
              </div>
              <div className="text-[11px] text-slate-600">
                Finding: <strong className="text-rose-700">{record.finding}</strong> ({record.confidence} confidence)
              </div>
            </div>

            <form onSubmit={handleConfirmSubmit} className="space-y-4">
              
              {/* Editable Observation Text */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Observation Text (Confirmed)
                  </label>
                  <button
                    type="button"
                    onClick={() => setEditedObservation(record.aiObservation || '')}
                    className="text-[11px] text-sky-700 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset to AI Draft</span>
                  </button>
                </div>
                <textarea
                  required
                  rows={3}
                  value={editedObservation}
                  onChange={(e) => setEditedObservation(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-300 rounded p-2.5 text-slate-900 focus:ring-1 focus:ring-sky-500 leading-relaxed"
                  placeholder="Enter observation notes..."
                />
                {editedObservation !== (record.aiObservation || '') && (
                  <span className="text-[10px] text-amber-700 font-mono block mt-0.5">
                    * Modified from initial AI draft
                  </span>
                )}
              </div>

              {/* Reviewer Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Reviewer Name
                  </label>
                  <input
                    type="text"
                    required
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 focus:ring-1 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Reviewer Role
                  </label>
                  <input
                    type="text"
                    required
                    value={reviewerRole}
                    onChange={(e) => setReviewerRole(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 focus:ring-1 focus:ring-sky-500"
                  />
                </div>
              </div>

              {/* Optional Notes */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Follow-up Notes / Actions (Optional)
                </label>
                <input
                  type="text"
                  value={reviewerNotes}
                  onChange={(e) => setReviewerNotes(e.target.value)}
                  placeholder="e.g. Cleansed surface; routine reassessment scheduled."
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 focus:ring-1 focus:ring-sky-500"
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="px-3.5 py-2 border border-slate-300 rounded text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Confirm Observation</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* High-Resolution Photographic Zoom Inspection Modal */}
      {activeZoomImage && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-4 no-print"
          onClick={() => setActiveZoomImage(null)}
        >
          <div 
            className="bg-slate-900 border border-slate-700 rounded-lg max-w-4xl w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
                  {activeZoomImage.id}
                </span>
                <span className="text-sm font-semibold">{activeZoomImage.title}</span>
                <span className="text-xs text-slate-400 font-mono hidden sm:inline">• {activeZoomImage.date}</span>
              </div>
              <button
                type="button"
                onClick={() => setActiveZoomImage(null)}
                className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 bg-black p-2 flex items-center justify-center overflow-auto min-h-[300px]">
              <img
                src={activeZoomImage.src}
                alt={activeZoomImage.title}
                className="max-h-[75vh] w-auto object-contain rounded select-none"
              />
            </div>

            <div className="bg-slate-900 px-4 py-2.5 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>High-resolution audit inspection view</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
