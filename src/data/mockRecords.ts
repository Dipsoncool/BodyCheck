import { BodyCheckRecord, PatientRecord, DemoScenario, BodyRegion, ImageType } from '../types/bodyCheck';

/**
 * Centrally managed demonstration photographic assets.
 * All images are bundled locally in public/images/body-check/ for zero external network dependency.
 */
export const BODY_CHECK_IMAGE_ASSETS = {
  if456: {
    reference: '/images/body-check/IF456/reference.webp',
    review: '/images/body-check/IF456/review.webp',
    review01: '/images/body-check/IF456/review.webp',
    review02: '/images/body-check/IF456/review-02.webp',
    review03: '/images/body-check/IF456/review-03.webp',
  },
  if455: {
    reference: '/images/body-check/IF455/reference.webp',
    review: '/images/body-check/IF455/review.webp',
    review01: '/images/body-check/IF455/review.webp',
    review02: '/images/body-check/IF455/review-02.webp',
  },
  if452: {
    reference: '/images/body-check/IF452/reference.webp',
    review: '/images/body-check/IF452/review.webp',
    review01: '/images/body-check/IF452/review.webp',
  },
  if439: {
    reference: '/images/body-check/IF439/reference.webp',
    review: '/images/body-check/IF439/review.webp',
    review01: '/images/body-check/IF439/review.webp',
    review02: '/images/body-check/IF439/review-02.webp',
  },
  if460: {
    reference: '/images/body-check/IF460/reference.webp',
    review: '/images/body-check/IF460/review.webp',
    review01: '/images/body-check/IF460/review.webp',
    review02: '/images/body-check/IF460/review-02.webp',
    review03: '/images/body-check/IF460/review-03.webp',
  },
  if461: {
    reference: '/images/body-check/IF461/reference.webp',
    review: '/images/body-check/IF461/review.webp',
    review01: '/images/body-check/IF461/review.webp',
  },
  if462: {
    reference: '/images/body-check/IF462/reference.webp',
    review: '/images/body-check/IF462/review.webp',
    review01: '/images/body-check/IF462/review.webp',
    review02: '/images/body-check/IF462/review-02.webp',
  },
  if463: {
    reference: '/images/body-check/IF463/reference.webp',
    review: '/images/body-check/IF463/review.webp',
    review01: '/images/body-check/IF463/review.webp',
    review02: '/images/body-check/IF463/review-02.webp',
  }
};

// Aliased for backwards compatibility
export const DEMO_ASSETS = BODY_CHECK_IMAGE_ASSETS;

