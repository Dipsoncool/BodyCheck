import React, { useState } from 'react';
import { AnalysisResult, BodyCheckRecord, AuditEvent } from '../types/bodyCheck';
import { UserProfile } from '../types/auth';
import { PROCESSING_STAGES } from '../services/analysisService';
import { ImageWithReticle } from './ImageWithReticle';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Edit3, 
  RotateCcw, 
  Check, 
  ShieldCheck, 
  UserCheck, 
  Clock, 
  ArrowRight,
  Trash2,
  ZoomIn,
  X,
  Save,
  FileCheck,
  FileText
} from 'lucide-react';

interface AnalysisReviewViewProps {
  recordId?: string;
  referenceImage: string;
  referenceImageId: string;
  referenceDate: string;
  newImage: string;
  newImageId: string;
  newImageDate: string;
  patientRecordId: string;
  analysis: AnalysisResult | null;
  isAnalyzing: boolean;
  currentProcessingStageIndex?: number;
  currentProcessingStageName?: string;
  analysisProgressPercent?: number;
  currentUser?: UserProfile;
  onSaveConfirmed: (record: BodyCheckRecord) => void;
  onSaveDraft?: (recordId: string, text: string) => void;
  onBackToNew: () => void;
  onNavigateHistory: () => void;
  onNavigateDashboard?: () => void;
}

