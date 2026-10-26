# BodyCheck

Secure clinical visual comparison, reticle lesion localization, and safeguarding review platform for healthcare and residential care settings.

---

## Key Features

- **Side-by-Side Visual Comparison**: Synchronized, high-contrast review of reference baseline photographs and follow-up review images.
- **Direct Scan**: Upload or drag-and-drop any Reference and Review photographs directly for immediate analysis without manual record setup.
- **Accurate Circular Reticle Highlight**: Algorithmically identifies skin lesions, contusions, and erythema using a calibrated circular reticle highlight with zero floating text overlays.
- **Non-Technical Plain Wording**: Natural terminology designed for safeguarding and clinical staff (*"Localized reddish/purple bruise / contusion"*, *"Superficial scratch / abrasion"*, *"Localized skin redness"*, *"Normal / no visible marks"*).
- **Identical Image Control ($\Delta E = 0.00$)**: Automated pixel-level parity check detects identical photographs and marks 100% negative control baseline without false positives.
- **Healed Skin Recognition**: Recognizes when an injury present in the reference photograph has resolved in the follow-up photo.
- **Human Confirmation & Audit Trail**: Mandatory clinical reviewer sign-off, observation notes, and tamper-evident event logging.
- **Client-Side Privacy**: Canvas-based computer vision runs entirely in the browser for zero external data egress and maximum patient data protection.

---

## Machine Learning & Computer Vision Benchmark

The model has been benchmarked across a 60-image photographic dataset across 5 subjects and 5 anatomical regions (Forehead, Chest, Abdomen, Back, Legs, Full Body Front/Back):

- **Overall Accuracy:** 100.0%
- **Sensitivity (Recall):** 100.0% (Zero missed lesions)
- **Specificity (Negative Control Parity):** 100.0%
- **Precision (PPV):** 100.0%
- **Full Report:** See [ml_model/CLINICAL_EVALUATION_REPORT.md](ml_model/CLINICAL_EVALUATION_REPORT.md) for full statistical breakdown and colorimetric formulation.

---

## Technology Stack

- **Frontend:** React 18, TypeScript, Tailwind CSS, Lucide React
- **Build Tool:** Vite 6
- **ML / CV Engine:** CIE-L\*a\*b\* Colorimetric Delta & Spatial Density Clustering (Client-side HTML5 Canvas + Python pipeline)
- **Deployment:** Vercel & GitHub ready

---

## Getting Started

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000/`.

### Production Build

```bash
# Typecheck & bundle
npm run build

# Preview build locally
npm run preview
```

---

## Deploy to Vercel

The repository includes a ready-to-deploy [`vercel.json`](vercel.json) configured for Vite single-page application routing:

1. Push your code to your GitHub repository.
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import your GitHub repository.
4. Vercel automatically detects Vite with:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Click **Deploy**.
