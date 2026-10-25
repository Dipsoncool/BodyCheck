import React from 'react';
import { CheckStatus, BodyCheckRecord } from '../types/bodyCheck';
import { 
  CheckCircle2, 
  FileEdit, 
  Loader2, 
  PlayCircle, 
  Clock 
} from 'lucide-react';

/**
 * Human-readable status label.
 */
export function getStatusLabel(status: CheckStatus): string {
  switch (status) {
    case 'confirmed':
      return 'Confirmed';
    case 'ready_for_review':
    case 'ai_draft_ready':
    case 'human_review':
      return 'Ready for Review';
    case 'processing':
      return 'Processing';
    case 'ready_to_analyze':
      return 'Ready to Analyze';
    case 'not_analyzed':
    default:
      return 'Not Analyzed';
  }
}

/**
 * Standardized status badge element across Dashboard, History, and DetailView.
 */
export function renderStatusBadge(status: CheckStatus, size: 'sm' | 'md' = 'sm'): React.ReactNode {
  const iconClass = size === 'md' ? 'w-3.5 h-3.5' : 'w-3 h-3';
  const textClass = size === 'md' ? 'text-xs font-semibold px-2.5 py-0.5' : 'text-[11px] font-medium px-2 py-0.5';

  switch (status) {
    case 'confirmed':
      return (
        <span className={`inline-flex items-center gap-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 ${textClass}`}>
          <CheckCircle2 className={`${iconClass} text-emerald-600`} />
          <span>Confirmed</span>
        </span>
      );
    case 'ready_for_review':
    case 'ai_draft_ready':
    case 'human_review':
      return (
        <span className={`inline-flex items-center gap-1 rounded bg-amber-50 text-amber-800 border border-amber-200 ${textClass}`}>
          <FileEdit className={`${iconClass} text-amber-600`} />
          <span>Ready for Review</span>
        </span>
      );
    case 'processing':
      return (
        <span className={`inline-flex items-center gap-1 rounded bg-sky-50 text-sky-800 border border-sky-200 ${textClass}`}>
          <Loader2 className={`${iconClass} text-sky-600 animate-spin`} />
          <span>Processing</span>
        </span>
      );
    case 'ready_to_analyze':
      return (
        <span className={`inline-flex items-center gap-1 rounded bg-indigo-50 text-indigo-800 border border-indigo-200 ${textClass}`}>
          <PlayCircle className={`${iconClass} text-indigo-600`} />
          <span>Ready to Analyze</span>
        </span>
      );
    case 'not_analyzed':
    default:
      return (
        <span className={`inline-flex items-center gap-1 rounded bg-slate-100 text-slate-700 border border-slate-300 ${textClass}`}>
          <Clock className={`${iconClass} text-slate-500`} />
          <span>Not Analyzed</span>
        </span>
      );
  }
}

/**
 * Standardized action label based on workflow state.
 */
export function getActionLabel(status: CheckStatus): string {
  switch (status) {
    case 'confirmed':
      return 'Inspect →';
    case 'ready_for_review':
    case 'ai_draft_ready':
    case 'human_review':
      return 'Review →';
    case 'processing':
      return 'View Progress →';
    case 'ready_to_analyze':
      return 'Start Analysis →';
    case 'not_analyzed':
    default:
      return 'Analyze →';
  }
}

/**
 * Standardized reviewer display text and pending flag.
 */
export function getReviewerDisplay(record: BodyCheckRecord): { text: string; isPending: boolean } {
  switch (record.status) {
    case 'confirmed':
      return { text: record.reviewer || 'Reviewer', isPending: false };
    case 'ready_for_review':
    case 'ai_draft_ready':
    case 'human_review':
      return { text: 'Pending review', isPending: true };
    case 'processing':
      return { text: 'In progress', isPending: true };
    case 'ready_to_analyze':
    case 'not_analyzed':
    default:
      return { text: '—', isPending: true };
  }
}

/**
 * Standardized finding summary display for table rows.
 */
export function getFindingSummaryDisplay(record: BodyCheckRecord): {
  title: string;
  subtitle: string;
  isDraft?: boolean;
  isProcessing?: boolean;
  isReady?: boolean;
  isNotAnalyzed?: boolean;
} {
  switch (record.status) {
    case 'confirmed':
      return {
        title: record.finding || 'Baseline comparison intact',
        subtitle: record.finalObservation || record.aiObservation || 'Human-confirmed observation logged.'
      };
    case 'ready_for_review':
    case 'ai_draft_ready':
    case 'human_review':
      return {
        title: record.finding || 'Candidate finding identified',
        subtitle: record.aiObservation ? `Draft: ${record.aiObservation}` : 'AI draft ready for human confirmation',
        isDraft: true
      };
    case 'processing':
      return {
        title: 'Comparative analysis in progress',
        subtitle: 'Analyzing image pair and evaluating visual differences...',
        isProcessing: true
      };
    case 'ready_to_analyze':
      return {
        title: 'Review image registered',
        subtitle: 'Follow-up photograph selected • Ready for comparison',
        isReady: true
      };
    case 'not_analyzed':
    default:
      return {
        title: 'Not analyzed yet',
        subtitle: 'Awaiting follow-up review photograph',
        isNotAnalyzed: true
      };
  }
}

/**
 * Resolves the most recent activity timestamp for a record.
 * Checks updatedAt, confirmedAt, draftSavedAt, latest auditTrail event, newImageDate, and referenceDate.
 * Returns numerical milliseconds for precise descending sorting.
 */
export function getRecordActivityTimestamp(record: BodyCheckRecord): number {
  if (record.updatedAt) {
    const t = new Date(record.updatedAt.replace(' ', 'T')).getTime();
    if (!isNaN(t)) return t;
  }
  if (record.confirmedAt) {
    const t = new Date(record.confirmedAt.replace(' ', 'T')).getTime();
    if (!isNaN(t)) return t;
  }
  if (record.draftSavedAt) {
    const t = new Date(record.draftSavedAt.replace(' ', 'T')).getTime();
    if (!isNaN(t)) return t;
  }
  if (record.auditTrail && record.auditTrail.length > 0) {
    let maxTime = 0;
    for (const ev of record.auditTrail) {
      if (ev.timestamp) {
        const t = new Date(ev.timestamp.replace(' ', 'T')).getTime();
        if (!isNaN(t) && t > maxTime) {
          maxTime = t;
        }
      }
    }
    if (maxTime > 0) return maxTime;
  }
  const dateStr = record.newImageDate || record.referenceDate;
  if (dateStr) {
    const t = new Date(dateStr.replace(' ', 'T')).getTime();
    if (!isNaN(t)) return t;
  }
  return 0;
}
