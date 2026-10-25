import React, { useState } from 'react';
import { BodyCheckRecord } from '../types/bodyCheck';
import { 
  Search, 
  Calendar, 
  FileText, 
  PlusCircle,
  Loader2,
  PlayCircle
} from 'lucide-react';
import { 
  renderStatusBadge, 
  getActionLabel, 
  getReviewerDisplay, 
  getFindingSummaryDisplay,
  getRecordActivityTimestamp
} from '../utils/statusUtils';

interface HistoryViewProps {
  records: BodyCheckRecord[];
  onOpenRecord: (record: BodyCheckRecord) => void;
  onStartNewCheck: (patientId?: string) => void;
  onStartAnalysis?: (record: BodyCheckRecord) => void;
  onViewProgress?: (record: BodyCheckRecord) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  records,
  onOpenRecord,
  onStartNewCheck,
  onStartAnalysis,
  onViewProgress
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'confirmed' | 'ready_for_review' | 'processing' | 'ready_to_analyze' | 'not_analyzed'>('all');
  const [regionFilter, setRegionFilter] = useState<string>('all');

  // Filter and sort records dynamically by latest activity
  const filteredRecords = records
    .filter(record => {
      const matchesSearch = 
        record.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.patientRecordId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (record.finding ? record.finding.toLowerCase().includes(searchTerm.toLowerCase()) : false) ||
        (record.reviewer && record.reviewer.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (record.finalObservation && record.finalObservation.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = 
        statusFilter === 'all' || 
        (statusFilter === 'confirmed' && record.status === 'confirmed') ||
        (statusFilter === 'ready_for_review' && (record.status === 'ready_for_review' || record.status === 'ai_draft_ready' || record.status === 'human_review')) ||
        (statusFilter === 'processing' && record.status === 'processing') ||
        (statusFilter === 'ready_to_analyze' && record.status === 'ready_to_analyze') ||
        (statusFilter === 'not_analyzed' && record.status === 'not_analyzed');
      const matchesRegion = regionFilter === 'all' || record.bodyRegion === regionFilter;

      return matchesSearch && matchesStatus && matchesRegion;
    })
    .sort((a, b) => getRecordActivityTimestamp(b) - getRecordActivityTimestamp(a));

  const uniqueRegions = Array.from(new Set(records.map(r => r.bodyRegion)));

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Body Check History</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Previous body-check records and comparison results.
          </p>
        </div>

        <button
          onClick={() => onStartNewCheck()}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-sky-700 hover:bg-sky-800 text-white text-xs font-semibold rounded shadow-sm transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Body Check</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by ID, finding, observation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-slate-800 focus:ring-1 focus:ring-sky-500"
            >
              <option value="all">All Statuses ({records.length})</option>
              <option value="confirmed">Confirmed</option>
              <option value="ready_for_review">Ready for Review</option>
              <option value="processing">Processing</option>
              <option value="ready_to_analyze">Ready to Analyze</option>
              <option value="not_analyzed">Not Analyzed</option>
            </select>
          </div>

          {/* Region Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Region:</span>
            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-slate-800 focus:ring-1 focus:ring-sky-500"
            >
              <option value="all">All Regions</option>
              {uniqueRegions.map(reg => (
                <option key={reg} value={reg}>{reg}</option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* Records Table */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        {filteredRecords.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <FileText className="w-10 h-10 mx-auto text-slate-300 mb-3" />
            <p className="text-sm font-medium text-slate-700">No matching body check records found.</p>
            <p className="text-xs text-slate-400 mt-1">Try resetting your filters or search keywords.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
              <thead className="bg-slate-50 font-semibold text-slate-600">
                <tr>
                  <th scope="col" className="px-4 py-3">Record ID & Date</th>
                  <th scope="col" className="px-4 py-3">Patient</th>
                  <th scope="col" className="px-4 py-3">Images (Ref / New)</th>
                  <th scope="col" className="px-4 py-3">Body Region</th>
                  <th scope="col" className="px-4 py-3">Observation Summary</th>
                  <th scope="col" className="px-4 py-3">Reviewer Status</th>
                  <th scope="col" className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {filteredRecords.map((record) => {
                  const summary = getFindingSummaryDisplay(record);
                  const reviewerInfo = getReviewerDisplay(record);
                  const actionLabel = getActionLabel(record.status);

                  return (
                    <tr 
                      key={record.id} 
                      onClick={() => onOpenRecord(record)}
                      className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                    >
                      
                      {/* Record ID & Date */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="font-mono font-bold text-slate-900">{record.id}</div>
                        <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {record.newImageDate || record.referenceDate}
                        </div>
                      </td>

                      {/* Patient ID */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="font-mono font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-300">
                          {record.patientRecordId}
                        </span>
                      </td>

                      {/* Side-by-Side Visual Thumbnails */}
                      <td className="px-4 py-3.5 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-2">
                          <div className="relative group">
                            <img
                              src={record.referenceImage}
                              alt="Ref"
                              className="w-12 h-9 object-cover rounded border border-slate-300 bg-slate-900"
                            />
                            <span className="absolute bottom-0 left-0 bg-slate-900/90 text-[8px] text-white px-1 font-mono">
                              REF
                            </span>
                          </div>
                          <span className="text-slate-400">→</span>
                          {record.newImage ? (
                            <div className="relative group">
                              <img
                                src={record.newImage}
                                alt="New"
                                className="w-12 h-9 object-cover rounded border border-slate-300 bg-slate-900"
                              />
                              <span className="absolute bottom-0 left-0 bg-sky-900/90 text-[8px] text-white px-1 font-mono">
                                NEW
                              </span>
                            </div>
                          ) : (
                            <div 
                              className="w-12 h-9 rounded border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center text-[9px] text-slate-400 font-mono"
                              title="Awaiting review photograph"
                            >
                              None
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Body Region */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="font-medium text-slate-800">{record.bodyRegion}</span>
                        {record.status !== 'not_analyzed' && record.changeType && (
                          <div className="text-[10px] text-slate-500 truncate">{record.changeType}</div>
                        )}
                      </td>

                      {/* Observation Summary */}
                      <td className="px-4 py-3.5 max-w-sm">
                        {summary.isNotAnalyzed ? (
                          <div className="text-slate-400 italic text-xs">
                            {summary.title}
                          </div>
                        ) : summary.isProcessing ? (
                          <div>
                            <div className="font-medium text-sky-800 text-xs flex items-center gap-1.5">
                              <Loader2 className="w-3 h-3 text-sky-600 animate-spin shrink-0" />
                              <span className="truncate">{summary.title}</span>
                            </div>
                            <div className="text-[10px] text-slate-500 truncate mt-0.5 font-mono">
                              {summary.subtitle}
                            </div>
                          </div>
                        ) : summary.isReady ? (
                          <div>
                            <div className="font-medium text-indigo-900 text-xs flex items-center gap-1.5">
                              <PlayCircle className="w-3 h-3 text-indigo-600 shrink-0" />
                              <span className="truncate">{summary.title}</span>
                            </div>
                            <div className="text-[10px] text-slate-500 truncate mt-0.5 font-mono">
                              {summary.subtitle}
                            </div>
                          </div>
                        ) : summary.isDraft ? (
                          <div>
                            <span className="text-[9px] uppercase font-mono font-semibold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200 mr-1.5 inline-block">
                              Draft
                            </span>
                            <span className="text-slate-700 italic line-clamp-2 leading-tight">
                              {record.aiObservation}
                            </span>
                          </div>
                        ) : (
                          <div className="font-medium text-slate-900 line-clamp-2 leading-tight">
                            {record.finalObservation || record.aiObservation}
                          </div>
                        )}
                      </td>

                      {/* Reviewer Status */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div>
                          {renderStatusBadge(record.status)}
                          <div className="text-[10px] text-slate-500 mt-1 font-medium">
                            {reviewerInfo.isPending ? (
                              <span className="text-slate-400 italic">{reviewerInfo.text}</span>
                            ) : (
                              <span>{reviewerInfo.text}</span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Open / Review Action */}
                      <td className="px-4 py-3.5 whitespace-nowrap text-right">
                        {record.status === 'confirmed' ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenRecord(record);
                            }}
                            className="text-xs font-semibold text-slate-600 hover:text-slate-900 hover:underline inline-flex items-center gap-1 cursor-pointer"
                          >
                            <span>{actionLabel}</span>
                          </button>
                        ) : record.status === 'ready_for_review' || record.status === 'ai_draft_ready' || record.status === 'human_review' ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenRecord(record);
                            }}
                            className="px-2.5 py-1 text-xs font-semibold text-amber-800 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded inline-flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                          >
                            <span>{actionLabel}</span>
                          </button>
                        ) : record.status === 'processing' ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onViewProgress) onViewProgress(record);
                              else onOpenRecord(record);
                            }}
                            className="px-2.5 py-1 text-xs font-semibold text-sky-800 hover:text-sky-900 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded inline-flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                          >
                            <span>{actionLabel}</span>
                          </button>
                        ) : record.status === 'ready_to_analyze' ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onStartAnalysis) onStartAnalysis(record);
                              else onStartNewCheck(record.patientRecordId);
                            }}
                            className="px-2.5 py-1 text-xs font-semibold text-indigo-800 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded inline-flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                          >
                            <span>{actionLabel}</span>
                          </button>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onStartNewCheck(record.patientRecordId);
                            }}
                            className="px-2.5 py-1 text-xs font-semibold text-sky-800 hover:text-sky-900 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded inline-flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                          >
                            <span>{actionLabel}</span>
                          </button>
                        )}
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
