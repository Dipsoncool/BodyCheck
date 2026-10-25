import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LoginView } from './components/LoginView';
import { DashboardView } from './components/DashboardView';
import { NewCheckView } from './components/NewCheckView';
import { AnalysisReviewView } from './components/AnalysisReviewView';
import { HistoryView } from './components/HistoryView';
import { DetailView } from './components/DetailView';
import { BodyCheckRecord, PatientRecord, AnalysisResult, BodyRegion } from './types/bodyCheck';
import { UserProfile } from './types/auth';
import { MOCK_PATIENTS } from './data/mockRecords';
import { analyzeBodyCheck, PROCESSING_STAGES } from './services/analysisService';
import { bodyCheckService } from './services/bodyCheckService';
import { authService } from './services/authService';

const ACTIVE_TAB_STORAGE_KEY = 'bodycheck_active_tab';

export const App: React.FC = () => {
  // Explicit Authentication Hydration State
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      return authService.getCurrentUser();
    } catch {
      return null;
    }
  });

  useEffect(() => {
    // Explicit authentication initialization / hydration lifecycle
    try {
      const persistedUser = authService.getCurrentUser();
      if (persistedUser) {
        setCurrentUser(persistedUser);
      }
    } catch (err) {
      console.warn('Session hydration error:', err);
    } finally {
      setIsAuthLoading(false);
    }
  }, []);

  // Navigation State with session tab persistence
  const [currentTab, setCurrentTabState] = useState<
    'dashboard' | 'new-check' | 'review' | 'history' | 'detail'
  >(() => {
    try {
      const savedTab = sessionStorage.getItem(ACTIVE_TAB_STORAGE_KEY);
      if (savedTab === 'new-check' || savedTab === 'history' || savedTab === 'dashboard') {
        return savedTab;
      }
    } catch {
      // Ignore
    }
    return 'dashboard';
  });

  const setCurrentTab = (tab: 'dashboard' | 'new-check' | 'review' | 'history' | 'detail') => {
    setCurrentTabState(tab);
    try {
      sessionStorage.setItem(ACTIVE_TAB_STORAGE_KEY, tab);
    } catch (e) {
      console.warn('Failed to persist active tab:', e);
    }
  };

  // Stored Records State managed via bodyCheckService
  const [records, setRecords] = useState<BodyCheckRecord[]>(() => {
    return bodyCheckService.getRecords();
  });

  const [patients] = useState<PatientRecord[]>(MOCK_PATIENTS);
  const [selectedPatientId, setSelectedPatientId] = useState<string | undefined>(undefined);
  const [selectedRecordForDetail, setSelectedRecordForDetail] = useState<BodyCheckRecord | null>(null);

  // Active Comparison / Analysis Flow State
  const [activeAnalysisData, setActiveAnalysisData] = useState<{
    recordId?: string;
    patientRecordId: string;
    referenceImage: string;
    referenceImageId: string;
    referenceDate: string;
    newImage: string;
    newImageId: string;
    newImageDate: string;
    bodyRegion: BodyRegion;
  }>({
    patientRecordId: '',
    referenceImage: '',
    referenceImageId: '',
    referenceDate: '',
    newImage: '',
    newImageId: '',
    newImageDate: '',
    bodyRegion: 'Left Shoulder'
  });

  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [currentProcessingStageIndex, setCurrentProcessingStageIndex] = useState<number>(0);
  const [currentProcessingStageName, setCurrentProcessingStageName] = useState<string>('');
  const [analysisProgressPercent, setAnalysisProgressPercent] = useState<number>(0);

  // Handle Login
  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    setCurrentTab('dashboard');
  };

  // Handle Logout
  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setCurrentTab('dashboard');
  };

  // Handler to start new check from dashboard or history
  const handleStartNewCheck = (patientId?: string) => {
    setSelectedPatientId(patientId);
    setCurrentTab('new-check');
  };

  // Handler triggered when user clicks "Analyze Images"
  const handleAnalyze = async (params: {
    recordId?: string;
    patientRecordId: string;
    referenceImage: string;
    referenceImageId: string;
    referenceDate: string;
    newImage: string;
    newImageId: string;
    newImageDate: string;
    bodyRegion: BodyRegion;
  }) => {
    // Find existing matching record if any
    const existingRecord = bodyCheckService.getRecords().find(
      r => (params.recordId && r.id === params.recordId) ||
           (r.patientRecordId === params.patientRecordId && 
            r.bodyRegion === params.bodyRegion && 
            (r.status === 'not_analyzed' || r.status === 'ready_to_analyze'))
    );
    const recordId = params.recordId || (existingRecord ? existingRecord.id : bodyCheckService.generateCheckId());

    setActiveAnalysisData({ ...params, recordId });
    setCurrentTab('review');
    setIsAnalyzing(true);
    setCurrentAnalysis(null);
    setCurrentProcessingStageIndex(0);
    setCurrentProcessingStageName(PROCESSING_STAGES[0]);
    setAnalysisProgressPercent(10);

    try {
      const result = await analyzeBodyCheck({
        ...params,
        onProgress: (stageIndex, stageName, percent) => {
          setCurrentProcessingStageIndex(stageIndex);
          setCurrentProcessingStageName(stageName);
          setAnalysisProgressPercent(percent);
        }
      });
      setCurrentAnalysis(result);

      // Register the completed analysis as an actionable pending check (Ready for Review)
      const nowStr = bodyCheckService.getCurrentTimestamp();

      const baseAudit = existingRecord?.auditTrail && existingRecord.auditTrail.length > 0
        ? existingRecord.auditTrail
        : [
            {
              id: `aud-${Date.now()}-1`,
              timestamp: params.referenceDate,
              actor: 'System',
              actorRole: 'Baseline Intake',
              action: 'Baseline image registered',
              details: `Reference image ${params.referenceImageId} established.`
            }
          ];

      const pendingRecord: BodyCheckRecord = {
        id: recordId,
        patientRecordId: params.patientRecordId,
        patientName: existingRecord?.patientName || `Record ${params.patientRecordId}`,
        referenceImage: params.referenceImage,
        referenceImageId: params.referenceImageId,
        referenceDate: params.referenceDate,
        newImage: params.newImage,
        newImageId: params.newImageId,
        newImageDate: params.newImageDate,
        bodyRegion: result.bodyRegion,
        changeType: result.changeType,
        finding: result.finding,
        confidence: result.confidence,
        confidenceScore: result.confidenceScore,
        candidateFinding: result.candidateFinding,
        aiObservation: result.aiObservation,
        finalObservation: '',
        status: 'ready_for_review',
        deltaRegion: result.deltaRegion,
        changeCoordinates: result.changeCoordinates,
        updatedAt: nowStr,
        createdAt: existingRecord?.createdAt || nowStr,
        auditTrail: [
          {
            id: `aud-${Date.now()}-3`,
            timestamp: nowStr,
            actor: 'System',
            actorRole: 'Comparative Analysis',
            action: 'Comparative analysis completed',
            details: `Candidate finding identified: ${result.finding} (${result.confidence} confidence). AI draft generated.`
          },
          {
            id: `aud-${Date.now()}-2`,
            timestamp: params.newImageDate,
            actor: currentUser?.name || 'Reviewer',
            actorRole: currentUser?.role || 'Reviewer',
            action: 'Review check initiated',
            details: `New review image ${params.newImageId} registered for ${result.bodyRegion}.`
          },
          ...baseAudit
        ]
      };

      bodyCheckService.saveNewCheck(pendingRecord);
      setRecords(bodyCheckService.getRecords());
    } catch (err) {
      console.error('Analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handler when user saves a check without immediate analysis (Ready to Analyze)
  const handleSaveReadyToAnalyze = (params: {
    patientRecordId: string;
    referenceImage: string;
    referenceImageId: string;
    referenceDate: string;
    newImage: string;
    newImageId: string;
    newImageDate: string;
    bodyRegion: BodyRegion;
  }) => {
    const nowStr = bodyCheckService.getCurrentTimestamp();
    const existing = bodyCheckService.getRecords().find(
      r => r.patientRecordId === params.patientRecordId &&
           r.bodyRegion === params.bodyRegion &&
           r.status === 'not_analyzed'
    );
    const recordId = existing ? existing.id : bodyCheckService.generateCheckId();

    const record: BodyCheckRecord = {
      id: recordId,
      patientRecordId: params.patientRecordId,
      patientName: existing?.patientName || `Record ${params.patientRecordId}`,
      referenceImage: params.referenceImage,
      referenceImageId: params.referenceImageId,
      referenceDate: params.referenceDate,
      newImage: params.newImage,
      newImageId: params.newImageId,
      newImageDate: params.newImageDate,
      bodyRegion: params.bodyRegion,
      finding: '',
      aiObservation: '',
      finalObservation: '',
      status: 'ready_to_analyze',
      updatedAt: nowStr,
      createdAt: existing?.createdAt || nowStr,
      auditTrail: [
        {
          id: `aud-${Date.now()}-2`,
          timestamp: nowStr,
          actor: currentUser?.name || 'Reviewer',
          actorRole: currentUser?.role || 'Reviewer',
          action: 'Review photograph registered',
          details: `Review photograph ${params.newImageId} registered for ${params.bodyRegion}. Ready for comparative analysis.`
        },
        ...(existing?.auditTrail || [
          {
            id: `aud-${Date.now()}-1`,
            timestamp: params.referenceDate,
            actor: 'System',
            actorRole: 'Baseline Intake',
            action: 'Baseline image registered',
            details: `Reference image ${params.referenceImageId} established.`
          }
        ])
      ]
    };

    bodyCheckService.saveNewCheck(record);
    setRecords(bodyCheckService.getRecords());
    setCurrentTab('dashboard');
  };

  // Handler when reviewer confirms observation
  const handleSaveConfirmedRecord = (confirmedRecord: BodyCheckRecord) => {
    const nowStr = bodyCheckService.getCurrentTimestamp();
    const recordToSave = {
      ...confirmedRecord,
      updatedAt: confirmedRecord.updatedAt || nowStr
    };
    bodyCheckService.saveNewCheck(recordToSave);
    setRecords(bodyCheckService.getRecords());
    setSelectedRecordForDetail(recordToSave);
  };

  // Handler to inspect record details
  const handleOpenRecord = (record: BodyCheckRecord) => {
    setSelectedRecordForDetail(record);
    setCurrentTab('detail');
  };

  // Reset sample records
  const handleResetData = () => {
    if (window.confirm('Reset records back to initial default state?')) {
      const reset = bodyCheckService.resetToDemoData();
      setRecords(reset);
    }
  };

  // Handler when user clicks "Start Analysis" from Dashboard/History/Detail
  const handleStartAnalysis = (record: BodyCheckRecord) => {
    if (record.newImage) {
      handleAnalyze({
        recordId: record.id,
        patientRecordId: record.patientRecordId,
        referenceImage: record.referenceImage,
        referenceImageId: record.referenceImageId,
        referenceDate: record.referenceDate,
        newImage: record.newImage,
        newImageId: record.newImageId || 'REV-01',
        newImageDate: record.newImageDate || new Date().toISOString().slice(0, 16).replace('T', ' '),
        bodyRegion: record.bodyRegion
      });
    } else {
      handleStartNewCheck(record.patientRecordId);
    }
  };

  // Handler when user clicks "View Progress"
  const handleViewProgress = (record: BodyCheckRecord) => {
    if (record.newImage) {
      handleAnalyze({
        patientRecordId: record.patientRecordId,
        referenceImage: record.referenceImage,
        referenceImageId: record.referenceImageId,
        referenceDate: record.referenceDate,
        newImage: record.newImage,
        newImageId: record.newImageId || 'REV-01',
        newImageDate: record.newImageDate || new Date().toISOString().slice(0, 16).replace('T', ' '),
        bodyRegion: record.bodyRegion
      });
    } else {
      handleOpenRecord(record);
    }
  };

  const pendingCount = records.filter(
    r => r.status === 'ai_draft_ready' || r.status === 'ready_for_review'
  ).length;

  // Session Initialization Loading State (prevents flash of /login)
  if (isAuthLoading && !currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-slate-300 border-t-sky-700 rounded-full animate-spin"></div>
          <span className="text-xs font-mono text-slate-500">Restoring session...</span>
        </div>
      </div>
    );
  }

  // Route Protection: If unauthenticated, always render LoginView
  if (!currentUser) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  // Authenticated Application Shell
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      
      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab}
        onNavigate={(tab) => {
          if (tab === 'new-check') {
            setSelectedPatientId(undefined);
          }
          setCurrentTab(tab);
        }}
        onResetData={handleResetData}
        totalChecksCount={records.length}
        pendingChecksCount={pendingCount}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Body Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {currentTab === 'dashboard' && (
          <DashboardView
            patients={patients}
            records={records}
            onStartNewCheck={handleStartNewCheck}
            onOpenRecord={handleOpenRecord}
            onStartAnalysis={handleStartAnalysis}
            onViewProgress={handleViewProgress}
          />
        )}

        {currentTab === 'new-check' && (
          <NewCheckView
            patients={patients}
            initialPatientId={selectedPatientId}
            onAnalyze={handleAnalyze}
            onSaveReadyToAnalyze={handleSaveReadyToAnalyze}
            onCancel={() => {
              setSelectedPatientId(undefined);
              setCurrentTab('dashboard');
            }}
          />
        )}

        {currentTab === 'review' && (
          <AnalysisReviewView
            recordId={activeAnalysisData.recordId}
            referenceImage={activeAnalysisData.referenceImage}
            referenceImageId={activeAnalysisData.referenceImageId}
            referenceDate={activeAnalysisData.referenceDate}
            newImage={activeAnalysisData.newImage}
            newImageId={activeAnalysisData.newImageId}
            newImageDate={activeAnalysisData.newImageDate}
            patientRecordId={activeAnalysisData.patientRecordId}
            analysis={currentAnalysis}
            isAnalyzing={isAnalyzing}
            currentProcessingStageIndex={currentProcessingStageIndex}
            currentProcessingStageName={currentProcessingStageName}
            analysisProgressPercent={analysisProgressPercent}
            currentUser={currentUser}
            onSaveConfirmed={handleSaveConfirmedRecord}
            onBackToNew={() => setCurrentTab('new-check')}
            onNavigateHistory={() => setCurrentTab('history')}
            onNavigateDashboard={() => setCurrentTab('dashboard')}
          />
        )}

        {currentTab === 'history' && (
          <HistoryView
            records={records}
            onOpenRecord={handleOpenRecord}
            onStartNewCheck={() => handleStartNewCheck()}
            onStartAnalysis={handleStartAnalysis}
            onViewProgress={handleViewProgress}
          />
        )}

        {currentTab === 'detail' && selectedRecordForDetail && (
          <DetailView
            record={selectedRecordForDetail}
            currentUser={currentUser}
            onBack={() => setCurrentTab('history')}
            onConfirmRecord={(updatedRecord) => {
              const nowStr = bodyCheckService.getCurrentTimestamp();
              const recordToSave = {
                ...updatedRecord,
                updatedAt: nowStr
              };
              bodyCheckService.saveNewCheck(recordToSave);
              setRecords(bodyCheckService.getRecords());
              setSelectedRecordForDetail(recordToSave);
            }}
            onStartAnalysis={handleStartAnalysis}
            onViewProgress={handleViewProgress}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-4 text-center text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">Body Check</span>
            <span className="text-slate-300">•</span>
            <span>Visual Comparison & Documentation</span>
          </div>
          <div className="flex items-center gap-3 font-mono text-[11px] text-slate-500">
            <span className="hidden md:inline">Logged in as {currentUser.email}</span>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default App;