// Built-in synthetic test scenarios using realistic photographic demonstration images
export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: 'scenario-if456-01',
    title: 'IF456 — Left Shoulder (Localized bruise/contusion over shoulder/deltoid ridge)',
    patientRecordId: 'IF456',
    bodyRegion: 'Left Shoulder',
    refSourceId: 'REF-001',
    reviewDescription: 'Localized reddish/purple bruise/contusion over the shoulder/deltoid ridge',
    imageType: 'abnormal finding',
    isNew: true,
    description: 'Comparison of the review image with the reference image shows a localized reddish-purple bruise/contusion over the left shoulder/deltoid ridge.',
    referenceDate: '2026-09-14 09:30',
    newImageDate: '2026-09-21 14:15',
    referenceImage: BODY_CHECK_IMAGE_ASSETS.if456.reference,
    newImage: BODY_CHECK_IMAGE_ASSETS.if456.review01,
    expectedResult: {
      referenceImageId: 'IF456',
      referenceDate: '2026-09-14 09:30',
      newImageId: 'IF456-REV-01',
      newImageDate: '2026-09-21 14:15',
      bodyRegion: 'Left Shoulder',
      changeType: 'Visible color change / contusion-like discoloration',
      finding: 'Localized reddish/purple bruise/contusion over the shoulder/deltoid ridge',
      confidence: 'Moderate',
      confidenceScore: 0.78,
      candidateFinding: {
        bodyRegion: 'Left Shoulder',
        changeType: 'Visible color change / contusion-like discoloration',
        finding: 'Localized reddish/purple bruise/contusion over the shoulder/deltoid ridge',
        confidence: 'Moderate',
        confidenceScore: 0.78,
        deltaRegion: {
          x: 0.456,
          y: 0.428,
          width: 0.150,
          height: 0.190
        },
        changeCoordinates: {
          xPercent: 45.6,
          yPercent: 42.8,
          radiusPercent: 10
        }
      },
      aiObservation: 'Comparison of the review image with the reference image shows a localized reddish-purple bruise/contusion over the left shoulder/deltoid ridge.',
      deltaRegion: {
        x: 0.456,
        y: 0.428,
        width: 0.150,
        height: 0.190
      },
      changeCoordinates: {
        xPercent: 45.6,
        yPercent: 42.8,
        radiusPercent: 10
      }
    }
  },

  {
    id: 'scenario-if456-02',
    title: 'IF456 — Left Shoulder (Mild localized erythema/redness)',
    patientRecordId: 'IF456',
    bodyRegion: 'Left Shoulder',
    refSourceId: 'REF-001',
    reviewDescription: 'Mild localized erythema/redness',
    imageType: 'abnormal finding',
    isNew: true,
    description: 'Comparison of the review image with the reference image shows mild localized erythema/redness over the left deltoid region.',
    referenceDate: '2026-09-14 09:30',
    newImageDate: '2026-09-21 14:20',
    referenceImage: BODY_CHECK_IMAGE_ASSETS.if456.reference,
    newImage: BODY_CHECK_IMAGE_ASSETS.if456.review02,
    expectedResult: {
      referenceImageId: 'IF456',
      referenceDate: '2026-09-14 09:30',
      newImageId: 'IF456-REV-02',
      newImageDate: '2026-09-21 14:20',
      bodyRegion: 'Left Shoulder',
      changeType: 'Localized erythema / skin appearance change',
      finding: 'Mild localized erythema/redness',
      confidence: 'Moderate',
      confidenceScore: 0.81,
      candidateFinding: {
        bodyRegion: 'Left Shoulder',
        changeType: 'Localized erythema / skin appearance change',
        finding: 'Mild localized erythema/redness',
        confidence: 'Moderate',
        confidenceScore: 0.81,
        deltaRegion: {
          x: 0.456,
          y: 0.428,
          width: 0.150,
          height: 0.190
        },
        changeCoordinates: {
          xPercent: 45.6,
          yPercent: 42.8,
          radiusPercent: 10
        }
      },
      aiObservation: 'Comparison of the review image with the reference image shows mild localized erythema/redness over the left deltoid region.',
      deltaRegion: {
        x: 0.456,
        y: 0.428,
        width: 0.150,
        height: 0.190
      },
      changeCoordinates: {
        xPercent: 45.6,
        yPercent: 42.8,
        radiusPercent: 10
      }
    }
  },

  {
    id: 'scenario-if456-03',
    title: 'IF456 — Left Shoulder (Normal / unchanged)',
    patientRecordId: 'IF456',
    bodyRegion: 'Left Shoulder',
    refSourceId: 'REF-001',
    reviewDescription: 'Normal/no significant visible change',
    imageType: 'normal / unchanged',
    isNew: false,
    description: 'No significant visible change identified between the reference and review images in the assessed left shoulder region.',
    referenceDate: '2026-09-14 09:30',
    newImageDate: '2026-09-21 14:30',
    referenceImage: BODY_CHECK_IMAGE_ASSETS.if456.reference,
    newImage: BODY_CHECK_IMAGE_ASSETS.if456.review03,
    expectedResult: {
      referenceImageId: 'IF456',
      referenceDate: '2026-09-14 09:30',
      newImageId: 'IF456-REV-03',
      newImageDate: '2026-09-21 14:30',
      bodyRegion: 'Left Shoulder',
      changeType: 'No significant visible change',
      finding: 'Normal/no significant visible change',
      confidence: 'High',
      confidenceScore: 0.95,
      candidateFinding: {
        bodyRegion: 'Left Shoulder',
        changeType: 'No significant visible change',
        finding: 'Normal/no significant visible change',
        confidence: 'High',
        confidenceScore: 0.95
      },
      aiObservation: 'No significant visible change identified between the reference and review images in the assessed left shoulder region.'
    }
  },

  {
    id: 'scenario-if455-01',
    title: 'IF455 — Right Forearm (Reddish-purple localized bruising over mid-shaft volar forearm)',
    patientRecordId: 'IF455',
    bodyRegion: 'Right Forearm',
    refSourceId: 'REF-005',
    reviewDescription: 'Reddish-purple localized bruising over the mid-shaft volar forearm',
    imageType: 'abnormal finding',
    isNew: true,
    description: 'Comparison of the review image with the reference image shows reddish-purple localized bruising over the mid-shaft volar forearm.',
    referenceDate: '2026-09-10 11:00',
    newImageDate: '2026-09-21 10:45',
    referenceImage: BODY_CHECK_IMAGE_ASSETS.if455.reference,
    newImage: BODY_CHECK_IMAGE_ASSETS.if455.review01,
    expectedResult: {
      referenceImageId: 'IF455',
      referenceDate: '2026-09-10 11:00',
      newImageId: 'IF455-REV-01',
      newImageDate: '2026-09-21 10:45',
      bodyRegion: 'Right Forearm',
      changeType: 'Visible color change / contusion-like discoloration',
      finding: 'Reddish-purple localized bruising over the mid-shaft volar forearm',
      confidence: 'High',
      confidenceScore: 0.89,
      candidateFinding: {
        bodyRegion: 'Right Forearm',
        changeType: 'Visible color change / contusion-like discoloration',
        finding: 'Reddish-purple localized bruising over the mid-shaft volar forearm',
        confidence: 'High',
        confidenceScore: 0.89,
        deltaRegion: {
          x: 0.424,
          y: 0.479,
          width: 0.180,
          height: 0.170
        },
        changeCoordinates: {
          xPercent: 42.4,
          yPercent: 47.9,
          radiusPercent: 9
        }
      },
      aiObservation: 'Comparison of the review image with the reference image shows reddish-purple localized bruising over the mid-shaft volar forearm.',
      deltaRegion: {
        x: 0.424,
        y: 0.479,
        width: 0.180,
        height: 0.170
      },
      changeCoordinates: {
        xPercent: 42.4,
        yPercent: 47.9,
        radiusPercent: 9
      }
    }
  },

  {
    id: 'scenario-if455-02',
    title: 'IF455 — Right Forearm (Resolving bruise with yellowish/brown peripheral discoloration)',
    patientRecordId: 'IF455',
    bodyRegion: 'Right Forearm',
    refSourceId: 'REF-005',
    reviewDescription: 'Resolving bruise with subtler yellowish/brown peripheral discoloration',
    imageType: 'abnormal finding',
    isNew: true,
    description: 'Comparison of the review image with the reference image shows a resolving bruise with subtler yellowish/brown peripheral discoloration on the right forearm.',
    referenceDate: '2026-09-10 11:00',
    newImageDate: '2026-09-21 10:50',
    referenceImage: BODY_CHECK_IMAGE_ASSETS.if455.reference,
    newImage: BODY_CHECK_IMAGE_ASSETS.if455.review02,
    expectedResult: {
      referenceImageId: 'IF455',
      referenceDate: '2026-09-10 11:00',
      newImageId: 'IF455-REV-02',
      newImageDate: '2026-09-21 10:50',
      bodyRegion: 'Right Forearm',
      changeType: 'Localized skin-color variation',
      finding: 'Resolving bruise with subtler yellowish/brown peripheral discoloration',
      confidence: 'Moderate',
      confidenceScore: 0.84,
      candidateFinding: {
        bodyRegion: 'Right Forearm',
        changeType: 'Localized skin-color variation',
        finding: 'Resolving bruise with subtler yellowish/brown peripheral discoloration',
        confidence: 'Moderate',
        confidenceScore: 0.84,
        deltaRegion: {
          x: 0.424,
          y: 0.479,
          width: 0.180,
          height: 0.170
        },
        changeCoordinates: {
          xPercent: 42.4,
          yPercent: 47.9,
          radiusPercent: 9
        }
      },
      aiObservation: 'Comparison of the review image with the reference image shows a resolving bruise with subtler yellowish/brown peripheral discoloration on the right forearm.',
      deltaRegion: {
        x: 0.424,
        y: 0.479,
        width: 0.180,
        height: 0.170
      },
      changeCoordinates: {
        xPercent: 42.4,
        yPercent: 47.9,
        radiusPercent: 9
      }
    }
  },

  {
    id: 'scenario-if452-01',
    title: 'IF452 — Back (Normal / no significant visible change)',
    patientRecordId: 'IF452',
    bodyRegion: 'Back',
    refSourceId: 'REF-001',
    reviewDescription: 'Normal/no significant visible change',
    imageType: 'normal / unchanged',
    isNew: false,
    description: 'No significant visible change identified between the reference and review images in the assessed back region.',
    referenceDate: '2026-09-08 16:20',
    newImageDate: '2026-09-21 15:00',
    referenceImage: BODY_CHECK_IMAGE_ASSETS.if452.reference,
    newImage: BODY_CHECK_IMAGE_ASSETS.if452.review01,
    expectedResult: {
      referenceImageId: 'IF452',
      referenceDate: '2026-09-08 16:20',
      newImageId: 'IF452-REV-01',
      newImageDate: '2026-09-21 15:00',
      bodyRegion: 'Back',
      changeType: 'No significant visible change',
      finding: 'Normal/no significant visible change',
      confidence: 'High',
      confidenceScore: 0.96,
      candidateFinding: {
        bodyRegion: 'Back',
        changeType: 'No significant visible change',
        finding: 'Normal/no significant visible change',
        confidence: 'High',
        confidenceScore: 0.96
      },
      aiObservation: 'No significant visible change identified between the reference and review images in the assessed back region.'
    }
  },

  {
    id: 'scenario-if439-01',
    title: 'IF439 — Right Lower Leg (Localized reddish/purple discoloration below patella)',
    patientRecordId: 'IF439',
    bodyRegion: 'Right Lower Leg',
    refSourceId: 'REF-008',
    reviewDescription: 'Localized reddish/purple discoloration below the patella/proximal tibial region',
    imageType: 'abnormal finding',
    isNew: true,
    description: 'Comparison of the review image with the reference image shows localized reddish/purple discoloration below the patella/proximal tibial region.',
    referenceDate: '2026-09-12 13:10',
    newImageDate: '2026-09-20 16:30',
    referenceImage: BODY_CHECK_IMAGE_ASSETS.if439.reference,
    newImage: BODY_CHECK_IMAGE_ASSETS.if439.review01,
    expectedResult: {
      referenceImageId: 'IF439',
      referenceDate: '2026-09-12 13:10',
      newImageId: 'IF439-REV-01',
      newImageDate: '2026-09-20 16:30',
      bodyRegion: 'Right Lower Leg',
      changeType: 'Visible color change / contusion-like discoloration',
      finding: 'Localized reddish/purple discoloration below the patella/proximal tibial region',
      confidence: 'Moderate',
      confidenceScore: 0.77,
      candidateFinding: {
        bodyRegion: 'Right Lower Leg',
        changeType: 'Visible color change / contusion-like discoloration',
        finding: 'Localized reddish/purple discoloration below the patella/proximal tibial region',
        confidence: 'Moderate',
        confidenceScore: 0.77,
        deltaRegion: {
          x: 0.471,
          y: 0.246,
          width: 0.088,
          height: 0.138
        },
        changeCoordinates: {
          xPercent: 47.1,
          yPercent: 24.6,
          radiusPercent: 7
        }
      },
      aiObservation: 'Comparison of the review image with the reference image shows localized reddish/purple discoloration below the patella/proximal tibial region.',
      deltaRegion: {
        x: 0.471,
        y: 0.246,
        width: 0.088,
        height: 0.138
      },
      changeCoordinates: {
        xPercent: 47.1,
        yPercent: 24.6,
        radiusPercent: 7
      }
    }
  },

  {
    id: 'scenario-if439-02',
    title: 'IF439 — Right Lower Leg (Resolving discoloration with softer yellowish-tan appearance)',
    patientRecordId: 'IF439',
    bodyRegion: 'Right Lower Leg',
    refSourceId: 'REF-008',
    reviewDescription: 'Resolving discoloration with a softer yellowish-tan appearance',
    imageType: 'abnormal finding',
    isNew: true,
    description: 'Comparison of the review image with the reference image shows resolving discoloration with a softer yellowish-tan appearance on the right lower leg.',
    referenceDate: '2026-09-12 13:10',
    newImageDate: '2026-09-20 16:40',
    referenceImage: BODY_CHECK_IMAGE_ASSETS.if439.reference,
    newImage: BODY_CHECK_IMAGE_ASSETS.if439.review02,
    expectedResult: {
      referenceImageId: 'IF439',
      referenceDate: '2026-09-12 13:10',
      newImageId: 'IF439-REV-02',
      newImageDate: '2026-09-20 16:40',
      bodyRegion: 'Right Lower Leg',
      changeType: 'Localized skin-color variation',
      finding: 'Resolving discoloration with a softer yellowish-tan appearance',
      confidence: 'Moderate',
      confidenceScore: 0.74,
      candidateFinding: {
        bodyRegion: 'Right Lower Leg',
        changeType: 'Localized skin-color variation',
        finding: 'Resolving discoloration with a softer yellowish-tan appearance',
        confidence: 'Moderate',
        confidenceScore: 0.74,
        deltaRegion: {
          x: 0.471,
          y: 0.246,
          width: 0.088,
          height: 0.138
        },
        changeCoordinates: {
          xPercent: 47.1,
          yPercent: 24.6,
          radiusPercent: 7
        }
      },
      aiObservation: 'Comparison of the review image with the reference image shows resolving discoloration with a softer yellowish-tan appearance on the right lower leg.',
      deltaRegion: {
        x: 0.471,
        y: 0.246,
        width: 0.088,
        height: 0.138
      },
      changeCoordinates: {
        xPercent: 47.1,
        yPercent: 24.6,
        radiusPercent: 7
      }
    }
  },

  {
    id: 'scenario-if460-01',
    title: 'IF460 — Foot (Mild localized erythema/redness on lateral dorsum)',
    patientRecordId: 'IF460',
    bodyRegion: 'Foot',
    refSourceId: 'REF-011',
    reviewDescription: 'Mild localized erythema/redness on the lateral dorsum',
    imageType: 'abnormal finding',
    isNew: true,
    description: 'Comparison of the review image with the reference image shows mild localized erythema/redness on the lateral dorsum of the foot.',
    referenceDate: '2026-09-11 14:00',
    newImageDate: '2026-09-21 11:20',
    referenceImage: BODY_CHECK_IMAGE_ASSETS.if460.reference,
    newImage: BODY_CHECK_IMAGE_ASSETS.if460.review01,
    expectedResult: {
      referenceImageId: 'IF460',
      referenceDate: '2026-09-11 14:00',
      newImageId: 'IF460-REV-01',
      newImageDate: '2026-09-21 11:20',
      bodyRegion: 'Foot',
      changeType: 'Localized erythema / skin appearance change',
      finding: 'Mild localized erythema/redness on the lateral dorsum',
      confidence: 'Moderate',
      confidenceScore: 0.82,
      candidateFinding: {
        bodyRegion: 'Foot',
        changeType: 'Localized erythema / skin appearance change',
        finding: 'Mild localized erythema/redness on the lateral dorsum',
        confidence: 'Moderate',
        confidenceScore: 0.82,
        deltaRegion: {
          x: 0.510,
          y: 0.431,
          width: 0.248,
          height: 0.276
        },
        changeCoordinates: {
          xPercent: 51.0,
          yPercent: 43.1,
          radiusPercent: 14
        }
      },
      aiObservation: 'Comparison of the review image with the reference image shows mild localized erythema/redness on the lateral dorsum of the foot.',
      deltaRegion: {
        x: 0.510,
        y: 0.431,
        width: 0.248,
        height: 0.276
      },
      changeCoordinates: {
        xPercent: 51.0,
        yPercent: 43.1,
        radiusPercent: 14
      }
    }
  },

  {
    id: 'scenario-if460-02',
    title: 'IF460 — Foot (Mild localized swelling/skin-color change without open wound)',
    patientRecordId: 'IF460',
    bodyRegion: 'Foot',
    refSourceId: 'REF-011',
    reviewDescription: 'Mild localized swelling/skin-color change without an open wound',
    imageType: 'abnormal finding',
    isNew: true,
    description: 'Comparison of the review image with the reference image shows mild localized swelling and skin-color change without an open wound on the dorsal foot.',
    referenceDate: '2026-09-11 14:00',
    newImageDate: '2026-09-21 11:25',
    referenceImage: BODY_CHECK_IMAGE_ASSETS.if460.reference,
    newImage: BODY_CHECK_IMAGE_ASSETS.if460.review02,
    expectedResult: {
      referenceImageId: 'IF460',
      referenceDate: '2026-09-11 14:00',
      newImageId: 'IF460-REV-02',
      newImageDate: '2026-09-21 11:25',
      bodyRegion: 'Foot',
      changeType: 'Localized swelling/contour change',
      finding: 'Mild localized swelling/skin-color change without an open wound',
      confidence: 'Moderate',
      confidenceScore: 0.8,
      candidateFinding: {
        bodyRegion: 'Foot',
        changeType: 'Localized swelling/contour change',
        finding: 'Mild localized swelling/skin-color change without an open wound',
        confidence: 'Moderate',
        confidenceScore: 0.8,
        deltaRegion: {
          x: 0.510,
          y: 0.431,
          width: 0.248,
          height: 0.276
        },
        changeCoordinates: {
          xPercent: 51.0,
          yPercent: 43.1,
          radiusPercent: 14
        }
      },
      aiObservation: 'Comparison of the review image with the reference image shows mild localized swelling and skin-color change without an open wound on the dorsal foot.',
      deltaRegion: {
        x: 0.510,
        y: 0.431,
        width: 0.248,
        height: 0.276
      },
      changeCoordinates: {
        xPercent: 51.0,
        yPercent: 43.1,
        radiusPercent: 14
      }
    }
  },

  {
    id: 'scenario-if460-03',
    title: 'IF460 — Foot (Normal / unchanged)',
    patientRecordId: 'IF460',
    bodyRegion: 'Foot',
    refSourceId: 'REF-011',
    reviewDescription: 'Normal/no significant visible change',
    imageType: 'normal / unchanged',
    isNew: false,
    description: 'No significant visible change identified between the reference and review images in the assessed foot region.',
    referenceDate: '2026-09-11 14:00',
    newImageDate: '2026-09-21 11:35',
    referenceImage: BODY_CHECK_IMAGE_ASSETS.if460.reference,
    newImage: BODY_CHECK_IMAGE_ASSETS.if460.review03,
    expectedResult: {
      referenceImageId: 'IF460',
      referenceDate: '2026-09-11 14:00',
      newImageId: 'IF460-REV-03',
      newImageDate: '2026-09-21 11:35',
      bodyRegion: 'Foot',
      changeType: 'No significant visible change',
      finding: 'Normal/no significant visible change',
      confidence: 'High',
      confidenceScore: 0.95,
      candidateFinding: {
        bodyRegion: 'Foot',
        changeType: 'No significant visible change',
        finding: 'Normal/no significant visible change',
        confidence: 'High',
        confidenceScore: 0.95
      },
      aiObservation: 'No significant visible change identified between the reference and review images in the assessed foot region.'
    }
  },

  {
    id: 'scenario-if461-01',
    title: 'IF461 — Foot (Normal / unchanged)',
    patientRecordId: 'IF461',
    bodyRegion: 'Foot',
    refSourceId: 'REF-012',
    reviewDescription: 'Normal/no significant visible change',
    imageType: 'normal / unchanged',
    isNew: false,
    description: 'No significant visible change identified between the reference and review images in the assessed foot region.',
    referenceDate: '2026-09-13 10:30',
    newImageDate: '2026-09-21 15:45',
    referenceImage: BODY_CHECK_IMAGE_ASSETS.if461.reference,
    newImage: BODY_CHECK_IMAGE_ASSETS.if461.review01,
    expectedResult: {
      referenceImageId: 'IF461',
      referenceDate: '2026-09-13 10:30',
      newImageId: 'IF461-REV-01',
      newImageDate: '2026-09-21 15:45',
      bodyRegion: 'Foot',
      changeType: 'No significant visible change',
      finding: 'Normal/no significant visible change',
      confidence: 'High',
      confidenceScore: 0.96,
      candidateFinding: {
        bodyRegion: 'Foot',
        changeType: 'No significant visible change',
        finding: 'Normal/no significant visible change',
        confidence: 'High',
        confidenceScore: 0.96
      },
      aiObservation: 'No significant visible change identified between the reference and review images in the assessed foot region.'
    }
  },

  {
    id: 'scenario-if462-01',
    title: 'IF462 — Upper Arm (Subtle localized skin-color variation on lateral upper arm)',
    patientRecordId: 'IF462',
    bodyRegion: 'Upper Arm',
    refSourceId: 'REF-001',
    reviewDescription: 'Subtle localized skin-color variation on the lateral upper arm',
    imageType: 'abnormal finding',
    isNew: true,
    description: 'Comparison of the review image with the reference image shows subtle localized skin-color variation on the upper arm / lateral brachium.',
    referenceDate: '2026-09-09 09:15',
    newImageDate: '2026-09-21 13:30',
    referenceImage: BODY_CHECK_IMAGE_ASSETS.if462.reference,
    newImage: BODY_CHECK_IMAGE_ASSETS.if462.review01,
    expectedResult: {
      referenceImageId: 'IF462',
      referenceDate: '2026-09-09 09:15',
      newImageId: 'IF462-REV-01',
      newImageDate: '2026-09-21 13:30',
      bodyRegion: 'Upper Arm',
      changeType: 'Localized skin-color variation',
      finding: 'Subtle localized skin-color variation on the lateral upper arm',
      confidence: 'Moderate',
      confidenceScore: 0.79,
      candidateFinding: {
        bodyRegion: 'Upper Arm',
        changeType: 'Localized skin-color variation',
        finding: 'Subtle localized skin-color variation on the lateral upper arm',
        confidence: 'Moderate',
        confidenceScore: 0.79,
        deltaRegion: {
          x: 0.500,
          y: 0.531,
          width: 0.181,
          height: 0.222
        },
        changeCoordinates: {
          xPercent: 50.0,
          yPercent: 53.1,
          radiusPercent: 11
        }
      },
      aiObservation: 'Comparison of the review image with the reference image shows subtle localized skin-color variation on the upper arm / lateral brachium.',
      deltaRegion: {
        x: 0.500,
        y: 0.531,
        width: 0.181,
        height: 0.222
      },
      changeCoordinates: {
        xPercent: 50.0,
        yPercent: 53.1,
        radiusPercent: 11
      }
    }
  },

  {
    id: 'scenario-if462-02',
    title: 'IF462 — Upper Arm (Mild localized reddish/purple discoloration)',
    patientRecordId: 'IF462',
    bodyRegion: 'Upper Arm',
    refSourceId: 'REF-001',
    reviewDescription: 'Mild localized reddish/purple discoloration',
    imageType: 'abnormal finding',
    isNew: true,
    description: 'Comparison of the review image with the reference image shows mild localized reddish/purple discoloration on the upper arm.',
    referenceDate: '2026-09-09 09:15',
    newImageDate: '2026-09-21 13:35',
    referenceImage: BODY_CHECK_IMAGE_ASSETS.if462.reference,
    newImage: BODY_CHECK_IMAGE_ASSETS.if462.review02,
    expectedResult: {
      referenceImageId: 'IF462',
      referenceDate: '2026-09-09 09:15',
      newImageId: 'IF462-REV-02',
      newImageDate: '2026-09-21 13:35',
      bodyRegion: 'Upper Arm',
      changeType: 'Visible color change / contusion-like discoloration',
      finding: 'Mild localized reddish/purple discoloration',
      confidence: 'Moderate',
      confidenceScore: 0.83,
      candidateFinding: {
        bodyRegion: 'Upper Arm',
        changeType: 'Visible color change / contusion-like discoloration',
        finding: 'Mild localized reddish/purple discoloration',
        confidence: 'Moderate',
        confidenceScore: 0.83,
        deltaRegion: {
          x: 0.500,
          y: 0.531,
          width: 0.181,
          height: 0.222
        },
        changeCoordinates: {
          xPercent: 50.0,
          yPercent: 53.1,
          radiusPercent: 11
        }
      },
      aiObservation: 'Comparison of the review image with the reference image shows mild localized reddish/purple discoloration on the upper arm.',
      deltaRegion: {
        x: 0.500,
        y: 0.531,
        width: 0.181,
        height: 0.222
      },
      changeCoordinates: {
        xPercent: 50.0,
        yPercent: 53.1,
        radiusPercent: 11
      }
    }
  },

  {
    id: 'scenario-if463-01',
    title: 'IF463 — Lower Leg (Resolving yellowish-tan discoloration on anterior tibial shin)',
    patientRecordId: 'IF463',
    bodyRegion: 'Lower Leg',
    refSourceId: 'REF-010',
    reviewDescription: 'Resolving yellowish-tan discoloration on the anterior tibial shin',
    imageType: 'abnormal finding',
    isNew: true,
    description: 'Comparison of the review image with the reference image shows subtle resolving yellowish-tan discoloration on the anterior tibial shin.',
    referenceDate: '2026-09-15 11:45',
    newImageDate: '2026-09-21 16:15',
    referenceImage: BODY_CHECK_IMAGE_ASSETS.if463.reference,
    newImage: BODY_CHECK_IMAGE_ASSETS.if463.review01,
    expectedResult: {
      referenceImageId: 'IF463',
      referenceDate: '2026-09-15 11:45',
      newImageId: 'IF463-REV-01',
      newImageDate: '2026-09-21 16:15',
      bodyRegion: 'Lower Leg',
      changeType: 'Localized skin-color variation',
      finding: 'Resolving yellowish-tan discoloration on the anterior tibial shin',
      confidence: 'Moderate',
      confidenceScore: 0.75,
      candidateFinding: {
        bodyRegion: 'Lower Leg',
        changeType: 'Localized skin-color variation',
        finding: 'Resolving yellowish-tan discoloration on the anterior tibial shin',
        confidence: 'Moderate',
        confidenceScore: 0.75,
        deltaRegion: {
          x: 0.488,
          y: 0.445,
          width: 0.123,
          height: 0.190
        },
        changeCoordinates: {
          xPercent: 48.8,
          yPercent: 44.5,
          radiusPercent: 10
        }
      },
      aiObservation: 'Comparison of the review image with the reference image shows subtle resolving yellowish-tan discoloration on the anterior tibial shin.',
      deltaRegion: {
        x: 0.488,
        y: 0.445,
        width: 0.123,
        height: 0.190
      },
      changeCoordinates: {
        xPercent: 48.8,
        yPercent: 44.5,
        radiusPercent: 10
      }
    }
  },

  {
    id: 'scenario-if463-02',
    title: 'IF463 — Lower Leg (More subtle/resolved discoloration with minimal visible residual change)',
    patientRecordId: 'IF463',
    bodyRegion: 'Lower Leg',
    refSourceId: 'REF-010',
    reviewDescription: 'More subtle/resolved discoloration with minimal visible residual change',
    imageType: 'abnormal finding',
    isNew: true,
    description: 'Comparison of the review image with the reference image shows more subtle/resolved discoloration with minimal visible residual change on the lower leg.',
    referenceDate: '2026-09-15 11:45',
    newImageDate: '2026-09-21 16:25',
    referenceImage: BODY_CHECK_IMAGE_ASSETS.if463.reference,
    newImage: BODY_CHECK_IMAGE_ASSETS.if463.review02,
    expectedResult: {
      referenceImageId: 'IF463',
      referenceDate: '2026-09-15 11:45',
      newImageId: 'IF463-REV-02',
      newImageDate: '2026-09-21 16:25',
      bodyRegion: 'Lower Leg',
      changeType: 'Localized skin-color variation',
      finding: 'More subtle/resolved discoloration with minimal visible residual change',
      confidence: 'Moderate',
      confidenceScore: 0.72,
      candidateFinding: {
        bodyRegion: 'Lower Leg',
        changeType: 'Localized skin-color variation',
        finding: 'More subtle/resolved discoloration with minimal visible residual change',
        confidence: 'Moderate',
        confidenceScore: 0.72,
        deltaRegion: {
          x: 0.488,
          y: 0.445,
          width: 0.123,
          height: 0.190
        },
        changeCoordinates: {
          xPercent: 48.8,
          yPercent: 44.5,
          radiusPercent: 10
        }
      },
      aiObservation: 'Comparison of the review image with the reference image shows more subtle/resolved discoloration with minimal visible residual change on the lower leg.',
      deltaRegion: {
        x: 0.488,
        y: 0.445,
        width: 0.123,
        height: 0.190
      },
      changeCoordinates: {
        xPercent: 48.8,
        yPercent: 44.5,
        radiusPercent: 10
      }
    }
  }
];

