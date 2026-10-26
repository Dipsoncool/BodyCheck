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

  // 0. Explicit Identical Image Check
  const isDirectIdentical = Boolean(
    params.referenceImage &&
    params.newImage &&
    params.referenceImage === params.newImage
  );

  // 1. Check for matched demonstration scenario (ONLY when reference and review are distinct images)
  const matchedScenario = !isDirectIdentical ? (
    DEMO_SCENARIOS.find(
      s => (params.newImage && s.newImage === params.newImage && s.referenceImage === params.referenceImage) ||
        (params.newImageId && params.newImageId !== 'DIRECT-REVIEW' && s.expectedResult.newImageId.toUpperCase() === params.newImageId.toUpperCase())
    )
  ) : undefined;

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

  // 2. Dynamic visual delta detection with ML condition inference for custom / uploaded / identical images
  const visualResult = await detectVisualChange(params.referenceImage, params.newImage, patientRecordId);
  const isHealed = Boolean(visualResult.isHealed || visualResult.mlResult?.isHealed);

  const detectedChangeType: ChangeType = visualResult.predictedChangeType || (
    isHealed
      ? 'No significant visible change'
      : (visualResult.detected
        ? 'Visible color change / contusion-like discoloration'
        : 'No significant visible change')
  );

  const detectedFinding = visualResult.message || (
    isHealed
      ? 'Previous bruise/mark resolved — skin appears healed'
      : (visualResult.detected
        ? 'Localized reddish/purple bruise / contusion'
        : 'Normal / no significant visible change')
  );

  const regionLabel = (!bodyRegion || bodyRegion.toLowerCase() === 'other' || bodyRegion.toLowerCase().includes('general'))
    ? 'evaluated skin area'
    : `${bodyRegion.toLowerCase()} area`;

  let customObservation = '';
  if (visualResult.isIdenticalImage) {
    customObservation = `Confirmed identical photographs (control comparison). Both reference baseline and review images match exactly with zero differences. No visible marks or changes present.`;
  } else if (isHealed) {
    customObservation = `Comparing the review scan against reference baseline ${referenceImageId}, the previous mark/discoloration on the ${regionLabel} has cleared. The skin appears normal and healed with no active bruise or injury.`;
  } else if (visualResult.detected) {
    customObservation = `Reviewing the scan against reference baseline ${referenceImageId}, a ${detectedFinding.toLowerCase()} is visible on the ${regionLabel}. Comparison shows noticeable skin color variation in this area.`;
  } else {
    customObservation = `Reviewing the scan against reference baseline ${referenceImageId}, no visible marks, bruises, or skin changes were observed on the ${regionLabel}. Appearance remains consistent with baseline.`;
  }

  const confidenceLevel = visualResult.confidence >= 0.85 ? 'High' : (visualResult.confidence >= 0.65 ? 'Moderate' : 'Low');

  const customCandidateFinding: CandidateFinding = {
    bodyRegion,
    changeType: detectedChangeType,
    finding: detectedFinding,
    confidence: confidenceLevel,
    confidenceScore: Math.round(visualResult.confidence * 100) / 100,
    isHealed,
    deltaRegion: visualResult.deltaRegion,
    changeCoordinates: visualResult.deltaRegion ? {
      xPercent: Math.round(visualResult.deltaRegion.x * 1000) / 10,
      yPercent: Math.round(visualResult.deltaRegion.y * 1000) / 10,
      radiusPercent: Math.round((Math.max(visualResult.deltaRegion.width, visualResult.deltaRegion.height) * 100) / 2)
    } : undefined,
    mlInference: visualResult.classProbabilities ? {
      detected: visualResult.detected,
      isIdenticalImage: visualResult.isIdenticalImage,
      isHealed,
      classProbabilities: visualResult.classProbabilities,
      clinicalRationale: visualResult.clinicalRationale,
      inferenceTimeMs: visualResult.mlResult?.metrics.inferenceTimeMs,
      maxDeltaE: visualResult.mlResult?.metrics.maxDeltaE
    } : undefined
  };

  return {
    referenceImageId,
    referenceDate,
    newImageId,
    newImageDate,
    bodyRegion,
    changeType: detectedChangeType,
    finding: detectedFinding,
    confidence: confidenceLevel,
    confidenceScore: Math.round(visualResult.confidence * 100) / 100,
    isHealed,
    aiObservation: customObservation,
    candidateFinding: customCandidateFinding,
    deltaRegion: visualResult.deltaRegion,
    changeCoordinates: customCandidateFinding.changeCoordinates,
    mlInference: customCandidateFinding.mlInference
  };
}
