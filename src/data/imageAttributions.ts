/**
 * Developer documentation & attribution record for open-source photographic assets.
 * All images are bundled locally in public/images/body-check/<RecordID>/ for offline reliability.
 * Sourced from Wikimedia Commons and open-source Creative Commons / Public Domain photography.
 * Subject representations are strictly anonymous, non-identifiable, non-graphic, and used for clinical workflow documentation.
 */

export interface ImageAssetAttribution {
  scenarioId: string;
  bodyRegion: string;
  referenceFile: string;
  reviewFile: string;
  sourceOrigin: string;
  sourceUrl?: string;
  license: string;
  attribution: string;
  notes: string;
}

export const DEMO_IMAGE_ATTRIBUTIONS: ImageAssetAttribution[] = [
  {
    scenarioId: 'IF456',
    bodyRegion: 'Left Shoulder',
    referenceFile: '/images/body-check/IF456/reference.webp',
    reviewFile: '/images/body-check/IF456/review.webp',
    sourceOrigin: 'Wikimedia Commons',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Male_back_body.jpg',
    license: 'Creative Commons Attribution-Share Alike 4.0 International (CC BY-SA 4.0)',
    attribution: 'Male back body / Robystarm07 / Wikimedia Commons',
    notes: 'Controlled derivative: Localized reddish-purple color variation (contusion-like discoloration) over the left shoulder/deltoid ridge.'
  },
  {
    scenarioId: 'IF455',
    bodyRegion: 'Right Forearm',
    referenceFile: '/images/body-check/IF455/reference.webp',
    reviewFile: '/images/body-check/IF455/review.webp',
    sourceOrigin: 'Wikimedia Commons',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Forearm2.jpg',
    license: 'Creative Commons Attribution-Share Alike 3.0 Unported / GFDL',
    attribution: 'Forearm2 / Ender-Wiggin / Wikimedia Commons',
    notes: 'Controlled derivative: Small localized superficial skin-surface change (epidermal scratch/abrasion) on mid-volar forearm.'
  },
  {
    scenarioId: 'IF452',
    bodyRegion: 'Back',
    referenceFile: '/images/body-check/IF452/reference.webp',
    reviewFile: '/images/body-check/IF452/review.webp',
    sourceOrigin: 'Wikimedia Commons',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Male_back_body.jpg',
    license: 'Creative Commons Attribution-Share Alike 4.0 International (CC BY-SA 4.0)',
    attribution: 'Male back body / Robystarm07 / Wikimedia Commons',
    notes: 'Negative control: 100% identical visual baseline showing unremarkable follow-up (no significant visible change).'
  },
  {
    scenarioId: 'IF439',
    bodyRegion: 'Right Lower Leg',
    referenceFile: '/images/body-check/IF439/reference.webp',
    reviewFile: '/images/body-check/IF439/review.webp',
    sourceOrigin: 'Wikimedia Commons',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Human_knees.jpg',
    license: 'Creative Commons Attribution-Share Alike 4.0 International (CC BY-SA 4.0)',
    attribution: 'Human knees / Tomas Gunnarsson / Wikimedia Sverige / Wikimedia Commons',
    notes: 'Controlled derivative: Localized surface contour displacement with mild associated color variation below patella.'
  },
  {
    scenarioId: 'IF460',
    bodyRegion: 'Foot',
    referenceFile: '/images/body-check/IF460/reference.webp',
    reviewFile: '/images/body-check/IF460/review.webp',
    sourceOrigin: 'Wikimedia Commons',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Human_male_foot.jpg',
    license: 'Creative Commons Attribution-Share Alike 4.0 International (CC BY-SA 4.0)',
    attribution: 'Human male foot / Shinjo2001 / Wikimedia Commons',
    notes: 'Controlled derivative: Localized superficial redness / erythema on the dorsal aspect of the foot.'
  },
  {
    scenarioId: 'IF461',
    bodyRegion: 'Foot',
    referenceFile: '/images/body-check/IF461/reference.webp',
    reviewFile: '/images/body-check/IF461/review.webp',
    sourceOrigin: 'Wikimedia Commons',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Barefeet.jpg',
    license: 'Creative Commons Attribution-Share Alike 4.0 International (CC BY-SA 4.0)',
    attribution: 'Barefeet / Alvinjiaodi / Wikimedia Commons',
    notes: 'Negative control: 100% identical visual baseline depicting bilateral plantar surfaces (no significant visible change).'
  },
  {
    scenarioId: 'IF462',
    bodyRegion: 'Upper Arm',
    referenceFile: '/images/body-check/IF462/reference.webp',
    reviewFile: '/images/body-check/IF462/review.webp',
    sourceOrigin: 'Wikimedia Commons',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Male_back_body.jpg',
    license: 'Creative Commons Attribution-Share Alike 4.0 International (CC BY-SA 4.0)',
    attribution: 'Male back body / Robystarm07 / Wikimedia Commons',
    notes: 'Controlled derivative: Small localized linear skin-surface change on the upper arm / lateral brachium.'
  },
  {
    scenarioId: 'IF463',
    bodyRegion: 'Lower Leg',
    referenceFile: '/images/body-check/IF463/reference.webp',
    reviewFile: '/images/body-check/IF463/review.webp',
    sourceOrigin: 'Wikimedia Commons',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Leg2.jpg',
    license: 'Creative Commons Attribution-Share Alike 3.0 Unported / GFDL',
    attribution: 'Leg2 / Ender-Wiggin / Wikimedia Commons',
    notes: 'Controlled derivative: Subtle localized residual change in skin coloration (resolving yellowish-tan discoloration) on anterior tibial shin.'
  }
];