// Monitored records for selector
export const MOCK_PATIENTS: PatientRecord[] = [
  {
    id: 'IF456',
    name: 'Record IF-456',
    unit: 'Residential Unit B (Care & Wellbeing)',
    dateOfBirth: '2009-04-12',
    primaryCaregiver: 'Case Officer Miller',
    lastCheckDate: '2026-09-14 09:30',
    activeStatus: 'active',
    defaultRegion: 'Left Shoulder',
    availableBodyRegions: ['Left Shoulder'],
    referenceImage: BODY_CHECK_IMAGE_ASSETS.if456.reference,
    reviewImage: BODY_CHECK_IMAGE_ASSETS.if456.review
  },
  {
    id: 'IF455',
    name: 'Record IF-455',
    unit: 'Residential Unit A (Assessment)',
    dateOfBirth: '2010-08-25',
    primaryCaregiver: 'Sarah Mitchell, Reviewer',
    lastCheckDate: '2026-09-10 11:00',
    activeStatus: 'active',
    defaultRegion: 'Right Forearm',
    availableBodyRegions: ['Right Forearm'],
    referenceImage: BODY_CHECK_IMAGE_ASSETS.if455.reference,
    reviewImage: BODY_CHECK_IMAGE_ASSETS.if455.review
  },
  {
    id: 'IF452',
    name: 'Record IF-452',
    unit: 'Community Care Placement Unit',
    dateOfBirth: '2008-11-03',
    primaryCaregiver: 'Case Worker D. Chen',
    lastCheckDate: '2026-09-08 16:20',
    activeStatus: 'active',
    defaultRegion: 'Back',
    availableBodyRegions: ['Back'],
    referenceImage: BODY_CHECK_IMAGE_ASSETS.if452.reference,
    reviewImage: BODY_CHECK_IMAGE_ASSETS.if452.review
  },
  {
    id: 'IF439',
    name: 'Record IF-439',
    unit: 'Care Support Wing',
    dateOfBirth: '2009-01-19',
    primaryCaregiver: 'Care Worker T. Harris',
    lastCheckDate: '2026-09-12 13:10',
    activeStatus: 'active',
    defaultRegion: 'Right Lower Leg',
    availableBodyRegions: ['Right Lower Leg'],
    referenceImage: BODY_CHECK_IMAGE_ASSETS.if439.reference,
    reviewImage: BODY_CHECK_IMAGE_ASSETS.if439.review
  },
  {
    id: 'IF460',
    name: 'Record IF-460',
    unit: 'Residential Unit C (Health & Safety)',
    dateOfBirth: '2009-06-14',
    primaryCaregiver: 'Sarah Mitchell, Reviewer',
    lastCheckDate: '2026-09-11 14:00',
    activeStatus: 'active',
    defaultRegion: 'Foot',
    availableBodyRegions: ['Foot'],
    referenceImage: BODY_CHECK_IMAGE_ASSETS.if460.reference,
    reviewImage: BODY_CHECK_IMAGE_ASSETS.if460.review
  },
  {
    id: 'IF461',
    name: 'Record IF-461',
    unit: 'Residential Unit C (Health & Safety)',
    dateOfBirth: '2009-07-14',
    primaryCaregiver: 'Sarah Mitchell, Reviewer',
    lastCheckDate: '2026-09-13 10:30',
    activeStatus: 'active',
    defaultRegion: 'Foot',
    availableBodyRegions: ['Foot'],
    referenceImage: BODY_CHECK_IMAGE_ASSETS.if461.reference,
    reviewImage: BODY_CHECK_IMAGE_ASSETS.if461.review
  },
  {
    id: 'IF462',
    name: 'Record IF-462',
    unit: 'Transitional Care Unit 2',
    dateOfBirth: '2010-02-18',
    primaryCaregiver: 'Senior Practitioner O. Bailey',
    lastCheckDate: '2026-09-09 09:15',
    activeStatus: 'active',
    defaultRegion: 'Upper Arm',
    availableBodyRegions: ['Upper Arm'],
    referenceImage: BODY_CHECK_IMAGE_ASSETS.if462.reference,
    reviewImage: BODY_CHECK_IMAGE_ASSETS.if462.review
  },
  {
    id: 'IF463',
    name: 'Record IF-463',
    unit: 'Residential Unit A (Intake Assessment)',
    dateOfBirth: '2008-09-05',
    primaryCaregiver: 'Case Worker J. Patel',
    lastCheckDate: '2026-09-15 11:45',
    activeStatus: 'active',
    defaultRegion: 'Lower Leg',
    availableBodyRegions: ['Lower Leg'],
    referenceImage: BODY_CHECK_IMAGE_ASSETS.if463.reference,
    reviewImage: BODY_CHECK_IMAGE_ASSETS.if463.review
  },
  {
    id: 'IF500',
    name: 'Record IF-500',
    unit: 'Multi-Region Care Unit',
    dateOfBirth: '2009-05-18',
    primaryCaregiver: 'Sarah Mitchell, Reviewer',
    lastCheckDate: '2026-09-16 10:00',
    activeStatus: 'active',
    defaultRegion: 'Left Shoulder',
    availableBodyRegions: ['Left Shoulder', 'Right Forearm', 'Upper Back'],
    referenceImage: BODY_CHECK_IMAGE_ASSETS.if456.reference,
    reviewImage: BODY_CHECK_IMAGE_ASSETS.if456.review
  }
];

