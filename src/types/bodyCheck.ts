export type ConfidenceLevel = 'High' | 'Moderate' | 'Low' | 'Uncertain';

export type BodyRegion = 
  | 'Left Shoulder'
  | 'Right Shoulder'
  | 'Left Upper Arm'
  | 'Right Upper Arm'
  | 'Left Forearm'
  | 'Right Forearm'
  | 'Chest'
  | 'Abdomen'
  | 'Back'
  | 'Upper Back'
  | 'Lower Back'
  | 'Left Knee'
  | 'Right Knee'
  | 'Left Thigh'
  | 'Right Thigh'
  | 'Left Lower Leg'
  | 'Right Lower Leg'
  | 'Foot'
  | 'Upper Arm'
  | 'Lower Leg'
  | 'Other';

export type ChangeType = 
  | 'Visible color change / contusion-like discoloration'
  | 'Superficial skin-surface change'
  | 'Localized swelling/contour change'
  | 'Localized erythema / skin appearance change'
  | 'Superficial linear skin change'
  | 'Localized skin-color variation'
  | 'No significant visible change'
  | 'Color / Skin Appearance Change'
  | 'Visible Bruising-like Appearance'
  | 'Tissue / Skin Appearance Difference'
  | 'Other Visible Change'
  | 'No Significant Visible Change';

export type CheckStatus = 
  | 'not_analyzed'
  | 'ready_to_analyze'
  | 'processing'
  | 'ready_for_review'
  | 'ai_draft_ready'
  | 'human_review'
  | 'confirmed';

export interface AuditEvent {
  id: string;
  timestamp: string;
  actor: string;
  actorRole: string;
  action: string;
  details?: string;
}

export interface DeltaRegion {
  x: number; // normalized center x (0 to 1) relative to image width
  y: number; // normalized center y (0 to 1) relative to image height
  width: number; // normalized width (0 to 1) relative to image width
  height: number; // normalized height (0 to 1) relative to image height
}

export interface CandidateFinding {
  bodyRegion: BodyRegion;
  changeType: ChangeType;
  finding: string;
  confidence: ConfidenceLevel;
  confidenceScore: number;
  deltaRegion?: DeltaRegion;
  changeCoordinates?: {
    xPercent: number;
    yPercent: number;
    radiusPercent: number;
  };
}

export interface BodyCheckRecord {
  id: string; // e.g. "BC-2026-0891"
  patientRecordId: string; // e.g. "IF456"
  patientName?: string;
  
  // Reference Baseline Image
  referenceImage: string;
  referenceImageId: string;
  referenceDate: string;
  
  // New / Review Image
  newImage?: string;
  newImageId?: string;
  newImageDate?: string;
  
  // Body Region & Findings
  bodyRegion: BodyRegion;
  changeType?: ChangeType;
  finding?: string;
  confidence?: ConfidenceLevel;
  confidenceScore?: number;
  candidateFinding?: CandidateFinding;
  
  // Observations
  aiObservation?: string; // Initial AI draft
  finalObservation?: string; // Reviewer-edited or confirmed observation
  draftSavedAt?: string;
  
  // Human Review Status & Governance
  status: CheckStatus;
  reviewer?: string; // e.g. "Sarah Mitchell"
  reviewerRole?: string; // e.g. "Reviewer"
  confirmedAt?: string;
  reviewerNotes?: string;
  updatedAt?: string; // Latest activity timestamp for sorting recent activity
  createdAt?: string;
  
  // Visual Reticle Coordinates & Region
  deltaRegion?: DeltaRegion;
  changeCoordinates?: {
    xPercent: number;
    yPercent: number;
    radiusPercent: number;
  };

  // Chronological Audit Activity Trail
  auditTrail: AuditEvent[];
}

export interface PatientRecord {
  id: string; // e.g. "IF456"
  name: string;
  unit: string;
  dateOfBirth?: string;
  primaryCaregiver?: string;
  lastCheckDate?: string;
  activeStatus: 'active' | 'archived';
  defaultRegion?: BodyRegion;
  availableBodyRegions?: BodyRegion[];
  referenceImage?: string;
  reviewImage?: string;
}

export interface AnalysisResult {
  referenceImageId: string;
  referenceDate: string;
  newImageId: string;
  newImageDate: string;
  bodyRegion: BodyRegion;
  changeType: ChangeType;
  finding: string;
  confidence: ConfidenceLevel;
  confidenceScore: number;
  aiObservation: string;
  candidateFinding: CandidateFinding;
  deltaRegion?: DeltaRegion;
  changeCoordinates?: {
    xPercent: number;
    yPercent: number;
    radiusPercent: number;
  };
}

export type ImageType = 'abnormal finding' | 'normal / unchanged';

export interface DemoScenario {
  id: string;
  title: string;
  patientRecordId: string;
  bodyRegion: BodyRegion;
  refSourceId?: string;
  reviewDescription?: string;
  imageType?: ImageType;
  isNew?: boolean;
  description: string;
  referenceDate: string;
  newImageDate: string;
  referenceImage: string;
  newImage: string;
  expectedResult: AnalysisResult;
}
