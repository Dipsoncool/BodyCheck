import { AnalysisResult, BodyRegion, CandidateFinding, ChangeType } from '../types/bodyCheck';
import { DEMO_SCENARIOS } from '../data/mockRecords';
import { detectVisualChange } from '../utils/visualChangeDetector';

export interface AnalysisParams {
  patientRecordId: string;
  referenceImage: string;
  referenceImageId?: string;
  referenceDate: string;
  newImage: string;
  newImageId?: string;
  newImageDate: string;
  bodyRegion: BodyRegion;
  onProgress?: (stageIndex: number, stageName: string, percent: number) => void;
}

export const PROCESSING_STAGES = [
  'Validating image resolution and color space',
  'Preparing comparison pair and pre-processing matrices',
  'Aligning reference and review anatomical landmarks',
  'Localizing designated body region boundaries',
  'Comparing localized visual appearance matrices',
  'Preparing structured candidate findings',
  'Generating assistive observation draft'
];

/**
 * Service abstraction for the 7-stage Body Check image comparison pipeline.
 * Simulates anatomical landmark alignment, delta extraction, and candidate finding synthesis.
 */
export async function analyzeBodyCheck(params: AnalysisParams): Promise<AnalysisResult> {
  const {
    patientRecordId,
    referenceImageId = patientRecordId,
    referenceDate,
    newImageId = `${patientRecordId}-REV-${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }).replace(':', '')}`,
    newImageDate,
    bodyRegion,
    onProgress
  } = params;

  // Execute realistic 7-stage processing progression
  const stageDelays = [320, 360, 420, 380, 450, 350, 380];
  
  for (let i = 0; i < PROCESSING_STAGES.length; i++) {
    const stageName = PROCESSING_STAGES[i];
    const percent = Math.round(((i + 1) / PROCESSING_STAGES.length) * 100);
    if (onProgress) {
      onProgress(i, stageName, percent);
    }
    await new Promise(resolve => setTimeout(resolve, stageDelays[i]));
  }

  // 1. Check for matched demonstration scenario
  // Match by exact review image URL or review image ID first so candidate scenarios for the same record are accurately resolved
  const matchedScenario =
    DEMO_SCENARIOS.find(
      s => (params.newImage && s.newImage === params.newImage) ||
           (params.newImageId && s.expectedResult.newImageId.toUpperCase() === params.newImageId.toUpperCase())
    ) ||
    DEMO_SCENARIOS.find(
      s => s.patientRecordId.toUpperCase() === patientRecordId.toUpperCase() &&
           (s.bodyRegion.toLowerCase() === bodyRegion.toLowerCase() ||
            (s.bodyRegion.includes('Back') && bodyRegion.includes('Back')) ||
            (s.bodyRegion.includes('Knee') && bodyRegion.includes('Knee')))
    ) ||
    DEMO_SCENARIOS.find(
      s => s.patientRecordId.toUpperCase() === patientRecordId.toUpperCase()
    );

  if (matchedScenario) {
    return {
      referenceImageId: matchedScenario.expectedResult.referenceImageId,
      referenceDate: matchedScenario.expectedResult.referenceDate || referenceDate,
      newImageId: newImageId || matchedScenario.expectedResult.newImageId,
      newImageDate: matchedScenario.expectedResult.newImageDate || newImageDate,
      bodyRegion: matchedScenario.expectedResult.bodyRegion,
      changeType: matchedScenario.expectedResult.changeType,
      finding: matchedScenario.expectedResult.finding,
      confidence: matchedScenario.expectedResult.confidence,
      confidenceScore: matchedScenario.expectedResult.confidenceScore,
      candidateFinding: matchedScenario.expectedResult.candidateFinding,
      aiObservation: matchedScenario.expectedResult.aiObservation,
      deltaRegion: matchedScenario.expectedResult.deltaRegion,
      changeCoordinates: matchedScenario.expectedResult.changeCoordinates
    };
  }

  // 2. Dynamic visual delta detection for custom / uploaded images
  const visualResult = await detectVisualChange(params.referenceImage, params.newImage, patientRecordId);
  const defaultChangeType: ChangeType = visualResult.detected
    ? 'Color / Skin Appearance Change'
    : 'No Significant Visible Change';
  const defaultFinding = visualResult.detected
    ? 'Visible reddish discoloration / bruise-like appearance'
    : 'Normal/no significant visible change';
  const customObservation = visualResult.detected
    ? `Reviewing the new picture against reference image ${referenceImageId}, there is a visible change in skin appearance with localized reddish discoloration in the ${bodyRegion.toLowerCase()} area, suggesting a possible bruise-like change.`
    : `Reviewing the new picture against reference image ${referenceImageId}, no significant visible change was identified in the ${bodyRegion.toLowerCase()} area.`;

  const customCandidateFinding: CandidateFinding = {
    bodyRegion,
    changeType: defaultChangeType,
    finding: defaultFinding,
    confidence: visualResult.detected ? 'Moderate' : 'High',
    confidenceScore: visualResult.detected ? 0.76 : 0.95,
    deltaRegion: visualResult.deltaRegion,
    changeCoordinates: visualResult.deltaRegion ? {
      xPercent: visualResult.deltaRegion.x * 100,
      yPercent: visualResult.deltaRegion.y * 100,
      radiusPercent: Math.round((visualResult.deltaRegion.width * 100) / 2)
    } : undefined
  };

  return {
    referenceImageId,
    referenceDate,
    newImageId,
    newImageDate,
    bodyRegion,
    changeType: defaultChangeType,
    finding: defaultFinding,
    confidence: visualResult.detected ? 'Moderate' : 'High',
    confidenceScore: visualResult.detected ? 0.76 : 0.95,
    candidateFinding: customCandidateFinding,
    aiObservation: customObservation,
    deltaRegion: visualResult.deltaRegion,
    changeCoordinates: customCandidateFinding.changeCoordinates
  };
}