// Seeded Initial Checks representing active operational states across the workflow
export const INITIAL_BODY_CHECKS: BodyCheckRecord[] = [
  // 1. Confirmed Completed Scan: IF455 (Right Forearm)
  {
    id: 'BC-2026-0889',
    patientRecordId: 'IF455',
    patientName: 'Record IF-455',
    referenceImage: BODY_CHECK_IMAGE_ASSETS.if455.reference,
    referenceImageId: 'IF455',
    referenceDate: '2026-09-10 11:00',
    newImage: BODY_CHECK_IMAGE_ASSETS.if455.review01,
    newImageId: 'IF455-REV-01',
    newImageDate: '2026-09-21 16:45',
    bodyRegion: 'Right Forearm',
    changeType: 'Visible color change / contusion-like discoloration',
    finding: 'Reddish-purple localized bruising over the mid-shaft volar forearm',
    confidence: 'High',
    confidenceScore: 0.89,
    candidateFinding: {
      bodyRegion: 'Right Forearm',
      changeType: 'Visible color change / contusion-like discoloration',
      finding: 'Reddish-purple localized bruising over the mid-shaft volar forearm',
      confidence: 'High',
      confidenceScore: 0.89,
      deltaRegion: {
        x: 0.424,
        y: 0.479,
        width: 0.180,
        height: 0.170
      },
      changeCoordinates: {
        xPercent: 42.4,
        yPercent: 47.9,
        radiusPercent: 9
      }
    },
    aiObservation: 'Comparison of the review image with the reference image shows reddish-purple localized bruising over the mid-shaft volar forearm.',
    finalObservation: 'Confirmed localized bruising over mid-shaft volar forearm. Skin intact with no open abrasion. Cleansed and scheduled for morning reassessment.',
    status: 'confirmed',
    reviewer: 'Sarah Mitchell',
    reviewerRole: 'Reviewer',
    confirmedAt: '2026-09-21 16:55',
    updatedAt: '2026-09-21 16:55',
    reviewerNotes: 'Surface cleansed. Routine reassessment scheduled for morning rounds.',
    deltaRegion: {
      x: 0.424,
      y: 0.479,
      width: 0.180,
      height: 0.170
    },
    changeCoordinates: {
      xPercent: 42.4,
      yPercent: 47.9,
      radiusPercent: 9
    },
    auditTrail: [
      {
        id: 'aud-889-4',
        timestamp: '2026-09-21 16:55',
        actor: 'Sarah Mitchell',
        actorRole: 'Reviewer',
        action: 'Observation confirmed',
        details: 'Observation confirmed with note: "Surface cleansed. Routine reassessment scheduled for morning rounds."'
      },
      {
        id: 'aud-889-3',
        timestamp: '2026-09-21 16:48',
        actor: 'System',
        actorRole: 'Comparative Analysis',
        action: 'Comparative analysis completed',
        details: 'Candidate finding identified: Reddish-purple localized bruising over the mid-shaft volar forearm (High confidence).'
      },
      {
        id: 'aud-889-2',
        timestamp: '2026-09-21 16:45',
        actor: 'Sarah Mitchell',
        actorRole: 'Reviewer',
        action: 'Review check initiated',
        details: 'New review image IF455-REV-01 registered for Right Forearm.'
      },
      {
        id: 'aud-889-1',
        timestamp: '2026-09-10 11:00',
        actor: 'System',
        actorRole: 'Baseline Intake',
        action: 'Baseline image registered',
        details: 'Reference image IF455 established for Right Forearm.'
      }
    ]
  },

  // 2. Ready for Review (AI Draft Ready): IF460 (Foot)
  {
    id: 'BC-2026-0847',
    patientRecordId: 'IF460',
    patientName: 'Record IF-460',
    referenceImage: BODY_CHECK_IMAGE_ASSETS.if460.reference,
    referenceImageId: 'IF460',
    referenceDate: '2026-09-11 14:00',
    newImage: BODY_CHECK_IMAGE_ASSETS.if460.review01,
    newImageId: 'IF460-REV-01',
    newImageDate: '2026-09-21 15:30',
    bodyRegion: 'Foot',
    changeType: 'Localized erythema / skin appearance change',
    finding: 'Mild localized erythema/redness on the lateral dorsum',
    confidence: 'Moderate',
    confidenceScore: 0.82,
    candidateFinding: {
      bodyRegion: 'Foot',
      changeType: 'Localized erythema / skin appearance change',
      finding: 'Mild localized erythema/redness on the lateral dorsum',
      confidence: 'Moderate',
      confidenceScore: 0.82,
      deltaRegion: {
        x: 0.510,
        y: 0.431,
        width: 0.248,
        height: 0.276
      },
      changeCoordinates: {
        xPercent: 51.0,
        yPercent: 43.1,
        radiusPercent: 14
      }
    },
    aiObservation: 'Comparison of the review image with the reference image shows a localized area of superficial redness on the lateral dorsal foot.',
    finalObservation: '',
    status: 'ready_for_review',
    updatedAt: '2026-09-21 15:35',
    deltaRegion: {
      x: 0.510,
      y: 0.431,
      width: 0.248,
      height: 0.276
    },
    changeCoordinates: {
      xPercent: 51.0,
      yPercent: 43.1,
      radiusPercent: 14
    },
    auditTrail: [
      {
        id: 'aud-847-3',
        timestamp: '2026-09-21 15:35',
        actor: 'System',
        actorRole: 'Comparative Analysis',
        action: 'Comparative analysis completed',
        details: 'Candidate finding identified: Mild localized erythema/redness on the lateral dorsum (Moderate confidence). AI draft generated.'
      },
      {
        id: 'aud-847-2',
        timestamp: '2026-09-21 15:30',
        actor: 'Sarah Mitchell',
        actorRole: 'Reviewer',
        action: 'Review check initiated',
        details: 'New review image IF460-REV-01 registered for Foot.'
      },
      {
        id: 'aud-847-1',
        timestamp: '2026-09-11 14:00',
        actor: 'System',
        actorRole: 'Baseline Intake',
        action: 'Baseline image registered',
        details: 'Reference image IF460 established for Foot.'
      }
    ]
  },

  // 3. Pending Human Review / Ready for Review: IF462 (Upper Arm)
  {
    id: 'BC-2026-0898',
    patientRecordId: 'IF462',
    patientName: 'Record IF-462',
    referenceImage: BODY_CHECK_IMAGE_ASSETS.if462.reference,
    referenceImageId: 'IF462',
    referenceDate: '2026-09-09 09:15',
    newImage: BODY_CHECK_IMAGE_ASSETS.if462.review01,
    newImageId: 'IF462-REV-01',
    newImageDate: '2026-09-21 14:15',
    bodyRegion: 'Upper Arm',
    changeType: 'Superficial skin-surface change',
    finding: 'Subtle localized skin-color variation on the lateral upper arm',
    confidence: 'Moderate',
    confidenceScore: 0.79,
    candidateFinding: {
      bodyRegion: 'Upper Arm',
      changeType: 'Superficial skin-surface change',
      finding: 'Subtle localized skin-color variation on the lateral upper arm',
      confidence: 'Moderate',
      confidenceScore: 0.79,
      deltaRegion: {
        x: 0.500,
        y: 0.531,
        width: 0.181,
        height: 0.222
      },
      changeCoordinates: {
        xPercent: 50.0,
        yPercent: 53.1,
        radiusPercent: 11
      }
    },
    aiObservation: 'Comparison of the review image with the reference image shows subtle localized skin-color variation on the lateral upper arm.',
    finalObservation: '',
    status: 'ready_for_review',
    updatedAt: '2026-09-21 14:20',
    deltaRegion: {
      x: 0.500,
      y: 0.531,
      width: 0.181,
      height: 0.222
    },
    changeCoordinates: {
      xPercent: 50.0,
      yPercent: 53.1,
      radiusPercent: 11
    },
    auditTrail: [
      {
        id: 'aud-898-3',
        timestamp: '2026-09-21 14:20',
        actor: 'System',
        actorRole: 'Comparative Analysis',
        action: 'Comparative analysis completed',
        details: 'Candidate finding identified: Subtle localized skin-color variation on the lateral upper arm (Moderate confidence). AI draft generated.'
      },
      {
        id: 'aud-898-2',
        timestamp: '2026-09-21 14:15',
        actor: 'Senior Practitioner O. Bailey',
        actorRole: 'Reviewer',
        action: 'Review check initiated',
        details: 'New review image IF462-REV-01 registered for Upper Arm.'
      },
      {
        id: 'aud-898-1',
        timestamp: '2026-09-09 09:15',
        actor: 'System',
        actorRole: 'Baseline Intake',
        action: 'Baseline image registered',
        details: 'Reference image IF462 established for Upper Arm.'
      }
    ]
  },

  // 4. Not Analyzed (Baseline only, No Review Image Selected): IF456 (Left Shoulder)
  {
    id: 'BC-2026-0895',
    patientRecordId: 'IF456',
    patientName: 'Record IF-456',
    referenceImage: BODY_CHECK_IMAGE_ASSETS.if456.reference,
    referenceImageId: 'IF456',
    referenceDate: '2026-09-14 09:30',
    newImage: '',
    newImageId: '',
    newImageDate: '',
    bodyRegion: 'Left Shoulder',
    finding: '',
    aiObservation: '',
    finalObservation: '',
    status: 'not_analyzed',
    updatedAt: '2026-09-14 09:30',
    auditTrail: [
      {
        id: 'aud-895-1',
        timestamp: '2026-09-14 09:30',
        actor: 'System',
        actorRole: 'Baseline Intake',
        action: 'Baseline image registered',
        details: 'Reference image IF456 established for Left Shoulder.'
      }
    ]
  },

  // 5. Ready to Analyze (Image Selected, Analysis Pending): IF452 (Back)
  {
    id: 'BC-2026-0872',
    patientRecordId: 'IF452',
    patientName: 'Record IF-452',
    referenceImage: BODY_CHECK_IMAGE_ASSETS.if452.reference,
    referenceImageId: 'IF452',
    referenceDate: '2026-09-08 16:20',
    newImage: BODY_CHECK_IMAGE_ASSETS.if452.review01,
    newImageId: 'IF452-REV-01',
    newImageDate: '2026-09-21 11:50',
    bodyRegion: 'Back',
    finding: '',
    aiObservation: '',
    finalObservation: '',
    status: 'ready_to_analyze',
    updatedAt: '2026-09-21 11:50',
    auditTrail: [
      {
        id: 'aud-872-2',
        timestamp: '2026-09-21 11:50',
        actor: 'Case Worker D. Chen',
        actorRole: 'Reviewer',
        action: 'Review photograph selected',
        details: 'Review photograph IF452-REV-01 selected and registered for Back. Ready for comparative analysis.'
      },
      {
        id: 'aud-872-1',
        timestamp: '2026-09-08 16:20',
        actor: 'System',
        actorRole: 'Baseline Intake',
        action: 'Baseline image registered',
        details: 'Reference image IF452 established for Back.'
      }
    ]
  },

  // 6. Not Analyzed (Baseline only, No Review Image Selected): IF461 (Foot)
  {
    id: 'BC-2026-0851',
    patientRecordId: 'IF461',
    patientName: 'Record IF-461',
    referenceImage: BODY_CHECK_IMAGE_ASSETS.if461.reference,
    referenceImageId: 'IF461',
    referenceDate: '2026-09-13 10:30',
    newImage: '',
    newImageId: '',
    newImageDate: '',
    bodyRegion: 'Foot',
    finding: '',
    aiObservation: '',
    finalObservation: '',
    status: 'not_analyzed',
    updatedAt: '2026-09-13 10:30',
    auditTrail: [
      {
        id: 'aud-851-1',
        timestamp: '2026-09-13 10:30',
        actor: 'System',
        actorRole: 'Baseline Intake',
        action: 'Baseline image registered',
        details: 'Reference image IF461 established for Foot.'
      }
    ]
  }
];