export const AnalysisReviewView: React.FC<AnalysisReviewViewProps> = ({
  recordId,
  referenceImage,
  referenceImageId,
  referenceDate,
  newImage,
  newImageId,
  newImageDate,
  patientRecordId,
  analysis,
  isAnalyzing,
  currentProcessingStageIndex = 0,
  analysisProgressPercent = 50,
  currentUser,
  onSaveConfirmed,
  onBackToNew,
  onNavigateHistory,
  onNavigateDashboard
}) => {
  // State for observation editing
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedObservation, setEditedObservation] = useState<string>(
    analysis?.aiObservation || ''
  );
  const [isDraftSavedNotice, setIsDraftSavedNotice] = useState<boolean>(false);
  
  // State for visual focus overlay on new image (OFF by default)
  const [showFocusOverlay, setShowFocusOverlay] = useState<boolean>(false);
  
  // State for human confirmation modal / state
  const [isConfirmingModalOpen, setIsConfirmingModalOpen] = useState<boolean>(false);
  const [isConfirmed, setIsConfirmed] = useState<boolean>(false);
  const [reviewerName, setReviewerName] = useState<string>(currentUser?.name || 'Sarah Mitchell');
  const [reviewerRole, setReviewerRole] = useState<string>(currentUser?.role || 'Reviewer');
  const [reviewerNotes, setReviewerNotes] = useState<string>('');
  const [confirmedTimestamp, setConfirmedTimestamp] = useState<string>('');
  
  // State for high-resolution zoom inspection modal
  const [activeZoomImage, setActiveZoomImage] = useState<{
    title: string;
    src: string;
    id: string;
    date: string;
  } | null>(null);

  // Update editedObservation when analysis finishes
  React.useEffect(() => {
    if (analysis) {
      setEditedObservation(analysis.aiObservation);
    }
  }, [analysis]);

  // If analyzing, render 7-stage processing checklist
  if (isAnalyzing || !analysis) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="bg-white border border-slate-200 rounded-lg p-7 shadow-sm">
          
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="h-10 w-10 rounded-lg bg-slate-900 flex items-center justify-center text-sky-400">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Processing Body Check Comparison
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Comparing reference ({referenceImageId}) against review ({newImageId})
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-5 mb-6">
            <div className="flex justify-between text-[11px] font-mono text-slate-500 mb-1.5">
              <span>Pipeline execution: {analysisProgressPercent}%</span>
              <span className="font-semibold text-sky-700">Stage {currentProcessingStageIndex + 1} of {PROCESSING_STAGES.length}</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
              <div 
                className="bg-sky-600 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${analysisProgressPercent}%` }}
              ></div>
            </div>
          </div>

          {/* 7-Stage Architectural Checklist */}
          <div className="space-y-2.5 bg-slate-50/80 p-4 rounded-md border border-slate-200 text-xs">
            {PROCESSING_STAGES.map((stage, idx) => {
              const isCompleted = idx < currentProcessingStageIndex;
              const isCurrent = idx === currentProcessingStageIndex;
              return (
                <div 
                  key={stage}
                  className={`flex items-center gap-2.5 transition-colors ${
                    isCompleted
                      ? 'text-emerald-800 font-medium'
                      : isCurrent
                      ? 'text-sky-900 font-semibold'
                      : 'text-slate-400'
                  }`}
                >
                  <span className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
                    {isCompleted ? (
                      <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                    ) : isCurrent ? (
                      <div className="w-2 h-2 rounded-full bg-sky-600"></div>
                    ) : (
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                    )}
                  </span>
                  <span className="truncate">{stage}</span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 text-center text-[11px] text-slate-400 font-mono">
            Aligning anatomical reference and generating observation draft
          </div>

        </div>
      </div>
    );
  }

  // Handle Save Draft
  const handleSaveDraft = () => {
    setIsEditing(false);
    setIsDraftSavedNotice(true);
    setTimeout(() => setIsDraftSavedNotice(false), 3000);
  };

  // Handle saving confirmed check
  const handleConfirmSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const timestamp = new Date().toLocaleString('sv-SE', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit', 
      hour: '2-digit', 
      minute: '2-digit' 
    }).replace('T', ' ');

    setConfirmedTimestamp(timestamp);
    setIsConfirmed(true);
    setIsConfirmingModalOpen(false);

    const initialAudit: AuditEvent[] = [
      {
        id: `aud-${Date.now()}-1`,
        timestamp: referenceDate,
        actor: 'System',
        actorRole: 'Baseline Intake',
        action: 'Baseline image registered',
        details: `Reference image ${referenceImageId} established.`
      },
      {
        id: `aud-${Date.now()}-2`,
        timestamp: newImageDate,
        actor: reviewerName,
        actorRole: reviewerRole,
        action: 'Review check initiated',
        details: `New review image ${newImageId} uploaded for ${analysis.bodyRegion}.`
      },
      {
        id: `aud-${Date.now()}-3`,
        timestamp: timestamp,
        actor: 'System',
        actorRole: 'Comparative Analysis',
        action: 'Comparative analysis completed',
        details: `Candidate finding generated: ${analysis.finding} (${analysis.confidence} confidence).`
      }
    ];

    if (editedObservation !== analysis.aiObservation) {
      initialAudit.push({
        id: `aud-${Date.now()}-4`,
        timestamp: timestamp,
        actor: reviewerName,
        actorRole: reviewerRole,
        action: 'Reviewer edited observation draft',
        details: 'Observation text modified prior to attestation.'
      });
    }

    initialAudit.push({
      id: `aud-${Date.now()}-5`,
      timestamp: timestamp,
      actor: reviewerName,
      actorRole: reviewerRole,
      action: 'Observation confirmed by reviewer',
      details: reviewerNotes ? `Confirmed with note: "${reviewerNotes}"` : 'Attestation confirmed and logged.'
    });

    const checkRecord: BodyCheckRecord = {
      id: recordId || `BC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      patientRecordId,
      referenceImage,
      referenceImageId,
      referenceDate,
      newImage,
      newImageId,
      newImageDate,
      bodyRegion: analysis.bodyRegion,
      changeType: analysis.changeType,
      finding: analysis.finding,
      confidence: analysis.confidence,
      confidenceScore: analysis.confidenceScore,
      candidateFinding: analysis.candidateFinding,
      aiObservation: analysis.aiObservation,
      finalObservation: editedObservation,
      status: 'confirmed',
      reviewer: reviewerName,
      reviewerRole: reviewerRole,
      confirmedAt: timestamp,
      updatedAt: timestamp,
      reviewerNotes: reviewerNotes || undefined,
      deltaRegion: analysis.deltaRegion,
      changeCoordinates: analysis.changeCoordinates,
      auditTrail: initialAudit.reverse()
    };

    onSaveConfirmed(checkRecord);
  };

  const handleResetToDraft = () => {
    setEditedObservation(analysis.aiObservation);
    setIsEditing(false);
  };

  const handleClearObservation = () => {
    setEditedObservation('');
    setIsEditing(true);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      
      {/* Top Banner / Review Mode Notice */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-700">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900 tracking-tight">
                Analysis & Review
              </h1>
              {isConfirmed ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Confirmed Observation
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  AI Draft Ready — Human Review Required
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Record: <span className="font-mono font-semibold text-slate-800">{patientRecordId}</span> • Region: <span className="font-semibold text-slate-800">{analysis.bodyRegion}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <label className="inline-flex items-center gap-2 cursor-pointer select-none text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 px-3 py-1.5 rounded border border-slate-300 transition-colors shadow-2xs">
            <input
              type="checkbox"
              checked={showFocusOverlay}
              onChange={(e) => setShowFocusOverlay(e.target.checked)}
              className="w-4 h-4 rounded text-sky-600 border-slate-300 focus:ring-sky-500 cursor-pointer"
            />
            <span>Show change overlay</span>
          </label>
          
          <button
            onClick={onBackToNew}
            className="text-xs px-2.5 py-1.5 rounded border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition-colors"
          >
            New Comparison
          </button>
        </div>
      </div>

      {/* Confirmation Success Alert (if confirmed) */}
      {isConfirmed && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-lg p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 flex-shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-emerald-900">
                Observation Confirmed & Stored to Audit History
              </div>
              <div className="text-xs text-emerald-700 mt-0.5">
                Reviewer: <span className="font-semibold">{reviewerName}</span> ({reviewerRole}) on {confirmedTimestamp}.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {onNavigateDashboard && (
              <button
                onClick={onNavigateDashboard}
                className="text-xs font-semibold px-3 py-2 bg-white border border-emerald-300 hover:bg-emerald-50 text-emerald-800 rounded shadow-sm transition-colors"
              >
                Return to Dashboard
              </button>
            )}
            <button
              onClick={onNavigateHistory}
              className="text-xs font-semibold px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded shadow-sm transition-colors flex items-center gap-1"
            >
              <span>View in History</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Side-by-Side Images Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left Column: REFERENCE */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden flex flex-col">
          <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-slate-500 block">
                REFERENCE
              </span>
              <div className="text-sm font-mono font-bold text-slate-900 mt-0.5">
                {referenceImageId}
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Capture Date/Time</span>
              <div className="text-xs font-mono font-medium text-slate-700 mt-0.5 flex items-center gap-1 justify-end">
                <Clock className="w-3 h-3 text-slate-400" />
                {referenceDate}
              </div>
            </div>
          </div>

          {/* Reference Image Viewport */}
          <div 
            className="relative aspect-[4/3] bg-slate-950 flex items-center justify-center overflow-hidden cursor-zoom-in group"
            onClick={() => setActiveZoomImage({
              title: 'Reference Baseline Image',
              src: referenceImage,
              id: referenceImageId,
              date: referenceDate
            })}
          >
            <img
              src={referenceImage}
              alt={`Reference ${referenceImageId}`}
              className="w-full h-full object-contain transition-transform duration-200 group-hover:scale-[1.01]"
            />
            <div className="absolute top-2 left-2 bg-slate-900/80 text-white text-[10px] font-mono px-2 py-0.5 rounded backdrop-blur-xs">
              BASELINE
            </div>
            <button
              type="button"
              className="absolute top-2 right-2 bg-slate-900/75 hover:bg-slate-900 text-white text-[11px] px-2 py-1 rounded backdrop-blur-xs flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity"
              title="Inspect high-resolution image"
            >
              <ZoomIn className="w-3.5 h-3.5" />
              <span>Inspect</span>
            </button>
          </div>

          <div className="p-3 bg-slate-50 text-[11px] text-slate-500 font-mono border-t border-slate-200 flex justify-between items-center">
            <span>Reference Baseline</span>
          </div>
        </div>

        {/* Right Column: NEW IMAGE */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden flex flex-col">
          <div className="bg-sky-50/70 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-sky-800 block">
                NEW IMAGE
              </span>
              <div className="text-sm font-mono font-bold text-slate-900 mt-0.5">
                {newImageId}
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Capture Date/Time</span>
              <div className="text-xs font-mono font-medium text-slate-700 mt-0.5 flex items-center gap-1 justify-end">
                <Clock className="w-3 h-3 text-sky-600" />
                {newImageDate}
              </div>
            </div>
          </div>

          {/* New Image Viewport with Image-Anchored Delta Reticle */}
          <ImageWithReticle
            src={newImage}
            alt={`New Review ${newImageId}`}
            deltaRegion={analysis.deltaRegion}
            changeCoordinates={analysis.changeCoordinates}
            showReticle={showFocusOverlay}
            badgeText="FOLLOW-UP"
            isNormalOrUnchanged={
              analysis.finding?.toLowerCase().includes('normal') ||
              analysis.changeType?.toLowerCase().includes('no significant')
            }
            onClick={() => setActiveZoomImage({
              title: 'New Review Image',
              src: newImage,
              id: newImageId,
              date: newImageDate
            })}
            onInspect={() => setActiveZoomImage({
              title: 'New Review Image',
              src: newImage,
              id: newImageId,
              date: newImageDate
            })}
          />

          <div className="p-3 bg-slate-50 text-[11px] text-slate-500 font-mono border-t border-slate-200 flex justify-between items-center">
            <span className={`${
              analysis.finding?.toLowerCase().includes('normal') || analysis.changeType?.toLowerCase().includes('no significant')
                ? 'text-emerald-700'
                : 'text-rose-700'
            } font-semibold`}>
              {analysis.finding}
            </span>
            {showFocusOverlay && (
              (analysis.finding?.toLowerCase().includes('normal') ||
               analysis.changeType?.toLowerCase().includes('no significant') ||
               !analysis.deltaRegion) ? (
                <span className="text-emerald-700 font-sans font-medium flex items-center gap-1 text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  No localized visual change detected
                </span>
              ) : (
                <span className="text-sky-700 font-sans font-medium text-xs">
                  Change overlay active
                </span>
              )
            )}
          </div>
        </div>

      </div>

      {/* Structured Candidate Findings & Analysis Summary */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-sky-700" />
            Structured Candidate Findings
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            Analysis complete
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          
          {/* Body Region */}
          <div className="bg-slate-50 p-3 rounded border border-slate-200">
            <span className="text-slate-500 block text-[11px] uppercase tracking-wider font-semibold">
              Body Region
            </span>
            <span className="mt-1 text-sm font-bold text-slate-900 block">
              {analysis.bodyRegion}
            </span>
          </div>

          {/* Change Type */}
          <div className="bg-slate-50 p-3 rounded border border-slate-200">
            <span className="text-slate-500 block text-[11px] uppercase tracking-wider font-semibold">
              Change Type
            </span>
            <span className="mt-1 text-sm font-medium text-slate-900 block">
              {analysis.changeType}
            </span>
          </div>

          {/* Finding */}
          <div className="bg-slate-50 p-3 rounded border border-slate-200">
            <span className="text-slate-500 block text-[11px] uppercase tracking-wider font-semibold">
              Candidate Finding
            </span>
            <span className="mt-1 text-sm font-semibold text-rose-800 block">
              {analysis.finding}
            </span>
          </div>

          {/* Confidence */}
          <div className="bg-slate-50 p-3 rounded border border-slate-200 flex flex-col justify-between">
            <div>
              <span className="text-slate-500 block text-[11px] uppercase tracking-wider font-semibold">
                Assessed Confidence
              </span>
              <div className="mt-1 flex items-center gap-2">
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                  analysis.confidence === 'High' 
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                    : analysis.confidence === 'Moderate'
                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                    : 'bg-slate-200 text-slate-800 border border-slate-300'
                }`}>
                  {analysis.confidence} confidence
                </span>
                <span className="text-[10px] text-slate-500">Human review required</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5 leading-tight" title="Confidence reflects the comparison result and is not diagnostic accuracy.">
              Confidence reflects the comparison result and is not diagnostic accuracy.
            </p>
          </div>

        </div>
      </div>

      {/* AI-Generated Observation Draft Card */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                AI-Generated Observation Draft
              </h2>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-sky-100 text-sky-800 border border-sky-200">
                Observation Draft
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Preliminary draft for human review. Reviewer must verify and confirm.
            </p>
          </div>

          {/* Reviewer Observation Controls */}
          {!isConfirmed && (
            <div className="flex items-center gap-2">
              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="text-xs px-2.5 py-1.5 rounded border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium flex items-center gap-1.5 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                  <span>Edit Draft</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="text-xs px-2.5 py-1.5 rounded bg-sky-700 hover:bg-sky-800 text-white font-medium flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Draft</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleResetToDraft}
                title="Reset text to initial AI draft"
                className="text-xs px-2.5 py-1.5 rounded border border-slate-300 hover:bg-slate-50 text-slate-600 transition-colors flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>

              <button
                type="button"
                onClick={handleClearObservation}
                title="Clear observation text"
                className="text-xs px-2 py-1.5 rounded border border-slate-300 hover:bg-slate-50 text-slate-500 hover:text-red-600 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Draft Saved Feedback Notice */}
        {isDraftSavedNotice && (
          <div className="p-2.5 bg-sky-50 border border-sky-200 rounded text-xs text-sky-800 flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-sky-600" />
            <span>Draft observation saved. You may proceed to confirm when ready.</span>
          </div>
        )}

        {/* Observation Content Box (Editable or Static) */}
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={editedObservation}
              onChange={(e) => setEditedObservation(e.target.value)}
              rows={3}
              className="w-full text-sm leading-relaxed p-3 bg-amber-50/30 border border-amber-300 rounded focus:ring-2 focus:ring-sky-500 text-slate-900 font-sans"
              placeholder="Enter observation notes..."
            />
            <div className="flex justify-between items-center text-[11px] text-slate-500">
              <span>Modify wording as needed for accurate documentation before confirming.</span>
              <button
                type="button"
                onClick={handleSaveDraft}
                className="text-sky-700 font-semibold hover:underline"
              >
                Save Draft
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-slate-50/80 border border-slate-200 rounded p-4">
            <p className="text-sm font-medium leading-relaxed text-slate-900">
              "{editedObservation || analysis.aiObservation}"
            </p>
            {editedObservation !== analysis.aiObservation && (
              <div className="mt-2 text-[11px] text-amber-800 font-mono flex items-center gap-1">
                <span>[Modified by reviewer from initial AI draft]</span>
              </div>
            )}
          </div>
        )}

        {/* Assistive Notice */}
        <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded border border-slate-200 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            AI-generated observations are assistive and require human review and confirmation. They do not constitute medical diagnosis.
          </div>
        </div>

        {/* Confirmation Action Container */}
        {!isConfirmed ? (
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-slate-400" />
              <span>Reviewer: <strong className="text-slate-800">{reviewerName}</strong> ({reviewerRole})</span>
            </div>

            <button
              type="button"
              onClick={() => setIsConfirmingModalOpen(true)}
              className="w-full sm:w-auto px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold rounded-md shadow-sm transition-colors flex items-center justify-center gap-2 focus:ring-2 focus:ring-emerald-500"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm Observation</span>
            </button>
          </div>
        ) : (
          <div className="pt-3 flex items-center justify-between border-t border-slate-100 text-xs">
            <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              Observation Confirmed by {reviewerName}
            </span>
            <button
              onClick={onNavigateHistory}
              className="text-sky-700 hover:text-sky-900 font-semibold hover:underline flex items-center gap-1"
            >
              <span>Go to History</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

      </div>

      {/* Confirmation Attestation Modal */}
      {isConfirmingModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Human Confirmation — Body Check Observation
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsConfirmingModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-600 transition-colors"
                title="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              By confirming, you certify that you have reviewed the reference image against the new review image and attest to the observation for record <strong className="font-mono text-slate-900">{patientRecordId}</strong>.
            </p>

            {/* Summary preview */}
            <div className="bg-slate-50 p-3 rounded border border-slate-200 text-xs space-y-2">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Confirmed Observation:</span>
                <span className="text-slate-900 font-medium italic">"{editedObservation}"</span>
              </div>
              <div className="flex gap-4 text-[11px] text-slate-600 pt-1 border-t border-slate-200">
                <span>Region: <strong className="text-slate-800">{analysis.bodyRegion}</strong></span>
                <span>Finding: <strong className="text-slate-800">{analysis.finding}</strong></span>
              </div>
            </div>

            <form onSubmit={handleConfirmSubmit} className="space-y-3">
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

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Optional Review Notes / Follow-up Actions
                </label>
                <textarea
                  rows={2}
                  value={reviewerNotes}
                  onChange={(e) => setReviewerNotes(e.target.value)}
                  placeholder="e.g. Minor surface erythema noted. Follow-up check scheduled in 48 hours."
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsConfirmingModalOpen(false)}
                  className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 rounded border border-slate-300 hover:bg-slate-50 transition-colors"
                >
                  Back to Review
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Confirm & Save to History</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* High-Resolution Photographic Zoom Inspection Modal */}
      {activeZoomImage && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-4"
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
                className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
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
              <span>High-resolution inspection view</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