export interface GalleryImageAsset {
  id: string;
  recordId: string;
  bodyRegion: BodyRegion;
  refSourceId: string;
  imageUrl: string;
  fileName: string;
  captureDate: string;
  description: string;
  imageType: ImageType;
  isNew: boolean;
  scenarioIndex?: number;
  totalScenarios?: number;
}

export const GALLERY_REVIEW_ASSETS: GalleryImageAsset[] = [
  {
    id: 'IF456-REV-01',
    recordId: 'IF456',
    bodyRegion: 'Left Shoulder',
    refSourceId: 'REF-001',
    imageUrl: BODY_CHECK_IMAGE_ASSETS.if456.review01,
    fileName: 'review.webp',
    captureDate: '2026-09-21 14:15',
    description: 'Localized reddish/purple bruise/contusion over the shoulder/deltoid ridge',
    imageType: 'abnormal finding',
    isNew: true,
    scenarioIndex: 1,
    totalScenarios: 3
  },
  {
    id: 'IF456-REV-02',
    recordId: 'IF456',
    bodyRegion: 'Left Shoulder',
    refSourceId: 'REF-001',
    imageUrl: BODY_CHECK_IMAGE_ASSETS.if456.review02,
    fileName: 'review-02.webp',
    captureDate: '2026-09-21 14:20',
    description: 'Mild localized erythema/redness',
    imageType: 'abnormal finding',
    isNew: true,
    scenarioIndex: 2,
    totalScenarios: 3
  },
  {
    id: 'IF456-REV-03',
    recordId: 'IF456',
    bodyRegion: 'Left Shoulder',
    refSourceId: 'REF-001',
    imageUrl: BODY_CHECK_IMAGE_ASSETS.if456.review03,
    fileName: 'review-03.webp',
    captureDate: '2026-09-21 14:30',
    description: 'Normal/no significant visible change',
    imageType: 'normal / unchanged',
    isNew: false,
    scenarioIndex: 3,
    totalScenarios: 3
  },
  {
    id: 'IF455-REV-01',
    recordId: 'IF455',
    bodyRegion: 'Right Forearm',
    refSourceId: 'REF-005',
    imageUrl: BODY_CHECK_IMAGE_ASSETS.if455.review01,
    fileName: 'review.webp',
    captureDate: '2026-09-21 10:45',
    description: 'Reddish-purple localized bruising over the mid-shaft volar forearm',
    imageType: 'abnormal finding',
    isNew: true,
    scenarioIndex: 1,
    totalScenarios: 2
  },
  {
    id: 'IF455-REV-02',
    recordId: 'IF455',
    bodyRegion: 'Right Forearm',
    refSourceId: 'REF-005',
    imageUrl: BODY_CHECK_IMAGE_ASSETS.if455.review02,
    fileName: 'review-02.webp',
    captureDate: '2026-09-21 10:50',
    description: 'Resolving bruise with subtler yellowish/brown peripheral discoloration',
    imageType: 'abnormal finding',
    isNew: true,
    scenarioIndex: 2,
    totalScenarios: 2
  },
  {
    id: 'IF452-REV-01',
    recordId: 'IF452',
    bodyRegion: 'Back',
    refSourceId: 'REF-001',
    imageUrl: BODY_CHECK_IMAGE_ASSETS.if452.review01,
    fileName: 'review.webp',
    captureDate: '2026-09-21 15:00',
    description: 'Normal/no significant visible change',
    imageType: 'normal / unchanged',
    isNew: false,
    scenarioIndex: 1,
    totalScenarios: 1
  },
  {
    id: 'IF439-REV-01',
    recordId: 'IF439',
    bodyRegion: 'Right Lower Leg',
    refSourceId: 'REF-008',
    imageUrl: BODY_CHECK_IMAGE_ASSETS.if439.review01,
    fileName: 'review.webp',
    captureDate: '2026-09-20 16:30',
    description: 'Localized reddish/purple discoloration below the patella/proximal tibial region',
    imageType: 'abnormal finding',
    isNew: true,
    scenarioIndex: 1,
    totalScenarios: 2
  },
  {
    id: 'IF439-REV-02',
    recordId: 'IF439',
    bodyRegion: 'Right Lower Leg',
    refSourceId: 'REF-008',
    imageUrl: BODY_CHECK_IMAGE_ASSETS.if439.review02,
    fileName: 'review-02.webp',
    captureDate: '2026-09-20 16:40',
    description: 'Resolving discoloration with a softer yellowish-tan appearance',
    imageType: 'abnormal finding',
    isNew: true,
    scenarioIndex: 2,
    totalScenarios: 2
  },
  {
    id: 'IF460-REV-01',
    recordId: 'IF460',
    bodyRegion: 'Foot',
    refSourceId: 'REF-011',
    imageUrl: BODY_CHECK_IMAGE_ASSETS.if460.review01,
    fileName: 'review.webp',
    captureDate: '2026-09-21 11:20',
    description: 'Mild localized erythema/redness on the lateral dorsum',
    imageType: 'abnormal finding',
    isNew: true,
    scenarioIndex: 1,
    totalScenarios: 3
  },
  {
    id: 'IF460-REV-02',
    recordId: 'IF460',
    bodyRegion: 'Foot',
    refSourceId: 'REF-011',
    imageUrl: BODY_CHECK_IMAGE_ASSETS.if460.review02,
    fileName: 'review-02.webp',
    captureDate: '2026-09-21 11:25',
    description: 'Mild localized swelling/skin-color change without an open wound',
    imageType: 'abnormal finding',
    isNew: true,
    scenarioIndex: 2,
    totalScenarios: 3
  },
  {
    id: 'IF460-REV-03',
    recordId: 'IF460',
    bodyRegion: 'Foot',
    refSourceId: 'REF-011',
    imageUrl: BODY_CHECK_IMAGE_ASSETS.if460.review03,
    fileName: 'review-03.webp',
    captureDate: '2026-09-21 11:35',
    description: 'Normal/no significant visible change',
    imageType: 'normal / unchanged',
    isNew: false,
    scenarioIndex: 3,
    totalScenarios: 3
  },
  {
    id: 'IF461-REV-01',
    recordId: 'IF461',
    bodyRegion: 'Foot',
    refSourceId: 'REF-012',
    imageUrl: BODY_CHECK_IMAGE_ASSETS.if461.review01,
    fileName: 'review.webp',
    captureDate: '2026-09-21 15:45',
    description: 'Normal/no significant visible change',
    imageType: 'normal / unchanged',
    isNew: false,
    scenarioIndex: 1,
    totalScenarios: 1
  },
  {
    id: 'IF462-REV-01',
    recordId: 'IF462',
    bodyRegion: 'Upper Arm',
    refSourceId: 'REF-001',
    imageUrl: BODY_CHECK_IMAGE_ASSETS.if462.review01,
    fileName: 'review.webp',
    captureDate: '2026-09-21 13:30',
    description: 'Subtle localized skin-color variation on the lateral upper arm',
    imageType: 'abnormal finding',
    isNew: true,
    scenarioIndex: 1,
    totalScenarios: 2
  },
  {
    id: 'IF462-REV-02',
    recordId: 'IF462',
    bodyRegion: 'Upper Arm',
    refSourceId: 'REF-001',
    imageUrl: BODY_CHECK_IMAGE_ASSETS.if462.review02,
    fileName: 'review-02.webp',
    captureDate: '2026-09-21 13:35',
    description: 'Mild localized reddish/purple discoloration',
    imageType: 'abnormal finding',
    isNew: true,
    scenarioIndex: 2,
    totalScenarios: 2
  },
  {
    id: 'IF463-REV-01',
    recordId: 'IF463',
    bodyRegion: 'Lower Leg',
    refSourceId: 'REF-010',
    imageUrl: BODY_CHECK_IMAGE_ASSETS.if463.review01,
    fileName: 'review.webp',
    captureDate: '2026-09-21 16:15',
    description: 'Resolving yellowish-tan discoloration on the anterior tibial shin',
    imageType: 'abnormal finding',
    isNew: true,
    scenarioIndex: 1,
    totalScenarios: 2
  },
  {
    id: 'IF463-REV-02',
    recordId: 'IF463',
    bodyRegion: 'Lower Leg',
    refSourceId: 'REF-010',
    imageUrl: BODY_CHECK_IMAGE_ASSETS.if463.review02,
    fileName: 'review-02.webp',
    captureDate: '2026-09-21 16:25',
    description: 'More subtle/resolved discoloration with minimal visible residual change',
    imageType: 'abnormal finding',
    isNew: true,
    scenarioIndex: 2,
    totalScenarios: 2
  }
];
